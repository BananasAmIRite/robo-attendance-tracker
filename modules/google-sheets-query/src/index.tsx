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

export interface StudentInfo {
    studentId: string;
    nfcId: string;
    firstName: string;
    lastName: string;
}

export interface AttendanceEntry {
    studentId: string;
    datetime: string;
}

// authentication

export function getUserInformation(): Promise<string | null> {
    return GoogleSheetsQuery.getUserInformation();
}

export function signIn(): Promise<string | null> {
    return GoogleSheetsQuery.signIn();
}

export function signOut(): Promise<void> {
    return GoogleSheetsQuery.signOut();
}

// attendance

export function postAttendanceEntry(
    sheetId: string,
    sheetRange: string,
    studentId: string,
    dateTime: string
): Promise<void> {
    return GoogleSheetsQuery.postAttendanceEntry(sheetId, sheetRange, studentId, dateTime);
}

export function getDailyAttendanceEntry(
    sheetId: string,
    sheetRange: string,
    studentId: string
): Promise<{ entries: AttendanceEntry[] }> {
    return GoogleSheetsQuery.getDailyAttendanceEntry(sheetId, sheetRange, studentId);
}

export function isAttendanceOnline(): Promise<boolean> {
    return GoogleSheetsQuery.isAttendanceOnline();
}

export function isStudentInfoOnline(): Promise<boolean> {
    return GoogleSheetsQuery.isStudentInfoOnline();
}

export function flushAttendanceCache(sheetId: string, sheetRange: string): Promise<void> {
    return GoogleSheetsQuery.flushAttendanceCache(sheetId, sheetRange);
}

export function getAttendanceCache(): Promise<AttendanceEntry[]> {
    return GoogleSheetsQuery.getAttendanceCache();
}

export function clearAttendanceCache(): Promise<void> {
    return GoogleSheetsQuery.clearAttendanceCache();
}

// student info

export function getStudentInfo(sheetId: string, sheetRange: string, studentId: string): Promise<StudentInfo | null> {
    return GoogleSheetsQuery.getStudentInfo(sheetId, sheetRange, studentId);
}

export function getStudentInfoByNFCId(sheetId: string, sheetRange: string, nfcId: string): Promise<StudentInfo | null> {
    return GoogleSheetsQuery.getStudentInfoByNFCId(sheetId, sheetRange, nfcId);
}

export function bindStudentId(sheetId: string, sheetRange: string, studentId: string, nfcId: string): Promise<void> {
    return GoogleSheetsQuery.bindStudentId(sheetId, sheetRange, studentId, nfcId);
}

export function loadStudentInfo(sheetId: string, sheetRange: string): Promise<void> {
    return GoogleSheetsQuery.loadStudentInfo(sheetId, sheetRange);
}
