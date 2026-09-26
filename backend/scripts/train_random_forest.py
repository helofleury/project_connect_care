import os
import sys
from datetime import datetime

import joblib
import pandas as pd

from sklearn.ensemble import RandomForestClassifier
from sklearn.metrics import (
    accuracy_score,
    classification_report,
    confusion_matrix,
    f1_score,
    precision_score,
    recall_score,
    roc_auc_score,
)
from sklearn.model_selection import GroupShuffleSplit


# ============================================================
# CONFIGURAÇÃO
# ============================================================

BASE_DIR = os.path.dirname(
    os.path.dirname(os.path.abspath(__file__))
)

sys.path.append(BASE_DIR)

from app.database import get_connection


MODEL_DIR = os.path.join(BASE_DIR, "models")
os.makedirs(MODEL_DIR, exist_ok=True)

MODEL_PATH = os.path.join(
    MODEL_DIR,
    "random_forest_model.joblib"
)

FEATURES_PATH = os.path.join(
    MODEL_DIR,
    "random_forest_features.joblib"
)

MODEL_VERSION = datetime.now().strftime(
    "%Y%m%d_%H%M%S"
)

TEST_SIZE = 0.20
RANDOM_STATE = 42


# ============================================================
# FEATURES
# ============================================================

FEATURES = [
    "service_count_until_now",
    "unique_dealers_until_now",
    "schedule_rate_until_now",
    "avg_days_between_services_until_now",
    "service_interval_std_until_now",
    "days_since_previous_service",
    "km",
    "km_delta",
    "maintenance_number",
    "vehicle_age_days_at_service",
]


# ============================================================
# CARREGAR DADOS
# ============================================================

def load_service_history():

    print("\n==============================")
    print("CARREGANDO HISTÓRICO")
    print("==============================")

    connection = get_connection()

    try:

        query = """
            SELECT
                vin_hash,
                service_date,
                km,
                dealer_code,
                is_agenda_schedule,
                maintenance_number,
                vehicle_age_days_at_service,
                days_since_previous_service,
                km_delta
            FROM service_history
            WHERE vin_hash IS NOT NULL
              AND service_date IS NOT NULL
            ORDER BY vin_hash, service_date;
        """

        df = pd.read_sql_query(
            query,
            connection
        )

        print(
            f"Registros de manutenção carregados: {len(df)}"
        )

        return df

    finally:

        connection.close()


# ============================================================
# CRIAÇÃO DO DATASET SUPERVISIONADO
# ============================================================

def prepare_dataset(df):

    print("\n==============================")
    print("PREPARANDO DATASET")
    print("==============================")

    df = df.copy()

    df["service_date"] = pd.to_datetime(
        df["service_date"],
        errors="coerce"
    )

    df = df.dropna(
        subset=["vin_hash", "service_date"]
    )

    df = df.sort_values(
        ["vin_hash", "service_date"]
    )

    # --------------------------------------------------------
    # Próxima manutenção
    # --------------------------------------------------------

    df["next_service_date"] = (
        df.groupby("vin_hash")["service_date"]
        .shift(-1)
    )

    df["days_to_next_service"] = (
        df["next_service_date"]
        - df["service_date"]
    ).dt.days

    # --------------------------------------------------------
    # Apenas registros que possuem próxima manutenção
    # --------------------------------------------------------

    df = df[
        df["days_to_next_service"].notna()
    ].copy()

    # --------------------------------------------------------
    # TARGET
    #
    # 1 = próxima manutenção ocorreu em até 120 dias
    # 0 = demorou mais de 120 dias
    # --------------------------------------------------------

    df["target_next_service_120d"] = (
        df["days_to_next_service"] <= 120
    ).astype(int)

    # --------------------------------------------------------
    # Features acumuladas até o momento atual
    # --------------------------------------------------------

    df["service_count_until_now"] = (
        df.groupby("vin_hash")
        .cumcount()
        + 1
    )

    df["unique_dealers_until_now"] = (
        df.groupby("vin_hash")["dealer_code"]
        .transform(
            lambda x: x.expanding()
            .apply(
                lambda y: y.nunique(),
                raw=False
            )
        )
    )

    # --------------------------------------------------------
    # Agenda
    # --------------------------------------------------------

    df["is_agenda_schedule_numeric"] = (
        df["is_agenda_schedule"]
        .map(
            {
                True: 1,
                False: 0,
                "true": 1,
                "false": 0,
                "TRUE": 1,
                "FALSE": 0,
            }
        )
        .fillna(0)
    )

    df["schedule_rate_until_now"] = (
        df.groupby("vin_hash")[
            "is_agenda_schedule_numeric"
        ]
        .transform(
            lambda x: x.expanding().mean()
        )
    )

    # --------------------------------------------------------
    # Intervalo médio entre manutenções
    # --------------------------------------------------------

    df["avg_days_between_services_until_now"] = (
        df.groupby("vin_hash")[
            "days_since_previous_service"
        ]
        .transform(
            lambda x: x.expanding().mean()
        )
    )

    # --------------------------------------------------------
    # Desvio padrão dos intervalos
    # --------------------------------------------------------

    df["service_interval_std_until_now"] = (
        df.groupby("vin_hash")[
            "days_since_previous_service"
        ]
        .transform(
            lambda x: x.expanding().std()
        )
    )

    print(
        f"Amostras disponíveis para treinamento: {len(df)}"
    )

    print("\nDistribuição do target:")

    print(
        df["target_next_service_120d"]
        .value_counts()
        .sort_index()
    )

    return df


