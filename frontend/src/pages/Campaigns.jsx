import {useState} from "react";
import "./Campaigns.css";
import S from "../components/SharedStyles";
import {campaigns, volunteers} from "../data.js";
import StatusBadge from "../components/StatusBadge";
import Avatar from "../components/Avatar";
import ProgressBar from "../components/ProgressBar";

function CampaignsPage() {
  const [selected, setSelected] = useState(null);

  // ✅ DETAIL VIEW
  if (selected !== null) {
    const campaign = campaigns[selected];
    if (!campaign) return null;

    return (
      <div className="page">

        <button className="back-btn" onClick={() => setSelected(null)}>
          ← Back to Campaigns
        </button>

        <div className="page-title">{campaign.name}</div>
        <StatusBadge status={campaign.status} />

        <div className="grid-3">
          {[
            { label: "Raised", value: campaign.raised },
            { label: "Goal", value: campaign.goal },
            { label: "Volunteers", value: campaign.volunteers },
          ].map((stat) => (
            <div key={stat.label} style={S.card}>
              <div className="stat-label">{stat.label}</div>
              <div className="stat-value">{stat.value}</div>
            </div>
          ))}
        </div>

        <div style={S.card}>
          <div className="card-row">
            <span>Funding Progress</span>
            <span style={{ color: campaign.color }}>
              {campaign.pct}%
            </span>
          </div>

          <ProgressBar pct={campaign.pct} color={campaign.color} />
        </div>

        <div style={S.card}>
          <div className="section-title">Assigned Volunteers</div>

          {volunteers.slice(0, 3).map((v, i) => (
            <div key={i} className="vol-row">
              <Avatar initials={v.initials} bg={v.bg} text={v.text} />
              <div>
                <div className="name">{v.name}</div>
                <div className="muted">{v.role}</div>
              </div>
              <StatusBadge status={v.status} />
            </div>
          ))}
        </div>

      </div>
    );
  }

  // ✅ LIST VIEW
  return (
    <div className="page">

      <div className="page-header">
        <div className="page-title">Campaigns</div>
        <div className="page-subtitle">
          All active fundraising campaigns
        </div>
      </div>

      <div className="campaign-grid">
        {campaigns.map((campaign, i) => (
          <div
            key={i}
            onClick={() => setSelected(i)}
            className="campaign-card"
            style={S.card}
          >
            <div className="card-header">
              <div className="card-title">{campaign.name}</div>
              <StatusBadge status={campaign.status} />
            </div>

            <div className="card-row">
              <span>{campaign.raised} raised</span>
              <span>Goal: {campaign.goal}</span>
            </div>

            <ProgressBar pct={campaign.pct} color={campaign.color} />

            <div className="card-footer">
              <span>{campaign.pct}% funded</span>
              <span>{campaign.volunteers} volunteers</span>
            </div>
          </div>
        ))}
      </div>

    </div>
  );
}

export default CampaignsPage;