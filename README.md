# 💬 Ellkay — Intelligent Real-Time Collaboration & AI Chat Platform

> **Live Application:** [https://linkify-1q81.onrender.com](https://linkify-1q81.onrender.com)  
> **Built with:** MERN Stack (MongoDB, Express.js, React 18, Node.js) • Socket.IO • Google Gemini 3.7 Flash • Chakra UI • Cloudinary

---

## 💡 Why "Ellkay"?

**Ellkay** (`L.K.`) stands for **"Listen & Know"**:
* **`L` — Listen:** The platform seamlessly connects users and actively *listens* to the flow of team discussions and message streams.
* **`K` — Know:** Powered by generative AI, it transforms chaotic message threads into structured, actionable *knowledge*—allowing you to know the summary, decisions, and next steps in seconds.

---

## 🎯 The 2 Real-World Problems Ellkay Solves

Modern chat apps create digital fatigue and conversational friction. **Ellkay** directly solves the two biggest pain points in team and group communications using **Google Gemini 3.7 Flash AI**:

```
┌────────────────────────────────────────────────────────────────────────────────────────┐
│  🔴 PROBLEM 1: Group Chat Fatigue & Information Overload                                │
│  "You open a group chat with 100+ unread messages and don't feel like reading it all."   │
├────────────────────────────────────────────────────────────────────────────────────────┤
│  ✅ ELLKAY SOLUTION: 1-Click "Catch Up (AI)" Summarizer                                │
│  Instead of scrolling through walls of text, click "✨ Catch Up (AI)" to get an        │
│  instant executive summary, key topics, decisions made, and an action item checklist.  │
└────────────────────────────────────────────────────────────────────────────────────────┘

┌────────────────────────────────────────────────────────────────────────────────────────┐
│  🔴 PROBLEM 2: Reply Paralysis & Conversational Block                                  │
│  "You don't know what to reply, need a professional draft, or need fast technical help."│
├────────────────────────────────────────────────────────────────────────────────────────┤
│  ✅ ELLKAY SOLUTION: Context-Aware In-Chat AI Assistant (`@ai`)                         │
│  Simply type `@ai <prompt>` inside any chat. Ellkay AI reads recent context to suggest │
│  smart replies, brainstorm solutions, or draft messages without leaving the chat.      │
└────────────────────────────────────────────────────────────────────────────────────────┘
```

---

## ✨ Core Features

### 🤖 1. AI Intelligence Engine (Google Gemini 3.7 Flash)
* **✨ "Catch Up (AI)" Conversation Breakdown:**
  * **Executive Overview:** 1–2 crisp sentences capturing the essence of the discussion.
  * **Key Discussion Topics:** Tagged overview of what people talked about.
  * **Decisions Made:** Explicit log of agreements and choices made in the thread.
  * **Action Items Checklist:** Extract tasks, assignments, and follow-ups.
  * **Conversation Sentiment:** Evaluates tone (e.g., *Productive*, *Planning*, *Casual*, *Urgent*).
  * **1-Click Copy:** Export the full summary to clipboard formatted for Slack/Notion/Email.
* **💬 In-Chat AI Assistant (`@ai` / `@bot`):**
  * Type `@ai how should we respond to this client request?` or `@ai summarize what we agreed on`.
  * The bot automatically reads recent chat history, formulates an intelligent response, and posts as **`Ellkay AI ✨`** in real time.
* **🛡️ Multi-Model Failover Resilience:**
  * Uses automated fallback architecture (`gemini-3.7-flash` ➔ `gemini-3.6-flash` ➔ `gemini-3.5-flash-lite`) ensuring 100% AI uptime.

### ⚡ 2. Real-Time Communication (Socket.IO)
* **Instant Bi-Directional Messaging:** Zero-reload live message delivery across 1-on-1 and group chats.
* **Live Unread Badges:** Unread message count badges (`1 new`, `3 new`) displayed dynamically on sidebar chat cards and the top notification bell.
* **Typing Indicators:** Animated real-time "user is typing..." indicator using Lottie animations.
* **Global Persistent Socket:** Architecture ensures incoming notifications are caught anywhere in the application.

### 👥 3. Group Chat & User Management
* **Dynamic Group Creation:** Search and add multiple users to create rich group conversations.
* **Group Administration:** Rename group chats, add members, or remove participants with admin validation.
* **User Search:** Real-time search by user name or email address.

### 📸 4. Profile & Media Management
* **Change Profile Picture:** Upload photos directly from device (`JPEG`, `PNG`, `WEBP`) to **Cloudinary** cloud storage or paste direct web URLs.
* **Instant Persistence:** Profile updates synchronize across all headers, active chats, and message bubbles immediately.

### 🔒 5. Security & Authentication
* **JWT Authentication:** Secure token-based user verification with custom middleware (`authmiddleware.js`).
* **Bcrypt Password Encryption:** Passwords hashed with 10 salt rounds before database storage.
* **Instant Guest Access:** Pre-configured Guest Login button for one-click reviewer and interviewer walkthroughs.

---

## 🛠️ Tech Stack & Architecture

### **Frontend**
* **React 18** — Component-driven Single Page Application
* **Chakra UI** — Modern, accessible, dark/light responsive interface
* **Socket.IO Client** — Real-time event subscription and emission
* **Axios** — HTTP client for RESTful API communication
* **React Router v5** — Declarative client-side routing
* **React Scrollable Feed & Lottie** — Auto-scrolling chat feeds & smooth typing animations

### **Backend**
* **Node.js & Express.js** — Fast, robust REST API & WebSocket server
* **Socket.IO Server** — Multi-room broadcasting and user room management
* **Google Gemini API (`@google/genai`)** — State-of-the-art LLM for chat intelligence
* **MongoDB Atlas & Mongoose** — Cloud document database with relational referencing & deep population
* **JWT (JSON Web Tokens)** — Stateless session management
* **Bcrypt.js** — Cryptographic password hashing
* **Cloudinary API** — Cloud image and avatar storage


## 👩‍💻 Author
**Ananya Kastiya**   
Live Demo: [https://linkify-1q81.onrender.com](https://linkify-1q81.onrender.com)
