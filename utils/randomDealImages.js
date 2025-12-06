import { Images } from '../constants/Images';

const BACKGROUNDS = [
  Images.single,
  Images.priceTag,
  Images.item,
  Images.product,
  Images.specialAlert,
  Images.travel,
  Images.computer,
  Images.deal,
  Images.handshake,
  Images.hotdeal,
  Images.offerbag,
  Images.specialoffer,
  Images.specialtimeout,
  Images.tagdeals
];

// Optional: fallback if you don't have enough images yet
const FALLBACK = Images.combo; // or any default

let comboIndex = 0;
let singleIndex = 0;

/**
 * Returns a random combo background image (different each call, loops nicely)
 */
export const getRandomComboImage = () => {
  if (BACKGROUNDS.length === 0) return FALLBACK;
  const img = BACKGROUNDS[comboIndex % BACKGROUNDS.length];
  comboIndex++;
  return img;
};

/**
 * Returns a random single item background image
 */
export const getRandomSingleImage = () => {
  if (BACKGROUNDS.length === 0) return FALLBACK;
  const img = BACKGROUNDS[singleIndex % BACKGROUNDS.length];
  singleIndex++;
  return img;
};

/**
 * Pure random (no sequential order) – alternative
 */
export const getRandomImages = () =>
  BACKGROUNDS[Math.floor(Math.random() * BACKGROUNDS.length)] || FALLBACK;