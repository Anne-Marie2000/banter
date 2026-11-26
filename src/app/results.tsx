import { router, useLocalSearchParams } from 'expo-router';
import { useRef, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { BanterButton } from '@/components/banter-button';
import { getReply, lastConversation, type Session } from '@/lib/chat';
import { saveHistory } from '@/lib/history';
export default function ResultsScreen() {
  const params = useLocalSearchParams<Partial<Session>>();
  const session = { situation: params.situation || '', partner: params.partner || 'Conversation partner', difficulty: params.difficulty || 'Medium', mode: params.mode || 'Text', personality: params.personality || 'Natural' };
  const [messages] = useState(lastConversation);
  const turns = messages.filter(m => m.from === 'user').length;
  const [feeling, setFeeling] = useState(''); const [feedback, setFeedback] = useState(''); const [busy, setBusy] = useState(false); const [saved, setSaved] = useState(false); const [notice, setNotice] = useState('');
  const id = useRef("");
  async function coach() { if (busy) return; setBusy(true); setNotice(''); try { setFeedback(await getReply(session, messages, true)); } catch { setNotice('Feedback unavailable. You can try again or skip it.'); } finally { setBusy(false); } }
  async function save() { if (!id.current) id.current = `${Date.now()}-${Math.random().toString(36).slice(2)}`; try { await saveHistory({ id: id.current, partner: session.partner, difficulty: session.difficulty, date: new Date().toISOString(), turns, feeling }); setSaved(true); setNotice('Session saved on this device.'); } catch { setNotice('Could not save this session.'); } }
  return <SafeAreaView style={s.screen}><ScrollView style={{ width: '100%' }} contentContainerStyle={{ width: '100%', alignItems: 'center' }}><View style={s.page}>
    <Text style={s.eyebrow}>SESSION COMPLETE</Text><Text style={s.title}>Practice complete.</Text><Text style={s.body}>You sent {turns} {turns === 1 ? 'reply' : 'replies'}. Practice again whenever you need to.</Text>
    <Text style={s.heading}>How did it go?</Text><Text style={s.body}>Optional reflection.</Text>
    {['I feel more prepared', 'About the same', 'I would like more practice'].map(option => <Pressable key={option} accessibilityRole="button" accessibilityState={{ selected: feeling === option }} onPress={() => { setFeeling(feeling === option ? '' : option); setSaved(false); }} style={[s.option, feeling === option && s.selected]}><Text style={s.body}>{option}</Text></Pressable>)}
    <View style={s.card}><Text style={s.heading}>Conversation feedback</Text><Text style={s.body}>Get practical suggestions about how you communicated. Requesting feedback sends your conversation to the AI service again.</Text>
      {turns > 0 && <BanterButton title={busy ? 'Getting feedback…' : feedback ? 'Refresh suggestions' : 'Show feedback'} onPress={coach} disabled={busy} look="outline" />}
      {!!feedback && <>{feedback.replace(/&(?:#x20|#32|nbsp);/gi, ' ').replace(/\*+/g, '').split(/(?:^|\n|;\s*)(?=What worked:|Try next:|Example:)/i).filter(Boolean).map((part, i) => { const match = part.match(/^(What worked|Try next|Example):\s*([\s\S]*)/i); return <View key={i} style={{ backgroundColor: '#F6EEFB', padding: 14, borderRadius: 12, gap: 5 }}><Text style={{ fontWeight: '700', color: '#302539' }}>{match?.[1] || 'Suggestion'}</Text><Text style={s.body}>{match?.[2] || part}</Text></View>; })}<BanterButton title="Hide feedback" onPress={() => setFeedback('')} look="outline" /></>}
    </View>
    <BanterButton title={saved ? 'Session saved' : 'Save to My Journey'} onPress={save} disabled={saved || turns === 0} look="outline" />
    <Text style={s.body}>Saving stores your practice summary on this device, not your chat messages.</Text>{!!notice && <Text style={s.body}>{notice}</Text>}
    <BanterButton title="Practice again" onPress={() => router.replace({ pathname: '/practice', params: session })}/><BanterButton title="Back to home" onPress={() => router.replace('/')} look="outline" />
  </View></ScrollView></SafeAreaView>;
}
const s = StyleSheet.create({ screen: { flex: 1, backgroundColor: '#FFF8F4' }, page: { width: '100%', maxWidth: 650, alignSelf: 'center', padding: 24, gap: 14, paddingBottom: 48 }, eyebrow: { fontSize: 12, fontWeight: '700', letterSpacing: 2, color: '#6946A1' }, title: { fontSize: 34, fontWeight: '800', color: '#302539' }, heading: { fontSize: 20, fontWeight: '700', color: '#302539' }, body: { color: '#6B6275', fontSize: 15, lineHeight: 23 }, option: { padding: 16, backgroundColor: '#fff', borderWidth: 1, borderColor: '#D8C7E8', borderRadius: 14 }, selected: { backgroundColor: '#E8D5F6', borderColor: '#6946A1' }, card: { backgroundColor: '#fff', padding: 20, borderRadius: 20, gap: 12, borderWidth: 1, borderColor: '#EADFF0' } });
