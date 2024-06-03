import { useState } from 'react';
import { StyleSheet, View } from 'react-native';
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

    const formatDate = (date: Date) => {
        return `${date.getHours()}:${date.getMinutes()}`;
    };

    const handleCodeScan = async (id: string) => {
        // TODO: validate that it's a valid student id
        if (displayUser) return; // disable barcode scanning when user is being displayed
        console.log(id, lastId);
        if (id === lastId) {
            setErrorMessage('You already scanned!');
            return;
        }
        setData(id);
        setLastId(id);
        setDisplayUser('LOADING');
        const info: StudentInfo = await getStudentInfo('sheet_id', id);
        if (!info) {
            // student doesnt exist
            setErrorMessage('Student not found. Please scan again. ');
            return;
        }

        postAttendanceEntry('sheet_id', id, new Date().toUTCString()).then(async () => {
            const { entries } = await getDailyAttendanceEntry('sheet_id', id); // expect array of two values
            const startTime = entries.length >= 1 ? formatDate(new Date(entries[0].timestamp)) : null;
            const endTime = entries.length >= 2 ? formatDate(new Date(entries[1].timestamp)) : null; // TODO: probably not getTime but we'll see

            const dispStudentInfo: DisplayedStudentInfo = {
                ...info,
                dailyTimeIn: startTime,
                dailyTimeOut: endTime,
            };

            setStudentInfo(dispStudentInfo);
            setDisplayUser(true);
            setTimeout(() => {
                setDisplayUser(false);
            }, 2000);
        });

        setErrorMessage('');
    };

    return (
        <View style={styles.container}>
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
                }}
            />
            {displayUser === 'LOADING' ? (
                <View style={styles.darkenedContainer}>
                    <LoadingIndicator />
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
    container: {
        flex: 1,
        justifyContent: 'center',
    },
    darkenedContainer: {
        flex: 1,
        justifyContent: 'center',
        backgroundColor: 'rgba(255, 255, 255, 0.5)',
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
    button: {
        flex: 1,
        alignSelf: 'flex-end',
        alignItems: 'center',
    },
    text: {
        fontSize: 24,
        fontWeight: 'bold',
        color: 'white',
    },
});
