/**
 * MDRPedia — Performance Middleware
 * Adds caching headers, security headers, and performance optimizations
 */

import { defineMiddleware } from 'astro:middleware';

// Static asset patterns
const STATIC_ASSETS = /\.(js|css|woff2?|ttf|otf|png|jpg|jpeg|gif|webp|avif|svg|ico|mp4|webm)$/i;
const IMMUTABLE_ASSETS = /\/_astro\//;

export const onRequest = defineMiddleware(async ({ request, locals }, next) => {
    const startTime = Date.now();
    const url = new URL(request.url);
    
    // Process the request
    const response = await next();
    
    // Calculate response time
    const responseTime = Date.now() - startTime;
    
    // Clone response to modify headers
    const newHeaders = new Headers(response.headers);
    
    // Add performance timing header
    newHeaders.set('X-Response-Time', `${responseTime}ms`);
    
    // Security headers
    newHeaders.set('X-Content-Type-Options', 'nosniff');
    newHeaders.set('X-Frame-Options', 'SAMEORIGIN');
    newHeaders.set('Referrer-Policy', 'strict-origin-when-cross-origin');
    
    // Cache control based on content type
    if (IMMUTABLE_ASSETS.test(url.pathname)) {
        // Astro hashed assets - cache forever
        newHeaders.set('Cache-Control', 'public, max-age=31536000, immutable');
    } else if (STATIC_ASSETS.test(url.pathname)) {
        // Other static assets - cache for 1 week
        newHeaders.set('Cache-Control', 'public, max-age=604800, stale-while-revalidate=86400');
    } else if (url.pathname.startsWith('/api/')) {
        // API routes - no cache by default
        if (!newHeaders.has('Cache-Control')) {
            newHeaders.set('Cache-Control', 'no-store, must-revalidate');
        }
    } else if (url.pathname === '/' || url.pathname.startsWith('/doctors')) {
        // Dynamic pages - short cache with revalidation
        if (!newHeaders.has('Cache-Control')) {
            newHeaders.set('Cache-Control', 'public, max-age=60, stale-while-revalidate=300');
        }
    }
    
    // Add Link headers for critical resources (preload hints)
    if (response.headers.get('content-type')?.includes('text/html')) {
        const preloadLinks = [
            '</fonts/inter-var.woff2>; rel=preload; as=font; type="font/woff2"; crossorigin',
        ].join(', ');
        
        const existingLink = newHeaders.get('Link');
        newHeaders.set('Link', existingLink ? `${existingLink}, ${preloadLinks}` : preloadLinks);
    }
    
    return new Response(response.body, {
        status: response.status,
        statusText: response.statusText,
        headers: newHeaders
    });
});
