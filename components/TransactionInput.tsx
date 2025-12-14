import React, { useState, useRef, useEffect } from 'react';
import { SendIcon, SparklesIcon } from './Icons';
import { parseTransactionInput } from '../services/geminiService';
import { Transaction, TransactionType } from '../types';
import { v4 as uuidv4 } from 'uuid';

interface TransactionInputProps {
  onAddTransaction: (t: Transaction) => void;
  isOpen: boolean;
  onClose: () => void;
}

const TransactionInput: React.FC<TransactionInputProps> = ({ onAddTransaction, isOpen, onClose }) => {
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen && inputRef.current) {
        inputRef.current.focus();
    }
  }, [isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;

    setIsLoading(true);
    setError(null);

    try {
      const result = await parseTransactionInput(input);
      
      if (result) {
        const newTransaction: Transaction = {
          id: uuidv4(),
          amount: result.amount,
          category: result.category,
          merchant: result.merchant || 'Unknown',
          date: result.date,
          type: result.type === 'INCOME' ? TransactionType.INCOME : TransactionType.EXPENSE,
          currency: result.currency || 'USD',
          notes: result.notes || input
        };
        onAddTransaction(newTransaction);
        setInput('');
        onClose();
      } else {
        setError("Could not understand the transaction. Try: 'Lunch $15 at Subway'");
      }
    } catch (err) {
      setError("AI Service unavailable. Check API Key.");
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center pointer-events-none">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm pointer-events-auto" onClick={onClose} />

      {/* Modal/Bottom Sheet */}
      <div className="bg-white w-full sm:w-[400px] sm:rounded-2xl rounded-t-2xl p-6 shadow-2xl transform transition-transform duration-300 pointer-events-auto animate-slide-up">
        
        <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2">
                <SparklesIcon className="w-5 h-5 text-indigo-500" />
                AI Entry
            </h3>
            <button onClick={onClose} className="text-slate-400 hover:text-slate-600">
                <span className="text-2xl">&times;</span>
            </button>
        </div>

        <p className="text-sm text-slate-500 mb-4">
            Type naturally, e.g., "Spent $25 on gas today" or "Salary $5000".
        </p>

        <form onSubmit={handleSubmit} className="relative">
          <input
            ref={inputRef}
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Describe your transaction..."
            className="w-full bg-slate-50 border border-slate-200 rounded-xl py-4 pl-4 pr-12 text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all placeholder:text-slate-400"
            disabled={isLoading}
          />
          <button
            type="submit"
            disabled={isLoading || !input.trim()}
            className={`absolute right-2 top-2 p-2 rounded-lg transition-colors ${
              isLoading || !input.trim() 
                ? 'bg-slate-200 text-slate-400' 
                : 'bg-indigo-600 text-white hover:bg-indigo-700'
            }`}
          >
            {isLoading ? (
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
                <SendIcon className="w-5 h-5" />
            )}
          </button>
        </form>

        {error && (
            <p className="text-red-500 text-xs mt-3 bg-red-50 p-2 rounded-lg">{error}</p>
        )}
      </div>
      
      <style>{`
        @keyframes slide-up {
            from { transform: translateY(100%); }
            to { transform: translateY(0); }
        }
        .animate-slide-up {
            animation: slide-up 0.3s cubic-bezier(0.16, 1, 0.3, 1);
        }
      `}</style>
    </div>
  );
};

export default TransactionInput;