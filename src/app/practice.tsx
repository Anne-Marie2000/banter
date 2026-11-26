import { router, useLocalSearchParams } from 'expo-router';
import { useEffect, useRef, useState } from 'react';
import { KeyboardAvoidingView, Platform, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import ChatInput from '@/components/chat-input';
import VoiceControls from '@/components/voice-controls';
import { getReply, finishConversation, type Session } from '@/lib/chat';
import type { Message } from '@/constants/message';

export default function PracticeScreen() {
  const params = useLocalSearchParams<Partial<Session>>();
  const session = { situation: params.situation || '', partner: params.partner || 'Conversation partner', difficulty: params.difficulty || 'Medium', mode: params.mode || 'Text', personality: params.personality || 'Natural' };
  const [messages, setMessages] = useState<Message[]>([]);
  const [draft, setDraft] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [hint, setHint] = useState(false);
  const locked = useRef(false);
  const active = useRef(true);
  const started = useRef(false);
  const scroll = useRef<import("react").ComponentRef<typeof ScrollView>>(null);
  const name = session.partner.charAt(0).toUpperCase() + session.partner.slice(1);

  async function reply(history: Message[]) {
    if (locked.current) return;
    locked.current = true; setBusy(true); setError('');
    try {
      const text = await getReply(session, history);
      if (active.current) setMessages([...history, { from: 'ai', text }]);
    } catch (e) { if (active.current) setError(e instanceof Error ? e.message : 'Could not get a reply.'); }
    finally { locked.current = false; if (active.current) setBusy(false); }
  }
  useEffect(() => {
    active.current = true;
    const timer = setTimeout(() => { if (!started.current) { started.current = true; void reply([]); } }, 0);
    return () => { active.current = false; clearTimeout(timer); };
    // Start once for this session.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  function send() {
    const text = draft.trim();
    if (!text || locked.current || error) return;
    const next: Message[] = [...messages, { from: 'user', text }];
    setMessages(next); setDraft(''); setHint(false); void reply(next);
  }
  function end() {
    finishConversation(messages);
    router.replace({ pathname: '/results', params: session });
  }
  return <SafeAreaView style={s.screen}><KeyboardAvoidingView style={{ flex: 1, width: '100%', maxWidth: 1000, alignSelf: 'center', marginHorizontal: 'auto' }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
    <View style={s.header}><View style={s.top}><Pressable onPress={() => router.canGoBack() ? router.back() : router.replace('/')} accessibilityRole="button"><Text style={s.link}>‹ Back</Text></Pressable><Pressable accessibilityRole="button" onPress={end} style={s.end}><Text style={s.white}>End session</Text></Pressable></View>
    <Text style={s.title}>{name}</Text><Text style={s.subtitle}>{session.difficulty} · Practice session</Text></View>
    <ScrollView ref={scroll} style={{ flex: 1 }} contentContainerStyle={s.chat} keyboardShouldPersistTaps="handled" onContentSizeChange={() => scroll.current?.scrollToEnd({ animated: true })}>
      {messages.map((m, i) => <View key={i} style={[s.bubble, m.from === 'user' ? s.mine : s.theirs]}><Text style={s.label}>{m.from === 'user' ? 'You' : name}</Text><Text style={s.message}>{m.text}</Text></View>)}
      {busy && <Text accessibilityLiveRegion="polite" style={s.subtitle}>{name} is typing…</Text>}
      {!!error && <View style={s.error}><Text>{error}</Text><Pressable accessibilityRole="button" onPress={() => void reply(messages)}><Text style={s.link}>Try again</Text></Pressable></View>}
    </ScrollView>
    <View style={s.footer}>
      <Pressable accessibilityRole="button" onPress={() => setHint(!hint)}><Text style={s.link}>{hint ? 'Hide hint' : 'Need a starting point?'}</Text></Pressable>
      {hint && <Text style={s.subtitle}>Try answering the last question in your own words, or ask for clarification if you are unsure.</Text>}
      {session.mode === 'Voice' && <VoiceControls onText={setDraft} reply={[...messages].reverse().find(m => m.from === 'ai')?.text || ''} disabled={busy} />}
      <View style={s.top}><ChatInput value={draft} onChange={setDraft} onSend={send} disabled={busy || !!error}/><Pressable accessibilityRole="button" disabled={busy || !!error || !draft.trim()} onPress={send} style={[s.send, (busy || !!error || !draft.trim()) && { opacity: .45 }]}><Text style={s.white}>Send</Text></Pressable></View>
      {Platform.OS === 'web' && <Text style={s.small}>Enter to send · Shift + Enter for a new line</Text>}
    </View>
  </KeyboardAvoidingView></SafeAreaView>;
}
const s = StyleSheet.create({
  screen: { flex: 1, backgroundColor: '#FFF8F4', width: '100%', alignItems: 'center', alignSelf: 'stretch' },
  header: { padding: 20, borderBottomWidth: 1, borderColor: '#EADFF0', gap: 8 }, top: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 12 },
  link: { color: '#6946A1', fontWeight: '700', fontSize: 14 }, end: { backgroundColor: '#302539', borderRadius: 20, padding: 12 }, white: { color: '#fff', fontWeight: '700' },
  title: { fontSize: 29, fontWeight: '800', color: '#302539' }, subtitle: { color: '#6B6275', fontSize: 14, lineHeight: 20 },
  chat: { padding: 16, gap: 10 }, bubble: { maxWidth: '86%', borderRadius: 18, padding: 12, gap: 4 }, mine: { alignSelf: 'flex-end', backgroundColor: '#E8D5F6' }, theirs: { alignSelf: 'flex-start', backgroundColor: '#fff', borderWidth: 1, borderColor: '#EADFF0' },
  label: { color: '#6946A1', fontSize: 12, fontWeight: '700' }, message: { color: '#302539', fontSize: 16, lineHeight: 24 },
  footer: { padding: 16, gap: 10, borderTopWidth: 1, borderColor: '#EADFF0' }, send: { backgroundColor: '#6946A1', paddingHorizontal: 20, paddingVertical: 17, borderRadius: 16 }, small: { fontSize: 12, color: '#6B6275' }, error: { backgroundColor: '#FFE8DD', padding: 14, borderRadius: 12, gap: 8 },
});
