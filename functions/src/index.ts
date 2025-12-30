import { onRequest } from "firebase-functions/v2/https";

export const getDailyInsight = onRequest({ region: "us-central1", cors: true }, async (req, res): Promise<void> => {
    
    // 請確保這裡依然是你那組測試成功的 AI Studio 金鑰
    const apiKey = "AIzaSyDrdPHgdGX1T0BRp8WnpdGfl1tT6c4CnFg".trim(); 

    try {
        const listUrl = `https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}`;
        const listResponse = await fetch(listUrl);
        const listData: any = await listResponse.json();

        const availableModels = listData.models || [];
        const targetModel = availableModels.find((m: any) => 
            m.name.includes("gemini") && m.supportedGenerationMethods.includes("generateContent")
        ) || { name: "models/gemini-1.5-flash" }; // 找不到就用預設

        const genUrl = `https://generativelanguage.googleapis.com/v1beta/${targetModel.name}:generateContent?key=${apiKey}`;
        
        const response = await fetch(genUrl, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                contents: [{ 
                    parts: [{ 
                        text: `你是一位冷靜、犀利的資深財務專家。
                               請撰寫一則今日理財洞察，用於 IG 限動。
                               內容要求：
                               1. 範圍：專注於整個金融市場、投資本質、複利、或人性與金錢的關係。
                               2. 風格：語氣犀利、邏輯清楚，偶爾可以引用或改編國內外經典理財名言。
                               3. 限制：60-80 字，不要溫情喊話，要戳中痛點。
                               4. 格式：務必回傳 JSON 格式如下：{"text": "內容", "author": "金融智庫"}
                               注意：author 欄位請統一使用「金融智庫」或相關中性稱呼，絕對不要出現「謝民義」。` 
                    }] 
                }]
            })
        });

        const data: any = await response.json();

        if (response.ok && data.candidates?.[0]?.content?.parts?.[0]?.text) {
            const rawText = data.candidates[0].content.parts[0].text;
            const jsonMatch = rawText.match(/\{[\s\S]*\}/);
            res.setHeader('Content-Type', 'application/json; charset=utf-8');
            res.status(200).send(jsonMatch ? jsonMatch[0] : rawText);
        } else {
            res.status(500).json({ status: "生成失敗", error: data.error?.message });
        }
    } catch (err: any) {
        res.status(500).json({ status: "崩潰", reason: err.message });
    }
});