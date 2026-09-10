import sys
import json
import os
import pandas as pd
import numpy as np

from src.feature_engineering import load_thresholds
from src.model_training import load_ranker
from src.plan_processing import load_and_validate_plans
from src.recommendation import recommend_plans

PLANS_PATH = os.path.join(os.path.dirname(__file__), "data", "plans.csv")
MODEL_PATH = os.path.join(os.path.dirname(__file__), "models", "ranker.json")
THRESHOLDS_PATH = os.path.join(os.path.dirname(__file__), "models", "thresholds.json")

def main():
    if len(sys.argv) > 1 and sys.argv[1].strip():
        raw_input = sys.argv[1].strip()
    else:
        raw_input = sys.stdin.read().strip()

    if not raw_input:
        print(json.dumps({"status": "error", "message": "No JSON payload provided"}))
        sys.exit(1)

    try:
        data = json.loads(raw_input)
    except Exception as e:
        print(json.dumps({"status": "error", "message": f"Invalid JSON payload: {str(e)}"}))
        sys.exit(1)

    top_n = data.get("top_n", 3)

    user = {
        "user_type": int(data.get("user_type", 1)),
        "monthly_data_gb": float(data.get("monthly_data_gb", 15.0)),
        "total_call_minutes": float(data.get("total_call_minutes", 400.0)),
        "sms_per_month": float(data.get("sms_per_month", 100.0)),
        "monthly_recharge_amount": float(data.get("monthly_recharge_amount", 400.0)),
        "international_call_minutes": float(data.get("international_call_minutes", 0.0))
    }

    try:
        ranker = load_ranker(MODEL_PATH)
        thresholds = load_thresholds(THRESHOLDS_PATH)
        plans = load_and_validate_plans(PLANS_PATH)

        recs_df = recommend_plans(
            ranker,
            user,
            plans,
            thresholds,
            top_n=top_n
        )

        # Merge additional metadata from original plans dataframe
        full_plans_df = pd.read_csv(PLANS_PATH)
        recs_merged = recs_df.merge(full_plans_df, on="plan_id", suffixes=("", "_orig"))

        formatted_plans = []
        for idx, row in recs_merged.iterrows():
            rank_score = float(row["rank_score"])
            # Normalize rank_score for display (logistic sigmoid transform or min-max normalization)
            norm_score = 1.0 / (1.0 + np.exp(-rank_score))
            score = round(float(norm_score), 4)
            match_percent = round(score * 100, 2)

            plan_name = str(row["plan_name"])
            price = float(row["price"])
            data_gb = float(row.get("total_data_gb", 0))
            unlimited_data = bool(row.get("unlimited_data", 0) == 1)
            unlimited_5g = bool(row.get("unlimited_5g", 0) == 1)
            roaming_included = bool(row.get("isd_minutes", 0) > 0 or row.get("international_call_minutes", 0) > 0 or row.get("category") == "Professional / Specialised")

            formatted_plans.append({
                "planId": str(row["plan_id"]),
                "plan_id": str(row["plan_id"]),
                "planName": plan_name,
                "plan_name": plan_name,
                "category": str(row["category"]),
                "price": price,
                "validityDays": int(row["validity_days"]),
                "validity_days": int(row["validity_days"]),
                "monthlyPrice": float(row["monthly_price"]),
                "monthly_price": float(row["monthly_price"]),
                "dataGB": data_gb,
                "callMinutes": int(row.get("unlimited_calls", 1) * 3000),
                "sms": 100 if row.get("unlimited_calls", 1) else 50,
                "unlimitedData": unlimited_data,
                "unlimited5G": unlimited_5g,
                "roamingIncluded": roaming_included,
                "rankScore": rank_score,
                "rank_score": rank_score,
                "score": score,
                "matchPercent": match_percent,
                "rank": idx + 1,
                "explanation": f"XGBoost ML Recommended: {plan_name} (Rank Score: {rank_score:.2f}, Fit: {match_percent}%) — top match for your usage requirements."
            })

        print(json.dumps({
            "status": "success",
            "source": "xgboost_ml",
            "user": user,
            "plans": formatted_plans
        }))

    except Exception as e:
        print(json.dumps({
            "status": "error",
            "message": f"Inference execution failed: {str(e)}"
        }))
        sys.exit(1)

if __name__ == "__main__":
    main()
