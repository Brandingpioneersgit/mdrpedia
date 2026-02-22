// ============================================================================
// MDRPedia — AI-Optimized Content Types
// TypeScript interfaces for AI crawler-friendly content structures
// ============================================================================

/**
 * ELI5 (Explain Like I'm 5) vs Clinical Summary
 * Dual-mode descriptions for different audience comprehension levels
 */
export interface DualSummary {
    /** Simple explanation accessible to general public (ELI5) */
    eli5Summary: string;
    /** Clinical/technical explanation for medical professionals */
    clinicalSummary: string;
}

/**
 * Instrument used in a medical technique/procedure
 */
export interface TechniqueInstrument {
    name: string;
    purpose?: string;
    isSpecialized?: boolean;
}

/**
 * Individual step in a technique breakdown
 */
export interface TechniqueStep {
    stepNumber: number;
    title: string;
    description: string;
    duration?: string;
    instruments?: TechniqueInstrument[];
    risks?: string[];
    criticalPoints?: string[];
}

/**
 * Complete breakdown of a medical technique/procedure
 */
export interface TechniqueBreakdown {
    techniqueName: string;
    inventedBy?: string;
    yearInvented?: number;
    totalDuration?: string;
    complexity: 'LOW' | 'MEDIUM' | 'HIGH' | 'VERY_HIGH';
    eli5Summary: string;
    clinicalSummary: string;
    steps: TechniqueStep[];
    instruments: TechniqueInstrument[];
    outcomes: {
        successRate?: number;
        recoveryTime?: string;
        complications?: string[];
    };
    relatedTechniques?: string[];
    sourceUrl?: string;
    lastVerified?: string;
}

/**
 * Verification status for claims
 */
export type VerificationStatus = 'VERIFIED' | 'PARTIALLY_VERIFIED' | 'UNVERIFIED' | 'DISPUTED';

/**
 * Citation source for verified claims
 */
export interface ClaimSource {
    type: 'DOI' | 'PUBMED' | 'INSTITUTION' | 'AWARD_BODY' | 'NEWS' | 'OTHER';
    identifier: string;
    url?: string;
    title?: string;
    date?: string;
}

/**
 * Verified claim with fact-checking metadata
 */
export interface VerifiedClaim {
    claim: string;
    claimType: 'INVENTION' | 'ACHIEVEMENT' | 'STATISTIC' | 'AFFILIATION' | 'AWARD' | 'PUBLICATION' | 'OTHER';
    status: VerificationStatus;
    verificationDate?: string;
    sources: ClaimSource[];
    context?: string;
    confidence?: number; // 0-100
    reviewedBy?: string;
}

/**
 * Enhanced FAQ with categorization
 */
export interface EnhancedFAQ {
    question: string;
    answer: string;
    category: 'GENERAL' | 'EXPERTISE' | 'CREDENTIALS' | 'RESEARCH' | 'PROCEDURES' | 'CONTACT' | 'HISTORY';
    priority: number; // Lower = more important
    relatedTopics?: string[];
    lastUpdated?: string;
    sources?: ClaimSource[];
}

/**
 * Single entry in impact time series
 */
export interface ImpactTimeSeriesEntry {
    year: number;
    livesSaved?: number;
    proceduresPerformed?: number;
    citationCount?: number;
    patientsServed?: number;
    studentsmentored?: number;
    notes?: string;
}

/**
 * Scientific consensus evolution event
 */
export interface ConsensusEvent {
    date: string;
    status: 'PROPOSED' | 'DEBATED' | 'EMERGING' | 'ACCEPTED' | 'GOLD_STANDARD' | 'SUPERSEDED' | 'DISPROVEN';
    title: string;
    description: string;
    supportingEvidence?: string[];
    opposingViews?: string[];
    keyFigures?: string[];
    sourceUrl?: string;
}

/**
 * Scientific controversies timeline
 */
export interface ControversyTimeline {
    topic: string;
    currentStatus: ConsensusEvent['status'];
    events: ConsensusEvent[];
    relatedTechniques?: string[];
    relatedConditions?: string[];
}

/**
 * Common misconception with correction
 */
export interface Misconception {
    myth: string;
    reality: string;
    category: 'TECHNIQUE' | 'CREDENTIALS' | 'STATISTICS' | 'HISTORY' | 'ATTRIBUTION' | 'GENERAL';
    commonSources?: string[];
    correctionSources?: ClaimSource[];
    importance: 'LOW' | 'MEDIUM' | 'HIGH';
}

