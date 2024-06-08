package com.googlesheetsquery;

import android.accounts.AccountManager;
import android.app.Activity;
import android.content.Context;
import android.content.Intent;
import android.content.SharedPreferences;
import android.os.AsyncTask;

import com.facebook.react.bridge.ActivityEventListener;
import com.facebook.react.bridge.ReactContext;
import com.google.android.gms.auth.GoogleAuthException;
import com.google.android.gms.auth.GoogleAuthUtil;
import com.google.android.gms.auth.UserRecoverableAuthException;
import com.google.api.client.googleapis.javanet.GoogleNetHttpTransport;
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
import com.facebook.react.bridge.WritableArray;
import com.facebook.react.bridge.WritableMap;
import com.facebook.react.module.annotations.ReactModule;
import com.google.api.client.auth.oauth2.Credential;
import com.google.api.client.googleapis.javanet.GoogleNetHttpTransport;
import com.google.api.client.http.javanet.NetHttpTransport;
import com.google.api.client.json.JsonFactory;
import com.google.api.client.json.gson.GsonFactory;
import com.google.api.services.sheets.v4.Sheets;
import com.google.api.client.googleapis.extensions.android.gms.auth.GoogleAccountCredential;
import com.google.api.services.sheets.v4.SheetsScopes;
import com.google.api.services.sheets.v4.model.Sheet;

import java.io.IOException;
import java.security.GeneralSecurityException;
import java.text.DateFormat;
import java.text.ParseException;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.time.OffsetDateTime;
import java.time.ZoneId;
import java.time.ZoneOffset;
import java.time.ZonedDateTime;
import java.time.format.DateTimeFormatter;
import java.time.format.DateTimeFormatterBuilder;
import java.time.format.FormatStyle;
import java.time.format.SignStyle;
import java.time.temporal.ChronoField;
import java.time.temporal.Temporal;
import java.util.ArrayList;
import java.util.Calendar;
import java.util.Date;
import java.util.List;
import java.util.Arrays;
import java.util.Collections;
import java.util.Objects;


@ReactModule(name = GoogleSheetsQueryModule.NAME)
public class GoogleSheetsQueryModule extends ReactContextBaseJavaModule {
  public static final String NAME = "GoogleSheetsQuery";

  private static final String PREF_ACCOUNT_NAME = "@AttendanceTracker_PREF_ACCOUNT_NAME";
  private static final int REQUEST_ACCOUNT_PICKER = 420;
  private static final int REQUEST_AUTHORIZATION = 696;

  private static final String EVENT_ACCESS_TOKEN = "onAccessToken";

    private GoogleAccountCredential credential;
  private Sheets sheetsService;

  private final NetHttpTransport HTTP_TRANSPORT = GoogleNetHttpTransport.newTrustedTransport();
  private final JsonFactory JSON_FACTORY = GsonFactory.getDefaultInstance();

  private final AttendanceManager attendanceManager;

  public GoogleSheetsQueryModule(ReactApplicationContext reactContext) throws GeneralSecurityException, IOException {
    super(reactContext);

    attendanceManager = new AttendanceManager(reactContext);

    reactContext.addActivityEventListener(new ActivityEventListener() {
      @Override
      public void onActivityResult(Activity activity, int requestCode, int resultCode, @Nullable Intent data) {
        switch (requestCode) {
          case REQUEST_ACCOUNT_PICKER:
            if (resultCode != Activity.RESULT_OK || data == null || data.getExtras() == null) return;

            final String accountName = data.getExtras().getString(AccountManager.KEY_ACCOUNT_NAME);

            if (accountName == null) return;

            credential.setSelectedAccountName(accountName);
            final SharedPreferences prefs = getCurrentActivity().getPreferences(Context.MODE_PRIVATE);
            prefs.edit().putString(PREF_ACCOUNT_NAME, accountName).commit();

            checkOrEmitToken();
            break;
          case REQUEST_AUTHORIZATION:
            checkOrEmitToken();
        }

      }

      @Override
      public void onNewIntent(Intent intent) {}
    });
  }

  private void checkOrEmitToken() {
    AsyncTask.execute(() -> {
      try {
        String token = credential.getToken();
        attendanceManager.setMode(AttendanceManager.Mode.ONLINE);
        emitEvent(EVENT_ACCESS_TOKEN, token);
      } catch (IOException | GoogleAuthException e) {
        if (e instanceof UserRecoverableAuthException) {
          Intent intent = ((UserRecoverableAuthException) e).getIntent();
          getCurrentActivity().startActivityForResult(intent, REQUEST_AUTHORIZATION);
        }
      }
    });
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
    this.credential = GoogleAccountCredential.usingOAuth2(getCurrentActivity(), Collections.singleton(SheetsScopes.SPREADSHEETS));

    final SharedPreferences prefs = Objects.requireNonNull(getCurrentActivity()).getPreferences(Context.MODE_PRIVATE);

    credential.setSelectedAccountName(prefs.getString(PREF_ACCOUNT_NAME, null));

    this.sheetsService = new Sheets.Builder(HTTP_TRANSPORT, JSON_FACTORY, credential).setApplicationName("Attendance Tracker").build();

    if (this.credential.getSelectedAccountName() != null) {
      AsyncTask.execute(() -> {
        try {
          promise.resolve(this.credential.getToken());
        } catch (IOException | GoogleAuthException e) {
          promise.reject(e);
        }
      });
    } else {
      promise.resolve(null);
    }
  }

