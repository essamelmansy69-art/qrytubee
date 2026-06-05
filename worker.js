export default {
  async fetch(request, env) {
    // 1. التعامل مع CORS
    const corsHeaders = {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "GET,POST,OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type",
    };

    if (request.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

    // 2. استقبال الطلب وحفظ الرابط في KV
    if (request.method === "POST") {
      const { shortCode, originalUrl } = await request.json();
      await env.QRYTUBE_DATA.put(shortCode, originalUrl);
      
      return new Response(JSON.stringify({ status: "success" }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    return new Response("Worker is running", { headers: corsHeaders });
  }
};
