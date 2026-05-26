import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider, useAuth } from './context/AuthContext';

// Pages
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import TicketList from './pages/TicketList';
import TicketDetails from './pages/TicketDetails';
import CreateTicket from './pages/CreateTicket';
import AdminPanel from './pages/AdminPanel';
import Chatbot from './pages/Chatbot';
import KnowledgeBase from './pages/KnowledgeBase';
import KnowledgeArticleDetails from './pages/KnowledgeArticleDetails';

// Layout
import Layout from './components/layout/Layout';

const ProtectedRoute = ({ children, requireAdmin }) => {
    const { user } = useAuth();
    if (!user) return <Navigate to="/login" />;
    if (requireAdmin && user.role !== 'admin') return <Navigate to="/dashboard" />;
    return children;
};

const AppRoutes = () => {
    const { user } = useAuth();

    return (
        <Routes>
            <Route path="/login" element={user ? <Navigate to="/dashboard" /> : <Login />} />
            <Route path="/register" element={user ? <Navigate to="/dashboard" /> : <Register />} />
            
            {/* Protected Routes wrapped in Layout */}
            <Route path="/" element={<ProtectedRoute><Layout /></ProtectedRoute>}>
                <Route index element={<Navigate to="/dashboard" />} />
                <Route path="dashboard" element={<Dashboard />} />
                <Route path="tickets" element={<TicketList />} />
                <Route path="tickets/:id" element={<TicketDetails />} />
                <Route path="tickets/new" element={<CreateTicket />} />
                <Route path="chat" element={<Chatbot />} />
                <Route path="knowledge-base" element={<KnowledgeBase />} />
                <Route path="knowledge-base/:id" element={<KnowledgeArticleDetails />} />
                
                {/* Admin Only */}
                <Route path="admin" element={<ProtectedRoute requireAdmin={true}><AdminPanel /></ProtectedRoute>} />
            </Route>
        </Routes>
    );
};

const App = () => {
    return (
        <AuthProvider>
            <BrowserRouter>
                <Toaster position="top-right" toastOptions={{ className: 'dark:bg-slate-800 dark:text-white' }} />
                <AppRoutes />
            </BrowserRouter>
        </AuthProvider>
    );
};

export default App;
