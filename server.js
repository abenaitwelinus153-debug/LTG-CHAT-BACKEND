const fs = require("fs");
const express = require("express");
const cors = require("cors");

const app = express();
app.use(cors());
app.use(express.json());

const PORT = process.env.PORT || 3000;


// Home test
app.get("/", (req, res) => {
  res.send("LTG-CHAT backend is running 🚀");
});

// Chat API
app.post("/chat", (req, res) => {
  const text = req.body.message.toLowerCase();
  let reply = "I’m still learning. Can you explain more?";

  if (text.includes("hello") || text.includes("hi")) {
    reply = "Hello 👋 I’m LTG-CHAT. How can I help you?";
  } 
  else if (text.includes("your name")) {
    reply = "My name is LTG-CHAT 🤖";
  }
  else if (text.includes("help")) {
    reply = "I can chat with you, answer questions, and save messages.";
  }
  else if (text.includes("bye")) {
    reply = "Goodbye 👋 Come back anytime!";
  }
  const chats = JSON.parse(fs.readFileSync("chats.json"));
chats.push({ message: text, reply, time: new Date() });
fs.writeFileSync("chats.json", JSON.stringify(chats, null, 2));


  res.json({ reply });
});
app.post("/register", (req, res) => {
  const { username } = req.body;
  const users = JSON.parse(fs.readFileSync("users.json"));

  if (users.find(u => u.username === username)) {
    return res.json({ error: "User already exists" });
  }

  users.push({ username });
  fs.writeFileSync("users.json", JSON.stringify(users, null, 2));

  res.json({ success: true });
});


