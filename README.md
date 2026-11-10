# AI Workplace Productivity Assistant 🤖

An AI-powered workplace productivity application designed to help professionals save time, simplify everyday tasks and improve efficiency through intelligent assistance.

## 📌 Project Overview

The **AI Workplace Productivity Assistant** is a modern, responsive web application that provides AI-powered tools for managing workplace information and tasks.

The application brings together meeting summarisation, research assistance and an interactive AI chatbot in one centralised dashboard.

Its purpose is to make workplace tasks easier by transforming lengthy information into structured, understandable and actionable outputs.

## ✨ Features Implemented

### 1. Meeting Notes Summarizer
- Summarises lengthy meeting notes.
- Extracts important discussion points.
- Identifies key decisions.
- Generates action items and deadlines.
- Organises information into structured outputs.
- Allows users to edit and copy generated summaries.

### 2. AI Research Assistant
- Summarises topics and articles.
- Identifies key insights and important information.
- Provides relevant recommendations.
- Generates practical takeaways.
- Allows users to edit and copy research outputs.

### 3. AI Workplace Chatbot
- Interactive AI-powered chat interface.
- Answers workplace-related questions.
- Assists with professional writing and content generation.
- Provides contextual responses to user prompts.
- Supports follow-up questions and conversations.

### 4. Dashboard and User Interface
- Modern SaaS-inspired dashboard.
- Sidebar navigation.
- Responsive desktop and mobile layouts.
- Blue, pink and purple gradient colour scheme.
- Editable AI-generated content.
- Copy, regenerate and clear functionality.
- Loading indicators and sample prompts.

### 5. Responsible AI
- Includes an AI disclaimer.
- Encourages users to verify AI-generated information before using it for workplace decisions.

## 🛠️ Technologies and Tools Used

| Technology | Purpose |
|---|---|
| React | Frontend application development |
| TypeScript | Type safety and maintainable code |
| Tailwind CSS | Styling and responsive layouts |
| Vite | Development server and build tool |
| Lucide Icons | Interface icons |
| AI API integration | AI-generated responses |
| Local Storage | Saving basic preferences and temporary history |
| Lovable | AI-assisted application development |
| GitHub | Source code management and version control |

## 🚀 Setup Instructions

### Prerequisites

Make sure you have the following installed:

- [Node.js](https://nodejs.org/) (LTS version recommended)
- npm (included with Node.js)
- [Git](https://git-scm.com/)

### 1. Clone the Repository

```bash
git clone (https://workplace-insight-companion.lovable.app)
```

### 2. Navigate to the Project Folder

```bash
cd ai-workplace-productivity-assistant
```

### 3. Install Dependencies

```bash
npm install
```

### 4. Configure Environment Variables

If an AI API integration is configured, add the required environment variables to your local environment configuration.

Create a `.env` file if required by your project setup.

**Important:** Never expose private API keys in frontend code or commit secret credentials to GitHub.

### 5. Run the Application

```bash
npm run dev
```

### 6. Open the Application

Open the local development URL displayed in your terminal, usually:

```text
http://localhost:5173
```

## 📁 Project Structure

```text
ai-workplace-productivity-assistant/
│
├── public/
├── src/
│   ├── components/
│   ├── pages/
│   ├── assets/
│   ├── App.tsx
│   ├── main.tsx
│   └── index.css
│
├── index.html
├── package.json
├── tsconfig.json
├── vite.config.ts
└── README.md
```

*Note: The structure above is a general example. Actual folders and files may differ depending on the implementation.*

## 🔒 Privacy and Security

- No custom backend or database is required.
- Basic preferences and temporary history may be stored locally.
- AI functionality depends on the configured integration.
- API credentials should never be exposed in client-side code.

## 🎯 Project Objectives

The project aims to:

- Improve workplace productivity through AI assistance.
- Reduce the time spent processing lengthy information.
- Simplify meeting documentation and action-item tracking.
- Make research and information gathering more efficient.
- Provide an accessible and user-friendly AI workplace assistant.

## 👩‍💻 Author

**Ghabriella Salie**

AI Workplace Productivity Assistant

---

*Developed as a frontend-focused AI productivity application using modern web technologies.*
