import { router, useLocalSearchParams } from 'expo-router';
import { useEffect, useState } from 'react';
import { Pressable, ScrollView, Text, TextInput, View, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { BanterButton } from '@/components/banter-button';
import { difficulties, modes } from '@/constants/practice-options';
import useContinue from '@/hooks/use-continue';
const personalities = ['Natural', 'Friendly', 'Reserved', 'Direct', 'Skeptical', 'Impatient', 'Professional', 'Rude / Confrontational', 'Custom'];
const key = 'banter.preferences.v1';
export default function Customize() {
  const params = useLocalSearchParams<{ situation?: string; partner?: string }>();
  const [difficulty, setDifficulty] = useState('Medium');
  const [mode, setMode] = useState('Text');
  const [personality, setPersonality] = useState('Natural');
  const [custom, setCustom] = useState('');
  useEffect(() => { let active = true; AsyncStorage.getItem(key).then(raw => { if (!raw || !active) return; const p = JSON.parse(raw); if (difficulties.some(d => d.name === p.difficulty)) setDifficulty(p.difficulty); if (modes.some(m => m.name === p.mode)) setMode(p.mode); if (personalities.includes(p.personality)) setPersonality(p.personality); if (typeof p.custom === 'string') setCustom(p.custom); }).catch(() => {}); return () => { active = false; }; }, []);
  const valid = !!params.situation?.trim() && !!params.partner?.trim() && (personality !== 'Custom' || !!custom.trim());
  function start() { if (!valid) return; void AsyncStorage.setItem(key, JSON.stringify({ difficulty, mode, personality, custom })).catch(() => {}); router.push({ pathname: '/practice', params: { situation: params.situation || '', partner: params.partner || '', difficulty, mode, personality: personality === 'Custom' ? custom.trim() : personality } }); }
  useContinue(start, valid);
  function option(name: string, selected: boolean, choose: () => void, description?: string) { return <Pressable key={name} accessibilityRole="button" accessibilityState={{ selected }} onPress={choose} style={{ padding: 14, borderRadius: 14, borderWidth: 1, borderColor: selected ? '#6946A1' : '#D8C7E8', backgroundColor: selected ? '#F1E8FA' : '#fff', gap: 4 }}><Text style={{ color: '#302539', fontWeight: '700', fontSize: 16 }}>{selected ? '✓ ' : ''}{name}</Text>{description && <Text style={{ color: '#6B6275' }}>{description}</Text>}</Pressable>; }
  const heading = { fontSize: 19, fontWeight: '700' as const, color: '#302539' };
  return <SafeAreaView style={{ flex: 1, backgroundColor: '#FFF8F4' }}><ScrollView keyboardShouldPersistTaps="handled" style={{ width: '100%' }} contentContainerStyle={{ width: '100%', alignItems: 'center' }}><View style={{ width: '100%', maxWidth: 720, padding: 24, gap: 12 }}>
    <Pressable accessibilityRole="button" onPress={() => router.back()}><Text style={{ color: '#6946A1' }}>‹ Back</Text></Pressable>
    <Text style={{ fontSize: 30, fontWeight: '800', color: '#302539' }}>Set up your conversation</Text>
    <Text style={heading}>Conversation difficulty</Text>{difficulties.map(d => option(d.name, difficulty === d.name, () => setDifficulty(d.name), d.description))}
    <Text style={heading}>Personality</Text><View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>{personalities.map(p => option(p, personality === p, () => setPersonality(p)))}</View>
    {personality === 'Custom' && <TextInput value={custom} onChangeText={setCustom} maxLength={100} placeholder="e.g. strict but caring" onSubmitEditing={start} returnKeyType="go" style={{ backgroundColor: '#fff', padding: 14, borderRadius: 12, borderWidth: 1, borderColor: '#D8C7E8' }}/>}
    <Text style={heading}>Practice mode</Text>{modes.map(m => option(m.name, mode === m.name, () => setMode(m.name), m.description))}
    <BanterButton title="Start simulation →" disabled={!valid} onPress={start}/>{Platform.OS === 'web' && <Text style={{ color: '#6B6275' }}>Enter to start · Tab to move between options</Text>}
  </View></ScrollView></SafeAreaView>;
}
