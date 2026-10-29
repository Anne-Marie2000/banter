// RESULTS SCREEN
// Shows how the user did: an overall score, a score for each skill, and tips for next time.

import { router, useLocalSearchParams } from "expo-router";
import { ScrollView, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { BanterButton } from "@/components/banter-button";
import { colors } from "@/constants/colors";
import { sharedStyles } from "@/constants/shared-styles";

// Words that make someone sound less sure of themselves
const fillerWords = [
  "um",
  "uh",
  "maybe",
  "i guess",
  "sorry",
  "kind of",
  "sort of",
];

// What one tip looks like
type Tip = {
  good: boolean;
  text: string;
};

// Makes sure a score is a whole number from 0 to 100
function fixScore(score: number) {
  if (score < 0) return 0;
  if (score > 100) return 100;
  return Math.round(score);
}

// Score the chat
// Looks at what the user wrote and works out their scores and tips.
function scoreChat(userMessages: string[]) {
  const messageCount = userMessages.length;

  // Count the words in all their messages
  let totalWords = 0;
  for (const message of userMessages) {
    const words = message.trim().split(" ");
    totalWords = totalWords + words.length;
  }

  // Work out the average number of words per message
  let averageWords = 0;
  if (messageCount > 0) {
    averageWords = totalWords / messageCount;
  }

  // Count the questions they asked (messages with a "?")
  let questionCount = 0;
  for (const message of userMessages) {
    if (message.includes("?")) {
      questionCount = questionCount + 1;
    }
  }

  // Count the filler words they used
  const allText = userMessages.join(" ").toLowerCase();
  let fillerCount = 0;
  for (const word of fillerWords) {
    // \b means "whole word only", so "um" doesn't count inside "umbrella"
    const found = allText.match(new RegExp(`\\b${word}\\b`, "g"));
    if (found) {
      fillerCount = fillerCount + found.length;
    }
  }

  // 4. Turn the counts into scores out of 100

  // Detail: longer answers score higher
  const detail = fixScore(40 + averageWords * 4);

  // Clarity: answers that aren't too short or too long score higher
  let clarity = 88;
  if (averageWords < 6) clarity = 60;
  if (averageWords > 40) clarity = 70;

  // Engagement: asking questions and sending more messages score higher
  const engagement = fixScore(
    55 + questionCount * 15 + Math.min(messageCount, 5) * 4,
  );

  // Confidence: fewer filler words score higher
  const confidence = fixScore(92 - fillerCount * 10);

  // Overall: the average of the four scores
  const overall = fixScore((detail + clarity + engagement + confidence) / 4);

  // 5. Write a tip for each thing we checked
  const tips: Tip[] = [];

  if (averageWords >= 8) {
    tips.push({ good: true, text: "You gave detailed answers." });
  } else {
    tips.push({
      good: false,
      text: "Try giving longer answers with a specific example.",
    });
  }

  if (questionCount > 0) {
    tips.push({
      good: true,
      text: "You asked questions to keep the conversation going.",
    });
  } else {
    tips.push({ good: false, text: "Try asking a follow-up question back." });
  }

  if (fillerCount === 0) {
    tips.push({ good: true, text: "You sounded confident and direct." });
  } else {
    tips.push({
      good: false,
      text: `Try cutting filler words like "um" or "maybe". You used ${fillerCount}.`,
    });
  }

  return {
    overall: overall,
    skills: [
      { name: "Confidence", score: confidence },
      { name: "Clarity", score: clarity },
      { name: "Detail", score: detail },
      { name: "Engagement", score: engagement },
    ],
    tips: tips,
  };
}

export default function ResultsScreen() {
  // Get the info sent from the chat
  const params = useLocalSearchParams<{
    transcript?: string;
    situation?: string;
    partner?: string;
    difficulty?: string;
    mode?: string;
  }>();

  // Turn the messages from text back into a list.
  // try/catch means: if this fails, use an empty list instead of crashing.
  let userMessages: string[] = [];
  try {
    userMessages = JSON.parse(params.transcript ?? "[]");
  } catch {
    userMessages = [];
  }

  const results = scoreChat(userMessages);

  // Start a new chat with the same choices
  function retry() {
    router.replace({
      pathname: "/practice",
      params: {
        situation: params.situation ?? "",
        partner: params.partner ?? "",
        difficulty: params.difficulty ?? "Medium",
        mode: params.mode ?? "Text",
      },
    });
  }

  // Go back to the Home screen
  function goHome() {
    router.dismissAll();
  }

  return (
    <SafeAreaView style={sharedStyles.screen}>
      <ScrollView contentContainerStyle={sharedStyles.page}>
        <Text style={[sharedStyles.title, styles.spaceAbove]}>
          Your Results
        </Text>
        <Text style={sharedStyles.helperText}>
          {params.partner} · {params.difficulty}
        </Text>

        {/* The big overall score */}
        <View style={styles.scoreCard}>
          <Text style={styles.scoreNumber}>
            {results.overall}
            <Text style={styles.scoreOutOf}>/100</Text>
          </Text>
          <Text style={styles.scoreLabel}>Overall Performance</Text>
        </View>

        {/* A bar for each skill */}
        <Text style={sharedStyles.sectionTitle}>Performance Breakdown</Text>
        <View style={[sharedStyles.card, styles.cardGaps]}>
          {results.skills.map((skill) => (
            <SkillBar key={skill.name} name={skill.name} score={skill.score} />
          ))}
        </View>

        {/* The tips */}
        <Text style={sharedStyles.sectionTitle}>Feedback</Text>
        <View style={[sharedStyles.card, styles.cardGaps]}>
          {results.tips.map((tip) => (
            <TipRow key={tip.text} tip={tip} />
          ))}
        </View>

        <Text style={styles.note}>
          Early version: scores are estimated from your answers. Smarter AI
          feedback is coming soon.
        </Text>

        <View style={styles.buttons}>
          <BanterButton title="Retry & Beat Your Score" onPress={retry} />
          <BanterButton title="Back to Home" onPress={goHome} look="outline" />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

// Skill bar
// Shows a skill's name, its score, and a bar that fills up to match.
function SkillBar({ name, score }: { name: string; score: number }) {
  return (
    <View style={styles.skillRow}>
      <View style={styles.skillTop}>
        <Text style={styles.skillText}>{name}</Text>
        <Text style={styles.skillText}>{score}/100</Text>
      </View>
      <View style={styles.barBackground}>
        {/* The bar is as wide as the score, like "80%" */}
        <View style={[styles.barFill, { width: `${score}%` }]} />
      </View>
    </View>
  );
}

// Tip row
// One tip, with a ✓ (did well) or a ! (work on this).
function TipRow({ tip }: { tip: Tip }) {
  return (
    <View style={styles.tipRow}>
      <Text
        style={[styles.tipIcon, tip.good ? styles.goodIcon : styles.workOnIcon]}
      >
        {tip.good ? "✓" : "!"}
      </Text>
      <Text style={styles.tipText}>{tip.text}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  spaceAbove: {
    marginTop: 12,
  },
  cardGaps: {
    gap: 16,
  },

  // The big score
  scoreCard: {
    alignItems: "center",
    marginBottom: 24,
    paddingVertical: 28,
    backgroundColor: colors.purple,
    borderRadius: 20,
  },
  scoreNumber: {
    fontSize: 56,
    fontWeight: "900",
    color: colors.white,
  },
  scoreOutOf: {
    fontSize: 24,
    fontWeight: "700",
    color: colors.lavender,
  },
  scoreLabel: {
    marginTop: 4,
    fontSize: 16,
    fontWeight: "700",
    color: colors.white,
  },

  // Skill bars
  skillRow: {
    gap: 6,
  },
  skillTop: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  skillText: {
    fontSize: 15,
    fontWeight: "700",
    color: colors.charcoal,
  },
  barBackground: {
    height: 10,
    overflow: "hidden",
    backgroundColor: colors.paleLavender,
    borderRadius: 5,
  },
  barFill: {
    height: "100%",
    backgroundColor: colors.peach,
    borderRadius: 5,
  },

  // Tips
  tipRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 12,
  },
  tipIcon: {
    width: 26,
    height: 26,
    overflow: "hidden",
    fontSize: 15,
    fontWeight: "900",
    lineHeight: 26,
    textAlign: "center",
    borderRadius: 13,
  },
  goodIcon: {
    color: colors.white,
    backgroundColor: colors.purple,
  },
  workOnIcon: {
    color: colors.charcoal,
    backgroundColor: colors.peach,
  },
  tipText: {
    flex: 1,
    fontSize: 15,
    lineHeight: 22,
    color: colors.charcoal,
  },

  // Bottom
  note: {
    marginBottom: 20,
    fontSize: 13,
    color: colors.grey,
    textAlign: "center",
  },
  buttons: {
    gap: 12,
  },
});
