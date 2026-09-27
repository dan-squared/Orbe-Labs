"use client";

import { useEffect, useRef } from "react";
import Image from "next/image";
import gsap from "gsap";
import { scrambleHover } from "@/lib/scramble";

const LINKS = [
  { label: "WORK", href: "#work", bg: "#5CB8DD" },
  { label: "SERVICES", href: "#services", bg: "#D497DC" },
  { label: "STUDIO", href: "#studio", bg: "#E3D92E" },
  { label: "JOURNAL", href: "#journal", bg: "#F1C83F" },
  { label: "CONTACT", href: "#contact", bg: "#FA7100" },
];

export default function Navbar() {
  const root = useRef<HTMLElement>(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      const pills = gsap.utils.toArray<HTMLElement>(".nav-pill");
      const logo = gsap.utils.toArray<HTMLElement>(".nav-logo");
      // Store final text for hover-scramble + start hidden (pre-intro).
      pills.forEach((el) => {
        el.dataset.final = el.textContent ?? "";
      });
      gsap.set(root.current, { opacity: 0, y: -14 });
      gsap.set(pills, { opacity: 0, y: -10, scale: 0.9 });
      gsap.set(logo, { opacity: 0, y: -12 });

      const show = () => {
        gsap.to(root.current, { opacity: 1, y: 0, duration: 0.4, ease: "power2.out" });
        gsap.to(logo, { opacity: 1, y: 0, duration: 0.45, ease: "power2.out" });
        gsap.to(pills, {
          opacity: 1,
          y: 0,
          scale: 1,
          duration: 0.45,
          ease: "back.out(2.2)",
          stagger: 0.07,
          delay: 0.15,
        });
      };
      const hide = () => {
        gsap.to([root.current, ...pills], {
          opacity: 0,
          y: -10,
          duration: 0.25,
          ease: "power2.in",
          overwrite: true,
        });
        gsap.to(logo, { opacity: 0, y: -12, duration: 0.25, ease: "power2.in", overwrite: true });
      };

      const onNav = () => show();
      const onStart = () => hide();
      window.addEventListener("intro:nav", onNav);
      window.addEventListener("intro:start", onStart);
      return () => {
        window.removeEventListener("intro:nav", onNav);
        window.removeEventListener("intro:start", onStart);
      };
    }, root);
    return () => ctx.revert();
  }, []);

  return (
    <header
      ref={root}
      className="pointer-events-none fixed inset-x-0 top-0 z-40 flex flex-col items-center gap-2 px-4 pt-6 sm:pt-8"
    >
      <a
        href="#top"
        aria-label="Orbe Labs home"
        className="nav-logo pointer-events-auto shrink-0 transition-transform duration-150 hover:scale-[1.06]"
      >
        <Image
          src="/logo.svg"
          alt="Orbe Labs"
          width={40}
          height={40}
          className="h-8 w-8 sm:h-9 sm:w-9"
          priority
        />
      </a>
      <nav
        aria-label="Primary"
        className="pointer-events-auto flex max-w-full flex-1 items-center justify-center gap-1.5 overflow-x-auto rounded-full px-2 py-1 sm:gap-2"
      >
        {LINKS.map((l) => (
          <a
            key={l.label}
            href={l.href}
            onPointerEnter={(e) => scrambleHover(e.currentTarget, 650)}
            className="nav-pill whitespace-nowrap rounded-[3px] px-2 py-[5px] font-mono text-[11px] uppercase tracking-wide text-[#161616] transition-transform duration-150 hover:-translate-y-0.5"
            style={{ backgroundColor: l.bg, letterSpacing: "0.02em" }}
          >
            {l.label}
          </a>
        ))}
      </nav>
    </header>
  );
}
