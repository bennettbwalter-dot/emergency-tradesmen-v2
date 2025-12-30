import { supabase } from './supabase';

type ServiceType = 'google_map_loads' | 'google_route_requests' | 'azure_tts_chars' | 'sendgrid_emails' | 'email_octopus_emails';

export const usageLogger = {
    /**
     * Increments the usage counter for a specific service for the current month.
     * Uses Supabase 'usage_logs' table.
     */
    incrementUsage: async (serviceId: ServiceType, amount: number = 1) => {
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
                console.warn('Error fetching usage logs:', fetchError);
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
