import Clipboard from '@react-native-clipboard/clipboard';
import { Linking, Platform, Share, Alert } from "react-native";
import { CustomToast } from "../components/customToast";
import { fetchAllCompaniesOffline } from "../service/getApi";
import SynonymsSearch from '../constants/synonymMap';
import { Images } from '../constants/Images';

export async function handleShareVia(method, business, selectedItem) {
  const deepLink = `https://industrylines.netlify.app/views/business-detail.html?id=${business._id}`; // Fallback URL
  const phoneNumbers = business?.phone && business?.phone?.length > 0
    ? business?.phone.map(phone => `${phone?.phone_type.charAt(0).toUpperCase() + phone?.phone_type.slice(1)}: ${phone?.number}`).join('\n')
    : 'No phone numbers available';
  const whatsAppNumbers = business?.phone && business?.phone.length > 0
    ? business.phone
      .filter(phone => phone?.phone_type.toLowerCase() === 'whatsapp' || phone?.phone_type.toLowerCase() === 'whatsApp')
      .map(phone => phone?.number)
      .join(', ')
    : 'No WhatsApp numbers available';
  const email = business?.email || 'No email available';
  const address = business?.address || 'No address available';

  let shareMessage;

  if (selectedItem !== null) {
    shareMessage = `Check out ${business?.company_name}!\n\n` +
      `🪧-${selectedItem.title}\n` +
      `📣-${selectedItem.tease_message || selectedItem.intro}\n` +
      `ℹ️-${selectedItem.description || selectedItem.content}\n` +
      `📆-${new Date(selectedItem.validUntil) || new Date(selectedItem.publish_date)}\n\n` +
      `Address: ${address}\n` +
      `Phone: ${phoneNumbers}\n` +
      `WhatsApp: ${whatsAppNumbers}\n` +
      `Email: ${email}\n` +
      `Learn more: ${deepLink} `;
  } else {
    shareMessage = `Check out ${business?.company_name}!\n\n` +
      `Address: ${address}\n` +
      `Phone: ${phoneNumbers}\n` +
      `WhatsApp: ${whatsAppNumbers}\n` +
      `Email: ${email}\n` +
      `Learn more: ${deepLink}`;
  }


  try {
    switch (method) {
      case "message":
        // Platform-specific SMS URL
        const smsUrl = Platform.OS === "ios"
          ? `sms:&body=${encodeURIComponent(shareMessage)}` // iOS uses semicolon
          : `smsto:?body=${encodeURIComponent(shareMessage)}`; // Android uses smsto
        console.log('SMS URL:', smsUrl);
        if (await Linking.canOpenURL(smsUrl)) {
          await Linking.openURL(smsUrl);
        } else {
          throw new Error('SMS client not available');
        }
        break;

      case "email":
        // Robust email URL with encoded parameters
        const emailSubject = encodeURIComponent(`${business?.company_name} - Business Directory`);
        const emailBody = encodeURIComponent(shareMessage);
        const emailUrl = `mailto:?subject=${emailSubject}&body=${emailBody}`;
        console.log('Email URL:', emailUrl);
        if (await Linking.canOpenURL('mailto:')) {
          await Linking.openURL(emailUrl);
        } else {
          throw new Error('Email client not available');
        }
        break;

      case "copy":
        if (!deepLink) {
          throw new Error('Invalid deep link');
        }
        Clipboard.setString(shareMessage);
        CustomToast('Copied', 'Business details copied to clipboard!')
        break;

      case "more":
        await Share.share({
          message: shareMessage,
          title: `${business?.company_name} - Business Directory`,
          url: deepLink,
        });
        break;

      default:
        break;
    }
  } catch (error) {
    console.error('Error in handleShareVia:', error.message);
    Alert.alert('Error', `Failed to share via ${method}: ${error.message} `);
  }
};

export async function handleCall(phoneNumber, e) {
  if (e) {
    e.stopPropagation();
  }

  if (!phoneNumber) {
    Alert.alert(
      "No Phone Number",
      "This business has no phone number listed."
    );
    return;
  }
  Linking.openURL(`tel:${phoneNumber.number} `)
}

