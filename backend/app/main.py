import os
import re
from pathlib import Path

from dotenv import load_dotenv  # pyright: ignore[reportMissingImports]

BASE_DIR = Path(__file__).resolve().parent.parent
load_dotenv(BASE_DIR / ".env")

print("ENV:", os.getenv("N8N_WEBHOOK_URL"))

from fastapi import FastAPI, HTTPException  # pyright: ignore[reportMissingImports]
from pydantic import BaseModel  # pyright: ignore[reportMissingImports]
from .database import get_connection
from app.services.notification_service import (
    send_recommendation_email,
    send_customer_notification,
)
from app.services import chatbot_service, profile_service, message_templates
from app.routes.engagement import router as engagement_router
from app.services.engagement_service import (
    evaluate as evaluate_engagement_customer,
    _ensure_tables as ensure_engagement_tables,
)

app = FastAPI(
    title="ConnectCare 360 API",
    description="Backend do projeto ConnectCare 360",
    version="1.0.0"
)

app.include_router(engagement_router)

class NotificationRequest(BaseModel):
    email: str
    name: str = "Cliente ConnectCare"


class ChatMessageRequest(BaseModel):
    vin_hash: str
    message: str
    history: list[dict] = []
    
    
    
class RegisterRequest(BaseModel):
    firebase_uid: str
    name: str
    last_name: str
    email: str
    phone: str
    vin_hash: str
    
class LoginRequest(BaseModel):
    firebase_uid: str
    

@app.post("/auth/login")
def login_customer(request: LoginRequest):
    connection = get_connection()

    try:
        with connection.cursor() as cursor:
            cursor.execute(
                """
                SELECT
                    customer_id,
                    firebase_uid,
                    name,
                    last_name,
                    email,
                    phone,
                    vin_hash
                FROM customers
                WHERE firebase_uid = %s;
                """,
                (request.firebase_uid.strip(),)
            )

            customer = cursor.fetchone()

            if customer is None:
                raise HTTPException(
                    status_code=404,
                    detail="Cliente não encontrado no ConnectCare."
                )

            return {
                "status": "ok",
                "message": "Login realizado com sucesso.",
                "customer": {
                    "customer_id": customer[0],
                    "firebase_uid": customer[1],
                    "name": customer[2],
                    "last_name": customer[3],
                    "email": customer[4],
                    "phone": customer[5],
                    "vin_hash": customer[6],
                }
            }

    except HTTPException:
        raise

    except Exception as exc:
        raise HTTPException(
            status_code=500,
            detail=f"Erro ao buscar cliente: {str(exc)}"
        )

    finally:
        connection.close()



def normalize_brazil_phone(phone: str) -> str:
    """Return a WhatsApp-ready Brazilian number in E.164 format (+55...)."""
    digits = re.sub(r"\D", "", phone)

    if digits.startswith("55") and len(digits) in {12, 13}:
        return f"+{digits}"

    if len(digits) in {10, 11}:
        return f"+55{digits}"

    raise HTTPException(
        status_code=400,
        detail="Telefone inválido. Informe um telefone brasileiro com DDD, por exemplo (11) 99999-9999."
    )


@app.post("/auth/register")
def register_customer(request: RegisterRequest):
    ensure_engagement_tables()
    connection = get_connection()

    # Normaliza os dados antes de trabalhar com eles
    firebase_uid = request.firebase_uid.strip()
    name = request.name.strip()
    last_name = request.last_name.strip()
    email = request.email.strip()
    phone = normalize_brazil_phone(request.phone)
    vin_hash = request.vin_hash.strip().lower()

    try:
        with connection.cursor() as cursor:

            # Verifica se o veículo existe
            cursor.execute(
                """
                SELECT vin_hash
                FROM vehicles
                WHERE LOWER(vin_hash) = %s;
                """,
                (vin_hash,)
            )

            vehicle = cursor.fetchone()

            if vehicle is None:
                raise HTTPException(
                    status_code=404,
                    detail="Veículo não encontrado para o VIN informado."
                )

            # Verifica se o Firebase UID já está cadastrado
            cursor.execute(
                """
                SELECT customer_id
                FROM customers
                WHERE firebase_uid = %s;
                """,
                (firebase_uid,)
            )

            existing_customer = cursor.fetchone()

            if existing_customer is not None:
                raise HTTPException(
                    status_code=409,
                    detail="Este usuário já está cadastrado."
                )

            # Verifica se o veículo já está associado a outro cliente
            cursor.execute(
                """
                SELECT customer_id
                FROM customers
                WHERE LOWER(vin_hash) = %s;
                """,
                (vin_hash,)
            )

            existing_vehicle_owner = cursor.fetchone()

            if existing_vehicle_owner is not None:
                raise HTTPException(
                    status_code=409,
                    detail="Este veículo já está associado a outro cliente."
                )

            # Cria o cliente
            cursor.execute(
                """
                INSERT INTO customers (
                    firebase_uid,
                    name,
                    last_name,
                    email,
                    phone,
                    vin_hash
                )
                VALUES (%s, %s, %s, %s, %s, %s)
                RETURNING customer_id;
                """,
                (
                    firebase_uid,
                    name,
                    last_name,
                    email,
                    phone,
                    vin_hash,
                )
            )

            customer_id = cursor.fetchone()[0]

            # Cria preferências iniciais vinculadas ao cliente.
            # O cliente pode alterá-las depois na tela de Preferências.
            cursor.execute(
                """
                INSERT INTO customer_preferences (
                    customer_id, news_channel, alert_channel, recommendation_channel,
                    news_whatsapp, news_email,
                    alert_whatsapp, alert_email,
                    recommendation_whatsapp, recommendation_email,
                    allow_news, allow_alerts, allow_recommendations
                )
                VALUES (%s, 'email', 'whatsapp', 'email',
                        FALSE, TRUE, TRUE, FALSE, FALSE, TRUE,
                        TRUE, TRUE, TRUE)
                ON CONFLICT (customer_id) DO NOTHING;
                """,
                (customer_id,)
            )

        connection.commit()

        return {
            "status": "ok",
            "message": "Cliente cadastrado com sucesso.",
            "customer": {
                "customer_id": customer_id,
                "firebase_uid": firebase_uid,
                "name": name,
                "last_name": last_name,
                "email": email,
                "phone": phone,
                "vin_hash": vin_hash,
            }
        }

    except HTTPException:
        raise

    except Exception as exc:
        connection.rollback()
        raise HTTPException(
            status_code=500,
            detail=f"Erro ao cadastrar cliente: {str(exc)}"
        )

    finally:
        connection.close()


@app.get("/health")
def health_check():
    return {
        "status": "ok",
        "message": "ConnectCare 360 API está funcionando!"
    }


