import { useState, useEffect } from "react";
import Card from "../components/common/Card";
import StatusBadge from "../components/ui/StatusBadge";
import { apiRequest } from "../services/api";

function DonationsPage() {
  const [filter, setFilter] = useState("All");
  const [donations, setDonations] = useState([]);

  // 🆕 form state
  const [form, setForm] = useState({
    title: "",
    description: "",
    type: "money",
    amount: "",
  });

  // 🆕 role detection
  const token = localStorage.getItem("token");
  let role = null;

  if (token) {
    try {
      const decoded = JSON.parse(atob(token.split(".")[1]));
      role = decoded.role;
    } catch (err) {
      console.error("Token decode error");
    }
  }

  const methods = ["All", "UPI", "Card", "Bank"];

  // 📥 fetch donations
  const fetchDonations = async () => {
    try {
      const res = await apiRequest("/donations/getdonation");
      const data = res.data || res;
      setDonations(data);
    } catch (err) {
      console.error("Donation Fetch Error:", err.message);
    }
  };

  useEffect(() => {
    fetchDonations();
  }, []);

  // 🆕 create donation
  const handleCreate = async () => {
    try {
      await apiRequest("/donations/createdonation", "POST", form);

      alert("Donation Created ✅");

      setForm({
        title: "",
        description: "",
        type: "money",
        amount: "",
      });

      fetchDonations();
    } catch (err) {
      alert(err.message);
    }
  };

  // 🆕 update status (NGO only)
  const handleStatusUpdate = async (id, status) => {
    try {
      await apiRequest(`/donations/updatestatus/${id}`, "PATCH", {
        status,
      });

      alert(`Donation ${status} ✅`);
      fetchDonations();
    } catch (err) {
      alert(err.message);
    }
  };

  const filtered =
    filter === "All"
      ? donations
      : donations.filter((d) => d.method === filter);

  return (
    <div className="flex-1 p-5 md:p-7 flex flex-col overflow-hidden">

      {/* CREATE DONATION FORM */}
      <Card className="mb-5">
        <div className="text-[14px] font-medium mb-3">Create Donation</div>

        <div className="flex flex-wrap gap-2">
          <input
            placeholder="Title"
            value={form.title}
            onChange={(e) =>
              setForm({ ...form, title: e.target.value })
            }
            className="border p-2 rounded"
          />

          <input
            placeholder="Description"
            value={form.description}
            onChange={(e) =>
              setForm({ ...form, description: e.target.value })
            }
            className="border p-2 rounded"
          />

          <input
            placeholder="Amount"
            type="number"
            value={form.amount}
            onChange={(e) =>
              setForm({ ...form, amount: e.target.value })
            }
            className="border p-2 rounded"
          />

          <button
            onClick={handleCreate}
            className="bg-[#c0453a] text-white px-4 rounded"
          >
            Create
          </button>
        </div>
      </Card>

      {/* HEADER */}
      <div className="flex flex-col md:flex-row md:justify-between md:items-start gap-3 mb-6">
        <div>
          <div className="font-['DM_Serif_Display'] text-[22px] text-[#1a1a1a]">
            Donations
          </div>
          <div className="text-[12px] text-[#888] mt-[2px]">
            All incoming contributions
          </div>
        </div>

        <div className="flex flex-wrap gap-[6px]">
          {methods.map((m) => (
            <button
              key={m}
              onClick={() => setFilter(m)}
              className={`text-[12px] px-3 py-[6px] rounded-full border border-black/10 ${
                filter === m
                  ? "bg-[#c0453a] text-white"
                  : "bg-[#f4f0ec] text-[#555]"
              }`}
            >
              {m}
            </button>
          ))}
        </div>
      </div>

      {/* STATS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 mb-5">
        <Card>
          <div>Total Donations</div>
          <div>₹{donations.reduce((a, d) => a + (d.amount || 0), 0)}</div>
        </Card>

        <Card>
          <div>Total Entries</div>
          <div>{donations.length}</div>
        </Card>

        <Card>
          <div>Avg Donation</div>
          <div>
            ₹
            {donations.length
              ? Math.floor(
                  donations.reduce((a, d) => a + (d.amount || 0), 0) /
                    donations.length
                )
              : 0}
          </div>
        </Card>
      </div>

      {/* TABLE */}
      <Card className="flex-1 overflow-auto">
        <table className="w-full text-[13px]">
          <thead>
            <tr>
              <th>Title</th>
              <th>Amount</th>
              <th>Date</th>
              <th>Status</th>
              {role === "ngo" && <th>Actions</th>}
            </tr>
          </thead>

          <tbody>
            {filtered.map((d, i) => (
              <tr key={i}>
                <td>{d.title}</td>
                <td>₹{d.amount}</td>
                <td>{new Date(d.createdAt).toLocaleDateString()}</td>
                <td className="px-3 py-[10px]">
  <StatusBadge status={d.status} />
</td>

                {role === "ngo" && (
                  <td className="flex gap-2">
                    <button
                      onClick={() =>
                        handleStatusUpdate(d._id, "accepted")
                      }
                      className="bg-green-500 text-white px-2 rounded"
                    >
                      Accept
                    </button>

                    <button
                      onClick={() =>
                        handleStatusUpdate(d._id, "rejected")
                      }
                      className="bg-red-500 text-white px-2 rounded"
                    >
                      Reject
                    </button>
                  </td>
                )}
              </tr>
            ))}
          </tbody>
        </table>
      </Card>
    </div>
  );
}

export default DonationsPage;