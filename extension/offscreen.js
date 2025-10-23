// Offscreen document script: listens for PLAY_SOUND messages and plays a short beep using WebAudio

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (!message || message.type !== 'PLAY_SOUND') return;
  const duration = Number(message.duration) || 1000;
  playBeep(duration).catch((e) => console.warn('playBeep failed', e));
});

async function playBeep(durationMs) {
  try {
    const AudioContext = self.AudioContext || self.webkitAudioContext;
    if (!AudioContext) throw new Error('No AudioContext');

    const ctx = new AudioContext();
    // On some platforms, audio context starts suspended. Try to resume.
    if (ctx.state === 'suspended' && typeof ctx.resume === 'function') {
      try { await ctx.resume(); } catch (e) { /* ignore */ }
    }

    const o = ctx.createOscillator();
    const g = ctx.createGain();
    o.type = 'sine';
    o.frequency.value = 880; // A5-ish
    o.connect(g);
    g.connect(ctx.destination);

    // gentle fade in
    g.gain.setValueAtTime(0.0001, ctx.currentTime);
    g.gain.exponentialRampToValueAtTime(0.5, ctx.currentTime + 0.02);

    o.start();

    // Stop after duration
    setTimeout(() => {
      try {
        g.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 0.02);
        o.stop(ctx.currentTime + 0.03);
        // close context shortly after
        setTimeout(() => { try { ctx.close(); } catch (e) {} }, 200);
      } catch (e) {
        // ignore
      }
    }, durationMs);
  } catch (err) {
    console.warn('Unable to play beep', err);
  }
}
