import { useRef, useEffect, useState } from "react";
import StatusBadge from "../components/ui/StatusBadge";
import ProgressBar from "../components/ui/ProgressBar";
import Card from "../components/common/Card";
import { apiRequest } from "../services/api";

async function loadChartJS() {
  if (window.Chart) return;
  await new Promise((res, rej) => {
    const s = document.createElement("script");
    s.src =
      "https://cdnjs.cloudflare.com/ajax/libs/Chart.js/4.4.1/chart.umd.min.js";
    s.onload = res;
    s.onerror = rej;
    document.head.appendChild(s);
  });
}

function ReportsPage() {
  const barRef = useRef(null);
  const barInstance = useRef(null);

  const [campaigns, setCampaigns] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await apiRequest("/campaigns");
        const data = res.data || res;

        const formatted = data.map((c) => ({
          ...c,
          pct: Math.min(Math.floor((c.raised / c.goalAmount) * 100), 100),
          color: "#c0453a",
        }));

        setCampaigns(formatted);
      } catch (err) {
        console.error("Reports Error:", err.message);
      }
    };

    fetchData();
  }, []);

  useEffect(() => {
    const init = async () => {
      await loadChartJS();
      if (barInstance.current) barInstance.current.destroy();

      const ctx = barRef.current.getContext("2d");

      barInstance.current = new window.Chart(ctx, {
        type: "bar",
        data: {
          labels: campaigns.map((c) => c.title),
          datasets: [
            {
              data: campaigns.map((c) => c.raised),
              backgroundColor: campaigns.map((c) => c.color),
              borderRadius: 6,
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

    if (campaigns.length) init();

    return () => {
      if (barInstance.current) barInstance.current.destroy();
    };
  }, [campaigns]);

  return (
    <div className="flex-1 p-7 flex flex-col overflow-hidden gap-4">

      <div>
        <div className="text-[22px]">Reports</div>
        <div className="text-[12px] text-[#888]">
          Summary of all campaigns
        </div>
      </div>

      <div className="grid grid-cols-3 gap-3">
        <Card>
          <div>Total Campaigns</div>
          <div>{campaigns.length}</div>
        </Card>

        <Card>
          <div>Total Raised</div>
          <div>
            ₹{campaigns.reduce((a, c) => a + c.raised, 0)}
          </div>
        </Card>

        <Card>
          <div>Active</div>
          <div>
            {campaigns.filter((c) => c.isActive).length}
          </div>
        </Card>
      </div>

      <Card className="flex-1">
        <canvas ref={barRef} />
      </Card>

      <Card className="overflow-y-auto max-h-[200px]">
        <table className="w-full text-[12px]">
          <thead>
            <tr>
              <th>Campaign</th>
              <th>Raised</th>
              <th>Goal</th>
              <th>Progress</th>
              <th>Status</th>
            </tr>
          </thead>

          <tbody>
            {campaigns.map((c, i) => (
              <tr key={i}>
                <td>{c.title}</td>
                <td>₹{c.raised}</td>
                <td>₹{c.goalAmount}</td>
                <td>
                  <ProgressBar pct={c.pct} color={c.color} />
                </td>
                <td>
                  <StatusBadge status={c.isActive ? "Active" : "Inactive"} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </Card>

    </div>
  );
}

export default ReportsPage;