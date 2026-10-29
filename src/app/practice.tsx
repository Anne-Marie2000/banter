// PRACTICE SCREEN (the chat)
// The AI pretends to be someone (like an interviewer or a manager) and the user chats with it.

import { router, useLocalSearchParams } from "expo-router";
import { useEffect, useRef, useState, type ComponentRef } from "react";
import {
  Alert,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { BackButton } from "@/components/back-button";
import { colors } from "@/constants/colors";
import type { Message } from "@/constants/message";
import { sharedStyles } from "@/constants/shared-styles";

// Backup replies
const backupReplies: Record<string, string[]> = {
  Easy: [
    "That's a great start! Can you tell me a little more?",
    "I like that answer. What made you think of it?",
    "You're doing really well. What else would you like to add?",
  ],
  Medium: [
    "Okay, I see. Can you give me a specific example?",
    "Interesting. Why do you think that's important?",
    "What would you do if that didn't work?",
  ],
  Hard: [
    "Hmm, I'm not convinced. Can you explain that better?",
    "That sounds a bit vague. What exactly do you mean?",
    "Other people have said the same thing. Why should I believe you?",
  ],
};

export default function PracticeScreen() {
  // Get the choices from the last two screens
  const params = useLocalSearchParams<{
    situation?: string;
    partner?: string;
    difficulty?: string;
    mode?: string;
  }>();

  // If anything is missing, use a simple default instead
  const situation = params.situation ?? "";
  const partner = params.partner ?? "";
  const difficulty = params.difficulty ?? "Medium";
  const isVoiceMode = params.mode === "Voice";

  // Things this screen remembers
  const [messages, setMessages] = useState<Message[]>([]);
  const [draft, setDraft] = useState("");
  const [isWaiting, setIsWaiting] = useState(true);
  const [showVoiceHint, setShowVoiceHint] = useState(false);

  // These are remembered too, but changing them doesn't redraw the screen
  const backupCount = useRef(0);
  const hasStarted = useRef(false);
  const chatArea = useRef<ComponentRef<typeof ScrollView>>(null);
  const messageBox = useRef<ComponentRef<typeof TextInput>>(null);

  // Ask the AI
  // Sends the chat to the AI file (api/chat+api.ts) and gets a reply back.
  async function askBanter(chat: Message[], isFirstLine: boolean) {
    const response = await fetch("/api/chat", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        messages: chat,
        situation: situation,
        partner: partner,
        difficulty: difficulty,
        start: isFirstLine,
      }),
    });

    const data = await response.json();

    // If something went wrong, stop here.
    // The code that called this will use a backup reply instead.
    if (!response.ok || !data.reply) {
      throw new Error(data.error ?? "No reply from the AI");
    }

    return data.reply as string;
  }

  // Pick a backup reply
  function getBackupReply() {
    const replies = backupReplies[difficulty] ?? backupReplies.Medium;
    // % makes the number go back to 0 when it reaches the end of the list
    const reply = replies[backupCount.current % replies.length];
    backupCount.current = backupCount.current + 1;
    return reply;
  }

  // Start the chat when the screen opens
  useEffect(() => {
    if (hasStarted.current) return; // already started, so stop
    hasStarted.current = true;
    startChat();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function startChat() {
    let firstLine: string;
    try {
      // Ask the AI to say the first line
      firstLine = await askBanter([], true);
    } catch {
      firstLine = `Hi! I'll be playing your ${partner.toLowerCase() || "conversation partner"}. Start whenever you're ready.`;
    }
    setMessages([{ from: "ai", text: firstLine }]);
    setIsWaiting(false);
  }

  // Send a message
  async function sendMessage() {
    const text = draft.trim();

    // Stop if the box is empty, or Banter is still typing
    if (text === "" || isWaiting) return;

    // Add the user's message to the chat.
    const chatSoFar: Message[] = [...messages, { from: "user", text: text }];
    setMessages(chatSoFar);
    setDraft(""); // empty the message box
    setShowVoiceHint(false);
    setIsWaiting(true);

    // Get Banter's reply
    let reply: string;
    try {
      reply = await askBanter(chatSoFar, false);
    } catch (error) {
      console.warn("Couldn't reach the AI, using a backup reply:", error);
      reply = getBackupReply();
    }

    // Add Banter's reply to the chat
    setMessages([...chatSoFar, { from: "ai", text: reply }]);
    setIsWaiting(false);
  }

  // Voice mode
  // Opens the keyboard so the user can tap the microphone on it
  function tapToSpeak() {
    messageBox.current?.focus();
    setShowVoiceHint(true);
  }

  // End the chat
  function endChat() {
    // Get just the user's messages, so they can be scored
    const userMessages = messages
      .filter((message) => message.from === "user")
      .map((message) => message.text);

    // They need to send at least one message first
    if (userMessages.length === 0) {
      Alert.alert(
        "Nothing to score yet",
        "Send at least one message before ending the conversation.",
      );
      return;
    }

    // Go to the Results screen.

    router.replace({
      pathname: "/results",
      params: {
        transcript: JSON.stringify(userMessages),
        situation: situation,
        partner: partner,
        difficulty: difficulty,
        mode: params.mode ?? "Text",
      },
    });
  }

  //  What to show in voice mode

  let voiceArea = "button";
  if (showVoiceHint && draft === "") {
    voiceArea = "hint";
  } else if (showVoiceHint) {
    voiceArea = "nothing";
  }

  // The Send button only works if there's text and Banter isn't typing
  const canSend = draft.trim() !== "" && !isWaiting;

  return (
    <SafeAreaView style={sharedStyles.screen}>
      <KeyboardAvoidingView
        style={sharedStyles.screen}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        {/* Back on the left, End on the right */}
        <View style={styles.topBar}>
          <BackButton />
          <Pressable
            onPress={endChat}
            style={styles.endButton}
            accessibilityRole="button"
          >
            <Text style={styles.endButtonText}>End</Text>
          </Pressable>
        </View>

        {/* Title */}
        <View style={styles.header}>
          <Text style={styles.title}>Practice Session</Text>
          <Text style={styles.subtitle}>
            Speaking with: {partner} · {difficulty}
            {isVoiceMode && " · Voice"}
          </Text>
        </View>

        {/* The chat. It scrolls down to the newest message by itself. */}
        <ScrollView
          ref={chatArea}
          style={styles.chat}
          contentContainerStyle={styles.chatContent}
          onContentSizeChange={() =>
            chatArea.current?.scrollToEnd({ animated: true })
          }
          keyboardShouldPersistTaps="handled"
        >
          {/* One bubble for each message */}
          {messages.map((message, index) => (
            <ChatBubble key={index} message={message} />
          ))}

          {/* Show "Banter is typing…" while waiting for a reply */}
          {isWaiting && (
            <View style={[styles.bubble, styles.banterBubble]}>
              <Text style={styles.typing}>Banter is typing…</Text>
            </View>
          )}
        </ScrollView>

        {/* Voice mode: the Tap to Speak button */}
        {isVoiceMode && voiceArea === "button" && (
          <View style={styles.voiceArea}>
            <Pressable
              onPress={tapToSpeak}
              style={styles.speakButton}
              accessibilityRole="button"
              accessibilityLabel="Tap to speak"
            />
            <Text style={styles.speakLabel}>Tap to Speak</Text>
          </View>
        )}

        {/* Voice mode: the tip */}
        {isVoiceMode && voiceArea === "hint" && (
          <View style={styles.voiceHint}>
            <Text style={styles.voiceHintText}>
              Now tap the 🎤 on your keyboard and start talking.
            </Text>
          </View>
        )}

        {/* The message box and Send button */}
        <View style={styles.messageBar}>
          <TextInput
            ref={messageBox}
            style={styles.messageBox}
            value={draft}
            onChangeText={setDraft}
            onBlur={() => setShowVoiceHint(false)}
            placeholder={
              isVoiceMode ? "Your words will appear here…" : "Type your reply…"
            }
            placeholderTextColor={colors.grey}
            multiline
          />
          <Pressable
            onPress={sendMessage}
            disabled={!canSend}
            style={[styles.sendButton, !canSend && styles.faded]}
            accessibilityRole="button"
            accessibilityLabel="Send message"
          >
            <Text style={styles.sendText}>Send</Text>
          </Pressable>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

// CHAT BUBBLE

function ChatBubble({ message }: { message: Message }) {
  const isBanter = message.from === "ai";

  return (
    <View
      style={[
        styles.bubble,
        isBanter ? styles.banterBubble : styles.userBubble,
      ]}
    >
      {isBanter && <Text style={styles.senderName}>Banter</Text>}
      <Text style={styles.bubbleText}>{message.text}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  // Top bar
  topBar: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 16,
  },
  endButton: {
    paddingVertical: 8,
    paddingHorizontal: 18,
    backgroundColor: colors.charcoal,
    borderRadius: 20,
  },
  endButtonText: {
    fontSize: 15,
    fontWeight: "800",
    color: colors.offWhite,
  },

  // Title
  header: {
    paddingHorizontal: 20,
    paddingBottom: 12,
    borderBottomWidth: 2,
    borderBottomColor: colors.lavender,
  },
  title: {
    fontSize: 24,
    fontWeight: "800",
    color: colors.purple,
  },
  subtitle: {
    marginTop: 2,
    fontSize: 15,
    color: colors.charcoal,
  },

  // Chat
  chat: {
    flex: 1,
  },
  chatContent: {
    padding: 16,
    gap: 10,
  },
  bubble: {
    maxWidth: "80%",
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderRadius: 18,
  },
  banterBubble: {
    alignSelf: "flex-start",
    backgroundColor: colors.white,
    borderWidth: 2,
    borderColor: colors.lavender,
  },
  userBubble: {
    alignSelf: "flex-end",
    backgroundColor: colors.lavender,
  },
  senderName: {
    marginBottom: 2,
    fontSize: 12,
    fontWeight: "800",
    color: colors.purple,
  },
  bubbleText: {
    fontSize: 16,
    lineHeight: 22,
    color: colors.charcoal,
  },
  typing: {
    fontSize: 15,
    fontStyle: "italic",
    color: colors.grey,
  },

  // Voice mode
  voiceArea: {
    alignItems: "center",
    gap: 6,
    paddingTop: 12,
    paddingBottom: 8,
  },
  speakButton: {
    width: 76,
    height: 76,
    borderRadius: 38,
    backgroundColor: colors.purple,
  },
  speakLabel: {
    fontSize: 15,
    fontWeight: "800",
    color: colors.charcoal,
  },
  voiceHint: {
    marginHorizontal: 16,
    marginBottom: 8,
    padding: 12,
    backgroundColor: colors.paleLavender,
    borderWidth: 2,
    borderColor: colors.purple,
    borderRadius: 14,
  },
  voiceHintText: {
    fontSize: 15,
    fontWeight: "700",
    color: colors.charcoal,
    textAlign: "center",
  },

  // Message box and Send button
  messageBar: {
    flexDirection: "row",
    alignItems: "flex-end",
    gap: 10,
    padding: 12,
    borderTopWidth: 2,
    borderTopColor: colors.lavender,
  },
  messageBox: {
    flex: 1,
    minHeight: 46,
    maxHeight: 120,
    paddingHorizontal: 16,
    paddingVertical: 10,
    fontSize: 16,
    color: colors.charcoal,
    backgroundColor: colors.white,
    borderWidth: 2,
    borderColor: colors.lavender,
    borderRadius: 22,
  },
  sendButton: {
    justifyContent: "center",
    height: 46,
    paddingHorizontal: 18,
    backgroundColor: colors.peach,
    borderRadius: 23,
  },
  sendText: {
    fontSize: 16,
    fontWeight: "800",
    color: colors.charcoal,
  },
  faded: {
    opacity: 0.4,
  },
});
