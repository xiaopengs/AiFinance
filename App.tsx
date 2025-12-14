import React, { useState, useEffect, useMemo } from 'react';
import { GoogleGenAI } from "@google/genai";
import Dashboard from './components/Dashboard';
import TransactionInput from './components/TransactionInput';
import TransactionList from './components/TransactionList';
import { HomeIcon, ChartIcon, PlusIcon, WalletIcon, SparklesIcon } from './components/Icons';
import { Transaction, TransactionType } from './types';
import { generateFinancialAdvice } from './services/geminiService';

const MOCK_DATA: Transaction[] = [
    { id: '1', amount: 45.00, category: 'Fuel', merchant: 'Shell Station', date: '2023-10-25', type: TransactionType.EXPENSE, currency: 'USD', notes: 'Weekly gas' },
    { id: '2', amount: 12.50, category: 'Food', merchant: 'Burger King', date: '2023-10-26', type: TransactionType.EXPENSE, currency: 'USD', notes: 'Lunch' },
    { id: '3', amount: 3200.00, category: 'Salary', merchant: 'Tech Corp', date: '2023-10-01', type: TransactionType.INCOME, currency: 'USD', notes: 'Monthly Salary' },
    { id: '4', amount: 120.00, category: 'Utilities', merchant: 'Electric Co', date: '2023-10-15', type: TransactionType.EXPENSE, currency: 'USD', notes: 'October Bill' },
];

enum Tab {
  HOME = 'HOME',
  STATS = 'STATS'
}

