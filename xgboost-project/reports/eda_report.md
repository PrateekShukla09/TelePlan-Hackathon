# EDA Report

Cleaned customers: 983930  
Plans in catalogue: 25

## Feature Distributions

```
       monthly_data_gb  total_call_minutes  sms_per_month  monthly_recharge_amount  international_call_minutes
count        983930.00           983930.00      983930.00                983930.00                   983930.00
mean              8.46              134.50          43.05                   384.70                       17.31
std              85.75              914.05         603.69                  1760.17                      311.66
min               0.16                1.80           0.00                    19.00                        0.00
10%               1.50               27.80           0.00                   106.97                        0.00
25%               2.26               42.90           4.00                   194.81                        0.00
50%               3.53               68.80           9.00                   264.26                        0.00
75%               5.54              110.50          17.00                   363.73                        0.00
90%               8.48              172.51          31.00                   462.68                        0.00
99%              20.60              422.80          96.00                  1410.71                       56.50
max            2999.75            29981.30       19998.00                 59920.01                     9997.00
```

## Correlations

```
                            monthly_data_gb  total_call_minutes  sms_per_month  monthly_recharge_amount  international_call_minutes
monthly_data_gb                       1.000              -0.002         -0.002                   -0.000                      -0.002
total_call_minutes                   -0.002               1.000         -0.002                   -0.001                      -0.002
sms_per_month                        -0.002              -0.002          1.000                   -0.002                      -0.002
monthly_recharge_amount              -0.000              -0.001         -0.002                    1.000                      -0.002
international_call_minutes           -0.002              -0.002         -0.002                   -0.002                       1.000
```

## Usage Patterns

```
0-5 GB       689112  70.037%
5-10 GB      229800  23.355%
10-20 GB      54519   5.541%
20-50 GB       6411   0.652%
50+ GB         4088   0.415%
```

- International users: 7.37% of customers have any international usage.
- Data usage is heavily right-skewed: median 3.53 GB against a maximum of 2999.75 GB.
- Recharge budget median is Rs 264.26, maximum Rs 59920.01.
- SMS is near-zero for most customers: median 9 per month.
- Usage features are close to mutually uncorrelated, so behavioural signals are largely independent of one another.