# ============================================================
# PREPARAR FEATURES
# ============================================================

def prepare_features(df):

    print("\n==============================")
    print("PREPARANDO FEATURES")
    print("==============================")

    X = df[FEATURES].copy()

    # Conversão numérica
    for column in FEATURES:

        X[column] = pd.to_numeric(
            X[column],
            errors="coerce"
        )

    # Valores infinitos
    X = X.replace(
        [float("inf"), float("-inf")],
        pd.NA
    )

    # Preencher valores ausentes pela mediana
    for column in FEATURES:

        median = X[column].median()

        if pd.isna(median):
            median = 0

        X[column] = X[column].fillna(
            median
        )

    print("\nFeatures utilizadas:")

    for feature in FEATURES:

        print(f" - {feature}")

    return X


# ============================================================
# DIVISÃO POR VEÍCULO
# ============================================================

def split_dataset(df, X):

    print("\n==============================")
    print("DIVISÃO TREINO / TESTE")
    print("==============================")

    y = df[
        "target_next_service_120d"
    ]

    groups = df["vin_hash"]

    splitter = GroupShuffleSplit(
        n_splits=1,
        test_size=TEST_SIZE,
        random_state=RANDOM_STATE,
    )

    train_indices, test_indices = next(
        splitter.split(
            X,
            y,
            groups=groups
        )
    )

    X_train = X.iloc[
        train_indices
    ]

    X_test = X.iloc[
        test_indices
    ]

    y_train = y.iloc[
        train_indices
    ]

    y_test = y.iloc[
        test_indices
    ]

    train_vins = set(
        df.iloc[
            train_indices
        ]["vin_hash"]
    )

    test_vins = set(
        df.iloc[
            test_indices
        ]["vin_hash"]
    )

    overlap = train_vins.intersection(
        test_vins
    )

    print(
        f"Veículos no treino: {len(train_vins)}"
    )

    print(
        f"Veículos no teste: {len(test_vins)}"
    )

    print(
        f"Veículos em ambos: {len(overlap)}"
    )

    if len(overlap) > 0:

        raise RuntimeError(
            "ERRO: existem veículos presentes "
            "simultaneamente no treino e no teste."
        )

    print(
        f"\nRegistros de treino: {len(X_train)}"
    )

    print(
        f"Registros de teste: {len(X_test)}"
    )

    return (
        X_train,
        X_test,
        y_train,
        y_test,
        train_indices,
        test_indices,
    )


# ============================================================
# TREINAMENTO
# ============================================================

def train_model(
    X_train,
    y_train
):

    print("\n==============================")
    print("TREINANDO RANDOM FOREST")
    print("==============================")

    model = RandomForestClassifier(
        n_estimators=300,
        max_depth=12,
        min_samples_split=10,
        min_samples_leaf=4,
        class_weight="balanced",
        random_state=RANDOM_STATE,
        n_jobs=-1,
    )

    model.fit(
        X_train,
        y_train
    )

    print(
        "\nModelo treinado com sucesso."
    )

    return model


# ============================================================
# AVALIAÇÃO
# ============================================================

def evaluate_model(
    model,
    X_test,
    y_test
):

    print("\n==============================")
    print("AVALIAÇÃO DO MODELO")
    print("==============================")

    predictions = model.predict(
        X_test
    )

    probabilities = model.predict_proba(
        X_test
    )[:, 1]

    accuracy = accuracy_score(
        y_test,
        predictions
    )

    precision = precision_score(
        y_test,
        predictions,
        zero_division=0
    )

    recall = recall_score(
        y_test,
        predictions,
        zero_division=0
    )

    f1 = f1_score(
        y_test,
        predictions,
        zero_division=0
    )

    roc_auc = roc_auc_score(
        y_test,
        probabilities
    )

    print(
        f"\nAccuracy : {accuracy:.4f}"
    )

    print(
        f"Precision: {precision:.4f}"
    )

    print(
        f"Recall   : {recall:.4f}"
    )

    print(
        f"F1 Score : {f1:.4f}"
    )

    print(
        f"ROC-AUC  : {roc_auc:.4f}"
    )

    print(
        "\nClassification Report:"
    )

    print(
        classification_report(
            y_test,
            predictions,
            zero_division=0
        )
    )

    print(
        "Confusion Matrix:"
    )

    print(
        confusion_matrix(
            y_test,
            predictions
        )
    )

    return predictions, probabilities


