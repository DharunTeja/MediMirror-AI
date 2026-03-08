import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
    FileText,
    Bell,
    QrCode,
    Mic,
    ScanLine,
    ArrowRight,
    Activity,
    Pill,
} from 'lucide-react';

export default function DashboardPage() {
    const { user } = useAuth();
    const isDoctor = user?.role === 'doctor';

    const patientQuickActions = [
        {
            icon: <Mic size={24} />,
            title: 'Voice Prescription',
            desc: 'Speak your prescription to capture medication details',
            path: '/prescriptions',
            color: 'var(--primary-400)',
            bg: 'rgba(0, 144, 231, 0.12)',
        },
        {
            icon: <ScanLine size={24} />,
            title: 'Scan Prescription',
            desc: 'Upload a prescription image or PDF for OCR extraction',
            path: '/prescriptions',
            color: 'var(--accent-400)',
            bg: 'rgba(20, 184, 166, 0.12)',
        },
        {
            icon: <Bell size={24} />,
            title: 'My Reminders',
            desc: 'View and manage your medication reminders',
            path: '/reminders',
            color: 'var(--warning)',
            bg: 'rgba(245, 158, 11, 0.12)',
        },
        {
            icon: <QrCode size={24} />,
            title: 'QR Profile',
            desc: 'Generate your medical profile QR code for doctor access',
            path: '/qr-profile',
            color: 'var(--purple-400)',
            bg: 'rgba(139, 92, 246, 0.12)',
        },
    ];

    const doctorQuickActions = [
        {
            icon: <ScanLine size={24} />,
            title: 'Scan Patient QR',
            desc: 'Scan a patient\'s QR code to view their medical profile',
            path: '/doctor/scan',
            color: 'var(--primary-400)',
            bg: 'rgba(0, 144, 231, 0.12)',
        },
    ];

    const actions = isDoctor ? doctorQuickActions : patientQuickActions;

    return (
        <div className="page-container">
            {/* Welcome Section */}
            <div className="page-header">
                <h1 className="page-title">
                    Welcome back,{' '}
                    <span className="gradient-text">{user?.full_name?.split(' ')[0] || 'User'}</span>
                </h1>
                <p className="page-description">
                    {isDoctor
                        ? 'Access patient profiles and manage medical records.'
                        : 'Manage your prescriptions, medications, and health records.'}
                </p>
            </div>

            {/* Stats */}
            <div className="dashboard-grid">
                <div className="stat-card">
                    <div className="stat-icon" style={{ background: 'rgba(0, 144, 231, 0.12)', color: 'var(--primary-400)' }}>
                        <FileText size={22} />
                    </div>
                    <div>
                        <div className="stat-value">—</div>
                        <div className="stat-label">Prescriptions</div>
                    </div>
                </div>
                <div className="stat-card">
                    <div className="stat-icon" style={{ background: 'rgba(20, 184, 166, 0.12)', color: 'var(--accent-400)' }}>
                        <Pill size={22} />
                    </div>
                    <div>
                        <div className="stat-value">—</div>
                        <div className="stat-label">Active Medications</div>
                    </div>
                </div>
                <div className="stat-card">
                    <div className="stat-icon" style={{ background: 'rgba(245, 158, 11, 0.12)', color: 'var(--warning)' }}>
                        <Bell size={22} />
                    </div>
                    <div>
                        <div className="stat-value">—</div>
                        <div className="stat-label">Active Reminders</div>
                    </div>
                </div>
                <div className="stat-card">
                    <div className="stat-icon" style={{ background: 'rgba(16, 185, 129, 0.12)', color: 'var(--success)' }}>
                        <Activity size={22} />
                    </div>
                    <div>
                        <div className="stat-value">Active</div>
                        <div className="stat-label">Health Status</div>
                    </div>
                </div>
            </div>

            {/* Quick Actions */}
            <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '1.3rem', marginBottom: 20 }}>
                Quick Actions
            </h2>
            <div className="features-grid">
                {actions.map((action, i) => (
                    <Link
                        key={i}
                        to={action.path}
                        className="feature-card card-glow"
                        style={{ textDecoration: 'none', color: 'inherit' }}
                    >
                        <div
                            className="feature-icon"
                            style={{ background: action.bg, color: action.color }}
                        >
                            {action.icon}
                        </div>
                        <h3>{action.title}</h3>
                        <p>{action.desc}</p>
                        <div style={{ marginTop: 16, color: 'var(--primary-400)', fontSize: '0.85rem', fontWeight: 600, display: 'flex', alignItems: 'center', gap: 6 }}>
                            Open <ArrowRight size={14} />
                        </div>
                    </Link>
                ))}
            </div>
        </div>
    );
}
