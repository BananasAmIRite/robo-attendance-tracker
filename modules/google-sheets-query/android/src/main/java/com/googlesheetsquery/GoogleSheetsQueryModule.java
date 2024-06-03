package com.googlesheetsquery;


import android.os.Bundle;

import androidx.annotation.NonNull;

import com.facebook.react.bridge.Promise;
import com.facebook.react.bridge.ReactApplicationContext;
import com.facebook.react.bridge.ReactContextBaseJavaModule;
import com.facebook.react.bridge.ReactMethod;
import com.facebook.react.module.annotations.ReactModule;
import com.google.api.services.sheets.v4.SheetsScopes;

import java.io.IOException;
import java.util.Arrays;


@ReactModule(name = GoogleSheetsQueryModule.NAME)
public class GoogleSheetsQueryModule extends ReactContextBaseJavaModule {
  public static final String NAME = "GoogleSheetsQuery";


  public GoogleSheetsQueryModule(ReactApplicationContext reactContext) throws IOException {
    super(reactContext);
  }

  @Override
  @NonNull
  public String getName() {
    return NAME;
  }

  @ReactMethod
  public void getUserInformation(Promise promise) {
    // run at beginning of application to retrieve information about user if applicable, can return null
    // used for automatic sign in when user has signed in before
    // bundle with the access token (see modules/google-sheets-query/src/index.tsx)
    // alternatively, you can probably emit an event (google how to) and catch it in react if you want a way to
    // funnel data from two diff sources (signIn & getUserInformation)
  }

  @ReactMethod
  public void signIn(Promise promise) {
    // will run when user presses sign in button, probably will return user information same as getUserInformation
    // bundle with the access token (see modules/google-sheets-query/src/index.tsx)
    promise.resolve(new Bundle());
  }

  @ReactMethod
  public void postAttendanceEntry(String sheetId, String studentId, String datetime, Promise promise) {
    // add attendance entry to the google sheet
    // probably doesn't need to return anything or maybe a true/false for if it succeeded? idk
    promise.resolve(false);
  }

  @ReactMethod
  public void getDailyAttendanceEntry(String sheetId, String studentId, Promise promise) {
    // get attendance entries for the current day (or possibly just the latest two attendance entries and prune if they're not from today)
    // bundle with a value of entries with an array of bundles with a student id and timestamp (see modules/google-sheets-query/src/index.tsx)
    promise.resolve(new Bundle());
  }

  @ReactMethod
  public void getStudentInfo(String sheetId, String studentId, Promise promise) {
    // get student data by student id from the student data google sheet
    promise.resolve(new Bundle());
  }



}
