import os

from src.data_preprocessing import load_and_clean_customer_data
from src.feature_engineering import (
    create_customer_features,
    fit_feature_thresholds,
    save_thresholds
)
from src.plan_processing import load_and_validate_plans
from src.training_data import create_training_data
from src.model_training import (
    save_ranker,
    split_customer_ids,
    stratified_customer_sample,
    train_model
)

CUSTOMER_PATH = "data/teleplan_customer_raw_1m.csv"
CLEAN_CUSTOMER_PATH = "data/clean_customer_data.csv"
PLANS_PATH = "data/plans.csv"
MODEL_DIR = "models"
MODEL_PATH = "models/ranker.json"
THRESHOLDS_PATH = "models/thresholds.json"

RANDOM_STATE = 42

customers = load_and_clean_customer_data(
    CUSTOMER_PATH,
    CLEAN_CUSTOMER_PATH
)

customers = stratified_customer_sample(
    customers,
    random_state=RANDOM_STATE
)

customers["customer_id"] = range(1, len(customers) + 1)

train_ids, test_ids = split_customer_ids(
    customers["customer_id"],
    test_size=0.2,
    random_state=RANDOM_STATE
)

thresholds = fit_feature_thresholds(
    customers[customers["customer_id"].isin(train_ids)]
)

customers = create_customer_features(customers, thresholds)

plans = load_and_validate_plans(PLANS_PATH)

training_data = create_training_data(customers, plans)

ranker, regressor, metrics = train_model(
    training_data,
    train_ids,
    test_ids
)

os.makedirs(MODEL_DIR, exist_ok=True)
save_ranker(ranker, MODEL_PATH)
save_thresholds(thresholds, THRESHOLDS_PATH)

print("\n========== TRAINING SET ==========")
print("Training customers:", len(train_ids))
print("Test customers:", len(test_ids))

print("\n========== RANKING PERFORMANCE (XGBRanker) ==========")
print("NDCG@3:", round(metrics["ndcg3"], 4))
print("Hit@1:", round(metrics["hit1"], 4))
print("Hit@3:", round(metrics["hit3"], 4))

print("\n========== HIT@1 BY DATA USAGE BAND ==========")
for name, count, hit1 in metrics["band_hit1"]:
    print(f"{name:10s} n={count:6d}  Hit@1={round(hit1, 4)}")

print("\n========== REGRESSION BASELINE (XGBRegressor) ==========")
print("MAE:", round(metrics["mae"], 4))
print("RMSE:", round(metrics["rmse"], 4))
print("R2:", round(metrics["r2"], 4))

print("\n========== TOP-1 CONCENTRATION (stratified test set) ==========")
print("Distinct top-1 plans:", metrics["distinct_top1"])
print("Most frequent:", metrics["top1_plan"], "-", round(metrics["top1_share"] * 100, 1), "%")

print("\n========== SAVED ARTIFACTS ==========")
print("Model:", MODEL_PATH)
print("Thresholds:", THRESHOLDS_PATH)
