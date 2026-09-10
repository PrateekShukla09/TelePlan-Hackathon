import numpy as np
import pandas as pd

MONTH_DAYS = 30.44
UNLIMITED_CAPACITY_FACTOR = 2.0
EXTRAS_SATURATION = 2.5

EXTRA_COLUMNS = [
    "unlimited_5g",
    "night_unlimited",
    "weekend_unlimited",
    "ott_benefit",
    "cloud_storage",
    "education_benefit",
    "gaming_benefit",
    "social_benefit"
]


def load_and_validate_plans(input_path):
    plans = pd.read_csv(input_path)

    if len(plans) != 25:
        raise ValueError(f"Expected 25 plans, found {len(plans)}")

    if plans["plan_id"].duplicated().any():
        raise ValueError("Duplicate plan IDs found")

    if plans.isnull().any().any():
        raise ValueError("Missing values found in plan data")

    plans = plans.copy()

    monthly_factor = MONTH_DAYS / plans["validity_days"]

    plans["monthly_price"] = plans["price"] * monthly_factor
    plans["monthly_isd_minutes"] = plans["isd_minutes"] * monthly_factor

    metered_capacity = plans["total_data_gb"] * monthly_factor

    plans["monthly_data_capacity"] = np.where(
        plans["unlimited_data"] == 1,
        UNLIMITED_CAPACITY_FACTOR * metered_capacity[plans["unlimited_data"] == 0].max(),
        metered_capacity
    )

    extras = (
        plans[EXTRA_COLUMNS].sum(axis=1) +
        (plans["hotspot_gb"] > 0).astype(int)
    )

    saturated = 1.0 - np.exp(-extras / EXTRAS_SATURATION)
    plans["plan_value_score"] = saturated / saturated.max()

    return plans
