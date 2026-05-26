import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import api from '../services/api';
import { motion } from 'framer-motion';
import { 
    ArrowLeft, 
    BookOpen, 
    Eye, 
    Calendar, 
    Tag, 
    Shield, 
    Info, 
    FileText, 
    AlertOctagon, 
    CheckCircle 
} from 'lucide-react';
import toast from 'react-hot-toast';

const KnowledgeArticleDetails = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [article, setArticle] = useState(null);
    const [related, setRelated] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchArticleDetails();
    }, [id]);

    const fetchArticleDetails = async () => {
        setLoading(true);
        try {
            // Fetch article details (automatically increments views on backend)
            const res = await api.get(`/knowledge-base/${id}`);
            setArticle(res.data);
            
            // Fetch related articles based on this article's content
            const recommendRes = await api.post('/knowledge-base/recommend', {
                title: res.data.title,
                description: `${res.data.symptoms} ${res.data.root_cause}`
            });
            // Filter out current article
            const filteredRelated = recommendRes.data.filter(item => item.id !== res.data.id);
            setRelated(filteredRelated);
        } catch (error) {
            console.error("Failed to load article details", error);
            toast.error("Failed to load article details");
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return <div className="p-8 text-center text-muted-foreground">Loading solution details...</div>;
    }

    if (!article) {
        return (
            <div className="p-8 text-center space-y-4">
                <p className="text-destructive font-semibold">Solution article not found</p>
                <button onClick={() => navigate('/knowledge-base')} className="text-primary hover:underline">
                    Back to Knowledge Base
                </button>
            </div>
        );
    }

    return (
        <motion.div 
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            className="space-y-6 max-w-6xl mx-auto"
        >
            {/* Back Button */}
            <button 
                onClick={() => navigate('/knowledge-base')}
                className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors group"
            >
                <ArrowLeft className="h-4 w-4 group-hover:-translate-x-1 transition-transform" />
                Back to Knowledge Base
            </button>

            {/* Layout Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Main Content (Structured fields) */}
                <div className="lg:col-span-2 space-y-6">
                    <div className="bg-card border border-border rounded-2xl p-6 md:p-8 shadow-sm space-y-6">
                        {/* Title and Badge */}
                        <div className="space-y-3">
                            <div className="flex flex-wrap gap-2">
                                <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-primary/10 text-primary border border-primary/20">
                                    {article.category || 'General'}
                                </span>
                                {article.is_approved ? (
                                    <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-green-500/10 text-green-500 border border-green-500/20 flex items-center gap-1">
                                        <CheckCircle className="h-3.5 w-3.5" /> Official Solution
                                    </span>
                                ) : (
                                    <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-500/10 text-amber-500 border border-amber-500/20">
                                        Draft Article
                                    </span>
                                )}
                            </div>
                            <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight text-foreground leading-tight">
                                {article.title}
                            </h1>
                        </div>

                        {/* Article Metadata */}
                        <div className="flex flex-wrap gap-4 text-xs font-medium text-muted-foreground border-y border-border/50 py-3">
                            <div className="flex items-center gap-1.5">
                                <Eye className="h-4 w-4 text-primary" /> {article.views} views
                            </div>
                            <div className="flex items-center gap-1.5">
                                <Calendar className="h-4 w-4 text-primary" /> Created {new Date(article.created_at).toLocaleDateString()}
                            </div>
                        </div>

                        {/* 1. Issue Summary */}
                        <div className="space-y-2">
                            <h3 className="text-sm font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-2">
                                <Info className="h-4.5 w-4.5 text-primary" /> Issue Overview
                            </h3>
                            <div className="bg-secondary/40 p-4 rounded-xl border border-border/40 text-sm leading-relaxed">
                                {article.issue_summary || "No overview recorded."}
                            </div>
                        </div>

                        {/* 2. Symptoms */}
                        <div className="space-y-2">
                            <h3 className="text-sm font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-2">
                                <AlertOctagon className="h-4.5 w-4.5 text-orange-500" /> Symptoms
                            </h3>
                            <div className="bg-orange-500/5 p-4 rounded-xl border border-orange-500/15 text-sm leading-relaxed whitespace-pre-wrap">
                                {article.symptoms || "No symptoms recorded."}
                            </div>
                        </div>

                        {/* 3. Root Cause */}
                        <div className="space-y-2">
                            <h3 className="text-sm font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-2">
                                <Shield className="h-4.5 w-4.5 text-red-500" /> Inferred Root Cause
                            </h3>
                            <div className="bg-red-500/5 p-4 rounded-xl border border-red-500/15 text-sm leading-relaxed whitespace-pre-wrap">
                                {article.root_cause || "Analyzing underlying fault lines..."}
                            </div>
                        </div>

                        {/* 4. Resolution Steps */}
                        <div className="space-y-2">
                            <h3 className="text-sm font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-2">
                                <FileText className="h-4.5 w-4.5 text-green-500" /> Resolution Steps
                            </h3>
                            <div className="bg-green-500/5 p-4 rounded-xl border border-green-500/15 text-sm leading-relaxed whitespace-pre-wrap">
                                {article.resolution_steps}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Sidebar Widget (Article metadata & Related Articles) */}
                <div className="space-y-6">
                    {/* Tags Card */}
                    <div className="bg-card border border-border rounded-2xl p-5 shadow-sm space-y-4">
                        <h3 className="font-bold text-sm flex items-center gap-2 uppercase tracking-wider text-muted-foreground">
                            <Tag className="h-4 w-4 text-primary" /> Keywords & Tags
                        </h3>
                        <div className="flex flex-wrap gap-2">
                            {article.tags.length === 0 ? (
                                <span className="text-xs text-muted-foreground">No tags attached.</span>
                            ) : (
                                article.tags.map((tag) => (
                                    <span key={tag} className="px-2.5 py-1 rounded-lg text-xs font-semibold bg-secondary text-foreground hover:bg-primary hover:text-primary-foreground cursor-pointer transition-colors border border-border">
                                        {tag}
                                    </span>
                                ))
                            )}
                        </div>
                    </div>

                    {/* Related Articles Card */}
                    <div className="bg-card border border-border rounded-2xl p-5 shadow-sm space-y-4">
                        <h3 className="font-bold text-sm flex items-center gap-2 uppercase tracking-wider text-muted-foreground">
                            <BookOpen className="h-4 w-4 text-primary" /> Related Solutions
                        </h3>
                        <div className="space-y-3">
                            {related.length === 0 ? (
                                <p className="text-xs text-muted-foreground">No other matching solutions found.</p>
                            ) : (
                                related.map((item) => (
                                    <div key={item.id} className="border-b border-border/50 pb-3 last:border-0 last:pb-0 space-y-1">
                                        <Link 
                                            to={`/knowledge-base/${item.id}`}
                                            className="font-bold text-xs hover:text-primary transition-colors line-clamp-2 leading-snug"
                                        >
                                            {item.title}
                                        </Link>
                                        <div className="flex items-center justify-between text-[10px] text-muted-foreground font-semibold">
                                            <span>{item.category}</span>
                                            <span className="text-green-500">{item.match_score || 0}% match</span>
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

export default KnowledgeArticleDetails;
