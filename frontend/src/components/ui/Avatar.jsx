export default function Avatar({ initials, name, bg, text, size = 32 }) {
  
  // 🆕 Auto generate initials if not passed
  const generatedInitials =
    initials ||
    (name
      ? name
          .split(" ")
          .map((n) => n[0])
          .join("")
          .slice(0, 2)
          .toUpperCase()
      : "U");

  return (
    <div
      className="rounded-full flex items-center justify-center font-medium shrink-0"
      style={{
        backgroundColor: bg || "#e8c1a0",
        color: text || "#7a4a2a",
        width: size,
        height: size,
        fontSize: size * 0.35,
      }}
    >
      {generatedInitials}
    </div>
  );
}