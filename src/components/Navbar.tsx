"use client";

import { useEffect, useLayoutEffect, useRef, useState } from "react";
import Image from "next/image";
import gsap from "gsap";
import { HugeiconsIcon } from "@hugeicons/react";
import { Cancel01Icon, Menu01Icon } from "@hugeicons/core-free-icons";
import { scrambleHover } from "@/lib/scramble";

const BIG_LINKS = [
  { label: "Selected work", href: "#work" },
  {
    label: "Book a call",
    href: "mailto:hello@orbelabs.agency?subject=Booking%20a%20call",
  },
  { label: "Get in touch", href: "mailto:hello@orbelabs.agency" },
];

export default function Navbar() {
  const root = useRef<HTMLElement>(null);
  const closedRow = useRef<HTMLDivElement>(null);
  const openCard = useRef<HTMLDivElement>(null);
  const [open, setOpen] = useState(false);

  // Intro show/hide.
  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.set(root.current, { opacity: 0, y: -14 });
      const show = () => {
        gsap.to(root.current, {
          opacity: 1,
          y: 0,
          duration: 0.4,
          ease: "power2.out",
          overwrite: true,
        });
      };
      const hide = () => {
        setOpen(false);
        gsap.to(root.current, {
          opacity: 0,
          y: -10,
          duration: 0.25,
          ease: "power2.in",
          overwrite: true,
        });
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

  // Closed chips <-> open card morph (same top-left origin).
  useLayoutEffect(() => {
    if (!closedRow.current || !openCard.current) return;
    if (open) {
      gsap.to(closedRow.current, {
        autoAlpha: 0,
        scale: 0.97,
        duration: 0.16,
        ease: "power2.in",
        overwrite: true,
      });
      gsap.fromTo(
        openCard.current,
        { autoAlpha: 0, y: -10, scale: 0.96 },
        {
          autoAlpha: 1,
          y: 0,
          scale: 1,
          duration: 0.38,
          delay: 0.08,
          ease: "power3.out",
          overwrite: true,
        }
      );
    } else {
      gsap.to(openCard.current, {
        autoAlpha: 0,
        y: -8,
        scale: 0.97,
        duration: 0.2,
        ease: "power2.in",
        overwrite: true,
      });
      gsap.to(closedRow.current, {
        autoAlpha: 1,
        scale: 1,
        duration: 0.3,
        delay: 0.08,
        ease: "power3.out",
        overwrite: true,
      });
    }
  }, [open ]);

  // Close on Escape.
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  return (
    <header ref={root} className="fixed inset-x-0 top-0 z-40">
      <div className="flex items-start justify-between gap-3 p-3 sm:p-4">
        {/* left cluster: chips morph into the open card */}
        <div className="relative">
          <div ref={closedRow} className="flex items-center gap-1.5">
            <a
              href="#top"
              aria-label="Orbe Labs home"
              className="flex h-11 items-center gap-2 rounded-md border border-[#E2DFD4] bg-white px-3 transition-transform duration-150 hover:scale-[1.03]"
            >
              <Image src="/logo.svg" alt="" width={24} height={24} className="h-5 w-5" />
              <span className="font-serif text-[19px] leading-none text-[#14213D]">
                Orbe Labs
              </span>
            </a>
            <button
              type="button"
              onClick={() => setOpen(true)}
              aria-expanded={open}
              aria-label="Open menu"
              className="flex h-11 w-11 items-center justify-center rounded-md border border-[#E2DFD4] bg-white text-[#14213D] transition-transform duration-150 hover:scale-[1.05]"
            >
              <HugeiconsIcon icon={Menu01Icon} size={20} />
            </button>
          </div>

          {/* open card: same surface, logo left + X right, no repeats */}
          <div
            ref={openCard}
            className="invisible absolute left-0 top-0 w-[300px] max-w-[calc(100vw-24px)] origin-top-left rounded-lg border border-[#E2DFD4] bg-white p-5 opacity-0"
          >
            <div className="flex items-center justify-between">
              <span className="flex items-center gap-2">
                <Image src="/logo.svg" alt="" width={24} height={24} className="h-5 w-5" />
                <span className="font-serif text-[19px] leading-none text-[#14213D]">
                  Orbe Labs
                </span>
              </span>
              <button
                type="button"
                onClick={() => setOpen(false)}
                aria-label="Close menu"
                className="flex h-8 w-8 items-center justify-center rounded-md text-[#14213D] transition-transform duration-150 hover:scale-110"
              >
                <HugeiconsIcon icon={Cancel01Icon} size={18} />
              </button>
            </div>

            <nav aria-label="Menu" className="mt-7 flex flex-col gap-1">
              {BIG_LINKS.map((l) => (
                <a
                  key={l.label}
                  href={l.href}
                  onClick={() => setOpen(false)}
                  className="w-max font-serif text-[23px] leading-[1.3] tracking-tight text-[#14213D] transition-transform duration-150 hover:-translate-y-0.5"
                >
                  {l.label}
                </a>
              ))}
            </nav>

            <div className="mt-8 flex gap-6">
              <div className="flex-1">
                <p className="font-mono text-[11px] uppercase tracking-widest text-[#5C6675]">
                  Connect
                </p>
                <ul className="mt-2.5 space-y-1.5">
                  {["LinkedIn", "X"].map((label) => (
                    <li key={label}>
                      <a
                        href="#"
                        onClick={() => setOpen(false)}
                        className="font-sans text-[16px] text-[#14213D] hover:underline"
                      >
                        {label}
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
              <div className="flex-1">
                <p className="font-mono text-[11px] uppercase tracking-widest text-[#5C6675]">
                  Locations
                </p>
                <ul className="mt-2.5 space-y-1.5 font-sans text-[16px] text-[#14213D]">
                  <li>New York</li>
                  <li>London</li>
                </ul>
              </div>
            </div>
          </div>
        </div>

        {/* right: book a call pill */}
        <a
          href="mailto:hello@orbelabs.agency?subject=Booking%20a%20call"
          className="flex h-11 shrink-0 items-center gap-2 rounded-md bg-[#2864DC] px-4 font-mono text-[11px] uppercase tracking-widest text-white transition-transform duration-150 hover:scale-[1.04]"
        >
          <span aria-hidden="true" className="inline-block h-2 w-2 rounded-full bg-white" />
          <span
            data-final="BOOK A CALL"
            onPointerEnter={(e) => scrambleHover(e.currentTarget, 650)}
          >
            Book a call
          </span>
        </a>
      </div>
    </header>
  );
}
