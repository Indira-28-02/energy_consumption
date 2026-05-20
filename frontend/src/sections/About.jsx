import "./AboutUs.css";

function AboutUs() {
  return (
    <div className="about-page">
      <div className="about-card">
        <h1 className="about-title">About Us</h1>

        <p className="about-subtitle">
          Smart, reliable and data-driven power analytics platform
        </p>

        <p className="about-description">
          SmartEnergy is a machine learning–based power analytics system designed
          to predict power consumption, detect anomalies, and provide zone-wise
          energy insights. The system uses environmental and time-based inputs
          to analyze consumption patterns and help identify abnormal power usage.
        </p>

        <p className="about-description">
          This project focuses on improving energy monitoring through intelligent
          prediction models, anomaly detection techniques, and interactive
          visualizations for better decision-making.
        </p>

        <div className="about-divider"></div>

        <div className="about-contact">
          <span>Contact</span>
          <p>smartenergy.project@gmail.com</p>
        </div>
      </div>
    </div>
  );
}

export default AboutUs;
