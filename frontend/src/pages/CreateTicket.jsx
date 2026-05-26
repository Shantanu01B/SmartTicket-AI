import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api from '../services/api';
import toast from 'react-hot-toast';
import { motion, AnimatePresence } from 'framer-motion';
import { Send, Bot, AlertTriangle, ExternalLink } from 'lucide-react';

const CreateTicket = () => {
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [loading, setLoading] = useState(false);
    const [similarTickets, setSimilarTickets] = useState([]);
    const [checkingDuplicates, setCheckingDuplicates] = useState(false);
    const navigate = useNavigate();

    // Knowledge Base Recommendations states
    const [recommendedSolution, setRecommendedSolution] = useState(null);
    const [dismissRecommendation, setDismissRecommendation] = useState(false);

    useEffect(() => {
        const checkDuplicates = async () => {
            if (title.length < 5) {
                setSimilarTickets([]);
                setRecommendedSolution(null);
                return;
            }
            
            setCheckingDuplicates(true);
            try {
                const [dupRes, recRes] = await Promise.all([
                    api.post('/tickets/check-duplicates', { title, description }),
                    api.post('/knowledge-base/recommend', { title, description })
                ]);
                
                setSimilarTickets(dupRes.data);
                
                if (recRes.data && recRes.data.length > 0) {
                    setRecommendedSolution(recRes.data[0]); // Suggest the top matching article
                    setDismissRecommendation(false);
                } else {
                    setRecommendedSolution(null);
                }
            } catch (error) {
                console.error('Failed to run AI duplicate/solution scans', error);
            } finally {
                setCheckingDuplicates(false);
            }
        };

        const timeoutId = setTimeout(checkDuplicates, 800);
        return () => clearTimeout(timeoutId);
    }, [title, description]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        const toastId = toast.loading('Local AI is analyzing your ticket...');
        try {
            await api.post('/tickets/', { title, description });
            toast.success('Ticket created successfully!', { id: toastId });
            navigate('/tickets');
        } catch (error) {
            toast.error(error.response?.data?.msg || 'Failed to create ticket', { id: toastId });
        } finally {
            setLoading(false);
        }
    };

    return (
        <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="max-w-2xl mx-auto space-y-6"
        >
            <div className="flex items-center gap-3 mb-6">
                <h1 className="text-3xl font-bold">Submit New Ticket</h1>
            </div>

            <div className="bg-card border border-border rounded-xl p-6 shadow-sm">
                <div className="flex items-start gap-4 mb-6 p-4 bg-primary/10 rounded-lg border border-primary/20">
                    <Bot className="h-6 w-6 text-primary flex-shrink-0 mt-1" />
                    <div>
                        <h4 className="font-semibold text-primary">AI-Powered Routing</h4>
                        <p className="text-sm text-muted-foreground">
                            Just describe your issue naturally. Our Local AI will automatically categorize, prioritize, and assign it to the correct department.
                        </p>
                    </div>
                </div>

                <form onSubmit={handleSubmit} className="space-y-5">
                    <div>
                        <label className="block text-sm font-medium mb-2">Subject / Title</label>
                        <input
                            type="text"
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            className="w-full px-4 py-2 bg-background border border-border rounded-md focus:ring-2 focus:ring-primary outline-none transition-all"
                            placeholder="Briefly summarize the issue"
                            required
                            disabled={loading}
                        />
                        {checkingDuplicates && (
                            <div className="flex items-center gap-2 mt-1 text-xs text-muted-foreground animate-pulse">
                                <div className="h-2 w-2 bg-primary rounded-full"></div>
                                AI is scanning for similar issues...
                            </div>
                        )}
                    </div>

                    <AnimatePresence>
                        {similarTickets.length > 0 && (
                            <motion.div 
                                initial={{ opacity: 0, height: 0 }}
                                animate={{ opacity: 1, height: 'auto' }}
                                exit={{ opacity: 0, height: 0 }}
                                className="overflow-hidden mb-4"
                            >
                                <div className="bg-amber-500/10 border border-amber-500/20 rounded-lg p-4 space-y-3">
                                    <div className="flex items-center gap-2 text-amber-500 font-semibold text-sm">
                                        <AlertTriangle size={16} />
                                        Possible Duplicates Found
                                    </div>
                                    <div className="space-y-2">
                                        {similarTickets.map(ticket => (
                                            <div key={ticket.id} className="flex items-center justify-between bg-background/50 p-2 rounded border border-border/50 text-sm">
                                                <span className="truncate flex-1 mr-4">#{ticket.id} - {ticket.title}</span>
                                                <Link 
                                                    to={`/tickets/${ticket.id}`} 
                                                    className="flex items-center gap-1 text-primary hover:underline font-medium text-xs whitespace-nowrap"
                                                >
                                                    View <ExternalLink size={12} />
                                                </Link>
                                            </div>
                                        ))}
                                    </div>
                                    <p className="text-xs text-muted-foreground italic">
                                        An existing ticket might already solve your problem. Please review them to avoid duplicate work.
                                    </p>
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>

                    {/* Pre-submit Smart Knowledge Recommendation */}
                    <AnimatePresence>
                        {recommendedSolution && !dismissRecommendation && (
                            <motion.div 
                                initial={{ opacity: 0, scale: 0.95 }}
                                animate={{ opacity: 1, scale: 1 }}
                                exit={{ opacity: 0, scale: 0.95 }}
                                className="bg-primary/10 border border-primary/20 rounded-xl p-5 space-y-4 mb-4"
                            >
                                <div className="flex items-center gap-2 text-primary font-bold text-sm">
                                    <span role="img" aria-label="book">📚</span> Similar Solution Found
                                </div>
                                <div className="space-y-2 text-sm">
                                    <div className="flex justify-between items-baseline">
                                        <h4 className="font-extrabold text-foreground">{recommendedSolution.title}</h4>
                                        <span className="text-xs font-semibold text-green-500 bg-green-500/10 border border-green-500/20 px-2 py-0.5 rounded-full">
                                            {recommendedSolution.match_score}% Match
                                        </span>
                                    </div>
                                    <div className="space-y-1 text-left">
                                        <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Suggested Resolution:</span>
                                        <p className="text-xs text-muted-foreground/90 bg-secondary/35 p-3 rounded-lg leading-relaxed border border-border/50">
                                            {recommendedSolution.resolution_steps}
                                        </p>
                                    </div>
                                </div>
                                <div className="flex gap-3 pt-1">
                                    <Link 
                                        to={`/knowledge-base/${recommendedSolution.id}`} 
                                        target="_blank" 
                                        rel="noopener noreferrer" 
                                        className="text-xs font-bold bg-primary text-primary-foreground px-3.5 py-2 rounded-lg hover:opacity-90 transition-opacity flex items-center gap-1.5"
                                    >
                                        View Article <ExternalLink size={12} />
                                    </Link>
                                    <button 
                                        type="button"
                                        onClick={() => setDismissRecommendation(true)}
                                        className="text-xs font-semibold text-muted-foreground hover:text-foreground px-3.5 py-2 rounded-lg border border-border hover:bg-secondary transition-colors"
                                    >
                                        Continue Creating Ticket
                                    </button>
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>
                    
                    <div>
                        <label className="block text-sm font-medium mb-2">Description</label>
                        <textarea
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            className="w-full px-4 py-2 bg-background border border-border rounded-md focus:ring-2 focus:ring-primary outline-none transition-all min-h-[150px]"
                            placeholder="Provide as much detail as possible..."
                            required
                            disabled={loading}
                        />
                    </div>

                    <div className="flex justify-end">
                        <button
                            type="submit"
                            disabled={loading}
                            className="flex items-center gap-2 bg-primary text-primary-foreground py-2 px-6 rounded-md hover:opacity-90 transition-opacity font-medium disabled:opacity-50"
                        >
                            {loading ? 'Processing...' : 'Submit Ticket'}
                            {!loading && <Send className="h-4 w-4" />}
                        </button>
                    </div>
                </form>
            </div>
        </motion.div>
    );
};

export default CreateTicket;
