import { onCall, HttpsError } from "firebase-functions/v2/https";
import { GoogleGenerativeAI } from "@google/generative-ai";

// 定義雲端函式 getDailyInsight (v2 語法)
export const getDailyInsight = onCall({ 
    secrets: ["GEMINI_API_KEY"], // 讀取安全金鑰
    region: "us-central1"        // 建議指定區域，與 Firebase 預設一致
  }, async (request) => {
    
    // 安全檢查：v2 使用 request.auth 檢查登入狀態
    if (!request.auth) {
      throw new HttpsError("unauthenticated", "請先登入系統");
    }

    // 初始化 AI 模型
    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

    const prompt = `
      你是一位頂尖的私人銀行家與財務顧問，說話有哲理且專業。
      請撰寫一則簡短且具啟發性的「今日財富洞察」。
      要求：
      1. 字數約 60-80 字。
      2. 專注於投資心法、複利、或資產配置。
      3. 格式必須是 JSON 如下：{"text": "內容", "author": "作者或金句來源"}
      4. 請直接回傳 JSON 內容，不要包含 \`\`\`json 等標記。
    `;

    try {
      const result = await model.generateContent(prompt);
      const response = await result.response;
      const text = response.text().replace(/```json/g, "").replace(/```/g, "").trim();
      
      return JSON.parse(text);
    } catch (error) {
      console.error("AI 生成出錯:", error);
      return { 
        text: "複利是世界第八大奇蹟，知之者賺，不知者賠。", 
        author: "Albert Einstein" 
      };
    }
  });