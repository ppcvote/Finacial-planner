import { onRequest } from "firebase-functions/v2/https";
import * as logger from "firebase-functions/logger";

export const getDailyInsight = onRequest({ region: "us-central1", cors: true }, async (req, res): Promise<void> => {
    const apiKey = "AIzaSyDrdPHgdGX1T0BRp8WnpdGfl1tT6c4CnFg".trim(); 

    try {
        const genUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`;
        
        const aiResponse = await fetch(genUrl, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                contents: [{ 
                    parts: [{ 
                        text: `你是一位頂級財商導師，請隨機產出關於「窮富思維」、「理財痛點」或「投資本質」的精確觀念。
                               必須回傳標準 JSON：
                               {
                                 "title": "大標題",
                                 "subtitle": "吸引人的副標",
                                 "concepts": [
                                   {"tag": "1", "content": "觀念1"},
                                   {"tag": "2", "content": "觀念2"},
                                   {"tag": "3", "content": "觀念3"}
                                 ],
                                 "conclusion": "30字犀利結語",
                                 "author": "Ultra Advisor 執行團隊"
                               }` 
                    }] 
                }],
                generationConfig: {
                    temperature: 0.7,
                    responseMimeType: "application/json"
                }
            })
        });

        const data: any = await aiResponse.json();
        const rawText = data.candidates?.[0]?.content?.parts?.[0]?.text || "";

        // --- 核心防錯邏輯：過濾掉 AI 雞婆加上的 Markdown 標籤 ---
        let cleanJsonString = rawText.trim();
        if (cleanJsonString.includes("```")) {
            const match = cleanJsonString.match(/\{[\s\S]*\}/);
            if (match) {
                cleanJsonString = match[0];
            }
        }

        // 解析並回傳
        const jsonObject = JSON.parse(cleanJsonString);
        res.setHeader('Content-Type', 'application/json; charset=utf-8');
        res.status(200).json(jsonObject);

    } catch (err: any) {
        logger.error("後端錯誤:", err.message);
        // 如果報錯了，回傳一個「保底」的內容，不要讓前端卡死
        res.status(200).json({
            title: "複利不是奇蹟，是數學",
            subtitle: "看懂的人在賺錢，看不懂的人在打工",
            concepts: [
                { tag: "1", content: "薪資永遠追不上通膨與房價" },
                { tag: "2", content: "負債是窮人的枷鎖，槓桿是富人的階梯" },
                { tag: "3", content: "時間是投資中最貴的成本" }
            ],
            conclusion: "現在就開始規劃，不要讓未來的你後悔。",
            author: "Ultra Advisor 系統保底"
        });
    }
});