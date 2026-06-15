import React from 'react';
import { ArrowUpRight, ArrowDownLeft, Download, File, FileText, Image, Video, Music } from 'lucide-react';
import type { TransferItemState } from '../../types';
import { formatSize } from '../../utils/formatSize';
import ProgressBar from '../common/ProgressBar';

interface TransferItemProps {
  item: TransferItemState;
}

export const TransferItem: React.FC<TransferItemProps> = ({ item }) => {
  const isSend = item.direction === 'send';

  const getFileIcon = () => {
    const type = item.type.toLowerCase();
    if (type.startsWith('image/')) return <Image className="w-5 h-5 text-cyan-400" />;
    if (type.startsWith('video/')) return <Video className="w-5 h-5 text-purple-400" />;
    if (type.startsWith('audio/')) return <Music className="w-5 h-5 text-pink-400" />;
    if (type.includes('pdf') || type.includes('text') || type.includes('document'))
      return <FileText className="w-5 h-5 text-blue-400" />;
    return <File className="w-5 h-5 text-slate-500" />;
  };

  return (
    <div className="glass-card flex flex-col gap-2.5">
      <div className="flex justify-between items-center gap-2">
        <div className="flex items-center gap-2.5 min-w-0">
          <div className="p-2 bg-slate-950/60 rounded-lg border border-slate-800/80">
            {getFileIcon()}
          </div>
          <div className="min-w-0">
            <p className="text-sm font-semibold text-slate-200 truncate" title={item.name}>
              {item.name}
            </p>
            <div className="text-xs text-slate-500 flex items-center gap-1.5 mt-0.5">
              <span>{formatSize(item.size)}</span>
              <span className="text-slate-700 font-bold">•</span>
              <span className="flex items-center gap-0.5">
                {isSend ? (
                  <>
                    <ArrowUpRight className="w-3.5 h-3.5 text-blue-400" />
                    Sent
                  </>
                ) : (
                  <>
                    <ArrowDownLeft className="w-3.5 h-3.5 text-emerald-400" />
                    Received
                  </>
                )}
              </span>
            </div>
          </div>
        </div>

        {item.status === 'completed' && item.blobUrl && (
          <a
            href={item.blobUrl}
            download={item.name}
            className="inline-flex items-center justify-center p-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white shadow-md shadow-emerald-600/10 transition-colors"
            title="Download File"
          >
            <Download className="w-4 h-4" />
          </a>
        )}
      </div>

      <ProgressBar progress={item.progress} status={item.status} speed={item.speed} />
      {item.error && <p className="text-[11px] text-rose-400 font-medium mt-0.5">{item.error}</p>}
    </div>
  );
};

export default TransferItem;
