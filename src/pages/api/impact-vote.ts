/**
 * MDRPedia — Impact Vote API
 * Allows users to indicate they've been positively impacted by a professional
 *
 * POST: Submit a vote
 * GET: Get vote count for a profile
 */

import type { APIRoute } from 'astro';
import { prisma } from '../../lib/prisma';
import { createLogger } from '../../lib/logger';
import { getClientIP } from '../../lib/utils';
import crypto from 'crypto';

export const prerender = false;

const log = createLogger('ImpactVote');

// Rate limiting: max votes per IP per hour
const VOTES_PER_HOUR = 10;
const voteRateLimit = new Map<string, { count: number; resetAt: number }>();

// Hash IP for privacy
function hashIP(ip: string): string {
    const salt = import.meta.env.IP_HASH_SALT || 'mdrpedia-impact-vote-salt';
    return crypto.createHash('sha256').update(ip + salt).digest('hex');
}

// Check rate limit
function checkRateLimit(ipHash: string): { allowed: boolean; remaining: number } {
    const now = Date.now();
    const hourMs = 60 * 60 * 1000;

    const limit = voteRateLimit.get(ipHash);
    if (!limit || now > limit.resetAt) {
        voteRateLimit.set(ipHash, { count: 1, resetAt: now + hourMs });
        return { allowed: true, remaining: VOTES_PER_HOUR - 1 };
    }

    if (limit.count >= VOTES_PER_HOUR) {
        return { allowed: false, remaining: 0 };
    }

    limit.count++;
    return { allowed: true, remaining: VOTES_PER_HOUR - limit.count };
}

// Valid vote types
const VALID_VOTE_TYPES = [
    'LIFE_CHANGED',
    'SAVED_LIFE',
    'EXCELLENT_CARE',
    'HIGHLY_SKILLED',
    'MENTOR',
    'RESEARCHER',
] as const;

// GET: Get vote count for a profile
export const GET: APIRoute = async ({ request }) => {
    const url = new URL(request.url);
    const profileId = url.searchParams.get('profileId');
    const slug = url.searchParams.get('slug');

    if (!profileId && !slug) {
        return new Response(JSON.stringify({ error: 'profileId or slug required' }), {
            status: 400,
            headers: { 'Content-Type': 'application/json' }
        });
    }

    try {
        // Get profile ID from slug if needed
        let resolvedProfileId = profileId;
        if (!resolvedProfileId && slug) {
            const profile = await prisma.profile.findUnique({
                where: { slug },
                select: { id: true }
            });
            if (!profile) {
                return new Response(JSON.stringify({ error: 'Profile not found' }), {
                    status: 404,
                    headers: { 'Content-Type': 'application/json' }
                });
            }
            resolvedProfileId = profile.id;
        }

        // Get vote counts by type
        const votes = await prisma.impactVote.groupBy({
            by: ['vote_type'],
            where: { profile_id: resolvedProfileId! },
            _count: true
        });

        // Get total count
        const totalCount = await prisma.impactVote.count({
            where: { profile_id: resolvedProfileId! }
        });

        // Get recent testimonials (non-anonymous with messages)
        const testimonials = await prisma.impactVote.findMany({
            where: {
                profile_id: resolvedProfileId!,
                is_anonymous: false,
                message: { not: null },
                is_verified: true
            },
            select: {
                vote_type: true,
                message: true,
                voter_name: true,
                voter_role: true,
                createdAt: true
            },
            orderBy: { createdAt: 'desc' },
            take: 5
        });

        // Check if current user has voted
        const ip = getClientIP(request);
        const ipHash = hashIP(ip);
        const userVote = await prisma.impactVote.findUnique({
            where: {
                profile_id_ip_hash: {
                    profile_id: resolvedProfileId!,
                    ip_hash: ipHash
                }
            },
            select: { vote_type: true }
        });

        const voteCounts: Record<string, number> = {};
        for (const v of votes) {
            voteCounts[v.vote_type] = v._count;
        }

        return new Response(JSON.stringify({
            totalCount,
            voteCounts,
            testimonials,
            userHasVoted: !!userVote,
            userVoteType: userVote?.vote_type || null
        }), {
            status: 200,
            headers: { 'Content-Type': 'application/json' }
        });

    } catch (error) {
        log.error('Failed to get impact votes', { error });
        return new Response(JSON.stringify({ error: 'Failed to get votes' }), {
            status: 500,
            headers: { 'Content-Type': 'application/json' }
        });
    }
};

