import useContinue from '@/hooks/use-continue';
// SITUATION SCREEN
// The user writes what they want to practice and who they'll be talking to.

import { router, useLocalSearchParams } from "expo-router";
import { useState } from "react";
import {
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { BackButton } from "@/components/back-button";
import { BanterButton } from "@/components/banter-button";
import { colors } from "@/constants/colors";
import { scenarios } from "@/constants/scenarios";
import { sharedStyles } from "@/constants/shared-styles";

export default function SituationScreen() {
  // Get the info sent from the Home screen.
  const params = useLocalSearchParams<{ scenario?: string }>();

  // Find the scenario that was tapped (if there was one)
  const tappedScenario = scenarios.find(
    (scenario) => scenario.name === params.scenario,
  );

  // If a scenario was tapped, start the big box with its sentence. If not, start it empty.
  let startingText = "";
  if (tappedScenario) {
    startingText = tappedScenario.starterSentence;
  }

  // Remember what's typed in each box
  const [situation, setSituation] = useState(startingText);
  const [partner, setPartner] = useState(tappedScenario?.partner ?? "");

  // Check that both boxes have something in them.
  // .trim() removes spaces, so a box with only spaces counts as empty.
  const bothBoxesFilled = situation.trim() !== "" && partner.trim() !== "";

  // When "Continue" is tapped, go to the Customize screen and send what the user wrote
  function goToCustomize() {
    if (!bothBoxesFilled) return;
    router.push({
      pathname: "/customize",
      params: { situation: situation.trim(), partner: partner.trim() },
    });
  }

  useContinue(goToCustomize, bothBoxesFilled);

  return (
    <SafeAreaView style={sharedStyles.screen}>
      {/* Moves the screen up when the keyboard opens */}
      <KeyboardAvoidingView
        style={sharedStyles.screen}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        <ScrollView
          contentContainerStyle={sharedStyles.page}
          keyboardShouldPersistTaps="handled"
        >
          <BackButton />

          <Text style={sharedStyles.stepText}>Step 1 of 2</Text>
          <Text style={sharedStyles.title}>What is your situation?</Text>
          <Text style={sharedStyles.helperText}>
            Describe the conversation you want to practice.
          </Text>

          {/* The big box */}
          <Text style={sharedStyles.label}>The situation</Text>
          <TextInput
            style={[styles.textBox, styles.bigTextBox]}
            value={situation}
            onChangeText={setSituation} // save what's typed
            placeholder="e.g. I have a job interview tomorrow and I'm nervous about answering questions..."
            placeholderTextColor={colors.grey}
            multiline // allow more than one line
            textAlignVertical="top"
          />

          {/* The small box */}
          <Text style={sharedStyles.label}>Who will you be speaking with?</Text>
          <TextInput
            style={styles.textBox}
            value={partner}
            onChangeText={setPartner}
            onSubmitEditing={() => { if (bothBoxesFilled) goToCustomize(); }}
            returnKeyType="go" // save what's typed
            placeholder="e.g. Manager, friend, teacher"
            placeholderTextColor={colors.grey}
          />

          {/* The button only works when both boxes are filled in */}
          <BanterButton
            title="Continue →"
            onPress={goToCustomize}
            disabled={!bothBoxesFilled}
          />
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  textBox: {
    marginBottom: 24,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 16,
    color: colors.charcoal,
    backgroundColor: colors.white,
    borderWidth: 2,
    borderColor: colors.lavender,
    borderRadius: 14,
  },
  bigTextBox: {
    minHeight: 140, // make the first box taller
  },
});
