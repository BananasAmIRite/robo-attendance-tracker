import { View, StyleSheet, Text, Button } from 'react-native';
import CacheList from '../components/CacheList';
import { AttendanceEntry, flushAttendanceCache, getAttendanceCache } from 'react-native-google-sheets-query';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { STORE_KEYS } from './ConfigureScreen';
import Snackbar from 'react-native-snackbar';

export default function CacheScreen() {
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
