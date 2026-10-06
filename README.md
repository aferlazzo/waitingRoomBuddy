# Waiting Room Buddy

A small Netlify app that uses a Netlify Function to call the OpenAI Responses API.

Production: https://waitingroombuddy.netlify.app/

Netlify deploys the repository root and `netlify/functions` from `main`. The Netlify GitHub app must include `waitingRoomBuddy` in its selected repositories for pushes to trigger automatic deployments. Environment-variable changes take effect on a new deployment.

The PWA uses network-first navigation and installation files, with a cached shell for offline opening. AI requests require a connection. The existing allowance is 20 requests per device per UTC day.

Android installation: https://waitingroombuddy.netlify.app/android-install.html

The Android package `com.tonyferlazzo.wrb` opens this existing site using Google's Android Browser Helper, the same approach as SoHelpMe. WRB source is in `android/`. The protected owner signing pipeline is currently in the HelpMe repository's `android-stable-signing` branch, workflow `.github/workflows/wrb-android.yml`, because it already holds the persistent owner release key. Private signing material is never included in this repository or delivery artifacts. Retain the owner's key and password for future updates; increase versionCode on Android package releases.

Android install buttons use the APK installer page rather than depending on Chrome's optional browser installation offer. Other platforms continue using PWA installation. Signed APK bytes, checksum, and website certificate association are published together after the release tests pass.
