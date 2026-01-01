import { onRequest } from "firebase-functions/v2/https";
import * as logger from "firebase-functions/logger";

export const getDailyInsight = onRequest({ region: "us-central1", cors: true, timeoutSeconds: 60 }, async (req, res): Promise<void> => {
    const apiKey = process.env.GOOGLE_API_KEY; 

    if (!apiKey) {
        logger.error("未設定 GOOGLE_API_KEY 環境變數");
        res.status(200).json({
            title: "系統設定錯誤",
            subtitle: "缺少 API 金鑰",
            concepts: [{ tag: "!", content: "請檢查 Firebase 設定或 .env 檔案" }],
            conclusion: "開發者尚未配置 API 金鑰。",
            author: "系統環境檢查"
        });
        return;
    }

    try {
        const genUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`;
        
        // 🚀 升級後的 Prompt：要求 AI 產出導師見解與 SVG 圖表
        const promptText = `
你是一位高端財商導師 'Ultra Advisor'。請針對『如何建立資產水庫』的主題，產出一個嚴格的 JSON 格式資料。

要求：
1. 語氣：專業、有洞見、啟發人心。
2. 視覺：請產出一個極簡的 SVG 向量圖代碼 (放在 visualChart 欄位)，寬度 300，高度 120。用簡單的線條或長條圖表達增長感，配色使用金色 (#D4AF37) 與深灰色。
3. 數據：在 chartData 欄位提供 5 個模擬數值。

JSON 格式規範：
{
  "title": "標題",
  "subtitle": "副標題",
  "visualChart": "SVG 代碼內容",
  "chartData": [20, 40, 60, 80, 100],
  "concepts": [
    {"tag": "標籤1", "content": "深刻洞見1"},
    {"tag": "標籤2", "content": "深刻洞見2"},
    {"tag": "標籤3", "content": "深刻洞見3"}
  ],
  "conclusion": "結尾金句",
  "author": "Ultra Advisor"
}
注意：只需回傳純 JSON，不要包含 Markdown 標籤。`;

        const aiResponse = await fetch(genUrl, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                contents: [{ parts: [{ text: promptText }] }],
                generationConfig: {
                    temperature: 0.8,
                    responseMimeType: "application/json"
                }
            })
        });

        const rawText = await aiResponse.text();

        if (!aiResponse.ok) {
            res.status(200).json({
                title: "AI 連線異常",
                subtitle: `錯誤代碼: ${aiResponse.status}`,
                concepts: [{ tag: "!", content: "請檢查 API Key 權限" }],
                conclusion: "連線失敗，請稍後再試。",
                author: "系統診斷模式"
            });
            return;
        }

        const data = JSON.parse(rawText);
        const outputText = data.candidates?.[0]?.content?.parts?.[0]?.text;

        if (outputText) {
            res.setHeader('Content-Type', 'application/json; charset=utf-8');
            // 直接回傳 AI 生成的 JSON 物件
            res.status(200).json(JSON.parse(outputText));
            return;
        } else {
            res.status(200).json({
                title: "內容被過濾",
                subtitle: "AI 拒絕產出內容",
                concepts: [{ tag: "!", content: "嘗試更換指令" }],
                conclusion: "請按換個主題再試一次。",
                author: "安全過濾模式"
            });
            return;
        }

    } catch (err: any) {
        logger.error("發生崩潰:", err.message);
        res.status(200).json({
            title: "程式執行崩潰",
            subtitle: `原因: ${err.message}`,
            concepts: [{ tag: "!", content: "解析失敗" }],
            conclusion: "格式異常，請重啟測試。",
            author: "崩潰診斷模式"
        });
        return;
    }
});