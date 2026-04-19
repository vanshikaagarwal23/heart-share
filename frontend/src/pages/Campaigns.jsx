import { useState, useEffect } from "react";
import StatusBadge from "../components/ui/StatusBadge";
import ProgressBar from "../components/ui/ProgressBar";
import Card from "../components/common/Card";
import { apiRequest } from "../services/api";

function CampaignsPage() {
  const [selected, setSelected] = useState(null);
  const [campaigns, setCampaigns] = useState([]);

  const [showModal, setShowModal] = useState(false);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [goalAmount, setGoalAmount] = useState("");

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

  useEffect(() => {
    fetchCampaigns();
  }, []);

  const handleCreate = async () => {
    try {
      await apiRequest("/campaigns/create", "POST", {
        title,
        description,
        goalAmount: Number(goalAmount),
      });

      setShowModal(false);
      setTitle("");
      setDescription("");
      setGoalAmount("");

      fetchCampaigns();
    } catch (err) {
      console.error(err.message);
    }
  };

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

      <div className="mb-6 flex justify-between items-center">
        <div>
          <div className="text-[22px]">Campaigns</div>
          <div className="text-[12px] text-[#888]">
            All active fundraising campaigns
          </div>
        </div>

        <button
          onClick={() => setShowModal(true)}
          className="bg-[#ff6600] hover:bg-[#e65c00] text-white px-4 py-2 rounded text-sm"
        >
          + Create Campaign
        </button>
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

      {showModal && (
        <div className="fixed inset-0 bg-black/30 flex justify-center items-center z-50">
          <div className="bg-white p-6 rounded-xl w-[320px] shadow-lg">

            <div className="text-lg mb-4">Create Campaign</div>

            <input
              placeholder="Title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full mb-3 p-2 border border-black/10 rounded outline-none focus:ring-2 focus:ring-[#ff6600]/40"
            />

            <input
              placeholder="Description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full mb-3 p-2 border border-black/10 rounded outline-none focus:ring-2 focus:ring-[#ff6600]/40"
            />

            <input
              placeholder="Goal Amount"
              type="number"
              value={goalAmount}
              onChange={(e) => setGoalAmount(e.target.value)}
              className="w-full mb-4 p-2 border border-black/10 rounded outline-none focus:ring-2 focus:ring-[#ff6600]/40"
            />

            <div className="flex justify-end gap-2">
              <button
                onClick={() => setShowModal(false)}
                className="px-3 py-1 text-sm"
              >
                Cancel
              </button>

              <button
                onClick={handleCreate}
                className="bg-[#ff6600] hover:bg-[#e65c00] text-white px-3 py-1 rounded text-sm"
              >
                Create
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
}

export default CampaignsPage;