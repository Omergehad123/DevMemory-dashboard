"use client";

import { useEffect } from "react";

export default function Error({ error, reset }) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="flex flex-col items-center justify-center min-h-[50vh] text-center px-4">
      <div className="p-8 bg-[#111827] rounded-2xl border border-[#1e293b] max-w-md w-full">
        <h2 className="text-xl font-bold text-white mb-3">Something went wrong!</h2>
        <p className="text-xs text-slate-400 mb-6">
          {error?.message || "An unexpected error occurred while loading this section."}
        </p>
        <button
          onClick={() => reset()}
          className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-semibold shadow-lg shadow-indigo-600/30 transition-all cursor-pointer"
        >
          Try Again
        </button>
      </div>
    </div>
  );
}
