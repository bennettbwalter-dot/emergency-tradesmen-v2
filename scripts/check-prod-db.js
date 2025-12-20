
import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'
import fs from 'fs'
import path from 'path'

// Manually load .env.production
const envConfig = dotenv.parse(fs.readFileSync(path.resolve(process.cwd(), '.env.production')))

const supabaseUrl = envConfig.VITE_SUPABASE_URL
const supabaseKey = envConfig.SUPABASE_SERVICE_ROLE_KEY // Use service role to bypass RLS for check

if (!supabaseUrl || !supabaseKey || supabaseUrl.includes('REPLACE')) {
    console.log('❌ Missing or invalid production keys in .env.production')
    process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseKey)

async function checkDb() {
    console.log('Connecting to:', supabaseUrl)

    // Try to select from businesses
    const { data, error } = await supabase
        .from('businesses')
        .select('count', { count: 'exact', head: true })

    if (error) {
        if (error.code === '42P01') { // undefined_table
            console.log('❌ Table "businesses" does not exist. You HAVE NOT run the script yet.')
        } else {
            console.log('❌ Error connecting to DB:', error.message)
        }
    } else {
        console.log('✅ Database is initialized! "businesses" table exists.')

        // Check for other tables just in case
        const { error: quotesError } = await supabase.from('quotes').select('count', { count: 'exact', head: true })
        if (!quotesError) console.log('✅ "quotes" table exists.')

        const { error: subsError } = await supabase.from('subscriptions').select('count', { count: 'exact', head: true })
        if (!subsError) console.log('✅ "subscriptions" table exists.')
    }
}

checkDb()
