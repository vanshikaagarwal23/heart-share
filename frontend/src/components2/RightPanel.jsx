import "./RightPanel.css";
import Avatar from "./Avatar";
import ProgressBar from "./ProgressBar";
import { donors, campaigns } from "../data";

export default function RightPanel() {
  return (
    <div className="right-panel">
      <h4>Top donors</h4>

      {donors.map((d, i) => (
        <div key={d.name} className="donor">
          <Avatar initials={d.initials} bg={d.bg} text={d.text} size={30} />
          <div>
            <div>{d.name}</div>
            <small>#{i + 1} donor</small>
          </div>
          <span>{d.amount}</span>
        </div>
      ))}

      <h4>Campaigns</h4>

      {campaigns.map(c => (
        <div key={c.name}>
          <div className="campaign-row">
            <span>{c.name}</span>
            <span>{c.pct}%</span>
          </div>
          <ProgressBar pct={c.pct} color={c.color} />
        </div>
      ))}
    </div>
  );
}