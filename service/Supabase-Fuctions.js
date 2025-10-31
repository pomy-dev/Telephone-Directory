// utils/upsertUserProfile.js
import { supabase } from './Supabase-Client';
import { useState, useEffect } from 'react';


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

export const fetchUserGroups = async (userEmail) => {
  const { data, error } = await supabase
    .rpc('get_vendor_groups_by_email', { p_email: userEmail });

  if (error) {
    console.error('Error fetching user groups:', error);
    throw error;
  }

  return data; // Array of groups
};

export const insertDiscussion = async (discussionData) => {
  const { data, error } = await supabase.rpc('pomy_add_discussion', {
    p_group_id: discussionData.groupId,
    p_title: discussionData.title,
    p_content: discussionData.content,
    p_author_email: discussionData.authorEmail,
    p_author_name: discussionData.authorName,
    p_attachments: discussionData.attachments,
  });

  if (error) throw error;

  console.log(data)

  return data
}

export const fetchDiscussion = async (groupId) => {
  try {
    const { data, error } = await supabase
      .from('vw_group_discussions')
      .select('*')
      .eq('group_id', groupId)
      .order('created_at', { ascending: false });

    if (error) throw error;
    // console.log(
    //   '=================================\n',
    //   data,
    //   '\n================================'
    // )
    return data
  } catch (err) {
    console.error('Fetch error:', err);
  }
}

export const replyDiscussion = async (memberReply) => {
  try {
    const { data, error } = await supabase.rpc('add_reply', {
      p_discussion_id: memberReply.discussionId,
      p_content: memberReply.content,
      p_attachments: memberReply.attachments,
      p_author_name: memberReply.author,
      p_author_email: memberReply.userEmail,
    });

    if (error) throw error;

    console.log('Discussion: \n', data)

    return data;
  } catch (err) {
    console.error('Reply error:', err);
    throw err;
  }
}

export const getDiscussionReplies = async (discussionId) => {
  if (!discussionId) return;

  const { data, error } = await supabase
    .rpc('pomy_get_replies', { p_discussion_id: discussionId });

  if (error) throw error;

  return data;
};

export const makeAnnouncement = async (announcement) => {
  const { data, error } = await supabase.rpc('pomy_add_announcement', {
    p_group_id: announcement.groupId,
    p_title: announcement.title,
    p_content: announcement.content,
    p_priority: announcement.priority,
    p_author_name: announcement.authorName,
    p_author_email: announcement.authorEmail,
    p_is_read: announcement.isRead
  });

  if (error) throw error;
  return data;
}

export const getGroupAnnouncements = async (groupId) => {
  if (!groupId) return;

  const { data, error } = await supabase
    .from('group_announcements_with_read')
    .select('*')
    .eq('group_id', groupId)
    .order('created_at', { ascending: false });

  if (error) throw error;

  console.log('=====Announcements====\n\t', data.length)
  return data;
};

export const markAnnouncementRead = async (announcementId, userEmail) => {
  if (!announcementId && !userEmail) return;

  const { error } = await supabase.rpc('mark_announcement_read', {
    p_announcement_id: announcementId,
    p_user_email: userEmail,
  });

  if (error) throw error;
};