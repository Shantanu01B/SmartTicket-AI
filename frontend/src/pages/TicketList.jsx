import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../services/api';
import { motion } from 'framer-motion';
import { Plus, Search, Filter } from 'lucide-react';

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
        <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium border ${styles[type] || 'bg-secondary text-secondary-foreground'}`}>
            {children}
        </span>
    );
};

const TicketList = () => {
    const [tickets, setTickets] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const navigate = useNavigate();

    useEffect(() => {
        const fetchTickets = async () => {
            try {
                const res = await api.get('/tickets/');
                setTickets(res.data);
            } catch (error) {
                console.error('Failed to fetch tickets', error);
            } finally {
                setLoading(false);
            }
        };
        fetchTickets();
    }, []);

    const filteredTickets = tickets.filter(t => 
        t.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
        (t.category && t.category.toLowerCase().includes(searchTerm.toLowerCase()))
    );

    return (
        <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-6"
        >
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <h1 className="text-3xl font-bold">Tickets</h1>
                <Link 
                    to="/tickets/new" 
                    className="flex items-center gap-2 bg-primary text-primary-foreground py-2 px-4 rounded-md hover:opacity-90 transition-opacity font-medium"
                >
                    <Plus className="h-4 w-4" /> New Ticket
                </Link>
            </div>

            <div className="flex flex-col sm:flex-row gap-4 mb-6">
                <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-5 w-5" />
                    <input
                        type="text"
                        placeholder="Search tickets..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full pl-10 pr-4 py-2 bg-card border border-border rounded-md focus:ring-2 focus:ring-primary outline-none transition-all"
                    />
                </div>
                <button className="flex items-center gap-2 px-4 py-2 bg-card border border-border rounded-md hover:bg-secondary transition-colors text-muted-foreground">
                    <Filter className="h-4 w-4" /> Filter
                </button>
            </div>

            <div className="bg-card border border-border rounded-xl shadow-sm overflow-hidden">
                {loading ? (
                    <div className="p-8 text-center text-muted-foreground">Loading tickets...</div>
                ) : filteredTickets.length === 0 ? (
                    <div className="p-8 text-center text-muted-foreground">No tickets found.</div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full text-left text-sm whitespace-nowrap">
                            <thead className="bg-secondary/50 text-muted-foreground border-b border-border">
                                <tr>
                                    <th className="px-6 py-4 font-medium">ID</th>
                                    <th className="px-6 py-4 font-medium">Subject</th>
                                    <th className="px-6 py-4 font-medium">Category</th>
                                    <th className="px-6 py-4 font-medium">Urgency</th>
                                    <th className="px-6 py-4 font-medium">Status</th>
                                    <th className="px-6 py-4 font-medium">Created</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-border">
                                {filteredTickets.map(ticket => (
                                    <tr 
                                        key={ticket.id} 
                                        onClick={() => navigate(`/tickets/${ticket.id}`)}
                                        className="hover:bg-secondary/20 transition-colors cursor-pointer"
                                    >
                                        <td className="px-6 py-4 text-muted-foreground">#{ticket.id}</td>
                                        <td className="px-6 py-4 font-medium text-foreground">{ticket.title}</td>
                                        <td className="px-6 py-4 text-muted-foreground">{ticket.category || 'N/A'}</td>
                                        <td className="px-6 py-4"><Badge type={ticket.urgency}>{ticket.urgency}</Badge></td>
                                        <td className="px-6 py-4"><Badge type={ticket.status}>{ticket.status}</Badge></td>
                                        <td className="px-6 py-4 text-muted-foreground">
                                            {new Date(ticket.created_at).toLocaleDateString()}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </motion.div>
    );
};

export default TicketList;
