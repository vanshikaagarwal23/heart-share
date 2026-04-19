import { useState } from "react";
import Sidebar from "./components/Sidebar";
import RightPanel from "./components/RightPanel";

import Dashboard from "./pages/Dashboard";
import Donations from "./pages/Donations";
import Campaigns from "./pages/Campaigns";
import Volunteers from "./pages/Volunteers";
import Reports from "./pages/Reports";

function App() {
  const [activePage, setActivePage] = useState("Dashboard");

  const pages = {
    Dashboard: <Dashboard />,
    Donations: <Donations />,
    Campaigns: <Campaigns />,
    Volunteers: <Volunteers />,
    Reports: <Reports />,
  };

  return (
  <div style={{
    fontFamily: "'DM Sans', sans-serif",
    background: "#f0e6d3",
    minHeight: "100vh",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    padding: "24px",
    border: "5.5px solid rgba(0,0,0,0.1)",
  }}>

    <div style={{
      display: "flex",
      width: "100%",
      maxWidth: "1040px",
    }}>

      <Sidebar activePage={activePage} setActivePage={setActivePage} />

      <div style={{
        display: "flex",
        flex: 1,
        background: "#ffffff",
        borderRadius: "24px",
        border: "0.5px solid rgba(0,0,0,0.1)",
        overflow: "hidden",
        boxShadow: "0 4px 40px rgba(0,0,0,0.08)",
      }}>

        <div style={{
          display: "flex",
          flex: 1,
          overflow: "hidden"
        }}>
          
          <div style={{
            flex: 1,
            display: "flex",
            flexDirection: "column",
            overflowY: "auto"
          }}>
            {pages[activePage]}
          </div>

          {activePage === "Dashboard" && <RightPanel />}
        </div>

      </div>

    </div>
  </div>
);
}

export default App;