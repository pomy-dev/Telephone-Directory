import { supabase } from './Supabase-Client';
import { UploadImage, uploadImages, uploadAttachments } from '../service/uploadFiles';

export async function subscribeRealtime() {
  const channel = supabase
    .channel('vendors-realtime')
    .on(
      'postgres_changes',
      { event: '*', schema: 'public', table: 'pomy_vendors' },
      (payload) => {
        console.log('Vendor changed:', payload)
        // Update your UI list
        updateVendorInList(payload.new || payload.old)
      }
    )
    .subscribe()
}

export async function insertUserProfile(userData) {
  const { name, email, phone } = userData;

  // Validation
  if (!name || !email || !phone) {
    throw new Error('Name, Email and phone are required');
  }

  try {
    const { data, error } = await supabase.rpc('insert_pomy_user', { payload: userData });

    if (error) throw error;

    return {
      success: true,
      data: {
        user: data[0],
        message: 'Profile updated successfully'
      }
    };

  } catch (error) {
    console.error('Insert User Profile Error:', error);
    return {
      success: false,
      error: error.message || 'Failed to update profile'
    };
  }
}

export async function addFlyerItems(store, flyerItems) {
  flyerItems?.length !== 0 ? console.log(flyerItems.length) : console.log('no items received')

  const mappedItems = await Promise.all(
    flyerItems.map(async (item) => ({
      item: item.name?.trim(),
      price: item.price?.trim() || "—",
      type: item.type?.trim() || 'single item',
      description: item.description?.trim() || null,
      image: await UploadImage(item.image),
      unit: item.unit?.trim() || 'each'
    }))
  );

  console.log('Maped Items: ', mappedItems)

  const { data, error } = await supabase
    .rpc('save_pomy_flyer', {
      p_store: store.trim(),
      p_items: mappedItems
    });

  if (error) console.error('RPC failed:', error);

  console.log(data)
  return data;
}

export async function fetchFlyerItems(page = 1) {
  const { data, error } = await supabase.rpc('get_pomy_flyer_items', {
    page,
    page_size: 20
  });

  if (error) console.log('Fetch error:', error);

  return data;
}

export async function searchAllFlyerItems() {
  const { data, error } = await supabase.rpc('search_pomy_flyer_items');

  if (error) console.log('Fetch error:', error);

  return data;
}

export async function addForhire(formData) {
  if (!formData) return;

  const { data, error } = await supabase.rpc("save_forehire_listing", {
    p_type: formData?.type,
    p_category: formData?.category,
    p_make: formData?.make,
    p_model: formData?.model,
    p_year: formData?.year,
    p_boarder_crossing: formData.crossingBoarder,
    p_registration: formData?.registration,
    p_price: formData?.price,
    p_price_type: formData?.priceType,
    p_capacity: formData?.capacity,
    p_cargo_capacity: formData?.cargoCapacity,
    p_description: formData?.description,
    p_operating_start: formData?.operatingStart,
    p_operating_end: formData?.operatingEnd,
    p_operating_days: formData?.operatingDays,
    p_routes: formData?.routes,
    p_features: formData?.features,
    p_location: formData?.location,
    p_certifications: formData?.certifications,
    p_owner_info: formData?.ownerInfo,
    p_images: await uploadImages('for_hires', 'vehicles', formData?.images),
  });

  if (error) console.error('RPC failed:', error);
  return data;
}

export async function getForHireTransport() {
  const { data, error } = await supabase.rpc("get_all_forehire_listings");

  if (error) console.log("Fetch error:", error);

  return data;
}

// ──────────────────────────────────────────────────────────────
// Vehicle Interactions - Likes, Ratings, Comments
// ──────────────────────────────────────────────────────────────

export async function updateVehicleLike(vehicleId, increment = true) {
  try {
    const change = increment ? 1 : -1;

    const { error } = await supabase.rpc('update_pomyvehicle_likes', {
      vehicle_id: vehicleId,
      change
    });

    if (error) throw error;

    return { success: true };
  } catch (error) {
    console.error('Error updating like:', error);
    return { success: false, error: error.message };
  }
}

