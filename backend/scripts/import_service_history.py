import sys
import os
import pandas as pd

# ============================================================
# CONFIGURAÇÕES
# ============================================================

BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))

FILE_PATH = os.path.join(
    BASE_DIR,
    "data",
    "ford_service_history_tratado.xlsx"
)

BATCH_SIZE = 1000

# Permite importar o pacote app a partir do diretório backend
sys.path.insert(0, BASE_DIR)

from app.database import get_connection


# ============================================================
# COLUNAS
# ============================================================

COLUMNS = [
    "record_id",
    "schedule_id",
    "maintenance_id",
    "service_order",
    "service_date",
    "service_open_date",
    "service_closed_date",
    "service_dept_code",
    "service_repair_type_code",
    "service_code",
    "maintenance_number",
    "dealer_code",
    "main_source",
    "is_agenda_schedule",
    "vin_hash",
    "model_year",
    "model_name",
    "km",
    "invoice_date",
    "sales_date",
    "delivery_date",
    "registration_date",
    "warranty_start_date",
    "flag_missing_vin",
    "flag_invalid_vin_hash",
    "flag_invalid_model_year",
    "flag_negative_km",
    "flag_extreme_km",
    "vehicle_age_days_at_service",
    "avg_km_per_day_since_delivery",
    "flag_implausible_km_rate",
    "km_original",
    "flag_invalid_km",
    "previous_service_date",
    "previous_km",
    "days_since_previous_service",
    "km_delta",
    "flag_km_regression",
    "km_per_day_between_services",
    "flag_service_before_sale",
    "flag_service_before_delivery",
    "flag_close_before_open",
    "flag_closed_before_service",
    "days_sale_to_service",
    "days_delivery_to_service",
    "days_warranty_to_service",
    "service_duration_days",
    "warranty_phase",
    "data_quality_status",
    "service_sequence",
    "service_count_vin",
    "first_service_date_vin",
    "last_service_date_vin",
    "avg_days_between_services_vin",
    "service_interval_std_vin",
    "unique_dealers_vin",
    "main_dealer_vin",
    "main_dealer_service_count_vin",
    "dealer_loyalty_ratio_vin",
    "schedule_rate_vin",
    "last_maintenance_number_vin",
    "days_to_first_service_vin",
]


# ============================================================
# LEITURA DO EXCEL
# ============================================================

print("Lendo arquivo Excel...")

df = pd.read_excel(FILE_PATH)

print(f"Total de registros encontrados: {len(df)}")


# ============================================================
# PADRONIZAÇÃO DOS NOMES DAS COLUNAS
# ============================================================

df.columns = [
    "schedule_id",
    "maintenance_id",
    "service_order",
    "service_date",
    "service_open_date",
    "service_closed_date",
    "service_dept_code",
    "service_repair_type_code",
    "service_code",
    "maintenance_number",
    "dealer_code",
    "main_source",
    "is_agenda_schedule",
    "vin_hash",
    "model_year",
    "model_name",
    "km",
    "invoice_date",
    "sales_date",
    "delivery_date",
    "registration_date",
    "warranty_start_date",
    "flag_missing_vin",
    "flag_invalid_vin_hash",
    "flag_invalid_model_year",
    "flag_negative_km",
    "flag_extreme_km",
    "vehicle_age_days_at_service",
    "avg_km_per_day_since_delivery",
    "flag_implausible_km_rate",
    "km_original",
    "flag_invalid_km",
    "previous_service_date",
    "previous_km",
    "days_since_previous_service",
    "km_delta",
    "flag_km_regression",
    "km_per_day_between_services",
    "flag_service_before_sale",
    "flag_service_before_delivery",
    "flag_close_before_open",
    "flag_closed_before_service",
    "days_sale_to_service",
    "days_delivery_to_service",
    "days_warranty_to_service",
    "service_duration_days",
    "warranty_phase",
    "data_quality_status",
    "service_sequence",
    "service_count_vin",
    "first_service_date_vin",
    "last_service_date_vin",
    "avg_days_between_services_vin",
    "service_interval_std_vin",
    "unique_dealers_vin",
    "main_dealer_vin",
    "main_dealer_service_count_vin",
    "dealer_loyalty_ratio_vin",
    "schedule_rate_vin",
    "last_maintenance_number_vin",
    "days_to_first_service_vin",
    "record_id",
]


# ============================================================
# CONVERSÃO DE DATAS
# ============================================================

DATE_COLUMNS = [
    "service_date",
    "service_open_date",
    "service_closed_date",
    "invoice_date",
    "sales_date",
    "delivery_date",
    "registration_date",
    "warranty_start_date",
    "previous_service_date",
    "first_service_date_vin",
    "last_service_date_vin",
]

for column in DATE_COLUMNS:
    df[column] = pd.to_datetime(
        df[column],
        errors="coerce"
    ).dt.date


# ============================================================
# TRATAMENTO DE VALORES NULOS
# ============================================================

# Converte NaN/NaT para None.
# Isso evita erros do PostgreSQL ao inserir valores nulos.
df = df.astype(object).where(
    pd.notnull(df),
    None
)


# ============================================================
# CONEXÃO COM O BANCO
# ============================================================

print("Conectando ao PostgreSQL...")

conn = get_connection()
cursor = conn.cursor()

print("Conexão realizada com sucesso!")


# ============================================================
# SQL DE INSERT
# ============================================================

columns_sql = ", ".join(COLUMNS)

placeholders = ", ".join(
    ["%s"] * len(COLUMNS)
)

SQL = f"""
    INSERT INTO service_history (
        {columns_sql}
    )
    VALUES (
        {placeholders}
    )
    ON CONFLICT (record_id) DO NOTHING
"""


# ============================================================
# IMPORTAÇÃO EM LOTES
# ============================================================

print("Iniciando importação...")
print(f"Total de registros: {len(df)}")
print(f"Tamanho do lote: {BATCH_SIZE}")
print("-" * 60)


try:

    for start in range(0, len(df), BATCH_SIZE):

        end = min(
            start + BATCH_SIZE,
            len(df)
        )

        batch = df.iloc[start:end]

        records = [
            tuple(row)
            for row in batch[COLUMNS].itertuples(
                index=False,
                name=None
            )
        ]

        cursor.executemany(
            SQL,
            records
        )

        conn.commit()

        print(
            f"Processados: {end}/{len(df)}"
        )


    print("-" * 60)
    print("IMPORTAÇÃO CONCLUÍDA!")
    print(
        f"Total de registros processados: {len(df)}"
    )


except Exception as e:

    conn.rollback()

    print("-" * 60)
    print("ERRO DURANTE A IMPORTAÇÃO")
    print("-" * 60)
    print(type(e).__name__)
    print(e)

    raise


finally:

    cursor.close()
    conn.close()

    print("Conexão com o banco encerrada.")