import { useEffect, useState } from 'react';
import { TagEvent } from 'react-native-nfc-manager';
import NFCScanner from './NFCScanner';
import { TextInput, View, Text, Button } from 'react-native';
import { MainStyles } from '../../styles/styles';
import { bindStudentId, getStudentInfo, getStudentInfoByNFCId } from 'react-native-google-sheets-query';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { STORE_KEYS } from '../../screens/ConfigureScreen';
import LegacyNFCScanner from './LegacyNFCScanner';

export interface NFCUploadScannerProps {
    handleCodeScan: (res: string) => void;
}

export default function NFCUploadScanner(props: NFCUploadScannerProps) {
    const [uploadState, setUploadState] = useState<'TAG_SCAN' | 'INPUT_ID' | 'INPUT_FAILURE'>('TAG_SCAN');
    const [nfcId, setNfcId] = useState('');
    const [stdId, setStdId] = useState('');

    const [userSheetId, setUserSheetId] = useState('');
    const [userSheetRange, setUserSheetRange] = useState('');

    useEffect(() => {
        AsyncStorage.getItem(STORE_KEYS.KEY_USER_SHEET_ID).then(setUserSheetId);
        AsyncStorage.getItem(STORE_KEYS.KEY_USER_SHEET_RANGE).then(setUserSheetRange);
    }, []);

    const handleTag = async (tag: TagEvent) => {
        if (!tag) return;
        const uid = tag.id;
        if (!uid) return;

        setNfcId(uid);

        const studentInfo = await getStudentInfoByNFCId(userSheetId, userSheetRange, uid);
        if (studentInfo) {
            // student lookup successful
            props.handleCodeScan(studentInfo.studentId);
        } else {
            // couldn't find student. create new profile
            setUploadState('INPUT_ID');
        }
    };

    const handleCode = async () => {
        const studentId = stdId;
        setStdId('');
        const student = await getStudentInfo(userSheetId, userSheetRange, studentId);
        if (!student) {
            // no student find for such id. possibly not a robolancers member?
            setUploadState('INPUT_FAILURE');
        } else {
            await bindStudentId(userSheetId, userSheetRange, studentId, nfcId);
            props.handleCodeScan(studentId);
        }
    };

    return uploadState === 'TAG_SCAN' ? (
        <>
            <LegacyNFCScanner handleTagScan={handleTag} />
        </>
    ) : uploadState === 'INPUT_ID' ? (
        <View style={{ ...MainStyles.container, width: '100%' }}>
            <Text style={MainStyles.subtitle}>Please enter your Student ID</Text>
            <TextInput
                style={{ ...MainStyles.input, width: '50%' }}
                placeholder='Student ID'
                value={stdId}
                onChangeText={setStdId}
            />
            <Button title='Submit' onPress={handleCode} />
        </View>
    ) : uploadState === 'INPUT_FAILURE' ? (
        <View style={MainStyles.container}>
            <Text style={MainStyles.subtitle}>Invalid Student ID. Please try again. </Text>
            <Button title='Try Again' onPress={() => setUploadState('TAG_SCAN')} />
        </View>
    ) : (
        <></>
    );
}
