import AsyncStorage from "@react-native-async-storage/async-storage";
import { useQuery } from '@realm/react';
import { API_BASE_URL } from "../config/env";

// ==================== Sacco Functions ==================== //
export const fetchSaccosPaginated = async (page = 1, limit = 20) => {
  try {
    const response = await fetch(
      `${API_BASE_URL}/api/get-saccos-products?page=${page}&limit=${limit}`,
      {
        method: "GET",
        headers: { "Content-Type": "application/json" },
      }
    );
    if (!response.ok) throw new Error(`Failed to fetch page ${page}`);
    return await response.json();
  } catch (error) {
    console.error("Error fetching saccos paginated:", error);
    throw error;
  }
};

export const fetchSaccos = async (onProgress) => {
  try {
    let allSaccos = [];
    let currentPage = 1;
    let totalPages = 1;
    do {
      const pageData = await fetchSaccosPaginated(currentPage, 20);
      const newSaccos = Array.isArray(pageData.products) ? pageData.products : [];
      if (newSaccos.length > 0) {
        allSaccos = [...allSaccos, ...newSaccos];
        if (typeof onProgress === "function") onProgress(allSaccos);
      }
      totalPages = pageData.totalPages || 1;
      currentPage++;
    } while (currentPage <= totalPages);
    return allSaccos;
  } catch (error) {
    console.error("Error fetching saccos:", error);
    throw error;
  }
};

export const fetchSaccosPromos = async (onProgress) => {
  try {
    let allPromos = [];
    let currentPage = 1;
    let totalPages = 1;
    do {
      const response = await fetch(
        `${API_BASE_URL}/api/get-all-saccos-promos?page=${currentPage}&limit=10`,
        {
          method: "GET",
          headers: { "Content-Type": "application/json" },
        }
      );
      if (!response.ok) throw new Error(`Failed to fetch page ${currentPage}`);

      const pageData = await response.json();

      const newPromos = Array.isArray(pageData)
        ? pageData
        : (pageData.promotions || []);

      if (Array.isArray(newPromos) && newPromos.length > 0) {
        allPromos = [...allPromos, ...newPromos];
        // Call callback with current progress (good for smooth UI)
        if (typeof onProgress === "function") {
          onProgress(allPromos);
        }
      }
      totalPages = pageData.totalPages || pageData.total_pages || currentPage;
      currentPage++;
    } while (currentPage <= totalPages);
    return allPromos;
  } catch (error) {

    console.error("Error fetching saccos promos:", error);
    throw error;
  };
};

/**
 * Add a like to a Sacco Product
 */
