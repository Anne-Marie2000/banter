import { TextInput } from 'react-native';
export type ChatInputProps = { value: string; onChange: (text: string) => void; onSend: () => void; disabled: boolean };
export default function ChatInput({ value, onChange, onSend, disabled }: ChatInputProps) {
  return <TextInput accessibilityLabel="Your reply" value={value} onChangeText={onChange} onSubmitEditing={onSend} submitBehavior="submit" returnKeyType="send" multiline maxLength={2000} editable={!disabled} placeholder="Type your reply..." placeholderTextColor="#72667E" style={{ flex: 1, minHeight: 54, maxHeight: 120, borderWidth: 1, borderColor: '#D8C7E8', borderRadius: 16, padding: 14, fontSize: 16, color: '#302539', backgroundColor: '#FFFFFF' }} />;
}
