import { NativeModules, Platform } from "react-native";

const LINKING_ERROR =
  `The package 'react-native-google-sheets-query' doesn't seem to be linked. Make sure: \n\n` +
  Platform.select({ ios: "- You have run 'pod install'\n", default: "" }) +
  "- You rebuilt the app after installing the package\n" +
  "- You are not using Expo Go\n";

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
  studentName: string;
}

export interface AttendanceEntry {
  studentId: string;
  timestamp: string;
}

export function getUserInformation(): Promise<string | null> {
  return GoogleSheetsQuery.getUserInformation();
}

export function signIn(): Promise<string | null> {
  return GoogleSheetsQuery.signIn();
}

export function postAttendanceEntry(
  accessToken: string,
  sheetId: string,
  sheetRange: string,
  studentId: string,
  dateTime: string
): Promise<boolean> {
  return GoogleSheetsQuery.postAttendanceEntry(
    accessToken,
    sheetId,
    sheetRange,
    studentId,
    dateTime
  );
}

export function getDailyAttendanceEntry(
  accessToken: string,
  sheetId: string,
  sheetRange: string,
  studentId: string
): Promise<{ entries: AttendanceEntry[] }> {
  return GoogleSheetsQuery.getDailyAttendanceEntry(
    accessToken,
    sheetId,
    sheetRange,
    studentId
  );
}

export function getStudentInfo(
  accessToken: string,
  sheetId: string,
  sheetRange: string,
  studentId: string
): Promise<StudentInfo> {
  return GoogleSheetsQuery.getStudentInfo(
    accessToken,
    sheetId,
    sheetRange,
    studentId
  );
}
