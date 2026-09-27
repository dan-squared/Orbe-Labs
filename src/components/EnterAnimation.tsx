"use client";

import { useLayoutEffect, useRef, useSyncExternalStore } from "react";
import gsap from "gsap";

type Pill = {
  text: string;
  bg: string;
  fg?: string;
  x: number; // % left on desktop
  y: number; // % top on desktop
  mx: number; // % left on mobile
  my: number; // % top on mobile
  size: "sm" | "md";
  m?: boolean; // show on mobile (curated, uncrowded set)
  early?: 1; // drifts on black; the rest join at the final converge
};

// Palette strictly from user file (16 colors)
const P = {
  lavender: "#D497DC",
  green: "#81CB90",
  peach: "#E9B4A1",
  purple: "#AF76C9",
  pink: "#E26FAA",
  lightPink: "#FAA8D0",
  mustard: "#E5C247",
  sky: "#5CB8DD",
  paleCyan: "#C1F1F0",
  terracotta: "#E17B54",
  tan: "#DAA18A",
  paleYellow: "#FFFAA2",
  gold: "#F1C83F",
  lime: "#E3D92E",
  lightGreen: "#8FD384",
  orange: "#FA7100",
} as const;

const INK = "#111111";
const PAPER = "#F4F3F1";
const FINAL = "#FAFAF7";

const PILLS: Pill[] = [
  { text: "CLARITY", bg: P.orange, x: 5.5, y: 9.5, mx: 4, my: 8, size: "md", m: true },
  { text: "USER-FRIENDLY", bg: P.lime, x: 25, y: 9, mx: 36, my: 5.5, size: "md", m: true, early: 1 },
  { text: "PRECISION", bg: P.lavender, x: 54.5, y: 10.5, mx: 58, my: 11.5, size: "sm", early: 1 },
  { text: "CLEAR PATH", bg: P.sky, x: 77, y: 5, mx: 60, my: 2.5, size: "md", m: true },
  { text: "FLOW", bg: P.paleCyan, x: 92.5, y: 14, mx: 84, my: 9.5, size: "sm", m: true, early: 1 },
  { text: "CLEAR PATH", bg: P.purple, fg: "#fff", x: 71, y: 18, mx: 53, my: 15.5, size: "md" },
  { text: "FUNCTION-FIRST", bg: P.tan, x: 85.5, y: 27.5, mx: 56, my: 23.5, size: "md" },
  { text: "FRICTIONLESS", bg: P.paleCyan, x: 13.5, y: 30.5, mx: 7, my: 27.5, size: "sm", early: 1 },
  { text: "INTUITION", bg: "#F6F3E7", x: 4, y: 36.5, mx: 3, my: 33.5, size: "md", m: true },
  { text: "FOCUS", bg: P.gold, x: 77, y: 38.5, mx: 73, my: 40, size: "sm", m: true, early: 1 },
  { text: "SMART LAYOUT", bg: P.lightGreen, x: 18.5, y: 46.5, mx: 7, my: 43.5, size: "sm", m: true },
  { text: "PURPOSEFUL", bg: P.peach, x: 3.5, y: 53.5, mx: 3, my: 50.5, size: "sm" },
  { text: "FLOW", bg: P.paleCyan, x: 33, y: 55, mx: 39, my: 51.5, size: "sm", early: 1 },
  { text: "UI DESIGN", bg: P.sky, x: 70.5, y: 54.5, mx: 63, my: 51, size: "sm", m: true, early: 1 },
  { text: "SEAMLESS UX", bg: P.pink, fg: "#fff", x: 5, y: 61.5, mx: 3, my: 57.5, size: "md", m: true, early: 1 },
  { text: "EFFICIENCY", bg: P.lavender, x: 13.5, y: 67.5, mx: 9, my: 63.5, size: "sm" },
  { text: "FOCUS", bg: P.mustard, x: 95.5, y: 55.5, mx: 79, my: 52.5, size: "sm" },
  { text: "WHAT MATTERS", bg: P.paleYellow, x: 86.5, y: 61.5, mx: 50, my: 58.5, size: "md", m: true },
  { text: "EFFORTLESS", bg: P.lavender, x: 75.5, y: 68.5, mx: 60, my: 65.5, size: "sm", early: 1 },
  { text: "HARMONY", bg: P.green, x: 90.5, y: 71.5, mx: 68, my: 70.5, size: "sm" },
  { text: "CLEAN UI", bg: P.paleCyan, x: 28.5, y: 80.5, mx: 18, my: 77.5, size: "md", m: true },
  { text: "MINIMALISM", bg: P.terracotta, fg: "#fff", x: 9.5, y: 88.5, mx: 4, my: 85.5, size: "md", m: true },
  { text: "SEAMLESS UX", bg: P.pink, fg: "#fff", x: 51, y: 73.5, mx: 43, my: 71.5, size: "sm", early: 1 },
  { text: "STREAMLINED", bg: P.peach, x: 58.5, y: 89.5, mx: 43, my: 86.5, size: "md", m: true },
  { text: "PRECISION", bg: P.lavender, x: 85.5, y: 88.5, mx: 66, my: 85.5, size: "md", m: true },
];

