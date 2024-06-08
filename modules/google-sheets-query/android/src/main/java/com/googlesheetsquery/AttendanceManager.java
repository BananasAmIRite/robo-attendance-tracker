package com.googlesheetsquery;
import android.content.Context;

import androidx.room.Room;
import androidx.room.RoomDatabase;

import com.facebook.react.bridge.Arguments;
import com.facebook.react.bridge.WritableMap;
import com.google.api.services.sheets.v4.Sheets;
import com.google.api.services.sheets.v4.model.Sheet;
import com.google.api.services.sheets.v4.model.ValueRange;
import com.googlesheetsquery.room.dao.AttendanceDao;
import com.googlesheetsquery.room.data.Attendance;
import com.googlesheetsquery.room.database.AttendanceDatabase;

import java.io.IOException;
import java.time.LocalDate;
import java.time.LocalTime;
import java.time.OffsetDateTime;
import java.time.ZoneId;
import java.time.format.DateTimeFormatter;
import java.time.format.FormatStyle;
import java.util.Arrays;
import java.util.ArrayList;
import java.util.List;

public class AttendanceManager {

    private AttendanceDatabase attendanceDatabase;

    private AttendanceDao attendanceDao;

    private Mode mode = Mode.OFFLINE;

    public AttendanceManager(Context context) {
        attendanceDatabase = Room.databaseBuilder(context, AttendanceDatabase.class, "attendance-db").build();
        attendanceDao = attendanceDatabase.attendanceDao();
    }


    public void postAttendanceEntry(Sheets service, String sheetId, String sheetRange, String studentId, String date, String time) {

        if (mode == Mode.ONLINE) {
            List<List<Object>> values = Arrays.asList(
                    Arrays.asList(studentId, date, time)
            );

            ValueRange body = new ValueRange().setValues(values);

            try {
                service.spreadsheets().values().append(sheetId, sheetRange, body)
                        .setValueInputOption("RAW")
                        .execute();

            } catch (IOException err) {

                System.out.println("Error occurred. Switching to offline mode");
                err.printStackTrace();
                this.mode = Mode.OFFLINE;
                postAttendanceEntry(service, sheetId, sheetRange, studentId, date, time);
                return;
            }

            System.out.println("Attendance entry appended.");
        } else {
            addCacheEntry(studentId, date, time);
            System.out.println("Attendance entry appended to cache. ");
        }

    }

    private void postOnlineAttendanceEntry(Sheets service, String sheetId, String sheetRange, String studentId, String date, String time) throws IOException {
        List<List<Object>> values = Arrays.asList(
                Arrays.asList(studentId, date, time)
        );

        ValueRange body = new ValueRange().setValues(values);

            service.spreadsheets().values().append(sheetId, sheetRange, body)
                    .setValueInputOption("RAW")
                    .execute();
    }

    public List<AttendanceEntry> getAttendanceEntries(Sheets service, String sheetId, String sheetRange, String studentId) {

        if (this.mode == Mode.ONLINE) {
            ValueRange response = null;

            try {
                response = service.spreadsheets().values()
                        .get(sheetId, sheetRange)
                        .execute();
            } catch (IOException err) {
                // maybe issues? switch to offline mode
                this.mode = Mode.OFFLINE;
                System.out.println(err);
            }
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

        return new ArrayList<>();
    }

    public List<AttendanceEntry> getCachedAttendance() {
        List<Attendance> entries = getAllCacheEntries();
        List<AttendanceEntry> attdEntries = new ArrayList<>();

        for (Attendance attd : entries) attdEntries.add(new AttendanceEntry(attd.studentId, attd.date, attd.time));
        return attdEntries;
    }

    public void flushCachedAttendance(Sheets service, String sheetId, String sheetRange) throws IOException {
        List<AttendanceEntry> entries = getCachedAttendance();
        for (AttendanceEntry entry : entries) {
            postOnlineAttendanceEntry(service, sheetId, sheetRange, entry.studentId, entry.date, entry.time);
        }

        clearAttendanceCache();
    }

    private void addCacheEntry(String studentId, String date, String time) {
        Attendance attd = new Attendance(studentId, date, time);
        AttendanceDatabase.databaseWriteExecutor.execute(() -> {
            attendanceDao.insert(attd);
        });
    }

    private List<Attendance> getAllCacheEntries() {
        return attendanceDao.getAllAttendance();
    }

    private void clearAttendanceCache() {
        AttendanceDatabase.databaseWriteExecutor.execute(() -> {
            attendanceDao.deleteAll();
        });
    }

    public void setMode(Mode mode) {
        this.mode = mode;
    }

    public Mode getMode() {
        return mode;
    }

    public class AttendanceEntry {
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

        public WritableMap toWritableMap() {
            if (android.os.Build.VERSION.SDK_INT < android.os.Build.VERSION_CODES.O) return null;
            DateTimeFormatter dateFormatter = DateTimeFormatter.ofLocalizedDate(FormatStyle.SHORT);
            DateTimeFormatter timeFormatter = DateTimeFormatter.ofLocalizedTime(FormatStyle.SHORT);
            WritableMap entryMap = Arguments.createMap();
            entryMap.putString("studentId", getStudentId());
            LocalDate date = null;
            date = LocalDate.parse(getDate(), dateFormatter);
            LocalTime time = LocalTime.parse(getTime(), timeFormatter);
            OffsetDateTime dateTime = date.atTime(time).atZone(ZoneId.systemDefault()).toOffsetDateTime().atZoneSameInstant(ZoneId.of("UTC")).toOffsetDateTime();
            entryMap.putString("datetime", dateTime.format(DateTimeFormatter.ISO_DATE_TIME));
            return entryMap;
        }
    }

    public enum Mode {
        ONLINE,
        OFFLINE
    }
}