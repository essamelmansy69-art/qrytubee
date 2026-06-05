export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    const id = url.pathname.slice(1);

    // إذا زار شخص رابطاً مختصراً (مثال: qrytube.com/xyz)
    if (id && id !== "") {
      const dataString = await env.QRYTUBE_DATA.get(id);
      if (dataString) {
        const data = JSON.parse(dataString);
        // تحديث عدد المسحات
        data.clicks = (data.clicks || 0) + 1;
        await env.QRYTUBE_DATA.put(id, JSON.stringify(data));
        return Response.redirect(data.originalUrl, 302);
      }
    }

    // إذا كان الطلب من موقعك (POST) لإنشاء رابط جديد
    if (request.method === "POST") {
      const { originalUrl } = await request.json();
      const id = Math.random().toString(36).substring(7); 
      await env.QRYTUBE_DATA.put(id, JSON.stringify({ originalUrl, clicks: 0, createdAt: new Date() }));
      return new Response(JSON.stringify({ shortUrl: `https://qrytube.com/${id}` }), {
        headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' }
      });
    }

    return new Response("مرحباً بك في Qrytube - النظام الديناميكي يعمل!");
  }
}
