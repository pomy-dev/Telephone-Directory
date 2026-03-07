const functions = require('firebase-functions');
const { createClient } = require('@supabase/supabase-js');
// import { supabase } from "./Supabase-Client";

// Use environment variables for security
const supabase = createClient(
  functions.config().supabase.url,
  functions.config().supabase.key
);

exports.onUserDeleted = functions.auth.user().onDelete(async (user) => {
  const { uid, email } = user; // Extract data from the deleted Firebase user

  try {
    // Call the Supabase RPC function we built
    const { error } = await supabase.rpc('delete_user_data_cascading', {
      target_user_id: uid,
      target_email: email
    });

    if (error) throw error;
    console.log(`Cleanup success for: ${uid}`);
    return null;
  } catch (err) {
    console.error(`Cleanup failed for ${uid}:`, err.message);
    return null; 
  }
});