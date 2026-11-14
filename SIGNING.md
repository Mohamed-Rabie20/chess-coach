# Fixed signing key (so a new APK installs over the old one and keeps your games)

Android only updates an installed app when the new APK is signed with the **same key**. The workflow builds a *debug* APK, and without a fixed key GitHub makes a new random key on every build, so Android may answer "App not installed" and you would have to uninstall first (which erases the app's data).

## One time setup (on the laptop)

1. Make the key (needs Java; if `keytool` is not found install a JDK, e.g. `winget install EclipseAdoptium.Temurin.17.JDK`, then open a new terminal):

   ```
   keytool -genkeypair -v -keystore debug.keystore -storepass android -alias androiddebugkey -keypass android -keyalg RSA -keysize 2048 -validity 10000 -dname "CN=Android Debug,O=Android,C=US"
   ```

2. Turn it into text and copy it:
   - Windows PowerShell: `[Convert]::ToBase64String([IO.File]::ReadAllBytes("debug.keystore")) | Set-Clipboard`
   - Linux / macOS: `base64 -w0 debug.keystore` (on macOS: `base64 -i debug.keystore`)

3. GitHub → the repo → Settings → Secrets and variables → Actions → New repository secret
   - Name: `DEBUG_KEYSTORE_B64`
   - Secret: paste the text

4. Keep `debug.keystore` somewhere safe (cloud drive, USB). If it is lost you will have to uninstall once more.

## First install after the setup

The APK you have now is signed with another key, so:
1. In the old app: More → Backup → **Copy backup** and paste it somewhere safe (Notes, WhatsApp to yourself).
2. Uninstall the old app, install the new APK.
3. More → Backup → **Restore**, paste, Restore now.

From then on every new APK installs over the old one and keeps everything.
