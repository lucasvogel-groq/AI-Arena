import cors from "cors";
import express from "express";
import dotenv from "dotenv";
import Groq from "groq-sdk";

dotenv.config();
const app = express();

app.use(express.json());

const corsOptions = {
  origin: "http://localhost:3000",
  credentials: true,
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
};

app.use(cors(corsOptions));
const PORT = 4000;
app.listen(PORT, () => {
  console.log(`AI-Arena backend listening on http://localhost:${PORT}`);
});

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY,
});

function contextDebaters(prompt) {
  const proPrompt = `You are a passionate and articulate debater championing the affirmative position on: "${prompt}"

    Style Guide:
    - Be confident and persuasive
    - Use compelling evidence and logical reasoning
    - Speak with conviction while staying concise
    - Take up a personality that you find would win the debate and be aggressive with it 
    - Your response should have no bullet points or headers and should be able to be SPOKEN OUT LOUD like a normal conversation
  
    Important: This is a 5-round debate. Plan your arguments strategically:
    - Opening: Present your strongest position
    - Middle rounds: Build your case and counter opponent's points
    - Final round: Drive home your most compelling conclusions

    IMPORTANT: Your response should have NO MORE than 70 words.

    Make every response count - you only have 5 exchanges to convince the audience.`;

  const conPrompt = `You are a sharp and analytical debater opposing the position: "${prompt}"
  
    Style Guide:
    - Be precise and methodical in dismantling opposing arguments
    - Use strategic questioning to expose flaws
    - Use compelling evidence and logical reasoning
    - Take up a personality that you find would win the debate and be aggressive with it 
    - Your response should have no bullet points or headers and should be able to be SPOKEN OUT LOUD like a normal conversation
  
    Important: This is a 5-round debate. Structure your opposition carefully:
    - First response: Challenge the fundamental assumptions
    - Middle rounds: Present alternative viewpoints and evidence
    - Final round: Synthesize why your position is more logical

    IMPORTANT: Your repsonse should have NO MORE than 70 words
  
    Remember, you have only 5 exchanges to present your complete counter-argument.`;
  const proMessage = {
    role: "system",
    content: proPrompt,
  };
  const conMessage = {
    role: "system",
    content: conPrompt,
  };

  const proMessages = [proMessage];
  const conMessages = [conMessage];
  return { proMessages, conMessages };
}

app.post("/debate", async (req, res) => {
  const { prompt, proModel, conModel } = req.body;
  let { proMessages, conMessages } = contextDebaters(prompt);
  const transcript = [];
  const t0 = performance.now();

  let totalTokens = 0;

  for (let i = 0; i < 4; i++) {
    const [pro, con] = await Promise.all([
      groq.chat.completions.create({
        model: "llama3-8b-8192",
        messages: proMessages,
        max_tokens: 200,
      }),
      groq.chat.completions.create({
        model: "llama3-8b-8192",
        messages: conMessages,
        max_tokens: 200,
      }),
    ]);

    proMessages.push({
      role: "assistant",
      content: pro.choices[0].message.content,
    });
    conMessages.push({
      role: "assistant",
      content: con.choices[0].message.content,
    });

    proMessages.push({ role: "user", content: con.choices[0].message.content });
    conMessages.push({ role: "user", content: pro.choices[0].message.content });

    transcript.push({
      pro: pro.choices[0].message.content,
      con: con.choices[0].message.content,
    });

    totalTokens += pro.usage.total_tokens + con.usage.total_tokens;
  }

  const time = performance.now() - t0;

  res.json({
    transcript,
    time,
    totalTokens,
  });
});
