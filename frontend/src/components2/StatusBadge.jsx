import "./StatusBadge.css";

export default function StatusBadge({ status }) {
  const statusClass = {
    Active: "active",
    "On Leave": "leave",
    Closing: "closing",
    New: "new",
  };

  return (
    <span className={`badge ${statusClass[status] || ""}`}>
      {status}
    </span>
  );
}