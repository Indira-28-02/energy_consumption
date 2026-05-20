import { useState } from "react";
import Sidebar from "../components/Sidebar";
import PowerPrediction from "../sections/PowerPrediction";
import AnomalyDetection from "../sections/AnomalyDetection";
import ZoneAnalysis from "../sections/ZoneAnalysis";
import Calendar from "../sections/Calendar";
import About from "../sections/About";
import "./Analytics.css";

function Analytics() {
  const [active, setActive] = useState("power");
  const [predictedData, setPredictedData] = useState(null);
  const [anomalyResult, setAnomalyResult] = useState(null);
  const [hasDetected, setHasDetected] = useState(false);

  const renderContent = () => {
    switch (active) {
      case "power":
        return <PowerPrediction setPredictedData={setPredictedData} />;
      case "anomaly":
        return <AnomalyDetection predictedData={predictedData} setAnomalyResult={setAnomalyResult} hasDetected={hasDetected} setHasDetected={setHasDetected} />;
      case "zone":
        return <ZoneAnalysis predictedData={predictedData} anomalyResult={anomalyResult} hasDetected={hasDetected} />;
        case "calendar":
          return <AboutUs />;
      case "about":
        return <About />;
      default:
        return <PowerPrediction setPredictedData={setPredictedData} />;
    }
  };

  return (
    <div className="analytics-layout">
      <Sidebar active={active} setActive={setActive} />
      <div className="analytics-content">{renderContent()}</div>
    </div>
  );
}

export default Analytics;
