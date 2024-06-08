// import { StatusBar } from 'expo-status-bar';
import { DeviceEventEmitter, LogBox, StyleSheet } from 'react-native';
import UserScanScreen from './src/screens/UserScanScreen';
import { NavigationContainer } from '@react-navigation/native';
import ConfigureScreen from './src/screens/ConfigureScreen';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { getUserInformation } from 'react-native-google-sheets-query';
import React, { createContext, useEffect, useState } from 'react';
import Ionicons from '@expo/vector-icons/Ionicons';
import CacheScreen from './src/screens/CacheScreen';
import { MaterialIcons } from '@expo/vector-icons';

LogBox.ignoreLogs(['Require cycle:']);

const Tab = createBottomTabNavigator();

export const oauthContext = createContext<string | null>(null);

export default function App() {
    const [userData, setUserData] = useState<string | null>(null);
    useEffect(() => {
        DeviceEventEmitter.addListener('onAccessToken', (payload) => {
            console.log('gotten user info from token listener: ', payload);

            setUserData(payload);
        });
        getUserInformation().then((data) => {
            console.log('gotten user information: ' + data);

            setUserData(data);
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
                            unmountOnBlur: true,
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
                            unmountOnBlur: true,
                        }}
                    />
                    <Tab.Screen
                        name='Cache'
                        component={CacheScreen}
                        options={{
                            tabBarIcon: (val) => <MaterialIcons name='cached' size={val.size} color={val.color} />,
                            unmountOnBlur: true,
                        }}
                    />
                </Tab.Navigator>
            </NavigationContainer>
        </oauthContext.Provider>
    );
}
