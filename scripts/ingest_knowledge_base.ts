import { createClient } from '@supabase/supabase-js';
import { pipeline } from '@huggingface/transformers';
import * as fs from 'fs';
import * as path from 'path';
import dotenv from 'dotenv';

dotenv.config();

// Initialize Supabase (No OpenAI key needed anymore!)
const supabaseUrl = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
    console.error('Missing environment variables: VITE_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY. The anon key cannot ingest this table because RLS only allows public reads.');
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

const DATA_PATH = path.join(process.cwd(), 'data', 'master_knowledge_base.json');

const TRADE_ALIASES: Record<string, string> = {
  plumbing: 'plumber',
  plumber: 'plumber',
  electrical: 'electrician',
  electrician: 'electrician',
  'gas engineer': 'gas-engineer',
  'gas-engineer': 'gas-engineer',
  'drain specialist': 'drain-specialist',
  'drain-specialist': 'drain-specialist',
  'water restoration': 'water-restoration',
  'water-restoration': 'water-restoration',
  'air conditioning': 'hvac',
  'air-conditioning': 'hvac',
  hvac: 'hvac',
  'breakdown recovery': 'breakdown',
  breakdown: 'breakdown',
};

function normalizeTradeSlug(trade: string) {
  const key = String(trade || '').trim().toLowerCase();
  return TRADE_ALIASES[key] || key.replace(/\s+/g, '-');
}

async function ingestData() {
  if (!fs.existsSync(DATA_PATH)) {
    console.error(`Data file not found at ${DATA_PATH}`);
    return;
  }

  const rawData = JSON.parse(fs.readFileSync(DATA_PATH, 'utf-8'));
  console.log(`Starting free ingestion for ${rawData.length} scenarios...`);
  let inserted = 0;
  let failed = 0;

  const { error: deleteError } = await supabase.from('trade_knowledge_base').delete().neq('id', '00000000-0000-0000-0000-000000000000');
  if (deleteError) {
    throw new Error(`Unable to clear stale trade_knowledge_base rows before ingest: ${deleteError.message}`);
  }
  
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
          trade: normalizeTradeSlug(item.trade),
          region: regionData.region,
          scenario: item.scenario,
          risk_level: item.risk_level,
          action_plan: item.action_plan,
          authority_name: regionData.authority_name,
          authority_url: regionData.authority_url,
          search_query: regionData.search_query_to_scrape,
          embedding: embedding
        });

        if (error) {
          console.error(`Error inserting ${item.scenario} for ${regionData.region}:`, error.message);
          failed += 1;
        } else {
          console.log(`Successfully ingested: [${regionData.region}] ${item.trade} - ${item.scenario}`);
          inserted += 1;
        }

      } catch (err) {
        console.error(`Failed to generate embedding for ${item.scenario}:`, err);
        failed += 1;
      }
    }
  }
  
  if (failed > 0) {
    throw new Error(`Ingestion finished with ${failed} failed row(s) and ${inserted} inserted row(s).`);
  }

  console.log(`Ingestion complete! Inserted ${inserted} embedded trade knowledge rows.`);
}

ingestData().catch(console.error);
