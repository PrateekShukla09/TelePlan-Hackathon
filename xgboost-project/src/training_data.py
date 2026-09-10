import numpy as np

IDEAL_LOW = 1.0
IDEAL_HIGH = 1.5
SHORTFALL_EXPONENT = 1.5
EXCESS_PENALTY = 0.35
EXCESS_PENALTY_UNLIMITED = 0.05
VOICE_SCALE = 100.0
BUDGET_TOLERANCE = 1.05
BUDGET_PENALTY = 6.0
UPFRONT_MONTHS = 3.0
UPFRONT_PENALTY = 0.25

DATA_WEIGHT = 40.0
VOICE_WEIGHT = 10.0
BUDGET_WEIGHT = 18.0
VALUE_WEIGHT = 7.0
INTERNATIONAL_WEIGHT = 15.0
PLAN_VALUE_WEIGHT = 10.0

APPLICABLE_WEIGHT = (
    DATA_WEIGHT + VOICE_WEIGHT + BUDGET_WEIGHT + VALUE_WEIGHT + PLAN_VALUE_WEIGHT
)


def data_fit(capacity, usage, unlimited_data):
    ratio = capacity / np.maximum(usage, 0.1)
    penalty = np.where(unlimited_data == 1, EXCESS_PENALTY_UNLIMITED, EXCESS_PENALTY)

    return np.where(
        ratio < IDEAL_LOW,
        np.power(np.clip(ratio, 0.0, None), SHORTFALL_EXPONENT),
        np.where(
            ratio <= IDEAL_HIGH,
            1.0,
            1.0 / (1.0 + penalty * (ratio - IDEAL_HIGH))
        )
    )


def voice_fit(unlimited_calls, call_minutes):
    return np.where(
        unlimited_calls == 1,
        1.0,
        1.0 / (1.0 + call_minutes / VOICE_SCALE)
    )


def affordability_fit(monthly_price, price, budget):
    safe_budget = np.maximum(budget, 1.0)

    monthly_ratio = monthly_price / safe_budget
    upfront_ratio = price / safe_budget

    within_budget = np.where(
        monthly_ratio <= BUDGET_TOLERANCE,
        1.0,
        1.0 / (1.0 + BUDGET_PENALTY * np.square(monthly_ratio - BUDGET_TOLERANCE))
    )

    headroom = np.clip(1.0 - monthly_ratio, 0.0, 1.0)

    liquidity = np.where(
        upfront_ratio <= UPFRONT_MONTHS,
        1.0,
        1.0 / (1.0 + UPFRONT_PENALTY * (upfront_ratio - UPFRONT_MONTHS))
    )

    return (BUDGET_WEIGHT * within_budget + VALUE_WEIGHT * headroom) * liquidity


def international_fit(monthly_isd_minutes, international_call_minutes):
    ratio = monthly_isd_minutes / np.maximum(international_call_minutes, 0.1)

    return np.where(
        ratio >= 1.0,
        1.0,
        np.power(np.clip(ratio, 0.0, None), SHORTFALL_EXPONENT)
    )


def build_suitability_score(data):
    core_usage = (
        DATA_WEIGHT * data_fit(
            data["monthly_data_capacity"],
            data["monthly_data_gb"],
            data["unlimited_data"]
        ) +
        VOICE_WEIGHT * voice_fit(
            data["unlimited_calls"],
            data["total_call_minutes"]
        )
    )

    affordability = affordability_fit(
        data["monthly_price"],
        data["price"],
        data["monthly_recharge_amount"]
    )

    plan_value = PLAN_VALUE_WEIGHT * data["plan_value_score"]

    international = INTERNATIONAL_WEIGHT * international_fit(
        data["monthly_isd_minutes"],
        data["international_call_minutes"]
    )

    applicable = core_usage + affordability + plan_value

    return np.where(
        data["international_user"] == 1,
        applicable + international,
        applicable * 100.0 / APPLICABLE_WEIGHT
    )


def create_training_data(customers, plans):
    customers = customers.copy()
    plans = plans.copy()

    customers["key"] = 1
    plans["key"] = 1

    data = customers.merge(plans, on="key").drop(columns=["key"])

    data["suitability_score"] = build_suitability_score(data).round(4)

    return data
