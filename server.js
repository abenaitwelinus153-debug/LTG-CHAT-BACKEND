const express = require("express");
const cors = require("cors");
const sqlite3 = require("sqlite3").verbose();
const OpenAI = require("openai");

const app = express();
app.use(cors());
app.use(express.json());

/* =========================
   OpenAI (SAFE INITIALIZATION)
   ========================= */
let openai = null;

if (process.env.OPENAI_API_KEY) {
  openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY
  });
  console.log("✅ OpenAI key loaded");
} else {
  console.warn("⚠️ OPENAI_API_KEY not set — AI replies disabled");
}

/* =========================
   SQLite Database
   ========================= */
const db = new sqlite3.Database("./chat.db");

db.run(`
  CREATE TABLE IF NOT EXISTS messages (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    sender TEXT,
    message TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  )
`);

/* =========================
   Routes
   ========================= */

// Test route
app.get("/", (req, res) => {
  res.send("LTG-CHAT backend with DB running 🚀");
});

// Get chat history
app.get("/history", (req, res) => {
  db.all(
    "SELECT sender, message, created_at FROM messages ORDER BY id ASC",
    [],
    (err, rows) => {
      if (err) {
        console.error(err);
        return res.json([]);
      }
      res.json(rows);
    }
  );
});

// Chat route
app.post("/chat", async (req, res) => {
  const userMessage = req.body.message;

  if (!userMessage) {
    return res.json({ reply: "⚠️ Empty message" });
  }

  // Save user message
  db.run(
    "INSERT INTO messages (sender, message) VALUES (?, ?)",
    ["user", userMessage]
  );

  // If OpenAI is not available
  if (!openai) {
    return res.json({
      reply: "⚠️ AI is temporarily unavailable. Please try again later."
    });
  }

  try {
    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        { role: "system", content: "You are LTG-CHAT, a helpful AI assistant." },
        { role: "user", content: userMessage }
      ]
    });

    const reply = completion.choices[0].message.content;

    // Save AI reply
    db.run(
      "INSERT INTO messages (sender, message) VALUES (?, ?)",
      ["bot", reply]
    );

    res.json({ reply });

  } catch (error) {
    console.error("OpenAI error:", error);
    res.json({ reply: "AI error ❌ Please try again later." });
  }
});

/* =========================
   Start Server
   ========================= */
const PORT = process.env.PORT || 10000;
app.listen(PORT, () => {
  console.log("Server running on port " + PORT);
});
