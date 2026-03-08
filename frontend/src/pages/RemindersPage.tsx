import { useState, useEffect } from 'react';
import { api } from '../services/api';
import type { Reminder } from '../types';
import { Bell, Clock, Trash2, Loader, AlertCircle, BellRing } from 'lucide-react';

export default function RemindersPage() {
    const [reminders, setReminders] = useState<Reminder[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        fetchReminders();
    }, []);

    const fetchReminders = async () => {
        try {
            const data: any = await api.getReminders();
            setReminders(data || []);
        } catch (err: any) {
            setError(err.message || 'Failed to load reminders');
        } finally {
            setLoading(false);
        }
    };

    const deleteReminder = async (id: string) => {
        try {
            await api.deleteReminder(id);
            setReminders((prev) => prev.filter((r) => r.id !== id));
        } catch (err: any) {
            setError(err.message || 'Failed to delete reminder');
        }
    };

    // Request notification permission
    useEffect(() => {
        if ('Notification' in window && Notification.permission === 'default') {
            Notification.requestPermission();
        }
    }, []);

    // Simple client-side reminder check
    useEffect(() => {
        const interval = setInterval(() => {
            const now = new Date();
            const currentTime = `${String(now.getHours()).padStart(2, '0')}:${String(
                now.getMinutes()
            ).padStart(2, '0')}`;

            reminders.forEach((reminder) => {
                if (reminder.is_active && reminder.times.includes(currentTime)) {
                    if ('Notification' in window && Notification.permission === 'granted') {
                        new Notification('💊 MediMirror Reminder', {
                            body: `Time to take ${reminder.medication_name} (${reminder.frequency})`,
                            icon: '/logo.png',
                        });
                    }
                }
            });
        }, 60000); // Check every minute

        return () => clearInterval(interval);
    }, [reminders]);

    if (loading) {
        return (
            <div className="loading-page">
                <div className="spinner" />
                <p>Loading reminders...</p>
            </div>
        );
    }

    return (
        <div className="page-container">
            <div className="page-header">
                <h1 className="page-title">
                    <span className="gradient-text">Medication</span> Reminders
                </h1>
                <p className="page-description">
                    Your scheduled medication reminders. Get notified when it's time for your dose.
                </p>
            </div>

            {error && (
                <div className="alert alert-error">
                    <AlertCircle size={18} /> {error}
                </div>
            )}

            {/* Notification permission card */}
            {'Notification' in window && Notification.permission !== 'granted' && (
                <div className="alert alert-warning mb-3">
                    <BellRing size={18} />
                    <div>
                        <strong>Enable notifications</strong> to receive medication reminders.{' '}
                        <button
                            className="btn btn-sm btn-outline"
                            style={{ marginLeft: 8 }}
                            onClick={() => Notification.requestPermission()}
                        >
                            Enable
                        </button>
                    </div>
                </div>
            )}

            {/* Reminders List */}
            {reminders.length === 0 ? (
                <div className="card">
                    <div className="empty-state">
                        <Bell size={64} />
                        <h3>No Reminders Set</h3>
                        <p>
                            Reminders are automatically created when you save a prescription.
                            Go to Prescriptions to add one.
                        </p>
                    </div>
                </div>
            ) : (
                <div>
                    {reminders.map((reminder) => (
                        <div className="reminder-card" key={reminder.id}>
                            <div className="reminder-icon">
                                <Bell size={20} />
                            </div>
                            <div className="reminder-info">
                                <div className="reminder-name">{reminder.medication_name}</div>
                                <div className="reminder-schedule">
                                    <Clock size={12} style={{ marginRight: 4, display: 'inline' }} />
                                    {reminder.frequency}
                                    {reminder.end_date && ` — until ${new Date(reminder.end_date).toLocaleDateString()}`}
                                </div>
                                <div className="reminder-times">
                                    {reminder.times.map((time, i) => (
                                        <span key={i} className="reminder-time-badge">
                                            {time}
                                        </span>
                                    ))}
                                </div>
                            </div>
                            <button
                                className="btn btn-icon btn-danger"
                                onClick={() => reminder.id && deleteReminder(reminder.id)}
                                title="Delete reminder"
                            >
                                <Trash2 size={16} />
                            </button>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
