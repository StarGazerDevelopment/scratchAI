const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");
const { Groq } = require("groq-sdk");

const app = express();
const port = process.env.PORT || 3000;

app.use(cors());
app.use(bodyParser.json());

// Use Render's Environment Variable
const apiKey = process.env.GROQ_API_KEY;
if (!apiKey) {
  console.error("ERROR: GROQ_API_KEY is not set in environment variables.");
  process.exit(1);
}

const groq = new Groq({ apiKey });

// In-memory chat history store
const historyStore = {};

app.post("/chat", async (req, res) => {
  const { message, userId } = req.body;

  if (!userId || !message) {
    return res.status(400).json({ error: "Missing userId or message" });
  }

  // Initialize conversation history if it doesn't exist
  if (!historyStore[userId]) {
    historyStore[userId] = [];
  }

  // Add user message to history
  historyStore[userId].push({ role: "user", content: message });

  try {
    const response = await groq.chat.completions.create({
      model: "llama3-8b-8192",
      messages: historyStore[userId],
    });

    const reply = response.choices[0].message.content;

    // Add assistant reply to history
    historyStore[userId].push({ role: "assistant", content: reply });

    res.json({ reply });
  } catch (err) {
    console.error("Groq API error:", err);
    res.status(500).json({ error: "Groq API request failed." });
  }
});

app.get("/", (req, res) => {
  res.send("✅ Groq AI Chat API is running.");
});

app.listen(port, () => {
  console.log(`✅ Server listening on port ${port}`);
});
