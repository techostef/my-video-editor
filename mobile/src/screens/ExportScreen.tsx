import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ActivityIndicator,
} from 'react-native';
import * as FileSystem from 'expo-file-system';
import * as MediaLibrary from 'expo-media-library';
import * as Sharing from 'expo-sharing';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { RouteProp } from '@react-navigation/native';
import type { RootStackParamList } from '../types';
import { renderVideo } from '../api/client';

type Props = {
  navigation: NativeStackNavigationProp<RootStackParamList, 'Export'>;
  route: RouteProp<RootStackParamList, 'Export'>;
};

export default function ExportScreen({ navigation, route }: Props) {
  const { filePath, srt } = route.params;
  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState('');
  const [localUri, setLocalUri] = useState<string | null>(null);

  const handleRender = async () => {
    setLoading(true);
    setProgress('Burning subtitles into video...');

    try {
      const downloadUrl = await renderVideo(filePath, srt);

      setProgress('Downloading processed video...');
      const dest = (FileSystem.documentDirectory ?? '') + 'subtitled-video.mp4';
      const { uri } = await FileSystem.downloadAsync(downloadUrl, dest);

      setLocalUri(uri);
      setProgress('Video is ready!');
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Render failed';
      Alert.alert('Export Error', `${message}\n\nMake sure the backend is running.`);
      setProgress('');
    } finally {
      setLoading(false);
    }
  };

  const saveToGallery = async () => {
    if (!localUri) return;
    const { status } = await MediaLibrary.requestPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permission denied', 'Media library access is required.');
      return;
    }
    await MediaLibrary.saveToLibraryAsync(localUri);
    Alert.alert('Saved!', 'Video saved to your photo library.');
  };

  const shareVideo = async () => {
    if (!localUri) return;
    if (await Sharing.isAvailableAsync()) {
      await Sharing.shareAsync(localUri, { mimeType: 'video/mp4' });
    } else {
      Alert.alert('Not available', 'Sharing is not available on this device.');
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.icon}>{localUri ? '✅' : '🎬'}</Text>
      <Text style={styles.title}>{localUri ? 'Export Complete!' : 'Export Video'}</Text>
      <Text style={styles.subtitle}>
        {localUri
          ? 'Your subtitled video is ready.'
          : 'Subtitles will be permanently burned into the video.'}
      </Text>

      {!localUri ? (
        <TouchableOpacity
          style={[styles.primaryButton, loading && styles.disabled]}
          onPress={handleRender}
          disabled={loading}
        >
          {loading ? (
            <>
              <ActivityIndicator color="#fff" style={{ marginBottom: 8 }} />
              <Text style={styles.primaryButtonText}>{progress}</Text>
            </>
          ) : (
            <Text style={styles.primaryButtonText}>Render Video</Text>
          )}
        </TouchableOpacity>
      ) : (
        <View style={styles.actions}>
          <TouchableOpacity style={styles.primaryButton} onPress={saveToGallery}>
            <Text style={styles.primaryButtonText}>Save to Gallery</Text>
          </TouchableOpacity>
          <TouchableOpacity style={[styles.primaryButton, styles.greenButton]} onPress={shareVideo}>
            <Text style={styles.primaryButtonText}>Share Video</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.ghostButton} onPress={() => navigation.popToTop()}>
            <Text style={styles.ghostButtonText}>Start Over</Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 24,
    backgroundColor: '#f8f9fa',
    justifyContent: 'center',
    alignItems: 'center',
  },
  icon: { fontSize: 64, marginBottom: 16 },
  title: { fontSize: 24, fontWeight: '700', color: '#1a1a2e', marginBottom: 8, textAlign: 'center' },
  subtitle: { fontSize: 14, color: '#666', textAlign: 'center', marginBottom: 40, lineHeight: 22 },
  actions: { width: '100%', gap: 14 },
  primaryButton: {
    backgroundColor: '#6c63ff',
    padding: 18,
    borderRadius: 12,
    alignItems: 'center',
    width: '100%',
  },
  greenButton: { backgroundColor: '#4caf50' },
  primaryButtonText: { color: '#fff', fontSize: 16, fontWeight: '600' },
  disabled: { opacity: 0.65 },
  ghostButton: { padding: 16, alignItems: 'center' },
  ghostButtonText: { color: '#6c63ff', fontSize: 15, fontWeight: '500' },
});
