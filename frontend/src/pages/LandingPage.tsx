import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
    Mic,
    ScanLine,
    Bell,
    QrCode,
    Globe,
    Shield,
    ArrowRight,
} from 'lucide-react';

export default function LandingPage() {
    const { isAuthenticated } = useAuth();

    const features = [
        {
            icon: <Mic size={24} />,
            color: 'blue',
            title: 'Voice Prescription Assistant',
            desc: 'Speak your prescription and our AI converts it into structured medication details instantly.',
        },
        {
            icon: <ScanLine size={24} />,
            color: 'teal',
            title: 'OCR Prescription Reader',
            desc: 'Upload prescription images or PDFs. Our OCR engine extracts medication details automatically.',
        },
        {
            icon: <Globe size={24} />,
            color: 'purple',
            title: 'Multilingual Voice Output',
            desc: 'The system reads medication instructions aloud with text-to-speech in multiple languages.',
        },
        {
            icon: <Bell size={24} />,
            color: 'orange',
            title: 'Smart Medication Reminders',
            desc: 'Never miss a dose. Automatic reminders notify you when it\'s time for your medication.',
        },
        {
            icon: <QrCode size={24} />,
            color: 'green',
            title: 'QR Medical Profile',
            desc: 'Generate a QR code with your medical profile. Doctors can scan it for instant access.',
        },
        {
            icon: <Shield size={24} />,
            color: 'blue',
            title: 'Secure & Private',
            desc: 'Role-based authentication ensures your medical data stays private and secure.',
        },
    ];

    return (
        <div className="page-container">
            {/* Hero Section */}
            <section className="hero" id="hero">
                <div className="hero-content">
                    <img src="/logo.png" alt="MediMirror AI" className="hero-logo" />
                    <h1 className="hero-title">
                        Your AI-Powered{' '}
                        <span className="gradient-text">Prescription Assistant</span>
                    </h1>
                    <p className="hero-subtitle">
                        MediMirror AI helps patients understand and follow medical prescriptions
                        through intelligent voice processing, OCR extraction, smart reminders,
                        and QR-based medical profile sharing.
                    </p>
                    <div className="hero-actions">
                        {isAuthenticated ? (
                            <Link to="/dashboard" className="btn btn-primary btn-lg">
                                Go to Dashboard <ArrowRight size={18} />
                            </Link>
                        ) : (
                            <>
                                <Link to="/signup" className="btn btn-primary btn-lg">
                                    Get Started Free <ArrowRight size={18} />
                                </Link>
                                <Link to="/login" className="btn btn-secondary btn-lg">
                                    Sign In
                                </Link>
                            </>
                        )}
                    </div>
                </div>
            </section>

            {/* Features Section */}
            <section className="features-section" id="features">
                <h2 className="section-title">
                    Powerful <span className="gradient-text">Features</span>
                </h2>
                <p className="section-subtitle">
                    Everything you need to manage prescriptions effectively and improve
                    healthcare accessibility.
                </p>
                <div className="features-grid">
                    {features.map((f, i) => (
                        <div
                            key={i}
                            className="feature-card card-glow"
                            style={{ animationDelay: `${i * 0.1}s` }}
                        >
                            <div className={`feature-icon ${f.color}`}>{f.icon}</div>
                            <h3>{f.title}</h3>
                            <p>{f.desc}</p>
                        </div>
                    ))}
                </div>
            </section>

            {/* CTA Section */}
            <section style={{ padding: '60px 2rem', textAlign: 'center' }}>
                <div className="card card-glass" style={{ maxWidth: 700, margin: '0 auto', padding: 48 }}>
                    <h2 className="section-title" style={{ marginBottom: 12 }}>
                        Ready to get started?
                    </h2>
                    <p className="section-subtitle" style={{ marginBottom: 32 }}>
                        Join MediMirror AI and take control of your medication management today.
                    </p>
                    {!isAuthenticated && (
                        <Link to="/signup" className="btn btn-primary btn-lg">
                            Create Your Account <ArrowRight size={18} />
                        </Link>
                    )}
                </div>
            </section>

            {/* Footer */}
            <footer
                style={{
                    textAlign: 'center',
                    padding: '32px 2rem',
                    borderTop: '1px solid var(--border-color)',
                    color: 'var(--text-muted)',
                    fontSize: '0.85rem',
                }}
            >
                <p>
                    © {new Date().getFullYear()} MediMirror AI. Built for better healthcare
                    accessibility.
                </p>
            </footer>
        </div>
    );
}
