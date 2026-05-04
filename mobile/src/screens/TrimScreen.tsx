import React, { useRef, useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { Video, ResizeMode, AVPlaybackStatus } from 'expo-av';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../types';
import { uploadVideo } from '../api/client';
import VideoTimeline from '../components/VideoTimeline';

type Props = NativeStackScreenProps<RootStackParamList, 'Trim'>;

const MIN_TRIM_SECS = 1;

function fmtCompact(secs: number): string {
  const m = Math.floor(secs / 60);
  const s = Math.floor(secs % 60);
  const ms = Math.floor((secs % 1) * 100);
  return `${m}:${s.toString().padStart(2, '0')}.${ms.toString().padStart(2, '0')}`;
}

export default function TrimScreen({ navigation, route }: Props) {
  const { videoUri, duration: paramDuration } = route.params;

  const videoRef = useRef<Video>(null);
  const [duration, setDuration] = useState(paramDuration > 0 ? paramDuration : 0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [loading, setLoading] = useState(false);
  const [statusMsg, setStatusMsg] = useState('');

  // Trim bounds as fractions [0, 1]
  const [startFrac, setStartFrac] = useState(0);
  const [endFrac, setEndFrac] = useState(1);
  const startFracRef = useRef(0);
  const endFracRef = useRef(1);
  const durationRef = useRef(paramDuration > 0 ? paramDuration : 0);

  // Keep refs in sync for playback boundary checks
  useEffect(() => { startFracRef.current = startFrac; }, [startFrac]);
  useEffect(() => { endFracRef.current = endFrac; }, [endFrac]);
  useEffect(() => { durationRef.current = duration; }, [duration]);

  // --- Playback ---

  const onPlaybackStatusUpdate = useCallback((status: AVPlaybackStatus) => {
    if (!status.isLoaded) return;

    if (status.durationMillis && status.durationMillis > 0) {
      const realDur = status.durationMillis / 1000;
      if (Math.abs(realDur - durationRef.current) > 0.5) {
        setDuration(realDur);
      }
    }

    const posSecs = (status.positionMillis ?? 0) / 1000;
    setCurrentTime(posSecs);
    setIsPlaying(status.isPlaying ?? false);

    // Stop at end trim boundary
    if (status.isPlaying && posSecs >= endFracRef.current * durationRef.current - 0.1) {
      videoRef.current?.pauseAsync();
      videoRef.current?.setPositionAsync(startFracRef.current * durationRef.current * 1000);
    }
  }, []);

  const togglePlay = async () => {
    if (isPlaying) {
      await videoRef.current?.pauseAsync();
    } else {
      const startMs = startFracRef.current * durationRef.current * 1000;
      const endMs = endFracRef.current * durationRef.current * 1000;
      const curMs = currentTime * 1000;
      const seekMs = curMs >= startMs && curMs < endMs ? curMs : startMs;
      await videoRef.current?.setPositionAsync(seekMs);
      await videoRef.current?.playAsync();
    }
  };

  // --- Seek from timeline ---
  const handleSeek = useCallback(async (seconds: number) => {
    await videoRef.current?.setPositionAsync(seconds * 1000);
  }, []);

  // --- Handle fraction changes (also seek video) ---
  const handleStartFracChange = useCallback((f: number) => {
    setStartFrac(f);
  }, []);

  const handleEndFracChange = useCallback((f: number) => {
    setEndFrac(f);
  }, []);

  // --- Upload ---

  const handleContinue = async (skipTrim: boolean) => {
    setLoading(true);
    setStatusMsg('Uploading & transcribing with Whisper AI…');
    try {
      const dur = durationRef.current;
      const start = skipTrim ? undefined : startFracRef.current * dur;
      const end = skipTrim ? undefined : endFracRef.current * dur;
      const response = await uploadVideo(videoUri, start, end);
      navigation.navigate('SubtitleEditor', {
        filePath: response.filePath,
        segments: response.segments,
        srt: response.srt,
        videoUri,
      });
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Upload failed';
      Alert.alert('Upload Error', `${msg}\n\nMake sure the backend is running.`);
      setStatusMsg('');
    } finally {
      setLoading(false);
    }
  };

  // --- Derived ---
  const startTime = startFrac * duration;
  const endTime = endFrac * duration;
  const trimDuration = endTime - startTime;
  const playheadFrac = duration > 0 ? currentTime / duration : 0;

  return (
    <View style={styles.container}>
      {/* ── Video Preview ── */}
      <Video
        ref={videoRef}
        source={{ uri: videoUri }}
        style={styles.video}
        resizeMode={ResizeMode.CONTAIN}
        onPlaybackStatusUpdate={onPlaybackStatusUpdate}
        shouldPlay={false}
        isLooping={false}
        useNativeControls={false}
      />

      {/* ── Duration badge ── */}
      <View style={styles.durationRow}>
        <Text style={styles.durationText}>
          Selected: <Text style={styles.durationHighlight}>{fmtCompact(trimDuration)}</Text>
          {'  '}|{'  '}Total: {fmtCompact(duration)}
        </Text>
      </View>

      {/* ── Zoomable Timeline ── */}
      <VideoTimeline
        videoUri={videoUri}
        duration={duration}
        startFrac={startFrac}
        endFrac={endFrac}
        playheadFrac={playheadFrac}
        onStartFracChange={handleStartFracChange}
        onEndFracChange={handleEndFracChange}
        onSeek={handleSeek}
        minTrimSecs={MIN_TRIM_SECS}
      />

      {/* ── Play button ── */}
      <View style={styles.playRow}>
        <TouchableOpacity style={styles.playBtn} onPress={togglePlay} disabled={loading}>
          <Text style={styles.playBtnText}>{isPlaying ? '⏸' : '▶'}</Text>
        </TouchableOpacity>
      </View>

      {/* ── Status / loading ── */}
      {loading && (
        <View style={styles.loadingRow}>
          <ActivityIndicator color="#6c63ff" size="small" />
          <Text style={styles.statusText}>{statusMsg}</Text>
        </View>
      )}

      {/* ── Action buttons ── */}
      <View style={styles.actionRow}>
        <TouchableOpacity
          style={[styles.skipBtn, loading && styles.disabled]}
          onPress={() => handleContinue(true)}
          disabled={loading}
        >
          <Text style={styles.skipBtnText}>Use Full Video</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.continueBtn, loading && styles.disabled]}
          onPress={() => handleContinue(false)}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="#fff" size="small" />
          ) : (
            <Text style={styles.continueBtnText}>Trim & Continue →</Text>
          )}
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0d0d0d',
  },
  video: {
    width: '100%',
    aspectRatio: 16 / 9,
    backgroundColor: '#000',
  },
  durationRow: {
    paddingVertical: 10,
    paddingHorizontal: 16,
    alignItems: 'center',
  },
  durationText: {
    color: '#aaa',
    fontSize: 13,
  },
  durationHighlight: {
    color: '#f5c518',
    fontWeight: '700',
  },

  // Play button
  playRow: {
    alignItems: 'center',
    marginTop: 12,
  },
  playBtn: {
    backgroundColor: '#2a2a2a',
    borderRadius: 28,
    width: 52,
    height: 52,
    alignItems: 'center',
    justifyContent: 'center',
  },
  playBtnText: {
    fontSize: 22,
    color: '#fff',
  },

  // Loading
  loadingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    marginTop: 16,
  },
  statusText: {
    color: '#aaa',
    fontSize: 13,
    fontStyle: 'italic',
  },

  // Action buttons
  actionRow: {
    flexDirection: 'row',
    gap: 12,
    padding: 16,
    marginTop: 'auto',
  },
  skipBtn: {
    flex: 1,
    paddingVertical: 16,
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: '#555',
    alignItems: 'center',
  },
  skipBtnText: {
    color: '#ccc',
    fontSize: 14,
    fontWeight: '500',
  },
  continueBtn: {
    flex: 2,
    paddingVertical: 16,
    borderRadius: 12,
    backgroundColor: '#6c63ff',
    alignItems: 'center',
  },
  continueBtnText: {
    color: '#fff',
    fontSize: 15,
    fontWeight: '700',
  },
  disabled: {
    opacity: 0.45,
  },
});
