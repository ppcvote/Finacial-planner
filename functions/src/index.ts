import { onRequest } from "firebase-functions/v2/https";
import * as logger from "firebase-functions/logger";

export const getDailyInsight = onRequest({ region: "us-central1", cors: true, timeoutSeconds: 60 }, async (req, res): Promise<void> => {
    const apiKey = process.env.GOOGLE_API_KEY; 

    if (!apiKey) {
        logger.error("未設定 GOOGLE_API_KEY 環境變數");
        res.status(200).json({
            title: "系統設定錯誤",
            subtitle: "缺少 API 金鑰",
            concepts: [{ tag: "!", content: "請檢查 Firebase 設定" }],
            conclusion: "開發者尚未配置 API 金鑰。",
            author: "系統環境檢查"
        });
        return;
    }

    try {
        const genUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`;
        
        // 🚀 升級後的 Prompt：隨機主題 + 強制完整輸出
        const promptText = `
你是一位頂級財商導師 'Ultra Advisor'。
請從以下領域隨機挑選一個主題：[1. 宏觀經濟與資產週期, 2. 槓桿的藝術與風險, 3. 複利效應的底層邏輯, 4. 被動收入系統建構, 5. 心理帳戶與投資行為學, 6. 家族財富傳承機制, 7. 數位資產與未來金融]。

產出一個嚴格的 JSON 格式資料，要求：
1. 標題與副標：要有震撼力與洞見，避免平鋪直敘。
2. SVG 圖表 (visualChart)：寬 300 高 120。請根據主題畫出對應視覺（如階梯狀、波動曲線、向上的箭頭或柱狀圖）。顏色限用金色 (#D4AF37) 與深灰色 (#444444)。
3. 三個洞見：tag 需簡短（如：'觀念'、'行動'），content 需具備專業深度。
4. 結尾金句：必須是一句完整且有力度的總結，嚴禁中途斷句。

JSON 範例：
{
  "title": "標題",
  "subtitle": "副標題",
  "visualChart": "<svg>...</svg>",
  "chartData": [20, 40, 60, 80, 100],
  "concepts": [
    {"tag": "標籤", "content": "深刻洞見"},
    {"tag": "標籤", "content": "深刻洞見"},
    {"tag": "標籤", "content": "深刻洞見"}
  ],
  "conclusion": "完整的一句話結尾。",
  "author": "Ultra Advisor"
}
注意：只需回傳純 JSON，不要包含 Markdown 標籤。`;

        const aiResponse = await fetch(genUrl, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                contents: [{ parts: [{ text: promptText }] }],
                generationConfig: {
                    temperature: 0.9, // 增加隨機性
                    responseMimeType: "application/json",
                    maxOutputTokens: 1024 // 確保有足夠空間寫完
                }
            })
        });

        const rawText = await aiResponse.text();

        if (!aiResponse.ok) {
            res.status(200).json({
                title: "AI 連線異常",
                subtitle: `錯誤代碼: ${aiResponse.status}`,
                concepts: [{ tag: "!", content: "請確認 API Key 狀態" }],
                conclusion: "無法取得智庫內容。",
                author: "系統診斷模式"
            });
            return;
        }

        const data = JSON.parse(rawText);
        const outputText = data.candidates?.[0]?.content?.parts?.[0]?.text;

        if (outputText) {
            res.setHeader('Content-Type', 'application/json; charset=utf-8');
            const parsedData = JSON.parse(outputText);
            // ⭐ 修正點：自動撥開可能出現的陣列殼
            res.status(200).json(Array.isArray(parsedData) ? parsedData[0] : parsedData);
            return;
        } else {
            res.status(200).json({
                title: "內容被過濾",
                subtitle: "AI 保護機制啟動",
                concepts: [{ tag: "!", content: "請嘗試換個主題" }],
                conclusion: "安全過濾已攔截本次產出。",
                author: "安全過濾模式"
            });
            return;
        }

    } catch (err: any) {
        logger.error("發生崩潰:", err.message);
        res.status(200).json({
            title: "程式執行崩潰",
            subtitle: `原因: ${err.message}`,
            concepts: [{ tag: "!", content: "格式解析失敗" }],
            conclusion: "系統需要重新校準。",
            author: "崩潰診斷模式"
        });
        return;
    }
});