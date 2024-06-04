import { Button, View, Text, TextInput, StyleSheet } from 'react-native';
import { UserInformation, signIn } from 'react-native-google-sheets-query';
import React, { useContext, useEffect, useState } from 'react';
import { oauthContext } from '../../App';
import { MainStyles } from '../styles/styles';
import AsyncStorage from '@react-native-async-storage/async-storage';

export const STORE_KEYS = {
    KEY_USER_SHEET_ID: '@Attendance_USER_SHEET_ID',
    KEY_USER_SHEET_RANGE: '@Attendance_USER_SHEET_RANGE',
    KEY_USER_ATTD_ID: '@Attendance_USER_ATTENDANCE_ID',
    KEY_USER_ATTD_RANGE: '@Attendance_USER_ATTENDANCE_RANGE',
};

export default function ConfigureScreen() {
    const userData = useContext<UserInformation | null>(oauthContext);
    const [userSheetId, setUserSheetId] = useState('');
    const [userSheetRange, setUserSheetRange] = useState('');
    const [attendanceId, setAttendanceId] = useState('');
    const [attdSheetRange, setAttdSheetRange] = useState('');

    const handleSignin = async () => {
        await signIn();
    };

    const handleSave = async () => {
        // TODO: implement
        AsyncStorage.setItem(STORE_KEYS.KEY_USER_SHEET_ID, userSheetId);
        AsyncStorage.setItem(STORE_KEYS.KEY_USER_SHEET_RANGE, userSheetRange);
        AsyncStorage.setItem(STORE_KEYS.KEY_USER_ATTD_ID, attendanceId);
        AsyncStorage.setItem(STORE_KEYS.KEY_USER_ATTD_RANGE, attdSheetRange);
    };

    useEffect(() => {
        // get saved user and attendance ids if applicable
        AsyncStorage.multiGet([
            STORE_KEYS.KEY_USER_SHEET_ID,
            STORE_KEYS.KEY_USER_SHEET_RANGE,
            STORE_KEYS.KEY_USER_ATTD_ID,
            STORE_KEYS.KEY_USER_ATTD_RANGE,
        ]).then((vals) => {
            setUserSheetId(vals[0][1]);
            setUserSheetRange(vals[1][1]);
            setAttendanceId(vals[2][1]);
            setAttdSheetRange(vals[3][1]);
        });
    }, []);

    return (
        <View
            style={{
                padding: '5%',
            }}
        >
            <View style={{ marginTop: 30 }}>
                {userData == null ? (
                    <View>
                        <Button title='Sign in with Google' onPress={handleSignin}></Button>
                    </View>
                ) : (
                    <Text style={MainStyles.subsubtitle}>You're signed in!</Text>
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
                            style={{ ...styles.input, width: '60%' }}
                        />
                        <TextInput
                            placeholder='Range'
                            onChangeText={setUserSheetRange}
                            value={userSheetRange}
                            style={{ ...styles.input, width: '40%' }}
                        />
                    </View>
                    <View style={styles.inlineView}>
                        <TextInput
                            placeholder='Attendance Sheet Id'
                            onChangeText={setAttendanceId}
                            value={attendanceId}
                            style={{ ...styles.input, width: '60%' }}
                        />
                        <TextInput
                            placeholder='Range'
                            onChangeText={setAttdSheetRange}
                            value={attdSheetRange}
                            style={{ ...styles.input, width: '40%' }}
                        />
                    </View>
                    <Button title='Save Configuration' onPress={handleSave} />
                </View>
            </View>
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
    input: {
        marginTop: 10,
        marginBottom: 10,
        paddingRight: 20,
        overflow: 'scroll',
    },
    formLabel: {
        fontSize: 20,
        color: 'black',
    },
});
