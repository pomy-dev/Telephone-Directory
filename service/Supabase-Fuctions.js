// utils/upsertUserProfile.js
import { supabase } from './Supabase-Client';


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

export async function searchVendors(query = '', filters = {}, page = 1) {
  const { data, error } = await supabase.rpc('search_vendors', {
    query,
    filters,
    page,
    page_size: 15
  })
  if (error) console.error(error)
  else displayVendors(data)
}

// 3. Rate a vendor
export async function rateVendor(vendorId, stars) {
  const { data, error } = await supabase.rpc('rate_vendor', {
    v_id: vendorId,
    stars
  })
  if (error) alert(error.message)
  else console.log('Rated!', data)
}

// Example usage
// searchVendors('chai', { area: 'Koramangala' })
// rateVendor('a0eebc99-...', 5)

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
        user: data[0], // Complete user object
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

export async function insertVendorProfile(vendorData) {
  const { businessName, ownerName, phone } = vendorData;

  // Validation
  if (!businessName || !ownerName || !phone) {
    throw new Error('Business Name, Owner Name and phone are required');
  }

  try {
    const { data, error } = await supabase.rpc('insert_pomy_vendor', { payload: vendorData });

    if (error) throw error;

    return {
      success: true,
      data: {
        user: data[0], // Complete user object
        message: 'Vednor updated successfully'
      }
    };

  } catch (error) {
    console.error('Insert Vendor Profile Error:', error);
    return {
      success: false,
      error: error.message || 'Failed to update profile'
    };
  }
}

export async function getNearestVendors(lat, long) {
  try {
    const { data, error } = await supabase.rpc('get_vendors', {
      filters: {
        location: { latitude: lat, longitude: long },
        radiusKm: "10"
      },
      page: 1,
      page_size: 15
    });

    if (error) {
      console.error(error)
      return;
    }

    console.log('Nearest Vendors: ', data.length);

    return data
  } catch (error) {
    console.error('Retrieve Vendor Error:', error);
    return {
      success: false,
      error: error.message || 'Failed to get vendors'
    };
  }
}

export async function getTopVendors() {
  try {
    const { data, error } = await supabase.rpc('get_vendors', {
      filters: {},
      page: 1,
      page_size: 15
    });

    if (error) {
      console.error(error)
      return;
    }

    console.log('Top Rated vendors: ', data.length);

    return data
  } catch (error) {
    console.error('Retrieve Vendor Error:', error);
    return {
      success: false,
      error: error.message || 'Failed to get vendors'
    };
  }
}

export async function insertVendorStock(stock) {
  try {
    const { data, error } = await supabase.rpc('insert_vendor_stock', {
      payload: stock
    });

    if (error) {
      console.error("Insert failed:", error.message);
    } else {
      console.log("Stock upserted! ID:", data);
    }
    return data;
  } catch (error) {
    console.error(error)
  }
}

export async function updateVendorStock(stockId, payload) {
  try {
    const { data, error } = await supabase.rpc('update_vendor_stock', {
      stock_id: stockId,
      payload
    });

    if (error) {
      console.error("Update stock failed:", error.message);
    } else {
      console.log("Stock upted! ID:", data);
    }
    return data;
  } catch (error) {
    console.error(error)
  }
}

export async function insertVendorGroup(payload, user) {
  const { data, error } = await supabase.rpc('insert_vendor_group', {
    payload
  }, {
    headers: {
      'X-User-Email': user.email,        // for RLS
      'X-Admin-Email': user.email        // for INSERT check
    }
  });

  if (error) {
    console.error(error)
    throw error;
  }

  return data;
}