// import type { FunctionComponent } from 'react';
// import { StyleSheet, View } from 'react-native';
// import { Camera, useCameraDevices, useCodeScanner } from 'react-native-vision-camera';
import { CameraScannerProps } from './CameraScanner';

export default function BarcodeScanner(props: CameraScannerProps) {
    // // @NOTE you must properly ask for camera permissions first!
    // // You should use `PermissionsAndroid` for Android and `Camera.requestCameraPermission()` on iOS.
    // //
    // const codeScanner = useCodeScanner({
    //     codeTypes: ['code-39'],
    //     onCodeScanned: (codes) => {
    //         for (const code of codes) {
    //             props.handleCodeScan(code.value);
    //         }
    //     },
    // });
    // const devices = useCameraDevices();
    // const device = devices.find(({ position }) => position === 'back');
    // if (!device) {
    //     return null;
    // }
    // return (
    //     <View style={{ flex: 1 }}>
    //         <Camera style={StyleSheet.absoluteFill} device={device} codeScanner={codeScanner} isActive />
    //     </View>
    // );
}
