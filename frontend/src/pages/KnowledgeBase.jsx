import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';
import { motion } from 'framer-motion';
import { Search, BookOpen, Clock, Eye, Tag, ArrowRight, CheckCircle } from 'lucide-react';
import toast from 'react-hot-toast';

const categories = [
    "All",
    "Authentication Issue",
    "Database Issue",
    "Server Issue",
    "Payment Issue",
    "Network Issue",
    "UI Bug",
    "API Issue",
    "Security Issue",
    "Deployment Issue",
    "Performance Issue"
];

const KnowledgeBase = () => {
    const [articles, setArticles] = useState([]);
    const [popularArticles, setPopularArticles] = useState([]);
    const [recentArticles, setRecentArticles] = useState([]);
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedCategory, setSelectedCategory] = useState('All');
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchArticles();
    }, [selectedCategory]);

    // Perform debounced search
    useEffect(() => {
        const delayDebounce = setTimeout(() => {
            fetchArticles();
        }, 300);
        return () => clearTimeout(delayDebounce);
    }, [searchQuery]);

    const fetchArticles = async () => {
        try {
            const params = {};
            if (searchQuery) params.q = searchQuery;
            if (selectedCategory && selectedCategory !== 'All') params.category = selectedCategory;

            const res = await api.get('/knowledge-base/', { params });
            setArticles(res.data);
            
            // Build popular and recent arrays from the loaded set
            const sortedByViews = [...res.data].sort((a, b) => b.views - a.views);
            const sortedByDate = [...res.data].sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
            
            setPopularArticles(sortedByViews.slice(0, 5));
            setRecentArticles(sortedByDate.slice(0, 5));
        } catch (error) {
            console.error("Failed to fetch knowledge base articles", error);
            toast.error("Failed to load knowledge articles");
        } finally {
            setLoading(false);
        }
    };

    return (
        <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-8 max-w-7xl mx-auto"
        >
            {/* Header Hero Banner */}
            <div className="relative rounded-3xl overflow-hidden bg-radial from-slate-900 to-slate-950 border border-border p-8 md:p-12 text-center space-y-4 shadow-xl">
                <div className="absolute top-0 right-0 h-40 w-40 bg-primary/10 rounded-full blur-3xl"></div>
                <div className="absolute bottom-0 left-0 h-40 w-40 bg-blue-500/10 rounded-full blur-3xl"></div>
                
                <h1 className="text-3xl md:text-5xl font-black tracking-tight text-white flex items-center justify-center gap-3">
                    <BookOpen className="h-8 w-8 text-primary" /> Smart Knowledge Base
                </h1>
                <p className="text-muted-foreground max-w-2xl mx-auto text-sm md:text-base leading-relaxed">
                    Search resolved enterprise tickets, find rapid resolutions, and learn how recurring IT errors were mitigated.
                </p>

                {/* Big Search Bar */}
                <div className="max-w-xl mx-auto relative pt-4">
                    <input
                        type="text"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        placeholder="Search issues, symptoms, root causes..."
                        className="w-full bg-slate-900 border border-border rounded-2xl py-3 px-12 text-white outline-none focus:ring-2 focus:ring-primary transition-all shadow-md placeholder:text-muted-foreground/80"
                    />
                    <Search className="absolute left-4 top-7 text-muted-foreground/80 h-5 w-5" />
                </div>
            </div>

            {/* Category quick selectors */}
            <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-none">
                {categories.map((cat) => (
                    <button
                        key={cat}
                        onClick={() => setSelectedCategory(cat)}
                        className={`px-4 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-colors border ${
                            selectedCategory === cat
                                ? "bg-primary text-primary-foreground border-primary"
                                : "bg-card text-muted-foreground border-border hover:bg-secondary hover:text-foreground"
                        }`}
                    >
                        {cat}
                    </button>
                ))}
            </div>

            {/* Main Content Layout */}
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
                {/* Articles List */}
                <div className="lg:col-span-3 space-y-6">
                    {loading ? (
                        <div className="p-8 text-center text-muted-foreground">Loading solution index...</div>
                    ) : articles.length === 0 ? (
                        <div className="p-12 text-center bg-card border border-border rounded-2xl text-muted-foreground space-y-2">
                            <p className="text-lg font-semibold">No solutions match your criteria</p>
                            <p className="text-sm">Try tweaking your search term or select another category.</p>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {articles.map((art) => (
                                <motion.div
                                    whileHover={{ y: -4, transition: { duration: 0.15 } }}
                                    key={art.id}
                                    className="bg-card border border-border hover:border-primary/50 rounded-2xl p-6 flex flex-col justify-between shadow-sm transition-all"
                                >
                                    <div className="space-y-4">
                                        <div className="flex justify-between items-start">
                                            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-primary/10 text-primary border border-primary/20">
                                                {art.category || 'General'}
                                            </span>
                                            <div className="flex items-center gap-1 text-[11px] text-muted-foreground font-medium">
                                                <Eye className="h-3 w-3" /> {art.views} views
                                            </div>
                                        </div>
                                        
                                        <div className="space-y-2">
                                            <h3 className="font-bold text-lg leading-snug line-clamp-2">
                                                <Link to={`/knowledge-base/${art.id}`} className="hover:text-primary transition-colors">
                                                    {art.title}
                                                </Link>
                                            </h3>
                                            <p className="text-xs text-muted-foreground/90 line-clamp-3 leading-relaxed">
                                                {art.symptoms || art.issue_summary}
                                            </p>
                                        </div>
                                    </div>

                                    <div className="pt-5 border-t border-border/60 mt-5 flex items-center justify-between">
                                        {/* Tags */}
                                        <div className="flex items-center gap-1.5 overflow-hidden max-w-[70%]">
                                            <Tag className="h-3 w-3 text-primary flex-shrink-0" />
                                            <span className="text-[10px] text-muted-foreground font-semibold truncate">
                                                {art.tags.length > 0 ? art.tags.join(', ') : 'None'}
                                            </span>
                                        </div>
                                        
                                        <Link 
                                            to={`/knowledge-base/${art.id}`}
                                            className="text-xs font-semibold text-primary hover:underline flex items-center gap-1"
                                        >
                                            View solution <ArrowRight className="h-3.5 w-3.5" />
                                        </Link>
                                    </div>
                                </motion.div>
                            ))}
                        </div>
                    )}
                </div>

                {/* Sidebar widgets */}
                <div className="space-y-8">
                    {/* Popular articles */}
                    <div className="bg-card border border-border rounded-2xl p-5 shadow-sm space-y-4">
                        <h3 className="font-bold text-base flex items-center gap-2">
                            <Eye className="h-4 w-4 text-primary" /> Popular Solutions
                        </h3>
                        <div className="space-y-3">
                            {popularArticles.length === 0 ? (
                                <p className="text-xs text-muted-foreground">No data available.</p>
                            ) : (
                                popularArticles.map((art, idx) => (
                                    <div key={art.id} className="flex gap-3 items-start border-b border-border/50 pb-2.5 last:border-b-0 last:pb-0">
                                        <span className="text-xs font-black text-muted-foreground/60 w-4 pt-0.5">0{idx + 1}</span>
                                        <div className="space-y-0.5 flex-1 min-w-0">
                                            <Link to={`/knowledge-base/${art.id}`} className="font-bold text-xs line-clamp-2 hover:text-primary transition-colors leading-tight">
                                                {art.title}
                                            </Link>
                                            <span className="text-[10px] text-muted-foreground">{art.category} • {art.views} views</span>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    </div>

                    {/* Recent articles */}
                    <div className="bg-card border border-border rounded-2xl p-5 shadow-sm space-y-4">
                        <h3 className="font-bold text-base flex items-center gap-2">
                            <Clock className="h-4 w-4 text-primary" /> Recently Added
                        </h3>
                        <div className="space-y-3">
                            {recentArticles.length === 0 ? (
                                <p className="text-xs text-muted-foreground">No data available.</p>
                            ) : (
                                recentArticles.map((art) => (
                                    <div key={art.id} className="space-y-0.5 border-b border-border/50 pb-2.5 last:border-b-0 last:pb-0">
                                        <Link to={`/knowledge-base/${art.id}`} className="font-bold text-xs line-clamp-2 hover:text-primary transition-colors leading-tight">
                                            {art.title}
                                        </Link>
                                        <div className="flex justify-between text-[10px] text-muted-foreground">
                                            <span>{art.category}</span>
                                            <span>{new Date(art.created_at).toLocaleDateString()}</span>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </motion.div>
    );
};

export default KnowledgeBase;
