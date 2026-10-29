// HOME SCREEN

import { router } from "expo-router";
import { Image, Pressable, ScrollView, StyleSheet, Text } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { BanterButton } from "@/components/banter-button";
import { colors } from "@/constants/colors";
import { scenarios } from "@/constants/scenarios";
import { sharedStyles } from "@/constants/shared-styles";

export default function HomeScreen() {
  // When "Start Practicing" is tapped, go to the Situation screen
  function startPracticing() {
    router.push("/situation");
  }

  // When a scenario is tapped, go to the Situation screen
  // and send the scenario's name along with it
  function pickScenario(name: string) {
    router.push({ pathname: "/situation", params: { scenario: name } });
  }

  return (
    // SafeAreaView keeps things away from the top and bottom edges of the phone
    <SafeAreaView style={sharedStyles.screen}>
      {/* ScrollView lets the screen scroll if it doesn't fit */}
      <ScrollView contentContainerStyle={styles.page}>
        {/* The logo (saved in assets/images) */}
        <Image
          source={require("../../assets/images/banter-logo.png")}
          style={styles.logo}
          resizeMode="contain"
          accessibilityLabel="Banter logo"
        />

        <Text style={styles.headline}>
          Practice the conversation before it happens.
        </Text>
        <Text style={styles.subtitle}>Your AI conversation coach</Text>

        <BanterButton title="Start Practicing" onPress={startPracticing} />

        <Text style={[sharedStyles.sectionTitle, styles.scenarioHeading]}>
          Example Scenarios
        </Text>

        {/* Make one button for each scenario in constants/scenarios.ts */}
        {scenarios.map((scenario) => (
          <Pressable
            key={scenario.name}
            onPress={() => pickScenario(scenario.name)}
            style={styles.scenarioButton}
            accessibilityRole="button"
          >
            <Text style={styles.scenarioText}>{scenario.name}</Text>
            <Text style={styles.arrow}>›</Text>
          </Pressable>
        ))}
      </ScrollView>
    </SafeAreaView>
  );
}

// Styles only used on this screen
const styles = StyleSheet.create({
  page: {
    alignItems: "center", // centre everything
    paddingHorizontal: 24,
    paddingTop: 24,
    paddingBottom: 48,
  },
  logo: {
    width: 170,
    height: 200,
    marginBottom: 24,
  },
  headline: {
    marginBottom: 8,
    fontSize: 24,
    fontWeight: "800",
    color: colors.purple,
    textAlign: "center",
  },
  subtitle: {
    marginBottom: 28,
    fontSize: 16,
    color: colors.charcoal,
    textAlign: "center",
  },
  scenarioHeading: {
    alignSelf: "flex-start",
    marginTop: 36,
  },
  scenarioButton: {
    alignSelf: "stretch",
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 10,
    paddingVertical: 16,
    paddingHorizontal: 18,
    backgroundColor: colors.white,
    borderWidth: 2,
    borderColor: colors.lavender,
    borderRadius: 14,
  },
  scenarioText: {
    fontSize: 16,
    fontWeight: "600",
    color: colors.charcoal,
  },
  arrow: {
    fontSize: 24,
    color: colors.purple,
  },
});