/**
 * Step in a clinical decision scenario
 */
export interface ScenarioStep {
    stepNumber: number;
    situation: string;
    options: {
        choice: string;
        outcome: string;
        isOptimal: boolean;
        reasoning?: string;
    }[];
    expertInsight?: string;
}

/**
 * Clinical "What If" scenario for chain-of-thought analysis
 */
export interface ClinicalScenario {
    id: string;
    title: string;
    patientPresentation: string;
    relevantCondition: string;
    complexity: 'BASIC' | 'INTERMEDIATE' | 'ADVANCED' | 'EXPERT';
    steps: ScenarioStep[];
    expertApproach: string;
    keyLearnings: string[];
    relatedTechniques?: string[];
    disclaimers?: string[];
}

/**
 * Extended ProfileData fields for AI content
 * These fields extend the existing ProfileData interface
 */
export interface AIContentExtensions {
    // Dual summaries
    eli5Summary?: string;
    clinicalSummary?: string;

    // Technique breakdowns
    techniqueBreakdowns?: TechniqueBreakdown[];

    // Verified claims
    verifiedClaims?: VerifiedClaim[];

    // Enhanced FAQs
    faqs?: EnhancedFAQ[];

    // Impact over time
    impactTimeSeries?: ImpactTimeSeriesEntry[];

    // Controversies & consensus evolution
    consensusTimeline?: ControversyTimeline[];

    // Common misconceptions
    misconceptions?: Misconception[];

    // Clinical scenarios
    clinicalScenarios?: ClinicalScenario[];
}

/**
 * Type guard to check if profile has AI content
 */
export function hasAIContent(profile: Partial<AIContentExtensions>): boolean {
    return !!(
        profile.eli5Summary ||
        profile.clinicalSummary ||
        profile.techniqueBreakdowns?.length ||
        profile.verifiedClaims?.length ||
        profile.faqs?.length ||
        profile.impactTimeSeries?.length ||
        profile.consensusTimeline?.length ||
        profile.misconceptions?.length ||
        profile.clinicalScenarios?.length
    );
}

/**
 * Complexity level labels for display
 */
export const COMPLEXITY_LABELS: Record<TechniqueBreakdown['complexity'], string> = {
    LOW: 'Routine Procedure',
    MEDIUM: 'Moderate Complexity',
    HIGH: 'Complex Procedure',
    VERY_HIGH: 'Highly Complex / Specialized',
};

/**
 * Consensus status labels for display
 */
export const CONSENSUS_STATUS_LABELS: Record<ConsensusEvent['status'], string> = {
    PROPOSED: 'Initially Proposed',
    DEBATED: 'Under Debate',
    EMERGING: 'Emerging Consensus',
    ACCEPTED: 'Widely Accepted',
    GOLD_STANDARD: 'Gold Standard',
    SUPERSEDED: 'Superseded',
    DISPROVEN: 'Disproven',
};

/**
 * Verification status labels and colors
 */
export const VERIFICATION_STATUS_CONFIG: Record<VerificationStatus, { label: string; color: string }> = {
    VERIFIED: { label: 'Verified', color: '#10b981' },
    PARTIALLY_VERIFIED: { label: 'Partially Verified', color: '#f59e0b' },
    UNVERIFIED: { label: 'Unverified', color: '#6b7280' },
    DISPUTED: { label: 'Disputed', color: '#ef4444' },
};

/**
 * FAQ category labels
 */
export const FAQ_CATEGORY_LABELS: Record<EnhancedFAQ['category'], string> = {
    GENERAL: 'General',
    EXPERTISE: 'Expertise',
    CREDENTIALS: 'Credentials',
    RESEARCH: 'Research',
    PROCEDURES: 'Procedures',
    CONTACT: 'Contact',
    HISTORY: 'History',
};

// ============================================================================
// Extended AI Content Types (Phase 2)
// Additional structures for enhanced AI crawler optimization
// ============================================================================

/**
 * Medical Mentorship/Genealogy Link
 * Represents a mentor-mentee relationship in medical training
 */
export interface MentorLink {
    name: string;
    slug?: string;
    role: 'MENTOR' | 'MENTEE' | 'COLLABORATOR' | 'CO_INVENTOR';
    relationship: string; // e.g., "PhD Advisor", "Surgical Fellow", "Research Collaborator"
    institution?: string;
    period?: string; // e.g., "1985-1989"
    notableContributions?: string[];
    isOnMDRPedia?: boolean;
}