@app.get("/db-test")
def database_test():
    connection = get_connection()

    try:
        with connection.cursor() as cursor:
            cursor.execute("SELECT COUNT(*) FROM vehicles;")
            vehicles_count = cursor.fetchone()[0]

            cursor.execute("SELECT COUNT(*) FROM service_history;")
            service_history_count = cursor.fetchone()[0]

        return {
            "status": "ok",
            "database": "connected",
            "vehicles": vehicles_count,
            "service_history": service_history_count
        }

    finally:
        connection.close()
        
@app.get("/vehicles/{vin_hash}")
def get_vehicle(vin_hash: str):
    connection = get_connection()

    try:
        with connection.cursor() as cursor:
            cursor.execute(
                """
                SELECT
                    vin_hash,
                    model_name,
                    model_year,
                    last_km,
                    last_service_date,
                    service_count,
                    main_dealer,
                    days_since_last_service
                FROM vehicles
                WHERE vin_hash = %s;
                """,
                (vin_hash,)
            )

            vehicle = cursor.fetchone()

        if vehicle is None:
            return {
                "status": "not_found",
                "message": "Veículo não encontrado."
            }

        return {
            "status": "ok",
            "vehicle": {
                "vin_hash": vehicle[0],
                "model": vehicle[1],
                "year": vehicle[2],
                "mileage": vehicle[3],
                "last_service_date": vehicle[4],
                "service_count": vehicle[5],
                "main_dealer": vehicle[6],
                "days_since_last_service": vehicle[7]
            }
        }

    finally:
        connection.close()
        
        
@app.get("/vehicles/{vin_hash}/history")
def get_vehicle_history(vin_hash: str):
    connection = get_connection()

    try:
        with connection.cursor() as cursor:
            cursor.execute(
                """
                SELECT
                    record_id,
                    service_date,
                    service_open_date,
                    service_closed_date,
                    dealer_code,
                    service_dept_code,
                    service_repair_type_code,
                    service_code,
                    maintenance_number,
                    main_source,
                    km,
                    warranty_phase,
                    data_quality_status,
                    service_sequence
                FROM service_history
                WHERE vin_hash = %s
                ORDER BY service_date DESC;
                """,
                (vin_hash,)
            )

            history = cursor.fetchall()

        return {
            "status": "ok",
            "vin_hash": vin_hash,
            "total": len(history),
            "history": [
                {
                    "record_id": item[0],
                    "service_date": item[1],
                    "service_open_date": item[2],
                    "service_closed_date": item[3],
                    "dealer_code": item[4],
                    "service_dept_code": item[5],
                    "service_repair_type_code": item[6],
                    "service_code": item[7],
                    "maintenance_number": item[8],
                    "main_source": item[9],
                    "km": item[10],
                    "warranty_phase": item[11],
                    "data_quality_status": item[12],
                    "service_sequence": item[13]
                }
                for item in history
            ]
        }

    finally:
        connection.close()
        
        
@app.get("/vehicles/{vin_hash}/prediction")
def get_vehicle_prediction(vin_hash: str):
    connection = get_connection()

    try:
        with connection.cursor() as cursor:
            cursor.execute(
                """
                SELECT
                    vin_hash,
                    model_name,
                    model_year,
                    service_count,
                    days_since_last_service,
                    avg_days_between_services,
                    service_interval_variability,
                    dealer_loyalty_ratio,
                    high_recency_risk,
                    low_dealer_loyalty,
                    irregular_service_pattern,
                    km_regression_count,
                    invalid_km_count,
                    temporal_warning_count
                FROM vehicles
                WHERE vin_hash = %s;
                """,
                (vin_hash,)
            )

            vehicle = cursor.fetchone()

        if vehicle is None:
            return {
                "status": "not_found",
                "message": "Veículo não encontrado."
            }

        (
            vin_hash,
            model_name,
            model_year,
            service_count,
            days_since_last_service,
            avg_days_between_services,
            service_interval_variability,
            dealer_loyalty_ratio,
            high_recency_risk,
            low_dealer_loyalty,
            irregular_service_pattern,
            km_regression_count,
            invalid_km_count,
            temporal_warning_count
        ) = vehicle

        # Trata valores nulos/NaN antes de enviar para o JSON
        def safe_number(value):
            if value is None:
                return None

            try:
                if value != value:
                    return None
            except Exception:
                pass

            return value

        def safe_boolean(value):
            return bool(value) if value is not None else False

        service_count = safe_number(service_count)
        days_since_last_service = safe_number(days_since_last_service)
        avg_days_between_services = safe_number(
            avg_days_between_services
        )
        service_interval_variability = safe_number(
            service_interval_variability
        )
        dealer_loyalty_ratio = safe_number(
            dealer_loyalty_ratio
        )
        km_regression_count = safe_number(
            km_regression_count
        )
        invalid_km_count = safe_number(
            invalid_km_count
        )
        temporal_warning_count = safe_number(
            temporal_warning_count
        )

        high_recency_risk = safe_boolean(
            high_recency_risk
        )

        low_dealer_loyalty = safe_boolean(
            low_dealer_loyalty
        )

        irregular_service_pattern = safe_boolean(
            irregular_service_pattern
        )

        # -----------------------------
        # CÁLCULO DO RISCO
        # -----------------------------

        score = 0
        reasons = []

        if high_recency_risk:
            score += 40

            reasons.append(
                "O veículo apresenta risco relacionado à recência da última manutenção."
            )

        if irregular_service_pattern:
            score += 25

            reasons.append(
                "O histórico apresenta um padrão irregular de manutenção."
            )

        if low_dealer_loyalty:
            score += 15

            reasons.append(
                "O veículo apresenta baixa fidelidade à concessionária principal."
            )

        if (
            days_since_last_service is not None
            and days_since_last_service > 365
        ):
            score += 20

            reasons.append(
                "Há mais de um ano desde a última manutenção registrada."
            )

        if (
            km_regression_count is not None
            and km_regression_count > 0
        ):
            score += 10

            reasons.append(
                "Foram identificados registros de regressão de quilometragem."
            )

        # -----------------------------
        # CLASSIFICAÇÃO
        # -----------------------------

        if score >= 60:
            risk_level = "ALTO"

        elif score >= 30:
            risk_level = "MÉDIO"

        else:
            risk_level = "BAIXO"

        return {
            "status": "ok",

            "prediction": {
                "vin_hash": vin_hash,
                "model": model_name,
                "year": model_year,

                "risk_score": min(score, 100),
                "risk_level": risk_level,

                "reasons": reasons,

                "indicators": {
                    "service_count": service_count,
                    "days_since_last_service": days_since_last_service,
                    "avg_days_between_services": avg_days_between_services,
                    "service_interval_variability": service_interval_variability,
                    "dealer_loyalty_ratio": dealer_loyalty_ratio,

                    "high_recency_risk": high_recency_risk,
                    "low_dealer_loyalty": low_dealer_loyalty,
                    "irregular_service_pattern": irregular_service_pattern,

                    "km_regression_count": km_regression_count,
                    "invalid_km_count": invalid_km_count,
                    "temporal_warning_count": temporal_warning_count
                }
            }
        }

    finally:
        connection.close()
        
        
        
