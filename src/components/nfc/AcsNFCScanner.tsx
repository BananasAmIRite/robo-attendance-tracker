import React, { useState, useEffect } from 'react';
import { View, Button, Text, DeviceEventEmitter } from 'react-native';
import { MainStyles } from '../../styles/styles';
import { NFCScannerProps, NFCScannerState } from './LegacyNFCScanner';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import { close, connectToCard, getUid, init } from 'react-native-acs-nfc';

export default function AcsNFCScanner(props: NFCScannerProps) {
    const [scannerState, setScannerState] = useState<NFCScannerState | 'DEV_NOT_FOUND'>('OFF');

    useEffect(() => {
        console.log(scannerState);
        if (scannerState !== 'SCANNING') return;
        const stateChangeListener = async (data: any) => {
            console.log(data);
            if (data.currState === 'Present' && data.prevState === 'Absent' && scannerState === 'SCANNING') {
                connectToCard(0).then(async (cardResp) => {
                    console.log(cardResp);
                    const uid = await getUid(0);
                    props.handleTagScan({
                        ndefMessage: [],
                        id: uid,
                    });
                });
            }
        };

        console.log('Adding scanning listener...');

        DeviceEventEmitter.addListener('onStateChange', stateChangeListener);

        return () => {
            console.log('removing scanning listeners...');

            DeviceEventEmitter.removeAllListeners('onStateChange');
        };
    }, [scannerState]);

    useEffect(() => {
        init()
            .then(() => {
                console.log('init successful');
            })
            .catch(() => {
                setScannerState('DEV_NOT_FOUND');
            });

        setScannerState('SCANNING');

        return () => {
            close();
        };
    }, []);

    return (
        <View style={MainStyles.container}>
            {scannerState === 'SCANNING' ? (
                <>
                    <MaterialCommunityIcons name='card-search-outline' size={64} color='black' />
                    <Text style={MainStyles.subtitle}>Scanning for card...</Text>
                </>
            ) : scannerState === 'DEV_NOT_FOUND' ? (
                <>
                    <MaterialCommunityIcons name='card-off-outline' size={64} color='black' />
                    <Text style={MainStyles.subtitle}>No Scanning Device Found. Please Refresh.</Text>
                </>
            ) : //     <>
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
