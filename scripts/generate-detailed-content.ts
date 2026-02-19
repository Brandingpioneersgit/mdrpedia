
import fs from 'fs';
import path from 'path';
import { glob } from 'glob';

// Load environment variables
// dotenv.config();

const DOCTORS_DIR = path.join(process.cwd(), 'src/content/doctors');
const OPENAI_API_KEY = process.env.OPENAI_API_KEY;

// Rate limiting and state tracking
const STATUS_FILE = path.join(process.cwd(), 'generation_status.json');

async function saveStatus(status: any) {
    fs.writeFileSync(STATUS_FILE, JSON.stringify(status, null, 2));
}

async function loadStatus() {
    if (fs.existsSync(STATUS_FILE)) {
        return JSON.parse(fs.readFileSync(STATUS_FILE, 'utf-8'));
    }
    return { processed: [], errors: [] };
}

async function generateBio(doctor: any): Promise<string | null> {
    if (!OPENAI_API_KEY) {
        console.error('MISSING_KEY: No OpenAI API Key found.');
        return null;
    }

    const prompt = `
    You are an expert medical biographer. Write a comprehensive, 1500-word biography for Dr. ${doctor.fullName}.
    
    Data to use:
    - Specialty: ${doctor.specialty}
    - Sub-specialty: ${doctor.subSpecialty || 'N/A'}
    - Practice: ${doctor.institution?.name || 'Private Practice'}
    - Location: ${doctor.location || 'Unknown'}
    - Known for: ${doctor.bio || 'General medical excellence'}
    
    Structure the biography with the following markdown H2 sections:
    1. **Early Life and Education**: Academic background, early influences.
    2. **Medical Philosophy**: Approach to patient care.
    3. **Key Procedures & Expertise**: Technical skills (${doctor.specialty} focus).
    4. **Research & Contributions**: Any academic work (infer common practices for this tier if specific data missing).
    5. **Patient Impact**: Testimonials style or general impact on the community.
    6. **Legacy**: Summary of their career standing.

    Tone: Professional, authoritative, yet accessible to patients. 
    Format: Markdown.
    Length: Approximately 1000-1500 words.
    `;

    try {
        const response = await fetch('https://api.openai.com/v1/chat/completions', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${OPENAI_API_KEY}`
            },
            body: JSON.stringify({
                model: 'gpt-4o', // or gpt-4-turbo
                messages: [{ role: 'user', content: prompt }],
                temperature: 0.7,
            })
        });

        if (!response.ok) {
            console.error(`API Error: ${response.statusText}`);
            return null;
        }

        const data: any = await response.json();
        return data.choices[0].message.content;

    } catch (e) {
        console.error('Fetch error:', e);
        return null;
    }
}

async function main() {
    console.log('Starting detailed content generation...');

    if (!OPENAI_API_KEY) {
        console.log('⚠️  NO OPENAI API KEY DETECTED. SKIPPING GENERATION.');
        return;
    }

    const files = await glob(`${DOCTORS_DIR}/*.json`);
    const status = await loadStatus();

    // Process in chunks to avoid rate limits
    let count = 0;
    for (const file of files) {
        if (status.processed.includes(file)) {
            continue;
        }

        const content = JSON.parse(fs.readFileSync(file, 'utf-8'));

        // Skip if already has long bio (simple heuristic: length > 2000 chars)
        if (content.bio && content.bio.length > 2000) {
            console.log(`Skipping ${content.fullName} (already detailed)`);
            status.processed.push(file);
            await saveStatus(status);
            continue;
        }

        console.log(`Generating bio for ${content.fullName}...`);
        const longBio = await generateBio(content);

        if (longBio) {
            content.bio = longBio;
            content.bioGenerated = true;
            fs.writeFileSync(file, JSON.stringify(content, null, 2));
            console.log(`✅ Updated ${content.fullName}`);
            status.processed.push(file);
        } else {
            console.log(`❌ Failed to generate for ${content.fullName}`);
            status.errors.push(file);
        }

        await saveStatus(status);

        // Polite delay
        await new Promise(r => setTimeout(r, 1000));

        count++;
        // Optional: break after N runs if needed
    }

    console.log('Generation pass complete.');
}

main();
