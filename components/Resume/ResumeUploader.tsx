'use client';

import { useRef } from 'react';
import { UploadCloud } from 'lucide-react';

interface Props {
  onSelect: (file: File) => void;
}

export default function ResumeUploader({ onSelect }: Props) {
  const inputRef = useRef<HTMLInputElement>(null);

  return (
    <div
      onClick={() => inputRef.current?.click()}
      className="cursor-pointer rounded-2xl border-2 border-dashed border-cyan-500/30 bg-slate-900 p-12 text-center hover:border-cyan-400 transition"
    >
      <UploadCloud className="mx-auto h-14 w-14 text-cyan-400 mb-4" />

      <h2 className="text-xl font-semibold text-white">
        Upload Resume
      </h2>

      <p className="text-slate-400 mt-2">
        PDF only (Max 5 MB)
      </p>

      <input
        ref={inputRef}
        hidden
        type="file"
        accept=".pdf"
        onChange={(e) => {
          if (e.target.files?.[0]) {
            onSelect(e.target.files[0]);
          }
        }}
      />
    </div>
  );
}