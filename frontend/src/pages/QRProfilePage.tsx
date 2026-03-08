import { useState } from 'react';
import { api } from '../services/api';
import { QrCode, Download, Loader, AlertCircle, CheckCircle2 } from 'lucide-react';

export default function QRProfilePage() {
    const [qrData, setQrData] = useState<{ qr_base64: string; profile_url: string } | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const generateQR = async () => {
        setLoading(true);
        setError('');
        try {
            const response: any = await api.generateQR();
            setQrData(response);
        } catch (err: any) {
            setError(err.message || 'Failed to generate QR code');
        } finally {
            setLoading(false);
        }
    };

    const downloadQR = () => {
        if (!qrData?.qr_base64) return;
        const link = document.createElement('a');
        link.href = qrData.qr_base64;
        link.download = 'medimirror-qr-profile.png';
        link.click();
    };

    return (
        <div className="page-container">
            <div className="page-header">
                <h1 className="page-title">
                    <span className="gradient-text">QR</span> Medical Profile
                </h1>
                <p className="page-description">
                    Generate a QR code containing your medical profile. Share it with doctors for quick access.
                </p>
            </div>

            {error && (
                <div className="alert alert-error">
                    <AlertCircle size={18} /> {error}
                </div>
            )}

            <div className="card" style={{ maxWidth: 500, margin: '0 auto' }}>
                {!qrData ? (
                    <div className="qr-display">
                        <div
                            style={{
                                width: 200,
                                height: 200,
                                margin: '0 auto 24px',
                                background: 'var(--bg-input)',
                                borderRadius: 'var(--radius-lg)',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                            }}
                        >
                            <QrCode size={80} style={{ color: 'var(--text-muted)', opacity: 0.3 }} />
                        </div>
                        <h3 style={{ marginBottom: 8 }}>Generate Your QR Code</h3>
                        <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginBottom: 24 }}>
                            Your QR code will contain your medical profile information including
                            name, blood group, allergies, and emergency contact.
                        </p>
                        <button className="btn btn-primary btn-lg" onClick={generateQR} disabled={loading}>
                            {loading ? <Loader size={18} /> : <QrCode size={18} />}
                            Generate QR Code
                        </button>
                    </div>
                ) : (
                    <div className="qr-display">
                        <div className="alert alert-success mb-2">
                            <CheckCircle2 size={18} /> QR Code generated successfully!
                        </div>
                        <img
                            src={qrData.qr_base64}
                            alt="Medical Profile QR Code"
                            style={{
                                maxWidth: 250,
                                borderRadius: 'var(--radius-md)',
                                background: 'white',
                                padding: 16,
                                margin: '16px auto',
                                display: 'block',
                            }}
                        />
                        <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', marginBottom: 16 }}>
                            Show this QR code to your doctor for instant profile access.
                        </p>
                        <div style={{ display: 'flex', gap: 12, justifyContent: 'center' }}>
                            <button className="btn btn-primary" onClick={downloadQR}>
                                <Download size={16} /> Download QR
                            </button>
                            <button className="btn btn-secondary" onClick={generateQR}>
                                Regenerate
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
