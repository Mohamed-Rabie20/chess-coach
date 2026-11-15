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

## Final (release) version

The workflow now builds **two** APKs from the same code and the same key:

| Artifact | What it is |
|---|---|
| `Chess-Coach-release-apk` | the final version (not debuggable) - **install this one** |
| `Chess-Coach-apk` | the debug build, kept as a fallback (if the release step ever fails, this one is still produced) |

- Both are signed with your fixed key, so either installs over the other and keeps your data.
- The release APK needs the `DEBUG_KEYSTORE_B64` secret. Without it only the debug APK is built.
- Every build gets a higher version number (1.<build number>), so Android always treats a new APK as an update.
- The key is named `androiddebugkey` with the password `android` - the name does not matter for a personal app. If you ever publish on Google Play you need a proper private key with strong passwords instead.

## Where to download it

After a green build the final APK is also published on the repository's **Releases** page (right side of the repo's main page → Releases → "Chess Coach 1.N" → Assets → `Chess-Coach-release.apk`). The Releases entry is called `latest` and is replaced by every build, so this link always gives the newest APK (open it on the phone):

`https://github.com/<your-user>/<your-repo>/releases/latest/download/Chess-Coach-release.apk`

(The Actions artifacts `Chess-Coach-release-apk` and `Chess-Coach-apk` are still there for 14 days.)
If the release step fails, check Settings → Actions → General → Workflow permissions = "Read and write permissions".
