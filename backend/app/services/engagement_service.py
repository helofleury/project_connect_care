import json
import os
from datetime import datetime, timezone
from typing import Any

import httpx
from fastapi import HTTPException

from app.database import get_connection
from app.services.notification_service import send_customer_notification

GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")
GEMINI_MODEL = os.getenv("GEMINI_MODEL", "gemini-2.5-flash")

ENGAGEMENT_SYSTEM_PROMPT = """
Você é o agente de Engagement do ConnectCare 360.
Sua função é escrever uma mensagem curta, clara e amigável para um cliente de veículo.
A prioridade, os canais e a decisão de envio já foram definidos pelo backend.
NÃO altere essas decisões e NÃO invente dados.
Retorne SOMENTE JSON válido no formato:
{"title":"...","message":"..."}
"""

CHANNELS = {"whatsapp", "email"}


def _ensure_tables() -> None:
    connection = get_connection()
    try:
        with connection.cursor() as cursor:
            cursor.execute("""
                CREATE TABLE IF NOT EXISTS customer_preferences (
                    customer_id INTEGER PRIMARY KEY,
                    news_channel VARCHAR(20) NOT NULL DEFAULT 'email',
                    alert_channel VARCHAR(20) NOT NULL DEFAULT 'whatsapp',
                    recommendation_channel VARCHAR(20) NOT NULL DEFAULT 'email',
                    allow_news BOOLEAN NOT NULL DEFAULT TRUE,
                    allow_alerts BOOLEAN NOT NULL DEFAULT TRUE,
                    allow_recommendations BOOLEAN NOT NULL DEFAULT TRUE,
                    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
                );
            """)
            # New multi-channel fields. The old *_channel fields stay for backward
            # compatibility with databases created by an earlier project version.
            cursor.execute("ALTER TABLE customer_preferences ADD COLUMN IF NOT EXISTS news_whatsapp BOOLEAN NOT NULL DEFAULT FALSE;")
            cursor.execute("ALTER TABLE customer_preferences ADD COLUMN IF NOT EXISTS news_email BOOLEAN NOT NULL DEFAULT TRUE;")
            cursor.execute("ALTER TABLE customer_preferences ADD COLUMN IF NOT EXISTS alert_whatsapp BOOLEAN NOT NULL DEFAULT TRUE;")
            cursor.execute("ALTER TABLE customer_preferences ADD COLUMN IF NOT EXISTS alert_email BOOLEAN NOT NULL DEFAULT FALSE;")
            cursor.execute("ALTER TABLE customer_preferences ADD COLUMN IF NOT EXISTS recommendation_whatsapp BOOLEAN NOT NULL DEFAULT FALSE;")
            cursor.execute("ALTER TABLE customer_preferences ADD COLUMN IF NOT EXISTS recommendation_email BOOLEAN NOT NULL DEFAULT TRUE;")

            # Migrate records from the previous single-channel schema.
            cursor.execute("UPDATE customer_preferences SET news_whatsapp = TRUE, news_email = FALSE WHERE news_channel = 'whatsapp';")
            cursor.execute("UPDATE customer_preferences SET news_whatsapp = FALSE, news_email = TRUE WHERE news_channel = 'email';")
            cursor.execute("UPDATE customer_preferences SET alert_whatsapp = TRUE, alert_email = FALSE WHERE alert_channel = 'whatsapp';")
            cursor.execute("UPDATE customer_preferences SET alert_whatsapp = FALSE, alert_email = TRUE WHERE alert_channel = 'email';")
            cursor.execute("UPDATE customer_preferences SET recommendation_whatsapp = TRUE, recommendation_email = FALSE WHERE recommendation_channel = 'whatsapp';")
            cursor.execute("UPDATE customer_preferences SET recommendation_whatsapp = FALSE, recommendation_email = TRUE WHERE recommendation_channel = 'email';")

            cursor.execute("""
                CREATE TABLE IF NOT EXISTS engagement_decisions (
                    decision_id BIGSERIAL PRIMARY KEY,
                    customer_id INTEGER NOT NULL,
                    vin_hash VARCHAR(255),
                    should_send BOOLEAN NOT NULL,
                    priority VARCHAR(20) NOT NULL,
                    channel VARCHAR(30) NOT NULL,
                    title TEXT NOT NULL,
                    message TEXT NOT NULL,
                    reason TEXT NOT NULL,
                    engagement_type VARCHAR(40) NOT NULL DEFAULT 'vehicle_alert',
                    delivery_status VARCHAR(30) NOT NULL DEFAULT 'not_sent',
                    delivery_error TEXT,
                    sent_at TIMESTAMPTZ,
                    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
                );
                CREATE INDEX IF NOT EXISTS idx_engagement_customer
                ON engagement_decisions(customer_id, created_at DESC);
            """)
            cursor.execute("ALTER TABLE engagement_decisions ADD COLUMN IF NOT EXISTS engagement_type VARCHAR(40) NOT NULL DEFAULT 'vehicle_alert';")
            cursor.execute("ALTER TABLE engagement_decisions ADD COLUMN IF NOT EXISTS delivery_status VARCHAR(30) NOT NULL DEFAULT 'not_sent';")
            cursor.execute("ALTER TABLE engagement_decisions ADD COLUMN IF NOT EXISTS delivery_error TEXT;")
            cursor.execute("ALTER TABLE engagement_decisions ADD COLUMN IF NOT EXISTS sent_at TIMESTAMPTZ;")
    finally:
        connection.commit()
        connection.close()


