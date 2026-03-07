import React, { createContext, useState, useEffect } from "react";
import { Alert } from "react-native";
import {
  getAuth,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  signInWithPhoneNumber,
  updateProfile,
  updateEmail,
  updatePassword,
  EmailAuthProvider,
  reauthenticateWithCredential,
  GoogleAuthProvider,
  signInWithCredential,
} from "@react-native-firebase/auth";
import { GoogleSignin } from "@react-native-google-signin/google-signin";
import { jwtDecode } from "jwt-decode";
import {
  AUTH0_DOMAIN,
  AUTH0_CLIENT_ID,
  AUTH0_REDIRECT_URI,
  AUTH0_LOGOUT_REDIRECT_URI,
} from "../config/env";
import { supabase } from "../service/Supabase-Client";
import { syncUserProfile } from "../service/Supabase-Fuctions";
import AsyncStorage from '@react-native-async-storage/async-storage';

const auth0 = new Auth0({
  domain: AUTH0_DOMAIN,
  clientId: AUTH0_CLIENT_ID,
});

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [accessToken, setAccessToken] = useState(null);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const firebaseAuth = getAuth();
  const [isWorker, setIsWorker] = useState(false);

  // Function to check status (you can call this after login)
  const checkWorkerStatus = async (uid) => {
    if (!uid) {
      setIsWorker(false);
      return;
    }
    try {
      const { data, error } = await supabase
        .from("pomy_workers")
        .select("id")
        .eq("user_id", uid)
        .maybeSingle(); // maybeSingle is safer than .single() as it won't throw an error if not found

      setIsWorker(!!data);
    } catch (err) {
      console.error("Worker check failed:", err);
      setIsWorker(false);
    }
  };

  // Listen to Firebase auth state changes
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(
      firebaseAuth,
      async (currentUser) => {
        if (currentUser) {
          setUser(currentUser);
          // 2. CREATE OR UPDATE the profile in Supabase
          await syncUserProfile(currentUser);
          // App is opening with an existing logged-in user
          await checkWorkerStatus(currentUser.uid);
        } else {
          setUser(null);
          setIsWorker(false);
        }

        setLoading(false);
      },
    );

    return unsubscribe;
  }, [user]);

  useEffect(() => {
    GoogleSignin.configure({
      webClientId:
        "200364606139-5bkuo0she2e1lou9ruiq5qkvnej9lp3u.apps.googleusercontent.com",
    });
  }, []);

  const fireBaseGoogleLogin = async () => {
    // Check if your device supports Google Play
    await GoogleSignin.hasPlayServices({ showPlayServicesUpdateDialog: true });
    // Get the users ID token
    const signInResult = await GoogleSignin.signIn();

    // Try the new style of google-sign in result, from v13+ of that module
    idToken = signInResult.data?.idToken;
    if (!idToken) {
      // if you are using older versions of google-signin, try old style result
      idToken = signInResult.idToken;
    }
    if (!idToken) {
      throw new Error("No ID token found");
    }

    console.log("User", signInResult.data?.user);

    // Create a Google credential with the token
    const googleCredential = GoogleAuthProvider.credential(
      signInResult.data.idToken,
    );

    // Sign-in the user with the credential
    return signInWithCredential(getAuth(), googleCredential);
  };

  const googleLogin = async (connection) => {
    try {
      const credentials = await auth0.webAuth.authorize({
        scope: "openid profile email",
        connection,
        redirectUri: AUTH0_REDIRECT_URI,
      });

      // Decode the JWT to get user info
      const decodedUser = jwtDecode(credentials.idToken);

      // Store tokens & user info
      setAccessToken(credentials.accessToken);
      setUser(decodedUser);

      return credentials;
    } catch (error) {
      console.error(`Social login (${connection}) failed:`, error);
      throw error;
    }
  };

  const emailSignUp = async (name, email, password) => {
    try {
      const userCredential = await createUserWithEmailAndPassword(
        firebaseAuth,
        email,
        password,
      );
      const user = userCredential.user;
      // Update Firebase profile with the name
      await user.updateProfile({ displayName: name.trim() });
      // Explicitly sync to Supabase now that we have the name
      await syncUserProfile(firebaseUser);

      return user;
    } catch (error) {
      console.error("Sign Up Failed:", error.message);
      throw error;
    }
  };

  const emailLogin = async (email, password) => {
    try {
      const userCredential = await signInWithEmailAndPassword(
        firebaseAuth,
        email,
        password,
      );
      const user = userCredential.user;
      console.log("Logged in with:", user.email);
      return user;
    } catch (error) {
      console.error("Login Failed:", error.message);
      throw error;
    }
  };

  const phoneLogin = async (phoneNumber) => {
    try {
      const confirmationResult = await signInWithPhoneNumber(
        firebaseAuth,
        phoneNumber,
      );
      return confirmationResult;
    } catch (error) {
      console.error("Phone Login Failed:", error.message);
      throw error;
    }
  };

  const verifyOTP = async (confirmationResult, otp) => {
    try {
      const userCredential = await confirmationResult.confirm(otp);
      const user = userCredential.user;
      console.log("Verified phone:", user);
      return user;
    } catch (error) {
      console.error("OTP Verification Failed:", error.message);
      throw error;
    }
  };

  const logout = async () => {
    try {
      await signOut(firebaseAuth);

      setAccessToken(null);
      setUser(null);
      console.log("User signed out successfully!");
    } catch (error) {
      console.error("Logout failed:", error);
      throw error;
    }
  };

  // Inside your deleteAccount function in authProvider.js
  // const handleDelete = async () => {
  //   try {
  //     const currentUser = firebaseAuth.currentUser;
  //     if (currentUser) {
  //       // This line is the ONLY thing you need to trigger the cleanup.
  //       // Firebase triggers the Cloud Function the moment the user is removed.
  //       await currentUser.delete();

  //       Alert.alert(
  //         "Success",
  //         "Account and data have been permanently removed.",
  //       );
  //     }
  //   } catch (error) {
  //     if (error.code === "auth/requires-recent-login") {
  //       // Prompt user to log in again and then retry delete
  //     }
  //     console.log(error);
  //   }
  // };


  // ... existing code ...

