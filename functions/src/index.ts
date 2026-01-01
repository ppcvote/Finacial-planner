import { onRequest } from "firebase-functions/v2/https";

export const getDailyInsight = onRequest({ region: "us-central1", cors: true }, async (req, res): Promise<void> => {
    const apiKey = "AIzaSyDrdPHgdGX1T0BRp8WnpdGfl1tT6c4CnFg".trim(); 

    try {
        const genUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-pro:generateContent?key=${apiKey}`;
        
        const response = await fetch(genUrl, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                contents: [{ 
                    parts: [{ 
                        text: `你是一位頂級財商導師，專門製作精緻的金融觀念圖卡。
                               請隨機從以下三個主題選一產出：1.窮人與富人的思維差異 2.投資底層邏輯 3.現代人的理財痛點。
                               
                               輸出格式必須是嚴格的 JSON：
                               {
                                 "title": "標題（例如：為什麼你存不到錢？）",
                                 "subtitle": "副標題或金句（例如：絕望式消費正在掏空你的未來）",
                                 "concepts": [
                                   {"tag": "1", "content": "觀念短語（例如：薪資跟不上房價）"},
                                   {"tag": "2", "content": "觀念短語"},
                                   {"tag": "3", "content": "觀念短語"}
                                 ],
                                 "conclusion": "結尾一段話（約 30 字，要犀利）",
                                 "author": "Ultra Advisor 執行團隊"
                               }
                               注意：內容要犀利、專業，不要有廢話。` 
                    }] 
                }],
                generationConfig: {
                    temperature: 0.5,
                    responseMimeType: "application/json"
                }
            })
        });

        const data: any = await response.json();
        const output = data.candidates?.[0]?.content?.parts?.[0]?.text;
        
        res.setHeader('Content-Type', 'application/json; charset=utf-8');
        res.status(200).send(output);
    } catch (err: any) {
        res.status(500).json({ status: "崩潰", reason: err.message });
    }
});