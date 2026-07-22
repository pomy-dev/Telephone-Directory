import { Linking } from 'react-native';
import { getAppVersionInfo } from './getApi';

export async function checkForAppUpdates() {
  const result = await getAppVersionInfo();

  if (!result) {
    return {
      needsUpdate: false,
      forceUpdate: false,
    };
  }

  const { currentBuild, config } = result;

  const forceUpdate =
    currentBuild < config.previousBuild;

  const optionalUpdate =
    currentBuild < config.latestBuild;

  return {
    forceUpdate,
    optionalUpdate,
    playStoreUrl: config.playStoreUrl,
    latestVersion: config.latestVersion,
  };
}

export async function openStore(url) {
  await Linking.openURL(url);
}