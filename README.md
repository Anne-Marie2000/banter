# Banter

Banter is a conversation practice app. Choose a situation, pick a conversation partner and practice with AI. There are no grades or confidence scores. Feedback and saving a practice summary are optional.

## Run locally

Install dependencies with `npm install`. Create a private `.env` file in the project root with `GROQ_API_KEY=your_key`. Never commit the key. Optionally set `GROQ_MODEL` to an available Groq chat model.

Run `npm run web` to open the app. Enter sends a message and Shift + Enter adds a line on web. Voice input and read aloud are available in supported browsers. Native voice input is not included.

## Checks

- `npx tsc --noEmit`
- `npm run lint`

## Privacy and deployment

Conversation messages are sent to Groq for replies and requested feedback. Saved session summaries are stored locally on the device; conversation text is not saved to history. The API key is server-side. A production release needs server-capable hosting, an API URL for native builds, and abuse prevention (authentication and rate limiting) before public access. Browser voice input may use the browser's speech service.
