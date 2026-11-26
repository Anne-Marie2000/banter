import type { ChatInputProps } from './chat-input';
export default function ChatInput({ value, onChange, onSend, disabled }: ChatInputProps) {
  return <textarea aria-label="Your reply" value={value} onChange={e => onChange(e.target.value)} disabled={disabled} maxLength={2000} rows={2} placeholder="Type your reply..." onKeyDown={e => {
    if (e.key === 'Enter' && !e.shiftKey && !e.nativeEvent.isComposing) { e.preventDefault(); onSend(); }
  }} style={{ flex: 1, minWidth: 0, resize: 'none', border: '1px solid #D8C7E8', borderRadius: 16, padding: 14, fontSize: 16, fontFamily: 'system-ui, sans-serif', color: '#302539', background: '#fff' }} />;
}
