import React, { useState, useEffect } from 'react';
import { useToast } from './Toast';
import { isValidNPI } from '../lib/utils';

interface DoctorVerificationData {
    fullName: string;
    specialty: string;
    npi?: string;
    credential?: string;
}

interface NPIClaimWizardProps {
    onSuccess?: (doctor: DoctorVerificationData) => void;
}

// Step labels for progress indicator
const STEPS = [
    { number: 1, label: 'Verify', icon: 'shield' },
    { number: 2, label: 'Confirm', icon: 'user' },
    { number: 3, label: 'Complete', icon: 'check' },
];

export default function NPIClaimWizard({ onSuccess }: NPIClaimWizardProps) {
    const [step, setStep] = useState(1);
    const [npi, setNpi] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const [doctorData, setDoctorData] = useState<DoctorVerificationData | null>(null);
    const [focusedInput, setFocusedInput] = useState(false);

    // Try to use toast, fallback gracefully if not in provider
    let toast: ReturnType<typeof useToast> | null = null;
    try {
        toast = useToast();
    } catch {
        // Not wrapped in ToastProvider, will use inline messages
    }

    // Validate NPI format as user types
    const isNpiValid = isValidNPI(npi);
    const showNpiFormatError = npi.length > 0 && npi.length < 10 && !/^\d*$/.test(npi);
    const progressPercentage = (npi.length / 10) * 100;

    const handleNpiSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!isNpiValid) {
            setError('Please enter a valid 10-digit NPI number');
            return;
        }

        setLoading(true);
        setError('');

        try {
            const res = await fetch(`/api/npi-validate?npi=${npi}`);
            const data = await res.json();

            if (data.valid) {
                setDoctorData(data.doctor);
                setStep(2);
                toast?.success('Identity verified successfully!');
            } else {
                setError(data.message || 'Invalid NPI Number');
                toast?.error(data.message || 'Invalid NPI Number');
            }
        } catch {
            const errorMsg = 'System Error. Please try again.';
            setError(errorMsg);
            toast?.error(errorMsg);
        } finally {
            setLoading(false);
        }
    };

    const handleClaim = async () => {
        if (!doctorData) return;

        setLoading(true);
        try {
            // Here we would create the user account via API
            toast?.success(`Profile for ${doctorData.fullName} claimed! Redirecting...`);
            onSuccess?.(doctorData);

            // Short delay for user to see the success message
            setTimeout(() => {
                window.location.href = '/doctor/portal';
            }, 1500);
        } catch {
            toast?.error('Failed to claim profile. Please try again.');
            setLoading(false);
        }
    };

    const handleNpiChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        // Only allow numeric input
        const value = e.target.value.replace(/\D/g, '').slice(0, 10);
        setNpi(value);
        if (error) setError('');
    };

    // Format NPI for display (XXX-XXX-XXXX)
    const formatNpiDisplay = (value: string) => {
        if (value.length <= 3) return value;
        if (value.length <= 6) return `${value.slice(0, 3)}-${value.slice(3)}`;
        return `${value.slice(0, 3)}-${value.slice(3, 6)}-${value.slice(6)}`;
    };

    const renderStepIcon = (iconName: string, isActive: boolean, isCompleted: boolean) => {
        const color = isCompleted ? '#10b981' : isActive ? '#a855f7' : '#4b5563';
        switch (iconName) {
            case 'shield':
                return (
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2">
                        <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                    </svg>
                );
            case 'user':
                return (
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2">
                        <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                        <circle cx="12" cy="7" r="4" />
                    </svg>
                );
            case 'check':
                return (
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2.5">
                        <polyline points="20 6 9 17 4 12" />
                    </svg>
                );
            default:
                return null;
        }
    };

    return (
        <div className="npi-wizard">
            <style>{`
                .npi-wizard {
                    max-width: 440px;
                    margin: 0 auto;
                    position: relative;
                }

                .wizard-card {
                    background: linear-gradient(145deg, rgba(30, 30, 45, 0.95), rgba(20, 20, 35, 0.98));
                    border: 1px solid rgba(139, 92, 246, 0.2);
                    border-radius: 24px;
                    padding: 2.5rem;
                    backdrop-filter: blur(20px);
                    box-shadow:
                        0 0 0 1px rgba(139, 92, 246, 0.1),
                        0 25px 50px -12px rgba(0, 0, 0, 0.5),
                        0 0 100px -20px rgba(139, 92, 246, 0.3);
                    position: relative;
                    overflow: hidden;
                }

                .wizard-card::before {
                    content: '';
                    position: absolute;
                    top: 0;
                    left: 0;
                    right: 0;
                    height: 1px;
                    background: linear-gradient(90deg, transparent, rgba(139, 92, 246, 0.5), transparent);
                }

                .wizard-card::after {
                    content: '';
                    position: absolute;
                    top: -50%;
                    left: -50%;
                    width: 200%;
                    height: 200%;
                    background: radial-gradient(circle at 50% 0%, rgba(139, 92, 246, 0.08) 0%, transparent 50%);
                    pointer-events: none;
                }

                /* Progress Steps */
                .progress-container {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    margin-bottom: 2.5rem;
                    position: relative;
                    padding: 0 0.5rem;
                }

                .progress-line {
                    position: absolute;
                    top: 50%;
                    left: 2.5rem;
                    right: 2.5rem;
                    height: 2px;
                    background: rgba(75, 85, 99, 0.5);
                    transform: translateY(-50%);
                    z-index: 0;
                }

                .progress-line-fill {
                    position: absolute;
                    top: 50%;
                    left: 2.5rem;
                    height: 2px;
                    background: linear-gradient(90deg, #a855f7, #8b5cf6);
                    transform: translateY(-50%);
                    z-index: 1;
                    transition: width 0.5s cubic-bezier(0.4, 0, 0.2, 1);
                    box-shadow: 0 0 10px rgba(168, 85, 247, 0.5);
                }

                .step-item {
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    gap: 0.5rem;
                    position: relative;
                    z-index: 2;
                }

                .step-circle {
                    width: 44px;
                    height: 44px;
                    border-radius: 50%;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    font-weight: 700;
                    font-size: 0.875rem;
                    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
                    position: relative;
                }

                .step-circle.inactive {
                    background: rgba(30, 30, 45, 0.9);
                    border: 2px solid rgba(75, 85, 99, 0.5);
                    color: #6b7280;
                }

                .step-circle.active {
                    background: linear-gradient(135deg, #a855f7, #8b5cf6);
                    border: 2px solid transparent;
                    color: white;
                    box-shadow: 0 0 20px rgba(168, 85, 247, 0.5), 0 0 40px rgba(168, 85, 247, 0.2);
                    animation: pulse-glow 2s infinite;
                }

                .step-circle.completed {
                    background: linear-gradient(135deg, #10b981, #059669);
                    border: 2px solid transparent;
                    color: white;
                    box-shadow: 0 0 15px rgba(16, 185, 129, 0.4);
                }

                @keyframes pulse-glow {
                    0%, 100% { box-shadow: 0 0 20px rgba(168, 85, 247, 0.5), 0 0 40px rgba(168, 85, 247, 0.2); }
                    50% { box-shadow: 0 0 25px rgba(168, 85, 247, 0.7), 0 0 50px rgba(168, 85, 247, 0.3); }
                }

                .step-label {
                    font-size: 0.7rem;
                    font-weight: 600;
                    text-transform: uppercase;
                    letter-spacing: 0.05em;
                    color: #6b7280;
                    transition: color 0.3s;
                }

                .step-label.active {
                    color: #a855f7;
                }

                .step-label.completed {
                    color: #10b981;
                }

                /* Header */
                .wizard-header {
                    text-align: center;
                    margin-bottom: 2rem;
                }

                .wizard-icon {
                    width: 64px;
                    height: 64px;
                    margin: 0 auto 1rem;
                    background: linear-gradient(135deg, rgba(139, 92, 246, 0.2), rgba(139, 92, 246, 0.05));
                    border-radius: 20px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    border: 1px solid rgba(139, 92, 246, 0.3);
                }

                .wizard-title {
                    font-size: 1.75rem;
                    font-weight: 800;
                    color: white;
                    margin: 0 0 0.5rem;
                    letter-spacing: -0.02em;
                }

                .wizard-subtitle {
                    font-size: 0.9rem;
                    color: #9ca3af;
                    margin: 0;
                    line-height: 1.5;
                }

                /* Input Section */
                .input-section {
                    margin-bottom: 1.5rem;
                }

                .input-label {
                    display: flex;
                    align-items: center;
                    gap: 0.5rem;
                    font-size: 0.75rem;
                    font-weight: 600;
                    color: #9ca3af;
                    text-transform: uppercase;
                    letter-spacing: 0.1em;
                    margin-bottom: 0.75rem;
                }

                .input-wrapper {
                    position: relative;
                    margin-bottom: 0.75rem;
                }

                .npi-input {
                    width: 100%;
                    background: rgba(0, 0, 0, 0.3);
                    border: 2px solid rgba(75, 85, 99, 0.3);
                    border-radius: 16px;
                    padding: 1.25rem 1.5rem 1.25rem 3.5rem;
                    font-size: 1.5rem;
                    font-family: 'SF Mono', 'Monaco', 'Inconsolata', monospace;
                    font-weight: 600;
                    letter-spacing: 0.15em;
                    color: white;
                    text-align: center;
                    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
                    outline: none;
                }

                .npi-input::placeholder {
                    color: #4b5563;
                    font-weight: 400;
                    letter-spacing: 0.05em;
                }

                .npi-input:focus {
                    border-color: rgba(139, 92, 246, 0.5);
                    box-shadow: 0 0 0 4px rgba(139, 92, 246, 0.1), 0 0 20px rgba(139, 92, 246, 0.2);
                }

                .npi-input.valid {
                    border-color: rgba(16, 185, 129, 0.5);
                    box-shadow: 0 0 0 4px rgba(16, 185, 129, 0.1), 0 0 20px rgba(16, 185, 129, 0.2);
                }

                .npi-input.error {
                    border-color: rgba(239, 68, 68, 0.5);
                    box-shadow: 0 0 0 4px rgba(239, 68, 68, 0.1);
                }

                .input-icon {
                    position: absolute;
                    left: 1.25rem;
                    top: 50%;
                    transform: translateY(-50%);
                    color: #6b7280;
                    transition: color 0.3s;
                }

                .input-icon.focused {
                    color: #a855f7;
                }

                .input-icon.valid {
                    color: #10b981;
                }

                /* Progress Bar */
                .progress-bar-container {
                    height: 4px;
                    background: rgba(75, 85, 99, 0.3);
                    border-radius: 2px;
                    overflow: hidden;
                    margin-bottom: 0.75rem;
                }

                .progress-bar-fill {
                    height: 100%;
                    background: linear-gradient(90deg, #a855f7, #8b5cf6);
                    border-radius: 2px;
                    transition: width 0.2s ease-out;
                }

                .progress-bar-fill.complete {
                    background: linear-gradient(90deg, #10b981, #059669);
                }

                /* Input Meta */
                .input-meta {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    font-size: 0.75rem;
                }

                .digit-counter {
                    color: #6b7280;
                    font-family: 'SF Mono', monospace;
                }

                .digit-counter.complete {
                    color: #10b981;
                }

                .valid-badge {
                    display: flex;
                    align-items: center;
                    gap: 0.375rem;
                    color: #10b981;
                    font-weight: 600;
                }

                .error-message {
                    display: flex;
                    align-items: center;
                    gap: 0.375rem;
                    color: #ef4444;
                    font-size: 0.8rem;
                    margin-top: 0.75rem;
                    padding: 0.75rem 1rem;
                    background: rgba(239, 68, 68, 0.1);
                    border: 1px solid rgba(239, 68, 68, 0.2);
                    border-radius: 10px;
                }

                /* Submit Button */
                .submit-btn {
                    width: 100%;
                    padding: 1.125rem 2rem;
                    border: none;
                    border-radius: 14px;
                    font-size: 0.9rem;
                    font-weight: 700;
                    text-transform: uppercase;
                    letter-spacing: 0.1em;
                    cursor: pointer;
                    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
                    position: relative;
                    overflow: hidden;
                }

                .submit-btn.disabled {
                    background: rgba(75, 85, 99, 0.3);
                    color: #6b7280;
                    cursor: not-allowed;
                }

                .submit-btn.active {
                    background: linear-gradient(135deg, #a855f7, #7c3aed);
                    color: white;
                    box-shadow: 0 10px 30px -10px rgba(168, 85, 247, 0.5);
                }

                .submit-btn.active:hover {
                    transform: translateY(-2px);
                    box-shadow: 0 15px 40px -10px rgba(168, 85, 247, 0.6);
                }

                .submit-btn.active:active {
                    transform: translateY(0);
                }

                .btn-content {
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    gap: 0.5rem;
                }

                .spinner {
                    width: 18px;
                    height: 18px;
                    border: 2px solid rgba(255, 255, 255, 0.3);
                    border-top-color: white;
                    border-radius: 50%;
                    animation: spin 0.8s linear infinite;
                }

                @keyframes spin {
                    to { transform: rotate(360deg); }
                }

                /* Trust Footer */
                .trust-footer {
                    margin-top: 1.5rem;
                    padding-top: 1.25rem;
                    border-top: 1px solid rgba(75, 85, 99, 0.2);
                }

                .trust-badges {
                    display: flex;
                    justify-content: center;
                    gap: 1.5rem;
                    margin-bottom: 1rem;
                }

                .trust-badge {
                    display: flex;
                    align-items: center;
                    gap: 0.375rem;
                    font-size: 0.7rem;
                    color: #6b7280;
                }

                .trust-text {
                    text-align: center;
                    font-size: 0.7rem;
                    color: #4b5563;
                    line-height: 1.5;
                }

                .trust-link {
                    color: #8b5cf6;
                    text-decoration: none;
                }

                .trust-link:hover {
                    text-decoration: underline;
                }

                /* Step 2 Styles */
                .success-icon {
                    width: 80px;
                    height: 80px;
                    margin: 0 auto 1.5rem;
                    background: linear-gradient(135deg, rgba(16, 185, 129, 0.2), rgba(16, 185, 129, 0.05));
                    border-radius: 50%;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    border: 2px solid rgba(16, 185, 129, 0.3);
                    animation: scale-in 0.5s cubic-bezier(0.34, 1.56, 0.64, 1);
                }

                @keyframes scale-in {
                    from { transform: scale(0); opacity: 0; }
                    to { transform: scale(1); opacity: 1; }
                }

                .doctor-card {
                    background: linear-gradient(135deg, rgba(139, 92, 246, 0.1), rgba(139, 92, 246, 0.02));
                    border: 1px solid rgba(139, 92, 246, 0.2);
                    border-radius: 16px;
                    padding: 1.25rem;
                    margin: 1.5rem 0;
                }

                .doctor-info {
                    display: flex;
                    align-items: center;
                    gap: 1rem;
                }

                .doctor-avatar {
                    width: 56px;
                    height: 56px;
                    background: linear-gradient(135deg, #a855f7, #7c3aed);
                    border-radius: 16px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    font-size: 1.5rem;
                    font-weight: 700;
                    color: white;
                }

                .doctor-details h3 {
                    margin: 0 0 0.25rem;
                    font-size: 1.125rem;
                    font-weight: 700;
                    color: white;
                }

                .doctor-status {
                    display: flex;
                    align-items: center;
                    gap: 0.5rem;
                    font-size: 0.8rem;
                    color: #10b981;
                }

                .status-dot {
                    width: 8px;
                    height: 8px;
                    background: #10b981;
                    border-radius: 50%;
                    animation: pulse 2s infinite;
                }

                @keyframes pulse {
                    0%, 100% { opacity: 1; }
                    50% { opacity: 0.5; }
                }

                .confirm-btn {
                    width: 100%;
                    padding: 1.125rem 2rem;
                    background: linear-gradient(135deg, #10b981, #059669);
                    border: none;
                    border-radius: 14px;
                    color: white;
                    font-size: 0.9rem;
                    font-weight: 700;
                    text-transform: uppercase;
                    letter-spacing: 0.1em;
                    cursor: pointer;
                    transition: all 0.3s;
                    box-shadow: 0 10px 30px -10px rgba(16, 185, 129, 0.5);
                }

                .confirm-btn:hover {
                    transform: translateY(-2px);
                    box-shadow: 0 15px 40px -10px rgba(16, 185, 129, 0.6);
                }

                .back-btn {
                    width: 100%;
                    padding: 0.75rem;
                    background: transparent;
                    border: none;
                    color: #6b7280;
                    font-size: 0.8rem;
                    cursor: pointer;
                    transition: color 0.2s;
                    margin-top: 0.75rem;
                }

                .back-btn:hover {
                    color: white;
                }

                /* Animations */
                @keyframes fade-in {
                    from { opacity: 0; transform: translateY(10px); }
                    to { opacity: 1; transform: translateY(0); }
                }

                .animate-in {
                    animation: fade-in 0.4s ease-out;
                }
            `}</style>

            <div className="wizard-card">
                {/* Progress Steps */}
                <div className="progress-container">
                    <div className="progress-line"></div>
                    <div
                        className="progress-line-fill"
                        style={{ width: step === 1 ? '0%' : step === 2 ? '50%' : '100%' }}
                    ></div>
                    {STEPS.map((s) => (
                        <div key={s.number} className="step-item">
                            <div className={`step-circle ${
                                step > s.number ? 'completed' :
                                step === s.number ? 'active' : 'inactive'
                            }`}>
                                {renderStepIcon(s.icon, step === s.number, step > s.number)}
                            </div>
                            <span className={`step-label ${
                                step > s.number ? 'completed' :
                                step === s.number ? 'active' : ''
                            }`}>
                                {s.label}
                            </span>
                        </div>
                    ))}
                </div>

                {step === 1 && (
                    <form onSubmit={handleNpiSubmit} className="animate-in">
                        {/* Header */}
                        <div className="wizard-header">
                            <div className="wizard-icon">
                                <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#a855f7" strokeWidth="2">
                                    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                                    <path d="M9 12l2 2 4-4" />
                                </svg>
                            </div>
                            <h2 className="wizard-title">Verify Your Identity</h2>
                            <p className="wizard-subtitle">
                                Enter your NPI number to claim and manage your MDRPedia profile
                            </p>
                        </div>

                        {/* Input Section */}
                        <div className="input-section">
                            <label className="input-label">
                                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                    <rect x="3" y="4" width="18" height="16" rx="2" />
                                    <path d="M7 8h10M7 12h6" />
                                </svg>
                                National Provider Identifier
                            </label>

                            <div className="input-wrapper">
                                <span className={`input-icon ${focusedInput ? 'focused' : ''} ${isNpiValid ? 'valid' : ''}`}>
                                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                        <path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07 19.5 19.5 0 01-6-6 19.79 19.79 0 01-3.07-8.67A2 2 0 014.11 2h3a2 2 0 012 1.72 12.84 12.84 0 00.7 2.81 2 2 0 01-.45 2.11L8.09 9.91a16 16 0 006 6l1.27-1.27a2 2 0 012.11-.45 12.84 12.84 0 002.81.7A2 2 0 0122 16.92z" />
                                    </svg>
                                </span>
                                <input
                                    id="npi-input"
                                    type="text"
                                    inputMode="numeric"
                                    pattern="[0-9]*"
                                    value={formatNpiDisplay(npi)}
                                    onChange={handleNpiChange}
                                    onFocus={() => setFocusedInput(true)}
                                    onBlur={() => setFocusedInput(false)}
                                    className={`npi-input ${error || showNpiFormatError ? 'error' : isNpiValid ? 'valid' : ''}`}
                                    placeholder="XXX-XXX-XXXX"
                                    aria-describedby="npi-hint npi-error"
                                    aria-invalid={!!error || showNpiFormatError}
                                    maxLength={12}
                                    autoComplete="off"
                                />
                            </div>

                            {/* Progress Bar */}
                            <div className="progress-bar-container">
                                <div
                                    className={`progress-bar-fill ${isNpiValid ? 'complete' : ''}`}
                                    style={{ width: `${progressPercentage}%` }}
                                ></div>
                            </div>

                            {/* Input Meta */}
                            <div className="input-meta">
                                <span className={`digit-counter ${isNpiValid ? 'complete' : ''}`}>
                                    {npi.length} / 10 digits
                                </span>
                                {isNpiValid && (
                                    <span className="valid-badge">
                                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                                            <path d="M22 11.08V12a10 10 0 11-5.93-9.14" />
                                            <polyline points="22 4 12 14.01 9 11.01" />
                                        </svg>
                                        Valid format
                                    </span>
                                )}
                            </div>

                            {/* Error Message */}
                            {(error || showNpiFormatError) && (
                                <div className="error-message" role="alert">
                                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                        <circle cx="12" cy="12" r="10" />
                                        <path d="M12 8v4M12 16h.01" />
                                    </svg>
                                    {error || 'NPI must contain only numbers'}
                                </div>
                            )}
                        </div>

                        {/* Submit Button */}
                        <button
                            type="submit"
                            disabled={loading || !isNpiValid}
                            className={`submit-btn ${loading || !isNpiValid ? 'disabled' : 'active'}`}
                            aria-busy={loading}
                        >
                            <span className="btn-content">
                                {loading ? (
                                    <>
                                        <span className="spinner"></span>
                                        Verifying...
                                    </>
                                ) : (
                                    <>
                                        {isNpiValid ? 'Verify Identity' : `Enter ${10 - npi.length} more digit${10 - npi.length !== 1 ? 's' : ''}`}
                                        {isNpiValid && (
                                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                                <path d="M5 12h14M12 5l7 7-7 7" />
                                            </svg>
                                        )}
                                    </>
                                )}
                            </span>
                        </button>

                        {/* Trust Footer */}
                        <div className="trust-footer">
                            <div className="trust-badges">
                                <span className="trust-badge">
                                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#10b981" strokeWidth="2">
                                        <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                                    </svg>
                                    256-bit SSL
                                </span>
                                <span className="trust-badge">
                                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#10b981" strokeWidth="2">
                                        <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                                        <path d="M7 11V7a5 5 0 0110 0v4" />
                                    </svg>
                                    HIPAA Compliant
                                </span>
                                <span className="trust-badge">
                                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#10b981" strokeWidth="2">
                                        <path d="M22 11.08V12a10 10 0 11-5.93-9.14" />
                                        <polyline points="22 4 12 14.01 9 11.01" />
                                    </svg>
                                    Verified
                                </span>
                            </div>
                            <p className="trust-text">
                                By continuing, you agree to MDRPedia's{' '}
                                <a href="/terms" className="trust-link">Terms of Service</a>.
                                <br />Protected by Cloudflare Turnstile.
                            </p>
                        </div>
                    </form>
                )}

                {step === 2 && doctorData && (
                    <div className="animate-in">
                        {/* Success Header */}
                        <div className="wizard-header">
                            <div className="success-icon">
                                <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="#10b981" strokeWidth="2.5">
                                    <polyline points="20 6 9 17 4 12" />
                                </svg>
                            </div>
                            <h2 className="wizard-title">Identity Verified</h2>
                            <p className="wizard-subtitle">
                                We found your record in the NPI registry
                            </p>
                        </div>

                        {/* Doctor Card */}
                        <div className="doctor-card">
                            <div className="doctor-info">
                                <div className="doctor-avatar">
                                    {doctorData.fullName.charAt(0)}
                                </div>
                                <div className="doctor-details">
                                    <h3>{doctorData.fullName}</h3>
                                    <div className="doctor-status">
                                        <span className="status-dot"></span>
                                        Active License • {doctorData.specialty}
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Confirm Button */}
                        <button
                            onClick={handleClaim}
                            disabled={loading}
                            className="confirm-btn"
                        >
                            <span className="btn-content">
                                {loading ? (
                                    <>
                                        <span className="spinner"></span>
                                        Claiming Profile...
                                    </>
                                ) : (
                                    <>
                                        Confirm & Claim Profile
                                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                            <path d="M5 12h14M12 5l7 7-7 7" />
                                        </svg>
                                    </>
                                )}
                            </span>
                        </button>

                        <button onClick={() => setStep(1)} className="back-btn">
                            Not you? Go back and try again
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
}
