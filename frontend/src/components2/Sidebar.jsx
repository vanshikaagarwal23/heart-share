import "./Sidebar.css";
import Avatar from "./Avatar";

const NAV = ["Dashboard","Donations","Campaigns","Volunteers","Reports"];

export default function Sidebar({ activePage, setActivePage }) {
  return (
    <div className="sidebar">
      <div className="logo">
        <div className="dot" />
        Heart Share
      </div>

      <div className="profile">
        <Avatar initials="NA" bg="#e8c1a0" text="#7a4a2a" size={34} />
        <div>
          <div className="name">NGO Admin</div>
          <div className="role">Volunteer Lead</div>
        </div>
      </div>

      <nav className="nav">
        {NAV.map(item => (
          <div
            key={item}
            onClick={() => setActivePage(item)}
            className={`nav-item ${activePage === item ? "active" : ""}`}
          >
            {item}
          </div>
        ))}
      </nav>

      <div className="logout">Log out</div>
    </div>
  );
}