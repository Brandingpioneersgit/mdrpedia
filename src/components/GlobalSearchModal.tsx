/**
 * GlobalSearchModal - Premium Command+K triggered search modal
 */
import { useState, useEffect, useRef, useCallback } from 'react';

interface SearchResult {
    slug: string;
    fullName: string;
    specialty: string;
    tier: 'TITAN' | 'ELITE' | 'MASTER' | 'UNRANKED';
    portraitUrl?: string;
    city?: string;
    country?: string;
    hIndex?: number;
}

const DEBOUNCE_MS = 200;

const tierConfig: Record<string, { gradient: string; border: string; text: string; glow: string }> = {
    TITAN: {
        gradient: 'linear-gradient(135deg, rgba(255, 215, 0, 0.15), rgba(255, 170, 0, 0.05))',
        border: 'rgba(255, 215, 0, 0.4)',
        text: '#ffd700',
        glow: 'rgba(255, 215, 0, 0.3)'
    },
    ELITE: {
        gradient: 'linear-gradient(135deg, rgba(59, 130, 246, 0.15), rgba(37, 99, 235, 0.05))',
        border: 'rgba(59, 130, 246, 0.4)',
        text: '#3b82f6',
        glow: 'rgba(59, 130, 246, 0.3)'
    },
    MASTER: {
        gradient: 'linear-gradient(135deg, rgba(34, 197, 94, 0.15), rgba(22, 163, 74, 0.05))',
        border: 'rgba(34, 197, 94, 0.4)',
        text: '#22c55e',
        glow: 'rgba(34, 197, 94, 0.3)'
    },
    UNRANKED: {
        gradient: 'linear-gradient(135deg, rgba(255, 255, 255, 0.05), rgba(255, 255, 255, 0.02))',
        border: 'rgba(255, 255, 255, 0.15)',
        text: '#9ca3af',
        glow: 'transparent'
    },
};

const quickLinks = [
    { href: '/rankings', icon: '🏆', label: 'Rankings', desc: 'Top-rated physicians' },
    { href: '/rare-diseases', icon: '🧬', label: 'Rare Diseases', desc: 'Condition database' },
    { href: '/hospitals', icon: '🏥', label: 'Hospitals', desc: 'Medical institutions' },
    { href: '/doctor/claim', icon: '✓', label: 'Claim Profile', desc: 'Verify your identity' },
];

