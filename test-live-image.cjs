async function testImageFetch() {
  try {
    const url = 'https://qrytube.com/instagram_qr_seo.webp';
    console.log('Fetching:', url);
    const res = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
      }
    });
    console.log('Status Code:', res.status);
    console.log('Content-Type:', res.headers.get('content-type'));
    const textOrBuf = await res.arrayBuffer();
    console.log('Body byte length:', textOrBuf.byteLength);
  } catch (err) {
    console.error('Fetch error:', err);
  }
}
testImageFetch();