export const addSaccoProductLike = async (productId) => {
  try {
    if (!productId) {
      throw new Error("Product ID is required");
    }

    const response = await fetch(`${API_BASE_URL}/api/add-product-likes?productId=${productId}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || `Failed to add like: ${response.status}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Error adding like:", error);
    throw error;
  }
};

/**
 * Remove a like from a Sacco Product
 */
export const removeSaccoProductLike = async (productId) => {
  try {
    if (!productId) {
      throw new Error("Product ID is required");
    }

    const response = await fetch(`${API_BASE_URL}/api/remove-product-like?productId=${productId}`, {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || `Failed to remove like: ${response.status}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Error removing like:", error);
    throw error;
  }
};

export const addSaccoProductReviews = async ({ productId, reviewData }) => {
  try {
    if (!productId) {
      throw new Error("Product ID is required");
    }

    console.log(reviewData)

    if (!reviewData?.reviewerEmail || !reviewData?.rating || !reviewData?.comment) {
      throw new Error("User email, rating, and comment are required");
    }

    const response = await fetch(`${API_BASE_URL}/api/post-product-review?productId=${productId}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(reviewData),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || `Failed to add review: ${response.status}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Error adding review:", error);
    throw error;
  }
};

/**
 * Fetch products based on user filters with a fallback to closest matches.
 * @param {Object} filterObj - The filter object from the UI
 */
export const suggestSaccosProduct = async (filterObj) => {
  try {
    // Convert the filter object into a URL query string
    const queryString = Object.keys(filterObj)
      .filter(key => filterObj[key] !== "" && filterObj[key] !== "All") // Clean empty values
      .map(key => `${encodeURIComponent(key)}=${encodeURIComponent(filterObj[key])}`)
      .join('&');

    const url = `${API_BASE_URL}/api/get-suggest-saccos-products?${queryString}`;

    const response = await fetch(url, {
      method: "GET",
      headers: { "Content-Type": "application/json" },
    });

    if (!response.ok) {
      throw new Error("Network response was not ok " + response.statusText);
    }

    const data = await response.json();
    // Expected response shape: { success: true, message: "...", data: [...] }
    return data;
  } catch (error) {
    console.error("Error suggesting products:", error);
    throw error;
  }
};

// ==================== User Profile Management ==================== //
export const addUser = async (userData) => {
  try {
    const response = await fetch(`${API_BASE_URL}/api/add-profile`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(userData),
    });
    if (!response.ok) {
      console.error(response.arrayBuffer);
      throw new Error(response.status);
    }
    const data = await response.json();
    console.log(data.message);
    return data;
  } catch (error) {
    console.error("Error adding user:", error);
    throw error;
  }
};

export const getUserProfile = async (email) => {
  try {
    const response = await fetch(`${API_BASE_URL}/api/user-profile?email=${encodeURIComponent(email)}`,
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      }
    );
    if (!response.ok) {
      throw new Error("Network response was not ok " + response.statusText);
    }
    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Error fetching user profile:", error);
    throw error;
  }
};

export const updateUserProfile = async (id, updatedData) => {
  try {
    const response = await fetch(`${API_BASE_URL}/api/update-profile?id=${id}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(updatedData),
    });
    if (!response.ok) {
      throw new Error("Network response was not ok " + response.statusText);
    }
    const data = await response.json();
    return data;
  }
  catch (error) {
    console.error("Error updating user profile:", error);
    throw error;
  }
};

export const deleteUserProfile = async (id) => {
  try {
    const response = await fetch(`${API_BASE_URL}/api/delete-profile?id=${id}`, {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
      },
    });
    if (!response.ok) {
      throw new Error("Network response was not ok " + response.statusText);
    }
    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Error deleting user profile:", error);
    throw error;
  }
};

// ==================== Company & Publications & Promotions ==================== //
export const fetchAllCompanies = async (realm) => {
  try {
    let allCompanies = [];

    const response = await fetch(
      `${API_BASE_URL}/api/companies`,
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      }
    );

    if (!response.ok) {
      throw new Error("Network response was not ok " + response.statusText);
    }

    const data = await response.json();

    // Only take paid companies
    const paidCompanies = data.companies.filter((c) => c.paid === true);
    allCompanies = [...allCompanies, ...paidCompanies];

    realm.write(() => {
      // Clear existing data (optional; use delta updates if preferred)
      realm.delete(realm.objects('Entity'));

      // Write new entities
      allCompanies.forEach((entity) => {
        realm.create('Entity', {
          company_name: entity.company_name,
          view: entity.view || 0,
          company_type: entity.company_type || 'Government',
          company_tags: entity.company_tags || [],
          subscription_type: entity.subscription_type || 'Bronze',
          description: entity.description,
          phone: entity.phone || [],
          address: entity.address,
          address_coordinates: entity.address_coordinates || { type: 'Point', coordinates: [0, 0] },
          email: entity.email,
          logo: entity.logo || null,
          banner: entity.banner || null,
          large_description: entity.large_description || null,
          social_media: entity.social_media || [],
          working_hours: entity.working_hours || [],
          team: entity.team || [],
          gallery: entity.gallery || [],
          publications: entity.publications || [], // Assumes API returns ObjectId strings
          promotions: entity.promotions || [],
          services: entity.services || [],
          reviews: entity.reviews || [],
          created_at: new Date(entity.created_at),
          paid: entity.paid || false,
          paid_at: entity.paid_at ? new Date(entity.paid_at) : null,
          updated_at: entity.updated_at ? new Date(entity.updated_at) : null,
        });
      });
    });

    const timestamp = new Date().toISOString();
    await AsyncStorage.setItem("companies_timestamp", timestamp);

    return allCompanies;
  } catch (error) {
    console.error("Error fetching companies:", error);
    throw error;
  }
};

