import { useState, useEffect } from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
  ReferenceLine,
} from "recharts";
import "./AnomalyDetection.css";

function AnomalyDetection({ predictedData, setAnomalyResult, hasDetected, setHasDetected }) {
  const [inputMode, setInputMode] = useState('predicted');
  const [form, setForm] = useState({
    power: "",
    zone: "Zone 1",
    hour: "",
    month: "",
    temperature: "",
    humidity: "",
  });
  const [result, setResult] = useState(null);
  const [error, setError] = useState("");
  const [graphData, setGraphData] = useState(null);

  useEffect(() => {
    if (inputMode === 'predicted' && predictedData) {
      setForm(prev => ({
        ...prev,
        power: predictedData.power.toFixed(2),
        zone: predictedData.zone,
        hour: predictedData.hour,
        day: predictedData.day,
        month: predictedData.month,
        temperature: predictedData.temperature,
        humidity: predictedData.humidity
      }));
    }
  }, [inputMode, predictedData]);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

    const validateInputs = () => {
    const p = Number(form.power);
    const hr = Number(form.hour);
    const m = Number(form.month);
    const t = Number(form.temperature);
    const h = Number(form.humidity);

    if (form.power === "" || form.zone === "" || form.hour === "" || form.month === "" || form.temperature === "" || form.humidity === "") {
      setError("All input fields are required.");
      return false;
    }

    if (p <= 0) {
      setError("Power must be a positive number.");
      return false;
    }

    if (t < 0 || t > 50) {
      setError("Temperature must be between 0 and 50 °C.");
      return false;
    }

    if (h < 0 || h > 100) {
      setError("Humidity must be between 0 and 100 %.");
      return false;
    }

    if (hr < 0 || hr > 23) {
      setError("Hour must be between 0 and 23.");
      return false;
    }

    if (m < 1 || m > 12) {
      setError("Month must be between 1 and 12.");
      return false;
    }

    setError("");
    return true;
  };

  const handleDetect = async () => {
    if (inputMode === 'predicted' && !predictedData) {
      setError("Please predict power first for predicted input mode.");
      return;
    }

    if (!validateInputs()) {
      setResult(null);
      return;
    }

    setError("");

    const res = await fetch("http://127.0.0.1:5000/detect-anomaly", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        power: Number(form.power),
        zone: form.zone,
        hour: Number(form.hour),
        month: Number(form.month),
      }),
    });

    const enteredHour = Number(form.hour);
    const hours = [enteredHour - 2, enteredHour - 1, enteredHour, enteredHour + 1, enteredHour + 2];

    // Fetch historical averages for the month and zone
    const histRes = await fetch("http://127.0.0.1:5000/historical-average", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        month: Number(form.month),
        zone: form.zone,
      }),
    });
    const histData = await histRes.json();
    const averages = histData.averages;

    const dataPoints = [];
    for (let i = 0; i < hours.length; i++) {
      const hr = hours[i];
      if (hr >= 0 && hr <= 23) {
        const power = hr === enteredHour ? Number(form.power) : averages[hr] || 0;
        dataPoints.push({
          time: hr,
          power: power,
          isEntered: hr === enteredHour,
        });
      }
    }

    const data = await res.json();
    setResult(data.status);
    setHasDetected(true);

    // Set anomaly result for zone analysis
    if (setAnomalyResult) {
      setAnomalyResult({
        status: data.status,
        power: Number(form.power),
        zone: form.zone,
        hour: Number(form.hour),
        month: Number(form.month),
        threshold: data.mean + 2 * data.std,
      });
    }

    setGraphData({
      threshold: data.mean + 2 * data.std,
      data: dataPoints,
    });
  };

  const chartData = graphData ? graphData.data : [];

  return (
    <div className="anomaly-page">
      <h1 className="page-title">Anomaly Detection</h1>

      {/* INPUT SECTION */}
      <div className="input-section">
        <h2>Input Data</h2>

        <div className="toggle-buttons">
          <button
            className={inputMode === 'predicted' ? 'active' : ''}
            onClick={() => setInputMode('predicted')}
          >
            Use Predicted Input
          </button>
          <button
            className={inputMode === 'manual' ? 'active' : ''}
            onClick={() => setInputMode('manual')}
          >
            Manual Input
          </button>
        </div>

        <div className="form-grid">
          <div className="form-row">
            <div className="form-group">
              <label>Temperature (°C)</label>
              <input
                type="number"
                name="temperature"
                placeholder="(0 – 50)"
                value={form.temperature}
                onChange={handleChange}
                disabled={inputMode === 'predicted'}
              />
            </div>
            <div className="form-group">
              <label>Humidity (%)</label>
              <input
                type="number"
                name="humidity"
                placeholder="(0 – 100)"
                value={form.humidity}
                onChange={handleChange}
                disabled={inputMode === 'predicted'}
              />
            </div>
            <div className="form-group">
              <label>Predicted / Manual Power (kW)</label>
              <input
                type="number"
                name="power"
                placeholder="Enter power"
                value={form.power}
                onChange={handleChange}
                disabled={inputMode === 'predicted'}
              />
            </div>
          </div>
          <div className="form-row">
            <div className="form-group">
              <label>Hour (0–23)</label>
              <input
                type="number"
                name="hour"
                placeholder="(0 – 23)"
                value={form.hour}
                onChange={handleChange}
                disabled={inputMode === 'predicted'}
              />
            </div>
            <div className="form-group">
              <label>Day (1–31)</label>
              <input
                type="number"
                name="day"
                placeholder="(1 – 31)"
                value={form.day}
                onChange={handleChange}
                disabled={inputMode === 'predicted'}
              />
            </div>
            <div className="form-group">
              <label>Month (1–12)</label>
              <input
                type="number"
                name="month"
                placeholder="(1 – 12)"
                value={form.month}
                onChange={handleChange}
                disabled={inputMode === 'predicted'}
              />
            </div>
          </div>
          <div className="form-row center">
            <div className="button-group">
              <button
                className="predict-btn"
                onClick={handleDetect}
                disabled={inputMode === 'predicted' && !predictedData}
              >
                Detect Anomaly
              </button>
            </div>
          </div>

        </div>

        {error && <p className="error-text">{error}</p>}
      </div>

      {/* MAIN LAYOUT */}
      <div className="anomaly-layout">
        {/* LEFT SECTION: RESULT */}
        <div className="result-section">
          <h2>Anomaly Result</h2>

          {!result && !error && (
            <p className="result-placeholder">
              Enter data and click <b>Detect Anomaly</b>
            </p>
          )}

          {result && (
            <>
              <div
                className={`anomaly-result ${
                  result === "ANOMALY" ? "danger" : "safe"
                }`}
              >
                {result === "ANOMALY" ? "Anomaly" : "Normal"}
              </div>
              <p className="explanation">
                Power usage {result === "ANOMALY" ? "deviates from expected pattern" : "is within normal range"}.
              </p>
            </>
          )}
        </div>

        {/* RIGHT SECTION: CHART */}
        <div className="chart-section">
          <h2>Power Trend Chart</h2>

          {graphData ? (
            <ResponsiveContainer width="100%" height={400}>
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                <XAxis dataKey="time" />
                <YAxis />
                <Tooltip />
                <ReferenceLine y={graphData.threshold} stroke="red" label="Threshold" />
                <Line
                  type="monotone"
                  dataKey="power"
                  stroke="#4338ca"
                  strokeWidth={3}
                  dot={(props) => {
                    const { cx, cy, payload } = props;
                    return (
                      <circle
                        cx={cx}
                        cy={cy}
                        r={6}
                        fill={payload.isEntered ? (result === "ANOMALY" ? "red" : "green") : "#4338ca"}
                      />
                    );
                  }}
                />
              </LineChart>
            </ResponsiveContainer>
          ) : (
            <p className="chart-placeholder">Chart will appear after detection.</p>
          )}
        </div>
      </div>
    </div>
  );
}

export default AnomalyDetection;
