import { GoogleGenAI } from "@google/genai";

export default {
  async fetch(request, env, ctx) {
    if (request.method !== "POST") {
      return new Response("Method Not Allowed", { status: 405 });
    }

    try {
      const { prompt } = await request.json();

      // المصفوفة التي تقرأ المفاتيح الأربعة من Cloudflare
      const apiKeys = [
        env.GEMINI_API_KEY_1,
        env.GEMINI_API_KEY_2,
        env.GEMINI_API_KEY_3,
        env.GEMINI_API_KEY_4
      ];

      // تجربة المفاتيح بالترتيب تلقائياً عند حدوث ضغط أو خطأ
      for (let i = 0; i < apiKeys.length; i++) {
        const currentKey = apiKeys[i];
        
        if (!currentKey) continue; 

        try {
          const ai = new GoogleGenAI({ apiKey: currentKey });
          
          const response = await ai.models.generateContent({
            model: 'gemini-1.5-flash',
            contents: prompt,
          });

          return new Response(JSON.stringify({ text: response.text }), {
            status: 200,
            headers: { 
              "Content-Type": "application/json",
              "Access-Control-Allow-Origin": "*"
            }
          });

        } catch (error) {
          console.error(`المفتاح رقم ${i + 1} واجه مشكلة: ${error.message}`);
          
          if (i === apiKeys.length - 1) {
            return new Response(JSON.stringify({ error: "جميع حدود الاستخدام المجانية مستهلكة حالياً." }), {
              status: 429,
              headers: { "Content-Type": "application/json" }
            });
          }
        }
      }

    } catch (err) {
      return new Response(JSON.stringify({ error: "حدث خطأ داخلي في السيرفر" }), { status: 500 });
    }
  },
};
