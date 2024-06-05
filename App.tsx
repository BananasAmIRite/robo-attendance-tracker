// import { StatusBar } from 'expo-status-bar';
import { DeviceEventEmitter, LogBox, StyleSheet } from 'react-native';
import UserScanScreen from './src/screens/UserScanScreen';
import { NavigationContainer } from '@react-navigation/native';
import ConfigureScreen from './src/screens/ConfigureScreen';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { UserInformation, getUserInformation } from 'react-native-google-sheets-query';
import React, { useEffect, useState } from 'react';
import Ionicons from '@expo/vector-icons/Ionicons';
import { numberOfDevices } from 'react-native-nfc';
import { oauthContext } from './src/context/OAuthContext';

const Tab = createBottomTabNavigator();

export default function App() {
    const [userData, setUserData] = useState<UserInformation | null>(null);
    useEffect(() => {
        numberOfDevices().then((a) => console.log(`Number of devices: ${a}`));

        DeviceEventEmitter.addListener('onAccessToken', (payload) => {
            console.log('gotten user info from token listener: ', payload);

            setUserData(JSON.parse(payload));
        });
        getUserInformation().then((data) => {
            console.log('gotten user information: ' + data);

            // setUserData();
        });
    }, []);

    return (
        <oauthContext.Provider value={userData}>
            <NavigationContainer>
                <Tab.Navigator
                    detachInactiveScreens
                    screenOptions={{
                        header: () => <></>,
                    }}
                >
                    <Tab.Screen
                        name='Configure'
                        component={ConfigureScreen}
                        options={{
                            tabBarIcon: (val) => (
                                <Ionicons
                                    name={val.focused ? 'settings' : 'settings-outline'}
                                    size={val.size}
                                    color={val.color}
                                />
                            ),
                        }}
                    />
                    <Tab.Screen
                        name='Scan'
                        component={UserScanScreen}
                        options={{
                            tabBarIcon: (val) => (
                                <Ionicons
                                    name={val.focused ? 'barcode' : 'barcode-outline'}
                                    size={val.size}
                                    color={val.color}
                                />
                            ),
                        }}
                    />
                </Tab.Navigator>
            </NavigationContainer>
        </oauthContext.Provider>
    );
}
