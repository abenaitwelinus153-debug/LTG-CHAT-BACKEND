const express = require("express");
const cors = require("cors");
const sqlite3 = require("sqlite3").verbose();
const OpenAI = require("openai");

const app = express();
app.use(cors());
app.use(express.json());

// OpenAI
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

// SQLite database
const db = new sqlite3.Database("./chat.db");

// Create table if not exists
db.run(`
  CREATE TABLE IF NOT EXISTS messages (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    sender TEXT,
    message TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  )
`);

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
      if (err) return res.json([]);
      res.json(rows);
    }
  );
});

// Chat route
app.post("/chat", async (req, res) => {
  const userMessage = req.body.message;

  // save user message
  db.run(
    "INSERT INTO messages (sender, message) VALUES (?, ?)",
    ["user", userMessage]
  );

  try {
    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        { role: "system", content: "You are LTG-CHAT, a helpful AI assistant." },
        { role: "user", content: userMessage }
      ]
    });

    const reply = completion.choices[0].message.content;

    // save AI reply
    db.run(
      "INSERT INTO messages (sender, message) VALUES (?, ?)",
      ["bot", reply]
    );

    res.json({ reply });

  } catch (error) {
    console.error(error);
    res.json({ reply: "AI error ❌ Please try again later." });
  }
});

// Render port
const PORT = process.env.PORT || 10000;
app.listen(PORT, () => {
  console.log("Server running on port " + PORT);
});




