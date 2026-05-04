import React from 'react';
import { View, StyleSheet } from 'react-native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../types';
import HomeScreen from '../screens/HomeScreen';
import UploadScreen from '../screens/UploadScreen';
import TrimScreen from '../screens/TrimScreen';
import SubtitleEditorScreen from '../screens/SubtitleEditorScreen';
import ExportScreen from '../screens/ExportScreen';
import { useBackendStatus } from '../hooks/useBackendStatus';

const Stack = createNativeStackNavigator<RootStackParamList>();

const STATUS_COLOR: Record<string, string> = {
  connected: '#4caf50',
  disconnected: '#f44336',
  checking: '#9e9e9e',
};

function BackendStatusDot() {
  const status = useBackendStatus();
  return (
    <View style={styles.dotWrapper}>
      <View style={[styles.dot, { backgroundColor: STATUS_COLOR[status] }]} />
      {status === 'connected' && <View style={styles.pulse} />}
    </View>
  );
}

export default function AppNavigator() {
  return (
    <Stack.Navigator
      screenOptions={{
        headerStyle: { backgroundColor: '#6c63ff' },
        headerTintColor: '#fff',
        headerTitleStyle: { fontWeight: '600' },
        headerRight: () => <BackendStatusDot />,
      }}
    >
      <Stack.Screen name="Home" component={HomeScreen} options={{ title: 'Video Editor' }} />
      <Stack.Screen name="Upload" component={UploadScreen} options={{ title: 'Select Video' }} />
      <Stack.Screen
        name="Trim"
        component={TrimScreen}
        options={{ title: 'Trim Video', headerStyle: { backgroundColor: '#0d0d0d' }, headerTintColor: '#fff' }}
      />
      <Stack.Screen
        name="SubtitleEditor"
        component={SubtitleEditorScreen}
        options={{ title: 'Edit Subtitles' }}
      />
      <Stack.Screen name="Export" component={ExportScreen} options={{ title: 'Export' }} />
    </Stack.Navigator>
  );
}

const styles = StyleSheet.create({
  dotWrapper: {
    marginRight: 12,
    width: 14,
    height: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  dot: {
    width: 12,
    height: 12,
    borderRadius: 6,
  },
  pulse: {
    position: 'absolute',
    width: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: '#4caf50',
    opacity: 0.3,
  },
});
