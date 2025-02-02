# Add project specific ProGuard rules here.
# By default, the flags in this file are appended to flags specified
# in /usr/local/Cellar/android-sdk/24.3.3/tools/proguard/proguard-android.txt
# You can edit the include path and order by changing the proguardFiles
# directive in build.gradle.
#
# For more details, see
#   http://developer.android.com/guide/developing/tools/proguard.html

# Add any project specific keep options here:
# Keep React Native classes
-keep class com.facebook.react.** { *; }
-keep class com.facebook.hermes.** { *; }

# Keep Native Modules
-keep public class * extends com.facebook.react.bridge.JavaScriptModule { *; }
-keep public class * extends com.facebook.react.bridge.NativeModule { *; }
-keep public class * extends com.facebook.react.bridge.ViewManager { *; }

# Keep JSON processing (React Native uses it)
-keep class com.fasterxml.jackson.** { *; }

# Keep dependencies yang sering digunakan dalam proyek Anda
-keep class com.moment.** { *; }         # Untuk Moment.js
-keep class com.squareup.okhttp3.** { *; }  # Untuk Axios (berbasis OkHttp)
-keep class com.facebook.soloader.** { *; } # Loader Hermes

# Keep Redux Toolkit dan React Navigation
-keep class com.reactnavigation.** { *; }
-keep class com.reactnativenavigation.** { *; }
-keep class com.redux.** { *; }

# Keep Bluetooth ESC/POS Printer
-keep class com.reactnativebluetoothescposprinter.** { *; }
-keep class com.reactnativeescposprinter.** { *; }

# Keep react-native-view-shot
-keep class com.reactnativecommunity.viewshot.** { *; }