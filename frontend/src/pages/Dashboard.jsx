import { useEffect, useRef} from "react";
import "./Dashboard.css";
import S from "../components/SharedStyles.jsx";
import {months , vals, stats} from "../data.js";

async function loadChartJS() {
  if (window.Chart) return;
  await new Promise((res, rej) => {
    const s = document.createElement("script");
    s.src = "https://cdnjs.cloudflare.com/ajax/libs/Chart.js/4.4.1/chart.umd.min.js";
    s.onload = res; s.onerror = rej;
    document.head.appendChild(s);
  });
}

function DashboardPage() {
  const chartRef = useRef(null);
  const chartInstance = useRef(null);

  useEffect(() => {
    const init = async () => {
      await loadChartJS();
      if (chartInstance.current) chartInstance.current.destroy();
      const ctx = chartRef.current.getContext("2d");
      const grad = ctx.createLinearGradient(0, 0, 0, 180);
      grad.addColorStop(0, "rgba(192,69,58,0.22)");
      grad.addColorStop(1, "rgba(192,69,58,0)");
      chartInstance.current = new window.Chart(ctx, {
        type: "line",
        data: {
          labels: months,
          datasets: [{
            data: vals, borderColor: "#c0453a", backgroundColor: grad,
            borderWidth: 2, pointRadius: 3, pointBackgroundColor: "#c0453a",
            tension: 0.4, fill: true,
          }],
        },
        options: {
          responsive: true, maintainAspectRatio: false,
          plugins: { legend: { display: false }, tooltip: {
            callbacks: { label: (c) => "₹" + c.parsed.y.toLocaleString("en-IN") },
          }},
          scales: {
            x: { grid: { color: "rgba(0,0,0,0.06)" }, ticks: { color: "#888", font: { size: 11 } } },
            y: { grid: { color: "rgba(0,0,0,0.06)" }, ticks: { color: "#888", font: { size: 11 },
              callback: (v) => "₹" + (v / 1000).toFixed(0) + "k" } },
          },
        },
      });
    };
    init();
    return () => { if (chartInstance.current) chartInstance.current.destroy(); };
  }, []);

return (
  <div className="dashboard">

    <div className="dashboard-header">
      <div>
        <div className="dashboard-title">Impact Dashboard</div>
        <div className="dashboard-subtitle">
          Overview of this financial year
        </div>
      </div>

      <div className="dashboard-date">
        Apr 2025 – Apr 2026
      </div>
    </div>

    <div className="stats-grid">
      {stats.map((stat) => (
        <div key={stat.label} style={S.card}>
          <div className="stat-label">{stat.label}</div>
          <div className="stat-value">{stat.value}</div>
          <div className="stat-delta">{stat.delta}</div>
        </div>
      ))}
    </div>

    <div style={S.card} className="chart-card">
      <div className="chart-title">Monthly donations — ₹</div>
      <div className="chart-container">
        <canvas ref={chartRef} />
      </div>
    </div>

  </div>
);
}
export default DashboardPage;