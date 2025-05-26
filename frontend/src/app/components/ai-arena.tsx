"use client";

import { useState, useRef, FormEvent } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Send, Loader2 } from "lucide-react";
import { motion } from "framer-motion";
import axios from "axios";
type ChatTurn = {
  side: "Pro" | "Con";
  text: string;
};

interface Winner {
  winner: string;
  reason: string;
}

type GroqModel =
  | "llama3-8b-8192"
  | "gemma2-9b-it"
  | "qwen-qwq-32b"
  | "llama-3.3-70b-versatile"
  | "meta-llama/llama-4-scout-17b-16e-instruct"
  | "deepseek-r1-distill-llama-70b";

export const AIArena = () => {
  const [prompt, setPrompt] = useState<string>("");
  const [chat, setChat] = useState<ChatTurn[]>([]);
  const [winner, setWinner] = useState<Winner | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [time, setTime] = useState<number>(0);
  const [tokens, setTokens] = useState<number>(0);
  const bottomRef = useRef<HTMLDivElement | null>(null);

  const [proModel, setProModel] = useState<GroqModel>("llama3-8b-8192");
  const [conModel, setConModel] = useState<GroqModel>("llama3-8b-8192");

  const scrollToBottom = () => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!prompt.trim()) return;

    setLoading(true);
    setChat([]);
    setWinner(null);

    try {
      const res = await axios.post("/api/debate", {
        prompt,
        proModel,
        conModel,
      });

      const { transcript, time } = res.data;

      const flattened: ChatTurn[] = transcript.flatMap(
        (turn: { pro: string; con: string }) => [
          { side: "Pro", text: turn.pro },
          { side: "Con", text: turn.con },
        ]
      );

      setChat(flattened);
      setTime(time);
    } catch (err) {
      console.error(err);
      setWinner({ winner: "Error", reason: "Could not contact /api/debate" });
    } finally {
      setLoading(false);
      scrollToBottom();
    }
  };
  return (
    <div className="flex flex-col h-dvh max-w-4xl mx-auto px-4 py-6 gap-6">
      <header className="text-center space-y-1">
        <h1 className="text-3xl font-bold tracking-tight">⚡️ Groq AI‑Arena</h1>
        <p className="text-muted-foreground">
          Enter a statement and watch two Groq‑powered AIs debate it in
          real‑time.
        </p>
      </header>

      <Card className="flex-1 overflow-hidden">
        <CardContent className="h-full p-0 flex flex-col">
          <div className="flex-1 overflow-y-auto px-6 py-4 space-y-4">
            {chat.map((msg, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.2 }}
                className={`flex ${
                  msg.side === "Con" ? "justify-end" : "justify-start"
                }`}
              >
                <div
                  className={
                    msg.side === "Pro"
                      ? "bg-green-100 dark:bg-green-900/40 rounded-2xl rounded-tl-sm px-4 py-2 max-w-[75%] shadow"
                      : "bg-blue-100 dark:bg-blue-900/40 rounded-2xl rounded-tr-sm px-4 py-2 max-w-[75%] shadow"
                  }
                >
                  <span className="block text-xs font-semibold mb-1 text-muted-foreground">
                    {msg.side === "Pro" ? proModel : conModel}
                  </span>
                  <span className="leading-relaxed whitespace-pre-wrap">
                    {msg.text}
                  </span>
                </div>
              </motion.div>
            ))}

            {loading && (
              <div className="flex justify-center">
                <Loader2 className="animate-spin" />
              </div>
            )}
            <div ref={bottomRef} />
          </div>

          {time > 0 && (
            <div className="bg-muted px-6 py-3 text-center text-sm font-medium border-t">
              <span>
                ⚡️{" "}
                <strong>Debate took {(time / 1000).toFixed(2)} seconds</strong>
              </span>
            </div>
          )}
        </CardContent>
      </Card>

      <form onSubmit={handleSubmit} className="flex gap-3">
        <Input
          value={prompt}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
            setPrompt(e.target.value)
          }
          placeholder="e.g. Should pineapple belong on pizza?"
          className="flex-1"
        />
        <select
          value={proModel}
          onChange={(e) => setProModel(e.target.value as GroqModel)}
          className="border rounded px-3 py-1.5 bg-background text-foreground hover:bg-accent focus:outline-none focus:ring-2 focus:ring-ring"
        >
          <option value="llama3-8b-8192">LLaMA3 8B</option>
          <option value="gemma2-9b-it">Gemma 9B</option>
          <option value="qwen-qwq-32b">Qwen 32B</option>
          <option value="llama-3.3-70b-versatile">LLaMA3.3 70B</option>
          <option value="meta-llama/llama-4-scout-17b-16e-instruct">
            LLaMA4 Scout
          </option>
          <option value="deepseek-r1-distill-llama-70b">DeepSeek 70B</option>
        </select>
        <span className="text-muted-foreground self-center">vs</span>
        <select
          value={conModel}
          onChange={(e) => setConModel(e.target.value as GroqModel)}
          className="border rounded px-3 py-1.5 bg-background text-foreground hover:bg-accent focus:outline-none focus:ring-2 focus:ring-ring"
        >
          <option value="llama3-8b-8192">LLaMA3 8B</option>
          <option value="gemma2-9b-it">Gemma 9B</option>
          <option value="qwen-qwq-32b">Qwen 32B</option>
          <option value="llama-3.3-70b-versatile">LLaMA3.3 70B</option>
          <option value="meta-llama/llama-4-scout-17b-16e-instruct">
            LLaMA4 Scout
          </option>
          <option value="deepseek-r1-distill-llama-70b">DeepSeek 70B</option>
        </select>
        <Button type="submit" disabled={loading} className="shrink-0">
          {loading ? (
            <Loader2 className="animate-spin w-4 h-4" />
          ) : (
            <Send className="w-4 h-4" />
          )}
        </Button>
      </form>
    </div>
  );
};