/**
 * Medical Mentorship Tree / Genealogy
 * Tracks academic and clinical lineage
 */
export interface MedicalMentorshipTree {
    subject: string; // The doctor this tree is about
    mentors: MentorLink[];
    mentees: MentorLink[];
    academicLineage?: string[]; // Chain back to notable historical figures
    collaborativeNetwork?: MentorLink[];
    totalMenteesCount?: number;
    notableMenteesCount?: number;
    generationsInfluenced?: number;
}

/**
 * Dense Citation Context
 * Why a paper was cited, not just that it was cited
 */
export interface CitationContext {
    citingPaperId: string;
    citingPaperTitle: string;
    citingPaperYear: number;
    citedPaperId: string;
    citedPaperTitle: string;
    citationReason: 'METHODOLOGY' | 'FOUNDATION' | 'COMPARISON' | 'VALIDATION' | 'EXTENSION' | 'CRITICISM' | 'CLINICAL_APPLICATION';
    citationContext: string; // The actual sentence/paragraph where citation appears
    impactCategory: 'SEMINAL' | 'SIGNIFICANT' | 'SUPPORTING' | 'MINOR';
    citingAuthors?: string[];
    journalName?: string;
}

/**
 * Aggregated citation context summary
 */
export interface CitationContextSummary {
    totalCitations: number;
    citationsByReason: Record<CitationContext['citationReason'], number>;
    citationsByImpact: Record<CitationContext['impactCategory'], number>;
    topCitingPapers: CitationContext[];
    seminalCitations: CitationContext[];
    yearlyTrend?: { year: number; count: number }[];
}

/**
 * Failure Analysis / Superseded Procedure
 * Documents what was learned from procedures that didn't work
 */
export interface FailureAnalysis {
    procedureName: string;
    yearIntroduced?: number;
    yearSuperseded?: number;
    originalRationale: string;
    reasonForFailure: 'SAFETY_CONCERNS' | 'BETTER_ALTERNATIVE' | 'LIMITED_EFFICACY' | 'COMPLICATIONS' | 'TECHNOLOGICAL_ADVANCEMENT' | 'COST_PROHIBITIVE';
    lessonsLearned: string[];
    successorProcedure?: string;
    patientOutcomes?: string;
    scientificContribution: string; // What we learned even from failure
    references?: ClaimSource[];
}

/**
 * Standardized Medical Lexicon Tags
 * ICD-10, SNOMED CT, MeSH terms
 */
export interface MedicalLexiconTag {
    code: string;
    system: 'ICD10' | 'ICD11' | 'SNOMED_CT' | 'MESH' | 'LOINC' | 'CPT' | 'HCPCS';
    display: string;
    category?: string;
    parentCodes?: string[];
    relatedCodes?: string[];
}

/**
 * Doctor's medical lexicon profile
 */
export interface MedicalLexiconProfile {
    primaryConditions: MedicalLexiconTag[]; // Main conditions treated
    procedures: MedicalLexiconTag[]; // Procedures performed (CPT/HCPCS)
    researchTopics: MedicalLexiconTag[]; // MeSH terms from publications
    anatomicalFocus?: MedicalLexiconTag[]; // Body systems/organs
    subspecialtyTerms?: MedicalLexiconTag[];
}

/**
 * Future Outlook / Predictions
 * Where the field is heading
 */
export interface FutureOutlookPrediction {
    prediction: string;
    timeframe: '1_YEAR' | '3_YEARS' | '5_YEARS' | '10_YEARS' | 'UNKNOWN';
    confidence: 'LOW' | 'MEDIUM' | 'HIGH';
    category: 'TECHNOLOGY' | 'TREATMENT' | 'RESEARCH' | 'POLICY' | 'TRAINING' | 'ACCESSIBILITY';
    supportingTrends?: string[];
    potentialBarriers?: string[];
    relatedInnovations?: string[];
}

/**
 * Doctor's future outlook section
 */
export interface FutureOutlook {
    doctorPerspective?: string; // Direct quote or paraphrased view
    fieldPredictions: FutureOutlookPrediction[];
    emergingTechnologies?: string[];
    upcomingResearch?: string[];
    legacyProjections?: string; // How their work might evolve
}

/**
 * Patient Journey Stage
 */
