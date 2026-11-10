# Workday AI

Build a modern, responsive SaaS web application called **AI Workplace Productivity Assistant**.

**Purpose:** Help professionals save time and improve productivity using AI-powered workplace tools.

**Core features:**

1. **Meeting Notes Summarizer:** Allow users to paste lengthy meeting notes. Generate structured summaries, key discussion points, decisions, action items, assigned responsibilities and deadlines.

2. **AI Research Assistant:** Allow users to enter a topic or paste an article. Generate detailed, relevant summaries, key insights, recommendations and practical takeaways.

3. **AI Workplace Chatbot:** Provide an interactive chat interface where users can ask workplace-related questions, generate professional content, solve problems and receive contextual, useful responses.

**Design requirements:**
- Professional, modern SaaS dashboard.
- Collapsible sidebar with navigation for Dashboard, Meeting Summarizer, Research Assistant and AI Chat.
- Responsive layout for desktop, tablet and mobile.
- Beautiful blue, turqoise, green, lime, yellow, orange gradient/ombre colour palette.
- Clean typography, rounded cards, subtle shadows and smooth animations.
- Modern icons, clear buttons and intuitive navigation.
- Dashboard with welcome message, feature cards and recent activity.

**Functionality:**
- Use AI-generated, context-aware responses, not generic placeholder outputs.
- Include structured prompts for each AI tool.
- Make all generated outputs editable.
- Include copy, regenerate and clear buttons.
- Use loading indicators while generating responses.
- Include sample prompts to help users get started.
- Allow users to interact with the AI and refine generated results.

**Technical requirements:**
- Frontend only. No backend, database, authentication or paid infrastructure.
- Use React, TypeScript and Tailwind CSS.
- Use a suitable AI API integration if available, with API keys entered securely through environment variables. Do not expose API keys in frontend code.
- If no AI API is configured, provide a clearly labelled demo mode rather than pretending responses are live AI-generated.
- Use local storage for basic preferences and temporary history.

**Responsible AI:** Display a disclaimer explaining that AI-generated content may contain errors and should be reviewed before being used for workplace decisions.

Prioritise functionality, usability and visual quality. Build all three tools as working, connected sections of one application. Avoid unnecessary features that increase complexity. Make the final product feel like a polished, production-quality SaaS platform.

This project was built with [Lovable](https://lovable.dev).

## Build with Lovable

Continue developing this project in the [Lovable editor](https://lovable.dev/projects/00c37b5e-f5d7-40ee-8ffb-7f86d03d8744).

- **Ship faster**: describe what you want to build and Lovable handles the code.
- **Stay in sync**: every change made in Lovable is committed straight to this repository.
- **Full ownership**: this code is yours. Push to `main` on GitHub and your changes sync back into Lovable, ready for your next prompt.

## Development

Prefer working locally? You need Node.js and npm — [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating).

```sh
git clone <this-repository-url>
cd <repository-name>
npm i
npm run dev
```
