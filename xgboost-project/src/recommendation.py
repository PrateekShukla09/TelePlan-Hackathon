import math
from numbers import Real
import numpy as np
import pandas as pd
from .feature_engineering import create_customer_features
from .model_training import FEATURE_COLUMNS

CUSTOMER_INPUT_COLUMNS = [
    "monthly_data_gb",
    "total_call_minutes",
    "sms_per_month",
    "monthly_recharge_amount",
    "international_call_minutes"
]


def validate_customer_input(user):
    if "user_type" not in user:
        raise ValueError("Missing required input: user_type")

    for column in CUSTOMER_INPUT_COLUMNS:
        if column not in user:
            raise ValueError(f"Missing required input: {column}")

        value = user[column]

        if isinstance(value, bool) or not isinstance(value, Real):
            raise ValueError(f"{column} must be numeric, got {value!r}")

        if math.isnan(value):
            raise ValueError(f"{column} must be a number, got NaN")

        if value < 0:
            raise ValueError(f"{column} must not be negative, got {value}")


def build_user_features(user, thresholds):
    user_df = pd.DataFrame(
        [{column: user[column] for column in CUSTOMER_INPUT_COLUMNS}]
    )

    return create_customer_features(user_df, thresholds)


def filter_plans_by_user_type(plans, user_type):
    if user_type not in (1, 2, 3):
        raise ValueError("Invalid user type.")

    if user_type == 2:
        # Family plans strictly
        family_plans = plans[plans["family_plan"] == 1].copy()
        return family_plans if len(family_plans) > 0 else plans.copy()
    elif user_type == 3:
        # Business plans strictly
        business_plans = plans[plans["business_plan"] == 1].copy()
        return business_plans if len(business_plans) > 0 else plans.copy()
    else:
        # Individual plans strictly
        indiv_plans = plans[(plans["family_plan"] == 0) & (plans["business_plan"] == 0)].copy()
        return indiv_plans if len(indiv_plans) > 0 else plans.copy()


def filter_plans_by_data_adequacy(plans, monthly_data_gb):
    adequate = plans[
        (plans["unlimited_data"] == 1) |
        (plans["monthly_data_capacity"] >= monthly_data_gb)
    ].copy()

    if len(adequate) == 0:
        return plans.copy()
    return adequate


def recommend_plans(model, user, plans, thresholds, top_n=3):
    validate_customer_input(user)

    user_features = build_user_features(user, thresholds)

    eligible_plans = filter_plans_by_user_type(plans, user["user_type"])
    eligible_plans = filter_plans_by_data_adequacy(
        eligible_plans,
        user["monthly_data_gb"]
    )

    user_features["key"] = 1
    eligible_plans["key"] = 1

    data = user_features.merge(eligible_plans, on="key").drop(columns=["key"])

    data["rank_score"] = model.predict(data[FEATURE_COLUMNS])
    data["monthly_price"] = data["monthly_price"].round(2)

    # Price / Budget Factor: penalize plans exceeding target recharge amount
    target_budget = user.get("monthly_recharge_amount", 400.0)
    if target_budget > 0:
        overspend = np.maximum(0, data["monthly_price"] - target_budget)
        price_penalty = (overspend / target_budget) * 1.5
        data["final_score"] = data["rank_score"] - price_penalty
    else:
        data["final_score"] = data["rank_score"]

    recommendations = data.sort_values(
        ["final_score", "monthly_price", "plan_id"],
        ascending=[False, True, True]
    ).head(top_n)

    return recommendations[
        [
            "plan_id",
            "plan_name",
            "category",
            "price",
            "validity_days",
            "monthly_price",
            "rank_score"
        ]
    ]
