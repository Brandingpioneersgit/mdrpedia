/**
 * MDRPedia — Impact Vote Button
 * Modern glassmorphism design with micro-interactions
 */

import React, { useState, useEffect, useCallback } from 'react';

interface Props {
    profileId?: string;
    slug: string;
    doctorName: string;
    initialCount?: number;
    className?: string;
}

const VOTE_OPTIONS = [
    { key: 'SAVED_LIFE', emoji: '❤️‍🩹', label: 'Saved My Life', color: '#ef4444' },
    { key: 'LIFE_CHANGED', emoji: '✨', label: 'Life Changing', color: '#f59e0b' },
    { key: 'EXCELLENT_CARE', emoji: '🩺', label: 'Excellent Care', color: '#10b981' },
    { key: 'HIGHLY_SKILLED', emoji: '🎯', label: 'Highly Skilled', color: '#3b82f6' },
    { key: 'MENTOR', emoji: '🎓', label: 'Great Mentor', color: '#8b5cf6' },
    { key: 'RESEARCHER', emoji: '🔬', label: 'Research Impact', color: '#06b6d4' },
];

export default function ImpactVoteButton({ profileId, slug, doctorName, initialCount = 0, className = '' }: Props) {
    const [isOpen, setIsOpen] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [hasVoted, setHasVoted] = useState(false);
    const [userVoteType, setUserVoteType] = useState<string | null>(null);
    const [totalCount, setTotalCount] = useState(initialCount);
    const [showSuccess, setShowSuccess] = useState(false);

    const firstName = doctorName.split(' ')[0];

    useEffect(() => {
        const fetchStatus = async () => {
            try {
                const params = profileId ? `profileId=${profileId}` : `slug=${slug}`;
                const res = await fetch(`/api/impact-vote?${params}`);
                if (res.ok) {
                    const data = await res.json();
                    setTotalCount(data.totalCount);
                    setHasVoted(data.userHasVoted);
                    setUserVoteType(data.userVoteType);
                }
            } catch {}
        };
        fetchStatus();
    }, [profileId, slug]);

    const handleVote = useCallback(async (voteType: string) => {
        setIsLoading(true);
        try {
            const res = await fetch('/api/impact-vote', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ profileId, slug, voteType, isAnonymous: true })
            });
            const data = await res.json();
            if (res.ok) {
                setHasVoted(true);
                setUserVoteType(voteType);
                setTotalCount(data.totalCount || totalCount + 1);
                setIsOpen(false);
                setShowSuccess(true);
                setTimeout(() => setShowSuccess(false), 3000);
            }
        } catch {} finally {
            setIsLoading(false);
        }
    }, [profileId, slug, totalCount]);

    const handleRemove = useCallback(async () => {
        setIsLoading(true);
        try {
            const params = profileId ? `profileId=${profileId}` : `slug=${slug}`;
            const res = await fetch(`/api/impact-vote?${params}`, { method: 'DELETE' });
            if (res.ok) {
                setHasVoted(false);
                setUserVoteType(null);
                setTotalCount(Math.max(0, totalCount - 1));
                setIsOpen(false);
            }
        } catch {} finally {
            setIsLoading(false);
        }
    }, [profileId, slug, totalCount]);

    const selectedVote = VOTE_OPTIONS.find(v => v.key === userVoteType);

    return (
        <div className={`impact-vote ${className}`}>
            <button
                onClick={() => setIsOpen(!isOpen)}
                disabled={isLoading}
                className={`impact-btn ${hasVoted ? 'impact-btn--voted' : ''}`}
            >
                {isLoading ? (
                    <span className="impact-btn__loader" />
                ) : (
                    <>
                        <span className="impact-btn__icon">
                            {hasVoted ? selectedVote?.emoji : '💜'}
                        </span>
                        <span className="impact-btn__text">
                            {hasVoted ? 'Impacted' : 'I Was Impacted'}
                        </span>
                        {totalCount > 0 && (
                            <span className="impact-btn__count">{totalCount}</span>
                        )}
                        <span className={`impact-btn__arrow ${isOpen ? 'open' : ''}`}>
                            <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                                <path d="M3 4.5L6 7.5L9 4.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
                            </svg>
                        </span>
                    </>
                )}
            </button>

            {showSuccess && (
                <div className="impact-toast">
                    <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                        <circle cx="8" cy="8" r="8" fill="#10b981"/>
                        <path d="M5 8L7 10L11 6" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                    Thank you for sharing
                </div>
            )}

            {isOpen && (
                <>
                    <div className="impact-overlay" onClick={() => setIsOpen(false)} />
                    <div className="impact-panel">
                        <div className="impact-panel__header">
                            <div className="impact-panel__title">
                                How did Dr. {firstName} help you?
                            </div>
                            {totalCount > 0 && (
                                <div className="impact-panel__stats">
                                    {totalCount.toLocaleString()} {totalCount === 1 ? 'person' : 'people'} impacted
                                </div>
                            )}
                        </div>

                        <div className="impact-panel__grid">
                            {VOTE_OPTIONS.map((option) => (
                                <button
                                    key={option.key}
                                    onClick={() => handleVote(option.key)}
                                    disabled={isLoading}
                                    className={`impact-option ${userVoteType === option.key ? 'impact-option--selected' : ''}`}
                                    style={{ '--accent': option.color } as React.CSSProperties}
                                >
                                    <span className="impact-option__emoji">{option.emoji}</span>
                                    <span className="impact-option__label">{option.label}</span>
                                    {userVoteType === option.key && (
                                        <span className="impact-option__check">✓</span>
                                    )}
                                </button>
                            ))}
                        </div>

                        <div className="impact-panel__footer">
                            <span className="impact-panel__secure">
                                <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                                    <path d="M9.5 5.5V4.5C9.5 2.567 7.933 1 6 1C4.067 1 2.5 2.567 2.5 4.5V5.5M4 5.5H8C8.828 5.5 9.5 6.172 9.5 7V9.5C9.5 10.328 8.828 11 8 11H4C3.172 11 2.5 10.328 2.5 9.5V7C2.5 6.172 3.172 5.5 4 5.5Z" stroke="currentColor" strokeLinecap="round"/>
                                </svg>
                                Anonymous
                            </span>
                            {hasVoted && (
                                <button onClick={handleRemove} className="impact-panel__remove">
                                    Remove
                                </button>
                            )}
                        </div>
                    </div>
                </>
            )}

            <style>{`
                .impact-vote {
                    position: relative;
                    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
                }

                .impact-btn {
                    display: inline-flex;
                    align-items: center;
                    gap: 8px;
                    height: 44px;
                    padding: 0 16px;
                    background: linear-gradient(135deg, rgba(139, 92, 246, 0.1) 0%, rgba(139, 92, 246, 0.05) 100%);
                    border: 1px solid rgba(139, 92, 246, 0.2);
                    border-radius: 12px;
                    color: #e9d5ff;
                    font-size: 14px;
                    font-weight: 500;
                    cursor: pointer;
                    transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
                }

                .impact-btn:hover {
                    background: linear-gradient(135deg, rgba(139, 92, 246, 0.15) 0%, rgba(139, 92, 246, 0.1) 100%);
                    border-color: rgba(139, 92, 246, 0.4);
                    transform: translateY(-1px);
                }

                .impact-btn--voted {
                    background: linear-gradient(135deg, rgba(139, 92, 246, 0.25) 0%, rgba(139, 92, 246, 0.15) 100%);
                    border-color: rgba(139, 92, 246, 0.5);
                }

                .impact-btn__icon {
                    font-size: 16px;
                }

                .impact-btn__text {
                    letter-spacing: -0.01em;
                }

                .impact-btn__count {
                    padding: 2px 8px;
                    background: rgba(139, 92, 246, 0.2);
                    border-radius: 6px;
                    font-size: 12px;
                    font-weight: 600;
                }

                .impact-btn__arrow {
                    opacity: 0.6;
                    transition: transform 0.2s;
                }

                .impact-btn__arrow.open {
                    transform: rotate(180deg);
                }

                .impact-btn__loader {
                    width: 16px;
                    height: 16px;
                    border: 2px solid rgba(139, 92, 246, 0.3);
                    border-top-color: #a78bfa;
                    border-radius: 50%;
                    animation: spin 0.6s linear infinite;
                }

                @keyframes spin {
                    to { transform: rotate(360deg); }
                }

                .impact-toast {
                    position: absolute;
                    bottom: calc(100% + 8px);
                    left: 50%;
                    transform: translateX(-50%);
                    display: flex;
                    align-items: center;
                    gap: 8px;
                    padding: 10px 14px;
                    background: #18181b;
                    border: 1px solid rgba(255, 255, 255, 0.1);
                    border-radius: 10px;
                    color: #fafafa;
                    font-size: 13px;
                    font-weight: 500;
                    white-space: nowrap;
                    box-shadow: 0 4px 20px rgba(0, 0, 0, 0.4);
                    animation: toastIn 0.3s cubic-bezier(0.16, 1, 0.3, 1);
                    z-index: 100;
                }

                @keyframes toastIn {
                    from {
                        opacity: 0;
                        transform: translateX(-50%) translateY(4px) scale(0.96);
                    }
                }

                .impact-overlay {
                    position: fixed;
                    inset: 0;
                    z-index: 50;
                }

                .impact-panel {
                    position: absolute;
                    bottom: calc(100% + 8px);
                    left: 0;
                    width: 320px;
                    background: #18181b;
                    border: 1px solid rgba(255, 255, 255, 0.08);
                    border-radius: 16px;
                    box-shadow: 0 8px 40px rgba(0, 0, 0, 0.5), 0 0 0 1px rgba(255, 255, 255, 0.05) inset;
                    overflow: hidden;
                    z-index: 60;
                    animation: panelIn 0.25s cubic-bezier(0.16, 1, 0.3, 1);
                }

                @keyframes panelIn {
                    from {
                        opacity: 0;
                        transform: translateY(8px) scale(0.98);
                    }
                }

                .impact-panel__header {
                    padding: 16px 16px 12px;
                    border-bottom: 1px solid rgba(255, 255, 255, 0.06);
                }

                .impact-panel__title {
                    color: #fafafa;
                    font-size: 15px;
                    font-weight: 600;
                    letter-spacing: -0.01em;
                }

                .impact-panel__stats {
                    margin-top: 4px;
                    color: #71717a;
                    font-size: 13px;
                }

                .impact-panel__grid {
                    display: grid;
                    grid-template-columns: repeat(2, 1fr);
                    gap: 6px;
                    padding: 12px;
                }

                .impact-option {
                    position: relative;
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    gap: 6px;
                    padding: 14px 8px;
                    background: rgba(255, 255, 255, 0.03);
                    border: 1px solid rgba(255, 255, 255, 0.06);
                    border-radius: 12px;
                    color: #a1a1aa;
                    cursor: pointer;
                    transition: all 0.15s;
                }

                .impact-option:hover {
                    background: rgba(255, 255, 255, 0.06);
                    border-color: rgba(255, 255, 255, 0.1);
                    color: #fafafa;
                }

                .impact-option--selected {
                    background: rgba(var(--accent-rgb, 139, 92, 246), 0.15);
                    border-color: var(--accent);
                    color: #fafafa;
                }

                .impact-option__emoji {
                    font-size: 22px;
                    line-height: 1;
                }

                .impact-option__label {
                    font-size: 12px;
                    font-weight: 500;
                    text-align: center;
                }

                .impact-option__check {
                    position: absolute;
                    top: 6px;
                    right: 6px;
                    width: 16px;
                    height: 16px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    background: var(--accent);
                    border-radius: 50%;
                    color: white;
                    font-size: 10px;
                    font-weight: 700;
                }

                .impact-panel__footer {
                    display: flex;
                    align-items: center;
                    justify-content: space-between;
                    padding: 10px 16px;
                    border-top: 1px solid rgba(255, 255, 255, 0.06);
                }

                .impact-panel__secure {
                    display: flex;
                    align-items: center;
                    gap: 6px;
                    color: #52525b;
                    font-size: 12px;
                }

                .impact-panel__remove {
                    padding: 4px 10px;
                    background: transparent;
                    border: none;
                    border-radius: 6px;
                    color: #71717a;
                    font-size: 12px;
                    cursor: pointer;
                    transition: all 0.15s;
                }

                .impact-panel__remove:hover {
                    background: rgba(239, 68, 68, 0.1);
                    color: #f87171;
                }
            `}</style>
        </div>
    );
}