# ============================================================
# IMPORTÂNCIA DAS FEATURES
# ============================================================

def show_feature_importance(model):

    print("\n==============================")
    print("IMPORTÂNCIA DAS FEATURES")
    print("==============================")

    importance_df = pd.DataFrame(
        {
            "feature": FEATURES,
            "importance": model.feature_importances_,
        }
    )

    importance_df = importance_df.sort_values(
        "importance",
        ascending=False
    )

    for _, row in importance_df.iterrows():

        print(
            f"{row['feature']}: "
            f"{row['importance']:.4f}"
        )

    return importance_df


# ============================================================
# SALVAR MODELO
# ============================================================

def save_model(model):

    print("\n==============================")
    print("SALVANDO MODELO")
    print("==============================")

    joblib.dump(
        model,
        MODEL_PATH
    )

    joblib.dump(
        FEATURES,
        FEATURES_PATH
    )

    print(
        f"Modelo: {MODEL_PATH}"
    )

    print(
        f"Features: {FEATURES_PATH}"
    )


# ============================================================
# SALVAR PREDIÇÕES
# ============================================================

def save_predictions_to_database(
    model,
    df
):

    print("\n==============================")
    print("GERANDO PREDIÇÕES POR VEÍCULO")
    print("==============================")

    # --------------------------------------------------------
    # Para a previsão operacional usamos apenas o último
    # registro conhecido de cada veículo.
    # --------------------------------------------------------

    latest = (
        df.sort_values(
            ["vin_hash", "service_date"]
        )
        .groupby(
            "vin_hash",
            as_index=False
        )
        .tail(1)
        .copy()
    )

    if latest.empty:

        print(
            "Nenhum veículo disponível para previsão."
        )

        return

    X_latest = prepare_features(
        latest
    )

    probabilities = model.predict_proba(
        X_latest
    )[:, 1]

    predictions = (
        probabilities >= 0.5
    ).astype(int)

    connection = get_connection()

    try:

        with connection.cursor() as cursor:

            query = """
                INSERT INTO ml_predictions (
                    vin_hash,
                    model_name,
                    target_name,
                    probability,
                    predicted_class,
                    model_version
                )
                VALUES (
                    %s, %s, %s,
                    %s, %s, %s
                )
                ON CONFLICT (vin_hash)
                DO UPDATE SET
                    model_name = EXCLUDED.model_name,
                    target_name = EXCLUDED.target_name,
                    probability = EXCLUDED.probability,
                    predicted_class = EXCLUDED.predicted_class,
                    model_version = EXCLUDED.model_version,
                    created_at = CURRENT_TIMESTAMP;
            """

            records = []

            for index, row in latest.iterrows():

                position = latest.index.get_loc(
                    index
                )

                probability = float(
                    probabilities[position]
                )

                predicted_class = int(
                    predictions[position]
                )

                records.append(
                    (
                        row["vin_hash"],
                        "Random Forest",
                        "Retorno em até 120 dias",
                        probability,
                        predicted_class,
                        MODEL_VERSION,
                    )
                )

            cursor.executemany(
                query,
                records
            )

        connection.commit()

        print(
            f"Predições salvas: {len(records)}"
        )

    except Exception:

        connection.rollback()

        raise

    finally:

        connection.close()


# ============================================================
# MAIN
# ============================================================

def main():

    print(
        "\n=============================="
    )

    print(
        "RANDOM FOREST"
    )

    print(
        "ConnectCare 360"
    )

    print(
        "Validação por veículo"
    )

    print(
        "=============================="
    )

    # 1. Carregar
    df = load_service_history()

    if df.empty:

        print(
            "Nenhum dado encontrado."
        )

        return

    # 2. Preparar dataset
    df = prepare_dataset(
        df
    )

    # 3. Features
    X = prepare_features(
        df
    )

    # 4. Divisão por VIN
    (
        X_train,
        X_test,
        y_train,
        y_test,
        train_indices,
        test_indices,
    ) = split_dataset(
        df,
        X
    )

    # 5. Treinar
    model = train_model(
        X_train,
        y_train
    )

    # 6. Avaliar
    evaluate_model(
        model,
        X_test,
        y_test
    )

    # 7. Importância
    show_feature_importance(
        model
    )

    # 8. Salvar modelo
    save_model(
        model
    )

    # 9. Gerar previsões operacionais
    save_predictions_to_database(
        model,
        df
    )

    print(
        "\n=============================="
    )

    print(
        "TREINAMENTO CONCLUÍDO!"
    )

    print(
        "=============================="
    )


if __name__ == "__main__":

    main()