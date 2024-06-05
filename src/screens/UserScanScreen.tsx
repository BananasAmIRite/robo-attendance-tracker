import { useContext, useState } from 'react';
import { StyleSheet, View, Text } from 'react-native';
import CameraScanner from '../components/CameraScanner';
import ErrorBanner from '../components/ErrorBanner';
import UserProfile from '../components/UserProfile';
import LoadingIndicator from '../components/LoadingIndicator';
import {
    StudentInfo,
    getDailyAttendanceEntry,
    getStudentInfo,
    postAttendanceEntry,
} from 'react-native-google-sheets-query';
import { MainStyles } from '../styles/styles';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { STORE_KEYS } from './ConfigureScreen';
import { oauthContext } from '../context/OAuthContext';

export interface DisplayedStudentInfo extends StudentInfo {
    dailyTimeIn: string | null;
    dailyTimeOut: string | null;
}

export default function UserScanScreen() {
    const [errorMessage, setErrorMessage] = useState('');

    const [displayUser, setDisplayUser] = useState<true | false | 'LOADING'>(false);
    const [data, setData] = useState('');
    const [lastId, setLastId] = useState('');
    const [displayedStudentInfo, setStudentInfo] = useState<DisplayedStudentInfo | null>(null);
    const userInfo = useContext(oauthContext);

    const formatDate = (date: Date) => {
        return `${date.getHours()}:${date.getMinutes()}`;
    };

    const handleCodeScan = async (id: string) => {
        const userSheetId = await AsyncStorage.getItem(STORE_KEYS.KEY_USER_SHEET_ID);
        const userSheetRange = await AsyncStorage.getItem(STORE_KEYS.KEY_USER_SHEET_RANGE);
        const attdSheetId = await AsyncStorage.getItem(STORE_KEYS.KEY_USER_ATTD_ID);
        const attdSheetRange = await AsyncStorage.getItem(STORE_KEYS.KEY_USER_ATTD_RANGE);

        setData(id);
        if (!validateId(id)) return;

        if (displayUser) return; // disable barcode scanning when user is being displayed
        if (id === lastId) {
            setErrorMessage('You already scanned!');
            return;
        }
        setDisplayUser('LOADING');
        const info: StudentInfo = await getStudentInfo(userInfo.accessToken, userSheetId, userSheetRange, id);
        if (!info) {
            // student doesnt exist
            setErrorMessage('Student not found. Please scan again. ');
            return;
        }

        postAttendanceEntry(userInfo.accessToken, attdSheetId, attdSheetRange, id, new Date().toUTCString()).then(
            async () => {
                const { entries } = await getDailyAttendanceEntry(
                    userInfo.accessToken,
                    attdSheetId,
                    attdSheetRange,
                    id
                ); // expect array of two values
                const startTime = entries.length >= 1 ? formatDate(new Date(entries[0].timestamp)) : null;
                const endTime = entries.length >= 2 ? formatDate(new Date(entries[1].timestamp)) : null;

                const dispStudentInfo: DisplayedStudentInfo = {
                    ...info,
                    dailyTimeIn: startTime,
                    dailyTimeOut: endTime,
                };

                setStudentInfo(dispStudentInfo);
                setDisplayUser(true);

                setLastId(id);
                setTimeout(() => {
                    setDisplayUser(false);
                }, 2000);
            }
        );

        setErrorMessage('');
    };

    const validateId = (id: string): boolean => {
        // TODO: validate that it's a valid student id
        return true;
    };

    return (
        <View style={MainStyles.container}>
            <ErrorBanner
                message={errorMessage}
                show={errorMessage !== ''}
                minHeight={'5%'}
                bannerStyle={{
                    paddingTop: '4%',
                    paddingBottom: '3%',
                    paddingHorizontal: '2.5%',
                    position: 'absolute',
                    left: 0,
                    top: 0,
                    overflow: 'hidden',
                    zIndex: 1000,
                }}
            />
            <CameraScanner
                handleCodeScan={handleCodeScan}
                cameraStyle={{
                    // @ts-expect-error
                    ...StyleSheet.absoluteFill,
                    zIndex: -10,
                    flex: 1,
                    width: '100%',
                    height: '100%',
                }}
            >
                <View
                    style={{
                        flex: 1,
                        flexDirection: 'row',
                        backgroundColor: 'transparent',
                        width: '100%',
                        justifyContent: 'center',
                    }}
                >
                    <Text
                        style={{ ...MainStyles.subsubtitle, color: 'white', alignSelf: 'flex-end', marginBottom: 20 }}
                    >
                        {data}
                    </Text>
                </View>
            </CameraScanner>
            {displayUser === 'LOADING' ? (
                <View style={styles.darkenedContainer}>
                    <LoadingIndicator size={36} />
                </View>
            ) : displayUser ? (
                <UserProfile
                    name={displayedStudentInfo?.studentName ?? 'No Student'}
                    id={displayedStudentInfo?.studentId ?? 'No Id'}
                    dailyInTime={displayedStudentInfo?.dailyTimeIn ?? 'None'}
                    dailyOutTime={displayedStudentInfo?.dailyTimeOut ?? 'None'}
                    attendanceStatus='PRESENT'
                    action='SCAN_IN'
                ></UserProfile>
            ) : (
                <></>
            )}
        </View>
    );
}

const styles = StyleSheet.create({
    darkenedContainer: {
        flex: 1,
        justifyContent: 'center',
        backgroundColor: 'rgba(255, 255, 255, 0.5)',
        width: '100%',
        height: '100%',
    },
});
