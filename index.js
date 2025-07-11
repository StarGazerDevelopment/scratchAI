const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");
const { Groq } = require("groq-sdk");

const app = express();
const port = process.env.PORT || 3000;

app.use(cors());
app.use(bodyParser.json());

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY || "PASTE_YOUR_KEY_HERE"
});

// simple in-memory store (can use Firebase later)
const historyStore = {};

app.post("/chat", async (req, res) => {
  const { message, userId } = req.body;

  if (!userId) return res.status(400).json({ error: "userId required" });

  if (!historyStore[userId]) historyStore[userId] = [];

  historyStore[userId].push({ role: "user", content: message });

  try {
    const response = await groq.chat.completions.create({
      model: "llama3-8b-8192",
      messages: historyStore[userId]
    });

    const reply = response.choices[0].message.content;

    historyStore[userId].push({ role: "assistant", content: reply });

    res.json({ reply });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: "Failed to get response from Groq" });
  }
});
