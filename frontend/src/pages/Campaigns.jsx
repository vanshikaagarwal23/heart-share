import { useState, useEffect } from "react";
import StatusBadge from "../components/ui/StatusBadge";
import ProgressBar from "../components/ui/ProgressBar";
import Card from "../components/common/Card";
import { apiRequest } from "../services/api";

function CampaignsPage() {
  const [selected, setSelected] = useState(null);
  const [campaigns, setCampaigns] = useState([]);

  useEffect(() => {
    const fetchCampaigns = async () => {
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
        console.error("Campaign UI Error:", err.message);
      }
    };

    fetchCampaigns();
  }, []);

  if (selected !== null) {
    const campaign = campaigns[selected];
    if (!campaign) return null;

    return (
      <div className="flex-1 p-5 md:p-7 flex flex-col overflow-hidden">

        <button
          onClick={() => setSelected(null)}
          className="text-[12px] text-[#c0453a] mb-5"
        >
          ← Back to Campaigns
        </button>

        <div className="text-[22px]">{campaign.title}</div>

        <div className="mt-2 mb-4">
          <StatusBadge status={campaign.isActive ? "Active" : "Inactive"} />
        </div>

        <div className="grid grid-cols-3 gap-3 my-5">
          <Card>
            <div>Raised</div>
            <div>₹{campaign.raised}</div>
          </Card>

          <Card>
            <div>Goal</div>
            <div>₹{campaign.goalAmount}</div>
          </Card>

          <Card>
            <div>Donations</div>
            <div>{campaign.donationsCount}</div>
          </Card>
        </div>

        <Card>
          <div className="flex justify-between mb-2">
            <span>Progress</span>
            <span>{campaign.pct}%</span>
          </div>
          <ProgressBar pct={campaign.pct} color={campaign.color} />
        </Card>

      </div>
    );
  }

  return (
    <div className="flex-1 p-5 md:p-7 flex flex-col overflow-hidden">

      <div className="mb-6">
        <div className="text-[22px]">Campaigns</div>
        <div className="text-[12px] text-[#888]">
          All active fundraising campaigns
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 overflow-y-auto">
        {campaigns.map((c, i) => (
          <Card key={i} onClick={() => setSelected(i)} className="cursor-pointer">

            <div className="flex justify-between mb-2">
              <div>{c.title}</div>
              <StatusBadge status={c.isActive ? "Active" : "Inactive"} />
            </div>

            <div className="flex justify-between text-xs mb-2">
              <span>₹{c.raised} raised</span>
              <span>Goal: ₹{c.goalAmount}</span>
            </div>

            <ProgressBar pct={c.pct} color={c.color} />

            <div className="flex justify-between text-xs mt-2 text-[#888]">
              <span>{c.pct}% funded</span>
              <span>{c.donationsCount} donations</span>
            </div>

          </Card>
        ))}
      </div>

    </div>
  );
}

export default CampaignsPage;