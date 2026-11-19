
import React from "react";

export default function PlanDetails({ highlight }) {
  return (
    <button
      type="button"
      className={`w-full py-2.5 rounded-lg text-sm font-semibold transition-all duration-300 ${
        highlight
          ? "bg-purple-600 text-white hover:bg-purple-500"
          : "bg-white/10 text-white border border-white/15 hover:bg-purple-600 hover:border-purple-600"
      }`}
    >
      Select Plan
    </button>
  );
}
