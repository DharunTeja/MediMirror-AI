import { useState, useRef, useCallback } from 'react';
import { api } from '../services/api';
import { useSpeechRecognition, useTextToSpeech } from '../hooks/useSpeech';
import MedicationTable from '../components/MedicationTable';
import type { MedicationItem } from '../types';
import {
    Mic,
    MicOff,
    Upload,
    FileText,
    Keyboard,
    Volume2,
    Save,
    Loader,
    CheckCircle2,
    AlertCircle,
} from 'lucide-react';

type TabType = 'voice' | 'ocr' | 'manual';

export default function PrescriptionsPage() {
    const [activeTab, setActiveTab] = useState<TabType>('voice');
    const [rawText, setRawText] = useState('');
    const [medications, setMedications] = useState<MedicationItem[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const fileInputRef = useRef<HTMLInputElement>(null);

    const { isListening, transcript, startListening, stopListening, resetTranscript } =
        useSpeechRecognition();
    const { isSpeaking, speak, stop } = useTextToSpeech();

    // ─── Voice Recording ─────────────────────────────

    const handleVoiceToggle = () => {
        if (isListening) {
            stopListening();
            if (transcript) {
                setRawText(transcript);
                handleParse(transcript);
            }
        } else {
            resetTranscript();
            startListening();
        }
    };

    // ─── Parse Text ───────────────────────────────────

    const handleParse = async (text?: string) => {
        const textToParse = text || rawText;
        if (!textToParse.trim()) return;

        setLoading(true);
        setError('');
        setSuccess('');
        try {
            const response: any = await api.parsePrescription(textToParse);
            setMedications(response.medications || []);
            if (response.medications?.length) {
                setSuccess(`Successfully parsed ${response.medications.length} medication(s)`);
            } else {
                setError('No medications could be parsed from the text. Try rephrasing.');
            }
        } catch (err: any) {
            setError(err.message || 'Failed to parse prescription');
        } finally {
            setLoading(false);
        }
    };

    // ─── OCR Upload ───────────────────────────────────

    const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        setLoading(true);
        setError('');
        setSuccess('');
        try {
            const response: any = await api.ocrExtract(file);
            setRawText(response.extracted_text || '');
            setMedications(response.medications || []);
            if (response.extracted_text) {
                setSuccess('Text extracted successfully!');
            }
        } catch (err: any) {
            setError(err.message || 'OCR extraction failed');
        } finally {
            setLoading(false);
        }
    };

    // ─── Save Prescription ────────────────────────────

    const handleSave = async () => {
        if (!rawText.trim() || !medications.length) {
            setError('Please parse a prescription before saving.');
            return;
        }

        setLoading(true);
        setError('');
        try {
            await api.createPrescription({
                raw_text: rawText,
                source: activeTab,
                medications,
            });
            setSuccess('Prescription saved successfully!');
        } catch (err: any) {
            setError(err.message || 'Failed to save prescription');
        } finally {
            setLoading(false);
        }
    };

    // ─── Read Aloud ───────────────────────────────────

    const readAll = () => {
        if (isSpeaking) {
            stop();
            return;
        }
        const text = medications
            .map(
                (med) =>
                    `Take ${med.medicine_name}, ${med.dosage || ''}, ${med.frequency || ''}, ${med.timing?.replace('_', ' ') || ''
                    }, for ${med.duration || 'as prescribed'}.`
            )
            .join(' ');
        speak(text);
    };

    const tabs: { key: TabType; label: string; icon: React.ReactNode }[] = [
        { key: 'voice', label: 'Voice Input', icon: <Mic size={16} /> },
        { key: 'ocr', label: 'OCR Upload', icon: <Upload size={16} /> },
        { key: 'manual', label: 'Manual Entry', icon: <Keyboard size={16} /> },
    ];

    return (
        <div className="page-container">
            <div className="page-header">
                <h1 className="page-title">
                    <span className="gradient-text">Prescription</span> Processing
                </h1>
                <p className="page-description">
                    Enter your prescription via voice, image upload, or manual text entry.
                </p>
            </div>

            {/* Tabs */}
            <div className="tabs">
                {tabs.map((tab) => (
                    <button
                        key={tab.key}
                        className={`tab ${activeTab === tab.key ? 'active' : ''}`}
                        onClick={() => setActiveTab(tab.key)}
                    >
                        <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                            {tab.icon} {tab.label}
                        </span>
                    </button>
                ))}
            </div>

            {/* Alerts */}
            {error && (
                <div className="alert alert-error">
                    <AlertCircle size={18} /> {error}
                </div>
            )}
            {success && (
                <div className="alert alert-success">
                    <CheckCircle2 size={18} /> {success}
                </div>
            )}

            {/* Voice Input */}
            {activeTab === 'voice' && (
                <div className="card">
                    <div className="voice-section">
                        <button
                            className={`voice-btn ${isListening ? 'recording' : ''}`}
                            onClick={handleVoiceToggle}
                        >
                            {isListening ? <MicOff size={36} /> : <Mic size={36} />}
                        </button>
                        <h3 style={{ marginBottom: 8 }}>
                            {isListening ? 'Listening... Speak your prescription' : 'Tap to start recording'}
                        </h3>
                        <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>
                            Example: "Paracetamol 500mg twice daily after meals for 5 days"
                        </p>

                        {transcript && (
                            <div style={{ marginTop: 24 }}>
                                <label className="form-label">Recognized Text</label>
                                <textarea
                                    className="form-textarea"
                                    value={transcript}
                                    readOnly
                                    rows={3}
                                />
                            </div>
                        )}
                    </div>
                </div>
            )}

            {/* OCR Upload */}
            {activeTab === 'ocr' && (
                <div className="card">
                    <div
                        className="upload-area"
                        onClick={() => fileInputRef.current?.click()}
                    >
                        <div className="upload-icon">
                            <Upload size={48} />
                        </div>
                        <h3>Upload Prescription</h3>
                        <p>
                            Click to upload a prescription image (JPG, PNG) or PDF file.
                            <br />
                            Our OCR engine will extract the medication details for you.
                        </p>
                    </div>
                    <input
                        ref={fileInputRef}
                        type="file"
                        accept="image/*,.pdf"
                        onChange={handleFileUpload}
                        style={{ display: 'none' }}
                    />
                </div>
            )}

            {/* Manual Entry */}
            {activeTab === 'manual' && (
                <div className="card">
                    <div className="form-group">
                        <label className="form-label">Prescription Text</label>
                        <textarea
                            className="form-textarea"
                            placeholder="Enter your prescription text here...&#10;&#10;Example:&#10;1. Paracetamol 500mg twice daily after meals for 5 days&#10;2. Amoxicillin 250mg three times daily before meals for 7 days"
                            value={rawText}
                            onChange={(e) => setRawText(e.target.value)}
                            rows={6}
                        />
                    </div>
                    <button
                        className="btn btn-primary"
                        onClick={() => handleParse()}
                        disabled={loading || !rawText.trim()}
                    >
                        {loading ? <Loader size={16} className="spin" /> : <FileText size={16} />}
                        Parse Prescription
                    </button>
                </div>
            )}

            {/* Extracted Text (for OCR/Voice) */}
            {rawText && activeTab !== 'manual' && (
                <div className="card mt-3">
                    <div className="card-header">
                        <h3 className="card-title">Extracted Text</h3>
                    </div>
                    <textarea
                        className="form-textarea"
                        value={rawText}
                        onChange={(e) => setRawText(e.target.value)}
                        rows={4}
                    />
                    <div style={{ marginTop: 12 }}>
                        <button className="btn btn-primary btn-sm" onClick={() => handleParse()}>
                            Re-parse
                        </button>
                    </div>
                </div>
            )}

            {/* Medication Results */}
            {medications.length > 0 && (
                <div className="card mt-3">
                    <div className="card-header">
                        <h3 className="card-title">
                            Parsed Medications ({medications.length})
                        </h3>
                        <div style={{ display: 'flex', gap: 8 }}>
                            <button className="btn btn-secondary btn-sm" onClick={readAll}>
                                <Volume2 size={14} />
                                {isSpeaking ? 'Stop' : 'Read All'}
                            </button>
                            <button className="btn btn-primary btn-sm" onClick={handleSave} disabled={loading}>
                                <Save size={14} />
                                Save
                            </button>
                        </div>
                    </div>
                    <MedicationTable medications={medications} />
                </div>
            )}
        </div>
    );
}
