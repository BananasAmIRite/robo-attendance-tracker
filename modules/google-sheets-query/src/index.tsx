import { NativeModules, Platform } from 'react-native';

const LINKING_ERROR =
    `The package 'react-native-google-sheets-query' doesn't seem to be linked. Make sure: \n\n` +
    Platform.select({ ios: "- You have run 'pod install'\n", default: '' }) +
    '- You rebuilt the app after installing the package\n' +
    '- You are not using Expo Go\n';

const GoogleSheetsQuery = NativeModules.GoogleSheetsQuery
    ? NativeModules.GoogleSheetsQuery
    : new Proxy(
          {},
          {
              get() {
                  throw new Error(LINKING_ERROR);
              },
          }
      );

export interface UserInformation {
    accessToken: string;
}

export interface StudentInfo {
    studentId: string;
    studentName: string;
}

export interface AttendanceEntry {
    studentId: string;
    timestamp: string;
}

export function getUserInformation(): Promise<UserInformation> {
    return GoogleSheetsQuery.getUserInformation();
}

export function signIn(): Promise<UserInformation> {
    return GoogleSheetsQuery.signIn();
}

export function postAttendanceEntry(sheetId: string, studentId: string, dateTime: string): Promise<boolean> {
    return GoogleSheetsQuery.postAttendanceEntry(sheetId, studentId, dateTime);
}

export function getDailyAttendanceEntry(sheetId: string, studentId: string): Promise<{ entries: AttendanceEntry[] }> {
    return GoogleSheetsQuery.getDailyAttendanceEntry(sheetId, studentId);
}

export function getStudentInfo(sheetId: string, studentId: string): Promise<StudentInfo> {
    return GoogleSheetsQuery.getStudentInfo(sheetId, studentId);
}
