import { useEffect, useState } from "react";
import Card from "../components/common/Card";
import { apiRequest } from "../services/api";

function AdminPage() {
  const [ngos, setNgos] = useState([]);

  const fetchNGOs = async () => {
    try {
      const res = await apiRequest("/ngo/all");
      const data = res.data || res;
      setNgos(data);
    } catch (err) {
      console.error("NGO Fetch Error:", err.message);
    }
  };

  useEffect(() => {
    fetchNGOs();
  }, []);

  const handleVerify = async (id) => {
    try {
      await apiRequest(`/ngo/verify/${id}`, "PATCH");
      alert("NGO Verified ✅");
      fetchNGOs();
    } catch (err) {
      alert(err.message);
    }
  };

  return (
    <div className="flex-1 p-5 md:p-7 flex flex-col overflow-hidden">

      <div className="mb-6">
        <div className="text-[22px] text-[#1a1a1a]">
          Admin Panel
        </div>
        <div className="text-[12px] text-[#888]">
          Manage NGO verification
        </div>
      </div>

      <Card className="flex-1 overflow-auto">
        <table className="w-full text-[13px]">
          <thead>
            <tr>
              <th>Name</th>
              <th>Email</th>
              <th>Status</th>
              <th>Action</th>
            </tr>
          </thead>

          <tbody>
            {ngos.map((ngo) => (
              <tr key={ngo._id}>
                <td>{ngo.name}</td>
                <td>{ngo.user?.email}</td>

                <td>
                  {ngo.isVerified ? "✅ Verified" : "⏳ Pending"}
                </td>

                <td>
                  {!ngo.isVerified && (
                    <button
                      onClick={() => handleVerify(ngo._id)}
                      className="bg-green-500 text-white px-2 rounded"
                    >
                      Verify
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </Card>

    </div>
  );
}

export default AdminPage;