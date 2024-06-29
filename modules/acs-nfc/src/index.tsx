import { NativeModules, Platform } from 'react-native';

const LINKING_ERROR =
    `The package 'react-native-acs-nfc' doesn't seem to be linked. Make sure: \n\n` +
    Platform.select({ ios: "- You have run 'pod install'\n", default: '' }) +
    '- You rebuilt the app after installing the package\n' +
    '- You are not using Expo Go\n';

const AcsNfc = NativeModules.AcsNfc
    ? NativeModules.AcsNfc
    : new Proxy(
          {},
          {
              get() {
                  throw new Error(LINKING_ERROR);
              },
          }
      );

export function init(): Promise<void> {
    return AcsNfc.init();
}

export function connectToCard(slotNumber: number): Promise<number[]> {
    return AcsNfc.connectToCard(slotNumber);
}

export function getUid(slotNumber: number): Promise<string> {
    return AcsNfc.getUid(slotNumber);
}

export function close(): Promise<void> {
    return AcsNfc.closeReader();
}
