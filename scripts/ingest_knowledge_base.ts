import { createClient } from '@supabase/supabase-js';
import { pipeline } from '@xenova/transformers';
import * as fs from 'fs';
import * as path from 'path';
import dotenv from 'dotenv';

dotenv.config({ path: '.env' });
dotenv.config({ path: '.env.local', override: false });
dotenv.config({ path: '.env.uk.local', override: false });

// Initialize Supabase (No OpenAI key needed anymore!)
const supabaseUrl = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
    console.error('Missing environment variables: VITE_SUPABASE_URL and (SUPABASE_SERVICE_ROLE_KEY or VITE_SUPABASE_ANON_KEY)');
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

const DATA_PATH = path.join(process.cwd(), 'data', 'master_knowledge_base.json');

// Source-tier classifier per the RAG Trade Adviser spec.
// 1 = government/regulator, 2 = safety authority, 3 = standards body,
// 4 = professional body, 5 = trade body / industry standard, 6 = manufacturer/industry,
// 7 = Wikipedia / generic reference.
function classifyTier(url: string): number {
  const u = (url || '').toLowerCase();
  if (/\.gov\b|\.gov\.uk\b|hse\.gov|osha\.gov|epa\.gov|legislation\.gov\.uk|planningportal\.gov\.uk|gassaferegister\.co\.uk/.test(u)) return 1;
  if (/electricalsafetyfirst|wras\.co\.uk|wrasapprovals|boatsafetyscheme|food\.gov/.test(u)) return 2;
  if (/iccsafe\.org|iapmo\.org|bsigroup|astm\.org|\bul\.com\b|ukas\.com|smacna\.org|ashrae|nfgc|nfpa\.org\/54|bbacerts\.co\.uk|iicrc\.org/.test(u)) return 3;
  if (/theiet\.org|niceic\.com|napit\.org\.uk|eca\.co\.uk|cityandguilds|locksmiths\.co\.uk|select\.org\.uk|igem\.org\.uk|euskills\.co\.uk|rics\.org/.test(u)) return 4;
  if (/nfpa\.org|asse-plumbing|refcom|ciphe\.org|nate|uklpg\.org|aga\.org/.test(u)) return 5;
  if (/wikipedia\.org/.test(u)) return 7;
  return 5;
}

async function ingestData() {
  if (!fs.existsSync(DATA_PATH)) {
    console.error(`Data file not found at ${DATA_PATH}`);
    return;
  }

  const rawData = JSON.parse(fs.readFileSync(DATA_PATH, 'utf-8'));
  console.log(`Starting free ingestion for ${rawData.length} scenarios...`);
  
  // Load the free, open-source embedding model locally
  console.log('Loading AI model... (this may take a few seconds the first time)');
  const generateEmbedding = await pipeline('feature-extraction', 'Xenova/all-MiniLM-L6-v2');

  for (const item of rawData) {
    for (const regionData of item.region_data) {
      
      const textToEmbed = `Trade: ${item.trade}. Scenario: ${item.scenario}. Risk Level: ${item.risk_level}. Action Plan: ${item.action_plan}. Authority: ${regionData.authority_name}.`;

      try {
        // Generate the embedding locally for free
        const output = await generateEmbedding(textToEmbed, {
          pooling: 'mean',
          normalize: true,
        });
        
        // Convert the output to a standard JavaScript array
        const embedding = Array.from(output.data);

        // Insert into Supabase
        const { error } = await supabase.from('trade_knowledge_base').insert({
          trade: item.trade.toLowerCase(),
          region: regionData.region,
          scenario: item.scenario,
          risk_level: item.risk_level,
          action_plan: item.action_plan,
          authority_name: regionData.authority_name,
          authority_url: regionData.authority_url,
          source_tier: regionData.source_tier ?? classifyTier(regionData.authority_url),
          search_query: regionData.search_query_to_scrape,
          embedding: embedding
        });

        if (error) {
          console.error(`Error inserting ${item.scenario} for ${regionData.region}:`, error.message);
        } else {
          console.log(`Successfully ingested: [${regionData.region}] ${item.trade} - ${item.scenario}`);
        }

      } catch (err) {
        console.error(`Failed to generate embedding for ${item.scenario}:`, err);
      }
    }
  }
  
  console.log('Ingestion complete! Your database is populated entirely for free.');
}

ingestData().catch(console.error);
