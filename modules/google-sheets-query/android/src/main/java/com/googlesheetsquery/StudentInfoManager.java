package com.googlesheetsquery;


import com.google.api.services.sheets.v4.Sheets;
import com.google.api.services.sheets.v4.model.ValueRange;
import java.io.IOException;
import java.util.ArrayList;
import java.util.List;

public class StudentInfoManager {

    private final List<StudentInfo> studentInfoCache = new ArrayList<>();

    private RetrievalMode mode = RetrievalMode.OFFLINE;

    public StudentInfo getStudentInfo(Sheets service, String sheetId, String range, String studentId) {
        if (mode == RetrievalMode.ONLINE) {
            // we're in online mode, retrieve data from sheets api
            ValueRange response;
            try {
                response = service.spreadsheets().values()
                        .get(sheetId, range)
                        .execute();
            } catch (IOException err) {
                // something's wrong. switch to offline mode and rerun request
                err.printStackTrace();
                setMode(RetrievalMode.OFFLINE);
                return getStudentInfo(service, sheetId, range, studentId);
            }
            List<List<Object>> values = response.getValues();

            if (values != null) {
                for (List<Object> row : values) {
                    if (row.get(2).equals(studentId)) { // Student ID is in the third column
                        return StudentInfo.fromRow(row);
                    }
                }
            }
        } else {
            // offline mode, retrieve from local cache if available
            for (StudentInfo info : this.studentInfoCache) {
                if (info.getStudentId().equals(studentId)) { // Student ID is in the third column
                    return info;
                }
            }
        }
        return null;
    }

    public void loadAllStudentInfo(Sheets service, String sheetId, String range) {
        // load student info from online source into memory cache
        ValueRange response = null;
        try {
            response = service.spreadsheets().values()
                    .get(sheetId, range)
                    .execute();
        } catch (IOException err) {
            err.printStackTrace();
            return;
        }
        List<List<Object>> values = response.getValues();

        studentInfoCache.clear();

        if (values != null) {
            for (List<Object> row : values) {
                studentInfoCache.add(StudentInfo.fromRow(row));
            }
        }

        System.out.println("loaded student info into cache...");
        System.out.println(studentInfoCache);
    }

    public void setMode(RetrievalMode mode) {
        this.mode = mode;
    }

    

    public static class StudentInfo {
        private final String firstName;
        private final String lastName;
        private final String studentId;

        public StudentInfo(String firstName, String lastName, String studentId) {
            this.firstName = firstName;
            this.lastName = lastName;
            this.studentId = studentId;
        }

        public String getFirstName() {
            return firstName;
        }

        public String getLastName() {
            return lastName;
        }

        public String getStudentId() {
            return studentId;
        }

        @Override
        public String toString() {
            return "StudentInfo{" +
                    "firstName='" + firstName + '\'' +
                    ", lastName='" + lastName + '\'' +
                    ", studentId='" + studentId + '\'' +
                    '}';
        }

        public static StudentInfo fromRow(List<Object> row) {
            String firstName = row.get(0).toString();
            String lastName = row.get(1).toString();
            String sid = row.get(2).toString();
            return new StudentInfo(firstName, lastName, sid);
        }
    }
}