export interface PatientJourneyStage {
    stageNumber: number;
    stageName: string;
    timeframe?: string; // e.g., "Day 0", "Week 1-2", "Month 3-6"
    description: string;
    doctorRole: string; // What the doctor does at this stage
    patientExperience: string;
    clinicalMilestones?: string[];
    commonChallenges?: string[];
    successIndicators?: string[];
}

/**
 * Patient Journey Map
 * Chronological patient experience through treatment
 */
export interface PatientJourneyMap {
    conditionName: string;
    procedureName?: string;
    totalDuration?: string;
    stages: PatientJourneyStage[];
    outcomeStatistics?: {
        successRate?: number;
        averageRecoveryTime?: string;
        qualityOfLifeImprovement?: string;
    };
    patientTestimonialThemes?: string[];
    disclaimer?: string;
}

/**
 * Comparative Analysis Entry
 */
export interface ComparisonEntry {
    name: string;
    slug?: string;
    isSubject?: boolean; // Is this the doctor being profiled?
    values: Record<string, string | number | boolean | null>;
}

/**
 * Comparative Analysis Matrix
 * Doctor vs peers, technique vs alternatives
 */
export interface ComparativeMatrix {
    title: string;
    comparisonType: 'DOCTORS' | 'TECHNIQUES' | 'INSTITUTIONS' | 'OUTCOMES';
    metrics: {
        key: string;
        label: string;
        unit?: string;
        higherIsBetter?: boolean;
    }[];
    entries: ComparisonEntry[];
    notes?: string;
    dataSource?: string;
    lastUpdated?: string;
}

/**
 * Raw Data Export Configuration
 */
export interface DataExportConfig {
    availableFormats: ('JSON' | 'CSV' | 'XML' | 'RDF')[];
    dataCategories: {
        key: string;
        label: string;
        description: string;
        isAvailable: boolean;
    }[];
    apiEndpoint?: string;
    termsOfUse?: string;
    citationFormat?: string;
}

/**
 * Key Insight
 */
export interface KeyInsight {
    insight: string;
    category: 'ACHIEVEMENT' | 'INNOVATION' | 'IMPACT' | 'EXPERTISE' | 'RECOGNITION' | 'LEADERSHIP';
    evidence?: string;
    metric?: {
        value: number | string;
        label: string;
    };
    source?: ClaimSource;
}

/**
 * Key Insights Summary
 * Bullet-point takeaways for quick consumption
 */
export interface KeyInsightsSummary {
    oneLiner: string; // Single sentence summary
    topInsights: KeyInsight[];
    quickStats: {
        label: string;
        value: string | number;
        icon?: string;
    }[];
    notableFor: string[]; // "Known for X, Y, Z"
    aiGeneratedSummary?: string;
    lastUpdated?: string;
}

/**
 * Institutional Connection
 */
export interface InstitutionalConnection {
    institutionName: string;
    institutionSlug?: string;
    institutionType: 'HOSPITAL' | 'UNIVERSITY' | 'RESEARCH_CENTER' | 'GOVERNMENT' | 'NONPROFIT' | 'COMPANY';
    role: string;
    period?: string;
    isCurrent: boolean;
    location: {
        city?: string;
        country: string;
        region?: string;
    };
    collaborators?: string[];
    notableProjects?: string[];
}

/**
 * Geographic Influence Region
 */
export interface GeographicInfluence {
    region: string;
    country?: string;
    influenceType: 'TRAINED_DOCTORS' | 'PERFORMED_PROCEDURES' | 'RESEARCH_COLLABORATION' | 'POLICY_INFLUENCE' | 'HUMANITARIAN';
    impactLevel: 'LOCAL' | 'NATIONAL' | 'REGIONAL' | 'GLOBAL';
    metrics?: {
        label: string;
        value: number | string;
    }[];
    description?: string;
}

/**
 * Institutional & Geographic Ecosystem
 */
export interface InstitutionalEcosystem {
    currentAffiliations: InstitutionalConnection[];
    pastAffiliations: InstitutionalConnection[];
    geographicInfluence: GeographicInfluence[];
    globalReach: {
        countriesInfluenced: number;
        continentsActive: string[];
        internationalCollaborations: number;
    };
    institutionalLegacy?: string; // Named positions, founded departments, etc.
}

/**
 * Extended AI Content Extensions (Phase 2)
 */
export interface AIContentExtensionsV2 extends AIContentExtensions {
    // Medical genealogy
    mentorshipTree?: MedicalMentorshipTree;

    // Citation context
    citationContexts?: CitationContextSummary;

