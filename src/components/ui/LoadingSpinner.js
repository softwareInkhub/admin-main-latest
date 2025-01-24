export default function LoadingSpinner({ size = "md" }) {
  const sizeClasses = {
    sm: "h-4 w-4",
    md: "h-8 w-8",
    lg: "h-12 w-12"
  };

  return (
    <div className="flex justify-center items-center">
      <div className={`${sizeClasses[size]} animate-spin`}>
        <div className="h-full w-full border-4 border-gray-700 rounded-full border-t-indigo-500"></div>
      </div>
    </div>
  );
} 