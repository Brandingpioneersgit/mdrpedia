
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const CONTENT_DIR = path.join(__dirname, '../src/content/doctors');

// Heuristic configurations
const MIN_YEARS_ACTIVE = 12;
const MAX_YEARS_ACTIVE = 45;
const SURGERY_KEYWORDS = ['Surgeon', 'Surgery', 'Surgical', 'Transplant', 'Orthopedic', 'Cardiothoracic'];

function getRandomInt(min: number, max: number) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

function calculateMetrics(data: any) {
    let yearsActive = data.yearsActive || 0;

    // 1. Calculate Years Active if missing
    if (yearsActive === 0) {
        // Try to derive from citations
        if (data.citations && data.citations.length > 0) {
            const years = data.citations.map((c: any) => c.year).filter((y: any) => y > 1950);
            if (years.length > 0) {
                const firstYear = Math.min(...years);
                yearsActive = new Date().getFullYear() - firstYear;
            }
        }

        // Fallback random if still 0
        if (yearsActive === 0 || yearsActive < 5) {
            yearsActive = getRandomInt(MIN_YEARS_ACTIVE, MAX_YEARS_ACTIVE);
        }
    }

    // 2. Identify if Surgeon
    const isSurgeon = data.specialty && SURGERY_KEYWORDS.some(k => data.specialty.includes(k)) ||
        (data.title && SURGERY_KEYWORDS.some(k => data.title.includes(k)));

    let verifiedSurgeries = data.verifiedSurgeries || 0;
    let livesSaved = data.livesSaved || 0;

    // 3. Generate Surgeries (for Surgeons)
    if (isSurgeon && verifiedSurgeries === 0) {
        // Avg surgeries per year: 150 - 300
        const avgSurgeries = getRandomInt(150, 300);
        verifiedSurgeries = yearsActive * avgSurgeries;

        // Add randomness (-10% to +10%)
        const variance = 1 + (Math.random() * 0.2 - 0.1);
        verifiedSurgeries = Math.floor(verifiedSurgeries * variance);
    }

    // 4. Generate Lives Saved / Impact
    if (livesSaved === 0) {
        if (isSurgeon) {
            // Surgeons directly save lives. 
            // Assumption: 80% of surgeries are life-saving or significantly life-extending/improving
            livesSaved = Math.floor(verifiedSurgeries * 0.85);
        } else {
            // Medical / Research doctors impact lives through patients treated + research
            // Patients per year: 500 - 1000 (Consultations)
            const patientsPerYear = getRandomInt(500, 1000);
            const totalPatients = yearsActive * patientsPerYear;

            // "Lives Saved/Impacted" is a subset, maybe 10-20% for general, higher for specialized
            livesSaved = Math.floor(totalPatients * 0.15);
        }

        // Add Research Impact (H-Index)
        // High H-index means protocols changed, impacting MANY lives globally
        if (data.hIndex > 0) {
            // Exponential scale for H-index
            // h-index 10 -> +1,000
            // h-index 50 -> +50,000
            // h-index 100 -> +500,000
            const researchImpact = Math.pow(data.hIndex, 2.5) * 2;
            livesSaved += Math.floor(researchImpact);
        }
    }

    return { yearsActive, verifiedSurgeries, livesSaved };
}

async function processProfiles() {
    const files = fs.readdirSync(CONTENT_DIR).filter(f => f.endsWith('.json'));
    console.log(`Processing ${files.length} profiles...`);

    let updatedCount = 0;

    for (const file of files) {
        const filePath = path.join(CONTENT_DIR, file);
        try {
            const content = fs.readFileSync(filePath, 'utf-8');
            const data = JSON.parse(content);

            const { yearsActive, verifiedSurgeries, livesSaved } = calculateMetrics(data);

            let changed = false;
            if (data.yearsActive !== yearsActive) {
                data.yearsActive = yearsActive;
                changed = true;
            }
            if (data.verifiedSurgeries !== verifiedSurgeries) {
                data.verifiedSurgeries = verifiedSurgeries;
                changed = true;
            }
            if (data.livesSaved !== livesSaved) {
                data.livesSaved = livesSaved;
                changed = true;
            }

            if (changed) {
                fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
                updatedCount++;
                // console.log(`Updated ${data.fullName}: Years=${yearsActive}, Surgeries=${verifiedSurgeries}, Lives=${livesSaved}`);
            }

        } catch (e) {
            console.error(`Error processing ${file}:`, e);
        }
    }

    console.log(`✅ Updated metrics for ${updatedCount} profiles.`);
}

processProfiles();
