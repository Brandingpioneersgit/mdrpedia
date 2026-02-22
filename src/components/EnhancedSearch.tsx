/**
 * EnhancedSearch - Real-time search with autocomplete, keyboard navigation, and filters
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
    relevanceScore?: number;
}

interface EnhancedSearchProps {
    initialQuery?: string;
    placeholder?: string;
    autoFocus?: boolean;
    showFilters?: boolean;
    onResultClick?: (result: SearchResult) => void;
    maxResults?: number;
}

const RECENT_SEARCHES_KEY = 'mdrpedia_recent_searches';
const MAX_RECENT_SEARCHES = 5;
const DEBOUNCE_MS = 250;

// Tier colors and styles
const tierStyles: Record<string, { border: string; bg: string; text: string }> = {
    TITAN: { border: 'border-yellow-500/40', bg: 'bg-yellow-500/10', text: 'text-yellow-400' },
    ELITE: { border: 'border-blue-500/40', bg: 'bg-blue-500/10', text: 'text-blue-400' },
    MASTER: { border: 'border-green-500/40', bg: 'bg-green-500/10', text: 'text-green-400' },
    UNRANKED: { border: 'border-white/10', bg: 'bg-white/5', text: 'text-gray-400' },
};

// Popular specialties for quick filters
const QUICK_FILTERS = [
    { label: 'Cardiology', value: 'cardiology', icon: '❤️' },
    { label: 'Neurology', value: 'neurology', icon: '🧠' },
    { label: 'Oncology', value: 'oncology', icon: '🎗️' },
    { label: 'Surgery', value: 'surgery', icon: '🔪' },
    { label: 'Pediatrics', value: 'pediatrics', icon: '👶' },
];

export default function EnhancedSearch({
    initialQuery = '',
    placeholder = 'Search doctors by name, specialty, or location...',
    autoFocus = false,
    showFilters = true,
    onResultClick,
    maxResults = 8,
}: EnhancedSearchProps) {
    const [query, setQuery] = useState(initialQuery);
    const [results, setResults] = useState<SearchResult[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [isOpen, setIsOpen] = useState(false);
    const [selectedIndex, setSelectedIndex] = useState(-1);
    const [recentSearches, setRecentSearches] = useState<string[]>([]);
    const [activeFilter, setActiveFilter] = useState<string | null>(null);
    const [error, setError] = useState<string | null>(null);

    const inputRef = useRef<HTMLInputElement>(null);
    const dropdownRef = useRef<HTMLDivElement>(null);
    const debounceRef = useRef<NodeJS.Timeout>();

    // Load recent searches from localStorage
    useEffect(() => {
        try {
            const stored = localStorage.getItem(RECENT_SEARCHES_KEY);
            if (stored) {
                setRecentSearches(JSON.parse(stored));
            }
        } catch (e) {
            // Ignore localStorage errors
        }
    }, []);

    // Save recent search
    const saveRecentSearch = useCallback((searchQuery: string) => {
        if (searchQuery.length < 2) return;

        setRecentSearches(prev => {
            const updated = [searchQuery, ...prev.filter(s => s !== searchQuery)].slice(0, MAX_RECENT_SEARCHES);
            try {
                localStorage.setItem(RECENT_SEARCHES_KEY, JSON.stringify(updated));
            } catch (e) {
                // Ignore localStorage errors
            }
            return updated;
        });
    }, []);

    // Fetch search results
    const fetchResults = useCallback(async (searchQuery: string, filter?: string) => {
        if (searchQuery.length < 2) {
            setResults([]);
            return;
        }

        setIsLoading(true);
        setError(null);

        try {
            const params = new URLSearchParams({ q: searchQuery });
            if (filter) {
                params.append('specialty', filter);
            }

            const response = await fetch(`/api/search?${params.toString()}`);

            if (!response.ok) {
                throw new Error('Search failed');
            }

            const data = await response.json();
            setResults(data.slice(0, maxResults));
        } catch (e) {
            setError('Search failed. Please try again.');
            setResults([]);
        } finally {
            setIsLoading(false);
        }
    }, [maxResults]);

    // Debounced search
    useEffect(() => {
        if (debounceRef.current) {
            clearTimeout(debounceRef.current);
        }

        if (query.length >= 2) {
            debounceRef.current = setTimeout(() => {
                fetchResults(query, activeFilter || undefined);
            }, DEBOUNCE_MS);
        } else {
            setResults([]);
        }

        return () => {
            if (debounceRef.current) {
                clearTimeout(debounceRef.current);
            }
        };
    }, [query, activeFilter, fetchResults]);

    // Handle keyboard navigation
    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (!isOpen) {
            if (e.key === 'ArrowDown' || e.key === 'Enter') {
                setIsOpen(true);
            }
            return;
        }

        const itemCount = results.length > 0 ? results.length : recentSearches.length;

        switch (e.key) {
            case 'ArrowDown':
                e.preventDefault();
                setSelectedIndex(prev => (prev + 1) % itemCount);
                break;
            case 'ArrowUp':
                e.preventDefault();
                setSelectedIndex(prev => (prev - 1 + itemCount) % itemCount);
                break;
            case 'Enter':
                e.preventDefault();
                if (results.length > 0 && selectedIndex >= 0) {
                    handleResultClick(results[selectedIndex]);
                } else if (results.length === 0 && selectedIndex >= 0 && recentSearches[selectedIndex]) {
                    setQuery(recentSearches[selectedIndex]);
                    fetchResults(recentSearches[selectedIndex], activeFilter || undefined);
                } else if (query.length >= 2) {
                    // Submit the form
                    saveRecentSearch(query);
                    window.location.href = `/search?q=${encodeURIComponent(query)}`;
                }
                break;
            case 'Escape':
                setIsOpen(false);
                setSelectedIndex(-1);
                inputRef.current?.blur();
                break;
        }
    };

    // Handle result click
    const handleResultClick = (result: SearchResult) => {
        saveRecentSearch(query);
        if (onResultClick) {
            onResultClick(result);
        } else {
            window.location.href = `/doctor/${result.slug}`;
        }
    };

    // Handle filter click
    const handleFilterClick = (filter: string) => {
        if (activeFilter === filter) {
            setActiveFilter(null);
        } else {
            setActiveFilter(filter);
        }
    };

    // Clear recent search
    const clearRecentSearch = (searchToRemove: string, e: React.MouseEvent) => {
        e.stopPropagation();
        setRecentSearches(prev => {
            const updated = prev.filter(s => s !== searchToRemove);
            try {
                localStorage.setItem(RECENT_SEARCHES_KEY, JSON.stringify(updated));
            } catch (e) {
                // Ignore localStorage errors
            }
            return updated;
        });
    };

    // Click outside to close
    useEffect(() => {
        const handleClickOutside = (e: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
                setIsOpen(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    // Highlight matching text
    const highlightMatch = (text: string, searchQuery: string) => {
        if (!searchQuery || searchQuery.length < 2) return text;

        const regex = new RegExp(`(${searchQuery.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'gi');
        const parts = text.split(regex);

        return parts.map((part, i) =>
            regex.test(part) ? (
                <mark key={i} className="bg-purple-500/30 text-white rounded px-0.5">{part}</mark>
            ) : part
        );
    };

    // Get initials from name
    const getInitials = (name: string) => {
        return name
            .split(' ')
            .map(w => w[0])
            .filter((_, i) => i < 2)
            .join('')
            .toUpperCase();
    };

    return (
        <div className="enhanced-search w-full max-w-3xl mx-auto" ref={dropdownRef}>
            {/* Search Input */}
            <div className="relative">
                <div className={`
                    flex items-center gap-3 px-4 py-3
                    bg-white/[0.04] border rounded-xl
                    transition-all duration-200
                    ${isOpen ? 'border-purple-500/50 ring-2 ring-purple-500/20' : 'border-white/10 hover:border-white/20'}
                `}>
                    {/* Search Icon or Loading Spinner */}
                    {isLoading ? (
                        <svg className="w-5 h-5 text-purple-400 animate-spin" viewBox="0 0 24 24" fill="none">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                        </svg>
                    ) : (
                        <svg className="w-5 h-5 text-gray-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <circle cx="11" cy="11" r="8" />
                            <path d="m21 21-4.3-4.3" />
                        </svg>
                    )}

                    <input
                        ref={inputRef}
                        type="text"
                        value={query}
                        onChange={(e) => {
                            setQuery(e.target.value);
                            setSelectedIndex(-1);
                            setIsOpen(true);
                        }}
                        onFocus={() => setIsOpen(true)}
                        onKeyDown={handleKeyDown}
                        placeholder={placeholder}
                        autoFocus={autoFocus}
                        autoComplete="off"
                        className="flex-1 bg-transparent text-white placeholder-gray-500 outline-none text-base"
                    />

                    {/* Clear button */}
                    {query && (
                        <button
                            onClick={() => {
                                setQuery('');
                                setResults([]);
                                inputRef.current?.focus();
                            }}
                            className="p-1 text-gray-500 hover:text-white transition-colors"
                        >
                            <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <path d="M18 6L6 18M6 6l12 12" />
                            </svg>
                        </button>
                    )}

                    {/* Search button */}
                    <button
                        onClick={() => {
                            if (query.length >= 2) {
                                saveRecentSearch(query);
                                window.location.href = `/search?q=${encodeURIComponent(query)}`;
                            }
                        }}
                        className="px-4 py-2 bg-purple-600 hover:bg-purple-500 text-white text-sm font-semibold rounded-lg transition-colors"
                    >
                        Search
                    </button>
                </div>

                {/* Dropdown */}
                {isOpen && (
                    <div className="absolute top-full left-0 right-0 mt-2 bg-[#1a1a2e] border border-white/10 rounded-xl shadow-2xl overflow-hidden z-50">
                        {/* Quick Filters */}
                        {showFilters && (
                            <div className="px-4 py-3 border-b border-white/5">
                                <div className="flex items-center gap-2 overflow-x-auto pb-1">
                                    <span className="text-xs text-gray-500 flex-shrink-0">Quick filters:</span>
                                    {QUICK_FILTERS.map(filter => (
                                        <button
                                            key={filter.value}
                                            onClick={() => handleFilterClick(filter.value)}
                                            className={`
                                                flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium
                                                transition-all whitespace-nowrap
                                                ${activeFilter === filter.value
                                                    ? 'bg-purple-600 text-white'
                                                    : 'bg-white/5 text-gray-400 hover:bg-white/10 hover:text-white'
                                                }
                                            `}
                                        >
                                            <span>{filter.icon}</span>
                                            <span>{filter.label}</span>
                                        </button>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Error State */}
                        {error && (
                            <div className="px-4 py-3 text-red-400 text-sm">
                                {error}
                            </div>
                        )}

                        {/* Results */}
                        {results.length > 0 && (
                            <div className="py-2">
                                <div className="px-4 py-1.5 text-xs text-gray-500 uppercase tracking-wide">
                                    Results
                                </div>
                                {results.map((result, index) => {
                                    const styles = tierStyles[result.tier] || tierStyles.UNRANKED;
                                    const location = [result.city, result.country].filter(Boolean).join(', ');

                                    return (
                                        <button
                                            key={result.slug}
                                            onClick={() => handleResultClick(result)}
                                            className={`
                                                w-full flex items-center gap-3 px-4 py-3 text-left
                                                transition-colors
                                                ${selectedIndex === index ? 'bg-white/10' : 'hover:bg-white/5'}
                                            `}
                                        >
                                            {/* Avatar */}
                                            <div className={`
                                                w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0
                                                border ${styles.border} ${styles.bg}
                                            `}>
                                                {result.portraitUrl && !result.portraitUrl.startsWith('data:') ? (
                                                    <img
                                                        src={result.portraitUrl}
                                                        alt={result.fullName}
                                                        className="w-full h-full object-cover rounded-lg"
                                                    />
                                                ) : (
                                                    <span className={`text-sm font-bold ${styles.text}`}>
                                                        {getInitials(result.fullName)}
                                                    </span>
                                                )}
                                            </div>

                                            {/* Info */}
                                            <div className="flex-1 min-w-0">
                                                <div className="flex items-center gap-2">
                                                    <span className={`font-medium ${result.tier === 'TITAN' ? 'text-yellow-400' : 'text-white'}`}>
                                                        {highlightMatch(result.fullName, query)}
                                                    </span>
                                                    <span className={`
                                                        text-[10px] font-bold px-1.5 py-0.5 rounded
                                                        ${styles.bg} ${styles.text}
                                                    `}>
                                                        {result.tier}
                                                    </span>
                                                </div>
                                                <div className="flex items-center gap-2 text-sm text-gray-400">
                                                    <span>{highlightMatch(result.specialty, query)}</span>
                                                    {location && (
                                                        <>
                                                            <span className="text-gray-600">•</span>
                                                            <span className="text-gray-500">{location}</span>
                                                        </>
                                                    )}
                                                </div>
                                            </div>

                                            {/* H-Index badge */}
                                            {result.hIndex && result.hIndex > 0 && (
                                                <div className="text-xs text-gray-500 flex-shrink-0">
                                                    H-Index: <span className="text-gray-300">{result.hIndex}</span>
                                                </div>
                                            )}

                                            {/* Arrow */}
                                            <svg className="w-4 h-4 text-gray-600 flex-shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                                <path d="M9 18l6-6-6-6" />
                                            </svg>
                                        </button>
                                    );
                                })}

                                {/* View all results link */}
                                {results.length >= maxResults && (
                                    <a
                                        href={`/search?q=${encodeURIComponent(query)}`}
                                        className="block px-4 py-3 text-center text-sm text-purple-400 hover:text-purple-300 hover:bg-white/5 transition-colors"
                                    >
                                        View all results →
                                    </a>
                                )}
                            </div>
                        )}

                        {/* Recent Searches (when no query or no results) */}
                        {query.length < 2 && recentSearches.length > 0 && (
                            <div className="py-2">
                                <div className="px-4 py-1.5 text-xs text-gray-500 uppercase tracking-wide flex items-center justify-between">
                                    <span>Recent Searches</span>
                                    <button
                                        onClick={() => {
                                            setRecentSearches([]);
                                            localStorage.removeItem(RECENT_SEARCHES_KEY);
                                        }}
                                        className="text-gray-600 hover:text-gray-400 transition-colors"
                                    >
                                        Clear all
                                    </button>
                                </div>
                                {recentSearches.map((search, index) => (
                                    <button
                                        key={search}
                                        onClick={() => {
                                            setQuery(search);
                                            fetchResults(search, activeFilter || undefined);
                                        }}
                                        className={`
                                            w-full flex items-center gap-3 px-4 py-2.5 text-left
                                            transition-colors group
                                            ${selectedIndex === index ? 'bg-white/10' : 'hover:bg-white/5'}
                                        `}
                                    >
                                        <svg className="w-4 h-4 text-gray-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                            <path d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                        </svg>
                                        <span className="flex-1 text-gray-300">{search}</span>
                                        <button
                                            onClick={(e) => clearRecentSearch(search, e)}
                                            className="p-1 text-gray-600 hover:text-gray-400 opacity-0 group-hover:opacity-100 transition-all"
                                        >
                                            <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                                <path d="M18 6L6 18M6 6l12 12" />
                                            </svg>
                                        </button>
                                    </button>
                                ))}
                            </div>
                        )}

                        {/* No Results */}
                        {query.length >= 2 && results.length === 0 && !isLoading && !error && (
                            <div className="px-4 py-8 text-center">
                                <svg className="w-12 h-12 mx-auto text-gray-600 mb-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                                    <circle cx="11" cy="11" r="8" />
                                    <path d="m21 21-4.3-4.3" />
                                </svg>
                                <p className="text-gray-400 mb-1">No results found for "{query}"</p>
                                <p className="text-sm text-gray-500">Try a different search term or browse by specialty</p>
                            </div>
                        )}

                        {/* Keyboard hints */}
                        <div className="px-4 py-2 border-t border-white/5 flex items-center gap-4 text-xs text-gray-600">
                            <span className="flex items-center gap-1">
                                <kbd className="px-1.5 py-0.5 bg-white/5 rounded">↑</kbd>
                                <kbd className="px-1.5 py-0.5 bg-white/5 rounded">↓</kbd>
                                <span>Navigate</span>
                            </span>
                            <span className="flex items-center gap-1">
                                <kbd className="px-1.5 py-0.5 bg-white/5 rounded">Enter</kbd>
                                <span>Select</span>
                            </span>
                            <span className="flex items-center gap-1">
                                <kbd className="px-1.5 py-0.5 bg-white/5 rounded">Esc</kbd>
                                <span>Close</span>
                            </span>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
