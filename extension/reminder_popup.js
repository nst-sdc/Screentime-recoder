(function(){
  // Parse query params
  const params = new URLSearchParams(location.search);
  const id = params.get('id');
  const label = params.get('label') ? decodeURIComponent(params.get('label')) : 'Reminder';

  const remLabel = document.getElementById('remLabel');
  const dismissBtn = document.getElementById('dismissBtn');
  const snoozeBtn = document.getElementById('snoozeBtn');

  remLabel.textContent = label;

  // Create audio element and attempt to autoplay a beep loop
  let audio;
  try {
    audio = new Audio();
    // small beep data URI (short sine-like tone) could be used, but using WebAudio for consistent tone
    // We'll try WebAudio below
  } catch (e) {
    audio = null;
  }

  // Use WebAudio to play a short repeating beep
  let ctx, osc, gain;
  async function startBeep() {
    try {
      const AudioContext = window.AudioContext || window.webkitAudioContext;
      if (!AudioContext) return;
      ctx = new AudioContext();
      osc = ctx.createOscillator();
      gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.value = 880;
      osc.connect(gain);
      gain.connect(ctx.destination);
      gain.gain.setValueAtTime(0, ctx.currentTime);

      const scheduleBeep = () => {
        // beep pattern: 300ms on, 200ms off
        gain.gain.cancelScheduledValues(ctx.currentTime);
        gain.gain.setValueAtTime(0.0001, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.6, ctx.currentTime + 0.02);
        setTimeout(() => {
          try { gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 0.02); } catch(e){}
        }, 300);
      };

      osc.start();
      scheduleBeep();
      // schedule repeating beeps
      window._reminderBeepInterval = setInterval(scheduleBeep, 900);
    } catch (err) {
      console.warn('startBeep failed', err);
    }
  }

  function stopBeep() {
    try {
      if (window._reminderBeepInterval) { clearInterval(window._reminderBeepInterval); window._reminderBeepInterval = null; }
      if (gain) {
        try { gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 0.02); } catch(e){}
      }
      if (osc) {
        try { osc.stop(); } catch (e) {}
      }
      if (ctx) {
        setTimeout(() => { try { ctx.close(); } catch(e){} }, 250);
      }
    } catch (e) {}
  }

  dismissBtn.addEventListener('click', async () => {
    try {
      stopBeep();
      // Close this window
      window.close();
      // Inform background to clear badge and stop any windows mapping
      try { chrome.runtime.sendMessage({ type: 'DISMISS_REMINDER', id }); } catch (e) {}
    } catch (e) {}
  });

  snoozeBtn.addEventListener('click', async () => {
    try {
      stopBeep();
      window.close();
      try { chrome.runtime.sendMessage({ type: 'SNOOZE_REMINDER', id, minutes: 5 }); } catch (e) {}
    } catch (e) {}
  });

  // Start beep as soon as possible
  startBeep().catch(()=>{});

  // Try to focus the window
  try { window.focus(); } catch (e) {}

  // If user closes window directly, notify background via onRemoved listener (background cleans map). No extra work needed here.
})();
