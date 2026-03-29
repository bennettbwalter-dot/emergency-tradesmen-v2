import { supabase } from './supabase';

export interface Quote {
    id: string;
    businessId: string;
    userId?: string;
    customerName: string;
    customerEmail: string;
    customerPhone: string;
    details: string;
    urgency: 'Emergency' | 'Standard' | 'Flexible';
    status: 'pending' | 'viewed' | 'accepted' | 'rejected';
    createdAt: string;
}

export interface CreateQuoteRequest {
    businessId: string;
    customerName: string;
    customerEmail: string;
    customerPhone: string;
    details: string;
    urgency?: 'Emergency' | 'Standard' | 'Flexible';
}

// Create a new quote request
export async function createQuote(request: CreateQuoteRequest): Promise<Quote | null> {
    const { data: { user } } = await supabase.auth.getUser();

    const { data, error } = await supabase
        .from('quotes')
        .insert({
            business_id: request.businessId,
            user_id: user?.id || null,
            customer_name: request.customerName,
            customer_email: request.customerEmail,
            customer_phone: request.customerPhone,
            details: request.details,
            urgency: request.urgency || 'Standard',
            status: 'pending',
        })
        .select()
        .single();

    if (error) {
        console.error('Error creating quote:', error);
        return null;
    }

    return mapQuote(data);
}

// Fetch all quotes (admin only)
export async function fetchAllQuotes(): Promise<Quote[]> {
    const { data, error } = await supabase
        .from('quotes')
        .select('*')
        .order('created_at', { ascending: false });

    if (error) {
        console.error('Error fetching quotes:', error);
        return [];
    }

    return data.map(mapQuote);
}

// Fetch quotes for a specific business
export async function fetchQuotesByBusiness(businessId: string): Promise<Quote[]> {
    const { data, error } = await supabase
        .from('quotes')
        .select('*')
        .eq('business_id', businessId)
        .order('created_at', { ascending: false });

    if (error) {
        console.error('Error fetching business quotes:', error);
        return [];
    }

    return data.map(mapQuote);
}

// Update quote status
export async function updateQuoteStatus(quoteId: string, status: Quote['status']): Promise<boolean> {
    const { error } = await supabase
        .from('quotes')
        .update({ status })
        .eq('id', quoteId);

    if (error) {
        console.error('Error updating quote status:', error);
        return false;
    }

    return true;
}

// Delete a quote
export async function deleteQuote(quoteId: string): Promise<boolean> {
    const { error } = await supabase
        .from('quotes')
        .delete()
        .eq('id', quoteId);

    if (error) {
        console.error('Error deleting quote:', error);
        return false;
    }

    return true;
}

// Map database row to Quote interface
function mapQuote(row: any): Quote {
    return {
        id: row.id,
        businessId: row.business_id,
        userId: row.user_id,
        customerName: row.customer_name,
        customerEmail: row.customer_email,
        customerPhone: row.customer_phone,
        details: row.details,
        urgency: row.urgency,
        status: row.status,
        createdAt: row.created_at,
    };
}
