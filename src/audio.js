// ============================================================================
//  Ambient sound, synthesised with WebAudio: a low drone that shifts chord on
//  each chapter, a soft tick on hover, and a swell on entry. Off by default.
// ============================================================================

// one chord per chapter (Hz), all in D so moves between them stay consonant
const CHORDS = [
  [73.42, 110, 146.83], [65.41, 98, 130.81], [73.42, 110, 164.81], [61.74, 92.5, 123.47], [69.3, 103.83, 138.59],
  [65.41, 98, 146.83], [58.27, 87.31, 116.54], [73.42, 110, 146.83], [82.41, 123.47, 164.81],
];

export function createSound() {
  const AC = window.AudioContext || window.webkitAudioContext;
  const api = { supported: !!AC, on: false, start() {}, setOn() {}, chapter() {}, tick() {}, swell() {}, suspend() {}, resume() {} };
  if (!AC) return api;

  let ctx, master, filter, voices = [];
  function build() {
    ctx = new AC();
    master = ctx.createGain(); master.gain.value = 0;
    filter = ctx.createBiquadFilter(); filter.type = "lowpass"; filter.frequency.value = 520; filter.Q.value = .6;
    const delay = ctx.createDelay(1); delay.delayTime.value = .38;
    const fb = ctx.createGain(); fb.gain.value = .32;
    filter.connect(master); filter.connect(delay); delay.connect(fb); fb.connect(delay); delay.connect(master);
    master.connect(ctx.destination);
    voices = CHORDS[0].map((f, i) => {
      const o1 = ctx.createOscillator(), o2 = ctx.createOscillator(), g = ctx.createGain();
      o1.type = "sine"; o2.type = "triangle";
      o1.frequency.value = f; o2.frequency.value = f * 1.004;
      g.gain.value = [.16, .1, .07][i];
      o1.connect(g); o2.connect(g); g.connect(filter);
      o1.start(); o2.start();
      return [o1, o2];
    });
    // slow filter sweep so the drone breathes
    const lfo = ctx.createOscillator(), depth = ctx.createGain();
    lfo.frequency.value = .05; depth.gain.value = 180;
    lfo.connect(depth); depth.connect(filter.frequency); lfo.start();
  }

  api.start = () => { if (!ctx) build(); ctx.resume(); api.setOn(true); };
  api.setOn = on => {
    if (on && !ctx) build();
    api.on = on;
    if (!ctx) return;
    ctx.resume();
    master.gain.cancelScheduledValues(ctx.currentTime);
    master.gain.setTargetAtTime(on ? .5 : 0, ctx.currentTime, on ? 1.2 : .25);
  };
  api.chapter = i => {
    if (!ctx) return;
    const chord = CHORDS[i % CHORDS.length];
    voices.forEach(([o1, o2], k) => {
      o1.frequency.setTargetAtTime(chord[k], ctx.currentTime, .8);
      o2.frequency.setTargetAtTime(chord[k] * 1.004, ctx.currentTime, .8);
    });
  };
  api.tick = () => {
    if (!ctx || !api.on) return;
    const o = ctx.createOscillator(), g = ctx.createGain(), t = ctx.currentTime;
    o.type = "sine"; o.frequency.setValueAtTime(1760, t); o.frequency.exponentialRampToValueAtTime(880, t + .08);
    g.gain.setValueAtTime(.035, t); g.gain.exponentialRampToValueAtTime(.0001, t + .12);
    o.connect(g); g.connect(ctx.destination); o.start(t); o.stop(t + .14);
  };
  api.swell = () => {
    if (!ctx || !api.on) return;
    filter.frequency.cancelScheduledValues(ctx.currentTime);
    filter.frequency.setValueAtTime(220, ctx.currentTime);
    filter.frequency.linearRampToValueAtTime(1400, ctx.currentTime + 1.6);
    filter.frequency.linearRampToValueAtTime(520, ctx.currentTime + 4);
  };
  api.suspend = () => ctx?.suspend();
  api.resume = () => { if (api.on) ctx?.resume(); };
  return api;
}