export async function handleWhatsapp(phones, e) {
  if (e) {
    e.stopPropagation();
  }

  // Check if phones array is valid
  if (!phones || !Array.isArray(phones) || phones.length === 0) {
    Alert.alert(
      'No WhatsApp Number',
      'This business has no WhatsApp number listed.',
      [{ text: 'OK' }]
    );
    return;
  }

  // Find the first WhatsApp number
  const whatsappNumber = phones.find((phone) => phone.phone_type === 'whatsapp');
  if (!whatsappNumber) {
    Alert.alert(
      'No WhatsApp Number',
      'This business has no WhatsApp number listed.',
      [{ text: 'OK' }]
    );
    return;
  }

  // Clean and format the phone number
  let cleanNumber = whatsappNumber.number.replace(/[^\d+]/g, ''); // Keep digits and '+' for country code

  // Ensure the number starts with a country code (e.g., +27 for South Africa)
  if (!cleanNumber.startsWith('+')) {
    // Assuming South Africa country code as default (replace with your default if needed)
    cleanNumber = `+268${cleanNumber.replace(/^\+?0*/, '')}`; // Remove leading '0' and add country code
  }

  // Validate phone number format (basic check for length and digits)
  const isValidNumber = cleanNumber.length >= 6 && cleanNumber.length <= 15 && /^\+\d+$/.test(cleanNumber);

  if (!isValidNumber) {
    Alert.alert(
      'Invalid WhatsApp Number',
      'The provided WhatsApp number is invalid.',
      [{ text: 'OK' }]
    );
    return;
  }

  // Construct WhatsApp URL
  const whatsappUrl = `https://wa.me/${cleanNumber}`;

  try {
    // Check if the URL can be opened
    const supported = await Linking.canOpenURL(whatsappUrl);
    if (!supported) {
      Alert.alert(
        'WhatsApp Not Available',
        'WhatsApp is not installed on your device.',
        [{ text: 'OK' }]
      );
      return;
    }
    // Open WhatsApp chat
    await Linking.openURL(whatsappUrl);
  } catch (error) {
    console.error('Error opening WhatsApp:', error);
    Alert.alert(
      'Error',
      'Failed to open WhatsApp. Please try again.',
      [{ text: 'OK' }]
    );
  }
}

export async function handleEmail(email, e) {
  if (e) {
    e.stopPropagation();
  }
  Linking.openURL(`mailto:${email}`)
};

export async function handleLocation(address, e) {
  if (e) {
    e.stopPropagation();
  }
  const url = Platform.select({
    ios: `maps:0,0?q=${address}`,
    android: `geo:0,0?q=${address}`,
  })
  Linking.openURL(url)
}

export async function handleWebsite(business) {
  if (business.website) {
    Linking.openURL(business.website)
  } else {
    Alert.alert(`Website not Found','Company\'s own website could not be found\nTry this link though: https://industrylines.netlify.app/views/business-detail.html?id=${business._id}`)
  }
}

export async function handleBusinessPress(business, navigation, setSelectedBronzeBusiness, setUpgradeModalVisible) {
  if (
    business.subscription_type &&
    business.subscription_type.toLowerCase() === "bronze"
  ) {
    // For Bronze businesses, show upgrade modal instead of navigating
    setSelectedBronzeBusiness(business);
    setUpgradeModalVisible(true);
  } else {
    // For Silver and Gold, navigate to business detail
    navigation.navigate("BusinessDetails", { business });
  }
};

// Ensure getSynonyms uses the new synonymMap
export const getSynonyms = (term) => {
  const lowerTerm = term.toLowerCase();
  return Object.keys(SynonymsSearch).reduce((acc, key) => {
    if (lowerTerm.includes(key) || SynonymsSearch[key].some((syn) => lowerTerm.includes(syn))) {
      return [...acc, key, ...SynonymsSearch[key]];
    }
    return acc;
  }, [lowerTerm]);
};

export async function filterAllBusinesses(query = "", companies) {
  try {
    const data = companies;
    if (!data || data.length === 0) {
      return [];
    }

    // Split query into individual terms and get synonyms for each
    const queryTerms = query.toLowerCase().trim().split(/\s+/);
    const allSearchTerms = queryTerms.flatMap((term) => getSynonyms(term));

    const filtered = data.filter((business) => {
      // Combine all searchable fields into a single string
      const searchableText = [
        business.company_name || "",
        business.company_type || "",
        business.address || "",
        business.description || "",
        business.services?.join(" ") || "",
        business.keywords?.join(" ") || "",
      ]
        .join(" ")
        .toLowerCase();

      // Check if any query term or its synonyms match the searchable text
      return allSearchTerms.some((term) => searchableText.includes(term));
    });

    // Show toast if no results are found
    if (filtered.length === 0 && query) {
      console.log("No Results", "No businesses match your search. Try different keywords.");
    }

    return filtered;
  } catch (error) {
    console.log("Error filtering businesses:", error);
    CustomToast("Error", "Failed to filter businesses. Please try again.");
    return [];
  }
}