export default function GlobalSearchModal() {
    const [isOpen, setIsOpen] = useState(false);
    const [query, setQuery] = useState('');
    const [results, setResults] = useState<SearchResult[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [selectedIndex, setSelectedIndex] = useState(0);

    const inputRef = useRef<HTMLInputElement>(null);
    const debounceRef = useRef<NodeJS.Timeout>();

    // Open modal with Cmd/Ctrl+K
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
                e.preventDefault();
                setIsOpen(true);
            }
            if (e.key === 'Escape') {
                setIsOpen(false);
            }
        };

        document.addEventListener('keydown', handleKeyDown);
        return () => document.removeEventListener('keydown', handleKeyDown);
    }, []);

    // Focus input when modal opens
    useEffect(() => {
        if (isOpen) {
            setTimeout(() => inputRef.current?.focus(), 50);
            document.body.style.overflow = 'hidden';
        } else {
            setQuery('');
            setResults([]);
            setSelectedIndex(0);
            document.body.style.overflow = '';
        }
        return () => { document.body.style.overflow = ''; };
    }, [isOpen]);

    // Fetch results
    const fetchResults = useCallback(async (searchQuery: string) => {
        if (searchQuery.length < 2) {
            setResults([]);
            return;
        }

        setIsLoading(true);
        try {
            const response = await fetch(`/api/search?q=${encodeURIComponent(searchQuery)}`);
            if (response.ok) {
                const data = await response.json();
                setResults(data.slice(0, 6));
                setSelectedIndex(0);
            }
        } catch (e) {
            console.error('Search failed:', e);
        } finally {
            setIsLoading(false);
        }
    }, []);

    // Debounced search
    useEffect(() => {
        if (debounceRef.current) clearTimeout(debounceRef.current);

        if (query.length >= 2) {
            debounceRef.current = setTimeout(() => fetchResults(query), DEBOUNCE_MS);
        } else {
            setResults([]);
        }

        return () => {
            if (debounceRef.current) clearTimeout(debounceRef.current);
        };
    }, [query, fetchResults]);

    // Keyboard navigation
    const handleKeyDown = (e: React.KeyboardEvent) => {
        const maxIndex = results.length > 0 ? results.length - 1 : quickLinks.length - 1;

        switch (e.key) {
            case 'ArrowDown':
                e.preventDefault();
                setSelectedIndex(prev => Math.min(prev + 1, maxIndex));
                break;
            case 'ArrowUp':
                e.preventDefault();
                setSelectedIndex(prev => Math.max(prev - 1, 0));
                break;
            case 'Enter':
                e.preventDefault();
                if (results.length > 0 && results[selectedIndex]) {
                    window.location.href = `/doctor/${results[selectedIndex].slug}`;
                } else if (results.length === 0 && quickLinks[selectedIndex]) {
                    window.location.href = quickLinks[selectedIndex].href;
                } else if (query.length >= 2) {
                    window.location.href = `/search?q=${encodeURIComponent(query)}`;
                }
                break;
        }
    };

    const getInitials = (name: string) => {
        return name.split(' ').map(w => w[0]).filter((_, i) => i < 2).join('').toUpperCase();
    };

    if (!isOpen) return null;

    const styles = `
        .search-modal-overlay {
            position: fixed;
            inset: 0;
            z-index: 9999;
            display: flex;
            align-items: flex-start;
            justify-content: center;
            padding-top: 12vh;
            animation: fade-in 0.15s ease-out;
        }

        @keyframes fade-in {
            from { opacity: 0; }
            to { opacity: 1; }
        }

        .search-modal-backdrop {
            position: absolute;
            inset: 0;
            background: rgba(0, 0, 0, 0.8);
            backdrop-filter: blur(8px);
        }

        .search-modal {
            position: relative;
            width: 100%;
            max-width: 600px;
            margin: 0 16px;
            background: linear-gradient(145deg, rgba(25, 25, 45, 0.98), rgba(15, 15, 30, 0.98));
            border: 1px solid rgba(139, 92, 246, 0.2);
            border-radius: 24px;
            box-shadow:
                0 0 0 1px rgba(139, 92, 246, 0.1),
                0 25px 80px -20px rgba(0, 0, 0, 0.6),
                0 0 100px -30px rgba(139, 92, 246, 0.4);
            overflow: hidden;
            animation: slide-up 0.2s ease-out;
        }

        @keyframes slide-up {
            from {
                opacity: 0;
                transform: translateY(10px) scale(0.98);
            }
            to {
                opacity: 1;
                transform: translateY(0) scale(1);
            }
        }

        .search-modal::before {
            content: '';
            position: absolute;
            top: 0;
            left: 0;
            right: 0;
            height: 1px;
            background: linear-gradient(90deg, transparent, rgba(139, 92, 246, 0.5), transparent);
        }

        .search-input-container {
            display: flex;
            align-items: center;
            gap: 14px;
            padding: 20px 24px;
            border-bottom: 1px solid rgba(255, 255, 255, 0.06);
        }

        .search-icon {
            flex-shrink: 0;
            width: 22px;
            height: 22px;
            color: #a78bfa;
        }

        .search-spinner {
            flex-shrink: 0;
            width: 22px;
            height: 22px;
            color: #a78bfa;
            animation: spin 0.8s linear infinite;
        }

        @keyframes spin {
            to { transform: rotate(360deg); }
        }

        .search-input {
            flex: 1;
            background: transparent;
            border: none;
            outline: none;
            font-size: 1.1rem;
            color: white;
            font-family: inherit;
        }

        .search-input::placeholder {
            color: #6b7280;
        }

        .search-kbd {
            display: flex;
            align-items: center;
            padding: 6px 10px;
            background: rgba(255, 255, 255, 0.05);
            border: 1px solid rgba(255, 255, 255, 0.1);
            border-radius: 8px;
            font-size: 0.75rem;
            color: #6b7280;
            font-family: inherit;
        }

        .search-results {
            max-height: 50vh;
            overflow-y: auto;
            padding: 8px 0;
        }

        .search-result-item {
            display: flex;
            align-items: center;
            gap: 14px;
            padding: 14px 24px;
            text-decoration: none;
            color: white;
            transition: all 0.15s ease;
        }

        .search-result-item.selected {
            background: linear-gradient(90deg, rgba(139, 92, 246, 0.15), transparent);
        }

        .search-result-item:hover {
            background: rgba(255, 255, 255, 0.04);
        }

        .result-avatar {
            width: 48px;
            height: 48px;
            border-radius: 14px;
            overflow: hidden;
            flex-shrink: 0;
            display: flex;
            align-items: center;
            justify-content: center;
            font-weight: 700;
            font-size: 0.9rem;
            transition: all 0.2s;
        }

        .result-avatar img {
            width: 100%;
            height: 100%;
            object-fit: cover;
        }

        .result-info {
            flex: 1;
            min-width: 0;
        }

        .result-name-row {
            display: flex;
            align-items: center;
            gap: 10px;
            margin-bottom: 4px;
        }

        .result-name {
            font-weight: 600;
            font-size: 1rem;
            white-space: nowrap;
            overflow: hidden;
            text-overflow: ellipsis;
        }

        .result-tier {
            flex-shrink: 0;
            padding: 3px 8px;
            border-radius: 6px;
            font-size: 0.65rem;
            font-weight: 700;
            letter-spacing: 0.05em;
        }

        .result-meta {
            font-size: 0.85rem;
            color: #9ca3af;
            white-space: nowrap;
            overflow: hidden;
            text-overflow: ellipsis;
        }

        .result-meta-separator {
            color: #4b5563;
            margin: 0 6px;
        }

        .result-enter-hint {
            flex-shrink: 0;
            padding: 4px 8px;
            background: rgba(255, 255, 255, 0.05);
            border: 1px solid rgba(255, 255, 255, 0.1);
            border-radius: 6px;
            font-size: 0.7rem;
            color: #6b7280;
        }

        .no-results {
            padding: 40px 24px;
            text-align: center;
        }

        .no-results-icon {
            width: 48px;
            height: 48px;
            margin: 0 auto 16px;
            color: #4b5563;
        }

        .no-results-text {
            color: #9ca3af;
            margin-bottom: 8px;
        }

        .no-results-link {
            color: #a78bfa;
            text-decoration: none;
            font-size: 0.9rem;
        }

        .no-results-link:hover {
            text-decoration: underline;
        }

        .quick-links-section {
            padding: 20px 24px;
        }

        .quick-links-header {
            display: flex;
            align-items: center;
            gap: 8px;
            margin-bottom: 14px;
            font-size: 0.7rem;
            font-weight: 600;
            color: #6b7280;
            text-transform: uppercase;
            letter-spacing: 0.1em;
        }

        .quick-links-grid {
            display: grid;
            grid-template-columns: repeat(2, 1fr);
            gap: 10px;
        }

        .quick-link-item {
            display: flex;
            align-items: center;
            gap: 12px;
            padding: 14px 16px;
            background: rgba(255, 255, 255, 0.03);
            border: 1px solid rgba(255, 255, 255, 0.06);
            border-radius: 14px;
            text-decoration: none;
            color: white;
            transition: all 0.2s ease;
        }

        .quick-link-item:hover,
        .quick-link-item.selected {
            background: rgba(139, 92, 246, 0.1);
            border-color: rgba(139, 92, 246, 0.2);
            transform: translateY(-1px);
        }

        .quick-link-icon {
            font-size: 1.3rem;
            flex-shrink: 0;
        }

        .quick-link-content {
            flex: 1;
            min-width: 0;
        }

        .quick-link-label {
            font-weight: 600;
            font-size: 0.9rem;
            margin-bottom: 2px;
        }

        .quick-link-desc {
            font-size: 0.75rem;
            color: #6b7280;
        }

        .search-footer {
            display: flex;
            align-items: center;
            justify-content: space-between;
            padding: 14px 24px;
            border-top: 1px solid rgba(255, 255, 255, 0.06);
            background: rgba(0, 0, 0, 0.2);
        }

        .footer-shortcuts {
            display: flex;
            align-items: center;
            gap: 16px;
        }

        .footer-shortcut {
            display: flex;
            align-items: center;
            gap: 6px;
            font-size: 0.75rem;
            color: #6b7280;
        }

        .footer-shortcut kbd {
            padding: 3px 6px;
            background: rgba(255, 255, 255, 0.06);
            border: 1px solid rgba(255, 255, 255, 0.1);
            border-radius: 4px;
            font-size: 0.7rem;
            font-family: inherit;
        }

        .footer-link {
            color: #a78bfa;
            text-decoration: none;
            font-size: 0.8rem;
            font-weight: 500;
            transition: color 0.15s;
        }

        .footer-link:hover {
            color: #c4b5fd;
        }

        @media (max-width: 640px) {
            .search-modal-overlay {
                padding-top: 5vh;
            }

            .quick-links-grid {
                grid-template-columns: 1fr;
            }

            .footer-shortcuts {
                display: none;
            }

            .search-kbd {
                display: none;
            }
        }
    `;

    return (
        <>
            <style>{styles}</style>
            <div className="search-modal-overlay">
                <div
                    className="search-modal-backdrop"
                    onClick={() => setIsOpen(false)}
                />

                <div className="search-modal">
                    {/* Search Input */}
                    <div className="search-input-container">
                        {isLoading ? (
                            <svg className="search-spinner" viewBox="0 0 24 24" fill="none">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                            </svg>
                        ) : (
                            <svg className="search-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <circle cx="11" cy="11" r="8" />
                                <path d="m21 21-4.3-4.3" />
                            </svg>
                        )}
                        <input
                            ref={inputRef}
                            type="text"
                            value={query}
                            onChange={(e) => setQuery(e.target.value)}
                            onKeyDown={handleKeyDown}
                            placeholder="Search doctors, specialties, institutions..."
                            className="search-input"
                        />
                        <kbd className="search-kbd">ESC</kbd>
                    </div>

                    {/* Results */}
                    {results.length > 0 && (
                        <div className="search-results">
                            {results.map((result, index) => {
                                const config = tierConfig[result.tier] || tierConfig.UNRANKED;
                                const location = [result.city, result.country].filter(Boolean).join(', ');

                                return (
                                    <a
                                        key={result.slug}
                                        href={`/doctor/${result.slug}`}
                                        className={`search-result-item ${selectedIndex === index ? 'selected' : ''}`}
                                        onMouseEnter={() => setSelectedIndex(index)}
                                    >
                                        <div
                                            className="result-avatar"
                                            style={{
                                                background: config.gradient,
                                                border: `2px solid ${config.border}`,
                                                color: config.text,
                                                boxShadow: selectedIndex === index ? `0 0 20px ${config.glow}` : 'none'
                                            }}
                                        >
                                            {result.portraitUrl && !result.portraitUrl.startsWith('data:') ? (
                                                <img src={result.portraitUrl} alt={result.fullName} />
                                            ) : (
                                                getInitials(result.fullName)
                                            )}
                                        </div>
                                        <div className="result-info">
                                            <div className="result-name-row">
                                                <span
                                                    className="result-name"
                                                    style={{ color: result.tier === 'TITAN' ? '#ffd700' : 'white' }}
                                                >
                                                    {result.fullName}
                                                </span>
                                                <span
                                                    className="result-tier"
                                                    style={{
                                                        background: config.gradient,
                                                        color: config.text,
                                                        border: `1px solid ${config.border}`
                                                    }}
                                                >
                                                    {result.tier}
                                                </span>
                                            </div>
                                            <div className="result-meta">
                                                {result.specialty}
                                                {location && (
                                                    <>
                                                        <span className="result-meta-separator">•</span>
                                                        {location}
                                                    </>
                                                )}
                                            </div>
                                        </div>
                                        {selectedIndex === index && (
                                            <span className="result-enter-hint">↵</span>
                                        )}
                                    </a>
                                );
                            })}
                        </div>
                    )}

                    {/* No Results */}
                    {query.length >= 2 && results.length === 0 && !isLoading && (
                        <div className="no-results">
                            <svg className="no-results-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                                <circle cx="11" cy="11" r="8" />
                                <path d="m21 21-4.3-4.3" />
                                <path d="M8 8l6 6M14 8l-6 6" />
                            </svg>
                            <p className="no-results-text">No results found for "{query}"</p>
                            <a
                                href={`/search?q=${encodeURIComponent(query)}`}
                                className="no-results-link"
                            >
                                View full search results →
                            </a>
                        </div>
                    )}

                    {/* Quick Links (when no query) */}
                    {query.length < 2 && (
                        <div className="quick-links-section">
                            <div className="quick-links-header">
                                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                    <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
                                </svg>
                                Quick Links
                            </div>
                            <div className="quick-links-grid">
                                {quickLinks.map((link, index) => (
                                    <a
                                        key={link.href}
                                        href={link.href}
                                        className={`quick-link-item ${selectedIndex === index ? 'selected' : ''}`}
                                        onMouseEnter={() => setSelectedIndex(index)}
                                    >
                                        <span className="quick-link-icon">{link.icon}</span>
                                        <div className="quick-link-content">
                                            <div className="quick-link-label">{link.label}</div>
                                            <div className="quick-link-desc">{link.desc}</div>
                                        </div>
                                    </a>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Footer */}
                    <div className="search-footer">
                        <div className="footer-shortcuts">
                            <span className="footer-shortcut">
                                <kbd>↑</kbd>
                                <kbd>↓</kbd>
                                Navigate
                            </span>
                            <span className="footer-shortcut">
                                <kbd>↵</kbd>
                                Select
                            </span>
                            <span className="footer-shortcut">
                                <kbd>esc</kbd>
                                Close
                            </span>
                        </div>
                        <a href="/search" className="footer-link">
                            Advanced Search →
                        </a>
                    </div>
                </div>
            </div>
        </>
    );
}
