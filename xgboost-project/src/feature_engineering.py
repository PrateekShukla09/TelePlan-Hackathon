import json

import numpy as np

LEVEL_FEATURES = {
    "data_usage_level": "monthly_data_gb",
    "call_usage_level": "total_call_minutes",
    "sms_usage_level": "sms_per_month",
    "recharge_level": "monthly_recharge_amount"
}


def fit_feature_thresholds(df):
    return {
        feature: (df[source].quantile(0.90), df[source].quantile(0.95))
        for feature, source in LEVEL_FEATURES.items()
    }


def create_customer_features(df, thresholds):
    df = df.copy()

    for feature, source in LEVEL_FEATURES.items():
        p90, p95 = thresholds[feature]
        df[feature] = np.select(
            [df[source] <= p90, df[source] <= p95],
            [0, 1],
            default=2
        )

    df["international_user"] = (
        df["international_call_minutes"] > 0
    ).astype(int)

    return df


def save_thresholds(thresholds, path):
    with open(path, "w") as file:
        json.dump(
            {
                feature: [float(p90), float(p95)]
                for feature, (p90, p95) in thresholds.items()
            },
            file
        )


def load_thresholds(path):
    with open(path) as file:
        return {
            feature: tuple(bounds)
            for feature, bounds in json.load(file).items()
        }
