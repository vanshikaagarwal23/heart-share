import { useLocation } from "react-router-dom";

export default function Dashboard() {
  const location = useLocation();
  const name = location.state?.name || "User";

  return (
    <div style={{ textAlign: "center", padding: "40px" }}>
      <h1>Welcome {name} !</h1>
    </div>
  );
}