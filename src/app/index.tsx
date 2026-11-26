import { useEffect, useState } from 'react';
import { router } from 'expo-router';
import { Image, Pressable, ScrollView, StyleSheet, Text, View, useWindowDimensions } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { scenarios } from '@/constants/scenarios';
import { BanterButton } from '@/components/banter-button';
export default function HomeScreen() {
  const { width } = useWindowDimensions();
  const [ready, setReady] = useState(false);
  useEffect(() => { const timer = setTimeout(() => setReady(true), 0); return () => clearTimeout(timer); }, []);
  const twoColumns = ready && width >= 580;
  return <SafeAreaView style={s.screen}><ScrollView style={{ width: '100%' }} contentContainerStyle={{ width: '100%', alignItems: 'center' }}><View style={s.page}>
    <View style={s.nav}><Image source={require('../../assets/images/banter-logo.png')} style={s.logo} resizeMode="contain" accessibilityLabel="Banter" /><Pressable accessibilityRole="button" onPress={() => router.push('/journey')}><Text style={s.link}>My Journey ↗</Text></Pressable></View>
    <View style={s.hero}><Text style={s.eyebrow}>YOUR CONVERSATION PRACTICE SPACE</Text><Text style={s.title}>Find the words before the moment.</Text><Text style={s.body}>Practice real conversations with AI, at your own pace. Prepare for the conversations that matter.</Text><BanterButton title="Start practicing →" onPress={() => router.push('/situation')} /><Text style={s.note}>Your conversation is processed by an AI service. Avoid sharing sensitive personal information.</Text></View>
    <Text style={s.heading}>What would you like to practice?</Text><Text style={s.body}>Pick a situation or create your own.</Text>
    <View style={s.grid}>{scenarios.map((scenario, i) => <Pressable key={scenario.name} accessibilityRole="button" onPress={() => router.push({ pathname: '/situation', params: { scenario: scenario.name } })} style={({ pressed }) => [s.card, { width: twoColumns ? '48.5%' : '100%', backgroundColor: i % 3 === 0 ? '#F1E8FA' : i % 3 === 1 ? '#FCEBE2' : '#fff', opacity: pressed ? .75 : 1 }]}><Text style={s.cardTitle}>{scenario.name}  ↗</Text><Text style={s.body}>{scenario.description}</Text></Pressable>)}</View>
    <BanterButton title="Create your own situation" look="outline" onPress={() => router.push('/situation')}/>
  </View></ScrollView></SafeAreaView>;
}
const s = StyleSheet.create({ screen: { flex: 1, backgroundColor: '#FFF8F4' }, page: { width: '100%', maxWidth: 850, alignSelf: 'center', padding: 24, paddingBottom: 48, gap: 16 }, nav: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }, logo: { width: 150, height: 64 }, link: { fontSize: 14, fontWeight: '700', color: '#6946A1' }, hero: { padding: 24, backgroundColor: '#F1E8FA', borderRadius: 24, gap: 16 }, eyebrow: { fontSize: 11, letterSpacing: 1.5, fontWeight: '800', color: '#6946A1' }, title: { fontSize: 36, lineHeight: 42, fontWeight: '800', color: '#302539' }, heading: { fontSize: 23, fontWeight: '800', color: '#302539', marginTop: 8 }, body: { fontSize: 15, lineHeight: 22, color: '#6B6275' }, note: { fontSize: 12, lineHeight: 18, color: '#6B6275' }, grid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between', gap: 12 }, card: { padding: 20, borderRadius: 18, borderWidth: 1, borderColor: '#EADFF0', gap: 9 }, cardTitle: { fontSize: 17, fontWeight: '700', color: '#302539' } });
