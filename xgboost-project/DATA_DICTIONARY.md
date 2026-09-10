# Data Dictionary

## Customer dataset

`data/teleplan_customer_raw_1m.csv` (raw, 1,000,000 rows) and
`data/clean_customer_data.csv` (cleaned, 983,930 rows).

| Column | Type | Unit | Description |
|---|---|---|---|
| monthly_data_gb | float | GB / month | Mobile data consumed per month |
| total_call_minutes | float | minutes / month | Domestic voice minutes per month |
| sms_per_month | float | messages / month | SMS sent per month |
| monthly_recharge_amount | float | INR / month | Amount the customer spends per month |
| international_call_minutes | float | minutes / month | International (ISD) voice minutes per month |

Cleaning applied: negative values replaced with the column median, exact duplicate
rows dropped, missing values filled with the column median.

## Engineered customer features

Produced by `src/feature_engineering.py`. Thresholds are fitted on training
customers only and frozen in `models/thresholds.json`.

| Column | Type | Values | Description |
|---|---|---|---|
| data_usage_level | int | 0, 1, 2 | Data usage tier against frozen p90 / p95 thresholds |
| call_usage_level | int | 0, 1, 2 | Call usage tier against frozen p90 / p95 thresholds |
| sms_usage_level | int | 0, 1, 2 | SMS usage tier against frozen p90 / p95 thresholds |
| recharge_level | int | 0, 1, 2 | Recharge tier against frozen p90 / p95 thresholds |
| international_user | int | 0, 1 | 1 when international_call_minutes > 0 |

## Plan catalogue

`data/plans.csv` — 25 immutable plans. Never modified by code.

| Column | Type | Description |
|---|---|---|
| plan_id | str | Catalogue identifier P01 to P25 |
| plan_name | str | Plan name |
| category | str | One of 5 catalogue categories |
| price | int | Sticker price in INR for the full validity period |
| validity_days | int | Validity in days (28, 56, 90 or 365) |
| data_per_day | float | Daily data quota in GB, 0 for pooled or unlimited plans |
| total_data_gb | int | Total data over the validity period, 0 for unlimited plans |
| unlimited_data | int | 1 when the plan has no data cap |
| unlimited_5g | int | 1 when 5G data is unmetered |
| unlimited_calls | int | 1 when domestic calls are unlimited |
| night_unlimited | int | 1 when night data is unmetered |
| weekend_unlimited | int | 1 when weekend data is unmetered |
| ott_benefit | int | 1 when an OTT subscription is bundled |
| cloud_storage | int | 1 when cloud storage is bundled |
| education_benefit | int | 1 when an education benefit is bundled |
| gaming_benefit | int | 1 when a gaming benefit is bundled |
| social_benefit | int | 1 when a social-media benefit is bundled |
| hotspot_gb | int | Bundled hotspot data in GB |
| isd_minutes | int | Bundled international minutes for the validity period |
| family_plan | int | 1 when the plan is a multi-line shared plan |
| business_plan | int | 1 when the plan is positioned for professional use |

Plan attributes describe what a plan includes. They are never interpreted as
customer preferences.

## Derived plan fields

Computed in memory by `src/plan_processing.py`. `plans.csv` is never rewritten.

| Column | Type | Description |
|---|---|---|
| monthly_price | float | price normalised to a 30.44-day month |
| monthly_data_capacity | float | Monthly-equivalent data; unlimited plans use twice the largest metered capacity |
| monthly_isd_minutes | float | isd_minutes normalised to a 30.44-day month |
| plan_value_score | float | Saturating count of bundled inclusions, normalised to the catalogue maximum |

## Target

| Column | Type | Range | Description |
|---|---|---|---|
| suitability_score | float | 0 to 100 | Core Usage Fit 50, Affordability 25, International Fit 15, Additional Plan Value 10; the international weight is redistributed when the customer has no international usage |

## Artifacts

| Path | Description |
|---|---|
| models/ranker.json | Trained XGBRanker |
| models/thresholds.json | Frozen p90 / p95 feature-engineering thresholds |
| reports/eda_report.md | Generated EDA report |
