import "./Home.css";
import Navbar from "../components/Navbar";
import { useNavigate } from "react-router-dom";

export default function Home() {
  const navigate = useNavigate();

  return (
    <div className="home">
      <Navbar />

      <section className="hero">
        <span className="badge">
          Smart Energy Analytics Platform
        </span>

        <h1 className="hero-title">
          Control Your <span>Energy Consumption</span>
          <br />
          with Intelligent Prediction
        </h1>

        <p className="hero-subtitle">
          A smart analytics platform to predict power consumption,
          detect anomalies, and analyze zone-wise energy usage
          using machine learning models.
        </p>

        <button
          className="hero-btn"
          onClick={() => navigate("/analytics")}
        >
          Start Energy Analysis
        </button>
      </section>
    </div>
  );
}
