import express from "express";

import { queryEmbedding } from "../lib/vectorstores/pineconeStore.js";
import openai from "../configs/openAI.js";
import Conversation from "../models/Conversation.js";
import Chatbot from "../models/Chatbot.js";
import { AI_SYSTEM_PROMPT } from "../lib/promts/promts.js";
const router = express.Router();

export const aiCandidateController = async (req, res) => {
  try {
    const { question, topK = 5, conversationId } = req.body;
    if (!question) return res.status(400).json({ error: "missing question" });

    // 1. embed question
    const qembRes = await openai.embeddings.create({
      model: process.env.EMBEDDING_MODEL,
      input: question,
    });
    const qEmbedding = qembRes.data[0].embedding;

    // 2. search vector DB
    const matches = await queryEmbedding(qEmbedding, topK);

    // 3. history conversation (if not new)
    let conversation;
    const userId = req.user._id;
    if (!conversationId) {
      conversation = new Conversation({
        user_id: userId,
        title: question.slice(0, 50) || "Cuộc trò chuyện mới",
      });
      await conversation.save();
    } else {
      conversation = await Conversation.find({ _id: conversationId, user_id: userId });
    }

    const history = await Chatbot.find({ conversation_id: conversation._id })
      .sort({ createdAt: -1 })
      .lean();

    const historyContext = history
      .reverse()
      .map((msg) => `${msg.isAI ? "AI Assistant" : "User"}: ${msg.message}`)
      .join("\n");

    // 3. build context
    const context = matches
      .map((m, i) => `Context ${i + 1} (score=${m.score?.toFixed(3)}):\n${m.text}`)
      .join("\n\n---\n\n");

    // 4. ask LLM
    const systemPrompt = AI_SYSTEM_PROMPT.CANDIDATE_PROMPT;

    const userPrompt = `
    Lịch sử cuộc trò chuyện:
    ${historyContext}

    Ngữ cảnh:
    ${context}

    Người dùng hỏi: ${question}

    Hãy trả lời dựa trên ngữ cảnh ở trên, tuân thủ đúng các quy tắc trong systemPrompt. 
    Nếu thông tin không có sẵn, hãy phản hồi khéo léo và thân thiện, không dẫn người dùng ra ngoài hệ thống.
    `;

    const completion = await openai.chat.completions.create({
      model: process.env.LLM_MODEL,
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userPrompt },
      ],
      max_tokens: 1500,
      temperature: 0.0,
    });

    const answer = completion.choices[0].message.content;

    //  Lưu message người dùng và AI
    await Chatbot.create([
      { conversation_id: conversation._id, message: question, isAI: false },
      { conversation_id: conversation._id, message: answer, isAI: true },
    ]);

    return res.json({ conversation_id: conversation._id, answer });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: err.message });
  }
};

export default router;
