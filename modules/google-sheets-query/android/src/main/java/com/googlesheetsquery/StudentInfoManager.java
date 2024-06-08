package com.googlesheetsquery;


import com.google.api.services.sheets.v4.Sheets;
import com.google.api.services.sheets.v4.model.ValueRange;
import java.io.IOException;
import java.security.GeneralSecurityException;
import java.util.List;

public class StudentInfoManager {

    public static StudentInfo getStudentInfo(Sheets service, String sheetId, String range, String studentId) throws GeneralSecurityException, IOException {

        ValueRange response = null;
        try {
            response = service.spreadsheets().values()
                    .get(sheetId, range)
                    .execute();
        } catch (IOException err) {
            System.out.println(err);
        }
        List<List<Object>> values = response.getValues();

        if (values != null) {
            for (List<Object> row : values) {
                if (row.get(2).equals(studentId)) { // Student ID is in the third column
                    String firstName = row.get(0).toString(); // First name is in the first column
                    String lastName = row.get(1).toString();  // Last name is in the second column
                    return new StudentInfo(firstName, lastName, studentId);
                }
            }
        }

        return null;
    }

    public static class StudentInfo {
        private String firstName;
        private String lastName;
        private String studentId;

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
    }
}