def _available_channels(context: dict[str, Any]) -> list[str]:
    channels: list[str] = []
    if context.get("phone"):
        channels.append("whatsapp")
    if context.get("email"):
        channels.append("email")
    return channels


def _channels_from_row(
    whatsapp: bool,
    email: bool,
    context: dict[str, Any],
    fallback: str | None,
) -> list[str]:
    channels: list[str] = []
    if whatsapp and context.get("phone"):
        channels.append("whatsapp")
    if email and context.get("email"):
        channels.append("email")

    # Migrate an older record that only has *_channel populated.
    if not channels and fallback in CHANNELS and fallback in _available_channels(context):
        channels.append(fallback)
    return channels


def _get_preferences(customer_id: int, context: dict[str, Any]) -> dict[str, Any]:
    connection = get_connection()
    try:
        with connection.cursor() as cursor:
            cursor.execute("""
                SELECT news_channel, alert_channel, recommendation_channel,
                       allow_news, allow_alerts, allow_recommendations,
                       news_whatsapp, news_email,
                       alert_whatsapp, alert_email,
                       recommendation_whatsapp, recommendation_email
                FROM customer_preferences
                WHERE customer_id = %s;
            """, (customer_id,))
            row = cursor.fetchone()
            if row is None:
                return {
                    "news_channels": ["email"] if context.get("email") else [],
                    "alert_channels": ["whatsapp"] if context.get("phone") else (["email"] if context.get("email") else []),
                    "recommendation_channels": ["email"] if context.get("email") else [],
                    "allow_news": True,
                    "allow_alerts": True,
                    "allow_recommendations": True,
                }

            return {
                "news_channels": _channels_from_row(bool(row[6]), bool(row[7]), context, row[0]),
                "alert_channels": _channels_from_row(bool(row[8]), bool(row[9]), context, row[1]),
                "recommendation_channels": _channels_from_row(bool(row[10]), bool(row[11]), context, row[2]),
                "allow_news": bool(row[3]),
                "allow_alerts": bool(row[4]),
                "allow_recommendations": bool(row[5]),
            }
    finally:
        connection.close()


def _validate_channels(channels: list[str], field: str, context: dict[str, Any]) -> None:
    if not isinstance(channels, list):
        raise HTTPException(status_code=400, detail=f"{field} deve ser uma lista de canais.")
    if any(channel not in CHANNELS for channel in channels):
        raise HTTPException(status_code=400, detail=f"Canal inválido em {field}.")
    if "whatsapp" in channels and not context.get("phone"):
        raise HTTPException(status_code=400, detail="WhatsApp selecionado, mas o cliente não possui telefone cadastrado.")
    if "email" in channels and not context.get("email"):
        raise HTTPException(status_code=400, detail="E-mail selecionado, mas o cliente não possui e-mail cadastrado.")


