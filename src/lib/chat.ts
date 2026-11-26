import type { Message } from '@/constants/message';

export type Session = { situation: string; partner: string; difficulty: string; mode: string; personality?: string };

let finished: Message[] = [];
export function finishConversation(messages: Message[]) { finished = [...messages]; }
export function lastConversation() { return finished; }

export async function getReply(session: Session, messages: Message[], coaching = false) {
  const res = await fetch('/api/chat', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ ...session, coaching, messages: messages.map(m => ({ role: m.from === 'ai' ? 'assistant' : 'user', content: m.text })) }),
  });
  const data = await res.json();
  if (!res.ok || typeof data.reply !== 'string') throw new Error(data.error || 'Could not get a reply.');
  return (data.reply as string)
    .replace(/&amp;/gi, '&')
    .replace(/&(?:#x20|#32|nbsp|#160);/gi, ' ')
    .replace(/[\u00a0\u200b]/g, ' ')
    .trim();
}
