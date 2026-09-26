"""Mensagens finais e canais da comunicação personalizada por perfil."""

TEMPLATES = {
    "urbano_leve": {
        "channel": "whatsapp",
        "title": "Uma revisão preventiva para o seu {model}",
        "message": "Evite gastos maiores mantendo seu Ford em dia. Uma revisão preventiva agora ajuda a cuidar do seu veículo com tranquilidade.",
    },
    "motorista_aplicativo": {
        "channel": "whatsapp",
        "title": "Seu Ford precisa estar sempre disponível",
        "message": "Seu Ford precisa estar sempre disponível — agende uma revisão rápida e mantenha sua rotina de trabalho rodando.",
    },
    "usuario_offroad": {
        "channel": "email",
        "title": "Seu {model} está pronto para qualquer terreno",
        "message": "Seu Ford está pronto para qualquer terreno — confira a inspeção preventiva e as recomendações para o seu próximo trajeto.",
    },
    "premium_baixa_km": {
        "channel": "email",
        "title": "Cuidado premium para o seu {model}",
        "message": "Seu {model} merece cuidado premium. Veja o relatório de saúde e conheça acessórios exclusivos para personalizar sua experiência.",
    },
    "cliente_economico": {
        "channel": "sms",
        "title": "Oferta especial para o seu Ford",
        "message": "Revisão com 20% de desconto até sexta-feira. Agende agora e aproveite a condição especial.",
    },
    "profissional_autonomo": {
        "channel": "whatsapp",
        "title": "Mantenha seu Ford rodando sem parar",
        "message": "Agende uma revisão rápida e confira peças de desgaste para manter seu Ford rodando sem parar.",
    },
}

DEFAULT_PROFILE_KEY = "urbano_leve"


def build_message(profile_key: str, model_name: str) -> dict:
    template = TEMPLATES.get(profile_key, TEMPLATES[DEFAULT_PROFILE_KEY])
    friendly_model = model_name or "Ford"
    return {
        "channel": template["channel"],
        "title": template["title"].format(model=friendly_model),
        "message": template["message"].format(model=friendly_model),
    }
