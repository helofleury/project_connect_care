import sys
import os

import pandas as pd

# Permite importar arquivos da pasta app
sys.path.append(
    os.path.dirname(
        os.path.dirname(
            os.path.abspath(__file__)
        )
    )
)

from app.database import get_connection


# =========================
# CONFIGURAÇÕES
# =========================

BASE_DIR = os.path.dirname(
    os.path.dirname(
        os.path.abspath(__file__)
    )
)

FILE_PATH = os.path.join(
    BASE_DIR,
    "data",
    "ford_vehicle_360.xlsx"
)

BATCH_SIZE = 1000


# =========================
# COLUNAS
# =========================

COLUMNS = [
    "vin_hash",
    "model_name",
    "model_year",
    "sales_date",
    "delivery_date",
    "warranty_start_date",
    "first_service_date",
    "last_service_date",
    "service_count",
    "first_km",
    "last_km",
    "max_km",
    "avg_days_between_services",
    "service_interval_variability",
    "unique_dealers",
    "main_source",
    "last_maintenance_number",
    "km_regression_count",
    "invalid_km_count",
    "temporal_warning_count",
    "days_since_last_service",
    "vehicle_age_days",
    "days_to_first_service",
    "km_delta",
    "avg_km_per_day",
    "main_dealer",
    "dealer_loyalty_ratio",
    "schedule_rate",
    "warranty_phase",
    "high_recency_risk",
    "low_dealer_loyalty",
    "irregular_service_pattern",
    "reference_date",
]


# =========================
# LEITURA DO EXCEL
# =========================

print("Lendo arquivo Excel...")

df = pd.read_excel(FILE_PATH)

print(f"Linhas carregadas: {len(df)}")


# =========================
# RENOMEAR COLUNAS
# =========================

df.columns = [
    "vin_hash",
    "model_name",
    "model_year",
    "sales_date",
    "delivery_date",
    "warranty_start_date",
    "first_service_date",
    "last_service_date",
    "service_count",
    "first_km",
    "last_km",
    "max_km",
    "avg_days_between_services",
    "service_interval_variability",
    "unique_dealers",
    "main_source",
    "last_maintenance_number",
    "km_regression_count",
    "invalid_km_count",
    "temporal_warning_count",
    "days_since_last_service",
    "vehicle_age_days",
    "days_to_first_service",
    "km_delta",
    "avg_km_per_day",
    "main_dealer",
    "dealer_loyalty_ratio",
    "schedule_rate",
    "warranty_phase",
    "high_recency_risk",
    "low_dealer_loyalty",
    "irregular_service_pattern",
    "reference_date",
]


# =========================
# TRATAMENTO DAS DATAS
# =========================

DATE_COLUMNS = [
    "sales_date",
    "delivery_date",
    "warranty_start_date",
    "first_service_date",
    "last_service_date",
    "reference_date",
]

for column in DATE_COLUMNS:
    df[column] = pd.to_datetime(
        df[column],
        errors="coerce"
    ).dt.date


# =========================
# TRATAMENTO DOS VALORES NULOS
# =========================

# =========================
# TRATAMENTO DOS VALORES NULOS
# =========================

# Converte o DataFrame para object antes de substituir
# NaN por None. Isso permite enviar valores nulos
# corretamente para o PostgreSQL.
df = df.astype(object).where(
    pd.notnull(df),
    None
)


# =========================
# CONEXÃO COM POSTGRESQL
# =========================

print("Conectando ao PostgreSQL...")

connection = get_connection()

cursor = connection.cursor()

print("Conexão realizada com sucesso!")


# =========================
# SQL DE INSERÇÃO
# =========================

sql = """
INSERT INTO vehicles (
    vin_hash,
    model_name,
    model_year,
    sales_date,
    delivery_date,
    warranty_start_date,
    first_service_date,
    last_service_date,
    service_count,
    first_km,
    last_km,
    max_km,
    avg_days_between_services,
    service_interval_variability,
    unique_dealers,
    main_source,
    last_maintenance_number,
    km_regression_count,
    invalid_km_count,
    temporal_warning_count,
    days_since_last_service,
    vehicle_age_days,
    days_to_first_service,
    km_delta,
    avg_km_per_day,
    main_dealer,
    dealer_loyalty_ratio,
    schedule_rate,
    warranty_phase,
    high_recency_risk,
    low_dealer_loyalty,
    irregular_service_pattern,
    reference_date
)

VALUES (
    %s, %s, %s, %s, %s, %s, %s, %s,
    %s, %s, %s, %s, %s, %s, %s, %s,
    %s, %s, %s, %s, %s, %s, %s, %s,
    %s, %s, %s, %s, %s, %s, %s, %s,
    %s
)

ON CONFLICT (vin_hash) DO NOTHING
"""


# =========================
# IMPORTAÇÃO
# =========================

print("\nIniciando importação...")

total = len(df)


for start in range(
    0,
    total,
    BATCH_SIZE
):

    batch = df.iloc[
        start:start + BATCH_SIZE
    ]

    records = list(
        batch[
            COLUMNS
        ].itertuples(
            index=False,
            name=None
        )
    )

    try:

        cursor.executemany(
            sql,
            records
        )

        connection.commit()

    except Exception as error:
        print("\nERRO NO LOTE!")
        print(f"Registros do lote: {len(records)}")
        print(f"Erro: {os.error}")

        connection.rollback()

        print("\nTentando descobrir o registro problemático...")

        for index, record in enumerate(records):

            try:

                cursor.execute(sql, record)
                connection.rollback()

            except Exception as record_error:

                print("\n===================================")
                print("REGISTRO PROBLEMÁTICO")
                print("===================================")

                print(f"Posição no lote: {index}")
                print(f"Erro: {record_error}")

                print("\nValores do registro:")

                for column, value in zip(COLUMNS, record):

                    print(
                        f"{column}: {value} "
                        f"(tipo Python: {type(value).__name__})"
                    )

                print("\n===================================")
                print("TESTANDO COLUNA POR COLUNA")
                print("===================================")

                # Testa cada valor individualmente
                for column, value in zip(COLUMNS, record):

                    try:

                        # Cria uma cópia do registro
                        test_record = list(record)

                        # Coloca None em todas as outras posições
                        for i in range(len(test_record)):

                            if i != COLUMNS.index(column):
                                test_record[i] = None

                        cursor.execute(
                            sql,
                            tuple(test_record)
                        )

                        connection.rollback()

                    except Exception as column_error:

                        connection.rollback()

                        print(
                            f"\nPROBLEMA ENCONTRADO:"
                        )

                        print(
                            f"Coluna: {column}"
                        )

                        print(
                            f"Valor: {value}"
                        )

                        print(
                            f"Tipo: {type(value).__name__}"
                        )

                        print(
                            f"Erro: {column_error}"
                        )

                connection.rollback()

                break

        raise error

    imported = min(
        start + BATCH_SIZE,
        total
    )

    print(
        f"Importados: {imported}/{total}"
    )


# =========================
# FINALIZAÇÃO
# =========================

cursor.close()

connection.close()

print("\n===================================")
print("IMPORTAÇÃO FINALIZADA COM SUCESSO!")
print("===================================")
print(
    f"Total de registros processados: {total}"
)