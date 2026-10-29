// SHARED STYLES
// Styles used on more than one screen.

import { StyleSheet } from "react-native";

import { colors } from "@/constants/colors";

export const sharedStyles = StyleSheet.create({
  // The whole screen, with the background colour
  screen: {
    flex: 1,
    backgroundColor: colors.offWhite,
  },

  // The space around everything on a screen
  page: {
    paddingHorizontal: 24,
    paddingTop: 8,
    paddingBottom: 48,
  },

  // Small grey text, like "Step 1 of 2"
  stepText: {
    marginTop: 12,
    marginBottom: 6,
    fontSize: 14,
    fontWeight: "700",
    color: colors.grey,
  },

  // The big purple title at the top of a screen
  title: {
    marginBottom: 6,
    fontSize: 28,
    fontWeight: "800",
    color: colors.purple,
  },

  // The normal text under a title
  helperText: {
    marginBottom: 24,
    fontSize: 16,
    color: colors.charcoal,
  },

  // A heading for a part of the screen, like "Feedback"
  sectionTitle: {
    marginTop: 12,
    marginBottom: 12,
    fontSize: 18,
    fontWeight: "800",
    color: colors.charcoal,
  },

  // Bold text above a text box
  label: {
    marginBottom: 8,
    fontSize: 16,
    fontWeight: "700",
    color: colors.charcoal,
  },

  // A white box with a lavender border
  card: {
    marginBottom: 24,
    padding: 16,
    backgroundColor: colors.white,
    borderWidth: 2,
    borderColor: colors.lavender,
    borderRadius: 14,
  },
});
