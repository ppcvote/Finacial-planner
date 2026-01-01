import { onRequest } from "firebase-functions/v2/https";
import * as logger from "firebase-functions/logger";

export const getDailyInsight = onRequest({ region: "us-central1", cors: true, timeoutSeconds: 60 }, async (req, res): Promise<void> => {
    // ✅ 修改點：從環境變數讀取，不再寫死金鑰
    const apiKey = process.env.GOOGLE_API_KEY; 

    // 安全檢查：如果沒讀到金鑰，直接回傳錯誤
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
        
        const aiResponse = await fetch(genUrl, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                contents: [{ 
                    parts: [{ 
                        text: "你是一位財商導師。請產出一個 JSON：{\"title\": \"標題\", \"subtitle\": \"副標\", \"concepts\": [{\"tag\": \"1\", \"content\": \"1\"}, {\"tag\": \"2\", \"content\": \"2\"}, {\"tag\": \"3\", \"content\": \"3\"}], \"conclusion\": \"結尾\", \"author\": \"Ultra Advisor\"} 注意：只回傳純 JSON。" 
                    }] 
                }],
                generationConfig: {
                    temperature: 0.7,
                    responseMimeType: "application/json"
                }
            })
        });

        const rawText = await aiResponse.text();

        if (!aiResponse.ok) {
            res.status(200).json({
                title: "AI 連線異常",
                subtitle: `錯誤代碼: ${aiResponse.status} - 請檢查日誌`,
                concepts: [
                    { tag: "!", content: "這可能是 API Key 權限問題" },
                    { tag: "!", content: "或是 Google 服務在該區域有暫時性問題" },
                    { tag: "!", content: rawText.substring(0, 50) + "..." }
                ],
                conclusion: "請截圖此畫面給開發夥伴協助。",
                author: "系統診斷模式"
            });
            return;
        }

        const data = JSON.parse(rawText);
        const outputText = data.candidates?.[0]?.content?.parts?.[0]?.text;

        if (outputText) {
            res.setHeader('Content-Type', 'application/json; charset=utf-8');
            res.status(200).json(JSON.parse(outputText));
            return;
        } else {
            res.status(200).json({
                title: "內容被過濾器攔截",
                subtitle: "AI 拒絕產出此主題內容",
                concepts: [
                    { tag: "1", content: "嘗試更換更溫和的指令" },
                    { tag: "2", content: "或是檢查 Prompt 是否包含敏感字眼" },
                    { tag: "3", content: "目前 AI 處於保護模式" }
                ],
                conclusion: "請嘗試按『換個主題』再試一次。",
                author: "安全過濾模式"
            });
            return;
        }

    } catch (err: any) {
        logger.error("發生崩潰:", err.message);
        res.status(200).json({
            title: "程式執行崩潰",
            subtitle: `原因: ${err.message}`,
            concepts: [
                { tag: "!", content: "JSON 解析可能失敗了" },
                { tag: "!", content: "請檢查 AI 回傳的格式是否正確" }
            ],
            conclusion: "這通常是格式問題，修復後即可恢復。",
            author: "崩潰診斷模式"
        });
        return;
    }
});