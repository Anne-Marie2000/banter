import { router, useFocusEffect } from 'expo-router';
import { useCallback, useState } from 'react';
import { ScrollView, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { BanterButton } from '@/components/banter-button';
import { readHistory, clearHistory, type HistoryItem } from '@/lib/history';
export default function JourneyScreen() {
  const [items, setItems] = useState<HistoryItem[]>([]); const [notice, setNotice] = useState(''); const [confirm, setConfirm] = useState(false);
  useFocusEffect(useCallback(() => { let active = true; readHistory().then(data => { if (active) setItems(data); }).catch(() => { if (active) setNotice('Could not load history.'); }); return () => { active = false; }; }, []));
  async function clear() { try { await clearHistory(); setItems([]); setConfirm(false); setNotice('History cleared.'); } catch { setNotice('Could not clear history.'); } }
  return <SafeAreaView style={{ flex: 1, backgroundColor: '#FFF8F4' }}><ScrollView style={{ width: '100%' }} contentContainerStyle={{ width: '100%', alignItems: 'center' }}><View style={{ width: '100%', maxWidth: 700, padding: 24, gap: 16 }}><BanterButton title="Back to home" onPress={() => router.replace('/')} look="outline"/><Text style={{ fontSize: 34, fontWeight: '800', color: '#302539' }}>My Journey</Text><Text style={{ color: '#6B6275', fontSize: 16 }}>Review your previous practice sessions.</Text><Text style={{ fontSize: 22, color: '#6946A1', fontWeight: '700' }}>{items.length} saved {items.length === 1 ? 'session' : 'sessions'}</Text>
    {items.length === 0 && <Text style={{ color: '#6B6275' }}>Your saved sessions will appear here.</Text>}
    {items.map(item => <View key={item.id} style={{ backgroundColor: '#fff', padding: 18, borderRadius: 16, gap: 6 }}><Text style={{ fontSize: 18, fontWeight: '700', color: '#302539' }}>{item.partner}</Text><Text style={{ color: '#6B6275' }}>{new Date(item.date).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })} · {item.difficulty} · {item.turns} {item.turns === 1 ? 'reply' : 'replies'}</Text>{!!item.feeling && <Text style={{ color: '#6946A1' }}>{item.feeling}</Text>}</View>)}
    {!!notice && <Text>{notice}</Text>}{items.length > 0 && <BanterButton title={confirm ? 'Confirm clear history' : 'Clear history'} onPress={() => confirm ? void clear() : setConfirm(true)} look="outline" />}{confirm && <BanterButton title="Cancel" onPress={() => setConfirm(false)} look="outline"/>}
  </View></ScrollView></SafeAreaView>;
}
