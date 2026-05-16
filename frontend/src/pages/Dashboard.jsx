import React, { useEffect, useState } from 'react';
import api from '../services/api';
import { motion } from 'framer-motion';
import { 
    LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer,
    BarChart, Bar
} from 'recharts';
import { Ticket, AlertCircle, CheckCircle2, Clock } from 'lucide-react';

const StatCard = ({ title, value, icon: Icon, colorClass }) => (
    <div className="p-6 bg-card rounded-xl border border-border shadow-sm flex items-center gap-4">
        <div className={`p-4 rounded-full ${colorClass} bg-opacity-10`}>
            <Icon className={`h-6 w-6 ${colorClass.replace('bg-', 'text-')}`} />
        </div>
        <div>
            <p className="text-sm font-medium text-muted-foreground">{title}</p>
            <h3 className="text-2xl font-bold">{value}</h3>
        </div>
    </div>
);

const Dashboard = () => {
    const [summary, setSummary] = useState(null);
    const [workload, setWorkload] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchDashboardData = async () => {
            try {
                const [summaryRes, workloadRes] = await Promise.all([
                    api.get('/analytics/summary'),
                    api.get('/analytics/department-workload')
                ]);
                setSummary(summaryRes.data);
                setWorkload(workloadRes.data);
            } catch (error) {
                console.error('Failed to fetch dashboard data', error);
            } finally {
                setLoading(false);
            }
        };

        fetchDashboardData();
    }, []);

    if (loading) {
        return <div className="flex justify-center items-center h-64"><p>Loading dashboard...</p></div>;
    }

    return (
        <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-6"
        >
            <h1 className="text-3xl font-bold">Dashboard</h1>
            
            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <StatCard 
                    title="Total Tickets" 
                    value={summary?.total || 0} 
                    icon={Ticket} 
                    colorClass="bg-blue-500 text-blue-500" 
                />
                <StatCard 
                    title="Open" 
                    value={summary?.open || 0} 
                    icon={Clock} 
                    colorClass="bg-yellow-500 text-yellow-500" 
                />
                <StatCard 
                    title="Resolved" 
                    value={summary?.resolved || 0} 
                    icon={CheckCircle2} 
                    colorClass="bg-green-500 text-green-500" 
                />
                <StatCard 
                    title="Critical" 
                    value={summary?.critical || 0} 
                    icon={AlertCircle} 
                    colorClass="bg-red-500 text-red-500" 
                />
            </div>

            {/* Charts Section */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-8">
                <div className="p-6 bg-card border border-border rounded-xl shadow-sm">
                    <h3 className="text-lg font-semibold mb-4">Department Workload</h3>
                    <div className="h-72">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={workload} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                                <CartesianGrid strokeDasharray="3 3" stroke="#333" />
                                <XAxis dataKey="department" stroke="#888" />
                                <YAxis stroke="#888" />
                                <RechartsTooltip 
                                    contentStyle={{ backgroundColor: '#1f2937', border: 'none', borderRadius: '8px' }} 
                                />
                                <Bar dataKey="count" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* Example Line Chart placeholder for trends */}
                <div className="p-6 bg-card border border-border rounded-xl shadow-sm">
                    <h3 className="text-lg font-semibold mb-4">Ticket Trends (7 Days)</h3>
                    <div className="h-72 flex items-center justify-center border-2 border-dashed border-border rounded-lg text-muted-foreground">
                        <p>More data required for trend analysis.</p>
                    </div>
                </div>
            </div>
        </motion.div>
    );
};

export default Dashboard;
