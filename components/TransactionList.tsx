import React from 'react';
import { Transaction, TransactionType } from '../types';

interface TransactionListProps {
  transactions: Transaction[];
  onDelete: (id: string) => void;
}

const TransactionList: React.FC<TransactionListProps> = ({ transactions, onDelete }) => {
  const sorted = [...transactions].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  if (sorted.length === 0) {
    return (
        <div className="flex flex-col items-center justify-center py-12 text-slate-400">
            <p>No transactions yet.</p>
        </div>
    );
  }

  return (
    <div className="space-y-3 pb-24">
        <h3 className="font-bold text-slate-800 mb-2 px-1">Recent History</h3>
      {sorted.map((t) => (
        <div key={t.id} className="group bg-white p-4 rounded-xl shadow-sm border border-slate-100 flex items-center justify-between transition-all active:scale-[0.98]">
          <div className="flex items-center gap-4">
            <div className={`w-10 h-10 rounded-full flex items-center justify-center text-lg font-bold shrink-0 
                ${t.type === TransactionType.EXPENSE ? 'bg-red-50 text-red-500' : 'bg-green-50 text-green-500'}`}>
              {t.category.charAt(0).toUpperCase()}
            </div>
            <div>
              <p className="font-semibold text-slate-800 text-sm">{t.merchant || t.category}</p>
              <p className="text-xs text-slate-500">{t.date} • {t.category}</p>
            </div>
          </div>
          <div className="text-right">
            <p className={`font-bold ${t.type === TransactionType.EXPENSE ? 'text-slate-900' : 'text-green-600'}`}>
              {t.type === TransactionType.EXPENSE ? '-' : '+'} ${t.amount.toFixed(2)}
            </p>
            <button 
                onClick={(e) => { e.stopPropagation(); onDelete(t.id); }}
                className="text-xs text-red-400 opacity-0 group-hover:opacity-100 transition-opacity hover:text-red-600 mt-1"
            >
                Delete
            </button>
          </div>
        </div>
      ))}
    </div>
  );
};

export default TransactionList;