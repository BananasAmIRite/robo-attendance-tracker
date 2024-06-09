import { View, StyleSheet, Text, Button } from 'react-native';
import CacheList from '../components/CacheList';
import {
    AttendanceEntry,
    flushAttendanceCache,
    getAttendanceCache,
    isAttendanceOnline,
    isStudentInfoOnline,
} from 'react-native-google-sheets-query';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { STORE_KEYS } from './ConfigureScreen';
import Snackbar from 'react-native-snackbar';
import { useEffect, useState } from 'react';
import { MainStyles } from '../styles/styles';

export default function CacheScreen() {
    const [attendanceOnline, setAttendanceOnline] = useState(false);
    const [studentInfoOnline, setStudentInfoOnline] = useState(false);

    useEffect(() => {
        isAttendanceOnline().then(setAttendanceOnline);
        isStudentInfoOnline().then(setStudentInfoOnline);
    }, []);

    const onlineStatusText = (isOnline) => {
        return isOnline ? (
            <Text style={{ color: 'green' }}>Online</Text>
        ) : (
            <Text style={{ color: 'red' }}>Offline</Text>
        );
    };

    const showMessage = (error: string) => {
        Snackbar.dismiss();
        if (error === '') return;
        Snackbar.show({
            text: error,
            duration: Snackbar.LENGTH_SHORT,
        });
    };

    return (
        <View
            style={{
                padding: '5%',
            }}
        >
            <View style={{ marginTop: 30 }}>
                <Text style={styles.formLabel}>Online Status</Text>
                <Text>
                    An offline status will result in data being sent to and retrieved from cache instead of online.{' '}
                </Text>
                <Text>Re-login to refresh status</Text>
                <Text>Attendance Online: {onlineStatusText(attendanceOnline)}</Text>
                <Text>Student Info Online: {onlineStatusText(studentInfoOnline)}</Text>
            </View>
            <View style={{ marginTop: 30 }}>
                <Text style={styles.formLabel}>Attendance Cache</Text>
                <CacheList<AttendanceEntry>
                    getCache={getAttendanceCache}
                    cacheToValues={(e) => [e.studentId, new Date(e.datetime).toLocaleString()]}
                    labels={['Student Id', 'DateTime']}
                    style={{
                        height: '40%',
                    }}
                />
                <Button
                    title='Upload Attendance Cache'
                    onPress={async () =>
                        await flushAttendanceCache(
                            await AsyncStorage.getItem(STORE_KEYS.KEY_USER_ATTD_ID),
                            await AsyncStorage.getItem(STORE_KEYS.KEY_USER_ATTD_RANGE)
                        )
                            .then(() => {
                                showMessage('Uploaded Attendance Successfully!');
                            })
                            .catch((err) => {
                                showMessage(`Error: ${err}`);
                            })
                    }
                />
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    formLabel: {
        fontSize: 20,
        color: 'black',
    },
});
