def read_non_negative(prompt):
    while True:
        try:
            value = float(input(prompt))
        except ValueError:
            print("Please enter a number.")
            continue

        if value < 0:
            print("Value cannot be negative.")
            continue

        return value


def get_user_input():
    print("\n========== USER TYPE ==========")
    print("1. Individual")
    print("2. Family")
    print("3. Business")

    while True:
        try:
            user_type = int(input("Enter choice: "))
        except ValueError:
            print("Please enter 1, 2, or 3.")
            continue

        if user_type in [1, 2, 3]:
            break

        print("Please enter 1, 2, or 3.")

    print("\n========== USAGE DETAILS ==========")

    return {
        "user_type": user_type,
        "monthly_data_gb": read_non_negative("Monthly data usage (GB): "),
        "total_call_minutes": read_non_negative("Monthly call minutes: "),
        "sms_per_month": read_non_negative("SMS per month: "),
        "monthly_recharge_amount": read_non_negative("Monthly recharge budget (\u20b9): "),
        "international_call_minutes": read_non_negative("International call minutes per month: ")
    }
