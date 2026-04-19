import {useState} from "react";
import S from "../components/SharedStyles";
import "./Donations.css";
import {allDonations} from "../data";

function DonationsPage() {
  const [filter, setFilter] = useState("All");
  const methods = ["All", "UPI", "Card", "Bank"];
  const filtered = filter === "All" ? allDonations : allDonations.filter(d => d.method === filter);

  return (
    <div style={{ flex: 1, padding: "28px", display: "flex", flexDirection: "column", overflow: "hidden" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "24px" }}>
        <div>
          <div style={{ fontFamily: "'DM Serif Display',serif", fontSize: "22px", color: "#1a1a1a" }}>Donations</div>
          <div style={{ fontSize: "12px", color: "#888", marginTop: "2px" }}>All incoming contributions</div>
        </div>
        <div style={{ display: "flex", gap: "6px" }}>
          {methods.map(m => (
            <button key={m} onClick={() => setFilter(m)} style={{
              fontSize: "12px", padding: "6px 12px", borderRadius: "20px",
              border: "0.5px solid rgba(0,0,0,0.12)", cursor: "pointer",
              fontFamily: "'DM Sans',sans-serif",
              background: filter === m ? "#c0453a" : "#f4f0ec",
              color: filter === m ? "#fff" : "#555",
            }}>{m}</button>
          ))}
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: "12px", marginBottom: "20px" }}>
        {[
          { label: "Total Collected", value: "₹2.7L" },
          { label: "This Month",      value: "₹38,000" },
          { label: "Avg Donation",    value: "₹2,160" },
        ].map(s => (
          <div key={s.label} style={S.card}>
            <div style={{ fontSize: "11px", color: "#888", textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: "6px" }}>{s.label}</div>
            <div style={{ fontSize: "20px", fontWeight: 500, color: "#1a1a1a" }}>{s.value}</div>
          </div>
        ))}
      </div>

      <div style={{ ...S.card, flex: 1, overflowY: "auto" }}>
        <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "13px" }}>
          <thead>
            <tr>
              {["Donor","Amount","Campaign","Date","Method"].map(h => (
                <th key={h} style={{ textAlign: "left", padding: "8px 12px", color: "#888", fontWeight: 500, fontSize: "11px", textTransform: "uppercase", letterSpacing: "0.05em", borderBottom: "0.5px solid rgba(0,0,0,0.08)" }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filtered.map((d, i) => (
              <tr key={i} style={{ borderBottom: "0.5px solid rgba(0,0,0,0.05)" }}>
                <td style={{ padding: "10px 12px", color: "#1a1a1a", fontWeight: 500 }}>{d.name}</td>
                <td style={{ padding: "10px 12px", color: "#c0453a", fontWeight: 500 }}>{d.amount}</td>
                <td style={{ padding: "10px 12px", color: "#555" }}>{d.campaign}</td>
                <td style={{ padding: "10px 12px", color: "#888" }}>{d.date}</td>
                <td style={{ padding: "10px 12px" }}>
                  <span style={S.badge(
                    d.method === "UPI" ? "#1e3a8a" : d.method === "Card" ? "#14532d" : "#78350f",
                    d.method === "UPI" ? "#e8f0fd" : d.method === "Card" ? "#e8fdf0" : "#fdf5e8"
                  )}>{d.method}</span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default DonationsPage;
