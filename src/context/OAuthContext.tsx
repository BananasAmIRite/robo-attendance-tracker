import { createContext } from 'react';
import { UserInformation } from 'react-native-google-sheets-query';

export const oauthContext = createContext<UserInformation | null>(null);
