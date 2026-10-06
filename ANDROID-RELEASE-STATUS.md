# WRB Android release — 2026-10-06

Package com.tonyferlazzo.wrb; version 1.0; versionCode 1.

Signed release and Android lint passed. Two builds used the same owner signing certificate. Emulator fresh installation and signed versionCode 2 update both launched without startup exceptions. Test run: https://github.com/aferlazzo/HelpMe/actions/runs/37487715161

Published APK is the exact versionCode 1 APK from that successful run. VersionCode 2 was an update test only. Website association matches its verified signing certificate. Installer: https://waitingroombuddy.netlify.app/android-install.html

These checks verify package signing and emulator startup/update behavior. Pixel installation, standalone display, and real Buddy interaction remain device checks; do not claim these emulator checks prove them. Private signing material is not distributed.


## Installation investigation — 2026-10-06 09:40 America/Phoenix

Tony reports that the Pixel still has no installed WRB entry or icon. This remains unresolved on the physical device.

Fixed a separate, confirmed website issue: Android fullscreen/standalone mode previously hid the APK download action and claimed app status without verifying the Android package. The download now stays available in Android browser and fullscreen modes. Optional getInstalledRelatedApps detection only reports the matching com.tonyferlazzo.wrb package; unavailable/failed detection does not prevent downloads. Browser appinstalled events do not establish native package installation. Published pwa.js, manifest.webmanifest and sw.js were compared byte-for-byte with the changes. Seven installation-state checks passed. Existing signed APK and Buddy functionality were preserved.

Published APK SHA-256: 76a34ec994cb6448e68c95fa53cc34f3cc62e725f6c61d63f9120f2896fbed2f. Independently checked package identity, compiled launcher declaration, PNG icon, v2 signing and matching website certificate association.

Additional emulator verification: https://github.com/aferlazzo/waitingRoomBuddy/actions/runs/37497173336
- Downloaded production APK matches repository APK.
- Android installation succeeds and package manager finds the installed package.
- Launcher resolves WRB; launcher discovery launches it, and launches it again after force-stop.
- Captured Pixel Launcher drawer XML and screenshot show a clickable Waiting Room Buddy icon after closing.
- No fatal startup exception was logged.
- Evidence artifact: WRB-launcher-evidence.

The initial added test used an unsuitable implicit am-start command and failed despite resolving the launcher activity. The corrected successful test uses launcher discovery via monkey. Neither ADB installation nor these emulator checks reproduce Play Protect's physical-Pixel installation flow. There is no remote Pixel connection in this session; do not claim that Tony's installation is fixed or that the emulator proves his phone has an icon.
