import React, { useEffect, useState } from 'react';
import api from '../services/api';
import { motion } from 'framer-motion';
import { 
    LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer,
    BarChart, Bar, Legend
} from 'recharts';
import { 
    Ticket, 
    AlertTriangle, 
    CheckCircle2, 
    Clock, 
    BookOpen, 
    Activity, 
    ShieldAlert, 
    TrendingUp 
} from 'lucide-react';

const StatCard = ({ title, value, icon: Icon, colorClass }) => (
    <div className="p-6 bg-card rounded-xl border border-border shadow-sm flex items-center gap-4">
        <div className={`p-4 rounded-full ${colorClass} bg-opacity-10`}>
            <Icon className={`h-6 w-6 ${colorClass.split(' ')[1] || colorClass.split(' ')[0]}`} />
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
    const [escalationData, setEscalationData] = useState(null);
    const [knowledgeData, setKnowledgeData] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchDashboardData = async () => {
            try {
                const [summaryRes, workloadRes, escalationRes, knowledgeRes] = await Promise.all([
                    api.get('/analytics/summary'),
                    api.get('/analytics/department-workload'),
                    api.get('/analytics/escalation-analytics'),
                    api.get('/analytics/knowledge-analytics')
                ]);
                setSummary(summaryRes.data);
                setWorkload(workloadRes.data);
                setEscalationData(escalationRes.data);
                setKnowledgeData(knowledgeRes.data);
            } catch (error) {
                console.error('Failed to fetch dashboard data', error);
            } finally {
                setLoading(false);
            }
        };

        fetchDashboardData();
    }, []);

    if (loading) {
        return <div className="flex justify-center items-center h-64"><p className="text-muted-foreground animate-pulse">Loading enterprise dashboard...</p></div>;
    }

    return (
        <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-8 max-w-7xl mx-auto"
        >
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h1 className="text-3xl font-extrabold tracking-tight">Support Operations Dashboard</h1>
                    <p className="text-sm text-muted-foreground">Real-time IT support metrics, machine learning escalation risk insights, and knowledge base performance.</p>
                </div>
            </div>
            
            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <StatCard 
                    title="Total Tickets" 
                    value={summary?.total || 0} 
                    icon={Ticket} 
                    colorClass="bg-blue-500/10 text-blue-500" 
                />
                <StatCard 
                    title="High Escalation Risk" 
                    value={escalationData?.highRiskCount || 0} 
                    icon={ShieldAlert} 
                    colorClass="bg-red-500/10 text-red-500 animate-pulse" 
                />
                <StatCard 
                    title="SLA Breaches / Nearing" 
                    value={(escalationData?.breachedCount || 0) + (escalationData?.nearingBreachCount || 0)} 
                    icon={Clock} 
                    colorClass="bg-yellow-500/10 text-yellow-500" 
                />
                <StatCard 
                    title="Smart KB Articles" 
                    value={summary?.approved_kb || 0} 
                    icon={BookOpen} 
                    colorClass="bg-green-500/10 text-green-500" 
                />
            </div>

            {/* Charts Section: Top Row */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Department Workload */}
                <div className="p-6 bg-card border border-border rounded-2xl shadow-sm">
                    <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
                        <Activity className="h-4.5 w-4.5 text-primary" /> Active Workload by Department
                    </h3>
                    <div className="h-72">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={workload} margin={{ top: 10, right: 10, left: -10, bottom: 5 }}>
                                <CartesianGrid strokeDasharray="3 3" stroke="#222" />
                                <XAxis dataKey="department" stroke="#666" fontSize={11} tickLine={false} />
                                <YAxis stroke="#666" fontSize={11} tickLine={false} />
                                <RechartsTooltip 
                                    contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #334155', borderRadius: '12px', color: '#f8fafc' }} 
                                />
                                <Bar dataKey="count" fill="#3b82f6" radius={[6, 6, 0, 0]} barSize={36} />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* Escalation Trends */}
                <div className="p-6 bg-card border border-border rounded-2xl shadow-sm">
                    <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
                        <TrendingUp className="h-4.5 w-4.5 text-red-500" /> Escalation Trends (7 Days)
                    </h3>
                    <div className="h-72">
                        <ResponsiveContainer width="100%" height="100%">
                            <LineChart data={escalationData?.escalationTrends || []} margin={{ top: 10, right: 10, left: -10, bottom: 5 }}>
                                <CartesianGrid strokeDasharray="3 3" stroke="#222" />
                                <XAxis dataKey="date" stroke="#666" fontSize={11} tickLine={false} />
                                <YAxis stroke="#666" fontSize={11} tickLine={false} />
                                <RechartsTooltip 
                                    contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #334155', borderRadius: '12px', color: '#f8fafc' }} 
                                />
                                <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }} />
                                <Line name="Total Created" type="monotone" dataKey="total" stroke="#3b82f6" strokeWidth={2} activeDot={{ r: 6 }} />
                                <Line name="High Risk" type="monotone" dataKey="highRisk" stroke="#ef4444" strokeWidth={2.5} activeDot={{ r: 6 }} />
                            </LineChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            </div>

            {/* Bottom Row Details: Department Risk and KB Efficiency */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Department High Risk Distribution */}
                <div className="p-6 bg-card border border-border rounded-2xl shadow-sm lg:col-span-2">
                    <h3 className="text-lg font-bold mb-4 flex items-center gap-2 text-destructive">
                        <AlertTriangle className="h-4.5 w-4.5" /> High-Risk Distribution by Department
                    </h3>
                    <div className="h-64">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={escalationData?.departmentRiskDistribution || []} margin={{ top: 10, right: 10, left: -10, bottom: 5 }}>
                                <CartesianGrid strokeDasharray="3 3" stroke="#222" />
                                <XAxis dataKey="department" stroke="#666" fontSize={11} tickLine={false} />
                                <YAxis stroke="#666" fontSize={11} tickLine={false} />
                                <RechartsTooltip 
                                    contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #334155', borderRadius: '12px', color: '#f8fafc' }} 
                                />
                                <Bar name="High Risk Count" dataKey="highRiskCount" fill="#ef4444" radius={[6, 6, 0, 0]} barSize={24} />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* KB Performance & Deflection metrics */}
                <div className="p-6 bg-card border border-border rounded-2xl shadow-sm space-y-6 flex flex-col justify-between">
                    <div>
                        <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
                            <BookOpen className="h-4.5 w-4.5 text-green-500" /> KB Efficiency
                        </h3>
                        
                        <div className="space-y-4">
                            {/* Deflection Rate Circle Widget */}
                            <div className="flex items-center gap-4 bg-secondary/35 p-4 rounded-xl border border-border/50">
                                <div className="text-3xl font-black text-green-500">
                                    {knowledgeData?.ticketReductionRate || 0}%
                                </div>
                                <div className="text-xs text-muted-foreground font-medium leading-normal">
                                    Estimated <span className="text-green-500 font-bold">Ticket Deflection Rate</span> due to active Knowledge Base self-help usage.
                                </div>
                            </div>

                            {/* Popular Articles List */}
                            <div className="space-y-3">
                                <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Top Viewed Solution Articles</p>
                                {knowledgeData?.mostViewed?.length === 0 ? (
                                    <p className="text-xs text-muted-foreground italic">No KB views tracked yet.</p>
                                ) : (
                                    <div className="space-y-2">
                                        {knowledgeData?.mostViewed?.map((art) => (
                                            <div key={art.id} className="flex justify-between items-center text-xs">
                                                <span className="font-semibold truncate max-w-[70%] text-foreground/90">{art.title}</span>
                                                <span className="text-[10px] text-muted-foreground bg-secondary px-1.5 py-0.5 rounded font-mono flex items-center gap-0.5 whitespace-nowrap">
                                                    <Clock className="h-3 w-3" /> {art.views} views
                                                </span>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                    
                    <div className="text-center pt-2">
                        <p className="text-[11px] text-muted-foreground">Cumulative solution views: <span className="font-bold text-foreground">{knowledgeData?.totalKbViews || 0}</span></p>
                    </div>
                </div>
            </div>
        </motion.div>
    );
};

export default Dashboard;
