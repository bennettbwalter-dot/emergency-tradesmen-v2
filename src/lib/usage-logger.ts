import { supabase } from './supabase';

type ServiceType = 'azure_tts_chars' | 'sendgrid_emails' | 'email_octopus_emails' | 'leaflet_map_loads';

// Once we know the table doesn't exist, stop hitting the API —
// otherwise every map load fires a 404 against PostgREST.
let usageTableMissing = false;

export const usageLogger = {
    /**
     * Increments the usage counter for a specific service for the current month.
     * Uses Supabase 'usage_logs' table.
     */
    incrementUsage: async (serviceId: ServiceType, amount: number = 1) => {
        if (usageTableMissing) return;
        try {
            const now = new Date();
            // Format: "MM-YYYY" e.g., "12-2025"
            const currentMonthYear = `${(now.getMonth() + 1).toString().padStart(2, '0')}-${now.getFullYear()}`;

            // 1. Fetch current usage for this month/service
            const { data: existingLog, error: fetchError } = await supabase
                .from('usage_logs')
                .select('*')
                .eq('service_id', serviceId)
                .eq('month_year', currentMonthYear)
                .single();

            if (fetchError && fetchError.code !== 'PGRST116') { // PGRST116 is "Row not found"
                // Silence "Table not found" error to avoid polluting console
                if (fetchError.code === 'PGRST205' || fetchError.message?.includes('Could not find the table')) {
                    usageTableMissing = true;
                } else {
                    console.warn('Error fetching usage logs:', fetchError);
                }
                return;
            }

            let newUsage = amount;
            if (existingLog) {
                newUsage = (existingLog.current_usage || 0) + amount;
            }

            // 2. Upsert (Create or Update)
            const { error: upsertError } = await supabase
                .from('usage_logs')
                .upsert(
                    {
                        service_id: serviceId,
                        month_year: currentMonthYear,
                        current_usage: newUsage
                    },
                    { onConflict: 'service_id, month_year' }
                );

            if (upsertError) {
                console.warn('Error updating usage logs:', upsertError);
            } else {
                // console.log(`[Usage Logger] Incremented ${serviceId} by ${amount}. Total: ${newUsage}`);
            }

        } catch (err) {
            console.error('[Usage Logger] Unexpected error:', err);
        }
    },

    /**
     * Fetches all usage logs for the current month.
     */
    getCurrentMonthUsage: async () => {
        const now = new Date();
        const currentMonthYear = `${(now.getMonth() + 1).toString().padStart(2, '0')}-${now.getFullYear()}`;

        const { data, error } = await supabase
            .from('usage_logs')
            .select('*')
            .eq('month_year', currentMonthYear);

        if (error) {
            console.error('[Usage Logger] Error fetching dashboard data:', error);
            return [];
        }
        return data || [];
    }
};
