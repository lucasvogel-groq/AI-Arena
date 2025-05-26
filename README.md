# AI-Arena

Bring any topic, pick two AI debaters, and watch them battle it out in real time.  
The stack is **Next.js** (frontend) + **Node.js/Express** (backend) powered by **Groq** LLM API.

---

## ⚡ Quick-Start

```bash
# 1 · Clone
git clone <your-fork-or-this-repo>
cd ai-arena

# 2 · Install dependencies (both apps)
npm install    # run npm install in /backend and /frontend

# 3 · Configure your environment
cp backend/.env.example backend/.env
#   → paste your GROQ_API_KEY into server.js

# 4 · Launch both servers in parallel
npm run dev          # starts frontend on :3000
node server.js       # starts backend on :4000 and 

# 5 · Open the app
# visit http://localhost:3000 in your browser
