from flask import Flask, request, jsonify
from flask_cors import CORS
import pandas as pd
import pickle

app = Flask(__name__)
CORS(app)

CSV_PATH = "data/power_dataset.csv"

ZONE_COLUMN_MAP = {
    "Zone 1": "PowerConsumption_Zone1",
    "Zone 2": "PowerConsumption_Zone2",
    "Zone 3": "PowerConsumption_Zone3",
}

ZONE_MODEL_MAP = {
    "Zone 1": "models/zone1_power_model.pkl",
    "Zone 2": "models/zone2_power_model.pkl",
    "Zone 3": "models/zone3_power_model.pkl",
}

@app.route("/detect-anomaly", methods=["POST"])
def detect_anomaly():
    data = request.json

    power = float(data["power"])
    zone = data["zone"]
    hour = int(data["hour"])
    month = int(data["month"])

    # Load dataset
    df = pd.read_csv(CSV_PATH)
    df["Datetime"] = pd.to_datetime(df["Datetime"])
    df["month"] = df["Datetime"].dt.month
    df["hour"] = df["Datetime"].dt.hour

    column = ZONE_COLUMN_MAP[zone]
    # Filter by month and hour for more accurate anomaly detection
    zone_df = df[(df["month"] == month) & (df["hour"] == hour)][[column]].dropna()

    if zone_df.empty:
        # If no data for that month/hour, use overall mean/std
        zone_df = df[[column]].dropna()

    # Statistical anomaly detection
    mean_val = zone_df[column].mean()
    std_val = zone_df[column].std()

    status = "ANOMALY" if power > mean_val + 2 * std_val else "NORMAL"

    return jsonify({
        "status": status,
        "mean": float(mean_val),
        "std": float(std_val)
    })

@app.route("/predict", methods=["POST"])
def predict_power():
    data = request.json

    temperature = float(data["temperature"])
    humidity = float(data["humidity"])
    hour = int(data["hour"])
    day = int(data["day"])
    month = int(data["month"])
    zone = data["zone"]  # Not used for prediction, but sent

    input_df = pd.DataFrame({
        'Temperature': [temperature],
        'Humidity': [humidity],
        'hour': [hour],
        'day': [day],
        'month': [month]
    })

    predictions = {}

    for z in ["Zone 1", "Zone 2", "Zone 3"]:
        model_path = ZONE_MODEL_MAP[z]
        with open(model_path, "rb") as f:
            model = pickle.load(f)
        pred = model.predict(input_df)[0]
        predictions[z] = float(pred)

    return jsonify({"predictions": predictions})

@app.route("/historical-average", methods=["POST"])
def get_historical_average():
    data = request.json
    month = int(data["month"])
    zone = data["zone"]

    df = pd.read_csv(CSV_PATH)
    df["Datetime"] = pd.to_datetime(df["Datetime"])
    df["month"] = df["Datetime"].dt.month
    df["hour"] = df["Datetime"].dt.hour

    column = ZONE_COLUMN_MAP[zone]
    filtered_df = df[df["month"] == month][["hour", column]].dropna()

    averages = {}
    for hour in range(24):
        hour_data = filtered_df[filtered_df["hour"] == hour][column]
        if not hour_data.empty:
            averages[hour] = float(hour_data.mean())
        else:
            averages[hour] = 0.0  # or some default

    return jsonify({"averages": averages})

@app.route("/hourly-average", methods=["POST"])
def get_hourly_average():
    data = request.json
    month = int(data["month"])

    df = pd.read_csv(CSV_PATH)
    df["Datetime"] = pd.to_datetime(df["Datetime"])
    df["month"] = df["Datetime"].dt.month
    df["hour"] = df["Datetime"].dt.hour

    filtered_df = df[df["month"] == month]

    averages = {}
    for z, col in ZONE_COLUMN_MAP.items():
        zone_df = filtered_df[["hour", col]].dropna()
        avg = {}
        for hour in range(24):
            hour_data = zone_df[zone_df["hour"] == hour][col]
            avg[hour] = float(hour_data.mean()) if not hour_data.empty else 0.0
        averages[z] = avg

    return jsonify({"averages": averages})

@app.route("/daily-average", methods=["POST"])
def get_daily_average():
    data = request.json
    month = int(data["month"])

    df = pd.read_csv(CSV_PATH)
    df["Datetime"] = pd.to_datetime(df["Datetime"])
    df["month"] = df["Datetime"].dt.month
    df["day"] = df["Datetime"].dt.day

    filtered_df = df[df["month"] == month]

    # Calculate days in month (using pandas)
    days_in_month = pd.Period(f'2023-{month:02d}', freq='M').days_in_month

    averages = {}
    for z, col in ZONE_COLUMN_MAP.items():
        zone_df = filtered_df[["day", col]].dropna()
        avg = {}
        for day in range(1, days_in_month + 1):
            day_data = zone_df[zone_df["day"] == day][col]
            avg[day] = float(day_data.mean()) if not day_data.empty else 0.0
        averages[z] = avg

    return jsonify({"averages": averages})

@app.route("/monthly-average", methods=["GET"])
def get_monthly_average():
    df = pd.read_csv(CSV_PATH)
    df["Datetime"] = pd.to_datetime(df["Datetime"])
    df["month"] = df["Datetime"].dt.month

    averages = {}
    for z, col in ZONE_COLUMN_MAP.items():
        zone_df = df[["month", col]].dropna()
        avg = {}
        for m in range(1, 13):
            month_data = zone_df[zone_df["month"] == m][col]
            avg[m] = float(month_data.mean()) if not month_data.empty else 0.0
        averages[z] = avg

    return jsonify({"averages": averages})

@app.route("/zone-data", methods=["GET"])
def get_zone_data():
    df = pd.read_csv(CSV_PATH)
    df["Datetime"] = pd.to_datetime(df["Datetime"])

    # Trends for all zones: last 10 data points
    trends = {}
    for z, col in ZONE_COLUMN_MAP.items():
        zone_df = df[["Datetime", col]].dropna()
        trend = zone_df.tail(10).to_dict(orient="records")
        trends[z] = [{"time": str(row["Datetime"]), "power": float(row[col])} for row in trend]

    # Comparison: mean power for each zone
    comparison = {}
    for z, col in ZONE_COLUMN_MAP.items():
        comparison[z] = float(df[col].mean())

    # Contribution: percentage contribution (normalized means)
    total_mean = sum(comparison.values())
    contribution = {z: (v / total_mean) * 100 for z, v in comparison.items()}

    # Temperature trend: last 10 data points
    temperature_trend = df.tail(10)[["Datetime", "Temperature"]].to_dict(orient="records")
    temperature_trend = [{"time": str(row["Datetime"]), "temperature": float(row["Temperature"])} for row in temperature_trend]

    # Humidity trend: last 10 data points
    humidity_trend = df.tail(10)[["Datetime", "Humidity"]].to_dict(orient="records")
    humidity_trend = [{"time": str(row["Datetime"]), "humidity": float(row["Humidity"])} for row in humidity_trend]

    return jsonify({
        "trends": trends,
        "comparison": comparison,
        "contribution": contribution,
        "temperature_trend": temperature_trend
    })

if __name__ == "__main__":
    app.run(debug=True)
