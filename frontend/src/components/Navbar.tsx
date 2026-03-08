import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
    Home,
    FileText,
    Bell,
    QrCode,
    User,
    LogOut,
    Menu,
    X,
    Stethoscope,
    ScanLine,
} from 'lucide-react';

export default function Navbar() {
    const { user, isAuthenticated, signOut } = useAuth();
    const location = useLocation();
    const [mobileOpen, setMobileOpen] = useState(false);

    const isActive = (path: string) => location.pathname === path;

    const patientLinks = [
        { path: '/dashboard', label: 'Dashboard', icon: Home },
        { path: '/prescriptions', label: 'Prescriptions', icon: FileText },
        { path: '/reminders', label: 'Reminders', icon: Bell },
        { path: '/qr-profile', label: 'QR Profile', icon: QrCode },
        { path: '/profile', label: 'Profile', icon: User },
    ];

    const doctorLinks = [
        { path: '/dashboard', label: 'Dashboard', icon: Home },
        { path: '/doctor/scan', label: 'Scan QR', icon: ScanLine },
        { path: '/profile', label: 'Profile', icon: User },
    ];

    const links = user?.role === 'doctor' ? doctorLinks : patientLinks;

    const getInitials = (name: string) =>
        name
            .split(' ')
            .map((w) => w[0])
            .join('')
            .toUpperCase()
            .slice(0, 2);

    return (
        <nav className="navbar">
            <div className="navbar-inner">
                <Link to="/" className="navbar-brand">
                    <img src="/logo.png" alt="MediMirror AI" />
                    <span className="brand-gradient">MediMirror</span>
                    <span style={{ color: 'var(--text-muted)', fontWeight: 400, fontSize: '0.9rem' }}>AI</span>
                </Link>

                {isAuthenticated && (
                    <>
                        <button
                            className="nav-toggle"
                            onClick={() => setMobileOpen(!mobileOpen)}
                            aria-label="Toggle navigation"
                        >
                            {mobileOpen ? <X size={24} /> : <Menu size={24} />}
                        </button>

                        <div className={`navbar-links ${mobileOpen ? 'open' : ''}`}>
                            {links.map((link) => (
                                <Link
                                    key={link.path}
                                    to={link.path}
                                    className={`nav-link ${isActive(link.path) ? 'active' : ''}`}
                                    onClick={() => setMobileOpen(false)}
                                >
                                    <link.icon size={18} />
                                    {link.label}
                                </Link>
                            ))}
                        </div>

                        <div className="nav-user">
                            <div className="nav-user-info">
                                <div className="nav-user-name">{user?.full_name || 'User'}</div>
                                <div className="nav-user-role">
                                    {user?.role === 'doctor' ? (
                                        <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                                            <Stethoscope size={10} /> Doctor
                                        </span>
                                    ) : (
                                        'Patient'
                                    )}
                                </div>
                            </div>
                            <div className="nav-avatar">{getInitials(user?.full_name || 'U')}</div>
                            <button className="btn-nav-logout" onClick={signOut}>
                                <LogOut size={14} />
                            </button>
                        </div>
                    </>
                )}

                {!isAuthenticated && (
                    <div className="navbar-links">
                        <Link to="/login" className={`nav-link ${isActive('/login') ? 'active' : ''}`}>
                            Sign In
                        </Link>
                        <Link to="/signup" className="btn btn-primary btn-sm">
                            Get Started
                        </Link>
                    </div>
                )}
            </div>
        </nav>
    );
}
