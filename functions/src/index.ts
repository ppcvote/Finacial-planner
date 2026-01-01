import { onRequest } from "firebase-functions/v2/https";
import * as logger from "firebase-functions/logger";

export const getDailyInsight = onRequest({ region: "us-central1", cors: true }, async (req, res): Promise<void> => {
    // 1. 請確保這個 API Key 是正確的且未過期
    const apiKey = "AIzaSyDrdPHgdGX1T0BRp8WnpdGfl1tT6c4CnFg".trim(); 

    try {
        // 使用更穩定的 1.5-flash 來測試，速度快且不容易超時
        const genUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`;
        
        const aiResponse = await fetch(genUrl, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                contents: [{ 
                    parts: [{ 
                        text: `你是一位頂級財商導師。請產出一個 JSON 格式的理財觀念：
                               {
                                 "title": "標題",
                                 "subtitle": "副標題",
                                 "concepts": [{"tag": "1", "content": "觀念1"}, {"tag": "2", "content": "觀念2"}, {"tag": "3", "content": "觀念3"}],
                                 "conclusion": "總結",
                                 "author": "Ultra Advisor"
                               }
                               注意：直接回傳 JSON 字串，不要包含 \`\`\`json 等標籤。` 
                    }] 
                }],
                generationConfig: {
                    temperature: 0.7,
                    responseMimeType: "application/json"
                }
            })
        });

        const data: any = await aiResponse.json();

        // 檢查 AI 是否有正確回傳內容
        if (!aiResponse.ok) {
            logger.error("Gemini API 報錯:", data);
            res.status(500).json({ error: "AI 服務暫時不可用", details: data });
            return;
        }

        const outputText = data.candidates?.[0]?.content?.parts?.[0]?.text;

        if (!outputText) {
            throw new Error("AI 回傳內容為空");
        }

        // 確保回傳給前端的是標準 JSON 物件
        const cleanJson = JSON.parse(outputText);
        res.setHeader('Content-Type', 'application/json; charset=utf-8');
        res.status(200).send(cleanJson);

    } catch (err: any) {
        logger.error("後端崩潰原因:", err.message);
        res.status(500).json({ 
            status: "後端崩潰", 
            reason: err.message,
            tip: "請檢查 Firebase 控制台的 Logs 以獲取更多資訊"
        });
    }
});