  @ReactMethod
  public void signIn(Promise promise) {
    // will run when user presses sign in button, probably will return user information same as getUserInformation
    // bundle with the access token (see modules/google-sheets-query/src/index.tsx)
    Objects.requireNonNull(getCurrentActivity()).startActivityForResult(credential.newChooseAccountIntent(), REQUEST_ACCOUNT_PICKER);

      promise.resolve(null);
  }

  @ReactMethod
  public void signOut(Promise promise) {
    AsyncTask.execute(() -> {
      try {
        String token = this.credential.getToken();
        if (token != null) {
          GoogleAuthUtil.clearToken(getCurrentActivity(), token);
        }
        emitEvent(EVENT_ACCESS_TOKEN, null);
        promise.resolve(null);
      } catch (IOException | GoogleAuthException e) {
        promise.reject(e);
      }
    });
  }

  @ReactMethod
  public void postAttendanceEntry(String sheetId, String sheetRange, String studentId, String datetime, Promise promise) throws GeneralSecurityException, IOException {
    if (android.os.Build.VERSION.SDK_INT < android.os.Build.VERSION_CODES.O) return;
      OffsetDateTime date = OffsetDateTime.parse(datetime, DateTimeFormatter.ISO_DATE_TIME.withZone(ZoneId.of("UTC")));
      ZonedDateTime zonedDate = date.atZoneSameInstant(ZoneId.systemDefault());
    attendanceManager.postAttendanceEntry(sheetsService,
              sheetId,
              sheetRange,
              studentId,
              zonedDate.format(DateTimeFormatter.ofLocalizedDate(FormatStyle.SHORT)),
              zonedDate.format(DateTimeFormatter.ofLocalizedTime(FormatStyle.SHORT))
      );
      promise.resolve(null);
  }

  @ReactMethod
  public void getDailyAttendanceEntry(String sheetId, String sheetRange, String studentId, Promise promise) throws GeneralSecurityException, IOException {
    // get attendance entries for the current day (or possibly just the latest two attendance entries and prune if they're not from today)
    // bundle with a value of entries with an array of bundles with a student id and timestamp (see modules/google-sheets-query/src/index.tsx)

    List<AttendanceManager.AttendanceEntry> values = attendanceManager.getAttendanceEntries(sheetsService, sheetId, sheetRange, studentId);

    WritableMap map = Arguments.createMap();

    WritableArray arr = Arguments.createArray();

    for (AttendanceManager.AttendanceEntry entry : values) {
      arr.pushMap(entry.toWritableMap());
    }

    map.putArray("entries", arr);
    
    promise.resolve(map);
  }

  @ReactMethod
  public void getStudentInfo(String sheetId, String sheetRange, String studentId, Promise promise) throws GeneralSecurityException, IOException {
    // get student data by student id from the student data google sheet
    WritableMap map = Arguments.createMap();

    StudentInfoManager.StudentInfo info = StudentInfoManager.getStudentInfo(sheetsService, sheetId, sheetRange, studentId);

    if (info == null) {
      promise.resolve(null);
      return;
    }

    map.putString("studentId", info.getStudentId());
    map.putString("firstName", info.getFirstName());
    map.putString("lastName", info.getLastName());

    promise.resolve(map);
  }

  @ReactMethod
  public void isAttendanceCaching(Promise promise) {
    promise.resolve(attendanceManager.getMode());
  }

  @ReactMethod
  public void flushAttendanceCache(String attdSheet, String attdRange, Promise promise) {
    try {
      attendanceManager.flushCachedAttendance(sheetsService, attdSheet, attdRange);
      promise.resolve(null);
    } catch (Exception err) {
      promise.reject(err);
    }
  }

  @ReactMethod
  public void getAttendanceCache(Promise promise) {
    List<AttendanceManager.AttendanceEntry> values = attendanceManager.getCachedAttendance();

    WritableArray arr = Arguments.createArray();

    for (AttendanceManager.AttendanceEntry entry : values) {
      arr.pushMap(entry.toWritableMap());
    }

    promise.resolve(arr);
  }



  @ReactMethod
  public void getStudentInfoByNFCId(String sheetId, String sheetRange, String nfcId, Promise promise) {
    promise.resolve(null); 
  }

  @ReactMethod
  public void bindStudentId(String sheetId, String sheetRange, String studentId, String nfcId, Promise promise) {
    promise.resolve(null); 
  }

  public void emitEvent(String event, Object obj) {
    getReactApplicationContext().getJSModule(ReactContext.RCTDeviceEventEmitter.class)
            .emit(event, obj);
  }

}
