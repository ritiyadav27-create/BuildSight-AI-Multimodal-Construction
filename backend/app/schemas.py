from typing import Literal, Optional
from pydantic import BaseModel, Field


class PPEItem(BaseModel):
    item: str
    status: Literal['Visible', 'Not visible', 'Unclear', 'Not applicable']
    note: str = ''


class Hazard(BaseModel):
    hazard: str
    severity: Literal['Low', 'Medium', 'High', 'Critical']
    recommendation: str


class SafetyReport(BaseModel):
    mode: Literal['ai', 'demo'] = 'ai'
    safety_score: int = Field(ge=0, le=100)
    overall_status: Literal['Low risk indicators', 'Review required', 'Potential high risk']
    ppe_detection: list[PPEItem]
    hazards: list[Hazard]
    limitations: list[str]


class CrackReport(BaseModel):
    mode: Literal['ai', 'demo'] = 'ai'
    defect_type: str
    severity: Literal['Low', 'Medium', 'High', 'Critical', 'Uncertain']
    estimated_width_mm: Optional[float] = None
    suspected_causes: list[str]
    recommended_actions: list[str]
    urgency: str
    limitations: list[str]


class PlanRequest(BaseModel):
    building_type: Literal['Residential', 'Commercial', 'Industrial']
    city_tier: Literal['Tier 1', 'Tier 2', 'Tier 3']
    built_up_sqft: float = Field(gt=0, le=10000000)
    completion_percent: float = Field(ge=0, le=100)
    construction_rate_per_sqft: float = Field(gt=0)
    market_rate_per_sqft: float = Field(gt=0)
    steel_kg_per_sqft: float = Field(default=4, gt=0)
    cement_bags_per_sqft: float = Field(default=0.4, gt=0)


class PlanResult(BaseModel):
    total_budget_inr: float
    estimated_spent_inr: float
    remaining_budget_inr: float
    approximate_market_value_inr: float
    indicative_steel_kg: float
    indicative_cement_bags: float
    completion_percent: float
    assumptions: list[str]
    rendering_prompt: str


class AdvisoryRequest(BaseModel):
    condition: Literal['Normal', 'Heavy Rain', 'High Wind', 'Extreme Heat']


class AdvisoryResponse(BaseModel):
    condition: str
    alerts: list[str]
    source: str = 'Scenario-based guidance, not live weather data'
    disclaimer: str = 'Verify local weather warnings and consult your site safety officer.'


class ChatRequest(BaseModel):
    question: str = Field(min_length=2, max_length=3000)
    history: list[dict[str, str]] = Field(default_factory=list)


class ChatResponse(BaseModel):
    answer: str
    mode: Literal['ai', 'demo']
    disclaimer: str = 'Educational assistance only; licensed professionals must review safety-critical decisions.'