def save_preferences(customer_id: int, preferences: dict[str, Any]) -> dict[str, Any]:
    _ensure_tables()
    context = _fetch_context(customer_id)

    for field in ("news_channels", "alert_channels", "recommendation_channels"):
        _validate_channels(preferences[field], field, context)

    connection = get_connection()
    try:
        with connection.cursor() as cursor:
            cursor.execute("""
                INSERT INTO customer_preferences
                    (customer_id,
                     news_channel, alert_channel, recommendation_channel,
                     news_whatsapp, news_email,
                     alert_whatsapp, alert_email,
                     recommendation_whatsapp, recommendation_email,
                     allow_news, allow_alerts, allow_recommendations, updated_at)
                VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, NOW())
                ON CONFLICT (customer_id) DO UPDATE SET
                    news_channel = EXCLUDED.news_channel,
                    alert_channel = EXCLUDED.alert_channel,
                    recommendation_channel = EXCLUDED.recommendation_channel,
                    news_whatsapp = EXCLUDED.news_whatsapp,
                    news_email = EXCLUDED.news_email,
                    alert_whatsapp = EXCLUDED.alert_whatsapp,
                    alert_email = EXCLUDED.alert_email,
                    recommendation_whatsapp = EXCLUDED.recommendation_whatsapp,
                    recommendation_email = EXCLUDED.recommendation_email,
                    allow_news = EXCLUDED.allow_news,
                    allow_alerts = EXCLUDED.allow_alerts,
                    allow_recommendations = EXCLUDED.allow_recommendations,
                    updated_at = NOW();
            """, (
                customer_id,
                "+".join(sorted(set(preferences["news_channels"]))) or "none",
                "+".join(sorted(set(preferences["alert_channels"]))) or "none",
                "+".join(sorted(set(preferences["recommendation_channels"]))) or "none",
                "whatsapp" in preferences["news_channels"],
                "email" in preferences["news_channels"],
                "whatsapp" in preferences["alert_channels"],
                "email" in preferences["alert_channels"],
                "whatsapp" in preferences["recommendation_channels"],
                "email" in preferences["recommendation_channels"],
                preferences["allow_news"],
                preferences["allow_alerts"],
                preferences["allow_recommendations"],
            ))
        connection.commit()
    finally:
        connection.close()
    return get_preferences(customer_id)


def get_preferences(customer_id: int) -> dict[str, Any]:
    _ensure_tables()
    context = _fetch_context(customer_id)
    return _get_preferences(customer_id, context)


def _fetch_context(customer_id: int) -> dict[str, Any]:
    connection = get_connection()
    try:
        with connection.cursor() as cursor:
            cursor.execute("""
                SELECT c.customer_id, c.name, c.last_name, c.email, c.phone, c.vin_hash,
                       v.model_name, v.model_year, v.service_count, v.days_since_last_service,
                       v.high_recency_risk, v.low_dealer_loyalty, v.irregular_service_pattern,
                       v.km_regression_count, v.last_km, mp.probability, mp.predicted_class
                FROM customers c
                LEFT JOIN vehicles v ON v.vin_hash = c.vin_hash
                LEFT JOIN LATERAL (
                    SELECT probability, predicted_class
                    FROM ml_predictions
                    WHERE vin_hash = c.vin_hash
                    ORDER BY model_version DESC NULLS LAST
                    LIMIT 1
                ) mp ON TRUE
                WHERE c.customer_id = %s;
            """, (customer_id,))
            row = cursor.fetchone()
        if not row:
            raise HTTPException(status_code=404, detail="Cliente não encontrado.")

        (
            db_customer_id, name, last_name, email, phone, vin_hash,
            model_name, model_year, service_count, days_since_last_service,
            high_recency_risk, low_dealer_loyalty, irregular_service_pattern,
            km_regression_count, last_km, probability, predicted_class,
        ) = row

        return {
            "customer_id": db_customer_id,
            "name": name or "Cliente",
            "last_name": last_name or "",
            "email": email,
            "phone": phone,
            "vin_hash": vin_hash,
            "vehicle": {
                "model": model_name,
                "year": model_year,
                "service_count": service_count,
                "days_since_last_service": days_since_last_service,
                "high_recency_risk": bool(high_recency_risk),
                "low_dealer_loyalty": bool(low_dealer_loyalty),
                "irregular_service_pattern": bool(irregular_service_pattern),
                "km_regression_count": km_regression_count,
                "last_km": float(last_km) if last_km is not None else None,
            },
            "prediction": {
                "probability": float(probability) if probability is not None else None,
                "predicted_class": predicted_class,
            },
        }
    finally:
        connection.close()


