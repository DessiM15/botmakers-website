"use client";

interface Props {
  progress: number;
  currentPhase: string;
  totalPhases: number;
  currentPhaseIndex: number;
}

export default function ProgressBar({
  progress,
  currentPhase,
  totalPhases,
  currentPhaseIndex,
}: Props) {
  return (
    <div className="bg-white border border-gray-200 rounded-xl p-6">
      <div className="flex items-center justify-between mb-3">
        <span className="text-sm text-gray-500">Overall Progress</span>
        <span className="text-lg font-bold text-[#033457]">{progress}%</span>
      </div>
      <div className="w-full h-4 bg-gray-100 rounded-full overflow-hidden mb-3">
        <div
          className="h-full bg-[#03FF00] rounded-full transition-all duration-700 ease-out"
          style={{ width: `${progress}%` }}
        />
      </div>
      <p className="text-sm text-gray-500">
        Phase {currentPhaseIndex + 1} of {totalPhases}:{" "}
        <span className="font-medium text-[#033457]">{currentPhase}</span>
      </p>
    </div>
  );
}