function App() {
  const [activeTab, setActiveTab] = useState<Tab>(Tab.HOME);
  const [isAddModalOpen, setAddModalOpen] = useState(false);
  const [transactions, setTransactions] = useState<Transaction[]>(() => {
    const saved = localStorage.getItem('lumina_transactions');
    return saved ? JSON.parse(saved) : MOCK_DATA;
  });
  const [aiInsight, setAiInsight] = useState<string>("");

  useEffect(() => {
    localStorage.setItem('lumina_transactions', JSON.stringify(transactions));
  }, [transactions]);

  // Load insight on mount
  useEffect(() => {
     if(process.env.API_KEY) {
        generateFinancialAdvice(transactions).then(setAiInsight);
     }
  }, []); // Run once on load

  const handleAddTransaction = (newTx: Transaction) => {
    setTransactions(prev => [newTx, ...prev]);
  };

  const handleDeleteTransaction = (id: string) => {
    setTransactions(prev => prev.filter(t => t.id !== id));
  };

  const financialData = useMemo(() => {
    const income = transactions.filter(t => t.type === TransactionType.INCOME).reduce((acc, t) => acc + t.amount, 0);
    const expense = transactions.filter(t => t.type === TransactionType.EXPENSE).reduce((acc, t) => acc + t.amount, 0);
    return {
        totalBalance: income - expense,
        monthlySpend: expense // Simplified for demo
    };
  }, [transactions]);

  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-900 mx-auto max-w-md relative shadow-2xl overflow-hidden border-x border-slate-200">
      
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-md sticky top-0 z-30 px-6 py-4 border-b border-slate-100 flex justify-between items-center">
        <div className="flex items-center gap-2">
            <div className="bg-indigo-600 p-2 rounded-xl">
                <WalletIcon className="w-5 h-5 text-white" />
            </div>
            <h1 className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-indigo-600 to-violet-600">
            Lumina
            </h1>
        </div>
        <div className="w-8 h-8 rounded-full bg-slate-200 overflow-hidden border-2 border-white shadow-sm">
            <img src="https://picsum.photos/100/100" alt="Profile" className="w-full h-full object-cover" />
        </div>
      </header>

      {/* Content Area */}
      <main className="p-4 h-[calc(100vh-140px)] overflow-y-auto no-scrollbar">
        
        {/* AI Insight Pill */}
        {aiInsight && (
            <div className="mb-6 bg-gradient-to-r from-indigo-50 to-violet-50 p-3 rounded-xl border border-indigo-100 flex gap-3 items-start animate-fade-in">
                <SparklesIcon className="w-5 h-5 text-indigo-500 mt-0.5 shrink-0" />
                <p className="text-xs text-indigo-900 leading-relaxed">{aiInsight}</p>
            </div>
        )}

        {activeTab === Tab.HOME && (
          <div className="animate-fade-in">
             <div className="bg-gradient-to-br from-indigo-600 to-violet-700 rounded-3xl p-6 text-white shadow-lg shadow-indigo-200 mb-6 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-10 -mt-10 blur-2xl"></div>
                <p className="text-indigo-100 text-sm font-medium mb-1">Total Balance</p>
                <h2 className="text-4xl font-bold mb-4">${financialData.totalBalance.toFixed(2)}</h2>
                <div className="flex gap-4">
                    <div className="bg-white/20 rounded-lg px-3 py-1.5 backdrop-blur-sm">
                        <span className="text-xs text-indigo-100 block">Income</span>
                        <span className="font-semibold">+${transactions.filter(t => t.type === TransactionType.INCOME).reduce((acc, t) => acc + t.amount, 0).toFixed(0)}</span>
                    </div>
                    <div className="bg-white/20 rounded-lg px-3 py-1.5 backdrop-blur-sm">
                        <span className="text-xs text-indigo-100 block">Expenses</span>
                        <span className="font-semibold">-${financialData.monthlySpend.toFixed(0)}</span>
                    </div>
                </div>
             </div>
             
             <TransactionList transactions={transactions} onDelete={handleDeleteTransaction} />
          </div>
        )}

        {activeTab === Tab.STATS && (
            <Dashboard 
                transactions={transactions} 
                totalBalance={financialData.totalBalance}
                monthlySpend={financialData.monthlySpend}
            />
        )}
      </main>

      {/* Floating Action Button */}
      <div className="absolute bottom-24 right-4 z-40">
        <button 
            onClick={() => setAddModalOpen(true)}
            className="bg-indigo-600 hover:bg-indigo-700 text-white p-4 rounded-full shadow-lg shadow-indigo-300 transition-transform hover:scale-110 active:scale-95 flex items-center justify-center"
        >
            <PlusIcon className="w-7 h-7" />
        </button>
      </div>

      {/* Bottom Navigation */}
      <nav className="absolute bottom-0 w-full bg-white border-t border-slate-100 px-6 py-2 pb-6 flex justify-around items-center z-30">
        <button 
            onClick={() => setActiveTab(Tab.HOME)}
            className={`flex flex-col items-center gap-1 p-2 transition-colors ${activeTab === Tab.HOME ? 'text-indigo-600' : 'text-slate-400 hover:text-slate-600'}`}
        >
            <HomeIcon className="w-6 h-6" />
            <span className="text-[10px] font-medium">Home</span>
        </button>
        <div className="w-12"></div> {/* Spacer for FAB */}
        <button 
            onClick={() => setActiveTab(Tab.STATS)}
            className={`flex flex-col items-center gap-1 p-2 transition-colors ${activeTab === Tab.STATS ? 'text-indigo-600' : 'text-slate-400 hover:text-slate-600'}`}
        >
            <ChartIcon className="w-6 h-6" />
            <span className="text-[10px] font-medium">Stats</span>
        </button>
      </nav>

      <TransactionInput 
        isOpen={isAddModalOpen} 
        onClose={() => setAddModalOpen(false)} 
        onAddTransaction={handleAddTransaction}
      />
      
      <style>{`
        @keyframes fade-in {
            from { opacity: 0; transform: translateY(10px); }
            to { opacity: 1; transform: translateY(0); }
        }
        .animate-fade-in {
            animation: fade-in 0.4s ease-out forwards;
        }
      `}</style>
    </div>
  );
}

export default App;