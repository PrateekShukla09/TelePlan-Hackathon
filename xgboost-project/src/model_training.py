import numpy as np
import pandas as pd
from sklearn.metrics import (
    mean_absolute_error,
    mean_squared_error,
    ndcg_score,
    r2_score
)
from xgboost import XGBRanker, XGBRegressor

CUSTOMER_FEATURES = [
    "monthly_data_gb",
    "total_call_minutes",
    "sms_per_month",
    "monthly_recharge_amount",
    "international_call_minutes",
    "data_usage_level",
    "call_usage_level",
    "sms_usage_level",
    "recharge_level",
    "international_user"
]

PLAN_FEATURES = [
    "price",
    "validity_days",
    "data_per_day",
    "total_data_gb",
    "unlimited_data",
    "unlimited_5g",
    "unlimited_calls",
    "night_unlimited",
    "weekend_unlimited",
    "ott_benefit",
    "cloud_storage",
    "education_benefit",
    "gaming_benefit",
    "social_benefit",
    "hotspot_gb",
    "isd_minutes",
    "family_plan",
    "business_plan",
    "monthly_price",
    "monthly_data_capacity",
    "monthly_isd_minutes"
]

FEATURE_COLUMNS = CUSTOMER_FEATURES + PLAN_FEATURES

USAGE_BANDS = [
    ("0-5 GB", 0.0, 5.0, 20000),
    ("5-10 GB", 5.0, 10.0, 13000),
    ("10-20 GB", 10.0, 20.0, 10000),
    ("20-50 GB", 20.0, 50.0, 6000),
    ("50+ GB", 50.0, np.inf, 4000)
]

MODEL_PARAMS = {
    "n_estimators": 300,
    "max_depth": 6,
    "learning_rate": 0.05,
    "subsample": 0.8,
    "colsample_bytree": 0.8,
    "random_state": 42,
    "n_jobs": -1
}


def stratified_customer_sample(customers, random_state=42):
    bands = []

    for _, low, high, cap in USAGE_BANDS:
        band = customers[
            (customers["monthly_data_gb"] >= low) &
            (customers["monthly_data_gb"] < high)
        ]
        bands.append(
            band.sample(n=min(len(band), cap), random_state=random_state)
        )

    return pd.concat(bands).reset_index(drop=True)


def split_customer_ids(customer_ids, test_size=0.2, random_state=42):
    unique_ids = np.unique(customer_ids)
    shuffled = np.random.default_rng(random_state).permutation(unique_ids)
    cutoff = int(len(shuffled) * (1.0 - test_size))

    return shuffled[:cutoff], shuffled[cutoff:]


def evaluate(ranker, regressor, test):
    plans_per_customer = test["plan_id"].nunique()

    true_scores = test["suitability_score"].to_numpy().reshape(-1, plans_per_customer)
    rank_scores = ranker.predict(test[FEATURE_COLUMNS]).reshape(-1, plans_per_customer)
    plan_ids = test["plan_id"].to_numpy().reshape(-1, plans_per_customer)
    usage = test["monthly_data_gb"].to_numpy().reshape(-1, plans_per_customer)[:, 0]
    predicted_scores = regressor.predict(test[FEATURE_COLUMNS])

    best_plan = true_scores.argmax(axis=1)
    ranked = np.argsort(-rank_scores, axis=1)[:, :3]
    hits = ranked[:, 0] == best_plan

    band_hit1 = []
    for name, low, high, _ in USAGE_BANDS:
        mask = (usage >= low) & (usage < high)
        band_hit1.append(
            (name, int(mask.sum()), float(hits[mask].mean()) if mask.any() else 0.0)
        )

    top1_counts = pd.Series(
        plan_ids[np.arange(len(ranked)), ranked[:, 0]]
    ).value_counts()

    return {
        "mae": mean_absolute_error(test["suitability_score"], predicted_scores),
        "rmse": np.sqrt(mean_squared_error(test["suitability_score"], predicted_scores)),
        "r2": r2_score(test["suitability_score"], predicted_scores),
        "ndcg3": ndcg_score(true_scores, rank_scores, k=3),
        "hit1": float(hits.mean()),
        "hit3": float((ranked == best_plan[:, None]).any(axis=1).mean()),
        "test_customers": len(true_scores),
        "band_hit1": band_hit1,
        "distinct_top1": int(top1_counts.size),
        "top1_plan": top1_counts.index[0],
        "top1_share": float(top1_counts.iloc[0] / top1_counts.sum())
    }


def train_model(data, train_ids, test_ids):
    data = data.sort_values(["customer_id", "plan_id"]).reset_index(drop=True)

    train = data[data["customer_id"].isin(train_ids)]
    test = data[data["customer_id"].isin(test_ids)]

    train_groups = train.groupby("customer_id", sort=False).size().to_numpy()

    ranker = XGBRanker(objective="rank:pairwise", **MODEL_PARAMS)
    ranker.fit(
        train[FEATURE_COLUMNS],
        train["suitability_score"],
        group=train_groups
    )

    regressor = XGBRegressor(objective="reg:squarederror", **MODEL_PARAMS)
    regressor.fit(train[FEATURE_COLUMNS], train["suitability_score"])

    return ranker, regressor, evaluate(ranker, regressor, test)


def save_ranker(ranker, path):
    ranker.save_model(path)


def load_ranker(path):
    ranker = XGBRanker()
    ranker.load_model(path)

    return ranker
