import { useEffect, useState } from 'react';
import { View, Text, Button } from 'react-native';
import nfcManager, { NfcEvents, NfcTech, TagEvent } from 'react-native-nfc-manager';
import { MainStyles } from '../../styles/styles';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';

// nfcManager.start();

export type NFCScannerState = 'OFF' | 'SCANNING';
export interface NFCScannerProps {
    handleTagScan: (tag: TagEvent) => void;
}

export default function LegacyNFCScanner(props: NFCScannerProps) {
    const [scannerState, setScannerState] = useState<NFCScannerState>('OFF');

    const cleanUp = () => {
        console.log('cleaning up');

        nfcManager.setEventListener(NfcEvents.DiscoverTag, null);
        nfcManager.setEventListener(NfcEvents.SessionClosed, null);
    };

    const onNFCRead = async (tag: TagEvent) => {
        props.handleTagScan(tag);
    };

    const addNfcListeners = () => {
        nfcManager.setEventListener(NfcEvents.DiscoverTag, (tag) => {
            onNFCRead(tag);
        });
        nfcManager.setEventListener(NfcEvents.SessionClosed, () => {
            cleanUp();
        });
        console.log('registering');

        nfcManager.registerTagEvent();
    };

    useEffect(() => {
        setScannerState('SCANNING');
    }, []);

    useEffect(() => {
        if (scannerState === 'SCANNING') addNfcListeners();

        return () => {
            console.log('unregistering');

            nfcManager.unregisterTagEvent();
            cleanUp();
        };
    }, [scannerState]);

    return (
        <View style={MainStyles.container}>
            {scannerState === 'SCANNING' ? (
                <>
                    <MaterialCommunityIcons name='card-search-outline' size={64} color='black' />
                    <Text style={MainStyles.subtitle}>Scanning for card...</Text>
                </>
            ) : //  : scannerState === 'SCANNING_DONE' ? (
            //     <>
            //         <MaterialCommunityIcons name='card-remove-outline' size={64} color='black' />
            //         <Text style={MainStyles.subtitle}>Card scanned. Please remove. </Text>
            //     </>
            // )
            scannerState === 'OFF' ? (
                <>
                    <MaterialCommunityIcons name='card-off-outline' size={64} color='black' />
                    <Text style={MainStyles.subtitle}>Idle</Text>
                    <Button title='Start Scanning' onPress={() => setScannerState('SCANNING')} />
                </>
            ) : (
                <></>
            )}
        </View>
    );
}
