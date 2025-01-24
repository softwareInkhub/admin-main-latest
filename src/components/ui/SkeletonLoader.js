export default function SkeletonLoader({ className = "", count = 1 }) {
  return (
    <>
      {[...Array(count)].map((_, i) => (
        <div
          key={i}
          className={`animate-pulse bg-gray-700 rounded-lg ${className}`}
        />
      ))}
    </>
  );
} 