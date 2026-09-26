import os
import sys
from xml.parsers.expat import model
import joblib
import pandas as pd

from sklearn.cluster import KMeans
from sklearn.preprocessing import StandardScaler
from sklearn.metrics import silhouette_score
from datetime import datetime

# Permite importar o database.py que está dentro de app/
BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
sys.path.append(BASE_DIR)

from app.database import get_connection


# ============================================================
# CONFIGURAÇÕES
# ============================================================

MODEL_DIR = os.path.join(BASE_DIR, "models")

os.makedirs(MODEL_DIR, exist_ok=True)

MODEL_PATH = os.path.join(MODEL_DIR, "kmeans_model.joblib")
SCALER_PATH = os.path.join(MODEL_DIR, "kmeans_scaler.joblib")


# Quantidade de clusters que vamos testar
K_VALUES = range(2, 9)


# ============================================================
# 1. BUSCAR OS DADOS
# ============================================================

def load_vehicle_data():
    print("Conectando ao PostgreSQL...")

    connection = get_connection()

    try:
        query = """
            SELECT
                vin_hash,
                service_count,
                days_since_last_service,
                avg_days_between_services,
                service_interval_variability,
                unique_dealers,
                dealer_loyalty_ratio,
                schedule_rate,
                km_delta,
                avg_km_per_day,
                last_km,
                max_km
            FROM vehicles
            WHERE service_count IS NOT NULL
              AND days_since_last_service IS NOT NULL
              AND avg_days_between_services IS NOT NULL;
        """

        df = pd.read_sql(query, connection)

        print(f"Veículos carregados: {len(df)}")

        return df

    finally:
        connection.close()


# ============================================================
# 2. PREPARAR AS FEATURES
# ============================================================

def prepare_features(df):
    features = [
        "service_count",
        "days_since_last_service",
        "avg_days_between_services",
        "service_interval_variability",
        "unique_dealers",
        "dealer_loyalty_ratio",
        "schedule_rate",
        "km_delta",
        "avg_km_per_day",
        "last_km",
        "max_km",
    ]

    data = df[features].copy()

    # Substitui valores infinitos
    data = data.replace([float("inf"), float("-inf")], None)

    # Converte tudo para número
    for column in features:
        data[column] = pd.to_numeric(
            data[column],
            errors="coerce"
        )

    # Preenche valores ausentes com a mediana da coluna
    data = data.fillna(data.median())

    print("\nFeatures utilizadas:")
    for feature in features:
        print(f" - {feature}")

    print(f"\nQuantidade final de veículos: {len(data)}")

    return data, features


# ============================================================
# 3. NORMALIZAR OS DADOS
# ============================================================

def scale_features(data):
    print("\nNormalizando os dados...")

    scaler = StandardScaler()

    scaled_data = scaler.fit_transform(data)

    return scaled_data, scaler


# ============================================================
# 4. TESTAR DIFERENTES QUANTIDADES DE CLUSTERS
# ============================================================

def find_best_k(scaled_data):
    print("\nTestando quantidade de clusters...")

    results = []

    for k in K_VALUES:
        model = KMeans(
            n_clusters=k,
            random_state=42,
            n_init=10
        )

        labels = model.fit_predict(scaled_data)

        score = silhouette_score(
            scaled_data,
            labels
        )

        results.append({
            "k": k,
            "silhouette_score": score
        })

        print(
            f"K={k} → Silhouette Score: {score:.4f}"
        )

    results_df = pd.DataFrame(results)

    best_row = results_df.loc[
        results_df["silhouette_score"].idxmax()
    ]

    best_k = int(best_row["k"])

    print(
        f"\nMelhor quantidade de clusters: K={best_k}"
    )

    print(
        f"Melhor Silhouette Score: "
        f"{best_row['silhouette_score']:.4f}"
    )

    return best_k


# ============================================================
# 5. TREINAR O K-MEANS FINAL
# ============================================================

