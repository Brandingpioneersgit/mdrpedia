// ============================================================================
// MDRPedia — AI-Optimized Content Components Index
// Export all AI content components for easy importing
// ============================================================================

// Note: Astro components can be imported directly from their .astro files
// This file provides documentation of available components

/**
 * AI-Optimized Content Components for MDRPedia
 *
 * Phase 1 Components (Core):
 * - ELI5Summary.astro - Toggle between Simple/Clinical views
 * - TechniqueBreakdown.astro - Step-by-step procedures with instruments
 * - VerifiedClaims.astro - Fact-checked claims with DOI badges
 * - EnhancedFAQ.astro - Category tabs + expandable Q&A
 * - ImpactMetricsTable.astro - Time-series table with sparklines
 * - ControversiesTimeline.astro - Horizontal consensus evolution
 * - MisconceptionsTable.astro - Myth (red) vs Reality (green) columns
 * - ClinicalScenarios.astro - Interactive decision tree cases
 * - AIContentSchema.astro - JSON-LD schema generator
 *
 * Phase 2 Components (Extended):
 * - MentorshipTree.astro - Medical genealogy / mentorship visualization
 * - CitationContexts.astro - Dense citation context (why papers were cited)
 * - FailureAnalysis.astro - Superseded procedures & lessons learned
 * - MedicalLexiconTags.astro - ICD-10, SNOMED CT, MeSH tags
 * - FutureOutlook.astro - Predictions for field evolution
 * - PatientJourneyMap.astro - Chronological patient experience
 * - ComparativeMatrix.astro - Doctor/technique/outcome comparisons
 * - DataExportPanel.astro - JSON/CSV/XML download options
 * - KeyInsights.astro - Bullet summary of key takeaways
 * - InstitutionalEcosystem.astro - Geographic & institutional connections
 *
 * Usage:
 * ```astro
 * import ELI5Summary from "../components/AI/ELI5Summary.astro";
 * import VerifiedClaims from "../components/AI/VerifiedClaims.astro";
 * import MentorshipTree from "../components/AI/MentorshipTree.astro";
 * // etc.
 * ```
 *
 * Types:
 * Import from src/lib/ai-content-types.ts or src/lib/types.ts
 */

export const AI_COMPONENTS_PHASE1 = [
    'ELI5Summary',
    'TechniqueBreakdown',
    'VerifiedClaims',
    'EnhancedFAQ',
    'ImpactMetricsTable',
    'ControversiesTimeline',
    'MisconceptionsTable',
    'ClinicalScenarios',
    'AIContentSchema',
] as const;

export const AI_COMPONENTS_PHASE2 = [
    'MentorshipTree',
    'CitationContexts',
    'FailureAnalysis',
    'MedicalLexiconTags',
    'FutureOutlook',
    'PatientJourneyMap',
    'ComparativeMatrix',
    'DataExportPanel',
    'KeyInsights',
    'InstitutionalEcosystem',
] as const;

export const AI_COMPONENTS_PHASE3 = [
    'OffLabelTracker',  // Off-label vs FDA-approved usage tracker
    'MedicalDiffs',     // How guidelines changed (before/after diffs)
] as const;

export const AI_COMPONENTS = [
    ...AI_COMPONENTS_PHASE1,
    ...AI_COMPONENTS_PHASE2,
    ...AI_COMPONENTS_PHASE3,
] as const;

export type AIComponentName = typeof AI_COMPONENTS[number];
export type AIComponentPhase1 = typeof AI_COMPONENTS_PHASE1[number];
export type AIComponentPhase2 = typeof AI_COMPONENTS_PHASE2[number];
export type AIComponentPhase3 = typeof AI_COMPONENTS_PHASE3[number];
