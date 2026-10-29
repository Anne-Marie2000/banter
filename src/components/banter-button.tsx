// BANTER BUTTON
// The main button used on every screen, so they all look the same.

import { colors } from "@/constants/colors";
import { Pressable, StyleSheet, Text } from "react-native";

type BanterButtonProps = {
  title: string;
  onPress: () => void;
  look?: "filled" | "outline";
  disabled?: boolean;
};

export function BanterButton({
  title,
  onPress,
  look = "filled",
  disabled = false,
}: BanterButtonProps) {
  const buttonStyle =
    look === "outline" ? styles.outlineButton : styles.filledButton;
  const textStyle = look === "outline" ? styles.outlineText : styles.filledText;

  return (
    <Pressable
      onPress={onPress}
      disabled={disabled}
      accessibilityRole="button"
      // Fade the button while it's being pressed, or if it's disabled
      style={({ pressed }) => [
        buttonStyle,
        pressed && styles.pressed,
        disabled && styles.disabled,
      ]}
    >
      <Text style={textStyle}>{title}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  // Peach button
  filledButton: {
    alignSelf: "stretch",
    alignItems: "center",
    paddingVertical: 16,
    borderRadius: 16,
    backgroundColor: colors.peach,
  },
  filledText: {
    fontSize: 18,
    fontWeight: "800",
    color: colors.charcoal,
  },

  // Button with a purple border
  outlineButton: {
    alignSelf: "stretch",
    alignItems: "center",
    paddingVertical: 14,
    borderRadius: 16,
    borderWidth: 2,
    borderColor: colors.purple,
  },
  outlineText: {
    fontSize: 17,
    fontWeight: "800",
    color: colors.purple,
  },

  // Faded looks
  pressed: {
    opacity: 0.7,
  },
  disabled: {
    opacity: 0.4,
  },
});
