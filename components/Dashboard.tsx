import React, { useMemo } from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, BarChart, Bar, XAxis, Tooltip, YAxis } from 'recharts';
import { Transaction, TransactionType } from '../types';

interface DashboardProps {
  transactions: Transaction[];
  totalBalance: number;
  monthlySpend: number;
}

const COLORS = ['#6366f1', '#8b5cf6', '#ec4899', '#f43f5e', '#f97316', '#eab308', '#22c55e', '#06b6d4', '#3b82f6'];

const Dashboard: React.FC<DashboardProps> = ({ transactions, totalBalance, monthlySpend }) => {
  
  const categoryData = useMemo(() => {
    const expenses = transactions.filter(t => t.type === TransactionType.EXPENSE);
    const catMap: Record<string, number> = {};
    
    expenses.forEach(t => {
      catMap[t.category] = (catMap[t.category] || 0) + t.amount;
    });

    return Object.keys(catMap).map(key => ({
      name: key,
      value: catMap[key]
    })).sort((a, b) => b.value - a.value);
  }, [transactions]);

  const recentTrendData = useMemo(() => {
    const sorted = [...transactions].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
    // Get last 7 days simplified
    const last7 = sorted.slice(-7);
    return last7.map(t => ({
      name: new Date(t.date).toLocaleDateString('en-US', { weekday: 'short' }),
      amount: t.type === TransactionType.EXPENSE ? t.amount : 0
    }));
  }, [transactions]);

  return (
    <div className="space-y-6 pb-24 animate-fade-in">
      {/* Cards */}
      <div className="grid grid-cols-2 gap-4">
        <div className="bg-white p-4 rounded-2xl shadow-sm border border-slate-100">
          <p className="text-slate-500 text-xs font-semibold uppercase tracking-wider">Total Balance</p>
          <p className={`text-2xl font-bold mt-1 ${totalBalance >= 0 ? 'text-slate-800' : 'text-red-500'}`}>
            ${totalBalance.toFixed(2)}
          </p>
        </div>
        <div className="bg-white p-4 rounded-2xl shadow-sm border border-slate-100">
          <p className="text-slate-500 text-xs font-semibold uppercase tracking-wider">Month Spending</p>
          <p className="text-2xl font-bold mt-1 text-slate-800">
            ${monthlySpend.toFixed(2)}
          </p>
        </div>
      </div>

      {/* Pie Chart */}
      <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-100">
        <h3 className="font-bold text-slate-800 mb-4">Expense Categories</h3>
        <div className="h-64 w-full">
          {categoryData.length > 0 ? (
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={categoryData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {categoryData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip 
                    formatter={(value: number) => `$${value.toFixed(2)}`}
                    contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                />
              </PieChart>
            </ResponsiveContainer>
          ) : (
             <div className="h-full w-full flex items-center justify-center text-slate-400">
               No expenses yet
             </div>
          )}
        </div>
        {/* Legend */}
        <div className="grid grid-cols-2 gap-2 mt-4">
            {categoryData.slice(0, 6).map((cat, idx) => (
                <div key={cat.name} className="flex items-center text-xs">
                    <span className="w-2 h-2 rounded-full mr-2" style={{ backgroundColor: COLORS[idx % COLORS.length] }}></span>
                    <span className="truncate flex-1 text-slate-600">{cat.name}</span>
                    <span className="font-semibold text-slate-800">${cat.value}</span>
                </div>
            ))}
        </div>
      </div>

      {/* Bar Chart Trend */}
      <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-100">
         <h3 className="font-bold text-slate-800 mb-4">Recent Activity</h3>
         <div className="h-40 w-full">
            <ResponsiveContainer width="100%" height="100%">
                <BarChart data={recentTrendData}>
                    <XAxis dataKey="name" tick={{fontSize: 10}} axisLine={false} tickLine={false} />
                    <Tooltip cursor={{fill: '#f1f5f9'}} contentStyle={{ borderRadius: '8px' }} />
                    <Bar dataKey="amount" fill="#6366f1" radius={[4, 4, 0, 0]} />
                </BarChart>
            </ResponsiveContainer>
         </div>
      </div>
    </div>
  );
};

export default Dashboard;