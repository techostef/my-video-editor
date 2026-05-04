export default function Home() {
  return (
    <main style={{ padding: '2rem', fontFamily: 'monospace' }}>
      <h1>Video Editor API</h1>
      <ul>
        <li>POST /api/upload — Upload video, returns subtitles</li>
        <li>POST /api/render — Burn subtitles, returns video URL</li>
        <li>GET /api/download/[filename] — Download processed video</li>
      </ul>
    </main>
  );
}
