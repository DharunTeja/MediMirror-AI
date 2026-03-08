import type { MedicationItem } from '../types';
import { useTextToSpeech } from '../hooks/useSpeech';
import { Volume2, VolumeX } from 'lucide-react';

interface Props {
    medications: MedicationItem[];
    showActions?: boolean;
}

export default function MedicationTable({ medications, showActions = true }: Props) {
    const { isSpeaking, speak, stop } = useTextToSpeech();

    const readAloud = (med: MedicationItem) => {
        const text = `Take ${med.medicine_name}${med.dosage ? `, ${med.dosage}` : ''}${med.frequency ? `, ${med.frequency}` : ''
            }${med.timing && med.timing !== 'anytime' ? `, ${med.timing.replace('_', ' ')}` : ''}${med.duration ? `, for ${med.duration}` : ''
            }.`;
        speak(text);
    };

    const timingLabel = (t: string | undefined) => {
        switch (t) {
            case 'before_meal': return '🍽️ Before Meal';
            case 'after_meal': return '🍽️ After Meal';
            case 'with_meal': return '🍽️ With Meal';
            default: return 'Any Time';
        }
    };

    if (!medications.length) {
        return (
            <div className="empty-state">
                <p>No medications parsed yet.</p>
            </div>
        );
    }

    return (
        <div className="table-container med-table-wrap">
            <table>
                <thead>
                    <tr>
                        <th>#</th>
                        <th>Medicine</th>
                        <th>Dosage</th>
                        <th>Frequency</th>
                        <th>Timing</th>
                        <th>Duration</th>
                        {showActions && <th>Actions</th>}
                    </tr>
                </thead>
                <tbody>
                    {medications.map((med, i) => (
                        <tr key={i}>
                            <td>{i + 1}</td>
                            <td style={{ fontWeight: 600 }}>{med.medicine_name}</td>
                            <td>{med.dosage || '—'}</td>
                            <td>
                                <span className="badge badge-primary">{med.frequency || 'N/A'}</span>
                            </td>
                            <td>{timingLabel(med.timing)}</td>
                            <td>{med.duration || '—'}</td>
                            {showActions && (
                                <td>
                                    <button
                                        className="btn btn-icon btn-secondary"
                                        onClick={() => (isSpeaking ? stop() : readAloud(med))}
                                        title={isSpeaking ? 'Stop' : 'Read aloud'}
                                    >
                                        {isSpeaking ? <VolumeX size={16} /> : <Volume2 size={16} />}
                                    </button>
                                </td>
                            )}
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
}
