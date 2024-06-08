import { Button, View, Text, TextInput, StyleSheet, Switch } from 'react-native';
import { getStudentInfo, signIn, signOut } from 'react-native-google-sheets-query';
import React, { useContext, useEffect, useRef, useState } from 'react';
import { oauthContext } from '../../App';
import { MainStyles } from '../styles/styles';
import AsyncStorage from '@react-native-async-storage/async-storage';
import SwitchSelector from 'react-native-switch-selector';

export const STORE_KEYS = {
    KEY_USER_SHEET_ID: '@Attendance_USER_SHEET_ID',
    KEY_USER_SHEET_RANGE: '@Attendance_USER_SHEET_RANGE',
    KEY_USER_ATTD_ID: '@Attendance_USER_ATTENDANCE_ID',
    KEY_USER_ATTD_RANGE: '@Attendance_USER_ATTENDANCE_RANGE',

    KEY_SCAN_TYPE: '@Attendance_SCAN_TYPE',
};

export type ScanType = 'NFC' | 'CAMERA';

export default function ConfigureScreen() {
    const userData = useContext<string | null>(oauthContext);
    const [userSheetId, setUserSheetId] = useState('');
    const [userSheetRange, setUserSheetRange] = useState('');
    const [attendanceId, setAttendanceId] = useState('');
    const [attdSheetRange, setAttdSheetRange] = useState('');
    const [scanType, setScanType] = useState<ScanType>('CAMERA');

    const switchRef = useRef();

    const handleSignin = async () => {
        await signIn();
    };

    const handleSave = async () => {
        // TODO: implement
        AsyncStorage.setItem(STORE_KEYS.KEY_USER_SHEET_ID, userSheetId);
        AsyncStorage.setItem(STORE_KEYS.KEY_USER_SHEET_RANGE, userSheetRange);
        AsyncStorage.setItem(STORE_KEYS.KEY_USER_ATTD_ID, attendanceId);
        AsyncStorage.setItem(STORE_KEYS.KEY_USER_ATTD_RANGE, attdSheetRange);
        AsyncStorage.setItem(STORE_KEYS.KEY_SCAN_TYPE, scanType);
    };

    useEffect(() => {
        // get saved user and attendance ids if applicable
        AsyncStorage.multiGet([
            STORE_KEYS.KEY_USER_SHEET_ID,
            STORE_KEYS.KEY_USER_SHEET_RANGE,
            STORE_KEYS.KEY_USER_ATTD_ID,
            STORE_KEYS.KEY_USER_ATTD_RANGE,

            STORE_KEYS.KEY_SCAN_TYPE,
        ]).then((vals) => {
            setUserSheetId(vals[0][1] ?? '');
            setUserSheetRange(vals[1][1] ?? '');
            setAttendanceId(vals[2][1] ?? '');
            setAttdSheetRange(vals[3][1] ?? '');

            setScanType((vals[4][1] as ScanType) ?? 'CAMERA');
        });
    }, []);

    useEffect(() => {
        if (!switchRef || !switchRef.current) return;
        (switchRef.current as SwitchSelector).toggleItem(scanType == 'NFC' ? 0 : 1);
    }, [scanType]);

    return (
        <View
            style={{
                padding: '5%',
            }}
        >
            <View style={{ marginTop: 30 }}>
                <Text style={styles.formLabel}>Authentication</Text>
                {userData == null ? (
                    <View>
                        <Button title='Sign in with Google' onPress={handleSignin}></Button>
                    </View>
                ) : (
                    <>
                        <Text style={MainStyles.subsubtitle}>You're signed in!</Text>
                        <Button title='Sign Out' onPress={signOut} />
                    </>
                )}
            </View>

            <View style={{ marginTop: 30 }}>
                <Text style={styles.formLabel}>Sheet Configuration</Text>
                <View
                    style={{
                        padding: '5%',
                        paddingTop: '2%',
                    }}
                >
                    <View style={styles.inlineView}>
                        <TextInput
                            placeholder='User Sheet Id'
                            onChangeText={setUserSheetId}
                            value={userSheetId}
                            style={{ ...MainStyles.input, width: '60%' }}
                        />
                        <TextInput
                            placeholder='Range'
                            onChangeText={setUserSheetRange}
                            value={userSheetRange}
                            style={{ ...MainStyles.input, width: '40%' }}
                        />
                    </View>
                    <View style={styles.inlineView}>
                        <TextInput
                            placeholder='Attendance Sheet Id'
                            onChangeText={setAttendanceId}
                            value={attendanceId}
                            style={{ ...MainStyles.input, width: '60%' }}
                        />
                        <TextInput
                            placeholder='Range'
                            onChangeText={setAttdSheetRange}
                            value={attdSheetRange}
                            style={{ ...MainStyles.input, width: '40%' }}
                        />
                    </View>
                </View>
            </View>
            <View style={{ marginTop: 30 }}>
                <Text style={styles.formLabel}>Scanning</Text>
                <View
                    style={{
                        padding: '5%',
                        paddingTop: '2%',
                    }}
                >
                    <SwitchSelector
                        ref={switchRef}
                        options={[
                            {
                                label: 'NFC',
                                value: 'NFC',
                            },
                            {
                                label: 'Camera',
                                value: 'CAMERA',
                            },
                        ]}
                        onPress={(val) => {
                            setScanType(val);
                        }}
                        textColor={'#2196F3'}
                        selectedColor={'white'}
                        buttonColor={'#2196F3'}
                        borderColor={'#2196F3'}
                        disableValueChangeOnPress
                    />
                </View>
            </View>

            <Button title='Save Configuration' onPress={handleSave} />
        </View>
    );
}

const styles = StyleSheet.create({
    inlineView: {
        display: 'flex',
        // flex: 1,
        flexDirection: 'row',
        width: '100%',
    },
    formLabel: {
        fontSize: 20,
        color: 'black',
    },
});