from datetime import timedelta

@app.get("/vehicles/{vin_hash}/next-maintenance")
def get_next_maintenance(vin_hash: str):
    connection = get_connection()

    try:
        with connection.cursor() as cursor:
            cursor.execute("""
                SELECT
                    service_date,
                    km
                FROM service_history
                WHERE vin_hash = %s
                  AND service_date IS NOT NULL
                ORDER BY service_date ASC;
            """, (vin_hash,))

            history = cursor.fetchall()

        if len(history) < 2:
            return {
                "status": "insufficient_history",
                "message": "Histórico insuficiente para estimar a próxima manutenção.",
                "vin_hash": vin_hash
            }

        intervals = []
        km_rates = []

        for i in range(1, len(history)):
            previous_date = history[i - 1][0]
            current_date = history[i][0]

            days = (current_date - previous_date).days

            if days > 0:
                intervals.append(days)

                previous_km = history[i - 1][1]
                current_km = history[i][1]

                if previous_km is not None and current_km is not None:
                    km_delta = float(current_km) - float(previous_km)

                    if km_delta >= 0:
                        km_rates.append(km_delta / days)

        if not intervals:
            return {
                "status": "insufficient_history",
                "message": "Não foi possível calcular os intervalos de manutenção.",
                "vin_hash": vin_hash
            }

        average_interval = sum(intervals) / len(intervals)

        last_service_date = history[-1][0]
        last_km = history[-1][1]

        estimated_next_date = (
            last_service_date + timedelta(days=round(average_interval))
        )

        average_km_per_day = (
            sum(km_rates) / len(km_rates)
            if km_rates
            else None
        )

        estimated_next_km = None

        if last_km is not None and average_km_per_day is not None:
            estimated_next_km = (
                float(last_km)
                + average_km_per_day * average_interval
            )

        return {
            "status": "ok",
            "prediction": {
                "vin_hash": vin_hash,
                "last_service_date": last_service_date,
                "last_km": last_km,
                "service_count": len(history),
                "average_interval_days": round(average_interval, 1),
                "average_km_per_day": (
                    round(average_km_per_day, 2)
                    if average_km_per_day is not None
                    else None
                ),
                "estimated_next_service_date": estimated_next_date,
                "estimated_next_km": (
                    round(estimated_next_km)
                    if estimated_next_km is not None
                    else None
                ),
                "methodology": (
                    "Estimativa baseada na média dos intervalos "
                    "entre as manutenções registradas."
                )
            }
        }

    finally:
        connection.close()
        
        
@app.get("/vehicles/{vin_hash}/recommendations")
def get_vehicle_recommendations(vin_hash: str):
    connection = get_connection()

    try:
        with connection.cursor() as cursor:
            cursor.execute("""
                SELECT
                    model_name,
                    model_year,
                    service_count,
                    days_since_last_service,
                    avg_days_between_services,
                    dealer_loyalty_ratio,
                    high_recency_risk,
                    low_dealer_loyalty,
                    irregular_service_pattern,
                    km_regression_count,
                    last_km
                FROM vehicles
                WHERE vin_hash = %s;
            """, (vin_hash,))

            vehicle = cursor.fetchone()

        if not vehicle:
            return {
                "status": "not_found",
                "message": "Veículo não encontrado."
            }

        (
            model_name,
            model_year,
            service_count,
            days_since_last_service,
            avg_days_between_services,
            dealer_loyalty_ratio,
            high_recency_risk,
            low_dealer_loyalty,
            irregular_service_pattern,
            km_regression_count,
            last_km,
        ) = vehicle

        recommendations = []

        # 1. Manutenção
        if (
            high_recency_risk
            or (
                days_since_last_service is not None
                and days_since_last_service > 365
            )
        ):
            recommendations.append({
                "type": "MAINTENANCE",
                "priority": "HIGH",
                "title": "Agendar manutenção",
                "description": (
                    "O veículo apresenta sinais de que uma nova "
                    "manutenção deve ser considerada."
                ),
                "action": "SCHEDULE_MAINTENANCE"
            })

        # 2. Revisão preventiva
        if service_count is not None and service_count >= 5:
            recommendations.append({
                "type": "PREVENTIVE",
                "priority": "MEDIUM",
                "title": "Realizar revisão preventiva",
                "description": (
                    "O histórico do veículo possui registros suficientes "
                    "para recomendar um acompanhamento preventivo."
                ),
                "action": "PREVENTIVE_CHECK"
            })

        # 3. Relacionamento com concessionária
        if low_dealer_loyalty:
            recommendations.append({
                "type": "LOYALTY",
                "priority": "MEDIUM",
                "title": "Fortalecer relacionamento com a concessionária",
                "description": (
                    "O histórico indica baixa concentração dos serviços "
                    "em uma única concessionária."
                ),
                "action": "DEALER_ENGAGEMENT"
            })

        # 4. Padrão irregular
        if irregular_service_pattern:
            recommendations.append({
                "type": "SERVICE_PATTERN",
                "priority": "MEDIUM",
                "title": "Acompanhar padrão de manutenção",
                "description": (
                    "Os intervalos entre os serviços apresentam "
                    "variações relevantes."
                ),
                "action": "MONITOR_SERVICE_PATTERN"
            })

        # 5. Inconsistência de quilometragem
        if km_regression_count is not None and km_regression_count > 0:
            recommendations.append({
                "type": "DATA_QUALITY",
                "priority": "LOW",
                "title": "Validar histórico de quilometragem",
                "description": (
                    "Foram identificadas inconsistências na evolução "
                    "da quilometragem registrada."
                ),
                "action": "VALIDATE_MILEAGE"
            })

        # Caso nenhuma recomendação tenha sido gerada
        if not recommendations:
            recommendations.append({
                "type": "MONITORING",
                "priority": "LOW",
                "title": "Manter acompanhamento",
                "description": (
                    "Não foram identificadas ações prioritárias "
                    "com base nos indicadores atuais."
                ),
                "action": "CONTINUE_MONITORING"
            })

        return {
            "status": "ok",
            "vin_hash": vin_hash,
            "vehicle": {
                "model": model_name,
                "year": model_year,
                "last_km": last_km
            },
            "recommendations": recommendations,
            "total": len(recommendations)
        }

    finally:
        connection.close()
        
        
