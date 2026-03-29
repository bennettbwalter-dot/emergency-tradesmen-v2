
import * as dotenv from 'dotenv';
dotenv.config();
console.log("VITE_GOOGLE_MAPS_API_KEY present:", !!process.env.VITE_GOOGLE_MAPS_API_KEY);
console.log("SUPABASE_SERVICE_ROLE_KEY present:", !!process.env.SUPABASE_SERVICE_ROLE_KEY);
