
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const CONTENT_DIR = path.join(__dirname, '../src/content/doctors');

interface Doctor {
    slug: string; // Filename without extension
    fullName: string;
    openalexId?: string;
    citations?: any[];
    biography?: string;
    awards?: any[];
}

function scanProfiles() {
    const files = fs.readdirSync(CONTENT_DIR).filter(f => f.endsWith('.json'));
    const emptyProfiles: Doctor[] = [];
    const richProfiles: Doctor[] = [];

    console.log(`Scanning ${files.length} profiles...`);

    for (const file of files) {
        try {
            const content = fs.readFileSync(path.join(CONTENT_DIR, file), 'utf-8');
            const data = JSON.parse(content);
            const slug = file.replace('.json', '');

            const hasCitations = data.citations && data.citations.length > 0;
            const hasBio = data.biography && data.biography.length > 50;
            const hasOpenAlex = !!data.openalexId;

            if (!hasCitations || !hasBio) {
                emptyProfiles.push({
                    slug,
                    fullName: data.fullName,
                    openalexId: data.openalexId,
                    citations: data.citations || [],
                    biography: data.biography,
                    awards: data.awards
                });
            } else {
                richProfiles.push({ slug, fullName: data.fullName });
            }
        } catch (e) {
            console.error(`Error parsing ${file}:`, e);
        }
    }

    console.log(`\nFound ${emptyProfiles.length} profiles needing enrichment.`);

    // Sort by priority: Has OpenAlex ID > No Citations
    const prioritised = emptyProfiles.sort((a, b) => {
        if (a.openalexId && !b.openalexId) return -1;
        if (!a.openalexId && b.openalexId) return 1;
        return 0;
    });

    console.log('\n--- Priority Enrichment Targets (Has OpenAlex ID but missing data) ---');
    prioritised.filter(p => p.openalexId).forEach(p => {
        console.log(`[${p.slug}] ${p.fullName} | OpenAlex: YES | Citations: ${p.citations?.length || 0} | Bio: ${p.biography?.length || 0} chars`);
    });

    console.log('\n--- Other Empty Profiles (No OpenAlex ID) ---');
    prioritised.filter(p => !p.openalexId).slice(0, 10).forEach(p => {
        console.log(`[${p.slug}] ${p.fullName} | OpenAlex: NO | Citations: ${p.citations?.length || 0} | Bio: ${p.biography?.length || 0} chars`);
    });
    if (prioritised.filter(p => !p.openalexId).length > 10) {
        console.log(`... and ${prioritised.filter(p => !p.openalexId).length - 10} more.`);
    }
}

scanProfiles();