@app.get("/vehicles/{vin_hash}/segment")
def get_vehicle_segment(vin_hash: str):
    connection = get_connection()

    try:
        with connection.cursor() as cursor:
            cursor.execute(
                """
                SELECT
                    vs.vin_hash,
                    vs.segment_id,
                    vs.segment_name,
                    vs.distance_to_centroid,
                    vs.model_version,
                    v.model_name,
                    v.model_year,
                    v.service_count,
                    v.days_since_last_service,
                    v.avg_days_between_services,
                    v.dealer_loyalty_ratio,
                    v.schedule_rate,
                    v.last_km
                FROM vehicle_segments vs
                INNER JOIN vehicles v
                    ON v.vin_hash = vs.vin_hash
                WHERE vs.vin_hash = %s;
                """,
                (vin_hash,)
            )

            segment = cursor.fetchone()

        if not segment:
            return {
                "status": "not_found",
                "message": "Segmento não encontrado para este veículo.",
                "vin_hash": vin_hash
            }

        (
            result_vin,
            segment_id,
            segment_name,
            distance_to_centroid,
            model_version,
            model_name,
            model_year,
            service_count,
            days_since_last_service,
            avg_days_between_services,
            dealer_loyalty_ratio,
            schedule_rate,
            last_km,
        ) = segment

        # Nome amigável para exibição no aplicativo
        if segment_id == 0:
            friendly_name = "Veículo mais ativo"
        elif segment_id == 1:
            friendly_name = "Baixa recorrência"
        else:
            friendly_name = f"Segmento {segment_id}"

        return {
            "status": "ok",
            "segment": {
                "vin_hash": result_vin,
                "segment_id": segment_id,
                "segment_name": friendly_name,
                "distance_to_centroid": float(distance_to_centroid)
                    if distance_to_centroid is not None
                    else None,
                "model_version": model_version,

                "vehicle": {
                    "model": model_name,
                    "year": model_year,
                    "service_count": service_count,
                    "days_since_last_service": days_since_last_service,
                    "avg_days_between_services": float(avg_days_between_services)
                        if avg_days_between_services is not None
                        else None,
                    "dealer_loyalty_ratio": float(dealer_loyalty_ratio)
                        if dealer_loyalty_ratio is not None
                        else None,
                    "schedule_rate": float(schedule_rate)
                        if schedule_rate is not None
                        else None,
                    "last_km": float(last_km)
                        if last_km is not None
                        else None,
                }
            }
        }

    finally:
        connection.close()
        
        
@app.get("/vehicles/{vin_hash}/ml-prediction")
def get_vehicle_ml_prediction(vin_hash: str):
    connection = get_connection()

    try:
        with connection.cursor() as cursor:
            cursor.execute(
                """
                SELECT
                    mp.vin_hash,
                    mp.model_name,
                    mp.target_name,
                    mp.probability,
                    mp.predicted_class,
                    mp.model_version,
                    v.model_name,
                    v.model_year,
                    v.service_count,
                    v.last_service_date,
                    v.last_km
                FROM ml_predictions mp
                INNER JOIN vehicles v
                    ON v.vin_hash = mp.vin_hash
                WHERE mp.vin_hash = %s;
                """,
                (vin_hash,)
            )

            result = cursor.fetchone()

        if not result:
            return {
                "status": "not_found",
                "message": "Previsão de Machine Learning não encontrada para este veículo.",
                "vin_hash": vin_hash
            }

        (
            result_vin,
            model_name,
            target_name,
            probability,
            predicted_class,
            model_version,
            vehicle_model,
            vehicle_year,
            service_count,
            last_service_date,
            last_km,
        ) = result

        probability = (
            float(probability)
            if probability is not None
            else None
        )

        # Classificação para apresentação no aplicativo
        if probability is None:
            ml_risk_level = "NÃO DISPONÍVEL"

        elif probability >= 0.70:
            ml_risk_level = "ALTA"

        elif probability >= 0.40:
            ml_risk_level = "MÉDIA"

        else:
            ml_risk_level = "BAIXA"

        return {
            "status": "ok",
            "prediction": {
                "vin_hash": result_vin,

                "model_name": model_name,

                "target_name": target_name,

                "probability": probability,

                "probability_percent": (
                    round(probability * 100, 1)
                    if probability is not None
                    else None
                ),

                "predicted_class": predicted_class,

                "classification": ml_risk_level,

                "model_version": model_version,

                "vehicle": {
                    "model": vehicle_model,
                    "year": vehicle_year,
                    "service_count": service_count,
                    "last_service_date": last_service_date,
                    "last_km": last_km
                }
            }
        }

    finally:
        connection.close()
        
        
def _format_date_br(date_value):
    if not date_value:
        return None

    try:
        return date_value.strftime("%d/%m/%Y")
    except AttributeError:
        parts = str(date_value).split("-")

        if len(parts) == 3:
            year, month, day = parts
            return f"{day}/{month}/{year}"

        return str(date_value)


def _translate_reasons_to_tips(reasons):
    """
    Converte os motivos técnicos (usados internamente para o cálculo de
    risco) em dicas simples e simpáticas para o cliente, sem jargão.
    """

    tips = []

    for reason in reasons:
        lower_reason = reason.lower()

        if "recência" in lower_reason:
            tips.append(
                "Já faz um tempo desde a sua última revisão. Que tal agendar uma?"
            )
        elif "irregular" in lower_reason:
            tips.append(
                "Manter as revisões em dia ajuda a preservar o valor do seu Ford."
            )
        elif "fidelidade" in lower_reason:
            tips.append(
                "Fazer suas revisões sempre na rede autorizada garante peças "
                "originais e mais valorização do seu carro."
            )
        elif "ano" in lower_reason:
            tips.append(
                "Já faz mais de um ano desde a última manutenção registrada."
            )
        elif "quilometragem" in lower_reason:
            tips.append(
                "Notamos uma inconsistência na quilometragem informada. "
                "Fale com a concessionária na próxima visita."
            )

    # remove duplicadas mantendo a ordem
    seen = set()
    unique_tips = []

    for tip in tips:
        if tip not in seen:
            unique_tips.append(tip)
            seen.add(tip)

    if not unique_tips:
        unique_tips.append(
            "Continue cuidando do seu Ford com revisões regulares."
        )

    return unique_tips[:3]


def _estimate_monthly_km(next_maintenance: dict | None) -> float | None:
    if not next_maintenance:
        return None

    average_km_per_day = next_maintenance.get("average_km_per_day")

    if average_km_per_day is None:
        return None

    return average_km_per_day * 30


