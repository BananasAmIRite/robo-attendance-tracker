// import { StatusBar } from 'expo-status-bar';
import { DeviceEventEmitter, StyleSheet, Text, View } from 'react-native';
import UserScanScreen from './src/screens/UserScanScreen';
import { NavigationContainer } from '@react-navigation/native';
import ConfigureScreen from './src/screens/ConfigureScreen';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { UserInformation, getUserInformation } from 'react-native-google-sheets-query';
import { createContext, useEffect, useState } from 'react';

const Tab = createBottomTabNavigator();

export const oauthContext = createContext<UserInformation | null>(null);

export default function App() {
    const [userData, setUserData] = useState<UserInformation | null>(null);
    useEffect(() => {
        // DeviceEventEmitter.addListener('onUserData', (payload) => {
        //     console.log(payload);

        //     setUserData(JSON.parse(payload));
        // });
        getUserInformation().then(setUserData);
    }, []);

    return (
        <oauthContext.Provider value={userData}>
            <NavigationContainer>
                <Tab.Navigator>
                    <Tab.Screen name='Configure' component={ConfigureScreen} />
                    <Tab.Screen name='Scanner' component={UserScanScreen} />
                </Tab.Navigator>
            </NavigationContainer>
        </oauthContext.Provider>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#fff',
        alignItems: 'center',
        justifyContent: 'center',
    },
});
