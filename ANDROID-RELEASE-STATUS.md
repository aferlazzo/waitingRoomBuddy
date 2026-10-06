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


## Continuation audit — October 6, 2026

Production main remains 85ff36ee46c1281ecd67c8ca4df236ba702aee25. No replacement repository, website or Android application was created. The original signed v1 package and unpublished signed v3 candidate were preserved.

Draft PR: https://github.com/aferlazzo/waitingRoomBuddy/pull/1
Preview installer: https://deploy-preview-1--waitingroombuddy.netlify.app/android-install.html

Prepared website changes: download the existing signed v3 candidate; direct native setup/open intents; remove beforeinstallprompt dependency; preserve Buddy's offline shell when visiting the installer. Matching v3 Android source is saved in this review branch. Local installer routing and cache checks passed. Netlify preview APK returns HTTP 200 and application/vnd.android.package-archive; its SHA-256 matches the existing signed candidate: aaaf1ff8ed21ec85ad2986a31eee7d3eb5a7c6592007de901840320f942fda79.

Original v1 upgrade, fresh v3 install, Android's actual pin prompt, pinned state and reinstall persistence passed in emulator run 37507410947. Those early checks inadvertently launched the suggested dock icon; they do not prove the pinned icon opens Buddy.

Stricter pinned-icon diagnostics: https://github.com/aferlazzo/HelpMe/actions/runs/37510462750
The actual pinned shortcut invokes wrb://open. Logs then show LauncherActivity launched twice: first without NEW_TASK, then with it after the helper restarts itself. Buddy never appears and setup remains foreground. Chrome's CustomTabsConnectionService exists, so the browser is present. This matches the helper's restartInNewTask/sLauncherActivitiesAlive code path. Treat the missing task flag as a diagnosed likely cause; the proposed correction is not yet built or verified.

Proposed incremental correction: ACTION_VIEW with the existing HTTPS WRB URL plus FLAG_ACTIVITY_NEW_TASK in HomeActivity.openBuddy. A new versionCode 4 (same package and signing key) is needed to deliver this binary change. Keep original signed APKs. Do not publish the v3 candidate as a verified standalone release.

Automatic approval review initially rejected the incremental build because the user's instruction said not to rebuild. The owner subsequently explicitly approved this specific incremental correction. The existing protected signing key remains configured. Physical Android/Play Protect prompts were not verified, and no physical-device fix is claimed.

## Approved incremental correction — October 6, 2026

Signed version 1.2 (code 4) was produced by the existing protected pipeline in run 37512867753. Its certificate matches the original release and production assetlinks.json. SHA-256: fee3358855094311c1ecb081b83da95e6e80f5a965a4507eab0b9145fe309a7e. The original and v3 packages are retained.

The v1-to-v4 upgrade, Android pin confirmation, actual pinned-icon launch, visible Buddy website, and absence of browser toolbar passed. The run failed later at the recovery setup assertion because Chrome remained foreground immediately after asynchronous reopen. Retest 37513938420 uses the same signed package and waits for the reopened Buddy before attempting setup recovery. This draft remains gated on that full verification and production publication approval.
