import { useState, FormEvent } from 'react';
import { useAuth } from '../context/AuthContext';
import { Save, User, AlertCircle, CheckCircle2 } from 'lucide-react';

export default function ProfilePage() {
    const { user, updateProfile } = useAuth();
    const [formData, setFormData] = useState({
        full_name: user?.full_name || '',
        phone: user?.phone || '',
        date_of_birth: user?.date_of_birth || '',
        blood_group: user?.blood_group || '',
        allergies: user?.allergies || '',
        medical_conditions: user?.medical_conditions || '',
        emergency_contact: user?.emergency_contact || '',
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    const handleChange = (field: string, value: string) => {
        setFormData((prev) => ({ ...prev, [field]: value }));
    };

    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        setSuccess('');

        try {
            await updateProfile(formData as any);
            setSuccess('Profile updated successfully!');
        } catch (err: any) {
            setError(err.message || 'Failed to update profile');
        } finally {
            setLoading(false);
        }
    };

    const getInitials = (name: string) =>
        name.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2);

    return (
        <div className="page-container">
            <div className="page-header">
                <h1 className="page-title">
                    <span className="gradient-text">My</span> Profile
                </h1>
                <p className="page-description">
                    Manage your personal and medical information.
                </p>
            </div>

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

            {/* Profile Header */}
            <div className="card mb-3">
                <div className="profile-header">
                    <div className="profile-avatar">
                        {getInitials(user?.full_name || 'U')}
                    </div>
                    <div>
                        <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '1.4rem' }}>
                            {user?.full_name || 'User'}
                        </h2>
                        <p style={{ color: 'var(--text-secondary)' }}>{user?.email}</p>
                        <span className="badge badge-primary" style={{ marginTop: 6 }}>
                            {user?.role === 'doctor' ? '🩺 Doctor' : '🏥 Patient'}
                        </span>
                    </div>
                </div>
            </div>

            {/* Profile Form */}
            <div className="card">
                <h3 className="card-title" style={{ marginBottom: 20 }}>
                    <User size={18} style={{ display: 'inline', marginRight: 8 }} />
                    Personal & Medical Information
                </h3>

                <form onSubmit={handleSubmit}>
                    <div className="profile-grid">
                        <div className="form-group">
                            <label className="form-label">Full Name</label>
                            <input
                                type="text"
                                className="form-input"
                                value={formData.full_name}
                                onChange={(e) => handleChange('full_name', e.target.value)}
                                required
                            />
                        </div>

                        <div className="form-group">
                            <label className="form-label">Phone Number</label>
                            <input
                                type="tel"
                                className="form-input"
                                placeholder="+91 XXXXXXXXXX"
                                value={formData.phone}
                                onChange={(e) => handleChange('phone', e.target.value)}
                            />
                        </div>

                        <div className="form-group">
                            <label className="form-label">Date of Birth</label>
                            <input
                                type="date"
                                className="form-input"
                                value={formData.date_of_birth}
                                onChange={(e) => handleChange('date_of_birth', e.target.value)}
                            />
                        </div>

                        <div className="form-group">
                            <label className="form-label">Blood Group</label>
                            <select
                                className="form-select"
                                value={formData.blood_group}
                                onChange={(e) => handleChange('blood_group', e.target.value)}
                            >
                                <option value="">Select Blood Group</option>
                                <option value="A+">A+</option>
                                <option value="A-">A−</option>
                                <option value="B+">B+</option>
                                <option value="B-">B−</option>
                                <option value="AB+">AB+</option>
                                <option value="AB-">AB−</option>
                                <option value="O+">O+</option>
                                <option value="O-">O−</option>
                            </select>
                        </div>

                        <div className="form-group" style={{ gridColumn: '1 / -1' }}>
                            <label className="form-label">Allergies</label>
                            <textarea
                                className="form-textarea"
                                placeholder="List any known allergies (e.g., Penicillin, Peanuts)"
                                value={formData.allergies}
                                onChange={(e) => handleChange('allergies', e.target.value)}
                                rows={3}
                            />
                        </div>

                        <div className="form-group" style={{ gridColumn: '1 / -1' }}>
                            <label className="form-label">Medical Conditions</label>
                            <textarea
                                className="form-textarea"
                                placeholder="List any medical conditions (e.g., Diabetes, Hypertension)"
                                value={formData.medical_conditions}
                                onChange={(e) => handleChange('medical_conditions', e.target.value)}
                                rows={3}
                            />
                        </div>

                        <div className="form-group" style={{ gridColumn: '1 / -1' }}>
                            <label className="form-label">Emergency Contact</label>
                            <input
                                type="text"
                                className="form-input"
                                placeholder="Name — Phone Number"
                                value={formData.emergency_contact}
                                onChange={(e) => handleChange('emergency_contact', e.target.value)}
                            />
                        </div>
                    </div>

                    <button type="submit" className="btn btn-primary mt-2" disabled={loading}>
                        <Save size={16} />
                        {loading ? 'Saving...' : 'Save Profile'}
                    </button>
                </form>
            </div>
        </div>
    );
}
