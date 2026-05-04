import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../types';

type Props = {
  navigation: NativeStackNavigationProp<RootStackParamList, 'Home'>;
};

export default function HomeScreen({ navigation }: Props) {
  return (
    <View style={styles.container}>
      <Text style={styles.icon}>🎬</Text>
      <Text style={styles.title}>Video Subtitle Editor</Text>
      <Text style={styles.subtitle}>
        Upload a video, auto-generate subtitles with AI, edit them, and export.
      </Text>

      <View style={styles.steps}>
        {['Upload or record a video', 'AI generates subtitles', 'Edit subtitle text', 'Export with burned-in captions'].map(
          (step, i) => (
            <View key={i} style={styles.step}>
              <Text style={styles.stepNum}>{i + 1}</Text>
              <Text style={styles.stepText}>{step}</Text>
            </View>
          )
        )}
      </View>

      <TouchableOpacity style={styles.button} onPress={() => navigation.navigate('Upload')}>
        <Text style={styles.buttonText}>Get Started</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
    backgroundColor: '#f8f9fa',
  },
  icon: { fontSize: 64, marginBottom: 16 },
  title: {
    fontSize: 26,
    fontWeight: '700',
    color: '#1a1a2e',
    marginBottom: 12,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 15,
    color: '#666',
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 36,
  },
  steps: { width: '100%', marginBottom: 40 },
  step: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    backgroundColor: '#fff',
    padding: 14,
    borderRadius: 10,
    elevation: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 2,
  },
  stepNum: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#6c63ff',
    color: '#fff',
    textAlign: 'center',
    lineHeight: 28,
    fontWeight: '700',
    marginRight: 12,
    fontSize: 13,
  },
  stepText: { fontSize: 14, color: '#444', flex: 1 },
  button: {
    backgroundColor: '#6c63ff',
    paddingVertical: 16,
    paddingHorizontal: 48,
    borderRadius: 12,
    elevation: 3,
    shadowColor: '#6c63ff',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  buttonText: { color: '#fff', fontSize: 17, fontWeight: '600' },
});