// POST: Submit a vote
export const POST: APIRoute = async ({ request }) => {
    try {
        const body = await request.json();
        const { profileId, slug, voteType, message, voterName, voterRole, isAnonymous = true } = body;

        // Validate input
        if (!profileId && !slug) {
            return new Response(JSON.stringify({ error: 'profileId or slug required' }), {
                status: 400,
                headers: { 'Content-Type': 'application/json' }
            });
        }

        if (!voteType || !VALID_VOTE_TYPES.includes(voteType)) {
            return new Response(JSON.stringify({
                error: 'Invalid vote type',
                validTypes: VALID_VOTE_TYPES
            }), {
                status: 400,
                headers: { 'Content-Type': 'application/json' }
            });
        }

        // Rate limiting
        const ip = getClientIP(request);
        const ipHash = hashIP(ip);
        const rateCheck = checkRateLimit(ipHash);

        if (!rateCheck.allowed) {
            return new Response(JSON.stringify({
                error: 'Rate limit exceeded. Please try again later.',
                retryAfter: 3600
            }), {
                status: 429,
                headers: {
                    'Content-Type': 'application/json',
                    'Retry-After': '3600'
                }
            });
        }

        // Get profile ID from slug if needed
        let resolvedProfileId = profileId;
        if (!resolvedProfileId && slug) {
            const profile = await prisma.profile.findUnique({
                where: { slug },
                select: { id: true }
            });
            if (!profile) {
                return new Response(JSON.stringify({ error: 'Profile not found' }), {
                    status: 404,
                    headers: { 'Content-Type': 'application/json' }
                });
            }
            resolvedProfileId = profile.id;
        }

        // Check if already voted
        const existingVote = await prisma.impactVote.findUnique({
            where: {
                profile_id_ip_hash: {
                    profile_id: resolvedProfileId,
                    ip_hash: ipHash
                }
            }
        });

        if (existingVote) {
            // Update existing vote
            const updated = await prisma.impactVote.update({
                where: { id: existingVote.id },
                data: {
                    vote_type: voteType,
                    message: message?.slice(0, 500) || null,
                    voter_name: isAnonymous ? null : voterName?.slice(0, 100),
                    voter_role: voterRole?.slice(0, 50),
                    is_anonymous: isAnonymous
                }
            });

            return new Response(JSON.stringify({
                success: true,
                action: 'updated',
                vote: {
                    id: updated.id,
                    voteType: updated.vote_type
                }
            }), {
                status: 200,
                headers: { 'Content-Type': 'application/json' }
            });
        }

        // Create new vote
        const vote = await prisma.impactVote.create({
            data: {
                profile_id: resolvedProfileId,
                ip_hash: ipHash,
                vote_type: voteType,
                message: message?.slice(0, 500) || null,
                voter_name: isAnonymous ? null : voterName?.slice(0, 100),
                voter_role: voterRole?.slice(0, 50),
                is_anonymous: isAnonymous,
                is_verified: false // Requires manual verification
            }
        });

        log.info('Impact vote submitted', { profileId: resolvedProfileId, voteType });

        // Get updated count
        const totalCount = await prisma.impactVote.count({
            where: { profile_id: resolvedProfileId }
        });

        return new Response(JSON.stringify({
            success: true,
            action: 'created',
            vote: {
                id: vote.id,
                voteType: vote.vote_type
            },
            totalCount
        }), {
            status: 201,
            headers: { 'Content-Type': 'application/json' }
        });

    } catch (error) {
        log.error('Failed to submit impact vote', { error });
        return new Response(JSON.stringify({ error: 'Failed to submit vote' }), {
            status: 500,
            headers: { 'Content-Type': 'application/json' }
        });
    }
};

// DELETE: Remove a vote
export const DELETE: APIRoute = async ({ request }) => {
    const url = new URL(request.url);
    const profileId = url.searchParams.get('profileId');
    const slug = url.searchParams.get('slug');

    if (!profileId && !slug) {
        return new Response(JSON.stringify({ error: 'profileId or slug required' }), {
            status: 400,
            headers: { 'Content-Type': 'application/json' }
        });
    }

    try {
        const ip = getClientIP(request);
        const ipHash = hashIP(ip);

        // Get profile ID from slug if needed
        let resolvedProfileId = profileId;
        if (!resolvedProfileId && slug) {
            const profile = await prisma.profile.findUnique({
                where: { slug },
                select: { id: true }
            });
            if (!profile) {
                return new Response(JSON.stringify({ error: 'Profile not found' }), {
                    status: 404,
                    headers: { 'Content-Type': 'application/json' }
                });
            }
            resolvedProfileId = profile.id;
        }

        // Delete vote
        await prisma.impactVote.deleteMany({
            where: {
                profile_id: resolvedProfileId!,
                ip_hash: ipHash
            }
        });

        return new Response(JSON.stringify({ success: true }), {
            status: 200,
            headers: { 'Content-Type': 'application/json' }
        });

    } catch (error) {
        log.error('Failed to delete impact vote', { error });
        return new Response(JSON.stringify({ error: 'Failed to delete vote' }), {
            status: 500,
            headers: { 'Content-Type': 'application/json' }
        });
    }
};
