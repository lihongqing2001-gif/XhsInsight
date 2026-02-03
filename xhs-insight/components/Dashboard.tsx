import React from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Group, DashboardMetrics } from '../types';
import { ArrowUpRight, TrendingUp, Users, Database } from 'lucide-react';

interface DashboardProps {
  groups: Group[];
  metrics: DashboardMetrics;
  selectedGroupId: string | null;
  onSelectGroup: (id: string | null) => void;
}

// Mock chart data
const chartData = [
  { name: 'Mon', likes: 4000 },
  { name: 'Tue', likes: 3000 },
  { name: 'Wed', likes: 2000 },
  { name: 'Thu', likes: 2780 },
  { name: 'Fri', likes: 1890 },
  { name: 'Sat', likes: 2390 },
  { name: 'Sun', likes: 3490 },
];

export const Dashboard: React.FC<DashboardProps> = ({ groups, metrics, selectedGroupId, onSelectGroup }) => {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 mb-8">
      {/* Metrics Cards */}
      <div className="lg:col-span-4 grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 flex flex-col justify-between">
            <div className="flex justify-between items-start">
                <span className="text-gray-500 text-xs font-medium uppercase">Total Notes</span>
                <Database className="w-4 h-4 text-blue-500" />
            </div>
            <div className="text-2xl font-bold mt-2">{metrics.totalNotes}</div>
        </div>
        <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 flex flex-col justify-between">
            <div className="flex justify-between items-start">
                <span className="text-gray-500 text-xs font-medium uppercase">Avg. Likes</span>
                <TrendingUp className="w-4 h-4 text-green-500" />
            </div>
            <div className="text-2xl font-bold mt-2">{metrics.avgLikes}</div>
        </div>
        <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 flex flex-col justify-between">
            <div className="flex justify-between items-start">
                <span className="text-gray-500 text-xs font-medium uppercase">Active Cookies</span>
                <Users className="w-4 h-4 text-purple-500" />
            </div>
            <div className="text-2xl font-bold mt-2">{metrics.activeCookies}</div>
        </div>
        <div className="bg-gradient-to-br from-xhs-red to-red-500 p-4 rounded-xl shadow-sm text-white flex flex-col justify-between">
            <div className="flex justify-between items-start">
                <span className="text-white/80 text-xs font-medium uppercase">Viral Efficiency</span>
                <ArrowUpRight className="w-4 h-4 text-white" />
            </div>
            <div className="text-2xl font-bold mt-2">Top 5%</div>
        </div>
      </div>

      {/* Main Chart */}
      <div className="lg:col-span-3 bg-white p-6 rounded-xl shadow-sm border border-gray-100 h-80">
        <h3 className="font-semibold text-gray-800 mb-4">Engagement Trend</h3>
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={chartData}>
            <defs>
              <linearGradient id="colorLikes" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#FF2442" stopOpacity={0.1}/>
                <stop offset="95%" stopColor="#FF2442" stopOpacity={0}/>
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
            <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#9ca3af', fontSize: 12}} />
            <YAxis axisLine={false} tickLine={false} tick={{fill: '#9ca3af', fontSize: 12}} />
            <Tooltip contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }} />
            <Area type="monotone" dataKey="likes" stroke="#FF2442" strokeWidth={2} fillOpacity={1} fill="url(#colorLikes)" />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      {/* Group Sidebar */}
      <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 h-80 overflow-y-auto">
        <h3 className="font-semibold text-gray-800 mb-4">Groups</h3>
        <div className="space-y-2">
            <button 
                onClick={() => onSelectGroup(null)}
                className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-colors ${selectedGroupId === null ? 'bg-red-50 text-xhs-red font-medium' : 'text-gray-600 hover:bg-gray-50'}`}
            >
                All Notes
            </button>
            {groups.map(g => (
                <button 
                    key={g.id}
                    onClick={() => onSelectGroup(g.id)}
                    className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-colors flex justify-between items-center ${selectedGroupId === g.id ? 'bg-red-50 text-xhs-red font-medium' : 'text-gray-600 hover:bg-gray-50'}`}
                >
                    <span>{g.name}</span>
                    <span className="text-xs text-gray-400 bg-gray-100 px-2 py-0.5 rounded-full">{g.count}</span>
                </button>
            ))}
            <button className="w-full mt-4 border border-dashed border-gray-300 text-gray-400 text-xs py-2 rounded-lg hover:border-xhs-red hover:text-xhs-red transition-colors">
                + New Group
            </button>
        </div>
      </div>
    </div>
  );
};