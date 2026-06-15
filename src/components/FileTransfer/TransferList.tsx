import React from 'react';
import type { TransferItemState } from '../../types';
import TransferItem from './TransferItem';

interface TransferListProps {
  transfers: TransferItemState[];
}

export const TransferList: React.FC<TransferListProps> = ({ transfers }) => {
  return (
    <div className="space-y-3">
      <h3 className="text-xs font-semibold text-slate-350 tracking-wide uppercase">Transfer History</h3>
      <div className="space-y-2.5 max-h-[320px] overflow-y-auto pr-1">
        {transfers.length === 0 ? (
          <div className="text-slate-600 text-center py-8 border border-dashed border-slate-800/40 rounded-lg text-sm bg-slate-950/10">
            No files transferred yet
          </div>
        ) : (
          transfers.map((item) => (
            <TransferItem key={item.id} item={item} />
          ))
        )}
      </div>
    </div>
  );
};

export default TransferList;
