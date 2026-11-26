import type { Message } from '@/constants/message';
import AsyncStorage from '@react-native-async-storage/async-storage';
const key = 'banter.practice.history.v1';
export type HistoryItem = { id: string; partner: string; difficulty: string; date: string; turns: number; feeling: string; situation?: string; personality?: string; mode?: string; messages?: Message[]; feedback?: string };
export async function readHistory(): Promise<HistoryItem[]> {
  const data = await AsyncStorage.getItem(key);
  if (!data) return [];
  const items = JSON.parse(data);
  return Array.isArray(items) ? items : [];
}
export async function saveHistory(item: HistoryItem) {
  const items = await readHistory();
  await AsyncStorage.setItem(key, JSON.stringify([item, ...items.filter(i => i.id !== item.id)].slice(0, 100)));
}
export async function clearHistory() { await AsyncStorage.removeItem(key); }

export async function deleteHistory(id: string) {
  const items = await readHistory();
  await AsyncStorage.setItem(key, JSON.stringify(items.filter(item => item.id !== id)));
}
