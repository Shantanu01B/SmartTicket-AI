import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import { motion } from 'framer-motion';
import { 
    ArrowLeft, 
    MessageSquare, 
    Clock, 
    Shield, 
    User as UserIcon, 
    Building, 
    CheckCircle,
    AlertCircle,
    Send
} from 'lucide-react';
import toast from 'react-hot-toast';
import { clsx } from 'clsx';

const Badge = ({ children, type }) => {
    const styles = {
        Critical: 'bg-red-500/10 text-red-500 border-red-500/20',
        High: 'bg-orange-500/10 text-orange-500 border-orange-500/20',
        Medium: 'bg-yellow-500/10 text-yellow-500 border-yellow-500/20',
        Low: 'bg-blue-500/10 text-blue-500 border-blue-500/20',
        Open: 'bg-blue-500/10 text-blue-500 border-blue-500/20',
        'In Progress': 'bg-yellow-500/10 text-yellow-500 border-yellow-500/20',
        Resolved: 'bg-green-500/10 text-green-500 border-green-500/20',
        Closed: 'bg-gray-500/10 text-gray-400 border-gray-500/20',
    };
    return (
        <span className={clsx("px-2.5 py-0.5 rounded-full text-xs font-medium border", styles[children] || 'bg-secondary text-secondary-foreground')}>
            {children}
        </span>
    );
};

