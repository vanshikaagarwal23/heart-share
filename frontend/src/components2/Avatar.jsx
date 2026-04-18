import "./Avatar.css";

export default function Avatar({ initials, bg, text, size = 32 }) {
  return (
    <div
      className="avatar"
      style={{
        backgroundColor: bg,
        color: text,
        width: size,
        height: size,
        fontSize: size * 0.35,
      }}
    >
      {initials}
    </div>
  );
}