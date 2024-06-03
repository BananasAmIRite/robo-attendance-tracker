import { BarcodeScanningResult, Camera, CameraView, useCameraPermissions } from 'expo-camera';
import { View, StyleSheet, Text, Button, ViewStyle, StyleProp, Platform } from 'react-native';

export interface CameraScannerProps {
    handleCodeScan: (res: string) => void;
    cameraStyle?: StyleProp<ViewStyle>;
}

export default function CameraScanner(props: CameraScannerProps) {
    const [permission, requestPermission] = useCameraPermissions();

    if (!permission) {
        // Camera permissions are still loading.
        return <View />;
    }

    if (!permission.granted) {
        // Camera permissions are not granted yet.
        return (
            <View style={styles.container}>
                <Text style={{ textAlign: 'center' }}>We need your permission to show the camera</Text>
                <Button onPress={requestPermission} title='grant permission' />
            </View>
        );
    }

    return (
        <CameraView
            style={props.cameraStyle}
            onBarcodeScanned={(res) => props.handleCodeScan(res.data)}
            barcodeScannerSettings={{
                barcodeTypes: ['code39'],
            }}
            // animateShutter={false}
            // autoFocus={AutoFocus.on}
            // zoom={Platform.OS === 'ios' ? 0.015 : 0}
        ></CameraView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        padding: '10%',
    },
    camera: {
        flex: 1,
    },
    buttonContainer: {
        flex: 1,
        flexDirection: 'row',
        backgroundColor: 'transparent',
        margin: 64,
    },
    text: {
        fontSize: 16,
        color: 'black',
    },
    title: {
        fontSize: 56,
        fontWeight: 'bold',
        color: 'black',
        textAlign: 'center',
    },
    subtitle: {
        fontSize: 48,
        fontWeight: 'bold',
        color: 'black',
        textAlign: 'center',
    },
});
