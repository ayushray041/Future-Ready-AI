'use client';

interface Props {
  progress: number;
}

export default function UploadProgress({ progress }: Props) {
  return (
    <div className="w-full mt-6">
      <div className="flex justify-between text-sm text-slate-300 mb-2">
        <span>Uploading...</span>
        <span>{progress}%</span>
      </div>

      <div className="h-3 rounded-full bg-slate-800 overflow-hidden">
        <div
          className="h-full bg-cyan-500 transition-all"
          style={{ width: `${progress}%` }}
        />
      </div>
    </div>
  );
}