    // Failure analysis
    failureAnalyses?: FailureAnalysis[];

    // Medical lexicon
    medicalLexicon?: MedicalLexiconProfile;

    // Future outlook
    futureOutlook?: FutureOutlook;

    // Patient journey
    patientJourneys?: PatientJourneyMap[];

    // Comparative matrices
    comparativeMatrices?: ComparativeMatrix[];

    // Data export config
    dataExportConfig?: DataExportConfig;

    // Key insights
    keyInsights?: KeyInsightsSummary;

    // Institutional ecosystem
    institutionalEcosystem?: InstitutionalEcosystem;
}

/**
 * Type guard for V2 AI content
 */
export function hasAIContentV2(profile: Partial<AIContentExtensionsV2>): boolean {
    return hasAIContent(profile) || !!(
        profile.mentorshipTree ||
        profile.citationContexts ||
        profile.failureAnalyses?.length ||
        profile.medicalLexicon ||
        profile.futureOutlook ||
        profile.patientJourneys?.length ||
        profile.comparativeMatrices?.length ||
        profile.dataExportConfig ||
        profile.keyInsights ||
        profile.institutionalEcosystem
    );
}

/**
 * Timeframe labels
 */
export const TIMEFRAME_LABELS: Record<FutureOutlookPrediction['timeframe'], string> = {
    '1_YEAR': 'Within 1 Year',
    '3_YEARS': '1-3 Years',
    '5_YEARS': '3-5 Years',
    '10_YEARS': '5-10 Years',
    'UNKNOWN': 'Timeline Uncertain',
};

/**
 * Citation reason labels
 */
export const CITATION_REASON_LABELS: Record<CitationContext['citationReason'], string> = {
    METHODOLOGY: 'Methodology Reference',
    FOUNDATION: 'Foundational Work',
    COMPARISON: 'Comparative Analysis',
    VALIDATION: 'Validation Study',
    EXTENSION: 'Extended Research',
    CRITICISM: 'Critical Analysis',
    CLINICAL_APPLICATION: 'Clinical Application',
};

/**
 * Medical lexicon system labels
 */
export const LEXICON_SYSTEM_LABELS: Record<MedicalLexiconTag['system'], string> = {
    ICD10: 'ICD-10',
    ICD11: 'ICD-11',
    SNOMED_CT: 'SNOMED CT',
    MESH: 'MeSH',
    LOINC: 'LOINC',
    CPT: 'CPT',
    HCPCS: 'HCPCS',
};

// ============================================================================
// Phase 3: Off-Label Tracking & Medical Diffs
// ============================================================================

/**
 * Regulatory approval status for a procedure/drug use
 */
export type ApprovalStatus =
    | 'FDA_APPROVED'
    | 'EMA_APPROVED'
    | 'OFF_LABEL_EXPERIMENTAL'
    | 'OFF_LABEL_STANDARD_PRACTICE'
    | 'INVESTIGATIONAL'
    | 'COMPASSIONATE_USE'
    | 'GRANDFATHERED';

/**
 * Off-Label Use Tracker
 * Documents the evolution from experimental to standard practice
 */
export interface OffLabelUseEntry {
    /** The drug, device, or procedure name */
    name: string;
    /** Original FDA/EMA approved indication */
    originalIndication?: string;
    /** The off-label use pioneered or advocated */
    offLabelUse: string;
    /** Condition being treated off-label */
    conditionTreated: string;
    /** Year this off-label use was first documented/pioneered */
    yearIntroduced?: number;
    /** Current regulatory status */
    currentStatus: ApprovalStatus;
    /** Year it became standard practice (if applicable) */
    yearBecameStandard?: number;
    /** Year it received official approval for this use (if applicable) */
    yearApproved?: number;
    /** Evidence level supporting the off-label use */
    evidenceLevel: 'ANECDOTAL' | 'CASE_SERIES' | 'RETROSPECTIVE' | 'PROSPECTIVE' | 'RCT' | 'META_ANALYSIS';
    /** Key studies that established the off-label use */
    keyStudies?: {
        title: string;
        doi?: string;
        pubmedId?: string;
        year: number;
        journal?: string;
    }[];
    /** The doctor's role in establishing this use */
    doctorContribution: 'PIONEER' | 'EARLY_ADOPTER' | 'KEY_RESEARCHER' | 'GUIDELINE_AUTHOR' | 'ADVOCATE';
    /** Current adoption rate estimate */
    adoptionRate?: 'RARE' | 'UNCOMMON' | 'MODERATE' | 'WIDESPREAD' | 'STANDARD_OF_CARE';
    /** Safety considerations */
    safetyNotes?: string;
    /** Regulatory agency references */
    regulatoryReferences?: {
        agency: 'FDA' | 'EMA' | 'PMDA' | 'TGA' | 'NMPA' | 'OTHER';
        documentType: 'APPROVAL' | 'WARNING' | 'GUIDANCE' | 'LABEL_UPDATE';
        reference: string;
        date?: string;
    }[];
}

