/**
 * MDRPedia — Fuzzy Search Utilities
 * Provides typo-tolerant search with relevance scoring
 */

/**
 * Calculate Levenshtein distance between two strings
 * Used for fuzzy matching - lower distance = more similar
 */
export function levenshteinDistance(a: string, b: string): number {
    const matrix: number[][] = [];

    // Initialize matrix
    for (let i = 0; i <= b.length; i++) {
        matrix[i] = [i];
    }
    for (let j = 0; j <= a.length; j++) {
        matrix[0][j] = j;
    }

    // Fill matrix
    for (let i = 1; i <= b.length; i++) {
        for (let j = 1; j <= a.length; j++) {
            if (b.charAt(i - 1) === a.charAt(j - 1)) {
                matrix[i][j] = matrix[i - 1][j - 1];
            } else {
                matrix[i][j] = Math.min(
                    matrix[i - 1][j - 1] + 1, // substitution
                    matrix[i][j - 1] + 1,     // insertion
                    matrix[i - 1][j] + 1      // deletion
                );
            }
        }
    }

    return matrix[b.length][a.length];
}

/**
 * Check if a string matches a query with fuzzy tolerance
 * Returns a score from 0-100 (100 = exact match)
 */
export function fuzzyMatch(text: string, query: string): { matches: boolean; score: number; matchedParts: string[] } {
    const textLower = text.toLowerCase();
    const queryLower = query.toLowerCase();

    // Exact match - highest score
    if (textLower === queryLower) {
        return { matches: true, score: 100, matchedParts: [text] };
    }

    // Starts with query - very high score
    if (textLower.startsWith(queryLower)) {
        return { matches: true, score: 95, matchedParts: [text.slice(0, query.length)] };
    }

    // Contains exact query - high score
    const exactIndex = textLower.indexOf(queryLower);
    if (exactIndex !== -1) {
        const score = 80 - (exactIndex * 2); // Penalize matches later in string
        return {
            matches: true,
            score: Math.max(score, 50),
            matchedParts: [text.slice(exactIndex, exactIndex + query.length)]
        };
    }

    // Word-start matching (e.g., "js" matches "John Smith")
    const words = text.split(/\s+/);
    const queryChars = queryLower.split('');
    let charIndex = 0;
    const matchedParts: string[] = [];

    for (const word of words) {
        if (charIndex < queryChars.length && word.toLowerCase().startsWith(queryChars[charIndex])) {
            matchedParts.push(word[0]);
            charIndex++;
        }
    }

    if (charIndex === queryChars.length && queryChars.length >= 2) {
        return { matches: true, score: 70, matchedParts };
    }

    // Fuzzy match using Levenshtein distance
    // Only for queries of 3+ characters to avoid too many false positives
    if (query.length >= 3) {
        // Check each word in the text
        for (const word of words) {
            if (word.length >= 2) {
                const distance = levenshteinDistance(word.toLowerCase(), queryLower);
                const maxDistance = Math.floor(query.length / 3); // Allow 1 typo per 3 chars

                if (distance <= maxDistance) {
                    const score = 60 - (distance * 15);
                    return { matches: true, score: Math.max(score, 30), matchedParts: [word] };
                }
            }
        }

        // Check if query is a fuzzy substring
        for (let i = 0; i <= textLower.length - queryLower.length; i++) {
            const substring = textLower.slice(i, i + queryLower.length);
            const distance = levenshteinDistance(substring, queryLower);
            const maxDistance = Math.floor(query.length / 4);

            if (distance <= maxDistance && distance > 0) {
                const score = 50 - (distance * 10);
                return {
                    matches: true,
                    score: Math.max(score, 25),
                    matchedParts: [text.slice(i, i + query.length)]
                };
            }
        }
    }

    return { matches: false, score: 0, matchedParts: [] };
}

/**
 * Search result with relevance scoring
 */
export interface ScoredResult<T> {
    item: T;
    score: number;
    matchedFields: { field: string; matchedParts: string[] }[];
}

/**
 * Perform fuzzy search across multiple fields
 */
export function fuzzySearchMultiField<T>(
    items: T[],
    query: string,
    fields: { key: keyof T; weight: number }[],
    options: { maxResults?: number; minScore?: number } = {}
): ScoredResult<T>[] {
    const { maxResults = 50, minScore = 20 } = options;

    const results: ScoredResult<T>[] = [];

    for (const item of items) {
        let totalScore = 0;
        let totalWeight = 0;
        const matchedFields: { field: string; matchedParts: string[] }[] = [];

        for (const { key, weight } of fields) {
            const value = item[key];
            if (typeof value === 'string' && value) {
                const { matches, score, matchedParts } = fuzzyMatch(value, query);
                if (matches) {
                    totalScore += score * weight;
                    matchedFields.push({ field: String(key), matchedParts });
                }
                totalWeight += weight;
            }
        }

        const normalizedScore = totalWeight > 0 ? totalScore / totalWeight : 0;

        if (normalizedScore >= minScore) {
            results.push({
                item,
                score: normalizedScore,
                matchedFields
            });
        }
    }

    // Sort by score (descending) and limit results
    return results
        .sort((a, b) => b.score - a.score)
        .slice(0, maxResults);
}

/**
 * Highlight matched parts in text
 */
export function highlightMatches(text: string, query: string): string {
    if (!query || query.length < 2) return text;

    const textLower = text.toLowerCase();
    const queryLower = query.toLowerCase();

    // Find exact matches first
    const index = textLower.indexOf(queryLower);
    if (index !== -1) {
        return (
            text.slice(0, index) +
            '<mark>' + text.slice(index, index + query.length) + '</mark>' +
            text.slice(index + query.length)
        );
    }

    // Highlight word starts for initials matching
    const queryChars = queryLower.split('');
    let charIndex = 0;
    let result = '';
    let i = 0;

    while (i < text.length && charIndex < queryChars.length) {
        const isWordStart = i === 0 || /\s/.test(text[i - 1]);
        if (isWordStart && text[i].toLowerCase() === queryChars[charIndex]) {
            result += '<mark>' + text[i] + '</mark>';
            charIndex++;
        } else {
            result += text[i];
        }
        i++;
    }

    // Add remaining text
    result += text.slice(i);

    return charIndex === queryChars.length ? result : text;
}

/**
 * Get search suggestions based on common queries
 */
export function getSearchSuggestions(
    query: string,
    recentSearches: string[],
    popularSearches: string[]
): string[] {
    if (!query) {
        // Return recent searches when no query
        return recentSearches.slice(0, 5);
    }

    const queryLower = query.toLowerCase();
    const suggestions: string[] = [];

    // Add matching recent searches
    for (const recent of recentSearches) {
        if (recent.toLowerCase().startsWith(queryLower) && !suggestions.includes(recent)) {
            suggestions.push(recent);
        }
    }

    // Add matching popular searches
    for (const popular of popularSearches) {
        if (popular.toLowerCase().includes(queryLower) && !suggestions.includes(popular)) {
            suggestions.push(popular);
        }
    }

    return suggestions.slice(0, 5);
}
