import { supabase } from "@/lib/supabase";
import { User } from "@supabase/supabase-js";

// Types matching our Supabase Schema
export interface Favorite {
    id: string;
    user_id: string;
    business_id: string;
    business_name: string;
    trade_name?: string;
    city?: string;
    notes?: string;
    saved_at: string;
}

export interface QuoteRequest {
    id: string;
    user_id: string;
    business_id: string;
    business_name?: string;
    trade_name?: string;
    urgency?: string;
    description: string;
    status: 'pending' | 'quoted' | 'accepted' | 'declined' | 'completed';
    quote_amount?: number;
    created_at: string;
}

// Helper to get current user ID
const getCurrentUserId = async (): Promise<string | null> => {
    const { data: { session } } = await supabase.auth.getSession();
    return session?.user?.id || null;
};

export const db = {
    favorites: {
        /**
         * Get all favorites for the current user
         */
        async getAll() {
            const userId = await getCurrentUserId();
            if (!userId) throw new Error("User not logged in");

            const { data, error } = await supabase
                .from('favorites')
                .select('*')
                .eq('user_id', userId)
                .order('saved_at', { ascending: false });

            if (error) throw error;
            return data as Favorite[];
        },

        /**
         * Check if a specific business is favorited
         */
        async isFavorite(businessId: string) {
            const userId = await getCurrentUserId();
            if (!userId) return false;

            const { count, error } = await supabase
                .from('favorites')
                .select('*', { count: 'exact', head: true })
                .eq('business_id', businessId)
                .eq('user_id', userId);

            if (error) console.error("Error checking favorite:", error);
            return count ? count > 0 : false;
        },

        /**
         * Add a business to favorites
         */
        async add(business: { id: string; name: string; trade?: string; city?: string }) {
            const userId = await getCurrentUserId();
            if (!userId) throw new Error("User not logged in");

            const { data, error } = await supabase
                .from('favorites')
                .insert({
                    user_id: userId,
                    business_id: business.id,
                    business_name: business.name,
                    trade_name: business.trade,
                    city: business.city
                })
                .select()
                .single();

            if (error) throw error;
            return data as Favorite;
        },

        /**
         * Remove a business from favorites
         */
        async remove(businessId: string) {
            const userId = await getCurrentUserId();
            if (!userId) throw new Error("User not logged in");

            const { error } = await supabase
                .from('favorites')
                .delete()
                .eq('business_id', businessId)
                .eq('user_id', userId);

            if (error) throw error;
        }
    },

    quotes: {
        /**
         * Create a new quote request
         */
        async create(request: {
            businessId: string;
            businessName: string;
            tradeName: string;
            urgency: string;
            description: string;
            sourceSurface?: string;
            sourceUrl?: string;
            contact: {
                name: string;
                phone: string;
                email: string;
                postcode: string;
            }
        }) {
            const userId = await getCurrentUserId();
            const urgencyLabelMap: Record<string, string> = {
                emergency: "Emergency",
                today: "Today",
                "this-week": "This Week",
                flexible: "Flexible",
            };

            const quoteRow = {
                user_id: userId,
                business_id: request.businessId,
                customer_name: request.contact.name,
                customer_email: request.contact.email,
                customer_phone: request.contact.phone,
                details: request.description,
                urgency: urgencyLabelMap[request.urgency] || request.urgency || 'Standard',
                status: 'pending',
                source_surface: request.sourceSurface || null,
                source_url: request.sourceUrl || null,
            };

            let { error } = await supabase
                .from('quotes')
                .insert(quoteRow);

            // Keep quote requests working while older deployments receive the lead-tracking migration.
            if (error?.code === 'PGRST204') {
                const { source_surface: _sourceSurface, source_url: _sourceUrl, ...legacyQuoteRow } = quoteRow;
                ({ error } = await supabase.from('quotes').insert(legacyQuoteRow));
            }

            if (error) throw error;
            return {
                id: "",
                user_id: userId || "",
                business_id: request.businessId,
                business_name: request.businessName,
                trade_name: request.tradeName,
                urgency: quoteRow.urgency,
                description: request.description,
                status: 'pending',
                created_at: new Date().toISOString(),
            } as QuoteRequest;
        },

        /**
         * Get user's quote history (scoped to current user only)
         */
        async getHistory() {
            const userId = await getCurrentUserId();
            if (!userId) throw new Error("User not logged in");

            const { data, error } = await supabase
                .from('quotes')
                .select('*')
                .eq('user_id', userId)
                .order('created_at', { ascending: false });

            if (error) throw error;
            return data as QuoteRequest[];
        },

        /**
         * Get all quotes (admin only - no user scoping)
         */
        async getAll() {
            const { data, error } = await supabase
                .from('quotes')
                .select('*')
                .order('created_at', { ascending: false });

            if (error) throw error;
            return data;
        },

        /**
         * Update quote status. Admin access is enforced by RLS.
         */
        async updateStatus(quoteId: string, status: string) {
            const { error } = await supabase
                .from('quotes')
                .update({ status })
                .eq('id', quoteId);

            if (error) throw error;
        },

        /**
         * Delete a quote. Admin access is enforced by RLS.
         */
        async delete(quoteId: string) {
            const { error } = await supabase
                .from('quotes')
                .delete()
                .eq('id', quoteId);

            if (error) throw error;
        }
    },

    businesses: {
        /**
         * Get business claim status
         */
        async getClaimStatus(businessId: string) {
            const { data, error } = await supabase
                .from('businesses')
                .select('id, name, claim_status, owner_id, verified')
                .eq('id', businessId)
                .maybeSingle(); // Use maybeSingle as it might not exist in DB yet if we only have it in static

            if (error) {
                console.error("Error fetching business status:", error);
                return null;
            }
            return data;
        },

        /**
         * Claim a business
         */
        async claim(businessId: string, contactEmail: string, contactPhone: string, proofDocuments: string[] = []) {
            // We use the RPC function we defined in migration 013 (updated in 018)
            const { data, error } = await supabase
                .rpc('claim_business', {
                    business_id_param: businessId,
                    contact_email_param: contactEmail,
                    contact_phone_param: contactPhone,
                    proof_docs_param: proofDocuments
                });

            if (error) throw error;
            return data;
        }
    }
};

