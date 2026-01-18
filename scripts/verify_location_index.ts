
// Mock imports for the script environment if needed, or use ts-node with project config
// We assume we can run this with ts-node using the project's tsconfig
import { generateLocationIndex, searchLocations } from '../src/lib/locationIndex';

console.log("Generating Index...");
const index = generateLocationIndex();
console.log(`Index generated with ${index.length} records.`);

const testQueries = [
    "Rochester",
    "Greece",
    "14612",
    "New York",
    "London" // Should hopefully not match much in US index except maybe "New London" if it existed
];

testQueries.forEach(q => {
    console.log(`\nSearching for: "${q}"`);
    const results = searchLocations(q);
    results.forEach(r => {
        console.log(`- [${r.score}] ${r.record.type.toUpperCase()}: ${r.record.name} (${r.record.state}) -> Anchored to ${r.record.anchor_city}`);
    });
});