function subscribeBreakpoint(cb: () => void) {
  const mq = window.matchMedia("(max-width: 767px)");
  mq.addEventListener("change", cb);
  return () => mq.removeEventListener("change", cb);
}

export default function EnterAnimation() {
  const root = useRef<HTMLDivElement>(null);
  const tlRef = useRef<gsap.core.Timeline | null>(null);
  // SSR-safe: server snapshot is always false, so the first render matches
  // the server HTML exactly (desktop, full list) — no hydration mismatch.
  // After hydration the client snapshot applies (mobile map + curated list).
  const isMobile = useSyncExternalStore(
    subscribeBreakpoint,
    () => window.matchMedia("(max-width: 767px)").matches,
    () => false
  );
  const ready = useSyncExternalStore(
    () => () => {},
    () => true,
    () => false
  );
  const list = isMobile ? PILLS.filter((p) => p.m) : PILLS;

  const replay = () => {
    const tl = tlRef.current;
    if (!tl) return;
    document.body.style.overflow = "hidden";
    window.dispatchEvent(new Event("intro:start"));
    tl.restart();
  };

  useLayoutEffect(() => {
    if (!ready) return;
    const gates = list.map((p) => (p.early ? 1 : 0));
    const ctx = gsap.context(() => {
      const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
      const pills = gsap.utils.toArray<HTMLElement>(".pill");
      const q = gsap.utils.selector(root.current);

      const card = q("#card");
      const cardText = q("#card-text");
      const hero = q("#hero");
      const heroInner = q("#hero-inner");
      const crossH = q("#cross-h");
      const crossV = q("#cross-v");

      document.body.style.overflow = "hidden";

      if (reduce) {
        gsap.set(root.current, { backgroundColor: FINAL });
        gsap.set(card, { opacity: 0 });
        gsap.set(cardText, { opacity: 0 });
        gsap.set(pills, { opacity: 0 });
        gsap.set([crossH, crossV], { opacity: 0 });
        gsap.set(hero, { opacity: 1, filter: "blur(0px)" });
        document.body.style.overflow = "";
        return;
      }

      // Screen-aware frame sizing — every step derives from the viewport,
      // so the frame expands to the edges on any screen size:
      // base fits small phones, cover blankets all.
      const vw = window.innerWidth;
      const vh = window.innerHeight;
      const base = Math.min(240, Math.max(170, vw * 0.5));
      const coverW = vw + 80;
      const coverH = vh + 80;

      // ---- initial states (frame 1 pre-roll, also mirrored inside timeline so REPLAY is clean) ----
      // Entrance uses opacity/scale only — x/y belong to the converge driver.
      gsap.set(root.current, { backgroundColor: INK });
      gsap.set(card, { width: base, height: base, scale: 0.85, opacity: 0 });
      gsap.set(cardText, { opacity: 0, y: 8 });
      gsap.set([crossH, crossV], { opacity: 0 });
      gsap.set(pills, { opacity: 0, scale: 0.9, x: 0, y: 0 });
      gsap.set(hero, { opacity: 0, filter: "blur(14px)" });
      gsap.set(heroInner, { y: 18 });

      const tl = gsap.timeline({
        defaults: { ease: "power3.inOut" },
        onComplete: () => {
          document.body.style.overflow = "";
          window.dispatchEvent(new Event("intro:done"));
        },
      });
      tlRef.current = tl;
      window.dispatchEvent(new Event("intro:start"));

      // On black only a few pills drift (gate = 1); the rest join as the
      // gate opens during the final converge — like the reference, where
      // edge labels linger while middle ones dissolve first.
      let deltas: { x: number; y: number }[] = [];
      const prog = { p: 0 };
      const captureDeltas = () => {
        const cx = window.innerWidth / 2;
        const cy = window.innerHeight / 2;
        deltas = pills.map((el) => {
          const r = el.getBoundingClientRect();
          return { x: cx - (r.left + r.width / 2), y: cy - (r.top + r.height / 2) };
        });
        prog.p = 0;
      };
      const applyConverge = () => {
        const t = Math.min(1, Math.max(0, (prog.p - 0.3) / 0.48));
        const open = t * t * (3 - 2 * t);
        pills.forEach((el, i) => {
          const d = deltas[i];
          if (!d) return;
          const g = (gates[i] ?? 0) + (1 - (gates[i] ?? 0)) * open;
          gsap.set(el, { x: d.x * prog.p * g, y: d.y * prog.p * g });
        });
      };

      // All initial states re-asserted at time 0 so REPLAY restores everything
      tl.set(root.current, { backgroundColor: INK }, 0)
        .set(card, { width: base, height: base, scale: 0.85, opacity: 0 }, 0)
        .set(cardText, { opacity: 0, y: 8 }, 0)
        .set([crossH, crossV], { opacity: 0 }, 0)
        .set(pills, { opacity: 0, scale: 0.9, x: 0, y: 0, display: "", filter: "blur(0px)" }, 0)
        .set(hero, { opacity: 0, filter: "blur(14px)" }, 0)
        .set(heroInner, { y: 18 }, 0);

      // Phase A — frame 1: grid + card + pills in
      tl.to([crossH, crossV], { opacity: 1, duration: 0.5, ease: "power2.out" }, 0)
        .to(card, { opacity: 1, scale: 1, duration: 0.6, ease: "power2.out" }, 0.05)
        .to(cardText, { opacity: 1, y: 0, duration: 0.45, ease: "power2.out" }, 0.3)
        .to(
          pills,
          { opacity: 1, scale: 1, duration: 0.55, ease: "power2.out", stagger: 0.022 },
          0.1
        )
        // Converge starts here — a few pills drift slowly on black (frames 1-2)
        .add(captureDeltas, 0.75)
        .to(prog, { p: 0.12, duration: 1.1, ease: "sine.inOut", onUpdate: applyConverge }, 0.8)
        // Phase B — frames 3-5: one continuous expand, centered, equally
        // toward all 4 corners straight to full cover. Delayed with a beat
        // after the black drift, gentle sine ease, and converge leg 2 shares
        // the exact same onset + ease so frame and pills move as one.
        .to(cardText, { opacity: 0, y: -10, duration: 0.3, ease: "power2.in" }, 1.9)
        .to(card, { width: coverW, height: coverH, duration: 1.5, ease: "sine.inOut" }, 2.0)
        .to(prog, { p: 0.3, duration: 1.5, ease: "sine.inOut", onUpdate: applyConverge }, 2.0)
        .to([crossH, crossV], { opacity: 0, duration: 0.4 }, 2.7)
        .to(root.current, { backgroundColor: PAPER, duration: 0.3 }, 3.35)
        // Phase C — hero fades in sharp and plain (frames 5-6).
        .to(hero, { opacity: 1, filter: "blur(0px)", duration: 0.7, ease: "power2.out" }, 3.4)
        .to(heroInner, { y: 0, duration: 0.7, ease: "power2.out" }, 3.4)
        .to(root.current, { backgroundColor: FINAL, duration: 0.4 }, 3.6)
        // Phase D — frames 7-10: converge completes + dissolve.
        // Starts exactly as full-white lands so frame growth hands off to
        // pill motion in one continuous gesture — opposite directions,
        // same calibration. Stagger edges-first so middle labels dissolve first.
        .to(prog, { p: 0.78, duration: 1.5, ease: "power1.inOut", onUpdate: applyConverge }, 3.5)
        .to(
          pills,
          {
            duration: 1.5,
            ease: "power2.inOut",
            stagger: { each: 0.012, from: "edges" },
            scale: 0.45,
            opacity: 0,
            filter: "blur(8px)",
          },
          3.5
        )
        .set(pills, { display: "none" })
        .to(card, { opacity: 0, duration: 0.3, ease: "power2.out" })
        // Nav arrives as the tail fade settles — right after pills are gone.
        .add(() => window.dispatchEvent(new Event("intro:nav")), "-=0.2");

      return () => {
        tl.kill();
        document.body.style.overflow = "";
      };
    }, root);

    return () => ctx.revert();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ready, isMobile]);

  return (
    <div
      ref={root}
      className={`relative h-svh w-screen overflow-hidden ${ready ? "" : "invisible"}`}
      style={{ backgroundColor: INK }}
      aria-label="Agency intro animation"
    >
      {/* crosshair */}
      <div id="cross-v" className="absolute left-1/2 top-0 h-full w-px bg-white/10" />
      <div id="cross-h" className="absolute left-0 top-1/2 h-px w-full bg-white/10" />

      {/* scattered pills — full field on desktop, curated 12 on mobile;
          stacked ABOVE the card so the converge is always visible */}
      {list.map((p) => {
        const px = isMobile ? p.mx : p.x;
        const py = isMobile ? p.my : p.y;
        return (
          <span
            key={p.text + p.x + p.y}
            className={`pill absolute z-20 whitespace-nowrap rounded-[3px] font-mono uppercase ${
              p.size === "md" ? "px-2 py-[5px] text-[11px]" : "px-1.5 py-[3px] text-[9px]"
            }`}
            style={{
              left: `${px}%`,
              top: `${py}%`,
              backgroundColor: p.bg,
              color: p.fg ?? "#161616",
              letterSpacing: "0.02em",
            }}
          >
            {p.text}
          </span>
        );
      })}

      {/* center card — fixed 240px, transform-only motion (GPU smooth) */}
      <div className="absolute inset-0 z-10 flex items-center justify-center">
        <div id="card" className="relative h-60 w-60" style={{ backgroundColor: PAPER }}>
          {/* corner handles */}
          <span className="absolute -left-2 -top-2 h-4 w-4" style={{ backgroundColor: P.sky }} />
          <span className="absolute -right-2 -top-2 h-4 w-4" style={{ backgroundColor: P.pink }} />
          <span className="absolute -bottom-2 -left-2 h-4 w-4" style={{ backgroundColor: P.lavender }} />
          <span className="absolute -bottom-2 -right-2 h-4 w-4" style={{ backgroundColor: P.orange }} />
          <p
            id="card-text"
            className="p-4 font-sans text-[15px] leading-snug text-neutral-800"
          >
            Have an idea?
            <br />
            We&apos;ll make it real.
          </p>
        </div>
      </div>

      {/* hero reveal */}
      <div id="hero" className="absolute inset-0 z-30 flex items-center justify-center px-6">
        <div id="hero-inner" className="flex flex-col items-center text-center">
          <span className="mb-5 bg-black px-2 py-1 font-mono text-[10px] uppercase tracking-widest text-white">
            Simplicity
          </span>
          <h1 className="max-w-3xl font-sans text-3xl font-medium leading-[1.08] tracking-tight text-[#161616] md:text-6xl">
            Making the experience right
            <br />
            in the face — clear, direct, no fluff.
          </h1>
        </div>
      </div>

      {/* replay — lets you re-trigger the converge on demand */}
      <button
        onClick={replay}
        className="absolute bottom-5 right-5 z-50 rounded-[3px] border border-black/15 bg-white/70 px-3 py-1.5 font-mono text-[10px] uppercase tracking-widest text-black backdrop-blur transition hover:bg-black hover:text-white"
      >
        Replay ↻
      </button>
    </div>
  );
}
