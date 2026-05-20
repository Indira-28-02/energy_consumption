import pandas as pd
import numpy as np
from sklearn.model_selection import train_test_split
from sklearn.ensemble import RandomForestRegressor
import pickle

# Load the dataset
df = pd.read_csv("data/power_dataset.csv")

# Process datetime
df['Datetime'] = pd.to_datetime(df['Datetime'])
df['hour'] = df['Datetime'].dt.hour
df['day'] = df['Datetime'].dt.day
df['month'] = df['Datetime'].dt.month

X = df[['Temperature', 'Humidity', 'hour', 'day', 'month']]

zones = [
    'PowerConsumption_Zone1',
    'PowerConsumption_Zone2',
    'PowerConsumption_Zone3'
]

models = {}

for zone in zones:
    print(f"Training model for {zone}")

    y = df[zone]

    X_train, X_test, y_train, y_test = train_test_split(
        X, y, test_size=0.2, random_state=42
    )

    model = RandomForestRegressor(
        n_estimators=100,
        random_state=42
    )

    model.fit(X_train, y_train)

    models[zone] = model

    # Save the model
    with open(f"models/{zone.lower().replace('powerconsumption_', '')}_power_model.pkl", "wb") as f:
        pickle.dump(model, f)

    print(f"Model for {zone} saved.")

print("All models trained and saved.")
