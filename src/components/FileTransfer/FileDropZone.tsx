import React, { useRef, useState } from 'react';
import { UploadCloud, FolderOpen } from 'lucide-react';

interface FileDropZoneProps {
  disabled: boolean;
  onFilesSelected: (files: FileList) => void;
}

export const FileDropZone: React.FC<FileDropZoneProps> = ({ disabled, onFilesSelected }) => {
  const [isDragActive, setIsDragActive] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (disabled) return;
    setIsDragActive(e.type === 'dragenter' || e.type === 'dragover');
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragActive(false);
    if (disabled || !e.dataTransfer.files.length) return;
    onFilesSelected(e.dataTransfer.files);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    e.preventDefault();
    if (e.target.files?.length) onFilesSelected(e.target.files);
  };

  return (
    <div
      onDragEnter={handleDrag}
      onDragOver={handleDrag}
      onDragLeave={handleDrag}
      onDrop={handleDrop}
      className={`drop-zone ${isDragActive ? 'drop-zone-active' : ''} ${disabled ? 'drop-zone-disabled' : ''}`}
    >
      <input ref={inputRef} type="file" multiple onChange={handleChange} disabled={disabled} className="hidden" />

      <UploadCloud
        className="w-9 h-9 mb-3 transition-transform duration-200"
        style={{
          color: isDragActive ? 'var(--cyan)' : 'rgba(100,140,170,0.5)',
          transform: isDragActive ? 'translateY(-4px) scale(1.05)' : 'none',
          filter: isDragActive ? 'drop-shadow(0 0 8px var(--cyan))' : 'none',
        }}
      />

      <p className="text-sm font-medium text-center mb-3 select-none" style={{ color: 'rgba(160,190,210,0.7)' }}>
        {disabled ? 'Connect a peer to send files' : isDragActive ? 'Drop files here' : 'Drag & drop files, or browse'}
      </p>

      {!disabled && (
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          className="btn-base btn-secondary text-xs gap-1.5 px-3 py-1.5"
        >
          <FolderOpen className="w-3.5 h-3.5" />
          Browse Files
        </button>
      )}
    </div>
  );
};

export default FileDropZone;