@app.get("/vehicles/{vin_hash}/customer-summary")
def get_customer_summary(vin_hash: str):
    """
    Visão 100% voltada para o CLIENTE (usada pelo app).

    Aqui é onde "traduzimos" os dados e modelos internos (risco calculado
    por regras, Random Forest, K-Means) em informações simples e realmente
    úteis para quem está usando o aplicativo - sem nenhum termo técnico,
    score bruto ou nome de modelo estatístico.
    """

    prediction_response = get_vehicle_prediction(vin_hash)

    if prediction_response.get("status") != "ok":
        return {
            "status": "not_found",
            "message": "Não encontramos informações para este veículo.",
        }

    prediction = prediction_response["prediction"]

    ml_response = get_vehicle_ml_prediction(vin_hash)
    ml_probability = None

    if ml_response.get("status") == "ok":
        ml_probability = ml_response["prediction"].get("probability")

    maintenance_response = get_next_maintenance(vin_hash)
    maintenance = (
        maintenance_response.get("prediction")
        if maintenance_response.get("status") == "ok"
        else None
    )

    # Perfil de cliente usado na experiência e nas comunicações.
    profile_data = {
        "model_name": prediction.get("model"),
        "estimated_monthly_km": _estimate_monthly_km(maintenance),
        "dealer_loyalty_ratio": prediction.get("indicators", {}).get("dealer_loyalty_ratio"),
        "irregular_service_pattern": prediction.get("indicators", {}).get("irregular_service_pattern"),
        "low_dealer_loyalty": prediction.get("indicators", {}).get("low_dealer_loyalty"),
    }
    customer_profile = profile_service.resolve_customer_profile(profile_data)

    # -----------------------------
    # Status de saúde amigável
    # -----------------------------

    risk_level = prediction["risk_level"]

    high_risk = risk_level == "ALTO" or (
        ml_probability is not None and ml_probability >= 0.70
    )

    medium_risk = risk_level == "MÉDIO" or (
        ml_probability is not None and ml_probability >= 0.40
    )

    if high_risk:
        health_status = "revisar"
        health_message = "Seu Ford está pedindo uma revisão. Vamos agendar?"
        health_color = "danger"
    elif medium_risk:
        health_status = "atencao"
        health_message = "Seu Ford está bem, mas fique de olho na próxima revisão."
        health_color = "warning"
    else:
        health_status = "em_dia"
        health_message = "Seu Ford está em dia! Continue assim."
        health_color = "success"

    tips = _translate_reasons_to_tips(prediction.get("reasons", []))

    # -----------------------------
    # Próxima manutenção amigável
    # -----------------------------

    if maintenance:
        next_date = _format_date_br(
            maintenance.get("estimated_next_service_date")
        )

        next_km = maintenance.get("estimated_next_km")

        next_message = (
            f"Prevista para {next_date}" if next_date else "Ainda não temos uma data estimada."
        )

        if next_km:
            next_message += f", em torno de {int(next_km):,} km".replace(",", ".")
    else:
        next_date = None
        next_km = None
        next_message = "Assim que houver mais histórico, mostraremos uma previsão aqui."

    # -----------------------------
    # Perfil amigável (sem "K-Means")
    # -----------------------------

    friendly_profile = {
        "name": customer_profile["name"],
        "description": customer_profile["description"],
    }

    return {
        "status": "ok",
        "vin_hash": vin_hash,
        "summary": {
            "health": {
                "status": health_status,
                "message": health_message,
                "color": health_color,
                "tips": tips,
            },
            "next_maintenance": {
                "date": next_date,
                "km": next_km,
                "message": next_message,
            },
            "profile": friendly_profile,
        },
    }


@app.get("/vehicles/{vin_hash}/profile")
def get_vehicle_profile(vin_hash: str):
    """
    Retorna o perfil de relacionamento do cliente (um dos 6 perfis do
    projeto), já pronto para exibição e para escolha de canal/template
    de notificação.
    """

    connection = get_connection()

    try:
        with connection.cursor() as cursor:
            cursor.execute(
                """
                SELECT
                    model_name,
                    dealer_loyalty_ratio,
                    irregular_service_pattern,
                    low_dealer_loyalty
                FROM vehicles
                WHERE vin_hash = %s;
                """,
                (vin_hash,),
            )

            vehicle = cursor.fetchone()

    finally:
        connection.close()

    if vehicle is None:
        return {
            "status": "not_found",
            "message": "Veículo não encontrado.",
        }

    model_name, dealer_loyalty_ratio, irregular_service_pattern, low_dealer_loyalty = vehicle

    maintenance_response = get_next_maintenance(vin_hash)
    maintenance = (
        maintenance_response.get("prediction")
        if maintenance_response.get("status") == "ok"
        else None
    )

    vehicle_data = {
        "model_name": model_name,
        "estimated_monthly_km": _estimate_monthly_km(maintenance),
        "dealer_loyalty_ratio": dealer_loyalty_ratio,
        "irregular_service_pattern": irregular_service_pattern,
        "low_dealer_loyalty": low_dealer_loyalty,
    }

    profile = profile_service.resolve_customer_profile(vehicle_data)

    return {
        "status": "ok",
        "vin_hash": vin_hash,
        "profile": profile,
    }


@app.get("/vehicles/{vin_hash}/notifications")
def get_vehicle_notifications(vin_hash: str):
    """Retorna a caixa de entrada amigável do app, usando o mesmo perfil
    e canal que alimentam o fluxo de comunicação do n8n."""
    vehicle_response = get_vehicle(vin_hash)
    if vehicle_response.get("status") != "ok":
        return {"status": "not_found", "message": "Veículo não encontrado."}

    vehicle = vehicle_response["vehicle"]
    prediction_response = get_vehicle_prediction(vin_hash)
    prediction = prediction_response.get("prediction", {}) if prediction_response.get("status") == "ok" else {}
    maintenance_response = get_next_maintenance(vin_hash)
    maintenance = maintenance_response.get("prediction") if maintenance_response.get("status") == "ok" else None

    profile_data = {
        "model_name": vehicle.get("model"),
        "estimated_monthly_km": _estimate_monthly_km(maintenance),
        "dealer_loyalty_ratio": prediction.get("indicators", {}).get("dealer_loyalty_ratio"),
        "irregular_service_pattern": prediction.get("indicators", {}).get("irregular_service_pattern"),
        "low_dealer_loyalty": prediction.get("indicators", {}).get("low_dealer_loyalty"),
    }
    profile = profile_service.resolve_customer_profile(profile_data)
    personalized = message_templates.build_message(profile["key"], vehicle.get("model"))

    notifications = [{
        "id": f"profile-{profile['key']}",
        "title": personalized["title"],
        "message": personalized["message"],
        "channel": personalized["channel"],
        "profile": profile["name"],
        "icon": "chatbubble-ellipses-outline",
        "created_at": "agora",
        "unread": True,
        "action": "recommendation",
    }]

    if maintenance:
        date = maintenance.get("estimated_next_service_date")
        notifications.append({
            "id": "next-maintenance",
            "title": "Sua próxima revisão está chegando",
            "message": f"Planejada para {_format_date_br(date)}. Antecipe o agendamento e evite imprevistos.",
            "channel": "whatsapp",
            "profile": profile["name"],
            "icon": "calendar-outline",
            "created_at": "recentemente",
            "unread": True,
            "action": "schedule",
        })

    notifications.append({
        "id": "experience",
        "title": "Sua experiência Ford está personalizada",
        "message": "Acompanhamos seu uso para mostrar apenas lembretes e oportunidades que façam sentido para você.",
        "channel": "email",
        "profile": profile["name"],
        "icon": "sparkles-outline",
        "created_at": "esta semana",
        "unread": False,
        "action": "history",
    })

    return {"status": "ok", "vin_hash": vin_hash, "notifications": notifications}


