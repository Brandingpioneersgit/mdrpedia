
import { getAuthorWorks, searchAuthors } from '../src/lib/openalex';

async function debug() {
    console.log("--- Debugging M. A. Q. Khan (A5107827992) ---");
    const works = await getAuthorWorks('https://openalex.org/A5107827992');
    console.log(`Works found: ${works.count}`);
    if (works.count === 0) {
        console.log("Searching for author 'M. A. Q. Khan'...");
        const authors = await searchAuthors({ name: 'M. A. Q. Khan' });
        console.log(`Found ${authors.count} authors.`);
        authors.results.slice(0, 3).forEach(a => {
            console.log(`- ${a.display_name} (${a.id}) | Works: ${a.works_count} | H-Index: ${a.summary_stats?.h_index}`);
        });
    }

    console.log("\n--- Debugging Joel D. Dudley ---");
    const authors2 = await searchAuthors({ name: 'Joel D. Dudley' });
    console.log(`Query 'Joel D. Dudley': ${authors2.count}`);
    const authors3 = await searchAuthors({ name: 'Joel Dudley' });
    console.log(`Query 'Joel Dudley': ${authors3.count}`);

    console.log("\n--- Debugging William Kaelin Jr. ---");
    const authors4 = await searchAuthors({ name: 'William Kaelin Jr.' });
    console.log(`Query 'William Kaelin Jr.': ${authors4.count}`);
    const authors5 = await searchAuthors({ name: 'William Kaelin' });
    console.log(`Query 'William Kaelin': ${authors5.count}`);
}

debug();
