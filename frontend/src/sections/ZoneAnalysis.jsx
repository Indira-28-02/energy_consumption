import { useState, useEffect } from "react";
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  PieChart,
  Pie,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
  Cell,
} from "recharts";
import "./ZoneAnalysis.css";

function ZoneAnalysis({ predictedData, anomalyResult, hasDetected }) {
  const [selectedZone, setSelectedZone] = useState("All Zones");
  const [timeRange, setTimeRange] = useState("Hourly");
  const [selectedMetric, setSelectedMetric] = useState("Power");

  const [averageData, setAverageData] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (anomalyResult) {
      fetchAverageData();
    }
  }, [anomalyResult, timeRange, selectedMetric]);

  const fetchAverageData = async () => {
    setLoading(true);
    try {
      let res;
      if (timeRange === "Hourly") {
        res = await fetch("http://127.0.0.1:5000/hourly-average", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ month: anomalyResult.month }),
        });
      } else if (timeRange === "Daily") {
        res = await fetch("http://127.0.0.1:5000/daily-average", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ month: anomalyResult.month }),
        });
      } else if (timeRange === "Monthly") {
        res = await fetch("http://127.0.0.1:5000/monthly-average");
      }
      const data = await res.json();
      setAverageData(data.averages);
    } catch (error) {
      console.error("Error fetching average data:", error);
    }
    setLoading(false);
  };

  if (!predictedData) {
    return (
      <div className="zone-page">
        <h1 className="page-title">Zone Wise Analysis</h1>
        <p>Please predict power first in the Power Prediction section.</p>
      </div>
    );
  }

  if (!anomalyResult) {
    return (
      <div className="zone-page">
        <h1 className="page-title">Zone Wise Analysis</h1>
        <p>Please detect anomaly first in the Anomaly Detection section.</p>
      </div>
    );
  }

  if (loading || !averageData) {
    return (
      <div className="zone-page">
        <h1 className="page-title">Zone Wise Analysis</h1>
        <p>Loading data...</p>
      </div>
    );
  }

  // Generate dynamic chart data based on filters
  const generateLineData = () => {
    if (!averageData || !anomalyResult) return [];

    let data = [];
    const zones = selectedZone === "All Zones" ? ["Zone 1", "Zone 2", "Zone 3"] : [selectedZone];
    let times = [];
    let center;

    if (timeRange === "Hourly") {
      center = anomalyResult.hour;
      times = Array.from({length: 24}, (_, i) => i); // 0 to 23
    } else if (timeRange === "Daily") {
      center = anomalyResult.day;
      const daysInMonth = new Date(2023, anomalyResult.month, 0).getDate();
      times = Array.from({length: daysInMonth}, (_, i) => i + 1); // 1 to daysInMonth
    } else if (timeRange === "Monthly") {
      center = anomalyResult.month;
      times = Array.from({length: 12}, (_, i) => i + 1); // 1 to 12
    }

    times.forEach(time => {
      const entry = { time };
      zones.forEach(zone => {
        const avg = averageData[zone] || {};
        const predicted = avg[time] || 0;
        const actual = (time === center && zone === anomalyResult.zone) ? anomalyResult.power : null;
        const isAnomaly = (time === center && zone === anomalyResult.zone);

        entry[`${zone}_predicted`] = predicted;
        entry[`${zone}_actual`] = actual;
        entry.isAnomaly = isAnomaly;
      });
      data.push(entry);
    });

    return data;
  };

  const generateBarData = () => {
    const zones = selectedZone === "All Zones" ? ["Zone 1", "Zone 2", "Zone 3"] : [selectedZone];
    let data = [];
    const times = timeRange === "Hourly" ? Array.from({length: 24}, (_, i) => i) :
                  timeRange === "Daily" ? Array.from({length: new Date(2023, anomalyResult.month, 0).getDate()}, (_, i) => i + 1) :
                  Array.from({length: 12}, (_, i) => i + 1);

    times.forEach(time => {
      const entry = { time };
      zones.forEach(zone => {
        const avg = averageData[zone] || {};
        const predicted = avg[time] || 0;
        const actual = (time === (timeRange === "Hourly" ? anomalyResult.hour : timeRange === "Daily" ? anomalyResult.day : anomalyResult.month) && zone === anomalyResult.zone) ? anomalyResult.power : null;
        const value = predicted;
        entry[zone] = value;
      });
      data.push(entry);
    });

    return data;
  };

  const generateAreaData = () => {
    const data = generateLineData();
    return data.map(d => ({
      time: d.time,
      ...d,
    }));
  };

  const generatePieData = () => {
    const zones = ["Zone 1", "Zone 2", "Zone 3"];
    let normalCount = 0;
    let anomalyCount = 0;

    zones.forEach(zone => {
      if (anomalyResult && anomalyResult.zone === zone) {
        if (anomalyResult.status === "ANOMALY") {
          anomalyCount++;
        } else {
          normalCount++;
        }
      } else {
        normalCount++; // Default to normal if no anomaly result
      }
    });

    return [
      { name: "Normal", value: normalCount, color: "#10b981" },
      { name: "Anomaly", value: anomalyCount, color: "#ef4444" },
    ];
  };

  const lineData = generateLineData();
  const barData = generateBarData();
  const areaData = generateAreaData();
  const pieData = generatePieData();

  return (
    <div className="zone-page">
      <h1 className="page-title">Zone Wise Analysis</h1>

      {/* Filter Bar */}
      <div className="filter-bar">
        <div className="filter-group">
          <label>Zone:</label>
          <select value={selectedZone} onChange={(e) => setSelectedZone(e.target.value)}>
            <option>All Zones</option>
            <option>Zone 1</option>
            <option>Zone 2</option>
            <option>Zone 3</option>
          </select>
        </div>
        <div className="filter-group">
          <label>Time Granularity:</label>
          <select value={timeRange} onChange={(e) => setTimeRange(e.target.value)}>
            <option>Hourly</option>
            <option>Daily</option>
            <option>Monthly</option>
          </select>
        </div>
        <div className="filter-group">
          <label>Metric:</label>
          <select value={selectedMetric} onChange={(e) => setSelectedMetric(e.target.value)}>
            <option>Power</option>
            <option>Power Difference</option>
          </select>
        </div>

      </div>

      {/* Charts Grid */}
      <div className="charts-grid">
        <div className="chart-card">
          <h3>Power Trend ({selectedZone})</h3>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={lineData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
              <XAxis dataKey="time" stroke="#475569" label={{ value: timeRange === "Hourly" ? 'Hours' : '', position: 'insideBottom' }} ticks={timeRange === "Hourly" ? [0,2,4,6,8,10,12,14,16,18,20,22] : undefined} />
              <YAxis stroke="#475569" label={{ value: 'Power (kW)', angle: -90, position: 'insideLeft' }} />
              <Tooltip />
              {selectedZone === "All Zones" ? (
                <>
                  <Line type="monotone" dataKey="Zone 1_predicted" stroke="#4338ca" strokeWidth={2} name="Zone 1 Predicted" />
                  <Line type="monotone" dataKey="Zone 2_predicted" stroke="#06b6d4" strokeWidth={2} name="Zone 2 Predicted" />
                  <Line type="monotone" dataKey="Zone 3_predicted" stroke="#10b981" strokeWidth={2} name="Zone 3 Predicted" />
                  {selectedMetric === "Power" && (
                    <>
                      <Line type="monotone" dataKey="Zone 1_actual" stroke="#ef4444" strokeWidth={2} name="Zone 1 Actual" connectNulls={false} />
                      <Line type="monotone" dataKey="Zone 2_actual" stroke="#f59e0b" strokeWidth={2} name="Zone 2 Actual" connectNulls={false} />
                      <Line type="monotone" dataKey="Zone 3_actual" stroke="#8b5cf6" strokeWidth={2} name="Zone 3 Actual" connectNulls={false} />
                    </>
                  )}
                </>
              ) : (
                <>
                  <Line type="monotone" dataKey={`${selectedZone}_predicted`} stroke="#4338ca" strokeWidth={2} name="Predicted Power (kW)" />
                  {selectedMetric === "Power" && (
                    <Line type="monotone" dataKey={`${selectedZone}_actual`} stroke="#06b6d4" strokeWidth={2} name="Actual Power (kW)" connectNulls={false} />
                  )}
                </>
              )}
            </LineChart>
          </ResponsiveContainer>
        </div>

        <div className="chart-card">
          <h3>Power Bar Chart ({selectedZone})</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={barData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
              <XAxis dataKey="time" stroke="#475569" label={{ value: timeRange === "Hourly" ? 'Hours' : '', position: 'insideBottom' }} ticks={timeRange === "Hourly" ? [0,2,4,6,8,10,12,14,16,18,20,22] : undefined} />
              <YAxis stroke="#475569" label={{ value: 'Power (kW)', angle: -90, position: 'insideLeft' }} />
              <Tooltip />
              {selectedZone === "All Zones" ? (
                <>
                  <Bar dataKey="Zone 1" fill="#4338ca" radius={[6, 6, 0, 0]} />
                  <Bar dataKey="Zone 2" fill="#06b6d4" radius={[6, 6, 0, 0]} />
                  <Bar dataKey="Zone 3" fill="#10b981" radius={[6, 6, 0, 0]} />
                </>
              ) : (
                <Bar dataKey={selectedZone} fill="#4338ca" radius={[6, 6, 0, 0]} />
              )}
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="chart-card">
          <h3>Power Area Chart ({selectedZone})</h3>
          <ResponsiveContainer width="100%" height={300}>
            <AreaChart data={areaData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
              <XAxis dataKey="time" stroke="#475569" label={{ value: timeRange === "Hourly" ? 'Hours' : '', position: 'insideBottom' }} ticks={timeRange === "Hourly" ? [0,2,4,6,8,10,12,14,16,18,20,22] : undefined} />
              <YAxis stroke="#475569" label={{ value: 'Power (kW)', angle: -90, position: 'insideLeft' }} />
              <Tooltip />
              {selectedZone === "All Zones" ? (
                <>
                  <Area type="monotone" dataKey="Zone 1_predicted" stackId="1" stroke="#4338ca" fill="#4338ca" fillOpacity={0.6} />
                  <Area type="monotone" dataKey="Zone 2_predicted" stackId="1" stroke="#06b6d4" fill="#06b6d4" fillOpacity={0.6} />
                  <Area type="monotone" dataKey="Zone 3_predicted" stackId="1" stroke="#10b981" fill="#10b981" fillOpacity={0.6} />
                </>
              ) : (
                <Area type="monotone" dataKey={`${selectedZone}_predicted`} stroke="#f59e0b" fill="#f59e0b" fillOpacity={0.3} />
              )}
            </AreaChart>
          </ResponsiveContainer>
        </div>

        <div className="chart-card">
          <h3>Anomaly Distribution</h3>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={pieData}
                cx="50%"
                cy="50%"
                outerRadius={100}
                dataKey="value"
                label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
              >
                {pieData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}

export default ZoneAnalysis;
