package com.googlesheetsquery;

import android.accounts.AccountManager;
import android.app.Activity;
import android.content.Context;
import android.content.Intent;
import android.content.SharedPreferences;

import com.facebook.react.bridge.ActivityEventListener;
import com.google.api.client.auth.oauth2.Credential;
import com.google.api.client.googleapis.javanet.GoogleNetHttpTransport;
import com.google.api.client.http.HttpTransport;
import com.google.api.client.http.javanet.NetHttpTransport;
import com.google.api.client.json.gson.GsonFactory;
import com.google.api.services.sheets.v4.Sheets;

import androidx.annotation.NonNull;
import androidx.annotation.Nullable;

import com.facebook.react.bridge.Arguments;
import com.facebook.react.bridge.Promise;
import com.facebook.react.bridge.ReactApplicationContext;
import com.facebook.react.bridge.ReactContextBaseJavaModule;
import com.facebook.react.bridge.ReactMethod;
import com.facebook.react.bridge.WritableMap;
import com.facebook.react.module.annotations.ReactModule;
import com.google.api.client.googleapis.extensions.android.gms.auth.GoogleAccountCredential;
import com.google.api.services.sheets.v4.SheetsScopes;

import java.io.IOException;
import java.security.GeneralSecurityException;
import java.util.Arrays;
import java.util.Collections;
import java.util.Objects;


@ReactModule(name = GoogleSheetsQueryModule.NAME)
public class GoogleSheetsQueryModule extends ReactContextBaseJavaModule {
  public static final String NAME = "GoogleSheetsQuery";

  private static final String PREF_ACCOUNT_NAME = "????";
  private static final int REQUEST_ACCOUNT_PICKER = 420;

    private GoogleAccountCredential credential;
  private Sheets service;

  public GoogleSheetsQueryModule(ReactApplicationContext reactContext)  {
    super(reactContext);
    reactContext.addActivityEventListener(new ActivityEventListener() {
      @Override
      public void onActivityResult(Activity activity, int requestCode, int resultCode, @Nullable Intent data) {
          if (resultCode != REQUEST_ACCOUNT_PICKER || resultCode != Activity.RESULT_OK || data == null || data.getExtras() == null) return;

          final String accountName = data.getExtras().getString(AccountManager.KEY_ACCOUNT_NAME);

          if (accountName == null) return;

          credential.setSelectedAccountName(accountName);
          final SharedPreferences prefs = getCurrentActivity().getPreferences(Context.MODE_PRIVATE);
          prefs.edit().putString(PREF_ACCOUNT_NAME, accountName).commit();
      }

      @Override
      public void onNewIntent(Intent intent) {}
    });
  }

  @Override
  @NonNull
  public String getName() {
    return NAME;
  }

  @ReactMethod
  public void getUserInformation(Promise promise) throws GeneralSecurityException, IOException {
    // run at beginning of application to retrieve information about user if applicable, can return null
    // used for automatic sign in when user has signed in before
    // bundle with the access token (see modules/google-sheets-query/src/index.tsx)
    // alternatively, you can probably emit an event (google how to) and catch it in react if you want a way to
    // funnel data from two diff sources (signIn & getUserInformation)
    this.credential = GoogleAccountCredential.usingOAuth2(getCurrentActivity(), Collections.singleton(SheetsScopes.SPREADSHEETS));

    final SharedPreferences prefs = Objects.requireNonNull(getCurrentActivity()).getPreferences(Context.MODE_PRIVATE);

    NetHttpTransport transport = GoogleNetHttpTransport.newTrustedTransport();

    credential.setSelectedAccountName(prefs.getString(PREF_ACCOUNT_NAME, null));

    this.service = new Sheets.Builder(transport, GsonFactory.getDefaultInstance(), credential).setApplicationName("Attendance Tracker").build();

    if (this.credential.getSelectedAccountName() != null) {
      promise.resolve(this.credential.getToken());
    } else {
      promise.resolve(null);
    }
  }

  @ReactMethod
  public void signIn(Promise promise) throws GeneralSecurityException, IOException {
    // will run when user presses sign in button, probably will return user information same as getUserInformation
    // bundle with the access token (see modules/google-sheets-query/src/index.tsx)
    Objects.requireNonNull(getCurrentActivity()).startActivityForResult(credential.newChooseAccountIntent(), REQUEST_ACCOUNT_PICKER);

    if (this.credential.getSelectedAccountName() != null) {
      promise.resolve(this.credential.getToken());
    } else {
      promise.resolve(null);
    }
  }

  @ReactMethod
  public void postAttendanceEntry(String accessToken, String sheetId, String sheetRange, String studentId, String datetime, Promise promise) {
    // add attendance entry to the google sheet
    // probably doesn't need to return anything or maybe a true/false for if it succeeded? idk
    promise.resolve(false);
  }

  @ReactMethod
  public void getDailyAttendanceEntry(String accessToken, String sheetId, String sheetRange, String studentId, Promise promise) {
    // get attendance entries for the current day (or possibly just the latest two attendance entries and prune if they're not from today)
    // bundle with a value of entries with an array of bundles with a student id and timestamp (see modules/google-sheets-query/src/index.tsx)
    WritableMap map = Arguments.createMap(); 

    map.putArray("entries", Arguments.createArray());
    
    promise.resolve(map);
  }

  @ReactMethod
  public void getStudentInfo(String accessToken, String sheetId, String sheetRange, String studentId, Promise promise) {
    // get student data by student id from the student data google sheet
    WritableMap map = Arguments.createMap(); 

    map.putString("studentId", "8537056");
    map.putString("studentName", "Jason Yang");

    promise.resolve(map);
  }



}
