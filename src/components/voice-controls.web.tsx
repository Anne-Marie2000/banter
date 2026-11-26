import { useEffect, useRef, useState } from 'react';
import { Pressable, Text, View } from 'react-native';
import type { VoiceProps } from './voice-controls';
type Recognition = { start: () => void; abort: () => void; lang: string; onresult: ((event: { results: ArrayLike<ArrayLike<{ transcript: string }>> }) => void) | null; onend: (() => void) | null; onerror: (() => void) | null };
export default function VoiceControls({ onText, reply, disabled }: VoiceProps) {
  const [listening, setListening] = useState(false);
  const [notice, setNotice] = useState('');
  const recognition = useRef<Recognition | null>(null);
  useEffect(() => () => { recognition.current?.abort(); window.speechSynthesis?.cancel(); }, []);
  function listen() {
    const browser = window as unknown as { SpeechRecognition?: new () => Recognition; webkitSpeechRecognition?: new () => Recognition };
    const SpeechRecognition = browser.SpeechRecognition || browser.webkitSpeechRecognition;
    if (!SpeechRecognition) { setNotice('Voice input is not available in this browser. You can still type.'); return; }
    try {
      const mic = new SpeechRecognition(); recognition.current = mic;
      mic.lang = 'en-US';
      mic.onresult = e => onText(e.results[0][0].transcript);
      mic.onend = () => setListening(false);
      mic.onerror = () => { setListening(false); setNotice('Could not use the microphone. Check permissions or type instead.'); };
      setNotice(''); setListening(true); mic.start();
    } catch { setListening(false); setNotice('Microphone unavailable.'); }
  }
  return <View style={{ gap: 8 }}><View style={{ flexDirection: 'row', gap: 16 }}>
    <Pressable accessibilityRole="button" disabled={disabled} onPress={() => listening ? recognition.current?.abort() : listen()}><Text style={{ color: '#6946A1', fontWeight: '700' }}>{listening ? 'Stop listening' : 'Use microphone'}</Text></Pressable>
    <Pressable accessibilityRole="button" disabled={!reply} onPress={() => { if (!window.speechSynthesis) { setNotice('Read aloud is unavailable.'); return; } window.speechSynthesis.cancel(); window.speechSynthesis.speak(new SpeechSynthesisUtterance(reply)); }}><Text style={{ color: '#6946A1', fontWeight: '700' }}>Read last reply aloud</Text></Pressable>
  </View><Text style={{ fontSize: 12, color: '#6B6275' }}>{notice || 'Voice input uses your browser’s speech service. Review your words before sending.'}</Text></View>;
}
