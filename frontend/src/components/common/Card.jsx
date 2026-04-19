export default function Card({ children, className = "" }) {
  return (
    <div className={`bg-[#f7f4f0] rounded-[10px] p-4 ${className}`}>
      {children}
    </div>
  );
}