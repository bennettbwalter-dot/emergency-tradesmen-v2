import { insertUSBusinesses } from './verified_manual_orchestrator_us.js';

const batch = [
    {
        name: "Alabama Plumber Pros",
        phone: "(833) 861-9252",
        city: "Billingsley",
        state: "AL",
        trade: "plumber",
        address: "Billingsley, AL",
        website: "https://deckardplumbingservice.com"
    },
    {
        name: "Certified Emergency Plumbing Repair Alabama",
        phone: "(888) 882-7781",
        city: "Billingsley",
        state: "AL",
        trade: "plumber",
        address: "Billingsley, AL",
        website: "https://emergencyplumbingrepair.com"
    },
    {
        name: "Alabama Emergency Locksmith Service",
        phone: "(888) 520-3230",
        city: "Billingsley",
        state: "AL",
        trade: "locksmith",
        address: "Billingsley, AL",
        website: "https://youralabamalocksmith.com"
    }
];

async function run() {
    await insertUSBusinesses(batch);
    process.exit(0);
}

run();
