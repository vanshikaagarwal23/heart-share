import {useState} from "react";
import "./Volunteers.css";
import S from "../components/SharedStyles";
import {volunteers} from "../data.js";
import StatusBadge from "../components/StatusBadge";
import Avatar from "../components/Avatar";

function VolunteersPage() {
  const [search, setSearch] = useState("");
  const filtered = volunteers.filter(v =>
    v.name.toLowerCase().includes(search.toLowerCase()) ||
    v.role.toLowerCase().includes(search.toLowerCase())
  );

  return (
  <div className="page">

    <div className="page-header">
      <div>
        <div className="page-title">Volunteers</div>
        <div className="page-subtitle">
          Team managing field operations
        </div>
      </div>

      <input
        className="search-input"
        placeholder="Search volunteers..."
        value={search}
        onChange={e => setSearch(e.target.value)}
      />
    </div>

    <div className="stats-grid">
      {[
        { label: "Total Volunteers", value: volunteers.length },
        { label: "Active Now", value: volunteers.filter(v => v.status === "Active").length },
        { label: "Total Hours", value: volunteers.reduce((a, v) => a + v.hours, 0) },
      ].map(stat => (
        <div key={stat.label} style={S.card}>
          <div className="stat-label">{stat.label}</div>
          <div className="stat-value">{stat.value}</div>
        </div>
      ))}
    </div>

    <div className="list-card" style={S.card}>

      {filtered.length === 0 && (
        <div className="empty">No volunteers found.</div>
      )}

      {filtered.map((v, i) => (
        <div
          key={v.name}
          className="vol-row"
          style={{
            borderBottom: i < filtered.length - 1
              ? "0.5px solid rgba(0,0,0,0.06)"
              : "none"
          }}
        >
          <Avatar initials={v.initials} bg={v.bg} text={v.text} size={38} />

          <div className="vol-info">
            <div className="vol-name">{v.name}</div>
            <div className="vol-role">{v.role}</div>
          </div>

          <div className="vol-meta">
            <div className="vol-hours">{v.hours}h</div>
            <div className="vol-campaigns">{v.campaigns} campaigns</div>
          </div>

          <StatusBadge status={v.status} />
        </div>
      ))}

    </div>

  </div>
);
}

export default VolunteersPage;