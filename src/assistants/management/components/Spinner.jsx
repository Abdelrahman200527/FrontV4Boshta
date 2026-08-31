import { Loader2 } from "lucide-react";

export const Spinner = ({ size = 20, className = "" }) => (
  <Loader2 size={size} className={`animate-spin ${className}`} />
);

export const LoadingState = ({ label = "جاري التحميل..." }) => (
  <div className="flex flex-col items-center justify-center py-20 gap-3 text-gray-500">
    <Spinner size={28} className="text-primary" />
    <p className="text-sm">{label}</p>
  </div>
);

export default Spinner;

export const SkeletonRows = ({ rows = 5, cols = 7 }) => (
  <>
    {Array.from({ length: rows }).map((_, r) => (
      <tr key={r} className="animate-pulse">
        {Array.from({ length: cols }).map((__, c) => (
          <td key={c} className="py-4 px-3">
            <div className="h-4 rounded bg-gray-200" />
          </td>
        ))}
      </tr>
    ))}
  </>
);
