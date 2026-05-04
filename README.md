# Video Subtitle Editor — MVP

Upload or record a video → AI generates subtitles → edit them → export with burned-in captions.

---

## Project Structure

```
video-editor/
├── backend/          # Next.js API server
│   ├── app/
│   │   ├── api/
│   │   │   ├── upload/route.ts       # POST /api/upload
│   │   │   ├── render/route.ts       # POST /api/render
│   │   │   └── download/[filename]/route.ts  # GET /api/download/:file
│   │   ├── layout.tsx
│   │   └── page.tsx
│   ├── lib/
│   │   ├── whisper.ts   # OpenAI Whisper transcription
│   │   ├── ffmpeg.ts    # FFmpeg subtitle burning
│   │   └── srt.ts       # SRT format helpers
│   ├── next.config.js
│   ├── tsconfig.json
│   └── .env.example
│
└── mobile/           # React Native (Expo) app
    ├── App.tsx
    ├── app.json
    ├── src/
    │   ├── api/client.ts
    │   ├── navigation/AppNavigator.tsx
    │   ├── screens/
    │   │   ├── HomeScreen.tsx
    │   │   ├── UploadScreen.tsx
    │   │   ├── SubtitleEditorScreen.tsx
    │   │   └── ExportScreen.tsx
    │   ├── components/SubtitleItem.tsx
    │   ├── utils/srt.ts
    │   └── types/index.ts
    └── tsconfig.json
```

---

## Prerequisites

| Tool | Version | Install |
|---|---|---|
| Node.js | ≥ 18 | https://nodejs.org |
| FFmpeg | any recent | https://ffmpeg.org/download.html — add to PATH |
| Expo CLI | latest | `npm i -g expo-cli` |
| OpenAI API key | — | https://platform.openai.com/api-keys |

**Verify FFmpeg is on your PATH:**
```bash
ffmpeg -version
```

---

## Setup

### 1. Backend

```bash
cd backend
cp .env.example .env
# Edit .env and set OPENAI_API_KEY=sk-...
npm install
npm run dev
```

The server starts at **http://localhost:3000**.

### 2. Mobile App

```bash
cd mobile
npm install
```

**Configure the API URL** in `src/api/client.ts`:

| Scenario | Value |
|---|---|
| iOS Simulator | `http://localhost:3000` |
| Android Emulator | `http://10.0.2.2:3000` |
| Physical device | `http://<your-machine-IP>:3000` |

Or set it via environment variable:
```bash
EXPO_PUBLIC_API_URL=http://10.0.2.2:3000 npx expo start
```

**Start the app:**
```bash
npx expo start
# Press 'a' for Android, 'i' for iOS, or scan QR code with Expo Go
```

---

## How It Works

```
Mobile                     Backend
  │                           │
  │── POST /api/upload ───────►│  1. Save video to temp dir
  │   (multipart/form-data)    │  2. Call Whisper API
  │◄─ { filePath, segments,   │  3. Return SRT + segments
  │     srt }                  │
  │                           │
  │  [User edits subtitles]   │
  │                           │
  │── POST /api/render ───────►│  4. Write SRT file
  │   { filePath, srt }        │  5. Run FFmpeg burn
  │◄─ { videoUrl }            │  6. Return download URL
  │                           │
  │── GET /api/download/:f ───►│  7. Stream video file
  │◄─ video/mp4 binary        │  8. Delete temp files
```

---

## API Reference

### `POST /api/upload`

**Request:** `multipart/form-data` with field `video` (mp4/mov/etc.)

**Response:**
```json
{
  "filePath": "/tmp/video-uuid.mp4",
  "segments": [
    { "id": 1, "start": 0.0, "end": 3.5, "text": "Hello, world." },
    { "id": 2, "start": 4.0, "end": 7.2, "text": "This is a subtitle." }
  ],
  "srt": "1\n00:00:00,000 --> 00:00:03,500\nHello, world.\n\n2\n..."
}
```

### `POST /api/render`

**Request:**
```json
{
  "filePath": "/tmp/video-uuid.mp4",
  "srt": "1\n00:00:00,000 --> 00:00:03,500\nHello, world.\n\n..."
}
```

**Response:**
```json
{
  "videoUrl": "/api/download/output-uuid.mp4"
}
```

### `GET /api/download/:filename`

Returns `video/mp4` binary. File is deleted from temp after the first download.

---

## Environment Variables

| Variable | Required | Description |
|---|---|---|
| `OPENAI_API_KEY` | Yes | OpenAI key for Whisper API |
| `EXPO_PUBLIC_API_URL` | No | Backend URL (default: `http://localhost:3000`) |

---

## Notes & Limitations (MVP)

- **File storage:** temp files only — not suitable for production at scale
- **No auth:** the render endpoint trusts the `filePath` from the client — add validation for production
- **Video size:** very large files may hit Next.js body limits; test with clips under 100 MB
- **FFmpeg must be installed** and available in `PATH` on the backend machine
- **Whisper billing:** each transcription call uses OpenAI credits


# Welcome to your Expo app 👋

This is an [Expo](https://expo.dev) project created with [`create-expo-app`](https://www.npmjs.com/package/create-expo-app).

## Get started

1. Install dependencies

   ```bash
   npm install
   ```

2. Start the app

   ```bash
   npx expo start
   ```

3. build the app on expo.dev

   ```bash
   eas build --profile preview
   ```

4. build the android app standalone on locally

   ```bash
   npx expo run:android --variant release
   ```
   Note: location apk file in android/app/build/outputs/apk/release/app-release.apk

In the output, you'll find options to open the app in a

- [development build](https://docs.expo.dev/develop/development-builds/introduction/)
- [Android emulator](https://docs.expo.dev/workflow/android-studio-emulator/)
- [iOS simulator](https://docs.expo.dev/workflow/ios-simulator/)
- [Expo Go](https://expo.dev/go), a limited sandbox for trying out app development with Expo

You can start developing by editing the files inside the **app** directory. This project uses [file-based routing](https://docs.expo.dev/router/introduction).

## Get a fresh project

When you're ready, run:

```bash
npm run reset-project
```

This command will move the starter code to the **app-example** directory and create a blank **app** directory where you can start developing.

## Learn more

To learn more about developing your project with Expo, look at the following resources:

- [Expo documentation](https://docs.expo.dev/): Learn fundamentals, or go into advanced topics with our [guides](https://docs.expo.dev/guides).
- [Learn Expo tutorial](https://docs.expo.dev/tutorial/introduction/): Follow a step-by-step tutorial where you'll create a project that runs on Android, iOS, and the web.

## Join the community

Join our community of developers creating universal apps.

- [Expo on GitHub](https://github.com/expo/expo): View our open source platform and contribute.
- [Discord community](https://chat.expo.dev): Chat with Expo users and ask questions.

## Build on expo.dev
eas build --profile preview