export const fetchAllCompaniesOffline = async (companies) => {
  try {
    const companyData = companies;
    return companyData;
  } catch (error) {
    console.error("Error retrieving companies:", error);
    return [];
  }
};

export const fetchCompaniesWithAge = async () => {
  try {
    const storedCompanies = await AsyncStorage.getItem("companies");
    const storedTimestamp = await AsyncStorage.getItem("companies_timestamp");

    if (storedCompanies && storedTimestamp) {
      const companies = JSON.parse(storedCompanies);
      const storedDate = new Date(storedTimestamp);
      const now = new Date();
      const diffInMilliseconds = now - storedDate;
      const diffInHours = diffInMilliseconds / (1000 * 60 * 60);

      console.log(`Data is ${diffInHours.toFixed(2)} hours old.`);
      return { companies, ageInHours: diffInHours };
    } else {
      return { companies: [], ageInHours: null };
    }
  } catch (error) {
    console.error("Error fetching companies from AsyncStorage:", error);
    return { companies: [], ageInHours: null };
  }
};

export const fetchPublications = async (onPageFetched) => {
  try {
    // Fetch the first page (3 items for fast UI load)
    const firstResponse = await fetch(
      `${API_BASE_URL}/api/news?page=1&limit=10`,
      {
        method: "GET",
        headers: { "Content-Type": "application/json" },
      }
    );

    if (!firstResponse.ok) {
      throw new Error(
        `Network response was not ok: ${firstResponse.statusText}`
      );
    }

    const firstData = await firstResponse.json();
    let allPublications = firstData.publications.map((item) => ({
      ...item,
      id: item._id,
      company_name: item.company_name,
      logo: item.company_logo,
      company_type: item.company_type,
      publications: item.news,
      email: item.email,
      phone: item.phone,
      address: item.address || "",
      social_media: item.social_media,
    }));

    // Trigger callback with initial data
    if (onPageFetched) {
      onPageFetched(allPublications);
    }

    // Background task to fetch remaining pages
    (async () => {
      try {
        let currentPage = 2;
        const totalPages = firstData.totalPages;

        while (currentPage <= totalPages) {
          const res = await fetch(
            `${API_BASE_URL}/api/news?page=${currentPage}&limit=10`,
            {
              method: "GET",
              headers: { "Content-Type": "application/json" },
            }
          );

          if (!res.ok) {
            console.warn(
              `Failed to fetch page ${currentPage}: ${res.statusText}`
            );
            break;
          }

          const pageData = await res.json();
          const newPublications = pageData.publications.map((item) => ({
            ...item,
            id: item._id,
            company_name: item.company_name || "",
            logo: item.company_logo || "",
            company_type: item.company_type || "",
            publications: item.news || [],
            email: item.email || "",
            address: item.address || "",
            phone: item.phone,
            social_media: item.social_media,
          }));

          allPublications = [...allPublications, ...newPublications];
          console.log(
            `Fetched page ${currentPage}, total publications:`,
            allPublications.length
          );

          // Trigger callback with updated data
          if (onPageFetched) {
            onPageFetched(allPublications);
          }

          currentPage++;
        }
      } catch (bgError) {
        console.warn("Background load failed:", bgError.message);
      }
    })();

    return { ...firstData, publications: allPublications };
  } catch (error) {
    console.error("Error fetching publications:", error.message);
    throw error;
  }
};

