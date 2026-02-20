import fs from 'fs';
import path from 'path';
import { glob } from 'glob';

const DOCTORS_DIR = path.join(process.cwd(), 'src/content/doctors');

const FETCH_OPTIONS = {
    headers: {
        'User-Agent': 'MDRPediaBot/1.0 (Contact: brandingpioneers@gmail.com)'
    }
};

async function findImageForDoctor(file: string) {
    try {
        const content = fs.readFileSync(file, 'utf-8');
        const doctor = JSON.parse(content);

        // Skip if already has a valid image URL
        if (doctor.portraitUrl && !doctor.portraitUrl.startsWith('data:image/svg') && doctor.portraitUrl.length > 50) {
            return;
        }

        console.log(`[SEARCH] Looking for image for ${doctor.fullName}...`);

        // Step 1: Search Wikipedia for the doctor's name
        const searchUrl = `https://en.wikipedia.org/w/api.php?action=query&list=search&srsearch=${encodeURIComponent(doctor.fullName)}&utf8=&format=json`;
        const searchRes = await fetch(searchUrl, FETCH_OPTIONS);

        if (!searchRes.ok) {
            console.error(`[ERROR] Search Request Failed for ${doctor.fullName} - Status: ${searchRes.status}`);
            return;
        }

        const searchData: any = await searchRes.json();
        const results = searchData.query?.search;

        if (!results || results.length === 0) {
            console.log(`[MISSING] No Wikipedia articles found for ${doctor.fullName}`);
            return;
        }

        // Evaluate top results to ensure they are medical professionals
        let targetTitle = null;
        for (const result of results.slice(0, 3)) { // Check top 3 results
            const snippet = result.snippet.toLowerCase();
            if (
                snippet.includes('physician') ||
                snippet.includes('doctor') ||
                snippet.includes('surgeon') ||
                snippet.includes('medical') ||
                snippet.includes('researcher') ||
                snippet.includes('professor') ||
                snippet.includes(doctor.specialty.toLowerCase().split(' ')[0]) // e.g. "cardio"
            ) {
                targetTitle = result.title;
                break;
            }
        }

        // If no specifically medical page found, just assume it's the top result if it's an exact name match
        if (!targetTitle && results[0].title.toLowerCase() === doctor.fullName.toLowerCase()) {
            targetTitle = results[0].title;
        }

        if (!targetTitle) {
            console.log(`[SKIP] Found articles for ${doctor.fullName} but could not verify medical context.`);
            return;
        }

        console.log(`[MATCH] Found verified page title: "${targetTitle}" for ${doctor.fullName}`);

        // Step 2: Fetch the page summary for the validated title to get the thumbnail
        const summaryUrl = `https://en.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(targetTitle)}`;
        const summaryRes = await fetch(summaryUrl, FETCH_OPTIONS);

        if (summaryRes.ok) {
            const data: any = await summaryRes.json();
            if (data.thumbnail && data.thumbnail.source) {
                console.log(`[SUCCESS] Grabbed Wikipedia image for ${doctor.fullName}: ${data.thumbnail.source}`);
                doctor.portraitUrl = data.thumbnail.source;
                fs.writeFileSync(file, JSON.stringify(doctor, null, 2));
                return;
            } else {
                console.log(`[NO IMAGE] Verified page found, but no thumbnail available for ${doctor.fullName}.`);
            }
        }

        // Polite delay
        await new Promise(r => setTimeout(r, 1000));

    } catch (error) {
        console.error(`[ERROR] Exception while fetching for ${file}:`, error);
    }
}

async function main() {
    console.log('--- STARTING SMART IMAGE FETCHING SCAN (WIKIPEDIA) ---');
    const files = await glob(`${DOCTORS_DIR}/*.json`);
    console.log(`Found ${files.length} profiles. Scanning for missing images...`);

    let processed = 0;
    for (const file of files) {
        await findImageForDoctor(file);
        processed++;
        if (processed % 50 === 0) console.log(`Processed ${processed}/${files.length} profiles...`);
    }
    console.log('--- IMAGE FETCHING COMPLETE ---');
}

main();
