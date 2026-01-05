import { onRequest } from "firebase-functions/v2/https";
import * as logger from "firebase-functions/logger";

export const getDailyInsight = onRequest({ region: "us-central1", cors: true, timeoutSeconds: 60 }, async (req, res): Promise<void> => {
    const apiKey = process.env.GOOGLE_API_KEY; 

    if (!apiKey) {
        logger.error("未設定 GOOGLE_API_KEY 環境變數");
        res.status(200).json({ title: "系統錯誤", concepts: [], conclusion: "缺少金鑰。" });
        return;
    }

    try {
        const genUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`;
        
        // 🚀 數據驅動型 Prompt：強迫 AI 決定趨勢，由前端渲染專業圖形
        const promptText = `你是一位頂級財富管理導師 'Ultra Advisor'。
請隨機挑選一個主題產出 JSON 資料：[1.宏觀經濟與週期, 2.槓桿藝術, 3.複利底層邏輯, 4.被動收入系統, 5.投資行為心理, 6.家族財富傳承, 7.未來金融趨勢]。

要求：
1. **內容去重複**：嚴禁連續產出『數位金融』。請優先在 1、2、3、6 主題中輪替。
2. **視覺數據 (visualData) 規範**：
   請根據文案邏輯提供數據，嚴禁直接輸出 SVG 標籤：
   - "type": 從 [growth, cycle, structure] 擇一。
   - "values": 提供 6 個 (0-100) 的數字陣列，代表趨勢走向。
     * 若為 growth (增長): 數字必須由小到大（如 [10, 20, 45, 60, 85, 98]）。
     * 若為 cycle (週期): 數字需有明顯波峰波谷（如 [30, 85, 20, 95, 40, 75]）。
     * 若為 structure (結構): 數字代表資產比例，需有高低落差。

JSON 格式 (嚴禁改名)：
{
  "title": "震撼的標題",
  "subtitle": "深刻的副標題",
  "visualData": { "type": "growth", "values": [10, 20, 45, 60, 85, 95] },
  "concepts": [
    {"tag": "標籤", "content": "15-30字深刻洞見"}
  ],
  "conclusion": "完整結尾金句。",
  "author": "Ultra Advisor"
}`;

        const aiResponse = await fetch(genUrl, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                contents: [{ parts: [{ text: promptText }] }],
                generationConfig: {
                    temperature: 1.0, 
                    responseMimeType: "application/json",
                    maxOutputTokens: 1024
                }
            })
        });

        const rawText = await aiResponse.text();

        if (aiResponse.ok) {
            let outputText = JSON.parse(rawText).candidates?.[0]?.content?.parts?.[0]?.text;
            outputText = outputText.replace(/```json|```/g, "").trim();
            const parsedData = JSON.parse(outputText);
            const finalResult = Array.isArray(parsedData) ? parsedData[0] : parsedData;
            
            res.setHeader('Content-Type', 'application/json; charset=utf-8');
            res.status(200).json(finalResult);
        } else {
            res.status(200).json({ title: "連線異常", concepts: [], conclusion: "請重試。" });
        }
    } catch (err: any) {
        res.status(200).json({ title: "執行崩潰", subtitle: err.message, concepts: [], conclusion: "修復中。" });
    }
});