def train_final_model(scaled_data, best_k):
    print(
        f"\nTreinando modelo final com K={best_k}..."
    )

    model = KMeans(
        n_clusters=best_k,
        random_state=42,
        n_init=10
    )

    labels = model.fit_predict(scaled_data)

    return model, labels


# ============================================================
# 6. SALVAR MODELO E SCALER
# ============================================================

def save_models(model, scaler):
    joblib.dump(
        model,
        MODEL_PATH
    )

    joblib.dump(
        scaler,
        SCALER_PATH
    )

    print("\nModelos salvos com sucesso!")

    print(f"Modelo: {MODEL_PATH}")
    print(f"Scaler: {SCALER_PATH}")


def save_segments_to_database(df, scaled_data, model, labels):
    print("\nSalvando segmentos no PostgreSQL...")

    connection = get_connection()

    try:
        with connection.cursor() as cursor:

            model_version = datetime.now().strftime("%Y%m%d_%H%M%S")

            for i, row in df.iterrows():
                vin_hash = row["vin_hash"]
                segment_id = int(labels[i])

                centroid = model.cluster_centers_[segment_id]

                distance = float(
                    ((scaled_data[i] - centroid) ** 2).sum() ** 0.5
                )

                cursor.execute(
                    """
                    INSERT INTO vehicle_segments (
                        vin_hash,
                        segment_id,
                        segment_name,
                        distance_to_centroid,
                        model_version
                    )
                    VALUES (%s, %s, %s, %s, %s)
                    ON CONFLICT (vin_hash)
                    DO UPDATE SET
                        segment_id = EXCLUDED.segment_id,
                        segment_name = EXCLUDED.segment_name,
                        distance_to_centroid = EXCLUDED.distance_to_centroid,
                        model_version = EXCLUDED.model_version,
                        created_at = CURRENT_TIMESTAMP;
                    """,
                    (
                        vin_hash,
                        segment_id,
                        None,
                        distance,
                        model_version
                    )
                )

        connection.commit()

        print(
            f"Segmentos salvos com sucesso: {len(df)} veículos"
        )

    except Exception as error:
        connection.rollback()
        print(f"Erro ao salvar segmentos: {error}")
        raise

    finally:
        connection.close()



# ============================================================
# 7. MOSTRAR RESUMO DOS CLUSTERS
# ============================================================

def show_cluster_summary(df, labels):
    result = df.copy()

    result["cluster"] = labels

    print("\n==============================")
    print("RESUMO DOS CLUSTERS")
    print("==============================")

    summary = result.groupby("cluster").agg({
        "service_count": "mean",
        "days_since_last_service": "mean",
        "avg_days_between_services": "mean",
        "dealer_loyalty_ratio": "mean",
        "schedule_rate": "mean",
        "last_km": "mean"
    })

    print(summary.round(2))

    print("\nQuantidade de veículos por cluster:")

    counts = result["cluster"].value_counts().sort_index()

    print(counts)


# ============================================================
# EXECUÇÃO PRINCIPAL
# ============================================================

def main():

    print("==============================")
    print("TREINAMENTO K-MEANS")
    print("ConnectCare 360")
    print("==============================")

    # 1. Carregar dados
    df = load_vehicle_data()

    if df.empty:
        print("Nenhum veículo encontrado.")
        return

    # 2. Preparar features
    data, features = prepare_features(df)

    # 3. Normalizar
    scaled_data, scaler = scale_features(data)

    # 4. Encontrar melhor K
    best_k = find_best_k(scaled_data)

    # 5. Treinar modelo final
    model, labels = train_final_model(scaled_data, best_k)

    save_models(model, scaler)

    show_cluster_summary(df, labels)

    save_segments_to_database(
        df,
        scaled_data,
        model,
        labels
    )
    print("\n==============================")
    print("TREINAMENTO CONCLUÍDO!")
    print("==============================")


if __name__ == "__main__":
    main()