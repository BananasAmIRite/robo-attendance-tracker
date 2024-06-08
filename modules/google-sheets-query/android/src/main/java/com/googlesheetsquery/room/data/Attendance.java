package com.googlesheetsquery.room.data;

import androidx.annotation.NonNull;
import androidx.room.Entity;
import androidx.room.PrimaryKey;

@Entity(tableName = "attendance_table")
public class Attendance {

    @PrimaryKey(autoGenerate = true)
    private int id;

    public String studentId;
    public String date;
    public String time;

    public Attendance(String studentId, String date, String time) {
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

    public int getId() {
        return id;
    }

    public void setId(int id) {
        this.id = id;
    }
}
