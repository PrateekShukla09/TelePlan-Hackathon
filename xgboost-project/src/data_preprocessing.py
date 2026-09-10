import pandas as pd
import numpy as np

def load_and_clean_customer_data(input_path, output_path):
    df = pd.read_csv(input_path)

    numeric_columns = [
        "monthly_data_gb",
        "total_call_minutes",
        "sms_per_month",
        "monthly_recharge_amount",
        "international_call_minutes"
    ]

    for column in numeric_columns:
        df.loc[df[column] < 0, column] = np.nan

    df = df.drop_duplicates()

    for column in numeric_columns:
        df[column] = df[column].fillna(df[column].median())

    df.to_csv(output_path, index=False)

    return df