@app.post("/chatbot/message")
async def chatbot_message(request: ChatMessageRequest):
    """
    Assistente virtual, chamado Zyro, (chatbot com IA) do app. Recebe a mensagem do
    cliente + histórico recente da conversa e responde usando um contexto
    resumido e 100% amigável do veículo (sem termos técnicos internos).
    """

    vehicle_response = get_vehicle(request.vin_hash)

    if vehicle_response.get("status") != "ok":
        raise HTTPException(
            status_code=404,
            detail="Veículo não encontrado.",
        )

    vehicle = vehicle_response["vehicle"]

    summary_response = get_customer_summary(request.vin_hash)

    health_status_hint = "não disponível"
    next_service_hint = "não disponível"

    if summary_response.get("status") == "ok":
        health_status_hint = summary_response["summary"]["health"]["message"]
        next_service_hint = summary_response["summary"]["next_maintenance"]["message"]

    context = {
        "name": "Cliente Ford",
        "model": vehicle.get("model"),
        "year": vehicle.get("year"),
        "health_status": health_status_hint,
        "next_service_hint": next_service_hint,
        "main_dealer": vehicle.get("main_dealer"),
    }

    try:
        reply = await chatbot_service.ask_assistant(
            context,
            request.message,
            request.history,
        )
    except RuntimeError as exc:
        raise HTTPException(status_code=500, detail=str(exc))

    return {
        "status": "ok",
        "reply": reply,
    }


@app.post("/notifications/test")
async def test_notification():
    payload = {
        "vehicle": {
            "year": 2021,
            "model": "RANGER"
        },
        "customer": {
            "email": "sadroom212@gmail.com",
            "name": "Cliente ConnectCare"
        },
        "recommendation": {
            "priority": "ALTA",
            "title": "Agendamento de manutencao",
            "description": "O historico do veiculo indica uma recomendacao de manutencao."
        },
        "prediction": {
            "risk_score": 80,
            "risk_level": "ALTO",
            "ml_probability": 82
        }
    }

    result = await send_recommendation_email(payload)

    return {
        "status": "ok",
        "message": "Notificacao enviada para o n8n.",
        "result": result
    }
    
    
    
    
@app.post("/vehicles/{vin_hash}/recommendations/notify")
async def notify_vehicle_recommendation(
    vin_hash: str,
    request: NotificationRequest
):
    # ---------------------------------
    # 1. Busca as recomendações
    # ---------------------------------

    recommendations_response = get_vehicle_recommendations(vin_hash)

    if recommendations_response.get("status") != "ok":
        raise HTTPException(
            status_code=404,
            detail="Não foi possível encontrar recomendações para este veículo."
        )

    recommendations = recommendations_response.get(
        "recommendations",
        []
    )

    if not recommendations:
        raise HTTPException(
            status_code=404,
            detail="Nenhuma recomendação disponível para este veículo."
        )

    # ---------------------------------
    # 2. Seleciona a recomendação
    #    de maior prioridade
    # ---------------------------------

    priority_order = {
        "HIGH": 1,
        "MEDIUM": 2,
        "LOW": 3
    }

    selected_recommendation = sorted(
        recommendations,
        key=lambda item: priority_order.get(
            item.get("priority"),
            99
        )
    )[0]

    # ---------------------------------
    # 3. Busca a previsão baseada
    #    nas regras de risco
    # ---------------------------------

    prediction_response = get_vehicle_prediction(vin_hash)

    if prediction_response.get("status") == "ok":
        prediction = prediction_response.get(
            "prediction",
            {}
        )
    else:
        prediction = {}

    # ---------------------------------
    # 4. Busca a previsão do
    #    Random Forest
    # ---------------------------------

    ml_prediction_response = get_vehicle_ml_prediction(
        vin_hash
    )

    ml_probability = None

    if ml_prediction_response.get("status") == "ok":
        ml_prediction = ml_prediction_response.get(
            "prediction",
            {}
        )

        ml_probability = ml_prediction.get(
            "probability_percent"
        )

    # ---------------------------------
    # 5. Converte prioridade para
    #    português
    # ---------------------------------

    priority_translation = {
        "HIGH": "ALTA",
        "MEDIUM": "MÉDIA",
        "LOW": "BAIXA"
    }

    priority = priority_translation.get(
        selected_recommendation.get("priority"),
        selected_recommendation.get("priority")
    )

    # ---------------------------------
    # 6. Monta payload para o n8n
    # ---------------------------------

    payload = {
        "vehicle": {
            "year": recommendations_response[
                "vehicle"
            ].get("year"),

            "model": recommendations_response[
                "vehicle"
            ].get("model")
        },

        "customer": {
            "email": request.email,
            "name": request.name
        },

        "recommendation": {
            "priority": priority,

            "title": selected_recommendation.get(
                "title"
            ),

            "description": selected_recommendation.get(
                "description"
            ),

            "action": selected_recommendation.get(
                "action"
            )
        },

        "prediction": {
            "risk_score": prediction.get(
                "risk_score"
            ),

            "risk_level": prediction.get(
                "risk_level"
            ),

            "ml_probability": ml_probability
        }
    }

    # ---------------------------------
    # 7. Envia para o n8n
    # ---------------------------------

    result = await send_recommendation_email(
        payload
    )

    # ---------------------------------
    # 8. Retorno para o aplicativo
    # ---------------------------------

    return {
        "status": "ok",
        "message": "Recomendação enviada para o cliente.",
        "vin_hash": vin_hash,
        "recommendation": payload[
            "recommendation"
        ],
        "notification": result
    }
    
    
