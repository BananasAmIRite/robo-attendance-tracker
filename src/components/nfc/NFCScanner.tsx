import { useEffect, useState } from 'react';
import { View, Text, Button } from 'react-native';
import nfcManager, { NfcTech, TagEvent } from 'react-native-nfc-manager';
import { MainStyles } from '../../styles/styles';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';

nfcManager.start();

export type NFCScannerState = 'OFF' | 'SCANNING' | 'SCANNING_DONE';
export interface NFCScannerProps {
    handleTagScan: (tag: TagEvent) => void;
}

export default function NFCScanner(props: NFCScannerProps) {
    const [scannerState, setScannerState] = useState<NFCScannerState>('OFF');
    const readNfc = async () => {
        try {
            await nfcManager.requestTechnology(NfcTech.Ndef);
            const tag = await nfcManager.getTag();
            setScannerState('SCANNING_DONE');
            return tag;
        } catch (err) {
            console.error(err);
        } finally {
            nfcManager.cancelTechnologyRequest();
        }
        return null;
    };

    useEffect(() => {
        setScannerState('SCANNING');
        if (scannerState === 'SCANNING') readNfc().then(props.handleTagScan);

        return () => {
            // nfcManager.cancelTechnologyRequest();
        };
    }, [scannerState]);

    return (
        <View style={MainStyles.container}>
            {scannerState === 'SCANNING' ? (
                <>
                    <MaterialCommunityIcons name='card-search-outline' size={36} color='black' />
                    <Text style={MainStyles.subsubtitle}>Scanning for card...</Text>
                </>
            ) : scannerState === 'SCANNING_DONE' ? (
                <>
                    <MaterialCommunityIcons name='card-remove-outline' size={36} color='black' />
                    <Text style={MainStyles.subsubtitle}>Card scanned. Please remove. </Text>
                </>
            ) : scannerState === 'OFF' ? (
                <>
                    <MaterialCommunityIcons name='card-off-outline' size={36} color='black' />
                    <Text style={MainStyles.subsubtitle}>Idle</Text>
                    <Button title='Start Scanning' onPress={() => setScannerState('SCANNING')} />
                </>
            ) : (
                <></>
            )}
        </View>
    );
}
