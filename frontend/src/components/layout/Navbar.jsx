import React from 'react';
import { useAuth } from '../../context/AuthContext';
import { TicketCheck, Menu } from 'lucide-react';

const Navbar = () => {
    return (
        <nav className="h-16 border-b border-border bg-card sticky top-0 z-50 flex items-center justify-between px-4 sm:px-6">
            <div className="flex items-center gap-2">
                <TicketCheck className="h-6 w-6 text-primary" />
                <span className="font-bold text-xl hidden sm:block">SmartTicket AI</span>
            </div>
            
            <div className="flex items-center gap-4">
                <button className="md:hidden p-2 text-muted-foreground hover:bg-secondary rounded-md">
                    <Menu className="h-5 w-5" />
                </button>
                {/* Could add dark mode toggle here */}
            </div>
        </nav>
    );
};

export default Navbar;