def _calculate_decision(context: dict[str, Any], preferences: dict[str, Any]) -> dict[str, Any]:
    vehicle = context["vehicle"]
    prediction = context["prediction"]
    reasons: list[str] = []
    priority = "LOW"

    probability = prediction.get("probability")
    if probability is not None and probability >= 0.70:
        priority = "HIGH"
        reasons.append("A previsão de ML indica risco alto.")

    if vehicle.get("high_recency_risk") or (
        vehicle.get("days_since_last_service") is not None
        and vehicle["days_since_last_service"] > 365
    ):
        priority = "HIGH"
        reasons.append("O histórico indica necessidade de atenção à manutenção.")

    if priority != "HIGH":
        if vehicle.get("low_dealer_loyalty"):
            priority = "MEDIUM"
            reasons.append("O histórico indica baixa concentração de serviços em uma concessionária.")
        if vehicle.get("irregular_service_pattern"):
            priority = "MEDIUM"
            reasons.append("O histórico apresenta padrão irregular de manutenção.")
        if vehicle.get("service_count") is not None and vehicle["service_count"] >= 5:
            priority = "MEDIUM"
            reasons.append("O histórico possui registros suficientes para acompanhamento preventivo.")

    if not reasons:
        reasons.append("Não foram identificados sinais que exijam comunicação prioritária.")

    channels = sorted(set(preferences["alert_channels"]))
    should_send = priority in {"HIGH", "MEDIUM"} and preferences["allow_alerts"] and bool(channels)

    if not preferences["allow_alerts"]:
        reasons.append("O cliente desativou alertas nas preferências de comunicação.")
    elif not channels:
        reasons.append("O cliente não selecionou nenhum canal para receber alertas.")
    elif len(channels) == 2:
        reasons.append("O cliente autorizou o envio por WhatsApp e e-mail.")
    else:
        reasons.append(f"O cliente autorizou o envio por {channels[0]}.")

    return {
        "should_send": should_send,
        "priority": priority,
        "channels": channels,
        "channel": "+".join(channels) if channels else "none",
        "reason": " ".join(reasons),
    }


def _fallback_message(context: dict[str, Any], decision: dict[str, Any]) -> dict[str, str]:
    name = context.get("name") or "Cliente"
    model = context.get("vehicle", {}).get("model") or "seu veículo"
    if decision["priority"] == "HIGH":
        return {"title": "Seu veículo merece atenção", "message": f"Olá, {name}! Identificamos um ponto de atenção no seu {model}. Recomendamos verificar a manutenção para evitar imprevistos."}
    if decision["priority"] == "MEDIUM":
        return {"title": "Um lembrete para você", "message": f"Olá, {name}! Temos uma recomendação de acompanhamento para o seu {model}. Confira os próximos cuidados no ConnectCare 360."}
    return {"title": "Tudo sob controle", "message": f"Olá, {name}! No momento, não identificamos nenhuma ação prioritária para o seu {model}. Continue acompanhando seu veículo pelo ConnectCare 360."}


async def _generate_message(context: dict[str, Any], decision: dict[str, Any]) -> dict[str, str]:
    fallback = _fallback_message(context, decision)
    if not GEMINI_API_KEY:
        return fallback

    payload = {
        "system_instruction": {"parts": [{"text": ENGAGEMENT_SYSTEM_PROMPT}]},
        "contents": [{"role": "user", "parts": [{"text": json.dumps({
            "customer": {"name": context["name"]},
            "vehicle": context["vehicle"],
            "prediction": context["prediction"],
            "decision": decision,
        }, ensure_ascii=False)}]}],
        "generationConfig": {"temperature": 0.1, "responseMimeType": "application/json"},
    }
    url = f"https://generativelanguage.googleapis.com/v1beta/models/{GEMINI_MODEL}:generateContent"
    try:
        async with httpx.AsyncClient(timeout=20) as client:
            response = await client.post(url, params={"key": GEMINI_API_KEY}, json=payload)
            response.raise_for_status()
            data = response.json()
            text = data["candidates"][0]["content"]["parts"][0]["text"]
            generated = json.loads(text)
            title = generated.get("title")
            message = generated.get("message")
            if isinstance(title, str) and isinstance(message, str) and title.strip() and message.strip():
                return {"title": title.strip(), "message": message.strip()}
    except Exception:
        pass
    return fallback


def _already_sent_today(customer_id: int, priority: str, channels: list[str]) -> bool:
    channel_key = "+".join(sorted(channels)) if channels else "none"
    connection = get_connection()
    try:
        with connection.cursor() as cursor:
            cursor.execute("""
                SELECT 1
                FROM engagement_decisions
                WHERE customer_id = %s
                  AND engagement_type = 'vehicle_alert'
                  AND should_send = TRUE
                  AND delivery_status IN ('sent', 'partial')
                  AND priority = %s
                  AND channel = %s
                  AND created_at::date = CURRENT_DATE
                LIMIT 1;
            """, (customer_id, priority, channel_key))
            return cursor.fetchone() is not None
    finally:
        connection.close()