/**
 * Off-Label Tracker Summary for a doctor
 */
export interface OffLabelTrackerData {
    /** Total off-label uses pioneered/advocated */
    totalOffLabelUses: number;
    /** Number that became standard practice */
    becameStandardCount: number;
    /** Number that received official approval */
    receivedApprovalCount: number;
    /** Individual entries */
    entries: OffLabelUseEntry[];
}

/**
 * Medical Guideline Diff
 * Shows before/after comparison of how guidelines changed
 */
export interface GuidelineDiff {
    /** The guideline or protocol that changed */
    guidelineName: string;
    /** Issuing organization (e.g., AHA, ACC, NICE) */
    issuingBody: string;
    /** Medical condition or procedure covered */
    condition: string;
    /** The doctor's pivotal research that influenced the change */
    pivotalResearch: {
        title: string;
        doi?: string;
        pubmedId?: string;
        year: number;
        journal?: string;
        citationCount?: number;
    };
    /** What the guideline said BEFORE the change */
    before: {
        recommendation: string;
        evidenceGrade?: string;
        effectiveYear?: number;
        effectiveUntil?: number;
    };
    /** What the guideline says AFTER the change */
    after: {
        recommendation: string;
        evidenceGrade?: string;
        effectiveYear: number;
        stillCurrent: boolean;
    };
    /** Summary of the key change */
    changeSummary: string;
    /** Impact of the change */
    impactDescription?: string;
    /** Estimated patient impact */
    patientImpact?: {
        affectedPopulation?: string;
        estimatedPatientsPerYear?: number;
        outcomeImprovement?: string;
    };
    /** Link to the guideline document */
    guidelineUrl?: string;
    /** When the guideline was updated */
    updateDate: string;
}

/**
 * Medical Diffs Summary for a doctor
 */
export interface MedicalDiffsData {
    /** Total guidelines influenced */
    totalGuidelinesChanged: number;
    /** Major guideline changes (Class I evidence) */
    majorChanges: number;
    /** Individual diffs */
    diffs: GuidelineDiff[];
}

/**
 * Approval status labels
 */
export const APPROVAL_STATUS_LABELS: Record<ApprovalStatus, { label: string; color: string; description: string }> = {
    FDA_APPROVED: { label: 'FDA Approved', color: '#10b981', description: 'Officially approved by the FDA for this indication' },
    EMA_APPROVED: { label: 'EMA Approved', color: '#3b82f6', description: 'Approved by the European Medicines Agency' },
    OFF_LABEL_EXPERIMENTAL: { label: 'Off-Label (Experimental)', color: '#f59e0b', description: 'Used experimentally outside approved indications' },
    OFF_LABEL_STANDARD_PRACTICE: { label: 'Off-Label (Standard Practice)', color: '#8b5cf6', description: 'Commonly used off-label, considered standard of care' },
    INVESTIGATIONAL: { label: 'Investigational', color: '#ec4899', description: 'Under clinical investigation' },
    COMPASSIONATE_USE: { label: 'Compassionate Use', color: '#06b6d4', description: 'Allowed for serious conditions with no alternatives' },
    GRANDFATHERED: { label: 'Grandfathered', color: '#6b7280', description: 'Predates modern approval requirements' },
};

/**
 * Evidence level labels
 */
export const EVIDENCE_LEVEL_LABELS: Record<OffLabelUseEntry['evidenceLevel'], { label: string; grade: string }> = {
    ANECDOTAL: { label: 'Anecdotal Reports', grade: 'V' },
    CASE_SERIES: { label: 'Case Series', grade: 'IV' },
    RETROSPECTIVE: { label: 'Retrospective Study', grade: 'III' },
    PROSPECTIVE: { label: 'Prospective Study', grade: 'II' },
    RCT: { label: 'Randomized Controlled Trial', grade: 'I' },
    META_ANALYSIS: { label: 'Meta-Analysis', grade: 'Ia' },
};
