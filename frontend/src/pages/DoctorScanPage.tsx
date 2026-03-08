import { useState, useEffect, useRef } from 'react';
import { api } from '../services/api';
import MedicationTable from '../components/MedicationTable';
import type { MedicationItem } from '../types';
import {
    ScanLine,
    Camera,
    User,
    FileText,
    AlertCircle,
    Loader,
} from 'lucide-react';

export default function DoctorScanPage() {
    const [scanning, setScanning] = useState(false);
    const [patientId, setPatientId] = useState('');
    const [patientData, setPatientData] = useState<any>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const scannerRef = useRef<any>(null);

    const startScanner = async () => {
        setScanning(true);
        setError('');

        try {
            const { Html5Qrcode } = await import('html5-qrcode');
            const scanner = new Html5Qrcode('qr-scanner');
            scannerRef.current = scanner;

            await scanner.start(
                { facingMode: 'environment' },
                { fps: 10, qrbox: { width: 250, height: 250 } },
                async (decodedText: string) => {
                    await scanner.stop();
                    setScanning(false);
                    handleQRData(decodedText);
                },
                () => { }
            );
        } catch (err: any) {
            setError('Camera access denied or not available. Use manual input instead.');
            setScanning(false);
        }
    };

    const stopScanner = async () => {
        if (scannerRef.current) {
            try {
                await scannerRef.current.stop();
            } catch { }
        }
        setScanning(false);
    };

    const handleQRData = async (data: string) => {
        try {
            const parsed = JSON.parse(data);
            if (parsed.type === 'medimirror_profile' && parsed.id) {
                setPatientId(parsed.id);
                fetchPatientData(parsed.id);
            } else {
                setError('Invalid QR code. Not a MediMirror profile.');
            }
        } catch {
            setError('Could not parse QR code data.');
        }
    };

    const fetchPatientData = async (id: string) => {
        setLoading(true);
        setError('');
        try {
            const data = await api.getPatientProfile(id);
            setPatientData(data);
        } catch (err: any) {
            setError(err.message || 'Failed to load patient data');
        } finally {
            setLoading(false);
        }
    };

    const handleManualSearch = () => {
        if (patientId.trim()) {
            fetchPatientData(patientId.trim());
        }
    };

    useEffect(() => {
        return () => {
            stopScanner();
        };
    }, []);

    return (
        <div className="page-container">
            <div className="page-header">
                <h1 className="page-title">
                    <span className="gradient-text">Scan</span> Patient QR
                </h1>
                <p className="page-description">
                    Scan a patient's QR code to access their medical profile and prescription history.
                </p>
            </div>

            {error && (
                <div className="alert alert-error">
                    <AlertCircle size={18} /> {error}
                </div>
            )}

            {!patientData && (
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
                    {/* QR Scanner */}
                    <div className="card">
                        <h3 className="card-title" style={{ marginBottom: 16 }}>
                            <Camera size={18} style={{ display: 'inline', marginRight: 8 }} />
                            Camera Scanner
                        </h3>
                        <div
                            id="qr-scanner"
                            style={{
                                width: '100%',
                                minHeight: scanning ? 300 : 0,
                                borderRadius: 'var(--radius-md)',
                                overflow: 'hidden',
                                marginBottom: 16,
                            }}
                        />
                        {!scanning ? (
                            <button className="btn btn-primary w-full" onClick={startScanner}>
                                <ScanLine size={16} /> Start Scanning
                            </button>
                        ) : (
                            <button className="btn btn-danger w-full" onClick={stopScanner}>
                                Stop Scanner
                            </button>
                        )}
                    </div>

                    {/* Manual Entry */}
                    <div className="card">
                        <h3 className="card-title" style={{ marginBottom: 16 }}>
                            <FileText size={18} style={{ display: 'inline', marginRight: 8 }} />
                            Manual Patient ID
                        </h3>
                        <div className="form-group">
                            <label className="form-label">Patient ID</label>
                            <input
                                type="text"
                                className="form-input"
                                placeholder="Enter patient ID"
                                value={patientId}
                                onChange={(e) => setPatientId(e.target.value)}
                            />
                        </div>
                        <button
                            className="btn btn-primary w-full"
                            onClick={handleManualSearch}
                            disabled={!patientId.trim() || loading}
                        >
                            {loading ? <Loader size={16} /> : <User size={16} />}
                            Search Patient
                        </button>
                    </div>
                </div>
            )}

            {/* Patient Data Display */}
            {loading && (
                <div className="loading-page">
                    <div className="spinner" />
                    <p>Loading patient data...</p>
                </div>
            )}

            {patientData && (
                <div>
                    <button
                        className="btn btn-secondary mb-3"
                        onClick={() => {
                            setPatientData(null);
                            setPatientId('');
                        }}
                    >
                        ← Scan Another Patient
                    </button>

                    {/* Profile Card */}
                    <div className="card mb-3">
                        <div className="profile-header">
                            <div className="profile-avatar">
                                {(patientData.profile?.full_name || 'P')
                                    .split(' ')
                                    .map((w: string) => w[0])
                                    .join('')
                                    .toUpperCase()
                                    .slice(0, 2)}
                            </div>
                            <div>
                                <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '1.4rem' }}>
                                    {patientData.profile?.full_name || 'Patient'}
                                </h2>
                                <p style={{ color: 'var(--text-secondary)' }}>
                                    {patientData.profile?.email}
                                </p>
                            </div>
                        </div>

                        <div className="profile-grid">
                            <div>
                                <span className="form-label">Blood Group</span>
                                <p style={{ fontWeight: 600 }}>
                                    {patientData.profile?.blood_group || 'Not specified'}
                                </p>
                            </div>
                            <div>
                                <span className="form-label">Phone</span>
                                <p style={{ fontWeight: 600 }}>
                                    {patientData.profile?.phone || 'Not specified'}
                                </p>
                            </div>
                            <div>
                                <span className="form-label">Allergies</span>
                                <p>{patientData.profile?.allergies || 'None listed'}</p>
                            </div>
                            <div>
                                <span className="form-label">Medical Conditions</span>
                                <p>{patientData.profile?.medical_conditions || 'None listed'}</p>
                            </div>
                            <div style={{ gridColumn: '1 / -1' }}>
                                <span className="form-label">Emergency Contact</span>
                                <p>{patientData.profile?.emergency_contact || 'Not specified'}</p>
                            </div>
                        </div>
                    </div>

                    {/* Prescriptions */}
                    {patientData.prescriptions?.length > 0 && (
                        <div className="card">
                            <h3 className="card-title mb-2">
                                Prescription History ({patientData.prescriptions.length})
                            </h3>
                            {patientData.prescriptions.map((rx: any, i: number) => (
                                <div key={i} style={{ marginBottom: 20 }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                                        <span className="badge badge-info">
                                            {rx.source?.toUpperCase() || 'MANUAL'}
                                        </span>
                                        <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                                            {rx.created_at ? new Date(rx.created_at).toLocaleDateString() : ''}
                                        </span>
                                    </div>
                                    {rx.medications?.length > 0 && (
                                        <MedicationTable medications={rx.medications} showActions={false} />
                                    )}
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}
