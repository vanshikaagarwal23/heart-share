import { useState, useEffect } from "react";
import StatusBadge from "../components/ui/StatusBadge";
import ProgressBar from "../components/ui/ProgressBar";
import Card from "../components/common/Card";
import { apiRequest } from "../services/api";

function CampaignsPage() {
  const [selected, setSelected] = useState(null);
  const [campaigns, setCampaigns] = useState([]);
 const [selectedCampaign, setSelectedCampaign] = useState(null);
const [applied, setApplied] = useState(false);
const [loadingApply, setLoadingApply] = useState(false);
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

 const handleApply = async () => {
  try {
    setLoadingApply(true);

    await apiRequest("/volunteers/apply", "POST", {
      campaignId: selectedCampaign._id,
    });

    setApplied(true);
  } catch (err) {
    console.error(err.message);
  } finally {
    setLoadingApply(false);
  }
};

  if (selected !== null) {
    const campaign = campaigns[selected];
    if (!campaign) return null;

    return (
      <div className="flex-1 p-4 md:p-7 flex flex-col">

        <button
          onClick={() => {
  setSelected(null);
  setApplied(false);
}}
          className="text-sm text-[#c0453a] mb-4 hover:underline"
        >
          ← Back to Campaigns
        </button>

        <div className="text-xl md:text-2xl font-semibold">{campaign.title}</div>

        <div className="mt-2 mb-4">
          <StatusBadge status={campaign.isActive ? "Active" : "Inactive"} />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 my-4">
          <Card>
            <div className="text-sm text-[#777]">Raised</div>
            <div className="text-lg font-semibold">₹{campaign.raised}</div>
          </Card>

          <Card>
            <div className="text-sm text-[#777]">Goal</div>
            <div className="text-lg font-semibold">₹{campaign.goalAmount}</div>
          </Card>

          <Card>
            <div className="text-sm text-[#777]">Donations</div>
            <div className="text-lg font-semibold">{campaign.donationsCount}</div>
          </Card>
        </div>

        <Card>
          <div className="flex justify-between mb-2 text-sm">
            <span>Progress</span>
            <span>{campaign.pct}%</span>
          </div>
          <ProgressBar pct={campaign.pct} color={campaign.color} />
        </Card>

        <Card className="mt-4">
          <div className="text-sm font-medium mb-1">Description</div>
          <div className="text-sm text-[#666]">
            {campaign.description || "No description available"}
          </div>
        </Card>

        <div className="mt-5">
          <button
            onClick={() => handleApply(campaign._id)}
            disabled={applied || loadingApply}
            className={`px-4 py-2 rounded text-white text-sm transition ${applied
                ? "bg-gray-400"
                : "bg-[#ff6600] hover:bg-[#e65c00]"
              }`}
          >
            {applied
              ? "Applied"
              : loadingApply
                ? "Applying..."
                : "Volunteer Myself"}
          </button>
        </div>

      </div>
    );
  }

  return (
    <div className="flex-1 p-4 md:p-7 flex flex-col">

      <div className="mb-6 flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3">
        <div>
          <div className="text-xl md:text-2xl font-semibold">Campaigns</div>
          <div className="text-xs text-[#888]">
            All active fundraising campaigns
          </div>
        </div>

        <button
          onClick={() => setShowModal(true)}
          className="bg-[#ff6600] hover:bg-[#e65c00] transition text-white px-4 py-2 rounded text-sm shadow-sm"
        >
          + Create Campaign
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 overflow-y-auto">
        {campaigns.map((c, i) => (
          <Card
            key={i}
            onClick={() => {
  console.log("clicked", c);
  setSelectedCampaign(c);
}}
            className="cursor-pointer hover:shadow-md transition"
          >

            <div className="flex justify-between mb-2">
              <div className="font-medium">{c.title}</div>
              <StatusBadge status={c.isActive ? "Active" : "Inactive"} />
            </div>

            <div className="flex justify-between text-xs mb-2 text-[#666]">
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
        <div className="fixed inset-0 bg-black/40 flex justify-center items-center z-50 px-3">
          <div className="bg-white p-5 md:p-6 rounded-xl w-full max-w-md shadow-lg">

            <div className="text-lg font-semibold mb-4">Create Campaign</div>

            <input
              placeholder="Title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full mb-3 p-2.5 border border-black/10 rounded outline-none focus:ring-2 focus:ring-[#ff6600]/40"
            />

            <textarea
              placeholder="Description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full mb-3 p-2.5 border border-black/10 rounded outline-none focus:ring-2 focus:ring-[#ff6600]/40"
            />

            <input
              placeholder="Goal Amount"
              type="number"
              value={goalAmount}
              onChange={(e) => setGoalAmount(e.target.value)}
              className="w-full mb-4 p-2.5 border border-black/10 rounded outline-none focus:ring-2 focus:ring-[#ff6600]/40"
            />

            <div className="flex justify-end gap-2">
              <button
                onClick={() => setShowModal(false)}
                className="px-3 py-1.5 text-sm hover:bg-gray-100 rounded"
              >
                Cancel
              </button>

              <button
                onClick={handleCreate}
                className="bg-[#ff6600] hover:bg-[#e65c00] transition text-white px-4 py-1.5 rounded text-sm"
              >
                Create
              </button>
            </div>

          </div>
        </div>
      )}

      {selectedCampaign && (
  <div className="fixed inset-0 bg-black/40 flex justify-center items-center z-50 px-3">
    <div className="bg-white w-full max-w-md p-5 rounded-xl shadow-lg">

      <div className="flex justify-between items-center mb-3">
        <div className="text-lg font-semibold">{selectedCampaign.title}</div>
        <button
          onClick={() => {
            setSelectedCampaign(null);
            setApplied(false);
          }}
          className="text-sm text-gray-500"
        >
          ✕
        </button>
      </div>

      <StatusBadge status={selectedCampaign.isActive ? "Active" : "Inactive"} />

      <div className="mt-3 text-sm text-[#666]">
        {selectedCampaign.description || "No description available"}
      </div>

      <div className="mt-4 text-sm text-[#444] space-y-1">
        <div>Goal: ₹{selectedCampaign.goalAmount}</div>
        <div>Raised: ₹{selectedCampaign.raised}</div>
        <div>Donations: {selectedCampaign.donationsCount}</div>
        <div>
          Created: {new Date(selectedCampaign.createdAt).toLocaleDateString()}
        </div>
      </div>

      <div className="mt-4">
        <button
          onClick={handleApply}
          disabled={applied || loadingApply}
          className={`w-full py-2 rounded text-white text-sm transition ${
            applied
              ? "bg-gray-400"
              : "bg-[#ff6600] hover:bg-[#e65c00]"
          }`}
        >
          {applied
            ? "Applied"
            : loadingApply
            ? "Applying..."
            : "Volunteer Myself"}
        </button>
      </div>

      <div className="mt-3 text-xs text-center text-[#888]">
        Status: {applied ? "Pending" : "Not Applied"}
      </div>

    </div>
  </div>
)}

    </div>
  );
}

export default CampaignsPage;