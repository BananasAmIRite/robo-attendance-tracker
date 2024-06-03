import { Button, View, Text, TextInput } from 'react-native';
import { UserInformation, signIn } from 'react-native-google-sheets-query';
import React, { useContext, useEffect, useState } from 'react';
import { oauthContext } from '../../App';

export default function ConfigureScreen() {
    const userData = useContext<UserInformation | null>(oauthContext);
    const [userSheetId, setUserSheetId] = useState('');
    const [attendanceId, setAttendanceId] = useState('');

    const handleSignin = async () => {
        await signIn();
    };

    const handleSave = () => {
        // TODO: implement
    };

    useEffect(() => {
        // get saved user and attendance ids if applicable
    }, []);

    return userData == null ? (
        <View>
            <Button title='Sign in with Google' onPress={handleSignin}></Button>
            <TextInput placeholder='User Sheet Id' />
            <TextInput placeholder='Attendance Sheet Id' />
            <Button title='Save Configuration' onPress={handleSave} />
        </View>
    ) : (
        <Text>You're signed in!</Text>
    );
}
