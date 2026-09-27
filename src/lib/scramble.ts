// Text-scramble engine — decode + hover effects like the reference portfolio.
// Unresolved glyphs render in random rainbow colors, resolving left-to-right
// in a staggered cascade. Re-entry while running is ignored, and the element
// box is width-locked during the run so surrounding layout never shifts.

const GLYPHS = "!<>-_\\/[]{}=+*^?#%@&";
const COLORS = ["#E26FAA", "#F1C83F", "#5CB8DD", "#8FD384", "#AF76C9", "#FA7100"];

type ElState = {
  raf?: number;
  busy?: boolean;
  origDisplay?: string;
  origMinWidth?: string;
};

function state(el: HTMLElement): ElState {
  const s = el as unknown as { _sxs?: ElState };
  if (!s._sxs) s._sxs = {};
  return s._sxs;
}

function rand<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

export function isScrambling(el: HTMLElement): boolean {
  return state(el).busy === true;
}

export function stopScramble(el: HTMLElement) {
  const s = state(el);
  if (s.raf !== undefined) cancelAnimationFrame(s.raf);
  s.busy = false;
}

/** Decode `finalText` with a staggered cascade. Resolves left → right. */
export function scrambleIn(
  el: HTMLElement,
  finalText: string,
  duration = 900
): void {
  const s = state(el);
  if (s.busy) return; // ignore re-entry — one run at a time, no rainbow lock
  stopScramble(el);
  s.busy = true;
  el.dataset.final = finalText;

  // Lock the box so glyph swaps can't shift siblings or reflow text.
  s.origDisplay = el.style.display;
  s.origMinWidth = el.style.minWidth;
  el.style.display = "inline-block";
  el.style.minWidth = `${el.offsetWidth}px`;

  const glyphs = GLYPHS.split("");
  const n = finalText.length;
  const start = performance.now();
  const spread = duration * 0.55; // stagger window across the run
  const charTime = duration * 0.45; // per-char scramble time

  const finish = () => {
    stopScramble(el);
    el.textContent = finalText;
    el.style.display = s.origDisplay || "";
    el.style.minWidth = s.origMinWidth || "";
  };

  const tick = (now: number) => {
    const elapsed = now - start;
    let html = "";
    let done = 0;
    for (let i = 0; i < n; i++) {
      const target = finalText[i];
      if (target === " ") {
        html += " ";
        done++;
        continue;
      }
      const delay = n <= 1 ? 0 : (i / (n - 1)) * spread;
      if (elapsed >= delay + charTime) {
        html += `<span>${target}</span>`;
        done++;
      } else {
        html += `<span style="color:${rand(COLORS)}">${rand(glyphs)}</span>`;
      }
    }
    el.innerHTML = html;
    if (done >= n) {
      finish();
    } else {
      s.raf = requestAnimationFrame(tick);
    }
  };
  s.raf = requestAnimationFrame(tick);
}

/** Quick scramble burst on hover — resolves back to the stored final text. */
export function scrambleHover(el: HTMLElement, duration = 1200) {
  const finalText = el.dataset.final ?? el.textContent ?? "";
  scrambleIn(el, finalText, duration);
}

/**
 * Calm word-by-word decode for body/heading load animations.
 * Upcoming words sit dimmed in final text (layout identical, no reflow);
 * each word then softly resolves — opacity + blur + a small rise, staggered
 * left-to-right. No glyph rain, no noise. Leaves pristine DOM when done.
 */
export function decodeCascade(
  el: HTMLElement,
  finalText: string,
  opts?: { wordTime?: number; stagger?: number }
): void {
  const s = state(el);
  if (s.busy) return;
  stopScramble(el);
  s.busy = true;
  el.dataset.final = finalText;

  const wordTime = opts?.wordTime ?? 380;
  const stagger = opts?.stagger ?? 90;

  el.innerHTML = "";
  const words: { span: HTMLElement; t0: number }[] = [];
  finalText.split(/(\s+)/).forEach((part) => {
    if (part === "") return;
    if (/^\s+$/.test(part)) {
      el.appendChild(document.createTextNode(part));
      return;
    }
    const span = document.createElement("span");
    span.style.display = "inline-block";
    span.style.opacity = "0.15";
    span.style.filter = "blur(3px)";
    span.style.transform = "translateY(6px)";
    span.textContent = part;
    el.appendChild(span);
    words.push({ span, t0: 0 });
  });
  words.forEach((w, i) => {
    w.t0 = i * stagger;
  });
  const total = (words.length - 1) * stagger + wordTime;
  const start = performance.now();

  const finish = () => {
    stopScramble(el);
    el.textContent = finalText;
  };

  const tick = (now: number) => {
    const e = now - start;
    for (const w of words) {
      const t = Math.min(1, Math.max(0, (e - w.t0) / wordTime));
      const ease = 1 - Math.pow(1 - t, 3);
      w.span.style.opacity = `${0.15 + 0.85 * ease}`;
      w.span.style.filter = t >= 1 ? "" : `blur(${(3 * (1 - ease)).toFixed(2)}px)`;
      w.span.style.transform = t >= 1 ? "" : `translateY(${(6 * (1 - ease)).toFixed(2)}px)`;
    }
    if (e >= total) finish();
    else s.raf = requestAnimationFrame(tick);
  };
  s.raf = requestAnimationFrame(tick);
}
