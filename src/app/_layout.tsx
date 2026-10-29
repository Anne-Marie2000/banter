// LAYOUT
// This file controls how the app moves from screen to screen.

// "Stack" means each new screen slides in on top of the last one.
// Going back takes you to the screen underneath.

import { Stack } from "expo-router";

export default function RootLayout() {
  return <Stack screenOptions={{ headerShown: false }} />;
}