const handleDeleteAccount = async (currentPassword) => {
  try {
    const user = firebaseAuth.currentUser;
    if (!user) return;

    // 1. Re-authenticate (Required by Firebase for account deletion)
    const credential = EmailAuthProvider.credential(user.email, currentPassword);
    await reauthenticateWithCredential(user, credential);

    // Clear the local timer before deleting
    await AsyncStorage.removeItem(`deletion_timer_${user.uid}`);

    // 2. Delete the user from Firebase
    // This will automatically trigger your Cloud Function to wipe Supabase
    await user.delete();    
    return { success: true };
  } catch (error) {
    console.log("Delete Account Error:", error);
    // throw error;
  }
};



  /**
   * Function to update the user's email address.
   * Requires the user's current password for re-authentication.
   *
   * @param {string} newEmail The new email address for the user.
   * @param {string} currentPassword The user's current password for re-authentication.
   */
  const sendEmailAddressChange = async (newEmail, currentPassword) => {
    if (!user) {
      Alert.alert("Error", "No user is currently logged in.");
      return;
    }

    // Check if the new email is actually different from the current one
    if (user.email === newEmail) {
      Alert.alert(
        "Info",
        "The new email is the same as the current email. No change needed.",
      );
      return;
    }

    try {
      // 1. Re-authenticate the user first
      const credential = EmailAuthProvider.credential(
        user.email,
        currentPassword,
      );
      await reauthenticateWithCredential(user, credential);
      console.log("User re-authenticated successfully.");

      // 2. Now attempt to update the email
      await updateEmail(user, newEmail);
      console.log("Email updated successfully to:", newEmail);
    } catch (error) {
      console.error("Error updating email:", error.code, error.message);
      let errorMessage = "An unknown error occurred.";

      switch (error.code) {
        case "auth/invalid-email":
          errorMessage = "The new email address format is invalid.";
          break;
        case "auth/email-already-in-use":
          errorMessage =
            "This email address is already in use by another account.";
          break;
        case "auth/wrong-password": // Re-authentication error
          errorMessage = "Incorrect current password. Please try again.";
          break;
        case "auth/user-not-found": // Should not happen if user is authenticated
          errorMessage =
            "User not found or credentials invalid during re-authentication.";
          break;
        case "auth/requires-recent-login":
          // This case should ideally be caught by reauthenticateWithCredential,
          // but can be a fallback if re-authentication wasn't performed correctly.
          errorMessage =
            "You need to recently log in again to update your email. Please re-enter your password.";
          break;
        default:
          errorMessage = `Failed to update email: ${error.message}`;
      }
      Alert.alert("Email Update Failed", errorMessage);
    }
  };

  const updateUserProfile = async (details) => {
    const firebaseUser = firebaseAuth.currentUser;
    if (!firebaseUser) throw new Error("No user logged in");

    try {
      // 1. Update Display Name (Non-sensitive)
      if (details.name && details.name !== firebaseUser.displayName) {
        await updateProfile(firebaseUser, { displayName: details.name });
        await syncUserProfile(firebaseUser);
      }

      // 2. Handle Sensitive Updates (Email/Password)
      if (details.newEmail || details.newPassword) {
        if (!details.currentPassword) {
          throw new Error(
            "To change your email or password, please enter your current password for security verification.",
          );
        }

        // // Re-authenticate
        // const credential = EmailAuthProvider.credential(
        //   firebaseUser.email,
        //   details.currentPassword,
        // );
        // await reauthenticateWithCredential(firebaseUser, credential);

        if (details.newEmail && details.newEmail !== firebaseUser.email) {
          await sendEmailAddressChange(
            details.newEmail,
            details.currentPassword,
          );
        }

        if (details.newPassword) {
          await updatePassword(firebaseUser, details.newPassword);
        }
      }

      // Refresh local user state
      await firebaseUser.reload();
      setUser(firebaseAuth.currentUser);
      return { success: true };
    } catch (error) {
      console.error("Update Profile Error:", error);
      throw error;
    }
  };

  /**
   * Handles the user account deletion process.
   * Requires the user's current password for re-authentication.
   *
   * @param {string} currentPassword The user's current password for re-authentication.
   */
  const deleteUserAccount = async (currentPassword) => {
    if (!user) {
      Alert.alert("Error", "No user is currently logged in.");
      return;
    }

    // 1. Confirm with the user that they want to delete their account
    Alert.alert(
      "Delete Account",
      "Are you sure you want to permanently delete your account? This action cannot be undone.",
      [
        {
          text: "Cancel",
          style: "cancel",
        },
        {
          text: "Delete",
          style: "destructive",
          onPress: async () => {
            // Move async logic inside here
            try {
              // 2. Re-authenticate the user first
              const credential = EmailAuthProvider.credential(
                user.email,
                currentPassword,
              );
              await reauthenticateWithCredential(user, credential);
              console.log("User re-authenticated successfully for deletion.");

              // 3. Now attempt to delete the user account
              await user.delete();
              Alert.alert(
                "Success",
                "Your account has been successfully deleted.",
              );
              console.log("User account deleted successfully.");

              // After deletion, the user is signed out.
              // You should navigate them back to a login/signup screen.
              // Example: navigation.navigate('AuthStack');

              // IMPORTANT: Also delete any associated user data from Firestore/Realtime DB
              // This would typically involve calling a Cloud Function (see below).
              // Example: await deleteUserDataCloudFunction({ uid: user.uid });
            } catch (error) {
              console.error(
                "Error deleting account:",
                error.code,
                error.message,
              );
              let errorMessage = "An unknown error occurred.";

              switch (error.code) {
                case "auth/requires-recent-login":
                  errorMessage =
                    "For security, please re-enter your password to confirm account deletion.";
                  break;
                case "auth/wrong-password":
                  errorMessage = "Incorrect password. Please try again.";
                  break;
                case "auth/network-request-failed":
                  errorMessage =
                    "Network error. Please check your internet connection.";
                  break;
                default:
                  errorMessage = `Failed to delete account: ${error.message}`;
              }
              Alert.alert("Account Deletion Failed", errorMessage);
            }
          },
        },
      ],
      { cancelable: true },
    );
  };

  const value = {
    fireBaseGoogleLogin,
    googleLogin,
    emailSignUp,
    emailLogin,
    phoneLogin,
    verifyOTP,
    logout,
    accessToken,
    user,
    loading,
    isWorker,
    setIsWorker,
    checkWorkerStatus,
    updateUserProfile,
    handleDeleteAccount,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
