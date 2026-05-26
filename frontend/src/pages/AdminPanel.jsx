import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
    ShieldAlert, 
    Users, 
    Building, 
    AlertCircle, 
    Ticket as TicketIcon, 
    BookOpen, 
    Trash, 
    Check, 
    Edit, 
    X, 
    Save, 
    Eye 
} from 'lucide-react';
import api from '../services/api';
import toast from 'react-hot-toast';

const AdminPanel = () => {
    const [activeTab, setActiveTab] = useState('users');
    const [users, setUsers] = useState([]);
    const [departments, setDepartments] = useState([]);
    const [tickets, setTickets] = useState([]);
    const [articles, setArticles] = useState([]);
    const [loading, setLoading] = useState(true);

    const [newDeptName, setNewDeptName] = useState('');

    // Editing Article States
    const [editingArticle, setEditingArticle] = useState(null);
    const [editTitle, setEditTitle] = useState('');
    const [editCategory, setEditCategory] = useState('');
    const [editSymptoms, setEditSymptoms] = useState('');
    const [editRootCause, setEditRootCause] = useState('');
    const [editResolution, setEditResolution] = useState('');
    const [editTags, setEditTags] = useState('');

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            const [usersRes, deptsRes, ticketsRes, kbRes] = await Promise.all([
                api.get('/users/'),
                api.get('/departments/'),
                api.get('/tickets/'),
                api.get('/knowledge-base/').catch(() => ({ data: [] }))
            ]);
            setUsers(usersRes.data);
            setDepartments(deptsRes.data);
            setTickets(ticketsRes.data);
            setArticles(kbRes.data);
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

    // KB Admin Methods
    const handleApproveArticle = async (id) => {
        try {
            await api.post(`/knowledge-base/${id}/approve`);
            setArticles(articles.map(a => a.id === id ? { ...a, is_approved: true } : a));
            toast.success('Article approved. It is now searchable!');
        } catch (error) {
            toast.error('Failed to approve article');
        }
    };

    const handleDeleteArticle = async (id) => {
        if (!window.confirm("Are you sure you want to permanently delete this solution article?")) return;
        try {
            await api.delete(`/knowledge-base/${id}`);
            setArticles(articles.filter(a => a.id !== id));
            toast.success('Article deleted successfully');
        } catch (error) {
            toast.error('Failed to delete article');
        }
    };

    const handleOpenEdit = (art) => {
        setEditingArticle(art);
        setEditTitle(art.title);
        setEditCategory(art.category || 'General');
        setEditSymptoms(art.symptoms || '');
        setEditRootCause(art.root_cause || '');
        setEditResolution(art.resolution_steps || '');
        setEditTags(art.tags ? art.tags.join(', ') : '');
    };

    const handleSaveArticle = async () => {
        if (!editTitle || !editResolution) {
            toast.error("Title and resolution steps are required");
            return;
        }
        try {
            const tagsList = editTags.split(',').map(t => t.trim()).filter(Boolean);
            const res = await api.put(`/knowledge-base/${editingArticle.id}`, {
                title: editTitle,
                category: editCategory,
                symptoms: editSymptoms,
                root_cause: editRootCause,
                resolution_steps: editResolution,
                tags: tagsList
            });
            
            // Map modifications in table
            setArticles(articles.map(a => a.id === editingArticle.id ? res.data : a));
            setEditingArticle(null);
            toast.success("Solution article updated successfully!");
        } catch (error) {
            toast.error("Failed to update article");
        }
    };

    if (loading) return <div className="p-8 text-center text-muted-foreground animate-pulse">Loading admin command center...</div>;

    return (
        <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-6 max-w-7xl mx-auto"
        >
            <div className="flex items-center gap-3">
                <ShieldAlert className="h-8 w-8 text-primary" />
                <h1 className="text-3xl font-extrabold tracking-tight">Admin Panel</h1>
            </div>
            
            <div className="flex gap-2 border-b border-border overflow-x-auto pb-0 mb-6 scrollbar-none">
                <button 
                    onClick={() => setActiveTab('users')}
                    className={`pb-3 px-4 flex items-center gap-2 font-semibold text-xs uppercase tracking-wider transition-colors border-b-2 ${activeTab === 'users' ? 'border-primary text-primary font-bold' : 'border-transparent text-muted-foreground hover:text-foreground'}`}
                >
                    <Users size={16} /> Users
                </button>
                <button 
                    onClick={() => setActiveTab('departments')}
                    className={`pb-3 px-4 flex items-center gap-2 font-semibold text-xs uppercase tracking-wider transition-colors border-b-2 ${activeTab === 'departments' ? 'border-primary text-primary font-bold' : 'border-transparent text-muted-foreground hover:text-foreground'}`}
                >
                    <Building size={16} /> Departments
                </button>
                <button 
                    onClick={() => setActiveTab('tickets')}
                    className={`pb-3 px-4 flex items-center gap-2 font-semibold text-xs uppercase tracking-wider transition-colors border-b-2 ${activeTab === 'tickets' ? 'border-primary text-primary font-bold' : 'border-transparent text-muted-foreground hover:text-foreground'}`}
                >
                    <TicketIcon size={16} /> All Tickets
                </button>
                <button 
                    onClick={() => setActiveTab('kb')}
                    className={`pb-3 px-4 flex items-center gap-2 font-semibold text-xs uppercase tracking-wider transition-colors border-b-2 ${activeTab === 'kb' ? 'border-primary text-primary font-bold' : 'border-transparent text-muted-foreground hover:text-foreground'}`}
                >
                    <BookOpen size={16} /> Knowledge Manager
                </button>
            </div>

            {activeTab === 'users' && (
                <div className="bg-card border border-border rounded-2xl shadow-sm overflow-hidden">
                    <div className="p-4 border-b border-border bg-secondary/35">
                        <h3 className="font-bold">User Management</h3>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="w-full text-left text-sm whitespace-nowrap">
                            <thead className="bg-background text-muted-foreground border-b border-border">
                                <tr>
                                    <th className="px-6 py-4 font-bold">Name</th>
                                    <th className="px-6 py-4 font-bold">Email</th>
                                    <th className="px-6 py-4 font-bold">Joined</th>
                                    <th className="px-6 py-4 font-bold">Role</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-border/60">
                                {users.map(user => (
                                    <tr key={user.id} className="hover:bg-secondary/20 transition-colors">
                                        <td className="px-6 py-4 font-semibold">{user.name}</td>
                                        <td className="px-6 py-4 text-muted-foreground">{user.email}</td>
                                        <td className="px-6 py-4 text-muted-foreground">
                                            {user.created_at ? new Date(user.created_at).toLocaleDateString() : 'N/A'}
                                        </td>
                                        <td className="px-6 py-4">
                                            <select 
                                                value={user.role} 
                                                onChange={(e) => handleRoleChange(user.id, e.target.value)}
                                                className="bg-secondary border border-border rounded px-2.5 py-1.5 outline-none focus:ring-1 focus:ring-primary text-xs font-semibold"
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
                    <div className="lg:col-span-2 bg-card border border-border rounded-2xl shadow-sm overflow-hidden">
                        <div className="p-4 border-b border-border bg-secondary/35">
                            <h3 className="font-bold">Departments Overview</h3>
                        </div>
                        <div className="p-4 grid grid-cols-1 sm:grid-cols-2 gap-4">
                            {departments.map(dept => (
                                <div key={dept.id} className="p-4 border border-border rounded-xl bg-background hover:border-primary/50 transition-colors">
                                    <h4 className="font-bold mb-1">{dept.name}</h4>
                                    <p className="text-xs text-muted-foreground">System ID: #{dept.id}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                    
                    <div className="bg-card border border-border rounded-2xl shadow-sm h-fit">
                        <div className="p-4 border-b border-border bg-secondary/35">
                            <h3 className="font-bold">Add Department</h3>
                        </div>
                        <form onSubmit={handleAddDepartment} className="p-4 space-y-4">
                            <div>
                                <label className="block text-xs font-bold uppercase tracking-wider mb-1 text-muted-foreground">Department Name</label>
                                <input 
                                    type="text" 
                                    value={newDeptName}
                                    onChange={(e) => setNewDeptName(e.target.value)}
                                    className="w-full bg-background border border-border rounded-lg px-3 py-2 outline-none focus:ring-2 focus:ring-primary"
                                    placeholder="e.g. Legal Team"
                                    required
                                />
                            </div>
                            <button type="submit" className="w-full bg-primary text-primary-foreground font-bold py-2 rounded-lg hover:opacity-90 transition-opacity">
                                Create Department
                            </button>
                        </form>
                    </div>
                </div>
            )}

            {activeTab === 'tickets' && (
                <div className="bg-card border border-border rounded-2xl shadow-sm overflow-hidden">
                    <div className="p-4 border-b border-border bg-secondary/35 flex justify-between items-center">
                        <h3 className="font-bold">Global Ticket Overview</h3>
                        <span className="text-xs text-muted-foreground font-semibold bg-secondary px-2 py-1 rounded-full">{tickets.length} Total Tickets</span>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="w-full text-left text-sm whitespace-nowrap">
                            <thead className="bg-background text-muted-foreground border-b border-border">
                                <tr>
                                    <th className="px-6 py-4 font-bold">ID</th>
                                    <th className="px-6 py-4 font-bold">Subject</th>
                                    <th className="px-6 py-4 font-bold">Dept</th>
                                    <th className="px-6 py-4 font-bold">Assignee</th>
                                    <th className="px-6 py-4 font-bold">Status</th>
                                    <th className="px-6 py-4 font-bold">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-border/60">
                                {tickets.map(ticket => (
                                    <tr key={ticket.id} className="hover:bg-secondary/20 transition-colors">
                                        <td className="px-6 py-4 text-muted-foreground font-mono">#{ticket.id}</td>
                                        <td className="px-6 py-4 font-semibold max-w-xs truncate">{ticket.title}</td>
                                        <td className="px-6 py-4 text-muted-foreground">{ticket.department_rel?.name || 'N/A'}</td>
                                        <td className="px-6 py-4 text-muted-foreground">{ticket.assigned_user?.name || 'Unassigned'}</td>
                                        <td className="px-6 py-4">
                                            <span className={`px-2.5 py-0.5 rounded-full text-xs font-semibold border ${
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
                                                className="text-primary hover:underline font-bold text-xs"
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

            {activeTab === 'kb' && (
                <div className="bg-card border border-border rounded-2xl shadow-sm overflow-hidden">
                    <div className="p-4 border-b border-border bg-secondary/35 flex justify-between items-center">
                        <h3 className="font-bold">Smart Knowledge Base Articles</h3>
                        <span className="text-xs text-muted-foreground font-semibold bg-secondary px-2.5 py-1 rounded-full">{articles.length} Solutions generated</span>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="w-full text-left text-sm whitespace-nowrap">
                            <thead className="bg-background text-muted-foreground border-b border-border">
                                <tr>
                                    <th className="px-6 py-4 font-bold">ID</th>
                                    <th className="px-6 py-4 font-bold">Title</th>
                                    <th className="px-6 py-4 font-bold">Category</th>
                                    <th className="px-6 py-4 font-bold">Views</th>
                                    <th className="px-6 py-4 font-bold">Status</th>
                                    <th className="px-6 py-4 font-bold">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-border/60">
                                {articles.map(art => (
                                    <tr key={art.id} className="hover:bg-secondary/20 transition-colors">
                                        <td className="px-6 py-4 text-muted-foreground font-mono">#{art.id}</td>
                                        <td className="px-6 py-4 font-semibold max-w-sm truncate">{art.title}</td>
                                        <td className="px-6 py-4 text-muted-foreground">{art.category}</td>
                                        <td className="px-6 py-4 font-semibold text-muted-foreground flex items-center gap-1.5 pt-6">
                                            <Eye size={14} className="text-primary" /> {art.views}
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold border ${
                                                art.is_approved 
                                                    ? "bg-green-500/10 text-green-500 border-green-500/20" 
                                                    : "bg-amber-500/10 text-amber-500 border-amber-500/20 animate-pulse"
                                            }`}>
                                                {art.is_approved ? 'Approved' : 'Pending Review'}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 flex gap-2">
                                            {!art.is_approved && (
                                                <button 
                                                    onClick={() => handleApproveArticle(art.id)}
                                                    className="p-1.5 bg-green-500/10 text-green-500 border border-green-500/20 rounded hover:bg-green-500 hover:text-white transition-colors"
                                                    title="Approve Article"
                                                >
                                                    <Check size={14} />
                                                </button>
                                            )}
                                            <button 
                                                onClick={() => handleOpenEdit(art)}
                                                className="p-1.5 bg-blue-500/10 text-blue-500 border border-blue-500/20 rounded hover:bg-blue-500 hover:text-white transition-colors"
                                                title="Edit Solution"
                                            >
                                                <Edit size={14} />
                                            </button>
                                            <button 
                                                onClick={() => handleDeleteArticle(art.id)}
                                                className="p-1.5 bg-red-500/10 text-red-500 border border-red-500/20 rounded hover:bg-red-500 hover:text-white transition-colors"
                                                title="Delete Solution"
                                            >
                                                <Trash size={14} />
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            {/* Editing Article overlay modal */}
            <AnimatePresence>
                {editingArticle && (
                    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                        <motion.div 
                            initial={{ scale: 0.95, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.95, opacity: 0 }}
                            className="bg-card border border-border rounded-2xl max-w-2xl w-full p-6 shadow-xl space-y-4 max-h-[90vh] overflow-y-auto"
                        >
                            <div className="flex justify-between items-center border-b border-border/60 pb-3">
                                <h3 className="font-extrabold text-lg flex items-center gap-2">
                                    <BookOpen className="h-5 w-5 text-primary" /> Edit Knowledge Solution
                                </h3>
                                <button onClick={() => setEditingArticle(null)} className="text-muted-foreground hover:text-foreground">
                                    <X size={18} />
                                </button>
                            </div>
                            
                            <div className="space-y-4">
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-1">
                                        <label className="text-xs font-bold uppercase text-muted-foreground">Title</label>
                                        <input 
                                            type="text" 
                                            value={editTitle}
                                            onChange={(e) => setEditTitle(e.target.value)}
                                            className="w-full bg-secondary border border-border rounded-xl px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-primary"
                                            required
                                        />
                                    </div>
                                    <div className="space-y-1">
                                        <label className="text-xs font-bold uppercase text-muted-foreground">Category</label>
                                        <input 
                                            type="text" 
                                            value={editCategory}
                                            onChange={(e) => setEditCategory(e.target.value)}
                                            className="w-full bg-secondary border border-border rounded-xl px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-primary"
                                        />
                                    </div>
                                </div>

                                <div className="space-y-1">
                                    <label className="text-xs font-bold uppercase text-muted-foreground">Symptoms</label>
                                    <textarea 
                                        value={editSymptoms}
                                        onChange={(e) => setEditSymptoms(e.target.value)}
                                        className="w-full bg-secondary border border-border rounded-xl p-3 text-sm outline-none focus:ring-2 focus:ring-primary min-h-[80px] resize-none"
                                    />
                                </div>

                                <div className="space-y-1">
                                    <label className="text-xs font-bold uppercase text-muted-foreground">Root Cause</label>
                                    <textarea 
                                        value={editRootCause}
                                        onChange={(e) => setEditRootCause(e.target.value)}
                                        className="w-full bg-secondary border border-border rounded-xl p-3 text-sm outline-none focus:ring-2 focus:ring-primary min-h-[80px] resize-none"
                                    />
                                </div>

                                <div className="space-y-1">
                                    <label className="text-xs font-bold uppercase text-muted-foreground">Resolution Steps</label>
                                    <textarea 
                                        value={editResolution}
                                        onChange={(e) => setEditResolution(e.target.value)}
                                        className="w-full bg-secondary border border-border rounded-xl p-3 text-sm outline-none focus:ring-2 focus:ring-primary min-h-[100px] resize-none"
                                        required
                                    />
                                </div>

                                <div className="space-y-1">
                                    <label className="text-xs font-bold uppercase text-muted-foreground">Tags (comma-separated)</label>
                                    <input 
                                        type="text" 
                                        value={editTags}
                                        onChange={(e) => setEditTags(e.target.value)}
                                        placeholder="e.g. Database, Storage, Migration"
                                        className="w-full bg-secondary border border-border rounded-xl px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-primary"
                                    />
                                </div>
                            </div>

                            <div className="flex justify-end gap-3 border-t border-border/60 pt-3">
                                <button
                                    onClick={() => setEditingArticle(null)}
                                    className="px-4 py-2 text-xs font-semibold rounded-lg hover:bg-secondary text-muted-foreground transition-colors border border-border"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={handleSaveArticle}
                                    className="px-4 py-2 text-xs font-bold bg-primary text-primary-foreground rounded-lg hover:opacity-90 transition-all flex items-center gap-1.5"
                                >
                                    <Save size={14} /> Save Changes
                                </button>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </motion.div>
    );
};

export default AdminPanel;