export const fetchPromotions = async (onPageFetched) => {
  try {
    // Map API promotion to UI-friendly format
    const mapPromotion = (item) => {
      const currentDate = new Date();

      // Filter ads to include only those with validUntil >= currentDate
      const validAds = item.ads.filter((adItem) => {
        const adValidUntil = new Date(adItem.validUntil);
        return adValidUntil >= currentDate;
      });

      // Only return the company object if it has at least one valid ad
      if (validAds.length === 0) {
        return null;
      }

      return {
        id: item._id || "",
        company_name: item.company_name || "",
        logo: item.company_logo || "",
        company_type: item.company_type || "",
        email: item.email || "",
        phone: item.phone || [],
        address: item.address || "",
        social_media: item.social_media || [],
        promotions: validAds,
      };
    };

    // Step 1: Fetch the first page (10 items for fast load)
    const firstResponse = await fetch(
      `${API_BASE_URL}/api/ads?page=1&limit=10`,
      {
        method: "GET",
        headers: { "Content-Type": "application/json" },
      }
    );

    if (!firstResponse.ok) {
      throw new Error(
        `Network response was not ok: ${firstResponse.statusText}`
      );
    }

    const firstData = await firstResponse.json();

    // Validate response
    if (!firstData.promotions || !Array.isArray(firstData.promotions)) {
      throw new Error("Invalid API response: promotions is not an array");
    }

    let currentAds = firstData.promotions
      .map(mapPromotion)
      .filter((item) => item !== null); // Remove companies with no valid ads

    // Trigger callback with initial data
    if (onPageFetched) {
      onPageFetched(currentAds);
    }

    // Step 2: Fetch remaining pages in background
    (async () => {
      try {
        let currentPage = 2;
        const totalPages = Number(firstData.totalPages) || 1;

        while (currentPage <= totalPages) {
          const res = await fetch(
            `${API_BASE_URL}/api/ads?page=${currentPage}&limit=10`,
            {
              method: "GET",
              headers: { "Content-Type": "application/json" },
            }
          );

          if (!res.ok) {
            console.warn(
              `Failed to fetch page ${currentPage}: ${res.statusText}`
            );
            break;
          }

          const pageData = await res.json();

          if (!pageData.promotions || !Array.isArray(pageData.promotions)) {
            console.warn(
              `Invalid API response for page ${currentPage}: promotions is not an array`
            );
            break;
          }

          const newPromotions = pageData.promotions
            .map(mapPromotion)
            .filter((item) => item !== null); // Remove companies with no valid ads

          currentAds = [...currentAds, ...newPromotions];

          // Trigger callback with updated data
          if (onPageFetched) {
            onPageFetched(currentAds);
          }

          currentPage++;
        }
      } catch (bgError) {
        console.warn("Background load failed:", bgError.message);
      }
    })();

    return { ...firstData, promotions: currentAds };
  } catch (error) {
    console.error("Error fetching promotions:", error.message);
    throw error;
  }
};

export const fetchCompanyAds = async (companyId) => {
  try {
    if (!companyId) {
      return res.status(400).json({ message: "Company ID is required" });
    }
    const response = await fetch(
      `${API_BASE_URL}/api/companyAds?companyId=${companyId}`,
      {
        method: "GET",
        headers: { "Content-Type": "application/json" },
      }
    );
    if (!response.ok) {
      throw new Error("Failed to fetch promotions OR company has no recent ads");
    }
    const fetchedPromotions = await response.json();

    return fetchedPromotions;
  } catch (err) {
    console.error('Error fetching promotions:', err);
    // throw new Error(err.message)
  }
}

export const fetchCompanyNews = async (companyId) => {
  try {
    if (!companyId) {
      return res.status(400).json({ message: "Company ID is required" });
    }

    const response = await fetch(
      `${API_BASE_URL}/api/companyNews?companyId=${companyId}`,
      {
        method: "GET",
        headers: { "Content-Type": "application/json" },
      }
    );

    if (!response.ok) {
      throw new Error("Failed to fetch publications");
    }

    const fetchedPublications = await response.json();

    return fetchedPublications;
  } catch (err) {
    console.error('Error fetching publications:', err);
    // throw new Error(err.message)
  }
};

export const fetchNotifications = async () => {
  try {
    // fetch notifications from mongoDB
    const mongoNots = await fetch(`${API_BASE_URL}/api/notifications`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!mongoNots.ok) {
      throw new Error('Failed to fetch Mongo Notifications notifications');
    }
    const notifications = await mongoNots.json();
    return notifications;
  } catch (err) {
    console.error('Error fetching notifications:', err.status, err.message);
    throw new Error(err.message);
  }
};

export const loadOfflineData = async (companies) => {
  try {
    const data = await fetchAllCompaniesOffline(companies);
    const companyData = data ? JSON.parse(data) : [];

    return companyData;
  } catch (err) {
    console.log("Offline Data Error:", err.message);
  }
};

export const useEntities = () => {
  return useQuery('Entity');
};
