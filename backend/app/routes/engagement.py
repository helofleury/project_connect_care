from typing import List

from fastapi import APIRouter
from pydantic import BaseModel, Field

from app.services.engagement_service import evaluate, get_history, get_preferences, save_preferences

router = APIRouter(prefix="/engagement", tags=["Engagement"])


class PreferencesRequest(BaseModel):
    news_channels: List[str] = Field(default_factory=list)
    alert_channels: List[str] = Field(default_factory=list)
    recommendation_channels: List[str] = Field(default_factory=list)
    allow_news: bool = True
    allow_alerts: bool = True
    allow_recommendations: bool = True


@router.post("/evaluate/{customer_id}")
async def evaluate_engagement(customer_id: int):
    return await evaluate(customer_id)


@router.get("/{customer_id}")
def engagement_history(customer_id: int):
    return {"status": "ok", "customer_id": customer_id, "history": get_history(customer_id)}


@router.get("/preferences/{customer_id}")
def read_preferences(customer_id: int):
    return {"status": "ok", "customer_id": customer_id, "preferences": get_preferences(customer_id)}


@router.put("/preferences/{customer_id}")
def update_preferences(customer_id: int, request: PreferencesRequest):
    preferences = save_preferences(customer_id, request.model_dump())
    return {"status": "ok", "customer_id": customer_id, "preferences": preferences}
