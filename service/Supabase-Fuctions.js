// utils/upsertUserProfile.js
import { supabase } from './Supabase-Client';

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