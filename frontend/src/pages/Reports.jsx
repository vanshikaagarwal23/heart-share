import "./Reports.css";
import S from "../components/SharedStyles";
import {volunteers} from "../data.js";
import StatusBadge from "../components/StatusBadge";
import { useRef, useEffect } from "react";
import {campaigns, allDonations} from "../data.js";
import ProgressBar from "../components/ProgressBar.jsx";

async function loadChartJS() {
  if (window.Chart) return;
  await new Promise((res, rej) => {
    const s = document.createElement("script");
    s.src = "https://cdnjs.cloudflare.com/ajax/libs/Chart.js/4.4.1/chart.umd.min.js";
    s.onload = res; s.onerror = rej;
    document.head.appendChild(s);
  });
}

function ReportsPage() {
  const barRef = useRef(null);
  const barInstance = useRef(null);

  useEffect(() => {
    const init = async () => {
      await loadChartJS();
      if (barInstance.current) barInstance.current.destroy();
      const ctx = barRef.current.getContext("2d");
      barInstance.current = new window.Chart(ctx, {
        type: "bar",
        data: {
          labels: campaigns.map(c => c.name),
          datasets: [{
            data: campaigns.map(c => c.volunteers),
            backgroundColor: campaigns.map(c => c.color + "cc"),
            borderRadius: 6,
          }],
        },
        options: {
          responsive: true, maintainAspectRatio: false,
          plugins: { legend: { display: false } },
          scales: {
            x: { grid: { display: false }, ticks: { color: "#888", font: { size: 11 } } },
            y: { grid: { color: "rgba(0,0,0,0.06)" }, ticks: { color: "#888", font: { size: 11 } } },
          },
        },
      });
    };
    init();
    return () => { if (barInstance.current) barInstance.current.destroy(); };
  }, []);

  return (
  <div className="page">

    <div>
      <div className="page-title">Reports</div>
      <div className="page-subtitle">
        Summary of all activity
      </div>
    </div>

    <div className="stats-grid-4">
      {[
        { label: "Campaigns", value: campaigns.length },
        { label: "Volunteers", value: volunteers.length },
        { label: "Donations", value: allDonations.length },
        { label: "Hours Logged", value: volunteers.reduce((a, v) => a + v.hours, 0) },
      ].map(stat => (
        <div key={stat.label} style={S.card}>
          <div className="stat-label">{stat.label}</div>
          <div className="stat-value">{stat.value}</div>
        </div>
      ))}
    </div>

    <div className="chart-card" style={S.card}>
      <div className="chart-title">Volunteers per campaign</div>
      <div className="chart-container">
        <canvas ref={barRef} />
      </div>
    </div>

    <div className="table-card" style={S.card}>
      <div style={S.sectionTitle}>Campaign Funding Summary</div>

      <table className="table">
        <thead>
          <tr>
            {["Campaign","Raised","Goal","Progress","Status"].map(h => (
              <th key={h}>{h}</th>
            ))}
          </tr>
        </thead>

        <tbody>
          {campaigns.map((c, i) => (
            <tr key={i} className="table-row">
              <td style={{ fontWeight: 500, color: "#1a1a1a" }}>{c.name}</td>
              <td style={{ color: c.color, fontWeight: 500 }}>{c.raised}</td>
              <td style={{ color: "#888" }}>{c.goal}</td>
              <td style={{ width: "120px" }}>
                <ProgressBar pct={c.pct} color={c.color} />
              </td>
              <td>
                <StatusBadge status={c.status} />
              </td>
            </tr>
          ))}
        </tbody>
      </table>

    </div>

  </div>
);
}
 export default ReportsPage;