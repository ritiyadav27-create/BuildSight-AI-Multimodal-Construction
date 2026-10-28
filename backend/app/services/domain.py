from app.schemas import PlanRequest, PlanResult, AdvisoryRequest, AdvisoryResponse


def estimate_plan(details: PlanRequest) -> PlanResult:
    budget = details.built_up_sqft * details.construction_rate_per_sqft
    spent = budget * details.completion_percent / 100
    market = details.built_up_sqft * details.market_rate_per_sqft
    prompt = (
        f'Architectural concept visualization of a {details.building_type.lower()} building '
        f'in an Indian {details.city_tier.lower()} city. Floor area around {details.built_up_sqft:,.0f} sqft. '
        'Photorealistic 3D exterior rendering, daylight, functional site access, landscaped surroundings. '
        'Concept only, not an approved architectural design.'
    )
    return PlanResult(
        total_budget_inr=round(budget, 2),
        estimated_spent_inr=round(spent, 2),
        remaining_budget_inr=round(budget - spent, 2),
        approximate_market_value_inr=round(market, 2),
        indicative_steel_kg=round(details.built_up_sqft * details.steel_kg_per_sqft, 1),
        indicative_cement_bags=round(details.built_up_sqft * details.cement_bags_per_sqft, 1),
        completion_percent=details.completion_percent,
        assumptions=[
            'Rates and material factors are user-entered assumptions, not verified local market data.',
            'Land cost, taxes, financing, utilities, and unforeseen costs are not modeled separately.',
            'Steel and cement are indicative only; confirm actual needs with structural drawings and a qualified engineer.',
            'Market value is area × supplied market rate, not a professional appraisal.'
        ],
        rendering_prompt=prompt,
    )


RULES = {
    'Normal': [
        'Conduct the daily toolbox talk and verify PPE compliance.',
        'Inspect access routes, scaffolding, equipment and site housekeeping.'
    ],
    'Heavy Rain': [
        'Review excavation stability and restrict work in waterlogged or unstable areas.',
        'Protect temporary electrical systems; evaluate lifting and work-at-height operations.',
        'Assess concrete placement and curing measures before proceeding.'
    ],
    'High Wind': [
        'Suspend lifting and work-at-height activities whenever actual conditions exceed equipment/site limits.',
        'Secure loose materials, temporary barriers, scaffolds and formwork.',
        'Check the applicable crane manual and wind measurements before operations resume.'
    ],
    'Extreme Heat': [
        'Increase rest breaks, shade and drinking water availability.',
        'Monitor workers for heat stress and adjust physically demanding tasks.',
        'Review temperature-sensitive concrete placement and curing procedures.'
    ]
}


def get_advisory(request: AdvisoryRequest) -> AdvisoryResponse:
    return AdvisoryResponse(condition=request.condition, alerts=RULES[request.condition])
