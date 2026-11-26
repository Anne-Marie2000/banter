import { Platform } from 'react-native';
export const difficulties = [
  { name: 'Easy', description: 'Friendly and straightforward' },
  { name: 'Medium', description: 'Natural questions and follow-ups' },
  { name: 'Hard', description: 'Realistic challenges and tougher questions' },
];
export const modes = [
  { name: 'Text', description: 'Type your answers' },
  ...(Platform.OS === 'web' ? [{ name: 'Voice', description: 'Use your browser microphone or type' }] : []),
];
