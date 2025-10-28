import express from "express";

import { queryEmbedding } from "../lib/vectorstores/pineconeStore.js";
import openai from "../configs/openAI.js";
import Conversation from "../models/Conversation.js";
import Chatbot from "../models/Chatbot.js";
import { AI_SYSTEM_PROMPT } from "../lib/promts/promts.js";
import { getEmbedding } from "../lib/vectorstores/embedding.js";
import { getHistoryContext } from "../lib/vectorstores/context.js";
import { FRONTEND_ROUTES } from "../constants/variable.js";
const router = express.Router();

export const aiCandidateController = async (req, res) => {
  try {
    const { question, topK = 5, conversationId } = req.body;
    let conversation;
    const userId = req.user._id;

    if (!question) return res.status(400).json({ error: "missing question" });

    // 1. embed question
    const qEmbedding = await getEmbedding(question);
    // 2. search vector DB
    const matches = await queryEmbedding(qEmbedding, topK);

    // 3. history conversation (if not new)
    if (!conversationId) {
      conversation = new Conversation({
        user_id: userId,
        title: question.slice(0, 50) || "Cuộc trò chuyện mới",
      });
      await conversation.save();
    } else {
      conversation = await Conversation.find({ _id: conversationId, user_id: userId });
    }

    const historyContext = await getHistoryContext(conversation._id);

    // Create context with job IDs for linking
    const frontendUrl = process.env.CLIENT_URL || "http://localhost:5173";

    const context = matches
      .map((m, i) => {
        const jobLink = `${frontendUrl}${FRONTEND_ROUTES.JOB_DETAILS}/${m.id}`;
        return `Context ${i + 1} (score=${m.score?.toFixed(3)}):\nJob ID: ${m.id}\nJob Link: ${jobLink}\n${m.text}`;
      })
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
    
    **QUAN TRỌNG:** Khi đề cập đến công việc cụ thể, hãy LUÔN LUÔN bao gồm link "Job Link" tương ứng để ứng viên có thể xem chi tiết và ứng tuyển.
    Định dạng link dưới dạng: [Tên công việc](Job Link URL)
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