def _save_decision(
    context: dict[str, Any], decision: dict[str, Any], message: dict[str, str],
    delivery_status: str, delivery_error: str | None = None,
    sent_at: str | None = None,
) -> dict[str, Any]:
    connection = get_connection()
    try:
        with connection.cursor() as cursor:
            cursor.execute("""
                INSERT INTO engagement_decisions
                    (customer_id, vin_hash, should_send, priority, channel, title, message,
                     reason, engagement_type, delivery_status, delivery_error, sent_at)
                VALUES (%s, %s, %s, %s, %s, %s, %s, %s, 'vehicle_alert', %s, %s, %s)
                RETURNING decision_id, created_at;
            """, (
                context["customer_id"], context.get("vin_hash"), decision["should_send"],
                decision["priority"], decision["channel"], message["title"], message["message"],
                decision["reason"], delivery_status, delivery_error, sent_at,
            ))
            decision_id, created_at = cursor.fetchone()
        connection.commit()
        return {
            "decision_id": decision_id,
            "created_at": created_at.isoformat() if created_at else datetime.now(timezone.utc).isoformat(),
        }
    finally:
        connection.close()


async def evaluate(customer_id: int) -> dict[str, Any]:
    _ensure_tables()
    context = _fetch_context(customer_id)
    preferences = _get_preferences(customer_id, context)
    decision = _calculate_decision(context, preferences)

    if decision["should_send"] and _already_sent_today(customer_id, decision["priority"], decision["channels"]):
        decision["should_send"] = False
        decision["reason"] += " Uma comunicação equivalente já foi enviada hoje."

    message = await _generate_message(context, decision)
    delivery_status = "not_sent"
    delivery_error = None
    sent_at = None

    if decision["should_send"]:
        payload = {
            "event": "connectcare.engagement",
            "event_version": "1.0",
            "customer": {
                "customer_id": context["customer_id"],
                "name": context["name"],
                "last_name": context.get("last_name"),
                "email": context.get("email"),
                "phone": context.get("phone"),
            },
            "recipient": {
                "channels": decision["channels"],
                "whatsapp": context.get("phone"),
                "email": context.get("email"),
            },
            "vehicle": context["vehicle"],
            "prediction": context["prediction"],
            "content": {
                "subject": message["title"],
                "body": message["message"],
            },
            "engagement": {
                "type": "vehicle_alert",
                "priority": decision["priority"],
                "should_send": decision["should_send"],
                "channels": decision["channels"],
                "reason": decision["reason"],
            },
        }

        results: list[str] = []
        errors: list[str] = []
        for channel in decision["channels"]:
            try:
                result = await send_customer_notification(payload, channel)
                if result.get("status") == "ok":
                    results.append(channel)
                else:
                    errors.append(f"{channel}: resposta de envio inválida")
            except Exception as exc:  # noqa: BLE001
                errors.append(f"{channel}: {exc}")

        if results and not errors:
            delivery_status = "sent"
            sent_at = datetime.now(timezone.utc).isoformat()
        elif results and errors:
            delivery_status = "partial"
            delivery_error = "; ".join(errors)
            sent_at = datetime.now(timezone.utc).isoformat()
        elif errors:
            delivery_status = "not_configured"
            delivery_error = "; ".join(errors)

    saved = _save_decision(context, decision, message, delivery_status, delivery_error, sent_at)
    return {
        "status": "ok",
        "customer": {"customer_id": context["customer_id"], "name": context["name"]},
        "vehicle": context["vehicle"],
        "prediction": context["prediction"],
        "preferences": preferences,
        "decision": {**decision, **message, **saved, "delivery_status": delivery_status},
        "ai_enabled": bool(GEMINI_API_KEY),
    }


def get_history(customer_id: int) -> list[dict[str, Any]]:
    _ensure_tables()
    connection = get_connection()
    try:
        with connection.cursor() as cursor:
            cursor.execute("""
                SELECT decision_id, should_send, priority, channel, title, message, reason,
                       delivery_status, created_at
                FROM engagement_decisions
                WHERE customer_id = %s
                ORDER BY created_at DESC
                LIMIT 20;
            """, (customer_id,))
            rows = cursor.fetchall()
        return [{
            "decision_id": row[0], "should_send": row[1], "priority": row[2], "channel": row[3],
            "title": row[4], "message": row[5], "reason": row[6], "delivery_status": row[7],
            "created_at": row[8].isoformat() if row[8] else None,
        } for row in rows]
    finally:
        connection.close()