@app.post("/vehicles/{vin_hash}/recommendations/auto-notify")
async def auto_notify_vehicle_recommendation(vin_hash: str):
    connection = get_connection()

    try:
        # ---------------------------------
        # 1. Busca o cliente vinculado
        # ---------------------------------

        with connection.cursor() as cursor:
            cursor.execute(
                """
                SELECT
                    customer_id,
                    name,
                    email,
                    vin_hash
                FROM customers
                WHERE vin_hash = %s;
                """,
                (vin_hash,)
            )

            customer = cursor.fetchone()

        if customer is None:
            raise HTTPException(
                status_code=404,
                detail="Nenhum cliente encontrado para este veículo."
            )

        customer_id, customer_name, customer_email, customer_vin = customer

    finally:
        connection.close()

    # ---------------------------------
    # 2. Busca as recomendações
    # ---------------------------------

    recommendations_response = get_vehicle_recommendations(vin_hash)

    if recommendations_response.get("status") != "ok":
        raise HTTPException(
            status_code=404,
            detail="Não foi possível encontrar recomendações para este veículo."
        )

    recommendations = recommendations_response.get(
        "recommendations",
        []
    )

    # ---------------------------------
    # 3. Escolhe a melhor oportunidade
    #    para o perfil do cliente
    # ---------------------------------

    priority_order = {"HIGH": 1, "MEDIUM": 2, "LOW": 3}
    notification_recommendation = None

    # Preferimos manutenção de alta prioridade, mas não bloqueamos a
    # comunicação dos outros perfis quando a melhor oportunidade é outra.
    for recommendation in sorted(
        recommendations,
        key=lambda item: priority_order.get(item.get("priority"), 99),
    ):
        if recommendation.get("type") == "MAINTENANCE" and recommendation.get("priority") == "HIGH":
            notification_recommendation = recommendation
            break

    if notification_recommendation is None:
        notification_recommendation = sorted(
            recommendations,
            key=lambda item: priority_order.get(item.get("priority"), 99),
        )[0]

    # ---------------------------------
    # 4. Se não houver recomendação
    # ---------------------------------

    if notification_recommendation is None:
        return {
            "status": "no_notification",
            "message": (
                "Nenhuma recomendação de manutenção "
                "com prioridade alta foi identificada."
            ),
            "vin_hash": vin_hash,
            "customer": {
                "id": customer_id,
                "name": customer_name,
                "email": customer_email
            }
        }

    recommendation_action = notification_recommendation.get(
        "action"
    )

    # ---------------------------------
    # 5. Verifica histórico
    # ---------------------------------

    connection = get_connection()

    try:
        with connection.cursor() as cursor:

            # ---------------------------------
            # 5.1 Já confirmou anteriormente?
            # ---------------------------------

            cursor.execute(
                """
                SELECT
                    notification_id,
                    sent_at,
                    confirmed_at
                FROM notification_history
                WHERE vin_hash = %s
                  AND customer_id = %s
                  AND recommendation_action = %s
                  AND status = 'CONFIRMED'
                ORDER BY confirmed_at DESC
                LIMIT 1;
                """,
                (
                    vin_hash,
                    customer_id,
                    recommendation_action
                )
            )

            confirmed_notification = cursor.fetchone()

            if confirmed_notification is not None:
                (
                    notification_id,
                    sent_at,
                    confirmed_at
                ) = confirmed_notification

                return {
                    "status": "already_confirmed",
                    "message": (
                        "O cliente já confirmou esta recomendação. "
                        "Nenhuma nova notificação será enviada."
                    ),
                    "vin_hash": vin_hash,
                    "customer": {
                        "id": customer_id,
                        "name": customer_name,
                        "email": customer_email
                    },
                    "recommendation": {
                        "title": notification_recommendation.get(
                            "title"
                        ),
                        "action": recommendation_action
                    },
                    "confirmation": {
                        "notification_id": notification_id,
                        "sent_at": sent_at,
                        "confirmed_at": confirmed_at
                    }
                }

            # ---------------------------------
            # 5.2 Já enviou hoje?
            # ---------------------------------

            cursor.execute(
                """
                SELECT
                    notification_id,
                    sent_at,
                    status
                FROM notification_history
                WHERE vin_hash = %s
                  AND customer_id = %s
                  AND recommendation_action = %s
                  AND status = 'SENT'
                  AND sent_at::date = CURRENT_DATE
                ORDER BY sent_at DESC
                LIMIT 1;
                """,
                (
                    vin_hash,
                    customer_id,
                    recommendation_action
                )
            )

            sent_today = cursor.fetchone()

    finally:
        connection.close()

    # ---------------------------------
    # 6. Se já enviou hoje
    # ---------------------------------

    if sent_today is not None:
        notification_id, sent_at, status = sent_today

        return {
            "status": "already_sent_today",
            "message": (
                "A recomendação já foi enviada hoje. "
                "Uma nova tentativa poderá ocorrer amanhã "
                "caso o cliente ainda não tenha confirmado."
            ),
            "vin_hash": vin_hash,
            "customer": {
                "id": customer_id,
                "name": customer_name,
                "email": customer_email
            },
            "recommendation": {
                "title": notification_recommendation.get(
                    "title"
                ),
                "action": recommendation_action
            },
            "previous_notification": {
                "notification_id": notification_id,
                "sent_at": sent_at,
                "status": status
            }
        }

    # ---------------------------------
    # 7. Busca previsão baseada em regras
    # ---------------------------------

    prediction_response = get_vehicle_prediction(
        vin_hash
    )

    prediction = (
        prediction_response.get("prediction", {})
        if prediction_response.get("status") == "ok"
        else {}
    )

    # ---------------------------------
    # 8. Busca previsão Random Forest
    # ---------------------------------

    ml_prediction_response = get_vehicle_ml_prediction(
        vin_hash
    )

    ml_probability = None

    if ml_prediction_response.get("status") == "ok":
        ml_prediction = ml_prediction_response.get(
            "prediction",
            {}
        )

        ml_probability = ml_prediction.get(
            "probability_percent"
        )

    # ---------------------------------
    # 9. Cria registro PENDING
    #    antes de enviar o e-mail
    # ---------------------------------

    connection = get_connection()

    try:
        with connection.cursor() as cursor:
            cursor.execute(
                """
                INSERT INTO notification_history (
                    vin_hash,
                    customer_id,
                    recommendation_action,
                    status
                )
                VALUES (%s, %s, %s, 'PENDING')
                RETURNING notification_id, sent_at;
                """,
                (
                    vin_hash,
                    customer_id,
                    recommendation_action
                )
            )

            notification_record = cursor.fetchone()

        connection.commit()

    finally:
        connection.close()

    notification_id, created_at = notification_record

    # ---------------------------------
    # 10. Monta link de confirmação
    # ---------------------------------

    confirmation_url = (
        f"https://17b6-2804-7f0c-a642-d3f-167d-8c16-cd8b.ngrok-free.app"
        f"/notifications/{notification_id}/confirm"
    )

    # ---------------------------------
    # 11. Resolve o perfil do cliente e
    #     monta a mensagem no tom certo
    #     (perfil -> canal + template)
    # ---------------------------------

    vehicle_model = recommendations_response["vehicle"].get("model")

    profile_data = {
        "model_name": vehicle_model,
        "estimated_monthly_km": _estimate_monthly_km(prediction_response.get("prediction"))
        if prediction_response.get("status") == "ok"
        else None,
        "dealer_loyalty_ratio": prediction.get("indicators", {}).get(
            "dealer_loyalty_ratio"
        ),
        "irregular_service_pattern": prediction.get("indicators", {}).get(
            "irregular_service_pattern"
        ),
        "low_dealer_loyalty": prediction.get("indicators", {}).get(
            "low_dealer_loyalty"
        ),
    }

    customer_profile = profile_service.resolve_customer_profile(profile_data)

    personalized_message = message_templates.build_message(
        customer_profile["key"], vehicle_model
    )

    # ---------------------------------
    # 12. Monta payload para o n8n
    # ---------------------------------

    payload = {
        "vehicle": {
            "year": recommendations_response[
                "vehicle"
            ].get("year"),

            "model": vehicle_model
        },

        "customer": {
            "email": customer_email,
            "name": customer_name
        },

        "profile": customer_profile,

        "recommendation": {
            "priority": "ALTA",

            "title": personalized_message["title"],

            "description": personalized_message["message"],

            "action": recommendation_action
        },

        "prediction": {
            "risk_score": prediction.get(
                "risk_score"
            ),

            "risk_level": prediction.get(
                "risk_level"
            ),

            "ml_probability": ml_probability
        },

        # ---------------------------------
        # NOVO
        # ---------------------------------
        "notification": {
            "notification_id": notification_id,
            "confirmation_url": confirmation_url
        }
    }

    # ---------------------------------
    # 13. Envia pelo canal ideal do
    #     perfil do cliente (WhatsApp,
    #     SMS ou E-mail)
    # ---------------------------------

    result = await send_customer_notification(
        payload,
        channel=personalized_message["channel"],
    )

    # ---------------------------------
    # 14. Atualiza PENDING → SENT
    # ---------------------------------

    if result.get("status") == "ok":

        connection = get_connection()

        try:
            with connection.cursor() as cursor:
                cursor.execute(
                    """
                    UPDATE notification_history
                    SET status = 'SENT',
                        sent_at = CURRENT_TIMESTAMP
                    WHERE notification_id = %s;
                    """,
                    (notification_id,)
                )

            connection.commit()

        finally:
            connection.close()

        return {
            "status": "notification_sent",
            "message": (
                "A recomendação de manutenção foi enviada "
                "automaticamente para o cliente."
            ),
            "vin_hash": vin_hash,

            "customer": {
                "id": customer_id,
                "name": customer_name,
                "email": customer_email
            },

            "recommendation": payload[
                "recommendation"
            ],

            "notification": {
                **result,
                "notification_id": notification_id,
                "confirmation_url": confirmation_url,
                "status": "SENT"
            }
        }

    # ---------------------------------
    # 14. Se o n8n falhar, remove
    #     o registro PENDING
    # ---------------------------------

    connection = get_connection()

    try:
        with connection.cursor() as cursor:
            cursor.execute(
                """
                DELETE FROM notification_history
                WHERE notification_id = %s;
                """,
                (notification_id,)
            )

        connection.commit()

    finally:
        connection.close()

    raise HTTPException(
        status_code=502,
        detail="Não foi possível enviar a notificação pelo n8n."
    )
