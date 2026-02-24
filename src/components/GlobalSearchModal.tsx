/**
 * GlobalSearchModal - Premium Command Palette Style Search
 * Completely revamped with glassmorphism, animations, and rich result cards
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
    rankingScore?: number;
}

const DEBOUNCE_MS = 150;

const tierConfig: Record<string, {
    gradient: string;
    border: string;
    text: string;
    glow: string;
    bg: string;
    label: string;
    icon: string;
}> = {
    TITAN: {
        gradient: 'linear-gradient(135deg, #fbbf24 0%, #f59e0b 100%)',
        border: 'rgba(251, 191, 36, 0.6)',
        text: '#fbbf24',
        glow: '0 0 30px rgba(251, 191, 36, 0.4)',
        bg: 'rgba(251, 191, 36, 0.1)',
        label: 'Top 0.01%',
        icon: '👑'
    },
    ELITE: {
        gradient: 'linear-gradient(135deg, #38bdf8 0%, #0ea5e9 100%)',
        border: 'rgba(56, 189, 248, 0.5)',
        text: '#38bdf8',
        glow: '0 0 25px rgba(56, 189, 248, 0.3)',
        bg: 'rgba(56, 189, 248, 0.1)',
        label: 'Top 1%',
        icon: '⭐'
    },
    MASTER: {
        gradient: 'linear-gradient(135deg, #4ade80 0%, #22c55e 100%)',
        border: 'rgba(74, 222, 128, 0.5)',
        text: '#4ade80',
        glow: '0 0 25px rgba(74, 222, 128, 0.3)',
        bg: 'rgba(74, 222, 128, 0.1)',
        label: 'Top 3%',
        icon: '✦'
    },
    UNRANKED: {
        gradient: 'linear-gradient(135deg, #64748b 0%, #475569 100%)',
        border: 'rgba(100, 116, 139, 0.4)',
        text: '#94a3b8',
        glow: 'none',
        bg: 'rgba(100, 116, 139, 0.1)',
        label: 'Verified',
        icon: '◆'
    },
};

const quickLinks = [
    { href: '/rankings', icon: '', label: 'Rankings', desc: 'Browse top-rated physicians worldwide', color: '#fbbf24' },
    { href: '/rare-diseases', icon: '', label: 'Rare Diseases', desc: 'Expert database for rare conditions', color: '#a78bfa' },
    { href: '/hospitals', icon: '', label: 'Institutions', desc: 'Leading medical centers globally', color: '#38bdf8' },
    { href: '/prizes', icon: '', label: 'Awards', desc: 'Nobel, Lasker & major honors', color: '#4ade80' },
    { href: '/news', icon: '', label: 'Medical News', desc: 'Latest breakthroughs & research', color: '#f472b6' },
    { href: '/doctor/claim', icon: '', label: 'Claim Profile', desc: 'Verify your physician identity', color: '#22d3ee' },
];

const categories = [
    { id: 'all', label: 'All', icon: '' },
    { id: 'titan', label: 'Titan', icon: '' },
    { id: 'cardiology', label: 'Cardiology', icon: '' },
    { id: 'neurology', label: 'Neurology', icon: '' },
    { id: 'oncology', label: 'Oncology', icon: '' },
];

export default function GlobalSearchModal() {
    const [isOpen, setIsOpen] = useState(false);
    const [query, setQuery] = useState('');
    const [results, setResults] = useState<SearchResult[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [selectedIndex, setSelectedIndex] = useState(0);
    const [activeCategory, setActiveCategory] = useState('all');
    const [recentSearches, setRecentSearches] = useState<string[]>([]);

    const inputRef = useRef<HTMLInputElement>(null);
    const debounceRef = useRef<NodeJS.Timeout>();
    const resultsRef = useRef<HTMLDivElement>(null);

    // Load recent searches from localStorage
    useEffect(() => {
        const saved = localStorage.getItem('mdrpedia-recent-searches');
        if (saved) {
            try {
                setRecentSearches(JSON.parse(saved).slice(0, 5));
            } catch (e) {}
        }
    }, []);

    // Save search to recent
    const saveSearch = (searchTerm: string) => {
        const updated = [searchTerm, ...recentSearches.filter(s => s !== searchTerm)].slice(0, 5);
        setRecentSearches(updated);
        localStorage.setItem('mdrpedia-recent-searches', JSON.stringify(updated));
    };

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
                setResults(data.slice(0, 8));
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

    // Scroll selected item into view
    useEffect(() => {
        if (resultsRef.current) {
            const selected = resultsRef.current.querySelector('.selected');
            if (selected) {
                selected.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
            }
        }
    }, [selectedIndex]);

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
                    saveSearch(query);
                    window.location.href = `/doctors/${results[selectedIndex].slug}`;
                } else if (results.length === 0 && quickLinks[selectedIndex]) {
                    window.location.href = quickLinks[selectedIndex].href;
                } else if (query.length >= 2) {
                    saveSearch(query);
                    window.location.href = `/search?q=${encodeURIComponent(query)}`;
                }
                break;
        }
    };

    const getInitials = (name: string) => {
        return name.split(' ').map(w => w[0]).filter((_, i) => i < 2).join('').toUpperCase();
    };

    const clearRecentSearches = () => {
        setRecentSearches([]);
        localStorage.removeItem('mdrpedia-recent-searches');
    };

    if (!isOpen) return null;

    const styles = `
        /* ═══════════════════════════════════════════════════════════════════════════
           GLOBAL SEARCH MODAL - PREMIUM COMMAND PALETTE
           ═══════════════════════════════════════════════════════════════════════════ */

        .gsm-overlay {
            position: fixed;
            inset: 0;
            z-index: 9999;
            display: flex;
            align-items: flex-start;
            justify-content: center;
            padding-top: 8vh;
            animation: gsm-fade-in 0.2s ease-out;
        }

        @keyframes gsm-fade-in {
            from { opacity: 0; }
            to { opacity: 1; }
        }

        .gsm-backdrop {
            position: absolute;
            inset: 0;
            background: rgba(0, 0, 0, 0.85);
            backdrop-filter: blur(20px);
            -webkit-backdrop-filter: blur(20px);
        }

        .gsm-container {
            position: relative;
            width: 100%;
            max-width: 680px;
            margin: 0 16px;
            background: linear-gradient(180deg, rgba(15, 15, 25, 0.98) 0%, rgba(10, 10, 18, 0.99) 100%);
            border: 1px solid rgba(139, 92, 246, 0.25);
            border-radius: 24px;
            box-shadow:
                0 0 0 1px rgba(255, 255, 255, 0.05) inset,
                0 50px 100px -30px rgba(0, 0, 0, 0.8),
                0 0 150px -50px rgba(139, 92, 246, 0.5);
            overflow: hidden;
            animation: gsm-slide-up 0.25s cubic-bezier(0.16, 1, 0.3, 1);
        }

        @keyframes gsm-slide-up {
            from {
                opacity: 0;
                transform: translateY(20px) scale(0.96);
            }
            to {
                opacity: 1;
                transform: translateY(0) scale(1);
            }
        }

        /* Gradient border effect */
        .gsm-container::before {
            content: '';
            position: absolute;
            top: 0;
            left: 0;
            right: 0;
            height: 1px;
            background: linear-gradient(90deg, transparent 0%, rgba(139, 92, 246, 0.6) 50%, transparent 100%);
        }

        /* ═══════════════ SEARCH INPUT ═══════════════ */
        .gsm-input-section {
            position: relative;
            padding: 24px 28px;
            background: linear-gradient(180deg, rgba(139, 92, 246, 0.05) 0%, transparent 100%);
        }

        .gsm-input-wrapper {
            display: flex;
            align-items: center;
            gap: 16px;
            background: rgba(255, 255, 255, 0.03);
            border: 1px solid rgba(255, 255, 255, 0.08);
            border-radius: 16px;
            padding: 16px 20px;
            transition: all 0.2s ease;
        }

        .gsm-input-wrapper:focus-within {
            background: rgba(255, 255, 255, 0.05);
            border-color: rgba(139, 92, 246, 0.4);
            box-shadow: 0 0 0 4px rgba(139, 92, 246, 0.1);
        }

        .gsm-search-icon {
            flex-shrink: 0;
            width: 24px;
            height: 24px;
            color: #a78bfa;
            transition: transform 0.2s;
        }

        .gsm-input-wrapper:focus-within .gsm-search-icon {
            transform: scale(1.1);
        }

        .gsm-spinner {
            flex-shrink: 0;
            width: 24px;
            height: 24px;
            color: #a78bfa;
            animation: gsm-spin 0.7s linear infinite;
        }

        @keyframes gsm-spin {
            to { transform: rotate(360deg); }
        }

        .gsm-input {
            flex: 1;
            background: transparent;
            border: none;
            outline: none;
            font-size: 1.15rem;
            font-weight: 500;
            color: #f8fafc;
            font-family: inherit;
            letter-spacing: -0.01em;
        }

        .gsm-input::placeholder {
            color: #64748b;
            font-weight: 400;
        }

        .gsm-kbd {
            display: flex;
            align-items: center;
            padding: 6px 12px;
            background: rgba(255, 255, 255, 0.04);
            border: 1px solid rgba(255, 255, 255, 0.1);
            border-radius: 10px;
            font-size: 0.75rem;
            font-weight: 600;
            color: #64748b;
            font-family: inherit;
        }

        /* ═══════════════ CATEGORY FILTERS ═══════════════ */
        .gsm-categories {
            display: flex;
            align-items: center;
            gap: 8px;
            padding: 0 28px 16px;
            overflow-x: auto;
            -webkit-overflow-scrolling: touch;
        }

        .gsm-categories::-webkit-scrollbar {
            display: none;
        }

        .gsm-category {
            display: flex;
            align-items: center;
            gap: 6px;
            padding: 8px 14px;
            background: rgba(255, 255, 255, 0.03);
            border: 1px solid rgba(255, 255, 255, 0.06);
            border-radius: 20px;
            font-size: 0.8rem;
            font-weight: 500;
            color: #94a3b8;
            white-space: nowrap;
            cursor: pointer;
            transition: all 0.2s ease;
        }

        .gsm-category:hover {
            background: rgba(255, 255, 255, 0.06);
            border-color: rgba(255, 255, 255, 0.1);
            color: #e2e8f0;
        }

        .gsm-category.active {
            background: rgba(139, 92, 246, 0.15);
            border-color: rgba(139, 92, 246, 0.4);
            color: #a78bfa;
        }

        .gsm-category-icon {
            font-size: 0.9rem;
        }

        /* ═══════════════ RESULTS ═══════════════ */
        .gsm-results {
            max-height: 55vh;
            overflow-y: auto;
            padding: 8px 12px;
            scroll-behavior: smooth;
        }

        .gsm-results::-webkit-scrollbar {
            width: 6px;
        }

        .gsm-results::-webkit-scrollbar-track {
            background: transparent;
        }

        .gsm-results::-webkit-scrollbar-thumb {
            background: rgba(139, 92, 246, 0.3);
            border-radius: 3px;
        }

        .gsm-result {
            display: flex;
            align-items: center;
            gap: 16px;
            padding: 16px 18px;
            margin-bottom: 4px;
            text-decoration: none;
            color: #f8fafc;
            border-radius: 16px;
            transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
            position: relative;
            overflow: hidden;
        }

        .gsm-result::before {
            content: '';
            position: absolute;
            inset: 0;
            opacity: 0;
            transition: opacity 0.2s;
        }

        .gsm-result:hover {
            background: rgba(255, 255, 255, 0.04);
        }

        .gsm-result.selected {
            background: linear-gradient(135deg, rgba(139, 92, 246, 0.12) 0%, rgba(139, 92, 246, 0.05) 100%);
            border: 1px solid rgba(139, 92, 246, 0.2);
        }

        .gsm-result.selected::before {
            opacity: 1;
            background: linear-gradient(90deg, rgba(139, 92, 246, 0.1), transparent);
        }

        /* Avatar */
        .gsm-avatar {
            position: relative;
            width: 56px;
            height: 56px;
            border-radius: 16px;
            overflow: hidden;
            flex-shrink: 0;
            display: flex;
            align-items: center;
            justify-content: center;
            font-weight: 700;
            font-size: 1rem;
            letter-spacing: 0.05em;
            transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
        }

        .gsm-result.selected .gsm-avatar {
            transform: scale(1.05);
        }

        .gsm-avatar img {
            width: 100%;
            height: 100%;
            object-fit: cover;
        }

        .gsm-avatar-ring {
            position: absolute;
            inset: -3px;
            border-radius: 18px;
            opacity: 0;
            transition: opacity 0.3s;
        }

        .gsm-result.selected .gsm-avatar-ring {
            opacity: 1;
        }

        /* Info */
        .gsm-info {
            flex: 1;
            min-width: 0;
        }

        .gsm-name-row {
            display: flex;
            align-items: center;
            gap: 10px;
            margin-bottom: 6px;
        }

        .gsm-name {
            font-weight: 600;
            font-size: 1.05rem;
            letter-spacing: -0.01em;
            white-space: nowrap;
            overflow: hidden;
            text-overflow: ellipsis;
        }

        .gsm-tier-badge {
            display: flex;
            align-items: center;
            gap: 5px;
            padding: 4px 10px;
            border-radius: 8px;
            font-size: 0.65rem;
            font-weight: 700;
            letter-spacing: 0.03em;
            text-transform: uppercase;
            flex-shrink: 0;
        }

        .gsm-tier-icon {
            font-size: 0.75rem;
        }

        .gsm-meta {
            display: flex;
            align-items: center;
            gap: 12px;
            font-size: 0.875rem;
            color: #94a3b8;
        }

        .gsm-specialty {
            display: flex;
            align-items: center;
            gap: 6px;
        }

        .gsm-specialty-icon {
            width: 14px;
            height: 14px;
            color: #64748b;
        }

        .gsm-location {
            display: flex;
            align-items: center;
            gap: 5px;
            color: #64748b;
        }

        .gsm-location-icon {
            width: 12px;
            height: 12px;
        }

        .gsm-stats {
            display: flex;
            align-items: center;
            gap: 12px;
            margin-top: 8px;
        }

        .gsm-stat {
            display: flex;
            align-items: center;
            gap: 5px;
            padding: 4px 10px;
            background: rgba(255, 255, 255, 0.04);
            border-radius: 8px;
            font-size: 0.75rem;
            color: #94a3b8;
        }

        .gsm-stat-value {
            font-weight: 700;
            color: #e2e8f0;
        }

        /* Enter hint */
        .gsm-enter-hint {
            display: flex;
            align-items: center;
            justify-content: center;
            width: 32px;
            height: 32px;
            background: rgba(139, 92, 246, 0.15);
            border: 1px solid rgba(139, 92, 246, 0.3);
            border-radius: 10px;
            color: #a78bfa;
            font-size: 1rem;
            flex-shrink: 0;
            transition: all 0.2s;
        }

        .gsm-result:hover .gsm-enter-hint {
            background: rgba(139, 92, 246, 0.25);
            transform: scale(1.1);
        }

        /* ═══════════════ NO RESULTS ═══════════════ */
        .gsm-no-results {
            padding: 48px 28px;
            text-align: center;
        }

        .gsm-no-results-icon {
            width: 64px;
            height: 64px;
            margin: 0 auto 20px;
            color: #475569;
            opacity: 0.6;
        }

        .gsm-no-results-title {
            font-size: 1.1rem;
            font-weight: 600;
            color: #e2e8f0;
            margin-bottom: 8px;
        }

        .gsm-no-results-text {
            color: #64748b;
            margin-bottom: 20px;
            font-size: 0.95rem;
        }

        .gsm-no-results-link {
            display: inline-flex;
            align-items: center;
            gap: 8px;
            padding: 12px 24px;
            background: rgba(139, 92, 246, 0.15);
            border: 1px solid rgba(139, 92, 246, 0.3);
            border-radius: 12px;
            color: #a78bfa;
            font-weight: 600;
            font-size: 0.9rem;
            text-decoration: none;
            transition: all 0.2s;
        }

        .gsm-no-results-link:hover {
            background: rgba(139, 92, 246, 0.25);
            transform: translateY(-2px);
        }

        /* ═══════════════ QUICK LINKS ═══════════════ */
        .gsm-quick-section {
            padding: 20px 20px 24px;
        }

        .gsm-section-header {
            display: flex;
            align-items: center;
            justify-content: space-between;
            margin-bottom: 16px;
            padding: 0 8px;
        }

        .gsm-section-title {
            display: flex;
            align-items: center;
            gap: 8px;
            font-size: 0.7rem;
            font-weight: 700;
            color: #64748b;
            text-transform: uppercase;
            letter-spacing: 0.12em;
        }

        .gsm-section-icon {
            width: 14px;
            height: 14px;
        }

        .gsm-clear-btn {
            background: none;
            border: none;
            color: #64748b;
            font-size: 0.75rem;
            cursor: pointer;
            transition: color 0.2s;
        }

        .gsm-clear-btn:hover {
            color: #f87171;
        }

        .gsm-quick-grid {
            display: grid;
            grid-template-columns: repeat(3, 1fr);
            gap: 10px;
        }

        .gsm-quick-item {
            display: flex;
            flex-direction: column;
            align-items: center;
            gap: 10px;
            padding: 20px 12px;
            background: rgba(255, 255, 255, 0.02);
            border: 1px solid rgba(255, 255, 255, 0.05);
            border-radius: 16px;
            text-decoration: none;
            color: #e2e8f0;
            transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1);
            position: relative;
            overflow: hidden;
        }

        .gsm-quick-item::before {
            content: '';
            position: absolute;
            top: 0;
            left: 0;
            right: 0;
            height: 2px;
            background: var(--accent-color);
            opacity: 0;
            transition: opacity 0.2s;
        }

        .gsm-quick-item:hover {
            background: rgba(255, 255, 255, 0.05);
            border-color: rgba(255, 255, 255, 0.1);
            transform: translateY(-4px);
        }

        .gsm-quick-item:hover::before {
            opacity: 1;
        }

        .gsm-quick-item.selected {
            background: rgba(139, 92, 246, 0.1);
            border-color: rgba(139, 92, 246, 0.3);
        }

        .gsm-quick-icon {
            font-size: 1.8rem;
            filter: drop-shadow(0 4px 8px rgba(0,0,0,0.3));
        }

        .gsm-quick-content {
            text-align: center;
        }

        .gsm-quick-label {
            font-weight: 600;
            font-size: 0.9rem;
            margin-bottom: 4px;
        }

        .gsm-quick-desc {
            font-size: 0.7rem;
            color: #64748b;
            line-height: 1.4;
        }

        /* ═══════════════ RECENT SEARCHES ═══════════════ */
        .gsm-recent-list {
            display: flex;
            flex-direction: column;
            gap: 4px;
        }

        .gsm-recent-item {
            display: flex;
            align-items: center;
            gap: 12px;
            padding: 12px 16px;
            background: rgba(255, 255, 255, 0.02);
            border: 1px solid transparent;
            border-radius: 12px;
            text-decoration: none;
            color: #e2e8f0;
            font-size: 0.9rem;
            transition: all 0.2s;
            cursor: pointer;
        }

        .gsm-recent-item:hover {
            background: rgba(255, 255, 255, 0.05);
            border-color: rgba(255, 255, 255, 0.1);
        }

        .gsm-recent-icon {
            width: 16px;
            height: 16px;
            color: #64748b;
        }

        .gsm-recent-text {
            flex: 1;
        }

        .gsm-recent-arrow {
            width: 16px;
            height: 16px;
            color: #475569;
            opacity: 0;
            transition: all 0.2s;
        }

        .gsm-recent-item:hover .gsm-recent-arrow {
            opacity: 1;
            transform: translateX(4px);
        }

        /* ═══════════════ FOOTER ═══════════════ */
        .gsm-footer {
            display: flex;
            align-items: center;
            justify-content: space-between;
            padding: 16px 24px;
            border-top: 1px solid rgba(255, 255, 255, 0.05);
            background: rgba(0, 0, 0, 0.3);
        }

        .gsm-shortcuts {
            display: flex;
            align-items: center;
            gap: 20px;
        }

        .gsm-shortcut {
            display: flex;
            align-items: center;
            gap: 8px;
            font-size: 0.75rem;
            color: #64748b;
        }

        .gsm-shortcut kbd {
            display: inline-flex;
            align-items: center;
            justify-content: center;
            min-width: 22px;
            height: 22px;
            padding: 0 6px;
            background: rgba(255, 255, 255, 0.05);
            border: 1px solid rgba(255, 255, 255, 0.1);
            border-radius: 6px;
            font-size: 0.7rem;
            font-weight: 600;
            font-family: inherit;
            color: #94a3b8;
        }

        .gsm-footer-link {
            display: flex;
            align-items: center;
            gap: 6px;
            color: #a78bfa;
            text-decoration: none;
            font-size: 0.85rem;
            font-weight: 600;
            transition: all 0.2s;
        }

        .gsm-footer-link:hover {
            color: #c4b5fd;
        }

        .gsm-footer-link svg {
            width: 16px;
            height: 16px;
            transition: transform 0.2s;
        }

        .gsm-footer-link:hover svg {
            transform: translateX(3px);
        }

        /* ═══════════════ RESPONSIVE ═══════════════ */
        @media (max-width: 640px) {
            .gsm-overlay {
                padding-top: 4vh;
            }

            .gsm-container {
                max-height: 90vh;
            }

            .gsm-quick-grid {
                grid-template-columns: repeat(2, 1fr);
            }

            .gsm-shortcuts {
                display: none;
            }

            .gsm-kbd {
                display: none;
            }

            .gsm-categories {
                padding: 0 20px 12px;
            }

            .gsm-input-section {
                padding: 20px;
            }

            .gsm-input {
                font-size: 1rem;
            }

            .gsm-avatar {
                width: 48px;
                height: 48px;
            }

            .gsm-stats {
                display: none;
            }
        }
    `;

    return (
        <>
            <style>{styles}</style>
            <div className="gsm-overlay">
                <div className="gsm-backdrop" onClick={() => setIsOpen(false)} />

                <div className="gsm-container">
                    {/* Search Input */}
                    <div className="gsm-input-section">
                        <div className="gsm-input-wrapper">
                            {isLoading ? (
                                <svg className="gsm-spinner" viewBox="0 0 24 24" fill="none">
                                    <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" strokeOpacity="0.25" />
                                    <path d="M12 2a10 10 0 0 1 10 10" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
                                </svg>
                            ) : (
                                <svg className="gsm-search-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                                    <circle cx="11" cy="11" r="8" />
                                    <path d="m21 21-4.3-4.3" strokeLinecap="round" />
                                </svg>
                            )}
                            <input
                                ref={inputRef}
                                type="text"
                                value={query}
                                onChange={(e) => setQuery(e.target.value)}
                                onKeyDown={handleKeyDown}
                                placeholder="Search physicians, specialties, institutions..."
                                className="gsm-input"
                            />
                            <kbd className="gsm-kbd">ESC</kbd>
                        </div>
                    </div>

                    {/* Category Filters */}
                    {query.length < 2 && (
                        <div className="gsm-categories">
                            {categories.map(cat => (
                                <button
                                    key={cat.id}
                                    className={`gsm-category ${activeCategory === cat.id ? 'active' : ''}`}
                                    onClick={() => setActiveCategory(cat.id)}
                                >
                                    <span className="gsm-category-icon">{cat.icon}</span>
                                    {cat.label}
                                </button>
                            ))}
                        </div>
                    )}

                    {/* Results */}
                    {results.length > 0 && (
                        <div className="gsm-results" ref={resultsRef}>
                            {results.map((result, index) => {
                                const config = tierConfig[result.tier] || tierConfig.UNRANKED;
                                const location = [result.city, result.country].filter(Boolean).join(', ');

                                return (
                                    <a
                                        key={result.slug}
                                        href={`/doctors/${result.slug}`}
                                        className={`gsm-result ${selectedIndex === index ? 'selected' : ''}`}
                                        onMouseEnter={() => setSelectedIndex(index)}
                                        onClick={() => saveSearch(query)}
                                    >
                                        <div
                                            className="gsm-avatar"
                                            style={{
                                                background: config.bg,
                                                border: `2px solid ${config.border}`,
                                                color: config.text,
                                            }}
                                        >
                                            <div
                                                className="gsm-avatar-ring"
                                                style={{ border: `2px solid ${config.border}`, boxShadow: config.glow }}
                                            />
                                            {result.portraitUrl && !result.portraitUrl.startsWith('data:') ? (
                                                <img src={result.portraitUrl} alt={result.fullName} />
                                            ) : (
                                                getInitials(result.fullName)
                                            )}
                                        </div>

                                        <div className="gsm-info">
                                            <div className="gsm-name-row">
                                                <span className="gsm-name" style={{ color: result.tier === 'TITAN' ? '#fbbf24' : '#f8fafc' }}>
                                                    {result.fullName}
                                                </span>
                                                <span
                                                    className="gsm-tier-badge"
                                                    style={{
                                                        background: config.bg,
                                                        color: config.text,
                                                        border: `1px solid ${config.border}`
                                                    }}
                                                >
                                                    <span className="gsm-tier-icon">{config.icon}</span>
                                                    {config.label}
                                                </span>
                                            </div>

                                            <div className="gsm-meta">
                                                <span className="gsm-specialty">
                                                    <svg className="gsm-specialty-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                                        <path d="M22 12h-4l-3 9L9 3l-3 9H2" />
                                                    </svg>
                                                    {result.specialty}
                                                </span>
                                                {location && (
                                                    <span className="gsm-location">
                                                        <svg className="gsm-location-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                                            <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z" />
                                                            <circle cx="12" cy="10" r="3" />
                                                        </svg>
                                                        {location}
                                                    </span>
                                                )}
                                            </div>

                                            {(result.hIndex || result.rankingScore) && (
                                                <div className="gsm-stats">
                                                    {result.hIndex && (
                                                        <span className="gsm-stat">
                                                            H-Index: <span className="gsm-stat-value">{result.hIndex}</span>
                                                        </span>
                                                    )}
                                                    {result.rankingScore && (
                                                        <span className="gsm-stat">
                                                            Score: <span className="gsm-stat-value">{result.rankingScore.toFixed(1)}</span>
                                                        </span>
                                                    )}
                                                </div>
                                            )}
                                        </div>

                                        {selectedIndex === index && (
                                            <span className="gsm-enter-hint">↵</span>
                                        )}
                                    </a>
                                );
                            })}
                        </div>
                    )}

                    {/* No Results */}
                    {query.length >= 2 && results.length === 0 && !isLoading && (
                        <div className="gsm-no-results">
                            <svg className="gsm-no-results-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                                <circle cx="11" cy="11" r="8" />
                                <path d="m21 21-4.3-4.3" />
                                <path d="M11 8v6M8 11h6" strokeLinecap="round" />
                            </svg>
                            <p className="gsm-no-results-title">No physicians found</p>
                            <p className="gsm-no-results-text">
                                We couldn't find anyone matching "{query}"
                            </p>
                            <a href={`/search?q=${encodeURIComponent(query)}`} className="gsm-no-results-link">
                                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                    <circle cx="11" cy="11" r="8" />
                                    <path d="m21 21-4.3-4.3" />
                                </svg>
                                Try Advanced Search
                            </a>
                        </div>
                    )}

                    {/* Quick Links (when no query) */}
                    {query.length < 2 && (
                        <>
                            {/* Recent Searches */}
                            {recentSearches.length > 0 && (
                                <div className="gsm-quick-section" style={{ paddingBottom: '12px' }}>
                                    <div className="gsm-section-header">
                                        <span className="gsm-section-title">
                                            <svg className="gsm-section-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                                <circle cx="12" cy="12" r="10" />
                                                <polyline points="12 6 12 12 16 14" />
                                            </svg>
                                            Recent Searches
                                        </span>
                                        <button className="gsm-clear-btn" onClick={clearRecentSearches}>
                                            Clear all
                                        </button>
                                    </div>
                                    <div className="gsm-recent-list">
                                        {recentSearches.map((search, idx) => (
                                            <div
                                                key={idx}
                                                className="gsm-recent-item"
                                                onClick={() => {
                                                    setQuery(search);
                                                    fetchResults(search);
                                                }}
                                            >
                                                <svg className="gsm-recent-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                                    <circle cx="11" cy="11" r="8" />
                                                    <path d="m21 21-4.3-4.3" />
                                                </svg>
                                                <span className="gsm-recent-text">{search}</span>
                                                <svg className="gsm-recent-arrow" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                                    <path d="m9 18 6-6-6-6" />
                                                </svg>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* Quick Links Grid */}
                            <div className="gsm-quick-section">
                                <div className="gsm-section-header">
                                    <span className="gsm-section-title">
                                        <svg className="gsm-section-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                            <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
                                        </svg>
                                        Quick Access
                                    </span>
                                </div>
                                <div className="gsm-quick-grid">
                                    {quickLinks.map((link, index) => (
                                        <a
                                            key={link.href}
                                            href={link.href}
                                            className={`gsm-quick-item ${selectedIndex === index ? 'selected' : ''}`}
                                            onMouseEnter={() => setSelectedIndex(index)}
                                            style={{ '--accent-color': link.color } as React.CSSProperties}
                                        >
                                            <span className="gsm-quick-icon">{link.icon}</span>
                                            <div className="gsm-quick-content">
                                                <div className="gsm-quick-label">{link.label}</div>
                                                <div className="gsm-quick-desc">{link.desc}</div>
                                            </div>
                                        </a>
                                    ))}
                                </div>
                            </div>
                        </>
                    )}

                    {/* Footer */}
                    <div className="gsm-footer">
                        <div className="gsm-shortcuts">
                            <span className="gsm-shortcut">
                                <kbd>↑</kbd>
                                <kbd>↓</kbd>
                                Navigate
                            </span>
                            <span className="gsm-shortcut">
                                <kbd>↵</kbd>
                                Select
                            </span>
                            <span className="gsm-shortcut">
                                <kbd>esc</kbd>
                                Close
                            </span>
                        </div>
                        <a href="/search" className="gsm-footer-link">
                            Advanced Search
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <path d="m9 18 6-6-6-6" />
                            </svg>
                        </a>
                    </div>
                </div>
            </div>
        </>
    );
}
