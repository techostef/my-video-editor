import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Alert,
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../types';

type Props = {
  navigation: NativeStackNavigationProp<RootStackParamList, 'Upload'>;
};

export default function UploadScreen({ navigation }: Props) {
  const [videoUri, setVideoUri] = useState<string | null>(null);
  const [pickedLabel, setPickedLabel] = useState('');

  const goToTrim = (uri: string, durationMs: number | undefined, label: string) => {
    setVideoUri(uri);
    setPickedLabel(label);
    // expo-image-picker returns duration in milliseconds; fall back to 0 so
    // TrimScreen can read the real duration from the Video component on load.
    navigation.navigate('Trim', { videoUri: uri, duration: (durationMs ?? 0) / 1000 });
  };

  const pickVideo = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permission denied', 'Photo library access is required.');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Videos,
      quality: 1,
    });

    if (!result.canceled && result.assets[0]) {
      const asset = result.assets[0];
      goToTrim(asset.uri, asset.duration ?? undefined, 'Video selected');
    }
  };

  const recordVideo = async () => {
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permission denied', 'Camera permission is required.');
      return;
    }

    const result = await ImagePicker.launchCameraAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Videos,
      videoMaxDuration: 300,
      quality: 1,
    });

    if (!result.canceled && result.assets[0]) {
      const asset = result.assets[0];
      goToTrim(asset.uri, asset.duration ?? undefined, 'Video recorded');
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Select a Video</Text>

      <TouchableOpacity style={styles.optionCard} onPress={pickVideo}>
        <Text style={styles.optionIcon}>🖼️</Text>
        <View>
          <Text style={styles.optionLabel}>Choose from Gallery</Text>
          <Text style={styles.optionHint}>Pick an existing video</Text>
        </View>
      </TouchableOpacity>

      <TouchableOpacity style={styles.optionCard} onPress={recordVideo}>
        <Text style={styles.optionIcon}>📹</Text>
        <View>
          <Text style={styles.optionLabel}>Record a Video</Text>
          <Text style={styles.optionHint}>Up to 5 minutes</Text>
        </View>
      </TouchableOpacity>

      {videoUri ? (
        <View style={styles.readyBadge}>
          <Text style={styles.readyText}>✓ {pickedLabel} — tap a button above to pick another</Text>
        </View>
      ) : (
        <View style={styles.hint}>
          <Text style={styles.hintText}>After selecting, you can trim the video before generating subtitles.</Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 24, backgroundColor: '#f8f9fa' },
  title: { fontSize: 22, fontWeight: '700', color: '#1a1a2e', marginBottom: 24, marginTop: 8 },
  optionCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    padding: 20,
    borderRadius: 12,
    marginBottom: 16,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
  },
  optionIcon: { fontSize: 32, marginRight: 16 },
  optionLabel: { fontSize: 16, fontWeight: '600', color: '#1a1a2e' },
  optionHint: { fontSize: 13, color: '#999', marginTop: 2 },
  readyBadge: {
    backgroundColor: '#e8f5e9',
    padding: 12,
    borderRadius: 8,
    marginBottom: 16,
  },
  readyText: { color: '#2e7d32', fontWeight: '500' },
  hint: {
    backgroundColor: '#ede9ff',
    padding: 14,
    borderRadius: 10,
    marginTop: 8,
  },
  hintText: { color: '#4a3f8c', fontSize: 13, lineHeight: 20 },
});