# ---------------------------------
# CONFIRMAÇÃO DA NOTIFICAÇÃO
# ---------------------------------

@app.get("/notifications/{notification_id}/confirm")
async def confirm_notification_from_email(
    notification_id: int
):
    connection = get_connection()

    try:
        with connection.cursor() as cursor:
            cursor.execute(
                """
                SELECT
                    notification_id,
                    status
                FROM notification_history
                WHERE notification_id = %s;
                """,
                (notification_id,)
            )

            notification = cursor.fetchone()

            if notification is None:
                raise HTTPException(
                    status_code=404,
                    detail="Notificação não encontrada."
                )

            current_id, status = notification

            if status == "CONFIRMED":
                return {
                    "status": "already_confirmed",
                    "message": "Esta recomendação já foi confirmada."
                }

            cursor.execute(
                """
                UPDATE notification_history
                SET
                    status = 'CONFIRMED',
                    confirmed_at = CURRENT_TIMESTAMP
                WHERE notification_id = %s;
                """,
                (notification_id,)
            )

        connection.commit()

        return dict(
            status="confirmed",
            message=(
                "Recomendação confirmada com sucesso. "
                "Você não receberá novas notificações "
                "sobre esta recomendação."
            ),
            notification_id=notification_id,
        )

    finally:
        connection.close()


# ---------------------------------
# AUTOMAÇÃO EM LOTE (rodar 1x por dia)
# ---------------------------------

@app.post("/automation/run-daily")
async def run_daily_automation(limit: int = 200):
    """Avalia automaticamente os clientes e dispara comunicações elegíveis.

    O n8n pode chamar esta rota diariamente com um Schedule Trigger.
    O backend mantém as regras, preferências e deduplicação.
    """
    connection = get_connection()
    try:
        with connection.cursor() as cursor:
            cursor.execute("""
                SELECT customer_id
                FROM customers
                WHERE vin_hash IS NOT NULL
                ORDER BY customer_id
                LIMIT %s;
            """, (limit,))
            customer_ids = [row[0] for row in cursor.fetchall()]
    finally:
        connection.close()

    results = []
    for customer_id in customer_ids:
        try:
            outcome = await evaluate_engagement_customer(customer_id)
            results.append({
                "customer_id": customer_id,
                "status": outcome["status"],
                "should_send": outcome["decision"]["should_send"],
                "delivery_status": outcome["decision"]["delivery_status"],
                "channel": outcome["decision"]["channel"],
                "priority": outcome["decision"]["priority"],
            })
        except HTTPException as exc:
            results.append({"customer_id": customer_id, "status": "error", "detail": exc.detail})
        except Exception as exc:  # noqa: BLE001
            results.append({"customer_id": customer_id, "status": "error", "detail": str(exc)})

    summary: dict[str, int] = {}
    for item in results:
        key = item["delivery_status"] if item["status"] == "ok" else "error"
        summary[key] = summary.get(key, 0) + 1

    return {"status": "ok", "total_processed": len(results), "summary": summary, "results": results}
