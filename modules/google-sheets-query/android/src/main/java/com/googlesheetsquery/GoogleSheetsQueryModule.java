package com.googlesheetsquery;

import androidx.annotation.NonNull;

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


@ReactModule(name = GoogleSheetsQueryModule.NAME)
public class GoogleSheetsQueryModule extends ReactContextBaseJavaModule {
  public static final String NAME = "GoogleSheetsQuery";

  private static final List<String> SCOPES = new ArrayList<>(SheetsScopes.all());

  private final NetHttpTransport HTTP_TRANSPORT = GoogleNetHttpTransport.newTrustedTransport();
  private final JsonFactory JSON_FACTORY = GsonFactory.getDefaultInstance();
  private Sheets sheetsService = new Sheets.Builder(HTTP_TRANSPORT, JSON_FACTORY, null) // TODO: Vincent plz fix
          .setApplicationName(NAME)
          .build();

  public GoogleSheetsQueryModule(ReactApplicationContext reactContext) throws GeneralSecurityException, IOException {
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
    promise.resolve(null);
  }

  @ReactMethod
  public void signIn(Promise promise) {
    // will run when user presses sign in button, probably will return user information same as getUserInformation
    // bundle with the access token (see modules/google-sheets-query/src/index.tsx)
    promise.resolve(Arguments.createMap());
    
  }

  @ReactMethod
  public void postAttendanceEntry(String sheetId, String sheetRange, String studentId, String datetime, Promise promise) throws GeneralSecurityException, IOException {
    if (android.os.Build.VERSION.SDK_INT < android.os.Build.VERSION_CODES.O) return;
      OffsetDateTime date = OffsetDateTime.parse(datetime, DateTimeFormatter.ISO_DATE_TIME.withZone(ZoneId.of("UTC")));
      ZonedDateTime zonedDate = date.atZoneSameInstant(ZoneId.systemDefault());
      AttendanceManager.postAttendanceEntry(sheetsService,
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

    if (android.os.Build.VERSION.SDK_INT < android.os.Build.VERSION_CODES.O) return;

    List<AttendanceManager.AttendanceEntry> values = AttendanceManager.getAttendanceEntries(sheetsService, sheetId, sheetRange, studentId);

    WritableMap map = Arguments.createMap();

    WritableArray arr = Arguments.createArray();

    DateTimeFormatter dateFormatter = DateTimeFormatter.ofLocalizedDate(FormatStyle.SHORT);
    DateTimeFormatter timeFormatter = DateTimeFormatter.ofLocalizedTime(FormatStyle.SHORT);

    for (AttendanceManager.AttendanceEntry entry : values) {
      WritableMap entryMap = Arguments.createMap();
      entryMap.putString("studentId", entry.getStudentId());
      LocalDate date = LocalDate.parse(entry.getDate(), dateFormatter);
      LocalTime time = LocalTime.parse(entry.getTime(), timeFormatter);
      OffsetDateTime dateTime = date.atTime(time).atZone(ZoneId.systemDefault()).toOffsetDateTime().atZoneSameInstant(ZoneId.of("UTC")).toOffsetDateTime();
      entryMap.putString("datetime", dateTime.format(DateTimeFormatter.ISO_DATE_TIME));
      arr.pushMap(entryMap);
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



}
