/**
 * MobileMenu — 모바일 햄버거 메뉴
 * Design: Mystic Veil Victorian Gothic
 */

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Menu, X, Moon } from "lucide-react";

const NAV_ITEMS = [
  { label: "Tarot", href: "#tarot" },
  { label: "Experience", href: "#experience" },
  { label: "Food", href: "#food" },
  { label: "Gallery", href: "#gallery" },
  { label: "About", href: "#about" },
  { label: "Community", href: "#community" },
  { label: "FAQ", href: "#faq" },
  { label: "Contact", href: "#contact" },
];

export default function MobileMenu() {
  const [open, setOpen] = useState(false);

  return (
    <div className="md:hidden">
      <button
        onClick={() => setOpen(true)}
        className="p-2 transition-colors"
        style={{ color: "#C9A96E" }}
        aria-label="메뉴 열기"
      >
        <Menu size={22} />
      </button>

      <AnimatePresence>
        {open && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
              className="fixed inset-0 z-50"
              style={{ backgroundColor: "rgba(58, 45, 52, 0.8)", backdropFilter: "blur(8px)" }}
              onClick={() => setOpen(false)}
            />

            {/* Menu panel */}
            <motion.div
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 50 }}
              transition={{ duration: 0.4, ease: [0.25, 0.46, 0.45, 0.94] }}
              className="fixed top-0 right-0 bottom-0 z-50 w-72 flex flex-col"
              style={{
                backgroundColor: "#3A2D34",
                borderLeft: "1px solid rgba(201, 169, 110, 0.2)",
              }}
            >
              {/* Close button */}
              <div className="flex justify-end p-5">
                <button
                  onClick={() => setOpen(false)}
                  className="p-2"
                  style={{ color: "#C9A96E" }}
                  aria-label="메뉴 닫기"
                >
                  <X size={22} />
                </button>
              </div>

              {/* Nav items */}
              <nav className="flex-1 flex flex-col items-center justify-center gap-8">
                {NAV_ITEMS.map((item, i) => (
                  <motion.a
                    key={item.href}
                    href={item.href}
                    onClick={() => setOpen(false)}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 + i * 0.05, duration: 0.4 }}
                    className="font-display text-lg tracking-[0.3em] uppercase transition-colors"
                    style={{ color: "#BEAEDB" }}
                  >
                    {item.label}
                  </motion.a>
                ))}
              </nav>

              {/* CTA */}
              <div className="p-8 text-center">
                <a
                  href="https://tally.so"
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={() => setOpen(false)}
                  className="inline-flex items-center gap-2 px-6 py-3 font-display text-sm tracking-[0.2em] uppercase"
                  style={{
                    backgroundColor: "#C9A96E",
                    color: "#3A2D34",
                  }}
                >
                  <Moon size={14} />
                  Reserve
                </a>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
