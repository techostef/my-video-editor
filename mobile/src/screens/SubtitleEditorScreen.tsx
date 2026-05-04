import React, { useState } from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet } from 'react-native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { RouteProp } from '@react-navigation/native';
import type { RootStackParamList, Segment } from '../types';
import SubtitleItem from '../components/SubtitleItem';
import { segmentsToSrt } from '../utils/srt';

type Props = {
  navigation: NativeStackNavigationProp<RootStackParamList, 'SubtitleEditor'>;
  route: RouteProp<RootStackParamList, 'SubtitleEditor'>;
};

export default function SubtitleEditorScreen({ navigation, route }: Props) {
  const { filePath, segments: initial } = route.params;
  const [segments, setSegments] = useState<Segment[]>(initial);

  const updateSegment = (id: number, text: string) => {
    setSegments(prev => prev.map(s => (s.id === id ? { ...s, text } : s)));
  };

  const handleExport = () => {
    navigation.navigate('Export', { filePath, srt: segmentsToSrt(segments) });
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Edit Subtitles</Text>
        <Text style={styles.count}>{segments.length} segments</Text>
      </View>
      <Text style={styles.hint}>Tap any segment to edit the text.</Text>

      <FlatList
        data={segments}
        keyExtractor={item => String(item.id)}
        renderItem={({ item }) => (
          <SubtitleItem segment={item} onUpdate={updateSegment} />
        )}
        contentContainerStyle={styles.list}
        showsVerticalScrollIndicator={false}
      />

      <TouchableOpacity style={styles.exportButton} onPress={handleExport}>
        <Text style={styles.exportButtonText}>Export with Subtitles →</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 24, backgroundColor: '#f8f9fa' },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'baseline',
    marginTop: 8,
    marginBottom: 4,
  },
  title: { fontSize: 22, fontWeight: '700', color: '#1a1a2e' },
  count: { fontSize: 13, color: '#999' },
  hint: { fontSize: 13, color: '#aaa', marginBottom: 16 },
  list: { paddingBottom: 8 },
  exportButton: {
    backgroundColor: '#6c63ff',
    padding: 18,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 8,
  },
  exportButtonText: { color: '#fff', fontSize: 16, fontWeight: '600' },
});
