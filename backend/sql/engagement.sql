-- Execute manually if desired. The backend also creates/migrates these tables automatically.

CREATE TABLE IF NOT EXISTS customer_preferences (
    customer_id INTEGER PRIMARY KEY,
    news_channel VARCHAR(20) NOT NULL DEFAULT 'email',
    alert_channel VARCHAR(20) NOT NULL DEFAULT 'whatsapp',
    recommendation_channel VARCHAR(20) NOT NULL DEFAULT 'email',
    news_whatsapp BOOLEAN NOT NULL DEFAULT FALSE,
    news_email BOOLEAN NOT NULL DEFAULT TRUE,
    alert_whatsapp BOOLEAN NOT NULL DEFAULT TRUE,
    alert_email BOOLEAN NOT NULL DEFAULT FALSE,
    recommendation_whatsapp BOOLEAN NOT NULL DEFAULT FALSE,
    recommendation_email BOOLEAN NOT NULL DEFAULT TRUE,
    allow_news BOOLEAN NOT NULL DEFAULT TRUE,
    allow_alerts BOOLEAN NOT NULL DEFAULT TRUE,
    allow_recommendations BOOLEAN NOT NULL DEFAULT TRUE,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

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

ALTER TABLE customer_preferences ADD COLUMN IF NOT EXISTS news_whatsapp BOOLEAN NOT NULL DEFAULT FALSE;
ALTER TABLE customer_preferences ADD COLUMN IF NOT EXISTS news_email BOOLEAN NOT NULL DEFAULT TRUE;
ALTER TABLE customer_preferences ADD COLUMN IF NOT EXISTS alert_whatsapp BOOLEAN NOT NULL DEFAULT TRUE;
ALTER TABLE customer_preferences ADD COLUMN IF NOT EXISTS alert_email BOOLEAN NOT NULL DEFAULT FALSE;
ALTER TABLE customer_preferences ADD COLUMN IF NOT EXISTS recommendation_whatsapp BOOLEAN NOT NULL DEFAULT FALSE;
ALTER TABLE customer_preferences ADD COLUMN IF NOT EXISTS recommendation_email BOOLEAN NOT NULL DEFAULT TRUE;

-- Compatibility migration for records created by the previous single-channel version.
UPDATE customer_preferences SET alert_whatsapp = TRUE, alert_email = FALSE WHERE alert_channel = 'whatsapp';
UPDATE customer_preferences SET alert_whatsapp = FALSE, alert_email = TRUE WHERE alert_channel = 'email';
UPDATE customer_preferences SET news_whatsapp = TRUE, news_email = FALSE WHERE news_channel = 'whatsapp';
UPDATE customer_preferences SET news_whatsapp = FALSE, news_email = TRUE WHERE news_channel = 'email';
UPDATE customer_preferences SET recommendation_whatsapp = TRUE, recommendation_email = FALSE WHERE recommendation_channel = 'whatsapp';
UPDATE customer_preferences SET recommendation_whatsapp = FALSE, recommendation_email = TRUE WHERE recommendation_channel = 'email';

CREATE INDEX IF NOT EXISTS idx_engagement_customer
ON engagement_decisions(customer_id, created_at DESC);
