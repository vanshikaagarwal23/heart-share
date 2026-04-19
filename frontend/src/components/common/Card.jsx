export default function Card({ children, className = "", onClick }) {
  return (
    <div
      onClick={onClick}
      className={`bg-white rounded-xl p-4 shadow-sm ${className}`}
    >
      {children}
    </div>
  );
}