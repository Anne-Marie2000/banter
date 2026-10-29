// CUSTOMIZE SCREEN (step 2 of 2)
// The user picks how hard the conversation is (Easy, Medium or Hard) and how they want to answer (Text or Voice).

import { router, useLocalSearchParams } from "expo-router";
import { useState } from "react";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { BackButton } from "@/components/back-button";
import { BanterButton } from "@/components/banter-button";
import { colors } from "@/constants/colors";
import { difficulties, modes } from "@/constants/practice-options";
import { sharedStyles } from "@/constants/shared-styles";

export default function CustomizeScreen() {
  // Get what the user wrote on the Situation screen
  const params = useLocalSearchParams<{
    situation?: string;
    partner?: string;
  }>();

  // Remember which options are picked.

  const [difficulty, setDifficulty] = useState("Medium");
  const [mode, setMode] = useState("Text");

  // When "Start Simulation" is tapped, go to the chat and send all the choices.

  function startSimulation() {
    router.push({
      pathname: "/practice",
      params: {
        situation: params.situation ?? "",
        partner: params.partner ?? "",
        difficulty: difficulty,
        mode: mode,
      },
    });
  }

  return (
    <SafeAreaView style={sharedStyles.screen}>
      <ScrollView contentContainerStyle={sharedStyles.page}>
        <BackButton />

        <Text style={sharedStyles.stepText}>Step 2 of 2</Text>
        <Text style={sharedStyles.title}>Customize your practice</Text>
        <Text style={sharedStyles.helperText}>
          Choose how you want your conversation to go.
        </Text>

        {/* Show what they wrote on the last screen */}
        <View style={sharedStyles.card}>
          <Text style={styles.summaryLabel}>Your situation</Text>
          <Text style={styles.summaryText}>{params.situation}</Text>

          <Text style={[styles.summaryLabel, styles.spaceAbove]}>
            Speaking with
          </Text>
          <Text style={styles.summaryText}>{params.partner}</Text>
        </View>

        {/* Difficulty: one card for each choice */}
        <Text style={sharedStyles.sectionTitle}>Conversation difficulty</Text>
        {difficulties.map((option) => (
          <OptionCard
            key={option.name}
            title={option.name}
            description={option.description}
            picked={difficulty === option.name}
            onPress={() => setDifficulty(option.name)}
          />
        ))}

        {/* Mode: two cards side by side */}
        <Text style={[sharedStyles.sectionTitle, styles.spaceAbove]}>
          Practice mode
        </Text>
        <View style={styles.sideBySide}>
          {modes.map((option) => (
            <View key={option.name} style={styles.halfWidth}>
              <OptionCard
                title={option.name}
                description={option.description}
                picked={mode === option.name}
                onPress={() => setMode(option.name)}
              />
            </View>
          ))}
        </View>

        <BanterButton title="Start Simulation →" onPress={startSimulation} />
      </ScrollView>
    </SafeAreaView>
  );
}

// The picked one gets a ✓, a purple border and a light purple background.

type OptionCardProps = {
  title: string;
  description: string;
  picked: boolean;
  onPress: () => void;
};

function OptionCard({ title, description, picked, onPress }: OptionCardProps) {
  return (
    <Pressable
      onPress={onPress}
      style={[styles.optionCard, picked && styles.pickedCard]}
      accessibilityRole="radio"
      accessibilityState={{ selected: picked }}
    >
      <Text style={styles.optionTitle}>
        {picked && "✓ "}
        {title}
      </Text>
      <Text style={styles.optionDescription}>{description}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  spaceAbove: {
    marginTop: 16,
  },

  // The summary card
  summaryLabel: {
    marginBottom: 4,
    fontSize: 13,
    fontWeight: "700",
    color: colors.grey,
    textTransform: "uppercase",
  },
  summaryText: {
    fontSize: 16,
    color: colors.charcoal,
  },

  // The option cards
  optionCard: {
    marginBottom: 10,
    paddingVertical: 14,
    paddingHorizontal: 16,
    backgroundColor: colors.white,
    borderWidth: 2,
    borderColor: colors.lavender,
    borderRadius: 14,
  },
  pickedCard: {
    backgroundColor: colors.paleLavender,
    borderColor: colors.purple,
  },
  optionTitle: {
    fontSize: 16,
    fontWeight: "800",
    color: colors.charcoal,
  },
  optionDescription: {
    marginTop: 2,
    fontSize: 14,
    color: colors.grey,
  },

  // Text and Voice
  sideBySide: {
    flexDirection: "row",
    gap: 10,
    marginBottom: 24,
  },
  halfWidth: {
    flex: 1,
  },
});
