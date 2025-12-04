import { supabase } from './Supabase-Client';
import { UploadImage, uploadVehicles } from '../service/uploadFiles';

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
    p_images: await uploadVehicles('for_hires', formData?.images),
  });

  if (error) console.error('RPC failed:', error);
  return data;
}

export async function getForHireTransport() {
  const { data, error } = await supabase.rpc("get_all_forehire_listings");

  if (error) console.log("Fetch error:", error);

  return data;
}

