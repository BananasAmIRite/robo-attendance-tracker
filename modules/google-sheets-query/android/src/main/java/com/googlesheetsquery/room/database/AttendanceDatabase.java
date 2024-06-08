package com.googlesheetsquery.room.database;

import androidx.room.Database;
import androidx.room.RoomDatabase;

import com.googlesheetsquery.room.dao.AttendanceDao;
import com.googlesheetsquery.room.data.Attendance;

import java.util.concurrent.ExecutorService;
import java.util.concurrent.Executors;

@Database(entities = {Attendance.class}, version = 1, exportSchema = false)
public abstract class AttendanceDatabase extends RoomDatabase {
    public abstract AttendanceDao attendanceDao();

    private static final int NUMBER_OF_THREADS = 4;
    public static final ExecutorService databaseWriteExecutor =
            Executors.newFixedThreadPool(NUMBER_OF_THREADS);
}
