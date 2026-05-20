import "./Sidebar.css";

function Sidebar({ active, setActive }) {
  return (
    <aside className="sidebar">
      <h2 className="sidebar-title">SmartEnergy</h2>

      <ul className="sidebar-menu">
        <li
          className={active === "power" ? "active" : ""}
          onClick={() => setActive("power")}
        >
          Power Prediction
        </li>

        <li
          className={active === "anomaly" ? "active" : ""}
          onClick={() => setActive("anomaly")}
        >
          Anomaly Detection
        </li>

        <li
          className={active === "zone" ? "active" : ""}
          onClick={() => setActive("zone")}
        >
          Zone Wise Analysis
        </li>



        <li
          className={active === "about" ? "active" : ""}
          onClick={() => setActive("about")}
        >
          About Us
        </li>
      </ul>
    </aside>
  );
}

export default Sidebar;
