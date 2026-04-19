import "./ProgressBar.css";

export default function ProgressBar({ pct, color }) {
  return (
    <div className="progress">
      <div
        className="progress-fill"
        style={{
          width: `${pct}%`,
          backgroundColor: color,
        }}
      />
    </div>
  );
}