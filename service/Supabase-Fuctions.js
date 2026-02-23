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
    p_boarder_crossing: formData.crossingBoarder,
    p_registration: formData?.registration,
    p_price: formData?.price,
    p_price_type: formData?.priceType,
    p_capacity: formData?.capacity,
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


/**
 * Fetches full details for a specific transportation vehicle by ID
 */
export async function getTransportById(transportId) {
  try {
    const { data, error } = await supabase
      .from('pomy_forhire_transport')
      .select('*')
      .eq('id', transportId)
      .single();

    if (error) throw error;

    return {
      success: true,
      data: data
    };
  } catch (error) {
    console.error('Error fetching transport by ID:', error.message);
    return {
      success: false,
      error: error.message
    };
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
export async function getPomyGigs(filters = {}) {
  const {
    pageSize = 30,
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

    return {
      success: true,
      data: data || [] // Ensure data is at least an empty array, never null
    };
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

/** Fetch all applications for a specific gig */
export async function getGigApplicants(gigId) {
  try {
    const { data, error } = await supabase
      .from('pomy_gig_app') // Updated to your new table name
      .select('*')
      .eq('job_id', gigId) // Matching your job_id column
      .order('created_at', { ascending: false });

    if (error) throw error;
    return { success: true, data };
  } catch (error) {
    console.error('Error fetching applicants:', error.message);
    return { success: false, error: error.message };
  }
}

/**
 * Register a new worker with the updated schema including skills array
 * @param {Object} workerData - The worker profile information
 * @param {string} workerData.user_id - The Supabase Auth ID
 * @param {string} workerData.name - Full name
 * @param {string} workerData.phone - Unique phone number
 * @param {Object} workerData.location - JSON object with address/coords
 * @param {string} workerData.bio - Professional summary
 * @param {Array} workerData.skills - Array of strings e.g., ["Plumbing", "Leaks"]
 */
export async function registerAsWorker(workerData) {
  try {
    // 1. Upload Portfolio Images first
    const uploadedImages = workerData.experience_images?.length > 0
      ? await uploadImages('worker_portfolios', 'images', workerData.experience_images)
      : [];

    // 2. Upload Documents (Qualifications)
    const uploadedDocs = workerData.documents?.length > 0
      ? await uploadAttachments('worker_docs', 'attachments', workerData.documents)
      : [];

    const { data, error } = await supabase
      .from('pomy_workers')
      .insert([
        {
          user_id: workerData.user_id,
          name: workerData.name,
          phone: workerData.phone,
          location: workerData.location,
          bio: workerData.bio,
          skills: workerData.skills || [],
          documents: uploadedDocs, // Now stores array of {url, name, type}
          experience_images: uploadedImages.map(img => img.url), // Array of URLs
          contact_options: workerData.contact_options || {},
          is_available: true,
        }
      ])
      .select();

    if (error) throw error;
    return { success: true, data: data[0] };
  } catch (error) {
    console.error('Registration Error:', error.message);
    return { success: false, error: error.message };
  }
}

/**
 * Fetches a worker profile by user_id
 */
export async function getWorkerProfile(userId) {
  try {
    const { data, error } = await supabase
      .from('pomy_workers')
      .select('*')
      .eq('user_id', userId)
      .single();

    if (error && error.code !== 'PGRST116') throw error; // PGRST116 is "no rows found"

    return { success: true, data: data || null };
  } catch (error) {
    console.error('Fetch Worker Error:', error.message);
    return { success: false, error: error.message };
  }
}

/**
 * Updates an existing worker profile
 */
export async function updateWorkerProfile(uid, updateData) {
  try {
    let workerProfile = updateData.worker_pp || []
    let portfolioImgs = updateData.experience_images || [];
    let documents = updateData.documents || [];

    console.log('Worker P.: ', workerProfile, '\nGallery Imgs: ', portfolioImgs, '\nDocuments: ', documents)

    const isLocalFile = (item) => {
      if (!item) return false
      if (typeof item === 'string') return item.startsWith('file://')
      if (typeof item === 'object') return !!(item.uri && String(item.uri).startsWith('file://'))
      return false
    }

    const isRemoteUrl = (item) => {
      if (!item) return false
      if (typeof item === 'string') return item.startsWith('https')
      if (typeof item === 'object') return !!(item.url && String(item.url).startsWith('https'))
      return false
    }

    // Profile picture(s)
    const existingPP = workerProfile?.filter(item => !isLocalFile(item))
    const toUploadPP = workerProfile?.filter(isLocalFile).map(i => (typeof i === 'string' ? i : { uri: i }))

    if (toUploadPP.length > 0) {
      const uploadedPP = await uploadImages('workers', 'profile_pictures', toUploadPP)
      workerProfile = [...existingPP, ...(uploadedPP || [])]
    } else {
      workerProfile = existingPP
    }

    // Portfolio images: want array of URL strings
    // Keep existing remote URLs and append newly uploaded ones
    const existingPortfolioUrls = portfolioImgs
      ?.filter(isRemoteUrl)
      .map(i => (typeof i === 'string' ? i : i.url))

    const toUploadPortfolio = portfolioImgs
      ?.filter(isLocalFile)
      .map(i => (typeof i === 'string' ? i : i.uri))

    if (toUploadPortfolio.length > 0) {
      const uploadedPortfolio = await uploadImages('workers', 'portfolio', toUploadPortfolio)
      // Append newly uploaded images to existing remote URLs
      const uploadedUrls = uploadedPortfolio.map(img => (typeof img === 'object' ? img : img.url))
      portfolioImgs = [...(existingPortfolioUrls || []), ...uploadedUrls]
    }
    else {
      portfolioImgs = existingPortfolioUrls || []
    }

    // Documents: keep array of objects {url,name,type,...}
    // Keep existing remote documents and append newly uploaded ones
    const existingDocs = documents
      ?.filter(isRemoteUrl)
      .map(i => (typeof i === 'string' ? { url: i } : i))

    const toUploadDocs = documents
      ?.filter(isLocalFile)
      .map(i => (typeof i === 'string' ? { uri: i } : i))

    if (toUploadDocs.length > 0) {
      const uploadedDocs = await uploadAttachments('workers', 'certificates', toUploadDocs)
      // Append newly uploaded documents to existing remote documents
      documents = [...(existingDocs || []), ...(uploadedDocs || [])]
    } else {
      documents = existingDocs || []
    }

    const payload = {
      ...updateData,
      worker_pp: workerProfile,
      experience_images: portfolioImgs,
      documents: documents,
      contact_options: updateData.contact_options || {}
    }

    const { data, error } = await supabase
      .from('pomy_workers')
      .update(payload)
      .eq('user_id', uid)
      .select()

    if (error) throw error;
    return { success: true, data: data[0] };
  } catch (error) {
    console.error('Update Error:', error.message);
    return { success: false, error: error.message };
  }
}

/**
 * Update availability status for an existing worker
 */
export async function updateWorkerAvailability(workerId, isAvailable) {
  try {
    const { error } = await supabase
      .from('pomy_workers')
      .update({ is_available: isAvailable })
      .eq('id', workerId);

    if (error) throw error;
    return { success: true };
  } catch (error) {
    return { success: false, error: error.message };
  }
}

/** * get the gig by their id from, 
 * the db
 */
export async function getGigById(Id) {
  try {
    const { data, error } = await supabase
      .from('pomy_gigs')
      .select('*')
      .eq('id', Id)
      .single();

    if (error && error.code !== 'PGRST116') throw error; // PGRST116 is "no rows found"

    return { success: true, data: data || null };
  } catch (error) {
    console.error('Fetch gig Error:', error.message);
    return { success: false, error: error.message };
  }
}

/** * Approves a specific application, marks the gig as 'taken', 
 * and rejects all other applicants via Database RPC.
 */
export async function approveGigApplication(applicationId) {
  try {
    const { data, error } = await supabase.rpc('approve_gig_application', {
      p_application_id: applicationId
    });

    if (error) throw error;

    return {
      success: true,
      data: data[0] // Returns the summary of the approved application
    };
  } catch (error) {
    console.error('Error approving application:', error.message);
    return { success: false, error: error.message };
  }
}

// Hire/Accept a worker
export async function updateApplicationStatus(applicationId, status) {
  try {
    const { error } = await supabase
      .from('pomy_gig_applications')
      .update({ application_status: status })
      .eq('id', applicationId);
    if (error) throw error;
    return { success: true };
  } catch (error) {
    return { success: false };
  }
}

export async function getApplicantsForGig(gigId) {
  try {
    const { data, error } = await supabase
      .from('pomy_gig_applications')
      .select('*')
      .eq('gig_id', gigId);

    if (error) throw error;
    return { success: true, data };
  } catch (error) {
    return { success: false, error: error.message };
  }
}

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

/** fetch gigs applied for */
export async function getMyAppliedGigs(userEmail) {
  console.log('Fetching applied gigs for user:', userEmail);
  try {
    const { data, error } = await supabase.rpc(
      "get_gigs_i_applied_for",
      { p_email: userEmail.trim() }
    )

    if (error) throw error;

    return { success: true, data };
  } catch (error) {
    console.error('Error fetching applied gigs:', error);
    return { success: false, error: error.message, data: [] };
  }
}

/** fetch approved gigs */
export async function getApprovedGigs(userEmail) {
  try {
    const { data, error } = await supabase.rpc(
      "get_my_approved_gigs",
      { p_email: userEmail }
    )

    if (error) throw error;

    return { success: true, data };
  } catch (error) {
    console.error('Error fetching approved gigs:', error);
    return { success: false, error: error.message, data: [] };
  }
}

/** approve application */
export async function approveApplication(applicationId) {
  try {
    const { data, error } = await supabase.rpc(
      "approve_gig_application",
      { p_application_id: applicationId }
    )

    if (error) {
      console.error(error)
    } else {
      console.log("Approved application:", data[0])
    }

    return { success: true, data: data[0] };
  } catch (error) {
    console.error('Error approving application:', error);
    return { success: false, error: error.message };
  }
}

export async function deleteMyApplication(appId, userEmail) {
  try {
    const { error } = await supabase.rpc(
      "delete_my_gig_application",
      {
        p_application_id: appId,
        p_email: userEmail
      }
    )

    if (error) {
      console.error("Delete failed:", error)
    } else {
      console.log("Application deleted")
    }
    return { success: true };
  } catch (error) {
    console.error('Error deleting application:', error);
    return { success: false, error: error.message };
  }
}

/**
 * Fetches personalized recommendations using the Supabase RPC
 */
export async function getPersonalizedRecommendations(userId, excludeIds = []) {
  try {
    const { data, error } = await supabase.rpc('get_recommendations_for_user', {
      p_user_id: userId,
      // p_exclude_ids: excludeIds, 
      p_limit: 10
    });

    if (error) throw error;


    return { success: true, data };
  } catch (error) {
    console.error('Recommendation Error:', error.message);
    return { success: false, data: [] };
  }
}


/**
 * Logs user activity to the explicit user_activities table.
 * Matches schema: id (uuid), user_id (text), item_id (text), item_type (text)
 */
export async function logUserActivity(userId, itemId, itemType) {
  if (!userId || !itemId) return;

  try {
    const { error } = await supabase
      .from('user_activities')
      .insert([
        {
          user_id: userId,
          item_id: itemId.toString(),
          item_type: itemType,
          created_at: new Date().toISOString(),
        },
      ]);

    if (error) throw error;
    console.log(`Activity Logged: User ${userId} interacted with ${itemType} ${itemId}`);
  } catch (error) {
    console.error('Error logging user activity:', error.message);
  }
}

/**
 * Synchronizes Firebase Auth user data into the Supabase 'user_profiles' table.
 * Matches your schema: user_id, email, display_name, phone_number, photo_url, last_login
 */
export async function syncUserProfile(firebaseUser) {
  if (!firebaseUser) return null;

  try {
    const { data, error } = await supabase
      .from('user_profiles')
      .upsert({
        user_id: firebaseUser.uid,
        email: firebaseUser.email,
        display_name: firebaseUser.displayName || 'Anonymous',
        phone_number: firebaseUser.phoneNumber || null,
        photo_url: firebaseUser.photoURL || null,
        last_login: new Date().toISOString(),
        // Note: We DO NOT include interest_embedding here. 
        // This prevents us from overwriting their AI profile with NULL.
      }, { onConflict: 'user_id' })
      .select();

    if (error) throw error;
    return { success: true, data: data[0] };
  } catch (error) {
    console.error('Error syncing profile:', error.message);
    return { success: false, error: error.message };
  }
}