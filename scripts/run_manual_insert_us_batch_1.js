import { insertUSBusinesses } from './verified_manual_orchestrator_us.js';

const batch = [
    {
        name: "Alabama Plumber Pros",
        phone: "(833) 861-9252",
        city: "Autaugaville",
        state: "AL",
        trade: "plumber",
        address: "Autaugaville, AL",
        website: "https://deckardplumbingservice.com"
    },
    {
        name: "Emergency Plumber: Alabama's Trusted Drain and Plumbing Services",
        phone: "(888) 479-4775",
        city: "Autaugaville",
        state: "AL",
        trade: "plumber",
        address: "Autaugaville, AL",
        website: "https://pbmplumbingco.com"
    }
];

async function run() {
    await insertUSBusinesses(batch);
    process.exit(0);
}

run();
