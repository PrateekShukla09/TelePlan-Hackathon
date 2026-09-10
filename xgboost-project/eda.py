import os

import pandas as pd

CLEAN_CUSTOMER_PATH = "data/clean_customer_data.csv"
REPORT_DIR = "reports"
REPORT_PATH = "reports/eda_report.md"

CUSTOMER_FEATURES = [
    "monthly_data_gb",
    "total_call_minutes",
    "sms_per_month",
    "monthly_recharge_amount",
    "international_call_minutes"
]

USAGE_BANDS = [
    ("0-5 GB", 0.0, 5.0),
    ("5-10 GB", 5.0, 10.0),
    ("10-20 GB", 10.0, 20.0),
    ("20-50 GB", 20.0, 50.0),
    ("50+ GB", 50.0, float("inf"))
]

customers = pd.read_csv(CLEAN_CUSTOMER_PATH)

sections = []

sections.append("# EDA Report\n")
sections.append(
    f"Cleaned customers: {len(customers)}  \n"
    f"Plans in catalogue: 25\n"
)

sections.append("## Feature Distributions\n")
distribution = customers[CUSTOMER_FEATURES].describe(
    percentiles=[0.10, 0.25, 0.50, 0.75, 0.90, 0.99]
).round(2)
sections.append("```\n" + distribution.to_string() + "\n```\n")

sections.append("## Correlations\n")
sections.append("```\n" + customers[CUSTOMER_FEATURES].corr().round(3).to_string() + "\n```\n")

sections.append("## Usage Patterns\n")
rows = []
for name, low, high in USAGE_BANDS:
    count = int(((customers["monthly_data_gb"] >= low) & (customers["monthly_data_gb"] < high)).sum())
    rows.append(f"{name:10s} {count:8d}  {100 * count / len(customers):6.3f}%")
sections.append("```\n" + "\n".join(rows) + "\n```\n")

sections.append(
    f"- International users: {100 * (customers['international_call_minutes'] > 0).mean():.2f}% "
    f"of customers have any international usage.\n"
    f"- Data usage is heavily right-skewed: median "
    f"{customers['monthly_data_gb'].median():.2f} GB against a maximum of "
    f"{customers['monthly_data_gb'].max():.2f} GB.\n"
    f"- Recharge budget median is Rs {customers['monthly_recharge_amount'].median():.2f}, "
    f"maximum Rs {customers['monthly_recharge_amount'].max():.2f}.\n"
    f"- SMS is near-zero for most customers: median "
    f"{customers['sms_per_month'].median():.0f} per month.\n"
    f"- Usage features are close to mutually uncorrelated, so behavioural signals "
    f"are largely independent of one another.\n"
)

os.makedirs(REPORT_DIR, exist_ok=True)
with open(REPORT_PATH, "w") as file:
    file.write("\n".join(sections))

print("Wrote", REPORT_PATH)
