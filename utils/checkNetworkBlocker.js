import NetInfo from "@react-native-community/netinfo";

/**
 * Returns a boolean indicating if the device is connected to the internet.
 */
export const isConnected = async () => {
  const state = await NetInfo.fetch();
  return state.isConnected && state.isInternetReachable;
};