import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { 
    LayoutDashboard, 
    Ticket, 
    PlusCircle, 
    MessageSquare, 
    ShieldAlert, 
    LogOut,
    BookOpen
} from 'lucide-react';
import { clsx } from 'clsx';

const Sidebar = () => {
    const { user, logout } = useAuth();
    const location = useLocation();

    let navItems = [
        { path: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
        { path: '/tickets', label: 'Tickets', icon: Ticket },
        { path: '/knowledge-base', label: 'Knowledge Base', icon: BookOpen },
    ];

    if (user?.role === 'admin') {
        navItems.push({ path: '/admin', label: 'Admin Panel', icon: ShieldAlert });
    } else if (user?.role === 'support_agent') {
        navItems.push({ path: '/chat', label: 'AI Assistant', icon: MessageSquare });
    } else {
        // Normal employee
        navItems.push({ path: '/tickets/new', label: 'New Ticket', icon: PlusCircle });
        navItems.push({ path: '/chat', label: 'AI Assistant', icon: MessageSquare });
    }

    return (
        <aside className="w-64 bg-card border-r border-border hidden md:flex flex-col h-[calc(100vh-4rem)] sticky top-16">
            <div className="p-4 flex-1">
                <div className="space-y-1">
                    {navItems.map((item) => {
                        const Icon = item.icon;
                        const isActive = location.pathname === item.path;
                        return (
                            <Link
                                key={item.path}
                                to={item.path}
                                className={clsx(
                                    "flex items-center gap-3 px-3 py-2 rounded-md transition-colors",
                                    isActive 
                                        ? "bg-primary text-primary-foreground font-medium" 
                                        : "text-muted-foreground hover:bg-secondary hover:text-foreground"
                                )}
                            >
                                <Icon className="h-5 w-5" />
                                {item.label}
                            </Link>
                        );
                    })}
                </div>
            </div>
            <div className="p-4 border-t border-border">
                <div className="mb-4">
                    <p className="text-sm font-medium">{user?.name}</p>
                    <p className="text-xs text-muted-foreground capitalize">{user?.role}</p>
                </div>
                <button 
                    onClick={logout}
                    className="flex items-center gap-3 px-3 py-2 w-full text-left text-destructive hover:bg-destructive/10 rounded-md transition-colors"
                >
                    <LogOut className="h-5 w-5" />
                    Logout
                </button>
            </div>
        </aside>
    );
};

export default Sidebar;
