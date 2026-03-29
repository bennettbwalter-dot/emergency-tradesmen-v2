import { supabase } from './supabase';

/**
 * Fetch photos for a specific business
 */
export async function fetchBusinessPhotos(businessId: string) {
    const { data, error } = await supabase
        .from('business_photos')
        .select('*')
        .eq('business_id', businessId)
        .order('display_order', { ascending: true })
        .order('created_at', { ascending: false });

    if (error) {
        console.error('Error fetching photos:', error);
        return [];
    }

    return data || [];
}

/**
 * Set a photo as primary for a business
 */
export async function setPrimaryPhoto(photoId: string, businessId: string) {
    // First, unset all other primary photos for this business
    await supabase
        .from('business_photos')
        .update({ is_primary: false })
        .eq('business_id', businessId);

    // Then set the selected photo as primary
    const { error } = await supabase
        .from('business_photos')
        .update({ is_primary: true })
        .eq('id', photoId);

    return !error;
}

/**
 * Delete a photo
 */
export async function deletePhoto(photoId: string, photoUrl: string) {
    // Delete from storage
    const fileName = photoUrl.split('/').pop();
    if (fileName) {
        await supabase.storage
            .from('business-photos')
            .remove([fileName]);
    }

    // Delete from database
    const { error } = await supabase
        .from('business_photos')
        .delete()
        .eq('id', photoId);

    return !error;
}
