package com.googlesheetsquery;
import com.google.api.services.sheets.v4.Sheets;
import com.google.api.services.sheets.v4.model.ValueRange;
import java.io.IOException;
import java.util.Arrays;
import java.util.ArrayList;
import java.util.List;

public class AttendanceManager {

    public static void postAttendanceEntry(Sheets service, String sheetId, String sheetRange, String studentId, String date, String time) throws IOException {

        List<List<Object>> values = Arrays.asList(
                Arrays.asList(studentId, date, time)
        );
        ValueRange body = new ValueRange().setValues(values);

        service.spreadsheets().values().append(sheetId, sheetRange, body)
                .setValueInputOption("RAW")
                .execute();

        System.out.println("Attendance entry appended.");

    }

    public static List<AttendanceEntry> getAttendanceEntries(Sheets service, String sheetId, String sheetRange, String studentId) throws IOException {



        ValueRange response = service.spreadsheets().values()
                .get(sheetId, sheetRange)
                .execute();
        List<List<Object>> values = response.getValues();
        List<AttendanceEntry> attendanceEntries = new ArrayList<>();

        if (values != null) {
            for (List<Object> row : values) {
                if (row.get(0).equals(studentId)) {
                    attendanceEntries.add(new AttendanceEntry(
                            row.get(0).toString(),
                            row.get(1).toString(),
                            row.get(2).toString()
                    ));
                }
            }
        }

        return attendanceEntries;
    }

    public static class AttendanceEntry {
        private String studentId;
        private String date;
        private String time;

        public AttendanceEntry(String studentId, String date, String time) {
            this.studentId = studentId;
            this.date = date;
            this.time = time;
        }

        public String getStudentId() {
            return studentId;
        }

        public String getDate() {
            return date;
        }

        public String getTime() {
            return time;
        }
    }
}