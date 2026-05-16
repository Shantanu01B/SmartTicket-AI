import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ShieldAlert, Users, Building, AlertCircle, Ticket as TicketIcon } from 'lucide-react';
import api from '../services/api';
import toast from 'react-hot-toast';

const AdminPanel = () => {
    const [activeTab, setActiveTab] = useState('users');
    const [users, setUsers] = useState([]);
    const [departments, setDepartments] = useState([]);
    const [tickets, setTickets] = useState([]);
    const [loading, setLoading] = useState(true);

    const [newDeptName, setNewDeptName] = useState('');

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            const [usersRes, deptsRes, ticketsRes] = await Promise.all([
                api.get('/users/'),
                api.get('/departments/'),
                api.get('/tickets/')
            ]);
            setUsers(usersRes.data);
            setDepartments(deptsRes.data);
            setTickets(ticketsRes.data);
        } catch (error) {
            console.error('Error fetching admin data', error);
            toast.error('Failed to load admin data');
        } finally {
            setLoading(false);
        }
    };

    const handleRoleChange = async (userId, newRole) => {
        try {
            await api.put(`/users/${userId}`, { role: newRole });
            setUsers(users.map(u => u.id === userId ? { ...u, role: newRole } : u));
            toast.success('Role updated');
        } catch (error) {
            toast.error('Failed to update role');
        }
    };

    const handleAddDepartment = async (e) => {
        e.preventDefault();
        if (!newDeptName) return;
        try {
            const res = await api.post('/departments/', { name: newDeptName });
            setDepartments([...departments, res.data]);
            setNewDeptName('');
            toast.success('Department created');
        } catch (error) {
            toast.error('Failed to create department');
        }
    };

    if (loading) return <div className="p-8 text-center">Loading admin panel...</div>;

    return (
        <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-6"
        >
            <div className="flex items-center gap-3">
                <ShieldAlert className="h-8 w-8 text-primary" />
                <h1 className="text-3xl font-bold">Admin Panel</h1>
            </div>
            
            <div className="flex gap-4 border-b border-border mb-6">
                <button 
                    onClick={() => setActiveTab('users')}
                    className={`pb-2 px-4 flex items-center gap-2 font-medium transition-colors ${activeTab === 'users' ? 'border-b-2 border-primary text-primary' : 'text-muted-foreground hover:text-foreground'}`}
                >
                    <Users size={18} /> Users
                </button>
                <button 
                    onClick={() => setActiveTab('departments')}
                    className={`pb-2 px-4 flex items-center gap-2 font-medium transition-colors ${activeTab === 'departments' ? 'border-b-2 border-primary text-primary' : 'text-muted-foreground hover:text-foreground'}`}
                >
                    <Building size={18} /> Departments
                </button>
                <button 
                    onClick={() => setActiveTab('tickets')}
                    className={`pb-2 px-4 flex items-center gap-2 font-medium transition-colors ${activeTab === 'tickets' ? 'border-b-2 border-primary text-primary' : 'text-muted-foreground hover:text-foreground'}`}
                >
                    <TicketIcon size={18} /> All Tickets
                </button>
            </div>

            {activeTab === 'users' && (
                <div className="bg-card border border-border rounded-xl shadow-sm overflow-hidden">
                    <div className="p-4 border-b border-border bg-secondary/50">
                        <h3 className="font-semibold">User Management</h3>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="w-full text-left text-sm whitespace-nowrap">
                            <thead className="bg-background text-muted-foreground border-b border-border">
                                <tr>
                                    <th className="px-6 py-4 font-medium">Name</th>
                                    <th className="px-6 py-4 font-medium">Email</th>
                                    <th className="px-6 py-4 font-medium">Joined</th>
                                    <th className="px-6 py-4 font-medium">Role</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-border">
                                {users.map(user => (
                                    <tr key={user.id} className="hover:bg-secondary/20 transition-colors">
                                        <td className="px-6 py-4 font-medium">{user.name}</td>
                                        <td className="px-6 py-4 text-muted-foreground">{user.email}</td>
                                        <td className="px-6 py-4 text-muted-foreground">
                                            {user.created_at ? new Date(user.created_at).toLocaleDateString() : 'N/A'}
                                        </td>
                                        <td className="px-6 py-4">
                                            <select 
                                                value={user.role} 
                                                onChange={(e) => handleRoleChange(user.id, e.target.value)}
                                                className="bg-secondary border border-border rounded px-2 py-1 outline-none focus:ring-1 focus:ring-primary"
                                                disabled={user.email === 'admin@smartticket.ai'}
                                            >
                                                <option value="employee">Employee</option>
                                                <option value="support_agent">Support Agent</option>
                                                <option value="admin">Admin</option>
                                            </select>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            {activeTab === 'departments' && (
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    <div className="lg:col-span-2 bg-card border border-border rounded-xl shadow-sm overflow-hidden">
                        <div className="p-4 border-b border-border bg-secondary/50">
                            <h3 className="font-semibold">Departments Overview</h3>
                        </div>
                        <div className="p-4 grid grid-cols-1 sm:grid-cols-2 gap-4">
                            {departments.map(dept => (
                                <div key={dept.id} className="p-4 border border-border rounded-lg bg-background hover:border-primary/50 transition-colors">
                                    <h4 className="font-bold mb-1">{dept.name}</h4>
                                    <p className="text-sm text-muted-foreground">ID: {dept.id}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                    
                    <div className="bg-card border border-border rounded-xl shadow-sm h-fit">
                        <div className="p-4 border-b border-border bg-secondary/50">
                            <h3 className="font-semibold">Add Department</h3>
                        </div>
                        <form onSubmit={handleAddDepartment} className="p-4 space-y-4">
                            <div>
                                <label className="block text-sm font-medium mb-1 text-muted-foreground">Department Name</label>
                                <input 
                                    type="text" 
                                    value={newDeptName}
                                    onChange={(e) => setNewDeptName(e.target.value)}
                                    className="w-full bg-background border border-border rounded-md px-3 py-2 outline-none focus:ring-2 focus:ring-primary"
                                    placeholder="e.g. Legal Team"
                                    required
                                />
                            </div>
                            <button type="submit" className="w-full bg-primary text-primary-foreground font-medium py-2 rounded-md hover:opacity-90 transition-opacity">
                                Create Department
                            </button>
                        </form>
                    </div>
                </div>
            )}

            {activeTab === 'tickets' && (
                <div className="bg-card border border-border rounded-xl shadow-sm overflow-hidden">
                    <div className="p-4 border-b border-border bg-secondary/50 flex justify-between items-center">
                        <h3 className="font-semibold">Global Ticket Overview</h3>
                        <span className="text-xs text-muted-foreground">{tickets.length} Total Tickets</span>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="w-full text-left text-sm whitespace-nowrap">
                            <thead className="bg-background text-muted-foreground border-b border-border">
                                <tr>
                                    <th className="px-6 py-4 font-medium">ID</th>
                                    <th className="px-6 py-4 font-medium">Subject</th>
                                    <th className="px-6 py-4 font-medium">Dept</th>
                                    <th className="px-6 py-4 font-medium">Assignee</th>
                                    <th className="px-6 py-4 font-medium">Status</th>
                                    <th className="px-6 py-4 font-medium">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-border">
                                {tickets.map(ticket => (
                                    <tr key={ticket.id} className="hover:bg-secondary/20 transition-colors">
                                        <td className="px-6 py-4 text-muted-foreground">#{ticket.id}</td>
                                        <td className="px-6 py-4 font-medium max-w-xs truncate">{ticket.title}</td>
                                        <td className="px-6 py-4 text-muted-foreground">{ticket.department_rel?.name || 'N/A'}</td>
                                        <td className="px-6 py-4 text-muted-foreground">{ticket.assigned_user?.name || 'Unassigned'}</td>
                                        <td className="px-6 py-4">
                                            <span className={`px-2 py-0.5 rounded-full text-xs font-medium border ${
                                                ticket.status === 'Open' ? "bg-blue-500/10 text-blue-500 border-blue-500/20" :
                                                ticket.status === 'Resolved' ? "bg-green-500/10 text-green-500 border-green-500/20" :
                                                "bg-yellow-500/10 text-yellow-500 border-yellow-500/20"
                                            }`}>
                                                {ticket.status}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4">
                                            <Link 
                                                to={`/tickets/${ticket.id}`}
                                                className="text-primary hover:underline font-medium"
                                            >
                                                Manage
                                            </Link>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}
        </motion.div>
    );
};

export default AdminPanel;
