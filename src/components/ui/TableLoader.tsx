import React from "react";
import { cn } from "@/lib/utils";

interface TableLoaderProps {
  colSpan: number; // total number of table columns
  message?: string;
  size?: "sm" | "md" | "lg";
  className?: string;
}

const sizeClasses = {
  sm: "h-4 w-4",
  md: "h-6 w-6",
  lg: "h-8 w-8",
};

const TableLoader: React.FC<TableLoaderProps> = ({
  colSpan,
  message = "Loading...",
  size = "md",
  className,
}) => {
  return (
    <tr>
      <td colSpan={colSpan} className="px-3 py-16">
        <div
          className={cn("flex items-center justify-center space-x-3", className)}
        >
          <div
            className={cn(
              "animate-spin rounded-full border-2 border-gray-300 border-t-blue-600",
              sizeClasses[size]
            )}
          />
          <span className="text-sm text-gray-600">{message}</span>
        </div>
      </td>
    </tr>
  );
};

export default TableLoader;
