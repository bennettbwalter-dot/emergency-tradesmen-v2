import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import fs from 'fs';

dotenv.config();

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

const intendedDates = JSON.parse(fs.readFileSync('tmp/intended_dates.json', 'utf8'));

// MANUALLY IDENTIFIED RECENT POSTS (Day 33-37)
// Day 37: Mar 16
intendedDates['broken-window-safety-board-up-tips-gb'] = '2026-03-16T10:00:00Z';
intendedDates['broken-window-safety-board-up-tips-us'] = '2026-03-16T10:00:00Z';

// Day 36: Mar 15
intendedDates['sunday-emergency-plumber-fees-uk-2026'] = '2026-03-15T11:00:00Z';
intendedDates['sunday-emergency-plumber-fees-us-2026'] = '2026-03-15T11:00:00Z';
intendedDates['sunday-emergency-plumber-fees-uk-2026-gb'] = '2026-03-15T11:00:00Z';
intendedDates['sunday-emergency-plumber-fees-us-us-2026'] = '2026-03-15T11:00:00Z';
intendedDates['sunday-emergency-plumber-fees-us-2026'] = '2026-03-15T11:00:00Z';

// Day 35: Mar 14
intendedDates['ac-heatwave-preparation-signs-repair-uk-2026'] = '2026-03-14T11:00:00Z';
intendedDates['ac-heatwave-preparation-signs-repair-us-2026'] = '2026-03-14T11:00:00Z';
intendedDates['ac-heatwave-preparation-signs-repair-uk-2026-gb'] = '2026-03-14T11:00:00Z';
intendedDates['ac-heatwave-preparation-signs-repair-us-us-2026'] = '2026-03-14T11:00:00Z';

// Day 34: Mar 13
intendedDates['toilet-wont-stop-running-2026-fix-gb'] = '2026-03-13T10:00:00Z';

// Day 33: Mar 12
intendedDates['march-winds-property-damage-storm-prep-2026-gb'] = '2026-03-12T10:00:00Z';
intendedDates['march-winds-property-damage-storm-prep-2026-us'] = '2026-03-12T10:00:00Z';

// Day 32: Mar 11
intendedDates['spring-condensation-mould-prevention-air-quality-2026-us'] = '2026-03-11T10:00:00Z';
intendedDates['spring-condensation-mold-prevention-air-quality-2026-us'] = '2026-03-11T10:00:00Z';

// 5 Signs variants
const fiveSignsDate = '2026-02-17T23:37:40.596162+00:00';
intendedDates['5-signs-you-need-emergency-plumber-gb'] = fiveSignsDate;
intendedDates['5-signs-you-need-emergency-plumber-us'] = fiveSignsDate;
intendedDates['5-signs-you-need-emergency-plumber'] = fiveSignsDate;
intendedDates['5-signs-you-need-emergency-plumber-gb'] = fiveSignsDate;

async function fixDates() {
  const { data: posts, error } = await supabase
    .from('posts')
    .select('id, title, slug, published_at');

  if (error) {
    console.error('Error fetching posts:', error);
    return;
  }

  console.log(`Auditing ${posts.length} posts...`);

  const updates = [];
  const missing = [];

  for (const post of posts) {
    const intendedDate = intendedDates[post.slug];
    if (intendedDate) {
      // Clean dates for comparison
      const cleanPostDate = post.published_at ? new Date(post.published_at).toISOString() : null;
      const cleanIntendedDate = new Date(intendedDate).toISOString();

      if (cleanPostDate !== cleanIntendedDate) {
        updates.push({
          id: post.id,
          slug: post.slug,
          old: post.published_at,
          new: cleanIntendedDate
        });
      }
    } else {
      missing.push(post.slug);
    }
  }

  console.log(`Found ${updates.length} posts to update.`);
  if (missing.length > 0) {
    console.log(`Missing intended date for ${missing.length} posts:`, missing);
  }

  if (updates.length === 0) {
    console.log('No updates needed.');
    return;
  }

  // Apply updates
  for (const update of updates) {
    console.log(`Updating ${update.slug}: ${update.old} -> ${update.new}`);
    const { error: updateError } = await supabase
      .from('posts')
      .update({ published_at: update.new })
      .eq('id', update.id);
    
    if (updateError) {
      console.error(`Failed to update ${update.slug}:`, updateError);
    }
  }

  console.log('Done.');
}

fixDates();
