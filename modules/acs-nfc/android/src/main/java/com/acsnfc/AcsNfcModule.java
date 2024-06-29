package com.acsnfc;

import android.app.PendingIntent;
import android.content.BroadcastReceiver;
import android.content.Context;
import android.content.Intent;
import android.content.IntentFilter;
import android.hardware.usb.UsbDevice;
import android.hardware.usb.UsbManager;

import androidx.annotation.NonNull;

import com.acs.smartcard.Reader;
import com.acs.smartcard.ReaderException;
import com.facebook.react.bridge.Arguments;
import com.facebook.react.bridge.Promise;
import com.facebook.react.bridge.ReactApplicationContext;
import com.facebook.react.bridge.ReactContextBaseJavaModule;
import com.facebook.react.bridge.ReactMethod;
import com.facebook.react.bridge.WritableMap;
import com.facebook.react.module.annotations.ReactModule;
import com.facebook.react.modules.core.DeviceEventManagerModule;

import java.nio.charset.StandardCharsets;
import java.util.Arrays;

@ReactModule(name = AcsNfcModule.NAME)
public class AcsNfcModule extends ReactContextBaseJavaModule {
  public static final String NAME = "AcsNfc";

  private Reader nfcReader;
  private UsbDevice nfcDevice;


  private Promise initPromise;

  public static final String ACTION_USB_PERMISSION = "com.acsnfc.USB_PERMISSION";
  private static final String[] stateStrings = { "Unknown", "Absent",
          "Present", "Swallowed", "Powered", "Negotiable", "Specific" };

  private final BroadcastReceiver usbReceiver = new BroadcastReceiver() {
    public void onReceive(Context context, Intent intent) {
      String action = intent.getAction();
      if (ACTION_USB_PERMISSION.equals(action)) {
        synchronized (this) {
          UsbDevice device = intent.getParcelableExtra(UsbManager.EXTRA_DEVICE);

          if (intent.getBooleanExtra(UsbManager.EXTRA_PERMISSION_GRANTED, false)) {
            if (device != null) {
              synchronized (this){
                if (nfcReader.isSupported(device)){
                  nfcReader.open(device);
                  initPromise.resolve(null);

                  initPromise = null;
                } else {
                  initPromise.reject(new Throwable("No Device found"));
                }
              }
            } else {
              initPromise.reject(new Throwable("Device is null"));
            }
          }
          else {
            initPromise.reject(new Throwable("Permission denied"));
          }
        }
      }
    }
  };

  private final Reader.OnStateChangeListener stateChangeListener = (slotNum, prevState, currState) -> {
    if (prevState < Reader.CARD_UNKNOWN || prevState > Reader.CARD_SPECIFIC) {
      prevState = Reader.CARD_UNKNOWN;
    }

    if (currState < Reader.CARD_UNKNOWN || currState > Reader.CARD_SPECIFIC) {
      currState = Reader.CARD_UNKNOWN;
    }

    WritableMap eventParams = Arguments.createMap();
    eventParams.putString("currState",stateStrings[currState]);
    eventParams.putString("prevState",stateStrings[prevState]);
    eventParams.putInt("slotNum",slotNum);

    sendEvent("onStateChange",eventParams);
  };

  public AcsNfcModule(ReactApplicationContext reactContext) {
    super(reactContext);
  }

  @Override
  @NonNull
  public String getName() {
    return NAME;
  }

  @ReactMethod
  public void init(Promise promise) {
    UsbManager manager = (UsbManager) getReactApplicationContext().getSystemService(Context.USB_SERVICE);
    this.nfcReader = new Reader(manager);
    this.nfcReader.setOnStateChangeListener(this.stateChangeListener);
    this.initPromise = promise;

    // look for reader
    for (UsbDevice device : manager.getDeviceList().values()) {
      if (nfcReader.isSupported(device)) {
        this.nfcDevice = device;
        break;
      }
    }

    if (this.nfcDevice == null) {
      promise.reject(new Throwable("No Device Found"));
    } else {
      // ask for permission
      PendingIntent usbPermissionIntent = PendingIntent.getBroadcast(getReactApplicationContext(), 0, new Intent(ACTION_USB_PERMISSION), 0);
      IntentFilter filter = new IntentFilter(ACTION_USB_PERMISSION);
      getReactApplicationContext().registerReceiver(usbReceiver, filter);
      manager.requestPermission(this.nfcDevice, usbPermissionIntent);
    }
  }

  @ReactMethod
  public void closeReader() {
    if (this.nfcReader != null && this.nfcReader.isOpened()) {
      this.nfcReader.close();
    }
  }

  @ReactMethod
  public void connectToCard(int slotNum, Promise promise) {
    int action = Reader.CARD_WARM_RESET;

    try {
      byte[] atr = this.nfcReader.power(slotNum,action);
      this.nfcReader.setProtocol(slotNum, Reader.PROTOCOL_T0 | Reader.PROTOCOL_T1);

      promise.resolve(bytesToHexString(atr));
    }catch (Exception e){
      promise.reject(e);
    }
  }

  @ReactMethod
  public void getUid(int slotNum, Promise promise) {
    byte[] command = new byte[] {(byte) 0xff, (byte) 0xca, 0x00, 0x00, 0x00};

    try {
      byte[] responseArray = transmit(slotNum, command);
      if (responseArray[responseArray.length - 2] != (byte) 0x90 || responseArray[responseArray.length - 1] != (byte) 0x00) {
        // error
        promise.reject(new Throwable("An error occurred on the reader. Error bytes: " + bytesToHexString(Arrays.copyOfRange(responseArray, responseArray.length - 2, responseArray.length))));
        return;
      }
      // success
      byte[] uidBytes = Arrays.copyOfRange(responseArray, 0, responseArray.length - 2); // last two bytes are response codes
      String uid = new String(uidBytes, StandardCharsets.UTF_8);
      promise.resolve(uid);
    } catch (ReaderException e) {
      promise.reject(e);
    }
  }

  private byte[] transmit(int slotNum, byte[] command) throws ReaderException {
    byte[] responseBuf = new byte[300];
    int respLength;

    respLength = nfcReader.transmit(slotNum, command, command.length, responseBuf, responseBuf.length);
    return Arrays.copyOfRange(responseBuf, 0, respLength);
  }


  private static final char[] HEX_ARRAY = "0123456789ABCDEF".toCharArray();
  private static String bytesToHexString(byte[] bytes) {
    char[] hexChars = new char[bytes.length * 2];
    for (int i = 0; i < bytes.length; i++) {
      int v = bytes[i] & 0xFF;
      hexChars[i * 2] = HEX_ARRAY[v >>> 4];
      hexChars[i * 2 + 1] = HEX_ARRAY[v & 0x0F];
    }
    return new String(hexChars);
  }

  private void sendEvent(String eventName, WritableMap params){
    getReactApplicationContext()
            .getJSModule(DeviceEventManagerModule.RCTDeviceEventEmitter.class)
            .emit(eventName,params);
  }
}