const TicketDetails = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { user: currentUser } = useAuth();
    
    const [ticket, setTicket] = useState(null);
    const [comments, setComments] = useState([]);
    const [newComment, setNewComment] = useState('');
    const [departments, setDepartments] = useState([]);
    const [agents, setAgents] = useState([]);
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);

    const isAuthorized = currentUser?.role === 'admin' || currentUser?.role === 'support_agent';

    useEffect(() => {
        fetchData();
    }, [id]);

    const fetchData = async () => {
        try {
            const [ticketRes, commentsRes, deptsRes, usersRes] = await Promise.all([
                api.get(`/tickets/${id}`),
                api.get(`/tickets/${id}/comments`),
                api.get('/departments/'),
                isAuthorized ? api.get('/users/') : Promise.resolve({ data: [] })
            ]);
            
            setTicket(ticketRes.data);
            setComments(commentsRes.data);
            setDepartments(deptsRes.data);
            setAgents(usersRes.data.filter(u => u.role === 'support_agent' || u.role === 'admin'));
        } catch (error) {
            console.error('Failed to fetch ticket details', error);
            toast.error('Failed to load ticket details');
        } finally {
            setLoading(false);
        }
    };

    const handleUpdateTicket = async (updates) => {
        try {
            const res = await api.put(`/tickets/${id}`, updates);
            setTicket(res.data);
            toast.success('Ticket updated successfully');
        } catch (error) {
            toast.error('Failed to update ticket');
        }
    };

    const handleAddComment = async (e) => {
        e.preventDefault();
        if (!newComment.trim()) return;
        setSubmitting(true);
        try {
            const res = await api.post(`/tickets/${id}/comments`, { comment: newComment });
            setComments([...comments, res.data]);
            setNewComment('');
            toast.success('Comment added');
        } catch (error) {
            toast.error('Failed to add comment');
        } finally {
            setSubmitting(false);
        }
    };

    if (loading) return <div className="p-8 text-center">Loading ticket details...</div>;
    if (!ticket) return <div className="p-8 text-center text-destructive">Ticket not found</div>;

    return (
        <motion.div 
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            className="space-y-6 max-w-6xl mx-auto"
        >
            <button 
                onClick={() => navigate('/tickets')}
                className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors group"
            >
                <ArrowLeft className="h-4 w-4 group-hover:-translate-x-1 transition-transform" />
                Back to Tickets
            </button>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Main Content */}
                <div className="lg:col-span-2 space-y-6">
                    <div className="bg-card border border-border rounded-xl p-6 shadow-sm space-y-4">
                        <div className="flex justify-between items-start">
                            <h1 className="text-2xl font-bold">{ticket.title}</h1>
                            <Badge type={ticket.urgency}>{ticket.urgency}</Badge>
                        </div>
                        
                        <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
                            <div className="flex items-center gap-1.5">
                                <Clock className="h-4 w-4" />
                                {new Date(ticket.created_at).toLocaleString()}
                            </div>
                            <div className="flex items-center gap-1.5">
                                <Building className="h-4 w-4" />
                                {ticket.department_rel?.name || 'Unassigned'}
                            </div>
                            <div className="flex items-center gap-1.5">
                                <Shield className="h-4 w-4" />
                                {ticket.category || 'General'}
                            </div>
                        </div>

                        <hr className="border-border" />
                        
                        <div className="space-y-2">
                            <h3 className="font-semibold text-lg italic text-primary/80 flex items-center gap-2">
                                <AlertCircle size={18} /> AI Insight Summary
                            </h3>
                            <div className="bg-secondary/30 p-4 rounded-lg border border-border/50 text-sm leading-relaxed">
                                {ticket.ai_summary || "Our local AI is still processing this ticket's core insight."}
                            </div>
                        </div>

                        <div className="space-y-2 pt-4">
                            <h3 className="font-semibold text-lg">Description</h3>
                            <p className="whitespace-pre-wrap text-foreground/90 leading-relaxed">
                                {ticket.description}
                            </p>
                        </div>
                    </div>

                    {/* Comments Section */}
                    <div className="space-y-4">
                        <h3 className="text-xl font-bold flex items-center gap-2">
                            <MessageSquare className="h-5 w-5" />
                            Activity Log
                        </h3>
                        
                        <div className="space-y-4">
                            {comments.map((comment) => (
                                <div key={comment.id} className="bg-card border border-border rounded-xl p-4 shadow-sm">
                                    <div className="flex justify-between mb-2">
                                        <span className="font-medium text-sm text-primary">{comment.user?.name}</span>
                                        <span className="text-xs text-muted-foreground">{new Date(comment.created_at).toLocaleString()}</span>
                                    </div>
                                    <p className="text-sm whitespace-pre-wrap">{comment.comment}</p>
                                </div>
                            ))}
                        </div>

                        <form onSubmit={handleAddComment} className="relative pt-2">
                            <textarea
                                value={newComment}
                                onChange={(e) => setNewComment(e.target.value)}
                                placeholder="Add a comment or update..."
                                className="w-full bg-card border border-border rounded-xl p-4 pr-12 min-h-[100px] focus:ring-2 focus:ring-primary outline-none transition-all resize-none"
                            />
                            <button 
                                type="submit"
                                disabled={submitting || !newComment.trim()}
                                className="absolute right-3 bottom-6 p-2 bg-primary text-primary-foreground rounded-lg hover:opacity-90 disabled:opacity-50 transition-opacity"
                            >
                                <Send className="h-5 w-5" />
                            </button>
                        </form>
                    </div>
                </div>

                {/* Sidebar / Management */}
                <div className="space-y-6">
                    <div className="bg-card border border-border rounded-xl p-6 shadow-sm space-y-6 h-fit sticky top-24">
                        <h3 className="font-bold text-lg flex items-center gap-2">
                            <Shield className="h-5 w-5 text-primary" />
                            Ticket Management
                        </h3>

                        <div className="space-y-4">
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-muted-foreground">Status</label>
                                <select 
                                    value={ticket.status}
                                    onChange={(e) => handleUpdateTicket({ status: e.target.value })}
                                    className="w-full bg-secondary border border-border rounded-lg px-3 py-2 outline-none focus:ring-2 focus:ring-primary"
                                    disabled={!isAuthorized}
                                >
                                    <option value="Open">Open</option>
                                    <option value="In Progress">In Progress</option>
                                    <option value="Resolved">Resolved</option>
                                    <option value="Closed">Closed</option>
                                </select>
                            </div>

                            <div className="space-y-2">
                                <label className="text-sm font-medium text-muted-foreground">Department</label>
                                <select 
                                    value={ticket.department_id || ''}
                                    onChange={(e) => handleUpdateTicket({ department_id: parseInt(e.target.value) })}
                                    className="w-full bg-secondary border border-border rounded-lg px-3 py-2 outline-none focus:ring-2 focus:ring-primary"
                                    disabled={!isAuthorized}
                                >
                                    <option value="" disabled>Assign Department</option>
                                    {departments.map(dept => (
                                        <option key={dept.id} value={dept.id}>{dept.name}</option>
                                    ))}
                                </select>
                            </div>

                            <div className="space-y-2">
                                <label className="text-sm font-medium text-muted-foreground">Assign Agent</label>
                                <select 
                                    value={ticket.assigned_to || ''}
                                    onChange={(e) => handleUpdateTicket({ assigned_to: parseInt(e.target.value) })}
                                    className="w-full bg-secondary border border-border rounded-lg px-3 py-2 outline-none focus:ring-2 focus:ring-primary"
                                    disabled={!isAuthorized}
                                >
                                    <option value="">Unassigned</option>
                                    {agents.map(agent => (
                                        <option key={agent.id} value={agent.id}>{agent.name} ({agent.role})</option>
                                    ))}
                                </select>
                            </div>
                        </div>

                        <div className="pt-4 space-y-4 border-t border-border">
                            <div className="flex justify-between text-sm">
                                <span className="text-muted-foreground flex items-center gap-1.5">
                                    <Clock className="h-4 w-4" /> SLA Deadline:
                                </span>
                                <span className={clsx(
                                    "font-medium",
                                    new Date(ticket.sla_deadline) < new Date() ? "text-red-500" : "text-green-500"
                                )}>
                                    {new Date(ticket.sla_deadline).toLocaleString()}
                                </span>
                            </div>
                            <div className="flex justify-between text-sm">
                                <span className="text-muted-foreground flex items-center gap-1.5">
                                    <UserIcon className="h-4 w-4" /> Requested By:
                                </span>
                                <span className="font-medium">{ticket.creator?.name}</span>
                            </div>
                        </div>

                        {ticket.ai_solution && (
                            <div className="bg-primary/5 p-4 rounded-xl border border-primary/20 space-y-2">
                                <h4 className="font-bold text-sm text-primary flex items-center gap-2">
                                    <CheckCircle size={16} /> AI Suggested Action
                                </h4>
                                <p className="text-xs text-muted-foreground italic">
                                    {ticket.ai_solution}
                                </p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </motion.div>
    );
};

export default TicketDetails;
