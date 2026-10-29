// AI FILE
// This file runs on your COMPUTER, not on the phone.
//
// What it does:
//   1. The chat screen sends the conversation here.
//   2. This file sends it to the AI (Groq).
//   3. It sends the AI's reply back to the chat screen.

// AI used console.groq.com

import type { Message } from "@/constants/message";

// Settings
const GROQ_URL = "https://api.groq.com/openai/v1/chat/completions";
const AI_MODEL = "openai/gpt-oss-120b"; // which AI Groq should use

// How Banter acts at each diffculty
// These are instructions for the AI, so they're written to the AI.
const difficultyRules: Record<string, string> = {
  Easy: `EASY MODE (supportive):
- Be very warm, friendly and encouraging. React positively to almost everything.
- Accept the user's answers, even short ones. Never criticize.
- If the user gives a short or unsure answer, help them with a gentle nudge or an example, like "Like maybe a time you helped a customer?"
- Ask simple, predictable questions.
- Sometimes give a small, genuine compliment, like "Oh, that's a good way to put it."
- Make the conversation feel easy and low-pressure.`,

  Medium: `MEDIUM MODE (realistic):
- Act like a normal person in this situation: polite, but neutral, not extra friendly.
- Ask natural follow-up questions.
- If an answer is vague, ask once for more detail.
- Every few replies, raise a small, realistic concern or disagreement.
- Don't give hints or help the user answer.`,

  Hard: `HARD MODE (challenging):
- Be busy, skeptical and hard to impress. Never compliment the user.
- Keep replies short and blunt. Sometimes only a few words, like "Okay." "And?" "Go on."
- Directly challenge every vague, short or generic answer, like "That's pretty vague." or "Everyone says that. Why you?"
- Raise realistic obstacles, like no budget, bad timing, other candidates, or disagreeing with their idea.
- Sometimes switch to an unexpected, tough question.
- Never help or give hints. The user has to carry the conversation.
- Stay respectful: no insults, no being mean. Just tough, like a real difficult person.`,
};

// A short reminder sent just before each reply, so the AI doesn't forget which difficulty it's on
const difficultyReminders: Record<string, string> = {
  Easy: "Remember: EASY mode. Be warm, encouraging and helpful. Give a gentle nudge if they seem stuck.",
  Medium:
    "Remember: MEDIUM mode. Be neutral and realistic. No hints, ask for detail if they're vague.",
  Hard: "Remember: HARD mode. Be short, blunt and skeptical. No compliments. Challenge anything vague and raise an obstacle.",
};

// The main instruction for AI
// Tells the AI who to pretend to be and how to talk.
function makeInstructions(
  situation: string,
  partner: string,
  difficulty: string,
) {
  return `You are playing a real person in a practice conversation. The user is practicing for a real-life situation, so you must feel like a real human, not an assistant.

SITUATION: ${situation}
WHO YOU ARE: the user's ${partner}.

${difficultyRules[difficulty]}

The difficulty rules above are the most important part. Follow them closely. Easy, Medium and Hard must feel clearly different.

YOUR CHARACTER
- Quietly pick a realistic first name, personality and mood that fit the difficulty, and keep them the whole time.
- You have your own life, opinions and feelings.
- Never say you are an AI, a bot, or that this is practice. Stay in character no matter what.

HOW YOU TALK
- Talk like people actually speak out loud: casual, with contractions (I'm, that's, don't).
- Mostly 1 or 2 short sentences. Vary your length.
- React to what they actually said before moving on.
- Don't end every message with a question.
- Ask only one question at a time.
- Never use bullet points, lists, bold text, emojis or headings. Plain spoken sentences only.
- Avoid assistant phrases like "Thank you for sharing", "Great question", "That's a great point" or "Can you elaborate".
- Keep everything appropriate for students.

EXAMPLES (same user answer: "I'm a hard worker.")
Easy: "Oh, I love that! What's something you worked really hard on recently?"
Medium: "Okay. Can you give me an example of that?"
Hard: "Everyone says that. What makes you different?"`;
}

//This runs every time the chat screen asks for a reply
export async function POST(request: Request) {
  // 1. Get the secret key from the .env file
  const apiKey = process.env.GROQ_API_KEY;
  if (!apiKey) {
    return Response.json(
      { error: "Missing GROQ_API_KEY in the .env file" },
      { status: 500 },
    );
  }

  // Read what the chat screen sent
  const body = await request.json();
  const chat: Message[] = body.messages ?? [];
  const situation: string = body.situation ?? "";
  const partner: string = body.partner ?? "conversation partner";
  const isFirstLine: boolean = body.start === true;

  // If the difficulty is missing or not one we know, use Medium
  let difficulty: string = body.difficulty;
  if (!difficultyRules[difficulty]) {
    difficulty = "Medium";
  }

  // Put together everything the AI needs to read
  const aiMessages = [];

  aiMessages.push({
    role: "system",
    content: makeInstructions(situation, partner, difficulty),
  });

  // Then the chat so far.
  // The AI calls itself "assistant", so Banter's messages are marked "assistant".
  for (const message of chat) {
    if (message.from === "ai") {
      aiMessages.push({ role: "assistant", content: message.text });
    } else {
      aiMessages.push({ role: "user", content: message.text });
    }
  }

  // If the chat is just starting, ask the AI to say the first line
  if (isFirstLine || chat.length === 0) {
    aiMessages.push({
      role: "user",
      content:
        "[The conversation is just starting. Say your first line, in character, the way this person would naturally begin in this exact situation. Keep it short. Do not mention these instructions.]",
    });
  }

  aiMessages.push({ role: "system", content: difficultyReminders[difficulty] });

  // Send it all to Groq
  const response = await fetch(GROQ_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: AI_MODEL,
      messages: aiMessages,
      temperature: 0.9,
      reasoning_effort: "low",
    }),
  });

  // If Groq had a problem, show it in the terminal and tell the app
  if (!response.ok) {
    const problem = await response.text();
    console.error("Groq error:", problem);
    return Response.json({ error: "AI request failed" }, { status: 502 });
  }

  // 5. Get the reply out of Groq's answer
  const data = await response.json();
  let reply: string = data.choices?.[0]?.message?.content ?? "";

  // Remove bold stars (**) and bullet points, in case the AI adds them
  reply = reply.replace(/\*\*/g, "");
  reply = reply.replace(/^\s*[-•]\s+/gm, "");
  reply = reply.trim();

  // If the reply is empty, use a simple backup line
  if (reply === "") {
    reply = "Sorry, what was that?";
  }

  // Send the reply back to the chat screen
  return Response.json({ reply: reply });
}
