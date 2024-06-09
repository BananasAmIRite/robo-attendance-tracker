package com.googlesheetsquery;


import android.os.Build;

import com.facebook.react.bridge.Arguments;
import com.facebook.react.bridge.WritableMap;
import com.google.api.services.sheets.v4.Sheets;
import com.google.api.services.sheets.v4.model.UpdateValuesResponse;
import com.google.api.services.sheets.v4.model.ValueRange;
import java.io.IOException;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.List;
import java.util.function.Function;

public class StudentInfoManager {

    private final List<StudentInfo> studentInfoCache = new ArrayList<>();

    private RetrievalMode mode = RetrievalMode.OFFLINE;

    public StudentInfo getStudentInfoBySID(Sheets service, String sheetId, String range, String studentId) {
        System.out.println(studentId);
        return getStudentInfo(service, sheetId, range, (row) -> ArrayUtils.getOrElse(row, 2, "").equals(studentId), (info) -> {
            System.out.println("hi");
            System.out.println(info.getStudentId());
            return info.getStudentId().equals(studentId);
        });
    }

    public StudentInfo getStudentInfoByNFCID(Sheets service, String sheetId, String range, String NFCID) {
        return getStudentInfo(service, sheetId, range, (row) ->ArrayUtils.getOrElse(row, 3, "").equals(NFCID), (info) -> info.getNfcId().equals(NFCID));
    }

    private StudentInfo getStudentInfo(Sheets service, String sheetId, String range, Function<List<Object>, Boolean> onlineQualifier, Function<StudentInfo, Boolean> offlineQualifier) {
        System.out.println(mode);
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
                return getStudentInfo(service, sheetId, range, onlineQualifier, offlineQualifier);
            }
            List<List<Object>> values = response.getValues();

            System.out.println(values);

            if (values != null) {
                for (List<Object> row : values) {
                    if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.N && onlineQualifier.apply(row)) { // Student ID is in the third column
                        return StudentInfo.fromRow(row);
                    }
                }
            }
        } else {
            // offline mode, retrieve from local cache if available
            for (StudentInfo info : this.studentInfoCache) {
                if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.N && offlineQualifier.apply(info)) { // Student ID is in the third column
                    return info;
                }
            }
        }
        return null;
    }

    public void loadAllStudentInfo(Sheets service, String sheetId, String range) {
        if (mode != RetrievalMode.ONLINE) return;
        // load student info from online source into memory cache
        ValueRange response;
        try {
            response = service.spreadsheets().values()
                    .get(sheetId, range)
                    .execute();
        } catch (IOException err) {
            // couldnt load all student info, go to offline mode
            err.printStackTrace();
            setMode(RetrievalMode.OFFLINE);
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

    public void bindStudentId(Sheets service, String sheetId, String range, String studentId, String nfcId) throws IOException {
        try {
            // easiest way is to just reload cache ig
            loadAllStudentInfo(service, sheetId, range);

           List<List<Object>> values = new ArrayList<>();

            for (StudentInfo info : studentInfoCache) {
                if (info.studentId.equals(studentId)) info.setNfcId(nfcId);
                values.add(info.toRow());
            }

            ValueRange body = new ValueRange().setValues(values);
            UpdateValuesResponse updateResponse = service.spreadsheets().values()
                    .update(sheetId, range, body)
                    .setValueInputOption("RAW")
                    .execute();

            System.out.println("Student ID " + studentId + " successfully binded to NFC ID " + nfcId);

        } catch (Exception err) {
            err.printStackTrace();
            setMode(RetrievalMode.OFFLINE);
        }
    }

    public void setMode(RetrievalMode mode) {
        this.mode = mode;
    }

    public RetrievalMode getMode() {
        return mode;
    }

    public static class StudentInfo {
        private final String firstName;
        private final String lastName;
        private final String studentId;
        private String nfcId;

        public StudentInfo(String firstName, String lastName, String studentId, String nfcId) {
            this.firstName = firstName;
            this.lastName = lastName;
            this.studentId = studentId;
            this.nfcId = nfcId;
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

        public String getNfcId() {
            return nfcId;
        }

        public void setNfcId(String nfcId) {
            this.nfcId = nfcId;
        }

        @Override
        public String toString() {
            return "StudentInfo{" +
                    "firstName='" + firstName + '\'' +
                    ", lastName='" + lastName + '\'' +
                    ", studentId='" + studentId + '\'' +
                    ", nfcId='" + nfcId + '\'' +
                    '}';
        }

        public static StudentInfo fromRow(List<Object> row) {
            String firstName = ArrayUtils.getOrElse(row, 0, "").toString();
            String lastName = ArrayUtils.getOrElse(row, 1, "").toString();
            String studentIdValue = ArrayUtils.getOrElse(row, 2, "").toString();
            String nfcIdValue = ArrayUtils.getOrElse(row, 3, "").toString();
            return new StudentInfo(firstName, lastName, studentIdValue, nfcIdValue);
        }

        public List<Object> toRow() {
            return Arrays.asList(this.getFirstName(), this.getLastName(), this.getStudentId(), this.getNfcId());
        }

        public WritableMap toWritableMap() {
            // get student data by student id from the student data google sheet
            WritableMap map = Arguments.createMap();

            map.putString("studentId", getStudentId());
            map.putString("firstName", getFirstName());
            map.putString("lastName", getLastName());
            map.putString("nfcId", getNfcId());

            return map;
        }
    }
}