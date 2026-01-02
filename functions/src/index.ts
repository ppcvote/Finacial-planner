import { onRequest } from "firebase-functions/v2/https";
import * as logger from "firebase-functions/logger";

export const getDailyInsight = onRequest({ region: "us-central1", cors: true, timeoutSeconds: 60 }, async (req, res): Promise<void> => {
    const apiKey = process.env.GOOGLE_API_KEY; 

    if (!apiKey) {
        logger.error("未設定 GOOGLE_API_KEY 環境變數");
        res.status(200).json({
            title: "系統設定錯誤",
            subtitle: "缺少 API 金鑰",
            concepts: [{ tag: "!", content: "請檢查 Firebase 設定或環境變數。" }],
            conclusion: "開發者尚未配置 API 金鑰。",
            author: "系統環境檢查"
        });
        return;
    }

    try {
        const genUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`;
        
        // 🚀 終極穩定版 Prompt：鎖死欄位名稱與視覺邏輯
        const promptText = `
你是一位頂級財商導師 'Ultra Advisor'。請隨機挑選一個主題產出洞見：[1. 宏觀經濟與資產週期, 2. 槓桿的藝術與風險, 3. 複利效應的底層邏輯, 4. 被動收入系統建構, 5. 心理帳戶與投資行為學, 6. 家族財富傳承機制, 7. 數位資產與未來金融]。

要求輸出為『嚴格的 JSON 格式』，欄位名稱必須與下方規範完全一致，嚴禁擅自修改 Key 的名稱：

{
  "title": "標題",
  "subtitle": "副標題",
  "visualChart": "SVG 代碼內容",
  "concepts": [
    {"tag": "2字標籤", "content": "15-30字深刻洞見"},
    {"tag": "2字標籤", "content": "15-30字深刻洞見"},
    {"tag": "2字標籤", "content": "15-30字深刻洞見"}
  ],
  "conclusion": "完整的一句結尾金句，嚴禁斷句。",
  "author": "Ultra Advisor"
}

視覺化 (visualChart) 規範：
寬 300 高 120，使用金色 (#D4AF37) 與深灰色 (#444444)，背景透明。
- 複利主題：爬升曲線 <path d="..." />
- 週期主題：波浪狀起伏線條
- 配置主題：多個高度不一的長條圖 <rect />
- 風險主題：穩定與波動的對比雙線

注意：只需回傳純 JSON 物件，嚴禁包含 Markdown 標籤或任何解釋文字。`;

        const aiResponse = await fetch(genUrl, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                contents: [{ parts: [{ text: promptText }] }],
                generationConfig: {
                    temperature: 0.8,
                    responseMimeType: "application/json",
                    maxOutputTokens: 1024
                }
            })
        });

        const rawText = await aiResponse.text();

        if (!aiResponse.ok) {
            res.status(200).json({
                title: "AI 連線異常",
                subtitle: `代碼: ${aiResponse.status}`,
                concepts: [{ tag: "!", content: "請檢查 API Key 權限。" }],
                conclusion: "無法取得內容。",
                author: "系統診斷模式"
            });
            return;
        }

        const data = JSON.parse(rawText);
        let outputText = data.candidates?.[0]?.content?.parts?.[0]?.text;

        if (outputText) {
            // 處理可能存在的 Markdown 包裹
            outputText = outputText.replace(/```json|```/g, "").trim();
            const parsedData = JSON.parse(outputText);
            
            res.setHeader('Content-Type', 'application/json; charset=utf-8');
            // 自動撥開陣列殼，並確保回傳單一物件
            const finalResult = Array.isArray(parsedData) ? parsedData[0] : parsedData;
            res.status(200).json(finalResult);
        } else {
            res.status(200).json({
                title: "內容解析失敗",
                subtitle: "AI 未回傳有效數據",
                concepts: [{ tag: "!", content: "請按『換個主題』重試。" }],
                conclusion: "連線正常但內容遺失。",
                author: "安全過濾模式"
            });
        }

    } catch (err: any) {
        logger.error("發生崩潰:", err.message);
        res.status(200).json({
            title: "程式執行崩潰",
            subtitle: `原因: ${err.message}`,
            concepts: [{ tag: "!", content: "JSON 格式解析出錯。" }],
            conclusion: "系統需要重新校準。",
            author: "崩潰診斷模式"
        });
    }
});