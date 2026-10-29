// MESSAGE
// What one chat message looks like.

export type Message = {
  // who sent it: Banter is "ai", the person is "user"
  from: "ai" | "user";
  // the words in the message
  text: string;
};
