// Notification chime via the Web Audio API — no asset, no autoplay headaches.
// Plays a short two-tone bell. Safe to call on every incoming notification.
//
// Browser autoplay policy: AudioContext can only emit sound after the page
// has had at least one user gesture (click / tap / key). Since notifications
// are received post-login (login is itself a gesture) this is always met in
// practice. We swallow any error silently — sound is best-effort.

let sharedCtx = null;
let unlocked = false;

function getCtx() {
  if (typeof window === 'undefined') return null;
  if (sharedCtx) return sharedCtx;
  const Ctor = window.AudioContext || window.webkitAudioContext;
  if (!Ctor) return null;
  try {
    sharedCtx = new Ctor();
  } catch {
    return null;
  }
  return sharedCtx;
}

// Resume the audio context on the first user gesture so subsequent
// programmatic plays don't get blocked. Idempotent.
export function unlockNotificationSound() {
  if (unlocked || typeof window === 'undefined') return;
  unlocked = true;
  const handler = () => {
    const ctx = getCtx();
    if (ctx && ctx.state === 'suspended') ctx.resume().catch(() => {});
    window.removeEventListener('click', handler);
    window.removeEventListener('keydown', handler);
    window.removeEventListener('touchstart', handler);
  };
  window.addEventListener('click', handler, { once: true });
  window.addEventListener('keydown', handler, { once: true });
  window.addEventListener('touchstart', handler, { once: true });
}

export function isNotificationSoundMuted() {
  if (typeof window === 'undefined') return true;
  return localStorage.getItem('qh_sound_muted') === '1';
}

export function setNotificationSoundMuted(muted) {
  if (typeof window === 'undefined') return;
  if (muted) localStorage.setItem('qh_sound_muted', '1');
  else localStorage.removeItem('qh_sound_muted');
}

export function playNotificationSound() {
  if (typeof window === 'undefined') return;
  if (isNotificationSoundMuted()) return;
  const ctx = getCtx();
  if (!ctx) return;
  if (ctx.state === 'suspended') ctx.resume().catch(() => {});

  try {
    const t0 = ctx.currentTime;
    const tone = (freq, start, duration, peakGain = 0.18) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.value = freq;
      osc.connect(gain);
      gain.connect(ctx.destination);
      gain.gain.setValueAtTime(0.0001, t0 + start);
      gain.gain.exponentialRampToValueAtTime(peakGain, t0 + start + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.0001, t0 + start + duration);
      osc.start(t0 + start);
      osc.stop(t0 + start + duration + 0.02);
    };
    // Two-tone bell — pleasant + non-jarring
    tone(880,  0,    0.18); // A5
    tone(1320, 0.12, 0.30); // E6
  } catch {
    // Best-effort — never throw out of a notification handler.
  }
}
