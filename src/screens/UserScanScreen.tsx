import { useContext, useEffect, useState } from 'react';
import { StyleSheet, View, Text, ToastAndroid } from 'react-native';
import CameraScanner from '../components/camera/CameraScanner';
import ErrorBanner from '../components/ErrorBanner';
import UserProfile from '../components/UserProfile';
import LoadingIndicator from '../components/LoadingIndicator';
import {
    StudentInfo,
    getDailyAttendanceEntry,
    getStudentInfo,
    loadStudentInfo,
    postAttendanceEntry,
} from 'react-native-google-sheets-query';
import { MainStyles } from '../styles/styles';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { STORE_KEYS, ScanType } from './ConfigureScreen';
import { oauthContext } from '../../App';
import NFCUploadScanner from '../components/nfc/NFCUploadScanner';
import Snackbar from 'react-native-snackbar';

export interface DisplayedStudentInfo extends StudentInfo {
    scanTime: string;
}

export default function UserScanScreen() {
    const [errorMessage, setErrorMessage] = useState('');

    const [displayUser, setDisplayUser] = useState<true | false | 'LOADING'>(false);
    const [data, setData] = useState('');
    const [lastId, setLastId] = useState('');
    const [displayedStudentInfo, setStudentInfo] = useState<DisplayedStudentInfo | null>(null);
    const userInfo = useContext(oauthContext);

    const [scanType, setScanType] = useState<ScanType>('CAMERA');

    // const [scanSound, setScanSound] = useState<Sound>();

    const formatDate = (date: Date) => {
        return `${date.getHours() === 12 || date.getHours() === 0 ? 12 : date.getHours() % 12}:${formatTwoDigits(
            date.getMinutes()
        )} ${date.getHours() >= 12 ? 'PM' : 'AM'}`;
    };

    const formatTwoDigits = (n: number) => {
        return n < 10 ? '0' + n : n;
    };

    const showError = (error: string) => {
        Snackbar.dismiss();
        if (error === '') return;
        Snackbar.show({
            text: error,
            duration: Snackbar.LENGTH_SHORT,
        });
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
            showError('You already scanned!');
            return;
        }
        setDisplayUser('LOADING');
        const info: StudentInfo = await getStudentInfo(userSheetId, userSheetRange, id);

        if (!info) {
            // student doesnt exist
            showError('Student not found. Please scan again. ');
            setDisplayUser(false);
            return;
        }

        const date = new Date();

        postAttendanceEntry(attdSheetId, attdSheetRange, id, date.toISOString()).then(async () => {
            const dispStudentInfo: DisplayedStudentInfo = {
                ...info,
                scanTime: formatDate(date),
            };

            setStudentInfo(dispStudentInfo);
            setDisplayUser(true);

            setLastId(id);

            setTimeout(() => {
                setDisplayUser(false);
            }, 2000);
        });

        setErrorMessage('');
    };

    const validateId = (id: string): boolean => {
        // TODO: validate that it's a valid student id
        return true;
    };

    useEffect(() => {
        (async () => {
            const userSheetId = await AsyncStorage.getItem(STORE_KEYS.KEY_USER_SHEET_ID);
            const userSheetRange = await AsyncStorage.getItem(STORE_KEYS.KEY_USER_SHEET_RANGE);
            loadStudentInfo(userSheetId, userSheetRange);
        })();
        AsyncStorage.getItem(STORE_KEYS.KEY_SCAN_TYPE).then((e) => {
            setScanType(e as ScanType);
        });
    }, []);

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
            {scanType === 'CAMERA' ? (
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
                            style={{
                                ...MainStyles.subsubtitle,
                                color: 'white',
                                alignSelf: 'flex-end',
                                marginBottom: 20,
                            }}
                        >
                            {data}
                        </Text>
                    </View>
                </CameraScanner>
            ) : scanType === 'NFC' ? (
                <NFCUploadScanner handleCodeScan={handleCodeScan} />
            ) : (
                <></>
            )}

            {displayUser === 'LOADING' ? (
                <View style={styles.darkenedContainer}>
                    <LoadingIndicator size={36} />
                </View>
            ) : displayUser ? (
                <UserProfile
                    name={`${displayedStudentInfo?.firstName ?? 'No'} ${displayedStudentInfo?.lastName ?? 'Student'}`}
                    id={displayedStudentInfo?.studentId ?? 'No Id'}
                    scanTime={displayedStudentInfo?.scanTime ?? 'None'}
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
