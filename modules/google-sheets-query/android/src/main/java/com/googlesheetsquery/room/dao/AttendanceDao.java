package com.googlesheetsquery.room.dao;

import androidx.room.Dao;
import androidx.room.Insert;
import androidx.room.OnConflictStrategy;
import androidx.room.Query;

import com.googlesheetsquery.room.data.Attendance;

import java.util.List;

@Dao
public interface AttendanceDao {
    @Insert(onConflict = OnConflictStrategy.IGNORE)
    void insert(Attendance attendance);

    @Query("DELETE FROM attendance_table")
    void deleteAll();

    @Query("SELECT * FROM attendance_table ORDER BY id ASC")
    List<Attendance> getAllAttendance();
}