export async function submitVehicleRating(vehicleId, rating) {
  try {
    const { error } = await supabase.rpc('update_pomyvehicle_rating', {
      vehicle_id: vehicleId,
      rating
    });

    if (error) throw error;

    return { success: true };
  } catch (error) {
    console.error('Error updating rating:', error);
    return { success: false, error: error.message };
  }
}

export async function submitVehicleComment(vehicleId, comment, suggestion = null, userNumber) {
  try {
    const { error } = await supabase.rpc('add_pomyvehicle_review', {
      vehicle_id: vehicleId,
      comment,
      suggestion,
      user_number: userNumber
    });

    if (error) throw error;

    return { success: true };
  } catch (error) {
    console.error('Error adding review:', error);
    return { success: false, error: error.message };
  }
}

export async function submitGig(jobData) {
  try {
    const { data, error } = await supabase.rpc("create_pomy_gig", {
      p_title: jobData.title,
      p_description: jobData.description,
      p_category: jobData.category,
      p_price: jobData.price,
      p_postedby: jobData.postedBy,
      p_location: jobData.locationSpot,
      p_requirements: jobData.requirements,
      p_images: await uploadImages('piece-jobs', 'gig-images', jobData?.photos) || [],
      p_status: jobData.status
    })

    if (error) {
      console.error("Failed to create job:", error)
      throw error
    }

    return { success: true, data: data[0] };
  } catch (error) {
    console.error('Error posting gig:', error);
    return { success: false, error: error.message };
  }
}


/**
 * Fetches gigs with support for filtering and cursor-based pagination
 */

/**
 * Fetches gigs with support for filtering and cursor-based pagination
 */
export async function getPomyGigs(filters = {}) {
  const {
    pageSize = 20,
    afterCreatedAt = null,
    afterId = null,
    category = null,
    minPrice = null,
    maxPrice = null,
    status = 'open',
    searchTerm = null,
    locationFilter = null
  } = filters;

  try {
    const { data, error } = await supabase.rpc('fetch_pomy_gigs', {
      p_page_size: pageSize,
      p_after_created_at: afterCreatedAt,
      p_after_id: afterId,
      p_job_category: category,
      p_min_price: minPrice,
      p_max_price: maxPrice,
      p_job_status: status,
      p_search_term: searchTerm,
      p_location_filter: locationFilter
    });

    if (error) throw error;

    // The data returned will now include the correct job_images jsonb array
    return { success: true, data };
  } catch (error) {
    console.error('Error fetching gigs:', error);
    return { success: false, error: error.message, data: [] };
  }
}

export const subscribeToGigs = (onCallback) => {
  return supabase
    .channel('gigs-changes')
    .on(
      'postgres_changes',
      { event: '*', schema: 'public', table: 'pomy_gigs' },
      (payload) => {
        console.log('Change received!', payload);
        onCallback(); // Trigger the refresh in the UI
      }
    )
    .subscribe();
};

/** apply for a gig job */
export async function applyForGig(formData) {
  try {
    const files = formData?.attachments?.filter(file => file.uri);
    const uploadedAttachments = await uploadAttachments('gig_applications', 'attachments', files);

    console.log('Uploaded Attachments: ', uploadedAttachments)

    const { data, error } = await supabase.rpc('apply_forpomy_gig', {
      p_job_id: formData.jobId,
      p_applicant: formData.user,
      p_skill_set: formData.skillSet,
      p_status: formData.status,
      p_attachments: uploadedAttachments.map(file => ({ url: file.url, name: file.name, type: file.type, mimeType: file.mimeType }))
    });

    if (error) throw error;

    return {
      success: true,
      data: data[0]
    };
  } catch (error) {
    console.error('Error applying for gig:', error);
    return { success: false, error: error.message };
  }
}

