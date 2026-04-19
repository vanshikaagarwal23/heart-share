// ── Donors ─────────────────────────────────────
export const donors = [
  { name: "Amit Sharma",  amount: "₹4,000", initials: "AS", bg: "#fde8e8", text: "#8b2020" },
  { name: "Priya Verma",  amount: "₹3,200", initials: "PV", bg: "#e8f0fd", text: "#1e3a8a" },
  { name: "Rajan Mehta",  amount: "₹2,800", initials: "RM", bg: "#e8fdf0", text: "#14532d" },
  { name: "Sunita Rao",   amount: "₹2,100", initials: "SR", bg: "#fdf5e8", text: "#78350f" },
  { name: "Deepak Joshi", amount: "₹1,500", initials: "DJ", bg: "#f3e8fd", text: "#4a1d96" },
];


// ── Campaigns ──────────────────────────────────
export const campaigns = [
  { name: "Food Drive",      pct: 78, color: "#c0453a", raised: "₹1.2L", goal: "₹1.5L", volunteers: 24, status: "Active" },
  { name: "Blanket Project", pct: 54, color: "#d4833a", raised: "₹0.8L", goal: "₹1.4L", volunteers: 18, status: "Active" },
  { name: "School Kits",     pct: 35, color: "#2a7a44", raised: "₹0.4L", goal: "₹1.1L", volunteers: 12, status: "Active" },
  { name: "Medical Camp",    pct: 90, color: "#1e3a8a", raised: "₹1.8L", goal: "₹2.0L", volunteers: 30, status: "Closing" },
  { name: "Water for All",   pct: 20, color: "#6b21a8", raised: "₹0.2L", goal: "₹1.0L", volunteers: 8,  status: "New" },
];


// ── Volunteers ─────────────────────────────────
export const volunteers = [
  { name: "Arjun Singh",  role: "Field Coordinator",  hours: 120, campaigns: 3, initials: "AS", bg: "#fde8e8", text: "#8b2020", status: "Active" },
  { name: "Meera Nair",   role: "Medical Support",    hours: 95,  campaigns: 2, initials: "MN", bg: "#e8fdf0", text: "#14532d", status: "Active" },
  { name: "Rahul Gupta",  role: "Logistics",          hours: 80,  campaigns: 4, initials: "RG", bg: "#e8f0fd", text: "#1e3a8a", status: "Active" },
  { name: "Kavya Reddy",  role: "Community Outreach", hours: 60,  campaigns: 2, initials: "KR", bg: "#fdf5e8", text: "#78350f", status: "On Leave" },
  { name: "Nikhil Joshi", role: "Driver",             hours: 45,  campaigns: 1, initials: "NJ", bg: "#f3e8fd", text: "#4a1d96", status: "Active" },
  { name: "Sneha Patel",  role: "Data Entry",         hours: 30,  campaigns: 2, initials: "SP", bg: "#fde8f3", text: "#831843", status: "Active" },
];


// ── Donations Table ────────────────────────────
export const allDonations = [
  { name: "Amit Sharma",  amount: "₹4,000", campaign: "Food Drive",      date: "12 Apr 2026", method: "UPI" },
  { name: "Priya Verma",  amount: "₹3,200", campaign: "School Kits",     date: "10 Apr 2026", method: "Card" },
  { name: "Rajan Mehta",  amount: "₹2,800", campaign: "Blanket Project", date: "08 Apr 2026", method: "UPI" },
  { name: "Sunita Rao",   amount: "₹2,100", campaign: "Medical Camp",    date: "05 Apr 2026", method: "Bank" },
  { name: "Deepak Joshi", amount: "₹1,500", campaign: "Water for All",   date: "02 Apr 2026", method: "UPI" },
  { name: "Pooja Iyer",   amount: "₹1,200", campaign: "Food Drive",      date: "01 Apr 2026", method: "Card" },
  { name: "Karan Shah",   amount: "₹900",   campaign: "School Kits",     date: "28 Mar 2026", method: "UPI" },
  { name: "Divya Kumar",  amount: "₹750",   campaign: "Medical Camp",    date: "25 Mar 2026", method: "Bank" },
];


// ── Chart Data ────────────────────────────────
export const months = ["May","Jun","Jul","Aug","Sep","Oct","Nov","Dec","Jan","Feb","Mar","Apr"];

export const vals = [
  12000,18000,15000,22000,19000,27000,
  24000,31000,26000,34000,28000,38000
];

// ── Statistics ────────────────────────────────
export const stats = [
  { label: "Total Donations", value: "₹2.7L", delta: "↑ 14% vs last year" },
  { label: "People Helped", value: "1,250", delta: "↑ 8% vs last year" },
  { label: "Items Distributed", value: "3,400", delta: "↑ 21% vs last year" },
];