// BACK BUTTON
// The "Back" button. It goes back to the last screen.

import { router } from "expo-router";
import { Pressable, StyleSheet, Text } from "react-native";

import { colors } from "@/constants/colors";

export function BackButton() {
  return (
    <Pressable
      // go back to the last screen
      onPress={() => router.back()}
      style={styles.button}
      accessibilityRole="button"
      accessibilityLabel="Go back"
    >
      <Text style={styles.text}>‹ Back</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    alignSelf: "flex-start",
    paddingVertical: 10,
    paddingRight: 16,
  },
  text: {
    fontSize: 17,
    fontWeight: "700",
    color: colors.purple,
  },
});
