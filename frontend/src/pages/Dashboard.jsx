import { useEffect, useRef, useState } from "react";
import { months } from "../constants/data";
import Card from "../components/common/Card";
import { apiRequest } from "../services/api";

async function loadChartJS() {
  if (window.Chart) return;
  await new Promise((res, rej) => {
    const s = document.createElement("script");
    s.src = "https://cdnjs.cloudflare.com/ajax/libs/Chart.js/4.4.1/chart.umd.min.js";
    s.onload = res;
    s.onerror = rej;
    document.head.appendChild(s);
  });
}

function DashboardPage() {
  const chartRef = useRef(null);
  const chartInstance = useRef(null);

  const [stats, setStats] = useState([]);
  const [vals, setVals] = useState(Array(12).fill(0));
  const [donations, setDonations] = useState([]);
  const [statusFilter, setStatusFilter] = useState("all");

  // 🆕 role detection
  const token = localStorage.getItem("token");
  let role = null;

  if (token) {
    try {
      const decoded = JSON.parse(atob(token.split(".")[1]));
      role = decoded.role;
    } catch (err) {}
  }

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const res = await apiRequest("/donations/getdonation");
        const data = res.data || res;

        setDonations(data);

        const monthlyTotals = Array(12).fill(0);
        let total = 0;

        data.forEach((donation) => {
          const month = new Date(donation.createdAt).getMonth();
          monthlyTotals[month] += donation.amount || 0;
          total += donation.amount || 0;
        });

        setVals(monthlyTotals);

        setStats([
          {
            label: "Total Donations",
            value: `₹${total.toLocaleString("en-IN")}`,
            delta: "+ Real Data",
          },
          {
            label: "Total Requests",
            value: data.length,
            delta: "+ Live",
          },
          {
            label: "Active NGOs",
            value: "Dynamic",
            delta: "Coming soon",
          },
        ]);
      } catch (err) {
        console.error("Dashboard Error:", err.message);
      }
    };

    fetchDashboardData();
  }, []);

  // 🆕 filter logic
  const filteredDonations =
    statusFilter === "all"
      ? donations
      : donations.filter((d) => d.status === statusFilter);

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
          datasets: [
            {
              data: vals,
              borderColor: "#c0453a",
              backgroundColor: grad,
              borderWidth: 2,
              pointRadius: 3,
              tension: 0.4,
              fill: true,
            },
          ],
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: { legend: { display: false } },
        },
      });
    };

    init();
    return () => {
      if (chartInstance.current) chartInstance.current.destroy();
    };
  }, [vals]);

  return (
    <div className="flex-1 p-5 md:p-7 flex flex-col overflow-hidden">

      <div className="flex justify-between items-start mb-6">
        <div>
          <div className="text-[22px]">Impact Dashboard</div>
          <div className="text-[12px] text-[#888]">
            Overview of this financial year
          </div>
        </div>
      </div>

      {/* 🆕 FILTER BUTTONS (ONLY NGO) */}
      {role === "ngo" && (
        <div className="flex gap-2 mb-4">
          {["all", "pending", "accepted", "rejected"].map((s) => (
            <button
              key={s}
              onClick={() => setStatusFilter(s)}
              className={`px-3 py-1 rounded ${
                statusFilter === s ? "bg-[#c0453a] text-white" : "bg-gray-200"
              }`}
            >
              {s}
            </button>
          ))}
        </div>
      )}

      <div className="grid grid-cols-3 gap-3 mb-6">
        {stats.map((stat) => (
          <Card key={stat.label}>
            <div>{stat.label}</div>
            <div>{stat.value}</div>
          </Card>
        ))}
      </div>

      <Card className="flex-1">
        <canvas ref={chartRef} />
      </Card>
    </div>
  );
}

export default DashboardPage;