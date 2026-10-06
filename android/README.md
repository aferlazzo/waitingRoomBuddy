# Waiting Room Buddy Android package

Package: com.tonyferlazzo.wrb, version 1.0, versionCode 1; minSdk 24, targetSdk 35.

The app uses Google Android Browser Helper 2.7.3 to open https://waitingroombuddy.netlify.app/ as a Trusted Web Activity. It uses the existing service, web UI, and WRB icon. No separate backend or replacement website is created.

The website must publish /.well-known/assetlinks.json matching the release signing certificate to allow launch without browser chrome.

Build/signing workflow: aferlazzo/HelpMe, android-stable-signing branch, .github/workflows/wrb-android.yml. That workflow contains an exact WRB project snapshot and uses the owner's existing protected signing secrets. No signing key or password is committed here, logged, or placed in delivery artifacts. Future builds should update the snapshot when these source files change. The owner holds the signing key; package updates require the same key and an increased versionCode.

Launcher icon: app/src/main/res/drawable/launcher_icon.png, copied from the existing 512px WRB web icon.

Release verification includes Android lint, APK signature verification, same-certificate update builds, and emulator fresh-install/update startup checks. These startup checks do not prove Pixel standalone behavior or all interactions. Device installation and launch must be confirmed separately.

Published installer: /android-install.html; APK: /downloads/WRB-v1.apk.
