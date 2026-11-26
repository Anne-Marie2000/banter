import { router, useFocusEffect } from 'expo-router';
import { useCallback, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { BanterButton } from '@/components/banter-button';
import { readHistory, clearHistory, deleteHistory, type HistoryItem } from '@/lib/history';

export default function JourneyScreen() {
  const [items, setItems] = useState<HistoryItem[]>([]);
  const [selected, setSelected] = useState<HistoryItem | null>(null);
  const [notice, setNotice] = useState('');
  const [confirm, setConfirm] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [busy, setBusy] = useState(false);

  useFocusEffect(useCallback(() => {
    let active = true;
    readHistory().then(data => {
      if (active) setItems(data);
    }).catch(() => {
      if (active) setNotice('Could not load history.');
    });
    return () => { active = false; };
  }, []));

  async function remove(id: string) {
    setBusy(true);
    try {
      await deleteHistory(id);
      setItems(old => old.filter(item => item.id !== id));
      setSelected(null);
      setConfirmDelete(false);
      setNotice('Session deleted.');
    } catch {
      setNotice('Could not delete this session.');
    } finally {
      setBusy(false);
    }
  }

  async function clear() {
    setBusy(true);
    try {
      await clearHistory();
      setItems([]);
      setConfirm(false);
      setNotice('History cleared.');
    } catch {
      setNotice('Could not clear history.');
    } finally {
      setBusy(false);
    }
  }

  return (
    <SafeAreaView style={s.screen}>
      <ScrollView contentContainerStyle={s.container}>
        <View style={s.page}>
          <BanterButton
            title={selected ? 'Back to My Journey' : 'Back to home'}
            onPress={() => {
              if (selected) {
                setSelected(null);
                setConfirmDelete(false);
                setNotice('');
              } else router.replace('/');
            }}
            look="outline"
          />

          <Text style={s.title}>{selected ? selected.partner : 'My Journey'}</Text>

          {selected ? <>
            <Text style={s.body}>
              {new Date(selected.date).toLocaleDateString()} · {selected.difficulty} · {selected.turns} replies
            </Text>

            {!!selected.situation && <View style={s.card}>
              <Text style={s.heading}>Practice situation</Text>
              <Text style={s.body}>{selected.situation}</Text>
              <Text style={s.body}>Personality: {selected.personality || 'Natural'}</Text>
            </View>}

            <Text style={s.heading}>Conversation</Text>

            {selected.messages?.length ? selected.messages.map((message, index) => (
              <View key={index} style={[s.bubble, message.from === 'user' ? s.mine : s.theirs]}>
                <Text style={s.label}>{message.from === 'user' ? 'You' : selected.partner}</Text>
                <Text style={s.message}>{message.text}</Text>
              </View>
            )) : <Text style={s.body}>
              This older session contains a summary only. Its conversation was not saved.
            </Text>}

            <View style={s.card}>
              <Text style={s.heading}>Conversation feedback</Text>
              <Text style={s.body}>{selected.feedback || 'No feedback was saved.'}</Text>
            </View>

            {!!selected.feeling && <View style={s.card}>
              <Text style={s.heading}>Your reflection</Text>
              <Text style={s.body}>{selected.feeling}</Text>
            </View>}

            {!!selected.situation && <BanterButton
              title="Practice again"
              onPress={() => router.push({
                pathname: '/practice',
                params: {
                  situation: selected.situation || '',
                  partner: selected.partner,
                  difficulty: selected.difficulty,
                  personality: selected.personality || 'Natural',
                  mode: selected.mode || 'Text',
                },
              })}
            />}

            <BanterButton
              title={confirmDelete ? 'Confirm delete session' : 'Delete session'}
              disabled={busy}
              onPress={() => confirmDelete ? void remove(selected.id) : setConfirmDelete(true)}
              look="outline"
            />

            {confirmDelete && <BanterButton title="Cancel" onPress={() => setConfirmDelete(false)} look="outline" />}
          </> : <>
            <Text style={s.body}>Review your previous conversations and feedback.</Text>
            <Text style={s.heading}>{items.length} saved {items.length === 1 ? 'session' : 'sessions'}</Text>

            {items.length === 0 && <Text style={s.body}>Your saved sessions will appear here.</Text>}

            {items.map(item => (
              <Pressable
                key={item.id}
                accessibilityRole="button"
                onPress={() => {
                  setSelected(item);
                  setNotice('');
                  setConfirm(false);
                }}
                style={s.card}
              >
                <Text style={s.heading}>{item.partner} ›</Text>
                <Text style={s.body}>{new Date(item.date).toLocaleDateString()} · {item.difficulty} · {item.turns} replies</Text>
                <Text style={s.label}>Open session</Text>
              </Pressable>
            ))}

            {items.length > 0 && <BanterButton
              title={confirm ? 'Confirm clear history' : 'Clear history'}
              disabled={busy}
              onPress={() => confirm ? void clear() : setConfirm(true)}
              look="outline"
            />}

            {confirm && <BanterButton title="Cancel" onPress={() => setConfirm(false)} look="outline" />}
          </>}

          {!!notice && <Text style={s.body}>{notice}</Text>}
          <Text style={s.body}>Saved sessions are stored locally on this device.</Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  screen: { flex: 1, backgroundColor: '#FFF8F4' },
  container: { alignItems: 'center' },
  page: { width: '100%', maxWidth: 700, padding: 24, paddingBottom: 48, gap: 16 },
  title: { fontSize: 34, fontWeight: '800', color: '#302539' },
  heading: { fontSize: 18, fontWeight: '700', color: '#302539' },
  body: { fontSize: 15, lineHeight: 23, color: '#6B6275' },
  card: { backgroundColor: '#fff', padding: 18, borderRadius: 16, gap: 8 },
  bubble: { maxWidth: '90%', borderRadius: 16, padding: 14, gap: 6 },
  mine: { alignSelf: 'flex-end', backgroundColor: '#E8D5F6' },
  theirs: { alignSelf: 'flex-start', backgroundColor: '#fff' },
  label: { fontSize: 13, fontWeight: '700', color: '#6946A1' },
  message: { fontSize: 15, lineHeight: 23, color: '#302539' },
});
