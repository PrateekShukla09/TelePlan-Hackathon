import os

from src.feature_engineering import load_thresholds
from src.model_training import load_ranker
from src.plan_processing import load_and_validate_plans
from src.recommendation import recommend_plans
from src.user_input import get_user_input

PLANS_PATH = "data/plans.csv"
MODEL_PATH = "models/ranker.json"
THRESHOLDS_PATH = "models/thresholds.json"

REQUIRED_ARTIFACTS = [MODEL_PATH, THRESHOLDS_PATH]

if not all(os.path.exists(path) for path in REQUIRED_ARTIFACTS):
    raise SystemExit("Trained model not found. Run: python train.py")

ranker = load_ranker(MODEL_PATH)
thresholds = load_thresholds(THRESHOLDS_PATH)
plans = load_and_validate_plans(PLANS_PATH)

user = get_user_input()

recommendations = recommend_plans(
    ranker,
    user,
    plans,
    thresholds,
    top_n=3
)

print("\n========== TOP 3 RECOMMENDATIONS ==========")
print(recommendations.to_string(index=False))
