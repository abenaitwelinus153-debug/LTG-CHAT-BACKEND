const express = require("express");
const cors = require("cors");

const app = express();
app.use(cors());
app.use(express.json());

app.get("/", (req, res) => {
  res.send("LTG-CHAT backend is running 🚀");
});

app.post("/chat", (req, res) => {
  res.json({ reply: "Hello from LTG-CHAT" });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log("Server running on port " + PORT);
});



