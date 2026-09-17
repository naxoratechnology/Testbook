function youtubeEmbedUrl(value) {
  let url;
  try { url = new URL(String(value || '').trim()); } catch (_) { throw invalid(); }
  if (!['http:', 'https:'].includes(url.protocol) || url.username || url.password || url.port) throw invalid();
  let id;
  if (url.hostname === 'youtu.be') id = url.pathname.split('/')[1];
  else if (['youtube.com', 'www.youtube.com', 'm.youtube.com', 'youtube-nocookie.com', 'www.youtube-nocookie.com'].includes(url.hostname)) {
    if (url.pathname === '/watch') id = url.searchParams.get('v');
    else if (/^\/(embed|shorts|live)\//.test(url.pathname)) id = url.pathname.split('/')[2];
  }
  if (!id || !/^[a-zA-Z0-9_-]{11}$/.test(id)) throw invalid();
  return `https://www.youtube.com/embed/${id}`;
}
function invalid() { return Object.assign(new Error('Enter a valid YouTube video URL.'), { statusCode: 400 }); }
module.exports = { youtubeEmbedUrl };
