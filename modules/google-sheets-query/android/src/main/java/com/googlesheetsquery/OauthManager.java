package com.googlesheetsquery;

import android.accounts.AccountManager;
import android.app.Activity;
import android.content.Context;
import android.content.Intent;
import android.content.SharedPreferences;

import androidx.annotation.Nullable;

import com.facebook.react.bridge.ActivityEventListener;
import com.facebook.react.bridge.ReactContext;
import com.google.android.gms.auth.GoogleAuthException;
import com.google.api.client.googleapis.extensions.android.gms.auth.GoogleAccountCredential;
import com.google.api.client.googleapis.javanet.GoogleNetHttpTransport;
import com.google.api.client.http.javanet.NetHttpTransport;
import com.google.api.client.json.JsonFactory;
import com.google.api.client.json.gson.GsonFactory;
import com.google.api.services.sheets.v4.SheetsScopes;

import java.io.IOException;
import java.util.Collections;
import java.util.Objects;
import java.util.function.Consumer;

public class OauthManager {

    private static final String PREF_ACCOUNT_NAME = "@AttendanceTracker_PREF_ACCOUNT_NAME";
    private static final int REQUEST_ACCOUNT_PICKER = 420;
    private static final int REQUEST_AUTHORIZATION = 696;

    private GoogleAccountCredential credential;

    private final NetHttpTransport httpTransport;
    private final JsonFactory jsonFactory;

    private final Context appContext;

    private final Runnable onToken;


    public OauthManager(ReactContext context, NetHttpTransport httpTransport, JsonFactory jsonFactory, Runnable onToken) {
        this.appContext = context;
        this.httpTransport = httpTransport;
        this.jsonFactory = jsonFactory;
        this.onToken = onToken;

        context.addActivityEventListener(new ActivityEventListener() {
            @Override
            public void onActivityResult(Activity activity, int requestCode, int resultCode, @Nullable Intent data) {
                switch (requestCode) {
                    case REQUEST_ACCOUNT_PICKER:
                        if (resultCode != Activity.RESULT_OK || data == null || data.getExtras() == null) return;

                        final String accountName = data.getExtras().getString(AccountManager.KEY_ACCOUNT_NAME);

                        if (accountName == null) return;

                        credential.setSelectedAccountName(accountName);
                        final SharedPreferences prefs = activity.getPreferences(Context.MODE_PRIVATE);
                        prefs.edit().putString(PREF_ACCOUNT_NAME, accountName).commit();

                        onToken.run();
                        break;
                    case REQUEST_AUTHORIZATION:
                        onToken.run();
                }

            }

            @Override
            public void onNewIntent(Intent intent) {}
        });
    }

    public void initCredentials(Activity activity) {
        this.credential = GoogleAccountCredential.usingOAuth2(activity, Collections.singleton(SheetsScopes.SPREADSHEETS));

        final SharedPreferences prefs = Objects.requireNonNull(activity).getPreferences(Context.MODE_PRIVATE);

        credential.setSelectedAccountName(prefs.getString(PREF_ACCOUNT_NAME, null));
    }

    public GoogleAccountCredential getCredential() {
        return this.credential;
    }

    public String getToken() throws GoogleAuthException, IOException {
        return getCredential().getToken();
    }
}
