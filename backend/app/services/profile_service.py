"""
Serviço de identificação de perfil do cliente.

Implementa, de forma simplificada, a abordagem híbrida descrita no projeto
Ford Customer 360: cruza o perfil declarado (se existir, vindo de um
formulário de onboarding) com o comportamento real de uso do veículo
(quilometragem mensal estimada, fidelidade à concessionária, regularidade
das revisões) para classificar o cliente em um dos 6 perfis do projeto.

Este módulo NÃO expõe nenhum termo técnico de Machine Learning: o resultado
é sempre um perfil "amigável", pronto para ser mostrado ao cliente ou usado
para escolher o template de notificação correto.
"""

from typing import Optional, TypedDict


class CustomerProfile(TypedDict):
    key: str
    name: str
    icon: str
    description: str
    preferred_channel: str


# Modelos com apelo "aventureiro" / uso severo (linha Ford Pro e picapes/SUVs)
OFFROAD_MODELS = {"RANGER", "BRONCO SPORT", "MAVERICK", "F-150", "TRANSIT"}

# Modelos com posicionamento premium
PREMIUM_MODELS = {"MUSTANG", "TERRITORY"}


PROFILES: dict[str, CustomerProfile] = {
    "urbano_leve": {
        "key": "urbano_leve",
        "name": "Cliente Urbano Leve",
        "icon": "🚗",
        "description": "Você usa o seu Ford para trajetos curtos no dia a dia.",
        "preferred_channel": "whatsapp",
    },
    "motorista_aplicativo": {
        "key": "motorista_aplicativo",
        "name": "Motorista de Aplicativo",
        "icon": "🚕",
        "description": "Seu Ford roda bastante todos os dias.",
        "preferred_channel": "whatsapp",
    },
    "usuario_offroad": {
        "key": "usuario_offroad",
        "name": "Usuário Off-Road",
        "icon": "🏔️",
        "description": "Seu Ford encara estradas de terra e terrenos exigentes.",
        "preferred_channel": "email",
    },
    "premium_baixa_km": {
        "key": "premium_baixa_km",
        "name": "Cliente Premium de Baixa Quilometragem",
        "icon": "⭐",
        "description": "Você cuida do seu Ford com carinho e exclusividade.",
        "preferred_channel": "email",
    },
    "cliente_economico": {
        "key": "cliente_economico",
        "name": "Cliente Econômico",
        "icon": "🏷️",
        "description": "Você valoriza economia e boas oportunidades.",
        "preferred_channel": "sms",
    },
    "profissional_autonomo": {
        "key": "profissional_autonomo",
        "name": "Cliente Profissional Autônomo",
        "icon": "💼",
        "description": "Seu Ford é uma ferramenta de trabalho essencial.",
        "preferred_channel": "whatsapp",
    },
}


def resolve_customer_profile(
    vehicle_data: dict,
    declared_profile: Optional[str] = None,
) -> CustomerProfile:
    """
    Resolve o perfil do cliente combinando:
      1. Perfil declarado no onboarding (se existir e ainda for compatível);
      2. Comportamento real (quilometragem mensal estimada, fidelidade,
         regularidade das revisões);

    `vehicle_data` deve conter, quando disponível:
      - model_name (str)
      - estimated_monthly_km (float | None)
      - dealer_loyalty_ratio (float | None)
      - irregular_service_pattern (bool | None)
      - low_dealer_loyalty (bool | None)
    """

    model_name = (vehicle_data.get("model_name") or "").upper()
    monthly_km = vehicle_data.get("estimated_monthly_km")
    irregular_pattern = bool(vehicle_data.get("irregular_service_pattern"))
    low_dealer_loyalty = bool(vehicle_data.get("low_dealer_loyalty"))

    key = declared_profile if declared_profile in PROFILES else None

    # A IA reclassifica dinamicamente com base no uso real,
    # exatamente como descrito no documento do projeto (seção 3).
    if monthly_km is not None:
        if monthly_km >= 2500:
            key = "usuario_offroad" if model_name in OFFROAD_MODELS else "motorista_aplicativo"
        elif monthly_km >= 1200:
            key = "profissional_autonomo"
        elif monthly_km <= 500:
            key = "premium_baixa_km" if model_name in PREMIUM_MODELS else "urbano_leve"

    if key is None:
        if irregular_pattern and low_dealer_loyalty:
            key = "cliente_economico"
        else:
            key = "urbano_leve"

    if key not in PROFILES:
        key = "urbano_leve"

    return PROFILES[key]
