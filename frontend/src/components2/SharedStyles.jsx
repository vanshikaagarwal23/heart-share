const S= {
  card: {
    background: "#f7f4f0",
    borderRadius: "10px",
    padding: "16px",
  },
  sectionTitle: {
    fontSize: "13px",
    fontWeight: 500,
    color: "#1a1a1a",
    marginBottom: "14px",
    fontFamily: "'DM Serif Display', serif",
  },
  badge: (color, bg) => ({
    fontSize: "10px",
    fontWeight: 500,
    padding: "3px 8px",
    borderRadius: "20px",
    background: bg || "black", // fix: use bg param
    color: color,
  }),
};

export default S;