import SpInAppUpdates, {
  IAUUpdateKind,
} from 'sp-react-native-in-app-updates';

const inAppUpdates = new SpInAppUpdates(false);

export async function checkForAppUpdate() {
  try {
    const result = await inAppUpdates.checkNeedsUpdate();

    if (result.shouldUpdate) {
      await inAppUpdates.startUpdate({
        updateType: IAUUpdateKind.IMMEDIATE,
      });
    }
  } catch (error) {
    console.log('Update check error:', error);
  }
}