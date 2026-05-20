import { useState } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from "recharts";
import "./PowerPrediction.css";

function PowerPrediction({ setPredictedData }) {
  const [form, setForm] = useState({
    temperature: "",
    humidity: "",
    hour: "",
    day: "",
    month: "",
    zone: "Zone 1",
  });

  const [result, setResult] = useState(null);
  const [error, setError] = useState("");

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  /* ---------- RANGE VALIDATION ---------- */
  const validateInputs = () => {
    const t = Number(form.temperature);
    const h = Number(form.humidity);
    const hr = Number(form.hour);
    const d = Number(form.day);
    const m = Number(form.month);

    if (
      form.temperature === "" ||
      form.humidity === "" ||
      form.hour === "" ||
      form.day === "" ||
      form.month === ""
    ) {
      setError("All input fields are required.");
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

    if (d < 1 || d > 31) {
      setError("Day must be between 1 and 31.");
      return false;
    }

    if (m < 1 || m > 12) {
      setError("Month must be between 1 and 12.");
      return false;
    }

    setError("");
    return true;
  };

  /* ---------- PREDICT ---------- */
  const handlePredict = async () => {
    if (!validateInputs()) {
      setResult(null);
      return;
    }

    const res = await fetch("http://127.0.0.1:5000/predict", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        temperature: Number(form.temperature),
        humidity: Number(form.humidity),
        hour: Number(form.hour),
        day: Number(form.day),
        month: Number(form.month),
        zone: form.zone,
      }),
    });

    const data = await res.json();
    setResult(data);

    // Store predicted data for anomaly detection
    if (setPredictedData) {
      setPredictedData({
        power: data.predictions[form.zone],
        zone: form.zone,
        hour: Number(form.hour),
        day: Number(form.day),
        month: Number(form.month),
        temperature: Number(form.temperature),
        humidity: Number(form.humidity),
      });
    }
  };

  /* ---------- CHART DATA ---------- */
  const chartData = result
    ? [
        { zone: "Zone 1", power: result.predictions["Zone 1"] },
        { zone: "Zone 2", power: result.predictions["Zone 2"] },
        { zone: "Zone 3", power: result.predictions["Zone 3"] },
      ]
    : [];

  return (
    <div className="power-page">
      <h1 className="page-title">Power Prediction</h1>

      <div className="power-layout">
        {/* LEFT SIDE — INPUT ONLY */}
        <div className="form-card">
          <h2>Input Parameters</h2>

          <div className="form-group">
            <label>Temperature</label>
            <input
              type="number"
              name="temperature"
              placeholder="(0 – 50 °C)"
              value={form.temperature}
              onChange={handleChange}
            />
          </div>

          <div className="form-group">
            <label>Humidity</label>
            <input
              type="number"
              name="humidity"
              placeholder="(0 – 100 %)"
              value={form.humidity}
              onChange={handleChange}
            />
          </div>

          <div className="form-group">
            <label>Hour</label>
            <input
              type="number"
              name="hour"
              placeholder="(0 – 23)"
              value={form.hour}
              onChange={handleChange}
            />
          </div>

          <div className="form-group">
            <label>Day</label>
            <input
              type="number"
              name="day"
              placeholder="(1 – 31)"
              value={form.day}
              onChange={handleChange}
            />
          </div>

          <div className="form-group">
            <label>Month</label>
            <input
              type="number"
              name="month"
              placeholder="(1 – 12)"
              value={form.month}
              onChange={handleChange}
            />
          </div>

          <div className="form-group">
            <label>Select Zone</label>
            <select name="zone" value={form.zone} onChange={handleChange}>
              <option>Zone 1</option>
              <option>Zone 2</option>
              <option>Zone 3</option>
            </select>
          </div>

          <button className="predict-btn" onClick={handlePredict}>
            Predict Power
          </button>

          {error && <p className="error-text">{error}</p>}
        </div>

        {/* RIGHT SIDE — OUTPUT ONLY */}
        <div className="result-card">
          <h2>Prediction Output</h2>

          {!result && !error && (
            <p className="result-placeholder">
              Enter valid inputs and click <b>Predict Power</b>
            </p>
          )}

          {result && (
            <>
              <div className="main-output">
                <div className="output-label">{form.zone}</div>
                <div className="output-value">
                  {result.predictions[form.zone].toFixed(2)}
                  <span className="unit"> kW</span>
                </div>
              </div>

              <ResponsiveContainer width="100%" height={280}>
                <BarChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                  <XAxis dataKey="zone" stroke="#475569" />
                  <YAxis stroke="#475569" />
                  <Tooltip />
                  <Bar
                    dataKey="power"
                    fill="#4338ca"   /* sidebar navy */
                    radius={[6, 6, 0, 0]}
                  />
                </BarChart>
              </ResponsiveContainer>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

export default PowerPrediction;
