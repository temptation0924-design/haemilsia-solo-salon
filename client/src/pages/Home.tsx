/**
 * Haemilsia Solo Salon — 홈페이지
 * Design: "Mystic Veil" — Victorian Gothic Salon
 * Colors: Jacarta #3F2A52, Dark Blue-Gray #75619D, Wisteria #BEAEDB,
 *         Bright Gray #E6EFF7, Black Coffee #3A2D34, Gold #C9A96E
 *
 * Section Order (V8 — 설득 흐름):
 * Hero → About(여성) → Tarot → Host(남성배너) → Experience → Rules → Gallery → Pricing → Community → Food → Recruit → FAQ → Contact → Footer
 */

import { useEffect, useRef, useState, useCallback } from "react";
import { motion, useInView, useScroll, useTransform } from "framer-motion";
import { Moon, Clock, Users, ShieldCheck, MapPin, Phone, Instagram, MessageCircle, Sparkles, Star, UtensilsCrossed, Gift, Truck } from "lucide-react";
import MobileMenu from "@/components/MobileMenu";

/* ─── Asset URLs ─── */
const ASSETS = {
  heroBanner: "https://d2xsxph8kpxj0f.cloudfront.net/310519663221473285/SPB73dFU3nqewnEHXzCYYq/hero-banner-UYtwdmckUER4LsgPyFwWcS.png",
  sessionFlow: "https://d2xsxph8kpxj0f.cloudfront.net/310519663221473285/SPB73dFU3nqewnEHXzCYYq/session-flow-eZFE7aWHc8FZzAMZEVFpFd.webp",
  divider: "https://d2xsxph8kpxj0f.cloudfront.net/310519663221473285/SPB73dFU3nqewnEHXzCYYq/divider-ornament-mpVWPJiYTShQ7mHD5z8jiL.png",
  rulesBg: "https://d2xsxph8kpxj0f.cloudfront.net/310519663221473285/SPB73dFU3nqewnEHXzCYYq/rules-bg-RyvraoUxWA5ZjUwM2EBahC.webp",
  heroMoon: "/manus-storage/hero-moon_594932ac.jpeg",
  chairPurple: "/manus-storage/chair-purple_11139c89.jpeg",
  galleryWall: "/manus-storage/gallery-wall_324da00f.jpeg",
  constellation: "/manus-storage/constellation_003b70e4.jpeg",
  sofaPurple: "/manus-storage/sofa-purple_9d60bb55.jpeg",
  chairPink: "/manus-storage/chair-pink_a25e0231.jpeg",
  flowersSofa: "/manus-storage/flowers-sofa_f7a0941d.jpeg",
  purpleGoldSofa: "/manus-storage/purple-gold-sofa_99c9246b.jpeg",
  tarotWheel: "/manus-storage/tarot-wheel_dfc44dce.jpeg",
  tarotCards: "/manus-storage/tarot-cards_f00a0030.jpeg",
  purpleSalon: "/manus-storage/purple-salon_3185f3a6.jpeg",
  /* AI-generated images */
  maleHostBanner: "/manus-storage/male-tarot-host-banner-v2_05cc3608.png",
  maleHostAbout: "/manus-storage/male-tarot-host-about-v2_1fcd5c56.png",
  femaleAbout: "https://d2xsxph8kpxj0f.cloudfront.net/310519663221473285/SPB73dFU3nqewnEHXzCYYq/female-tarot-about-GHRqXMDhfW2t8Ki2YEepzx.webp",
  tarotSoloDrink1: "/manus-storage/tarot-solo-drink-1_792c15e9.png",
  tarotSoloDrink2: "/manus-storage/tarot-solo-drink-2_81ac5f34.png",
  tarotSocialGathering: "/manus-storage/tarot-social-gathering_db70132d.png",
  tarotCardsCloseup: "/manus-storage/tarot-cards-closeup_6988dcc9.png",
  /* Session Phase Images */
  sessionWelcome: "https://d2xsxph8kpxj0f.cloudfront.net/310519663221473285/SPB73dFU3nqewnEHXzCYYq/session-welcome-DKLdikibznq4gqyu7TSjYQ.webp",
  sessionDeepTalk: "https://d2xsxph8kpxj0f.cloudfront.net/310519663221473285/SPB73dFU3nqewnEHXzCYYq/session-deeptalk-AVbMmYanCv9tD23PLiFq93.webp",
  sessionReflection: "https://d2xsxph8kpxj0f.cloudfront.net/310519663221473285/SPB73dFU3nqewnEHXzCYYq/session-reflection-ER3NojdyVhUQa4UQwXpuNw.webp",
  /* Food Showcase */
  foodShowcase: "https://d2xsxph8kpxj0f.cloudfront.net/310519663221473285/SPB73dFU3nqewnEHXzCYYq/food-showcase-QCk8E8Av49ChJuJ2VDjxax.png",
  foodSharing: "https://d2xsxph8kpxj0f.cloudfront.net/310519663221473285/SPB73dFU3nqewnEHXzCYYq/food-sharing-concept-QEJchY3PyvHWCJKJHLuVTp.webp",
};

/* ─── Reusable Components ─── */

function FadeInSection({ children, className = "", delay = 0 }: {
  children: React.ReactNode;
  className?: string;
  delay?: number;
}) {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-80px" });
  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 40 }}
      animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 40 }}
      transition={{ duration: 1, delay, ease: [0.25, 0.46, 0.45, 0.94] }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

function GoldDivider({ className = "" }: { className?: string }) {
  return (
    <div className={`flex justify-center py-8 ${className}`}>
      <img
        src={ASSETS.divider}
        alt=""
        className="w-64 sm:w-80 md:w-96 opacity-60"
        loading="lazy"
      />
    </div>
  );
}

function SectionTitle({ sub, main, desc }: { sub: string; main: string; desc?: string }) {
  return (
    <div className="text-center mb-12 md:mb-16">
      <p className="font-display text-sm md:text-base tracking-[0.3em] uppercase mb-3"
         style={{ color: "#C9A96E" }}>
        {sub}
      </p>
      <h2 className="font-serif-kr text-2xl md:text-4xl font-light mb-4"
          style={{ color: "#E6EFF7" }}>
        {main}
      </h2>
      {desc && (
        <p className="font-sans-kr text-sm md:text-base font-light max-w-xl mx-auto leading-relaxed"
           style={{ color: "#BEAEDB" }}>
          {desc}
        </p>
      )}
    </div>
  );
}

/* ─── Floating Tarot Card Particles ─── */
function TarotParticles() {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {[...Array(6)].map((_, i) => (
        <motion.div
          key={i}
          className="absolute"
          style={{
            left: `${15 + i * 14}%`,
            top: `${10 + (i % 3) * 30}%`,
          }}
          animate={{
            y: [0, -20, 0],
            opacity: [0.1, 0.25, 0.1],
            rotate: [0, 5, -5, 0],
          }}
          transition={{
            duration: 6 + i * 0.8,
            repeat: Infinity,
            delay: i * 1.2,
            ease: "easeInOut",
          }}
        >
          <Sparkles size={12 + i * 2} style={{ color: "#C9A96E" }} />
        </motion.div>
      ))}
    </div>
  );
}

/* ─── Mouse-reactive Gold Particles ─── */
function MouseGoldParticles() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const particles = useRef<Array<{ x: number; y: number; vx: number; vy: number; life: number; size: number; opacity: number }>>([]);
  const mouse = useRef({ x: 0, y: 0 });
  const animRef = useRef<number>(0);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    resize();
    window.addEventListener("resize", resize);

    const handleMove = (e: MouseEvent) => {
      mouse.current = { x: e.clientX, y: e.clientY };
      for (let i = 0; i < 2; i++) {
        particles.current.push({
          x: e.clientX + (Math.random() - 0.5) * 10,
          y: e.clientY + (Math.random() - 0.5) * 10,
          vx: (Math.random() - 0.5) * 1.5,
          vy: (Math.random() - 0.5) * 1.5 - 0.5,
          life: 1,
          size: Math.random() * 3 + 1,
          opacity: Math.random() * 0.5 + 0.5,
        });
      }
    };
    window.addEventListener("mousemove", handleMove);

    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      particles.current = particles.current.filter((p) => p.life > 0);
      particles.current.forEach((p) => {
        p.x += p.vx;
        p.y += p.vy;
        p.life -= 0.015;
        p.opacity = p.life * 0.6;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(201, 169, 110, ${p.opacity})`;
        ctx.fill();
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size * 2, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(201, 169, 110, ${p.opacity * 0.15})`;
        ctx.fill();
      });
      animRef.current = requestAnimationFrame(animate);
    };
    animate();

    return () => {
      window.removeEventListener("resize", resize);
      window.removeEventListener("mousemove", handleMove);
      cancelAnimationFrame(animRef.current);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 z-[9999] pointer-events-none hidden md:block"
      style={{ mixBlendMode: "screen" }}
    />
  );
}

/* ─── Tarot Card Draw Mini-Game ─── */
const TAROT_CARDS = [
  { name: "The Fool", nameKr: "바보", meaning: "새로운 시작, 순수한 모험의 에너지가 당신을 기다립니다.", emoji: "0" },
  { name: "The Magician", nameKr: "마법사", meaning: "당신 안에 이미 모든 도구가 있습니다. 의지를 행동으로 옮기세요.", emoji: "I" },
  { name: "The High Priestess", nameKr: "여사제", meaning: "직감을 믿으세요. 보이지 않는 곳에 답이 있습니다.", emoji: "II" },
  { name: "The Empress", nameKr: "여황제", meaning: "풍요와 사랑의 에너지가 당신을 감싸고 있습니다.", emoji: "III" },
  { name: "The Emperor", nameKr: "황제", meaning: "안정과 질서의 힘으로 목표를 이루어 나갈 때입니다.", emoji: "IV" },
  { name: "The Lovers", nameKr: "연인", meaning: "진정한 선택의 순간. 마음이 이끄는 방향을 따르세요.", emoji: "VI" },
  { name: "The Chariot", nameKr: "전차", meaning: "강한 의지와 결단력으로 승리를 향해 나아가세요.", emoji: "VII" },
  { name: "Strength", nameKr: "힘", meaning: "부드러운 용기가 당신의 가장 큰 무기입니다.", emoji: "VIII" },
  { name: "The Hermit", nameKr: "은둔자", meaning: "혼자만의 시간이 가장 깊은 지혜를 선물합니다.", emoji: "IX" },
  { name: "Wheel of Fortune", nameKr: "운명의 수레바퀴", meaning: "변화의 바람이 불고 있습니다. 흐름에 몸을 맡기세요.", emoji: "X" },
  { name: "The Star", nameKr: "별", meaning: "희망의 빛이 당신을 비추고 있습니다. 꿈을 놓지 마세요.", emoji: "XVII" },
  { name: "The Moon", nameKr: "달", meaning: "무의식의 세계가 열리고 있습니다. 두려움 너머의 진실을 보세요.", emoji: "XVIII" },
  { name: "The Sun", nameKr: "태양", meaning: "밝은 에너지와 기쁨이 가득한 시간이 다가옵니다.", emoji: "XIX" },
  { name: "The World", nameKr: "세계", meaning: "하나의 여정이 완성됩니다. 새로운 장이 시작될 준비를 하세요.", emoji: "XXI" },
];

function TarotCardDraw() {
  const [drawn, setDrawn] = useState(false);
  const [flipping, setFlipping] = useState(false);
  const [card, setCard] = useState(TAROT_CARDS[0]);
  const [hovering, setHovering] = useState(false);

  const drawCard = useCallback(() => {
    if (flipping) return;
    setFlipping(true);
    setDrawn(false);
    const randomCard = TAROT_CARDS[Math.floor(Math.random() * TAROT_CARDS.length)];
    setCard(randomCard);
    setTimeout(() => {
      setDrawn(true);
      setFlipping(false);
    }, 800);
  }, [flipping]);

  return (
    <div className="text-center">
      <div
        className="relative mx-auto cursor-pointer"
        style={{ width: 220, height: 340, perspective: 1000 }}
        onClick={drawCard}
        onMouseEnter={() => setHovering(true)}
        onMouseLeave={() => setHovering(false)}
      >
        <motion.div
          className="relative w-full h-full"
          style={{ transformStyle: "preserve-3d" }}
          animate={{
            rotateY: drawn ? 180 : 0,
            scale: hovering && !drawn ? 1.05 : 1,
          }}
          transition={{ duration: 0.8, ease: "easeInOut" }}
        >
          {/* Card Back */}
          <div
            className="absolute inset-0 flex flex-col items-center justify-center"
            style={{
              backfaceVisibility: "hidden",
              background: "linear-gradient(135deg, #3F2A52 0%, #2D2128 50%, #3F2A52 100%)",
              border: "2px solid #C9A96E",
              boxShadow: hovering ? "0 0 30px rgba(201,169,110,0.4)" : "0 0 15px rgba(201,169,110,0.15)",
            }}
          >
            <div className="w-[180px] h-[300px] flex flex-col items-center justify-center"
                 style={{ border: "1px solid rgba(201,169,110,0.3)" }}>
              <motion.div
                animate={{ rotate: [0, 360] }}
                transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
              >
                <Star size={40} style={{ color: "#C9A96E" }} />
              </motion.div>
              <p className="font-display text-xs tracking-[0.3em] mt-4 uppercase" style={{ color: "#C9A96E" }}>
                Draw a Card
              </p>
            </div>
          </div>

          {/* Card Front */}
          <div
            className="absolute inset-0 flex flex-col items-center justify-center p-6"
            style={{
              backfaceVisibility: "hidden",
              transform: "rotateY(180deg)",
              background: "linear-gradient(135deg, #2D2128 0%, #3F2A52 50%, #2D2128 100%)",
              border: "2px solid #C9A96E",
              boxShadow: "0 0 30px rgba(201,169,110,0.3)",
            }}
          >
            <p className="font-display text-3xl mb-1" style={{ color: "#C9A96E" }}>{card.emoji}</p>
            <p className="font-display text-sm tracking-widest uppercase mb-1" style={{ color: "#E6EFF7" }}>
              {card.name}
            </p>
            <p className="font-serif-kr text-base mb-4" style={{ color: "#C9A96E" }}>
              {card.nameKr}
            </p>
            <div className="w-12 h-px mb-4" style={{ backgroundColor: "rgba(201,169,110,0.4)" }} />
            <p className="font-sans-kr text-xs font-light leading-relaxed" style={{ color: "#BEAEDB" }}>
              {card.meaning}
            </p>
          </div>
        </motion.div>
      </div>

      {drawn && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="mt-6 space-y-3"
        >
          <button
            onClick={drawCard}
            className="font-display text-xs tracking-widest uppercase px-6 py-2 transition-all duration-300 hover:scale-105"
            style={{ border: "1px solid rgba(201,169,110,0.4)", color: "#C9A96E", backgroundColor: "transparent" }}
          >
            Draw Again
          </button>
          <p className="font-sans-kr text-xs font-light" style={{ color: "rgba(190,174,219,0.6)" }}>
            더 깊은 이야기가 궁금하다면
          </p>
          <a
            href="https://tally.so"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-block font-display text-xs tracking-widest uppercase px-8 py-3 transition-all duration-300 hover:scale-105"
            style={{ backgroundColor: "#C9A96E", color: "#3A2D34" }}
          >
            세션 예약하기
          </a>
        </motion.div>
      )}

      {!drawn && !flipping && (
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="mt-6 font-sans-kr text-xs font-light"
          style={{ color: "rgba(190,174,219,0.5)" }}
        >
          카드를 클릭하여 오늘의 메시지를 확인하세요
        </motion.p>
      )}
    </div>
  );
}

/* ─── Countdown Timer ─── */
function CountdownTimer({ targetDate }: { targetDate: Date }) {
  const [timeLeft, setTimeLeft] = useState({ days: 0, hours: 0, minutes: 0, seconds: 0 });

  useEffect(() => {
    const calc = () => {
      const now = new Date().getTime();
      const diff = targetDate.getTime() - now;
      if (diff <= 0) {
        setTimeLeft({ days: 0, hours: 0, minutes: 0, seconds: 0 });
        return;
      }
      setTimeLeft({
        days: Math.floor(diff / (1000 * 60 * 60 * 24)),
        hours: Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
        minutes: Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60)),
        seconds: Math.floor((diff % (1000 * 60)) / 1000),
      });
    };
    calc();
    const timer = setInterval(calc, 1000);
    return () => clearInterval(timer);
  }, [targetDate]);

  const units = [
    { label: "DAYS", value: timeLeft.days },
    { label: "HRS", value: timeLeft.hours },
    { label: "MIN", value: timeLeft.minutes },
    { label: "SEC", value: timeLeft.seconds },
  ];

  return (
    <div className="flex items-center justify-center gap-3 md:gap-4">
      {units.map((u, i) => (
        <div key={u.label} className="flex items-center gap-3 md:gap-4">
          <div className="text-center">
            <div
              className="font-display text-2xl md:text-4xl tracking-wider w-14 md:w-20 py-2 md:py-3"
              style={{
                color: "#C9A96E",
                backgroundColor: "rgba(63, 42, 82, 0.6)",
                border: "1px solid rgba(201, 169, 110, 0.2)",
              }}
            >
              {String(u.value).padStart(2, "0")}
            </div>
            <p className="font-display text-[9px] md:text-[10px] tracking-[0.2em] mt-1" style={{ color: "rgba(190,174,219,0.5)" }}>
              {u.label}
            </p>
          </div>
          {i < units.length - 1 && (
            <span className="font-display text-lg md:text-2xl" style={{ color: "rgba(201,169,110,0.4)" }}>:</span>
          )}
        </div>
      ))}
    </div>
  );
}

/* ─── FAQ Accordion Item ─── */
function FAQItem({ question, answer }: { question: string; answer: string }) {
  const [open, setOpen] = useState(false);
  return (
    <div
      className="overflow-hidden transition-all duration-300"
      style={{
        backgroundColor: open ? "rgba(63, 42, 82, 0.5)" : "rgba(63, 42, 82, 0.25)",
        border: `1px solid ${open ? "rgba(201, 169, 110, 0.35)" : "rgba(201, 169, 110, 0.12)"}`,
      }}
    >
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between px-6 py-5 text-left group"
      >
        <span
          className="font-serif-kr text-sm md:text-base font-light pr-4 transition-colors duration-300"
          style={{ color: open ? "#E6EFF7" : "#BEAEDB" }}
        >
          {question}
        </span>
        <motion.span
          animate={{ rotate: open ? 45 : 0 }}
          transition={{ duration: 0.3 }}
          className="flex-shrink-0 w-6 h-6 flex items-center justify-center"
          style={{ color: "#C9A96E" }}
        >
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
            <line x1="7" y1="0" x2="7" y2="14" stroke="currentColor" strokeWidth="1.5" />
            <line x1="0" y1="7" x2="14" y2="7" stroke="currentColor" strokeWidth="1.5" />
          </svg>
        </motion.span>
      </button>
      <motion.div
        initial={false}
        animate={{
          height: open ? "auto" : 0,
          opacity: open ? 1 : 0,
        }}
        transition={{ duration: 0.35, ease: [0.25, 0.46, 0.45, 0.94] }}
        className="overflow-hidden"
      >
        <div className="px-6 pb-5">
          <div className="w-full h-px mb-4" style={{ backgroundColor: "rgba(201, 169, 110, 0.15)" }} />
          <p
            className="font-sans-kr text-sm font-light leading-relaxed"
            style={{ color: "#BEAEDB" }}
          >
            {answer}
          </p>
        </div>
      </motion.div>
    </div>
  );
}

/* ─── Main Page ─── */
export default function Home() {
  const [scrolled, setScrolled] = useState(false);
  const heroRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: heroRef,
    offset: ["start start", "end start"],
  });
  const heroOpacity = useTransform(scrollYProgress, [0, 1], [1, 0]);
  const heroScale = useTransform(scrollYProgress, [0, 1], [1, 1.1]);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 60);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <div className="min-h-screen" style={{ backgroundColor: "#3A2D34" }}>
      <MouseGoldParticles />

      {/* ═══════════════════════════════════════════
          NAVIGATION
      ═══════════════════════════════════════════ */}
      <nav
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-700 ${
          scrolled
            ? "py-3 backdrop-blur-xl"
            : "py-5"
        }`}
        style={{
          backgroundColor: scrolled ? "rgba(58, 45, 52, 0.9)" : "transparent",
          borderBottom: scrolled ? "1px solid rgba(201, 169, 110, 0.15)" : "none",
        }}
      >
        <div className="container flex items-center justify-between">
          <a href="#" className="flex items-center gap-2">
            <Moon size={18} style={{ color: "#C9A96E" }} />
            <span className="font-display text-lg md:text-xl tracking-wider"
                  style={{ color: "#E6EFF7" }}>
              Haemilsia <span className="italic" style={{ color: "#C9A96E" }}>Solo Salon</span>
            </span>
          </a>
          <div className="hidden md:flex items-center gap-8">
            {[
              { label: "About", href: "#about" },
              { label: "Tarot", href: "#tarot" },
              { label: "Experience", href: "#experience" },
              { label: "Gallery", href: "#gallery" },
              { label: "Pricing", href: "#pricing" },
              { label: "Community", href: "#community" },
              { label: "FAQ", href: "#faq" },
              { label: "Contact", href: "#contact" },
            ].map((item) => (
              <a
                key={item.href}
                href={item.href}
                className="font-display text-sm tracking-widest uppercase transition-colors duration-300 hover:opacity-100 opacity-70"
                style={{ color: "#BEAEDB" }}
              >
                {item.label}
              </a>
            ))}
          </div>
          <a
            href="https://tally.so"
            target="_blank"
            rel="noopener noreferrer"
            className="hidden md:inline-block px-5 py-2 text-xs tracking-[0.2em] uppercase font-display transition-all duration-300 hover:scale-105"
            style={{
              border: "1px solid rgba(201, 169, 110, 0.5)",
              color: "#C9A96E",
              backgroundColor: "rgba(201, 169, 110, 0.08)",
            }}
          >
            Reserve
          </a>
          <MobileMenu />
        </div>
      </nav>

      {/* ═══════════════════════════════════════════
          1. HERO SECTION — 첫인상, 호기심 유발
      ═══════════════════════════════════════════ */}
      <section ref={heroRef} className="relative h-screen overflow-hidden">
        <motion.div
          style={{ opacity: heroOpacity, scale: heroScale }}
          className="absolute inset-0"
        >
          <img
            src={ASSETS.heroBanner}
            alt="Haemilsia Solo Salon"
            className="w-full h-full object-cover"
          />
          <div
            className="absolute inset-0"
            style={{
              background: "linear-gradient(to bottom, rgba(58,45,52,0.3) 0%, rgba(58,45,52,0.1) 40%, rgba(58,45,52,0.6) 80%, rgba(58,45,52,1) 100%)",
            }}
          />
        </motion.div>

        <div className="relative z-10 h-full flex flex-col items-center justify-center text-center px-4">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1.5, delay: 0.3 }}
          >
            <p className="font-display text-sm md:text-base tracking-[0.4em] uppercase mb-6"
               style={{ color: "#C9A96E" }}>
              A Private Salon for One
            </p>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1.5, delay: 0.6 }}
            className="font-serif-kr text-3xl sm:text-4xl md:text-6xl lg:text-7xl font-light leading-tight mb-6"
            style={{ color: "#E6EFF7" }}
          >
            혼자 오는 사람만 받는
            <br />
            <span className="font-display italic text-4xl sm:text-5xl md:text-7xl lg:text-8xl"
                  style={{ color: "#C9A96E" }}>
              작은 술집
            </span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1.5, delay: 0.9 }}
            className="font-sans-kr text-sm md:text-base font-light max-w-md leading-relaxed mb-10"
            style={{ color: "#BEAEDB" }}
          >
            타로와 대화가 있는 90분의 프라이빗 세션.
            <br />
            오늘 밤, 당신만을 위한 자리를 마련합니다.
          </motion.p>

          <motion.a
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1.5, delay: 1.2 }}
            href="https://tally.so"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-block px-10 py-4 font-display text-sm tracking-[0.3em] uppercase transition-all duration-500 hover:scale-105"
            style={{
              backgroundColor: "#C9A96E",
              color: "#3A2D34",
            }}
          >
            예약 대기 신청
          </motion.a>
        </div>

        {/* Scroll indicator */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 2, duration: 1 }}
          className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2"
        >
          <span className="font-display text-xs tracking-[0.3em] uppercase" style={{ color: "rgba(201,169,110,0.5)" }}>
            Scroll
          </span>
          <motion.div
            animate={{ y: [0, 8, 0] }}
            transition={{ repeat: Infinity, duration: 2, ease: "easeInOut" }}
            className="w-px h-8"
            style={{ backgroundColor: "rgba(201,169,110,0.3)" }}
          />
        </motion.div>
      </section>

      {/* ═══════════════════════════════════════════
          2. ABOUT — 공감/문제 제기 (여성 이미지)
      ═══════════════════════════════════════════ */}
      <section id="about" className="relative py-24 md:py-32" style={{ backgroundColor: "#3A2D34" }}>
        <div className="container">
          <FadeInSection>
            <SectionTitle
              sub="Why Solo Salon"
              main="혼자라서 더 깊은 대화"
              desc="때로는 혼자일 때, 가장 솔직한 이야기가 시작됩니다."
            />
          </FadeInSection>

          <div className="grid md:grid-cols-2 gap-8 md:gap-16 items-center max-w-5xl mx-auto">
            <FadeInSection delay={0.2}>
              <div className="relative">
                <div className="absolute -inset-4 opacity-20 blur-2xl" style={{ backgroundColor: "#3F2A52" }} />
                <img
                  src={ASSETS.femaleAbout}
                  alt="타로를 보며 혼술하는 모습"
                  className="relative w-full aspect-[3/4] object-cover"
                  style={{ border: "1px solid rgba(201, 169, 110, 0.2)" }}
                  loading="lazy"
                />
              </div>
            </FadeInSection>

            <FadeInSection delay={0.4}>
              <div className="space-y-6">
                <blockquote
                  className="font-serif-kr text-lg md:text-xl font-light leading-relaxed pl-6"
                  style={{
                    color: "#E6EFF7",
                    borderLeft: "2px solid #C9A96E",
                  }}
                >
                  "오늘 하루, 아무에게도 말 못 한 이야기가 있으신가요?"
                </blockquote>

                <p className="font-sans-kr text-sm md:text-base font-light leading-[1.9]"
                   style={{ color: "#BEAEDB" }}>
                  친구에게도, 가족에게도 쉽게 꺼내지 못하는 마음이 있습니다.
                  술 한 잔의 용기가 필요한 밤, 낯선 공간에서 낯선 사람과 나누는
                  대화는 때로 가장 진솔한 위로가 됩니다.
                </p>

                <p className="font-sans-kr text-sm md:text-base font-light leading-[1.9]"
                   style={{ color: "#BEAEDB" }}>
                  Haemilsia Solo Salon은 <strong style={{ color: "#C9A96E", fontWeight: 400 }}>혼자 오는 사람만을 위한 프라이빗 공간</strong>입니다.
                  타로 리딩과 함께하는 90분의 세션 동안,
                  바텐더이자 상담사인 호스트가 당신의 이야기에 귀 기울입니다.
                </p>

                <div className="flex items-center gap-4 pt-4">
                  <div className="w-12 h-px" style={{ backgroundColor: "#C9A96E" }} />
                  <span className="font-display text-xs tracking-[0.3em] uppercase" style={{ color: "#C9A96E" }}>
                    100% Reservation Only
                  </span>
                </div>
              </div>
            </FadeInSection>
          </div>
        </div>
      </section>

      <GoldDivider />

      {/* ═══════════════════════════════════════════
          3. TAROT — 해결책 제시 (타로 리딩)
      ═══════════════════════════════════════════ */}
      <section id="tarot" className="relative py-24 md:py-32 overflow-hidden" style={{ backgroundColor: "#2D2128" }}>
        <TarotParticles />
        <div className="relative z-10 container">
          <FadeInSection>
            <SectionTitle
              sub="Tarot Reading"
              main="카드가 들려주는 이야기"
              desc="타로는 점이 아닙니다. 당신의 마음을 비추는 거울입니다."
            />
          </FadeInSection>

          <div className="grid md:grid-cols-3 gap-6 md:gap-8 max-w-5xl mx-auto mb-16">
            {[
              {
                icon: <Sparkles size={24} />,
                title: "마음의 거울",
                desc: "타로 카드는 무의식 속 감정과 생각을 표면으로 끌어올립니다. 스스로도 몰랐던 마음을 발견하게 됩니다.",
              },
              {
                icon: <Moon size={24} />,
                title: "대화의 매개",
                desc: "카드 한 장이 열어주는 이야기의 문. 어색한 침묵 없이, 자연스럽게 깊은 대화가 시작됩니다.",
              },
              {
                icon: <Star size={24} />,
                title: "오늘의 메시지",
                desc: "세션이 끝나면 오늘의 카드 한 장을 기념으로 드립니다. 당신만의 메시지를 간직하세요.",
              },
            ].map((item, i) => (
              <FadeInSection key={item.title} delay={0.15 * i}>
                <div
                  className="p-8 text-center h-full transition-all duration-500 hover:translate-y-[-4px]"
                  style={{
                    backgroundColor: "rgba(63, 42, 82, 0.4)",
                    border: "1px solid rgba(201, 169, 110, 0.15)",
                  }}
                >
                  <div className="inline-flex items-center justify-center w-14 h-14 mb-5"
                       style={{ color: "#C9A96E", border: "1px solid rgba(201, 169, 110, 0.3)" }}>
                    {item.icon}
                  </div>
                  <h3 className="font-serif-kr text-lg mb-3" style={{ color: "#E6EFF7" }}>
                    {item.title}
                  </h3>
                  <p className="font-sans-kr text-sm font-light leading-relaxed" style={{ color: "#BEAEDB" }}>
                    {item.desc}
                  </p>
                </div>
              </FadeInSection>
            ))}
          </div>

          {/* Tarot Cards Closeup */}
          <FadeInSection delay={0.3}>
            <div className="max-w-4xl mx-auto grid grid-cols-2 gap-4">
              <div className="relative overflow-hidden" style={{ border: "1px solid rgba(201, 169, 110, 0.15)" }}>
                <img
                  src={ASSETS.tarotCardsCloseup}
                  alt="타로 카드"
                  className="w-full aspect-[4/3] object-cover"
                  loading="lazy"
                />
              </div>
              <div className="relative overflow-hidden" style={{ border: "1px solid rgba(201, 169, 110, 0.15)" }}>
                <img
                  src={ASSETS.tarotWheel}
                  alt="타로 카드 배열"
                  className="w-full aspect-[4/3] object-cover"
                  loading="lazy"
                />
              </div>
            </div>
          </FadeInSection>

          {/* Tarot Card Draw Mini-Game */}
          <FadeInSection delay={0.4}>
            <div className="mt-16 md:mt-20">
              <div className="text-center mb-8">
                <p className="font-display text-sm tracking-[0.3em] uppercase mb-2" style={{ color: "#C9A96E" }}>
                  Today's Card
                </p>
                <h3 className="font-serif-kr text-xl md:text-2xl font-light" style={{ color: "#E6EFF7" }}>
                  오늘의 카드를 뽑아보세요
                </h3>
              </div>
              <TarotCardDraw />
            </div>
          </FadeInSection>
        </div>
      </section>

      <GoldDivider />

      {/* ═══════════════════════════════════════════
          4. HOST — 호스트 소개로 신뢰 구축 (남성 배너)
      ═══════════════════════════════════════════ */}
      <section className="relative py-24 md:py-32 overflow-hidden" style={{ backgroundColor: "#2D2128" }}>
        <div className="absolute inset-0">
          <img
            src={ASSETS.maleHostBanner}
            alt="타로 상담사"
            className="w-full h-full object-cover object-top"
            loading="lazy"
          />
          <div
            className="absolute inset-0"
            style={{
              background: "linear-gradient(to right, rgba(45,33,40,0.85) 0%, rgba(45,33,40,0.5) 50%, rgba(45,33,40,0.85) 100%)",
            }}
          />
          <div
            className="absolute inset-0"
            style={{
              background: "linear-gradient(to bottom, rgba(45,33,40,0.3) 0%, rgba(45,33,40,0.7) 100%)",
            }}
          />
        </div>

        <div className="relative z-10 container">
          <FadeInSection>
            <div className="max-w-2xl">
              <p className="font-display text-sm tracking-[0.3em] uppercase mb-4" style={{ color: "#C9A96E" }}>
                Private Tarot Session
              </p>
              <h2 className="font-serif-kr text-2xl md:text-4xl font-light leading-snug mb-6" style={{ color: "#E6EFF7" }}>
                한 잔의 술, 한 장의 카드,
                <br />
                그리고 당신의 이야기
              </h2>
              <p className="font-sans-kr text-sm md:text-base font-light leading-[1.9] mb-8" style={{ color: "#BEAEDB" }}>
                호스트는 바텐더이자 타로 리더입니다.
                당신의 이야기에 귀 기울이고, 카드가 전하는 메시지를 함께 읽어드립니다.
                판단 없이, 조언 없이, 오직 경청과 공감으로 채워지는 시간.
              </p>
              <a
                href="https://tally.so"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-block px-8 py-3.5 font-display text-sm tracking-[0.2em] uppercase transition-all duration-300 hover:scale-105"
                style={{
                  backgroundColor: "#C9A96E",
                  color: "#3A2D34",
                }}
              >
                예약 대기 신청
              </a>
            </div>
          </FadeInSection>
        </div>
      </section>

      <GoldDivider />

      {/* ═══════════════════════════════════════════
          5. EXPERIENCE — 세션 흐름 체험 안내
      ═══════════════════════════════════════════ */}
      <section id="experience" className="relative py-24 md:py-32" style={{ backgroundColor: "#3F2A52" }}>
        <div className="container">
          <FadeInSection>
            <SectionTitle
              sub="The Session"
              main="90분의 여정"
              desc="세 가지 시간으로 구성된 당신만의 프라이빗 세션"
            />
          </FadeInSection>

          {/* Session Flow Illustration */}
          <FadeInSection delay={0.2}>
            <div className="max-w-4xl mx-auto mb-16">
              <img
                src={ASSETS.sessionFlow}
                alt="세션 흐름"
                className="w-full rounded-sm"
                style={{ border: "1px solid rgba(201, 169, 110, 0.2)" }}
                loading="lazy"
              />
            </div>
          </FadeInSection>

          {/* Three phases */}
          <div className="grid md:grid-cols-3 gap-6 md:gap-8 max-w-5xl mx-auto">
            {[
              {
                phase: "01",
                title: "Welcome",
                titleKr: "환영의 시간",
                duration: "20분",
                desc: "시그니처 웰컴 한 잔과 함께 긴장을 풀어드립니다. 위스키, 와인, 소주, 맥주 중 원하시는 잔술을 고르고, 타로 카드 선택으로 오늘 밤의 테마를 정합니다.",
                image: ASSETS.sessionWelcome,
              },
              {
                phase: "02",
                title: "Deep Talk",
                titleKr: "깊은 대화",
                duration: "50분",
                desc: "타로 리딩을 매개로 자연스럽게 대화가 시작됩니다. 호스트가 당신의 이야기에 진심으로 귀 기울이며, 함께 의미를 찾아갑니다.",
                image: ASSETS.sessionDeepTalk,
              },
              {
                phase: "03",
                title: "Reflection",
                titleKr: "성찰의 시간",
                duration: "20분",
                desc: "마무리 한 잔과 함께 오늘의 대화를 되짚어봅니다. 작은 타로 카드 한 장을 기념으로 가져가실 수 있습니다.",
                image: ASSETS.sessionReflection,
              },
            ].map((item, i) => (
              <FadeInSection key={item.phase} delay={0.2 + i * 0.15}>
                <div
                  className="relative group overflow-hidden h-full"
                  style={{
                    backgroundColor: "rgba(58, 45, 52, 0.6)",
                    border: "1px solid rgba(201, 169, 110, 0.15)",
                    backdropFilter: "blur(10px)",
                  }}
                >
                  <div className="aspect-[4/3] overflow-hidden">
                    <img
                      src={item.image}
                      alt={item.titleKr}
                      className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                      loading="lazy"
                    />
                    <div
                      className="absolute inset-0"
                      style={{
                        background: "linear-gradient(to bottom, transparent 30%, rgba(58,45,52,0.95) 100%)",
                      }}
                    />
                  </div>
                  <div className="relative p-6 -mt-16 z-10">
                    <div className="flex items-baseline gap-3 mb-2">
                      <span className="font-display text-3xl font-light" style={{ color: "#C9A96E" }}>
                        {item.phase}
                      </span>
                      <span className="font-display text-lg tracking-wider" style={{ color: "#E6EFF7" }}>
                        {item.title}
                      </span>
                    </div>
                    <p className="font-serif-kr text-base mb-1" style={{ color: "#E6EFF7" }}>
                      {item.titleKr}
                    </p>
                    <p className="font-display text-xs tracking-wider mb-3" style={{ color: "#C9A96E" }}>
                      {item.duration}
                    </p>
                    <p className="font-sans-kr text-sm font-light leading-relaxed" style={{ color: "#BEAEDB" }}>
                      {item.desc}
                    </p>
                  </div>
                </div>
              </FadeInSection>
            ))}
          </div>
        </div>
      </section>

      <GoldDivider />

      {/* ═══════════════════════════════════════════
          6. RULES — 안심 (세 가지 약속)
      ═══════════════════════════════════════════ */}
      <section id="rules" className="relative py-24 md:py-32" style={{ backgroundColor: "#3A2D34" }}>
        <div className="container">
          <FadeInSection>
            <SectionTitle
              sub="Our Promise"
              main="세 가지 약속"
              desc="모두의 안전하고 편안한 시간을 위한 규칙입니다."
            />
          </FadeInSection>

          <div className="grid md:grid-cols-3 gap-6 max-w-5xl mx-auto">
            {[
              {
                icon: <Users size={28} />,
                title: "1인 전용",
                desc: "오직 혼자 오시는 분만 입장 가능합니다. 동행 없이, 온전히 나만의 시간을 보내세요.",
              },
              {
                icon: <ShieldCheck size={28} />,
                title: "비밀 보장",
                desc: "이 공간에서 나눈 모든 이야기는 철저히 비밀이 보장됩니다. 안심하고 마음을 열어주세요.",
              },
              {
                icon: <Clock size={28} />,
                title: "100% 예약제",
                desc: "모든 세션은 사전 예약으로만 운영됩니다. 대기자 신청 후 순서대로 안내해 드립니다.",
              },
            ].map((rule, i) => (
              <FadeInSection key={rule.title} delay={0.15 * i}>
                <div
                  className="relative p-8 text-center h-full transition-all duration-500 hover:translate-y-[-4px]"
                  style={{
                    backgroundColor: "rgba(63, 42, 82, 0.4)",
                    border: "1px solid rgba(201, 169, 110, 0.15)",
                  }}
                >
                  <div className="inline-flex items-center justify-center w-14 h-14 mb-5"
                       style={{ color: "#C9A96E", border: "1px solid rgba(201, 169, 110, 0.3)" }}>
                    {rule.icon}
                  </div>
                  <h3 className="font-serif-kr text-lg mb-3" style={{ color: "#E6EFF7" }}>
                    {rule.title}
                  </h3>
                  <p className="font-sans-kr text-sm font-light leading-relaxed" style={{ color: "#BEAEDB" }}>
                    {rule.desc}
                  </p>
                </div>
              </FadeInSection>
            ))}
          </div>
        </div>
      </section>

      <GoldDivider />

      {/* ═══════════════════════════════════════════
          7. GALLERY — 공간 분위기로 상상력 자극
      ═══════════════════════════════════════════ */}
      <section id="gallery" className="relative py-24 md:py-32" style={{ backgroundColor: "#3F2A52" }}>
        <div className="container">
          <FadeInSection>
            <SectionTitle
              sub="The Space"
              main="문을 열면"
            />
            <p className="mt-4 font-body text-lg tracking-wide" style={{ color: '#BEAEDB' }}>
              캔들과 타로, 그리고 한 잔의 술이 기다리고 있습니다
            </p>
          </FadeInSection>

          {/* Masonry-like gallery */}
          <div className="max-w-6xl mx-auto">
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3 md:gap-4">
              {[
                { src: ASSETS.chairPurple, span: "row-span-2", aspect: "aspect-[3/5]" },
                { src: ASSETS.galleryWall, span: "", aspect: "aspect-square" },
                { src: ASSETS.purpleSalon, span: "", aspect: "aspect-square" },
                { src: ASSETS.sofaPurple, span: "md:col-span-2", aspect: "aspect-[16/9]" },
                { src: ASSETS.flowersSofa, span: "", aspect: "aspect-[3/4]" },
                { src: ASSETS.chairPink, span: "", aspect: "aspect-[3/4]" },
                { src: ASSETS.tarotWheel, span: "", aspect: "aspect-square" },
              ].map((img, i) => (
                <FadeInSection key={i} delay={0.1 * i} className={img.span}>
                  <div
                    className={`relative overflow-hidden group ${img.aspect}`}
                    style={{ border: "1px solid rgba(201, 169, 110, 0.1)" }}
                  >
                    <img
                      src={img.src}
                      alt="Solo Salon 공간"
                      className="w-full h-full object-cover transition-all duration-700 group-hover:scale-105"
                      loading="lazy"
                    />
                    <div
                      className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500"
                      style={{ backgroundColor: "rgba(63, 42, 82, 0.3)" }}
                    />
                  </div>
                </FadeInSection>
              ))}
            </div>
          </div>
        </div>
      </section>

      <GoldDivider />

      {/* ═══════════════════════════════════════════
          8. PRICING — 가격 제시 (결정 유도)
      ═══════════════════════════════════════════ */}
      <section id="pricing" className="relative py-24 md:py-32" style={{ backgroundColor: "#3A2D34" }}>
        <div className="container">
          <FadeInSection>
            <SectionTitle
              sub="Pricing"
              main="세션 안내"
            />
          </FadeInSection>

          {/* Countdown Timer */}
          <FadeInSection delay={0.15}>
            <div className="text-center mb-12">
              <div className="inline-block px-5 py-2 mb-6" style={{ backgroundColor: 'rgba(201,169,110,0.15)', border: '1px solid rgba(201,169,110,0.3)' }}>
                <p className="font-display text-xs tracking-[0.3em] uppercase" style={{ color: '#C9A96E' }}>
                  Grand Open Event
                </p>
              </div>
              <CountdownTimer targetDate={new Date('2026-07-31T23:59:59')} />
              <p className="font-sans-kr text-xs font-light mt-4" style={{ color: 'rgba(190,174,219,0.6)' }}>
                오픈 이벤트 종료까지 남은 시간
              </p>
            </div>
          </FadeInSection>

          <div className="grid md:grid-cols-2 gap-6 md:gap-8 max-w-4xl mx-auto">
            {/* Private Session */}
            <FadeInSection delay={0.2}>
              <div
                className="p-8 md:p-10 text-center relative overflow-hidden h-full"
                style={{
                  backgroundColor: "rgba(63, 42, 82, 0.5)",
                  border: "1px solid rgba(201, 169, 110, 0.25)",
                }}
              >
                <div className="absolute top-3 left-3 w-6 h-6" style={{ borderTop: "1px solid #C9A96E", borderLeft: "1px solid #C9A96E" }} />
                <div className="absolute top-3 right-3 w-6 h-6" style={{ borderTop: "1px solid #C9A96E", borderRight: "1px solid #C9A96E" }} />
                <div className="absolute bottom-3 left-3 w-6 h-6" style={{ borderBottom: "1px solid #C9A96E", borderLeft: "1px solid #C9A96E" }} />
                <div className="absolute bottom-3 right-3 w-6 h-6" style={{ borderBottom: "1px solid #C9A96E", borderRight: "1px solid #C9A96E" }} />

                <div className="inline-block px-3 py-1 mb-3 font-sans-kr text-xs tracking-wider" style={{ backgroundColor: '#C9A96E', color: '#3A2D34', fontWeight: 600 }}>
                  OPEN EVENT 50% OFF
                </div>
                <p className="font-display text-sm tracking-[0.3em] uppercase mb-4" style={{ color: "#C9A96E" }}>
                  Private Session
                </p>
                <h3 className="font-serif-kr text-xl md:text-2xl font-light mb-2" style={{ color: "#E6EFF7" }}>
                  1:1 프라이빗 세션
                </h3>
                <p className="font-sans-kr text-sm mb-6" style={{ color: "#BEAEDB" }}>
                  90분 / 웰컴 한 잔 + 타로 리딩 + 대화 + 마무리 한 잔
                </p>

                <div className="mb-6">
                  <div className="mb-1">
                    <span className="font-display text-lg font-light line-through opacity-50" style={{ color: "#BEAEDB" }}>
                      100,000원
                    </span>
                  </div>
                  <span className="font-display text-4xl md:text-5xl font-light" style={{ color: "#C9A96E" }}>
                    50,000
                  </span>
                  <span className="font-sans-kr text-sm ml-1" style={{ color: "#BEAEDB" }}>원</span>
                </div>

                <div className="space-y-2 mb-8 text-left max-w-xs mx-auto">
                  {[
                    "웰컴 잔술 1잔 포함 (위스키·와인·소주·맥주)",
                    "마무리 잔술 1잔 포함",
                    "1:1 타로 리딩",
                    "기념 타로 카드 1장 증정",
                  ].map((item) => (
                    <div key={item} className="flex items-start gap-3">
                      <span className="mt-1.5 w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ backgroundColor: "#C9A96E" }} />
                      <span className="font-sans-kr text-sm font-light" style={{ color: "#BEAEDB" }}>{item}</span>
                    </div>
                  ))}
                </div>

                <a
                  href="https://tally.so"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-block w-full py-3.5 font-display text-sm tracking-[0.2em] uppercase transition-all duration-300 hover:opacity-90"
                  style={{
                    backgroundColor: "#C9A96E",
                    color: "#3A2D34",
                  }}
                >
                  예약 대기 신청하기
                </a>
              </div>
            </FadeInSection>

            {/* Connection Night Session */}
            <FadeInSection delay={0.35}>
              <div
                className="p-8 md:p-10 text-center relative overflow-hidden h-full"
                style={{
                  backgroundColor: "rgba(63, 42, 82, 0.5)",
                  border: "1px solid rgba(201, 169, 110, 0.25)",
                }}
              >
                <div className="absolute top-3 left-3 w-6 h-6" style={{ borderTop: "1px solid #C9A96E", borderLeft: "1px solid #C9A96E" }} />
                <div className="absolute top-3 right-3 w-6 h-6" style={{ borderTop: "1px solid #C9A96E", borderRight: "1px solid #C9A96E" }} />
                <div className="absolute bottom-3 left-3 w-6 h-6" style={{ borderBottom: "1px solid #C9A96E", borderLeft: "1px solid #C9A96E" }} />
                <div className="absolute bottom-3 right-3 w-6 h-6" style={{ borderBottom: "1px solid #C9A96E", borderRight: "1px solid #C9A96E" }} />

                <div className="inline-block px-3 py-1 mb-3 font-sans-kr text-xs tracking-wider" style={{ backgroundColor: '#C9A96E', color: '#3A2D34', fontWeight: 600 }}>
                  OPEN EVENT 50% OFF
                </div>
                <div className="flex items-center justify-center gap-2 mb-4">
                  <Sparkles size={14} style={{ color: "#C9A96E" }} />
                  <p className="font-display text-sm tracking-[0.3em] uppercase" style={{ color: "#C9A96E" }}>
                    Connection Night
                  </p>
                </div>
                <h3 className="font-serif-kr text-xl md:text-2xl font-light mb-2" style={{ color: "#E6EFF7" }}>
                  연결의 밤 세션
                </h3>
                <p className="font-sans-kr text-sm mb-6" style={{ color: "#BEAEDB" }}>
                  120분 / 그룹 타로 리딩 + 대화 + 잔술 2잔
                </p>

                <div className="mb-6">
                  <div className="mb-1">
                    <span className="font-display text-lg font-light line-through opacity-50" style={{ color: "#BEAEDB" }}>
                      60,000원
                    </span>
                  </div>
                  <span className="font-display text-4xl md:text-5xl font-light" style={{ color: "#C9A96E" }}>
                    30,000
                  </span>
                  <span className="font-sans-kr text-sm ml-1" style={{ color: "#BEAEDB" }}>원</span>
                </div>

                <div className="space-y-2 mb-8 text-left max-w-xs mx-auto">
                  {[
                    "4~6명 소규모 그룹",
                    "잔술 2잔 포함 (위스키·와인·소주·맥주)",
                    "그룹 타로 리딩 체험",
                    "주 1회 운영 (사전 신청)",
                  ].map((item) => (
                    <div key={item} className="flex items-start gap-3">
                      <span className="mt-1.5 w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ backgroundColor: "#C9A96E" }} />
                      <span className="font-sans-kr text-sm font-light" style={{ color: "#BEAEDB" }}>{item}</span>
                    </div>
                  ))}
                </div>

                <a
                  href="https://tally.so"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-block w-full py-3.5 font-display text-sm tracking-[0.2em] uppercase transition-all duration-300 hover:opacity-90"
                  style={{
                    border: "1px solid #C9A96E",
                    color: "#C9A96E",
                    backgroundColor: "rgba(201, 169, 110, 0.08)",
                  }}
                >
                  참여 신청하기
                </a>
              </div>
            </FadeInSection>
          </div>
        </div>
      </section>

      <GoldDivider />

      {/* ═══════════════════════════════════════════
          9. COMMUNITY — 연결의 밤 (확장 옵션)
      ═══════════════════════════════════════════ */}
      <section id="community" className="relative py-24 md:py-32 overflow-hidden" style={{ backgroundColor: "#3F2A52" }}>
        <div className="absolute inset-0 opacity-20">
          <img src={ASSETS.rulesBg} alt="" className="w-full h-full object-cover" loading="lazy" />
        </div>
        <div className="relative z-10 container">
          <FadeInSection>
            <SectionTitle
              sub="Connection Night"
              main="연결의 밤"
              desc="혼자이되, 외롭지 않은 시간"
            />
          </FadeInSection>

          <div className="grid md:grid-cols-2 gap-8 md:gap-16 items-center max-w-5xl mx-auto">
            <FadeInSection delay={0.2}>
              <div className="relative">
                <div
                  className="absolute -inset-4 opacity-20 blur-3xl"
                  style={{ backgroundColor: "#C9A96E" }}
                />
                <img
                  src={ASSETS.tarotSocialGathering}
                  alt="소셜 모임 - 연결의 밤"
                  className="relative w-full aspect-[16/9] object-cover"
                  style={{ border: "1px solid rgba(201, 169, 110, 0.2)" }}
                  loading="lazy"
                />
              </div>
            </FadeInSection>

            <FadeInSection delay={0.4}>
              <div className="space-y-6">
                <div className="flex items-center gap-3 mb-2">
                  <Sparkles size={20} style={{ color: "#C9A96E" }} />
                  <span className="font-display text-xs tracking-[0.3em] uppercase" style={{ color: "#C9A96E" }}>
                    Weekly Special
                  </span>
                </div>

                <h3 className="font-serif-kr text-xl md:text-2xl font-light" style={{ color: "#E6EFF7" }}>
                  주 1회, 타로로 이어지는 만남
                </h3>

                <p className="font-sans-kr text-sm md:text-base font-light leading-[1.9]"
                   style={{ color: "#BEAEDB" }}>
                  혼자만의 시간도 좋지만, 때로는 비슷한 마음을 가진 사람들과의 연결이 필요할 때가 있습니다.
                  <strong style={{ color: "#C9A96E", fontWeight: 400 }}> 매주 한 번, 소수의 인원이 모여 타로를 매개로 서로의 이야기를 나누는 특별한 밤</strong>을 준비합니다.
                </p>

                <p className="font-sans-kr text-sm md:text-base font-light leading-[1.9]"
                   style={{ color: "#BEAEDB" }}>
                  강제적인 네트워킹이 아닌, 카드가 이끄는 자연스러운 대화.
                  이 공간에서만 가능한, 깊고 따뜻한 연결을 경험해 보세요.
                </p>

                <div
                  className="p-5 mt-4"
                  style={{
                    backgroundColor: "rgba(58, 45, 52, 0.6)",
                    border: "1px solid rgba(201, 169, 110, 0.2)",
                  }}
                >
                  <div className="grid grid-cols-3 gap-4 text-center">
                    <div>
                      <p className="font-display text-2xl font-light" style={{ color: "#C9A96E" }}>4~6</p>
                      <p className="font-sans-kr text-xs mt-1" style={{ color: "#BEAEDB" }}>명 소규모</p>
                    </div>
                    <div>
                      <p className="font-display text-2xl font-light" style={{ color: "#C9A96E" }}>120</p>
                      <p className="font-sans-kr text-xs mt-1" style={{ color: "#BEAEDB" }}>분 세션</p>
                    </div>
                    <div>
                      <p className="font-display text-2xl font-light" style={{ color: "#C9A96E" }}>1x</p>
                      <p className="font-sans-kr text-xs mt-1" style={{ color: "#BEAEDB" }}>주 1회</p>
                    </div>
                  </div>
                </div>

                <a
                  href="https://tally.so"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 px-6 py-3 font-display text-sm tracking-[0.15em] uppercase transition-all duration-300 hover:scale-105 mt-2"
                  style={{
                    border: "1px solid #C9A96E",
                    color: "#C9A96E",
                    backgroundColor: "rgba(201, 169, 110, 0.08)",
                  }}
                >
                  <Sparkles size={14} />
                  참여 신청하기
                </a>
              </div>
            </FadeInSection>
          </div>
        </div>
      </section>

      <GoldDivider />

      {/* ═══════════════════════════════════════════
          10. FOOD — 나눔 쇼케이스 (부가 매력)
      ═══════════════════════════════════════════ */}
      <section id="food" className="relative py-24 md:py-32 overflow-hidden" style={{ backgroundColor: "#2D2128" }}>
        <TarotParticles />
        <div className="container relative z-10">
          <FadeInSection>
            <SectionTitle
              sub="Sharing Table"
              main="나눔 쇼케이스"
              desc="혼자여도 다양한 맛을 경험할 수 있는 특별한 시스템"
            />
          </FadeInSection>

          {/* Hero Image — 쇼케이스 */}
          <FadeInSection delay={0.2}>
            <div className="max-w-5xl mx-auto mb-16 relative">
              <div
                className="overflow-hidden"
                style={{ border: "1px solid rgba(201, 169, 110, 0.3)" }}
              >
                <img
                  src={ASSETS.foodShowcase}
                  alt="나눔 쇼케이스"
                  className="w-full h-64 md:h-96 object-cover"
                  loading="lazy"
                />
              </div>
              <div className="absolute -bottom-4 left-1/2 -translate-x-1/2 px-6 py-2" style={{ backgroundColor: "#2D2128", border: "1px solid rgba(201, 169, 110, 0.4)" }}>
                <p className="font-display text-xs tracking-[0.3em] uppercase" style={{ color: "#C9A96E" }}>Today's Showcase</p>
              </div>
            </div>
          </FadeInSection>

          {/* 설명 텍스트 */}
          <FadeInSection delay={0.3}>
            <div className="max-w-3xl mx-auto text-center mb-16">
              <p className="font-serif-kr text-lg md:text-xl leading-relaxed mb-4" style={{ color: "#E6EFF7" }}>
                "혼자라서 한 가지만 시켜야 할까?"<br />
                그런 걱정은 여기서 내려놓으세요.
              </p>
              <p className="font-sans-kr text-sm md:text-base leading-relaxed" style={{ color: "#BEAEDB" }}>
                Haemilsia Solo Salon에서는 손님들이 자신의 음식을 <strong style={{ color: "#C9A96E" }}>먹기 전에 한 접시 덜어</strong> 쇼케이스에 나눕니다.<br />
                다음 손님은 쇼케이스에 놓인 다양한 음식을 자유롭게 맛볼 수 있어요.<br />
                혼자여도 여러 가지 맛을 경험하는, 조용한 나눔의 문화입니다.
              </p>
            </div>
          </FadeInSection>

          {/* 3단계 플로우 */}
          <div className="grid md:grid-cols-3 gap-6 md:gap-8 max-w-5xl mx-auto mb-16">
            {[
              {
                icon: Truck,
                step: "01",
                title: "자유롭게 주문",
                desc: "배달 앱으로 원하는 음식을 주문하거나, 직접 가져오셔도 됩니다. 치킨, 초밥, 피자 — 무엇이든 좋아요.",
              },
              {
                icon: Gift,
                step: "02",
                title: "한 접시 나눔",
                desc: "음식이 도착하면 먹기 전에 한 접시를 덜어 쇼케이스에 올려주세요. 먹던 것이 아닌, 깨끗하게 덜어낸 한 접시입니다.",
              },
              {
                icon: UtensilsCrossed,
                step: "03",
                title: "다양한 맛 경험",
                desc: "쇼케이스에 놓인 이전 손님들의 나눔 음식을 자유롭게 맛보세요. 혼자여도 여러 가지 안주를 즐길 수 있습니다.",
              },
            ].map((item, i) => (
              <FadeInSection key={item.step} delay={0.2 + i * 0.15}>
                <div
                  className="p-8 text-center relative group h-full"
                  style={{
                    backgroundColor: "rgba(63, 42, 82, 0.4)",
                    border: "1px solid rgba(201, 169, 110, 0.15)",
                    transition: "all 0.4s ease",
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.borderColor = "rgba(201, 169, 110, 0.4)";
                    e.currentTarget.style.backgroundColor = "rgba(63, 42, 82, 0.6)";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.borderColor = "rgba(201, 169, 110, 0.15)";
                    e.currentTarget.style.backgroundColor = "rgba(63, 42, 82, 0.4)";
                  }}
                >
                  <div className="w-14 h-14 mx-auto mb-5 flex items-center justify-center" style={{ border: "1px solid rgba(201, 169, 110, 0.3)", borderRadius: "50%" }}>
                    <item.icon size={24} style={{ color: "#C9A96E" }} />
                  </div>
                  <p className="font-display text-xs tracking-[0.3em] uppercase mb-2" style={{ color: "#C9A96E" }}>
                    Step {item.step}
                  </p>
                  <h3 className="font-serif-kr text-lg mb-3" style={{ color: "#E6EFF7" }}>
                    {item.title}
                  </h3>
                  <p className="font-sans-kr text-sm leading-relaxed" style={{ color: "#BEAEDB" }}>
                    {item.desc}
                  </p>
                </div>
              </FadeInSection>
            ))}
          </div>

          {/* 바 카운터 이미지 + 부가 설명 */}
          <FadeInSection delay={0.4}>
            <div className="max-w-5xl mx-auto">
              <div className="grid md:grid-cols-2 gap-8 items-center">
                <div
                  className="overflow-hidden"
                  style={{ border: "1px solid rgba(201, 169, 110, 0.2)" }}
                >
                  <img
                    src={ASSETS.foodSharing}
                    alt="음식 나눔 컨셉"
                    className="w-full h-64 md:h-80 object-cover hover:scale-105 transition-transform duration-700"
                    loading="lazy"
                  />
                </div>
                <div className="space-y-6">
                  <div className="flex items-start gap-4">
                    <div className="w-8 h-8 flex-shrink-0 flex items-center justify-center mt-1" style={{ border: "1px solid rgba(201, 169, 110, 0.3)", borderRadius: "50%" }}>
                      <span className="font-display text-xs" style={{ color: "#C9A96E" }}>Q</span>
                    </div>
                    <div>
                      <p className="font-serif-kr text-base mb-1" style={{ color: "#E6EFF7" }}>배달 음식도 되나요?</p>
                      <p className="font-sans-kr text-sm" style={{ color: "#BEAEDB" }}>네! 배달 앱으로 자유롭게 주문하시거나, 직접 음식을 가져오셔도 됩니다.</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-4">
                    <div className="w-8 h-8 flex-shrink-0 flex items-center justify-center mt-1" style={{ border: "1px solid rgba(201, 169, 110, 0.3)", borderRadius: "50%" }}>
                      <span className="font-display text-xs" style={{ color: "#C9A96E" }}>Q</span>
                    </div>
                    <div>
                      <p className="font-serif-kr text-base mb-1" style={{ color: "#E6EFF7" }}>먹던 음식을 나누는 건가요?</p>
                      <p className="font-sans-kr text-sm" style={{ color: "#BEAEDB" }}>아닙니다. 음식이 도착하면 <strong style={{ color: "#C9A96E" }}>먹기 전에</strong> 깨끗하게 덜어서 쇼케이스에 올려놓는 방식입니다.</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-4">
                    <div className="w-8 h-8 flex-shrink-0 flex items-center justify-center mt-1" style={{ border: "1px solid rgba(201, 169, 110, 0.3)", borderRadius: "50%" }}>
                      <span className="font-display text-xs" style={{ color: "#C9A96E" }}>Q</span>
                    </div>
                    <div>
                      <p className="font-serif-kr text-base mb-1" style={{ color: "#E6EFF7" }}>꼭 나눠야 하나요?</p>
                      <p className="font-sans-kr text-sm" style={{ color: "#BEAEDB" }}>의무는 아니지만, 나눔에 참여하시면 다른 손님의 음식도 맛보실 수 있어요. 작은 나눔이 모여 풍성한 한 상이 됩니다.</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </FadeInSection>
        </div>
      </section>

      <GoldDivider />

      {/* ═══════════════════════════════════════════
          11. RECRUIT — 구인 광고
      ═══════════════════════════════════════════ */}
      <section id="recruit" className="relative py-24 md:py-32 overflow-hidden" style={{ backgroundColor: "#3A2D34" }}>
        <TarotParticles />
        <div className="relative z-10 container">
          <FadeInSection>
            <div className="max-w-3xl mx-auto text-center">
              <div className="inline-flex items-center gap-2 mb-6 px-5 py-2" style={{ border: "1px solid rgba(201, 169, 110, 0.3)", backgroundColor: "rgba(201, 169, 110, 0.06)" }}>
                <Sparkles size={14} style={{ color: "#C9A96E" }} />
                <span className="font-display text-xs tracking-[0.3em] uppercase" style={{ color: "#C9A96E" }}>Now Hiring</span>
              </div>

              <h2 className="font-serif-kr text-2xl md:text-4xl font-light mb-4" style={{ color: "#E6EFF7" }}>
                타로를 배우며 함께 일할 분을 찾습니다
              </h2>

              <p className="font-sans-kr text-sm md:text-base font-light leading-[1.9] mb-8" style={{ color: "#BEAEDB" }}>
                Haemilsia Solo Salon은 단순한 술집이 아닌, 사람의 마음에 귀 기울이는 공간입니다.<br />
                타로에 관심이 있고, 사람과의 대화를 좋아하시는 분이라면 경험이 없어도 괜찮습니다.<br />
                저희가 타로 리딩을 처음부터 교육해 드립니다.
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-10 max-w-2xl mx-auto">
                {[
                  { icon: <Star size={22} />, title: "타로 교육 제공", desc: "전문 타로 리딩 교육을 무료로 받으실 수 있습니다" },
                  { icon: <MessageCircle size={22} />, title: "대화를 좋아하는 분", desc: "경청과 공감 능력이 있는 분을 환영합니다" },
                  { icon: <Moon size={22} />, title: "유연한 근무", desc: "수~일 저녁 시간대, 협의 가능" },
                ].map((item) => (
                  <div
                    key={item.title}
                    className="p-5 text-center transition-all duration-500 hover:translate-y-[-4px]"
                    style={{ backgroundColor: "rgba(63, 42, 82, 0.4)", border: "1px solid rgba(201, 169, 110, 0.15)" }}
                  >
                    <div className="inline-flex items-center justify-center w-11 h-11 mb-3" style={{ color: "#C9A96E", border: "1px solid rgba(201, 169, 110, 0.3)" }}>
                      {item.icon}
                    </div>
                    <h4 className="font-serif-kr text-sm mb-1.5" style={{ color: "#E6EFF7" }}>{item.title}</h4>
                    <p className="font-sans-kr text-xs font-light leading-relaxed" style={{ color: "#BEAEDB" }}>{item.desc}</p>
                  </div>
                ))}
              </div>

              <a
                href="https://tally.so"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-8 py-3.5 font-display text-sm tracking-[0.2em] uppercase transition-all duration-300 hover:scale-105"
                style={{ border: "1px solid #C9A96E", color: "#C9A96E", backgroundColor: "rgba(201, 169, 110, 0.08)" }}
              >
                <Moon size={14} />
                지원하기
              </a>

              <p className="font-sans-kr text-xs font-light mt-6" style={{ color: "rgba(190,174,219,0.5)" }}>
                DM 또는 지원 폼을 통해 편하게 문의해 주세요
              </p>
            </div>
          </FadeInSection>
        </div>
      </section>

      <GoldDivider />

      {/* ═══════════════════════════════════════════
          12. FAQ — 남은 의문 해소
      ═══════════════════════════════════════════ */}
      <section id="faq" className="relative py-24 md:py-32" style={{ backgroundColor: "#3A2D34" }}>
        <TarotParticles />
        <div className="container relative z-10">
          <FadeInSection>
            <SectionTitle
              sub="Questions"
              main="자주 묻는 질문"
              desc="궁금한 점이 있으시다면 먼저 확인해 보세요."
            />
          </FadeInSection>

          <div className="max-w-3xl mx-auto space-y-4">
            {[
              {
                q: "술을 못 마셔도 방문할 수 있나요?",
                a: "물론입니다. 논알콜 잔술(무알콜 칵테일 등)도 준비하고 있으며, 세션 시작 시 상담사와 함께 선택하실 수 있습니다. 대화와 타로 리딩이 중심이므로 음주 여부는 전혀 상관없습니다.",
              },
              {
                q: "타로를 처음 접하는데 괜찮을까요?",
                a: "전혀 문제없습니다. 타로 경험이 없으셔도 상담사가 카드의 의미를 쉽게 설명해 드립니다. 타로는 점술이 아닌, 자신의 마음을 들여다보는 대화의 도구로 활용됩니다.",
              },
              {
                q: "예약은 어떻게 하나요?",
                a: "100% 사전 예약제로 운영됩니다. 홈페이지의 '예약 대기 신청' 버튼을 통해 대기자 폼을 작성해 주시면, 확인 후 개별 연락드려 일정을 조율합니다.",
              },
              {
                q: "세션 취소나 변경은 가능한가요?",
                a: "세션 24시간 전까지 무료 취소 및 변경이 가능합니다. 24시간 이내 취소 시에는 세션 비용의 50%가 취소 수수료로 발생합니다.",
              },
              {
                q: "연결의 밤은 어떤 분위기인가요?",
                a: "4~6명의 소규모 그룹이 모여 그룹 타로 리딩과 자유로운 대화를 나누는 시간입니다. 서로의 이야기를 존중하는 따뜻한 분위기에서 진행되며, 편안하게 새로운 인연을 만들 수 있습니다.",
              },
              {
                q: "혼자 가도 어색하지 않을까요?",
                a: "Solo Salon은 '혼자 오는 것'이 기본인 공간입니다. 모든 손님이 혼자 방문하시기 때문에 어색함 없이 오롯이 자신만의 시간을 보내실 수 있습니다.",
              },
              {
                q: "타로 상담사로 지원하고 싶어요. 경험이 없어도 되나요?",
                a: "네, 타로 경험이 없어도 지원 가능합니다. 채용 후 체계적인 타로 교육을 제공해 드리며, 사람과의 대화를 좋아하고 따뜻한 마음을 가진 분이라면 환영합니다.",
              },
            ].map((item, i) => (
              <FadeInSection key={i} delay={0.1 + i * 0.05}>
                <FAQItem question={item.q} answer={item.a} />
              </FadeInSection>
            ))}
          </div>
        </div>
      </section>

      <GoldDivider />

      {/* ═══════════════════════════════════════════
          13. CONTACT — 행동 유도
      ═══════════════════════════════════════════ */}
      <section id="contact" className="relative py-24 md:py-32" style={{ backgroundColor: "#3F2A52" }}>
        <div className="container">
          <FadeInSection>
            <SectionTitle
              sub="Find Us"
              main="오시는 길"
            />
          </FadeInSection>

          <div className="grid md:grid-cols-2 gap-8 md:gap-16 max-w-5xl mx-auto items-start">
            <FadeInSection delay={0.2}>
              <div className="space-y-8">
                <div className="flex items-start gap-4">
                  <MapPin size={20} className="mt-1 flex-shrink-0" style={{ color: "#C9A96E" }} />
                  <div>
                    <h4 className="font-serif-kr text-base mb-1" style={{ color: "#E6EFF7" }}>위치</h4>
                    <p className="font-sans-kr text-sm font-light" style={{ color: "#BEAEDB" }}>
                      경기도 화성시 동탄대로 일대
                    </p>
                    <p className="font-sans-kr text-xs font-light mt-1" style={{ color: "rgba(190,174,219,0.6)" }}>
                      정확한 주소는 예약 확정 시 안내드립니다
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <Clock size={20} className="mt-1 flex-shrink-0" style={{ color: "#C9A96E" }} />
                  <div>
                    <h4 className="font-serif-kr text-base mb-1" style={{ color: "#E6EFF7" }}>운영 시간</h4>
                    <p className="font-sans-kr text-sm font-light" style={{ color: "#BEAEDB" }}>
                      수 — 일 / 18:00 — 24:00
                    </p>
                    <p className="font-sans-kr text-xs font-light mt-1" style={{ color: "rgba(190,174,219,0.6)" }}>
                      월, 화 정기 휴무
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <Phone size={20} className="mt-1 flex-shrink-0" style={{ color: "#C9A96E" }} />
                  <div>
                    <h4 className="font-serif-kr text-base mb-1" style={{ color: "#E6EFF7" }}>문의</h4>
                    <p className="font-sans-kr text-sm font-light" style={{ color: "#BEAEDB" }}>
                      DM 또는 대기자 폼을 통해 문의해 주세요
                    </p>
                  </div>
                </div>

                <div className="flex gap-4 pt-4">
                  <a
                    href="https://instagram.com"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-center w-10 h-10 transition-all duration-300 hover:scale-110"
                    style={{ border: "1px solid rgba(201, 169, 110, 0.3)", color: "#C9A96E" }}
                  >
                    <Instagram size={18} />
                  </a>
                  <a
                    href="https://open.kakao.com"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-center w-10 h-10 transition-all duration-300 hover:scale-110"
                    style={{ border: "1px solid rgba(201, 169, 110, 0.3)", color: "#C9A96E" }}
                  >
                    <MessageCircle size={18} />
                  </a>
                </div>
              </div>
            </FadeInSection>

            <FadeInSection delay={0.4}>
              <div className="relative">
                <img
                  src={ASSETS.heroMoon}
                  alt="Solo Salon 분위기"
                  className="w-full aspect-[4/5] object-cover"
                  style={{ border: "1px solid rgba(201, 169, 110, 0.15)" }}
                  loading="lazy"
                />
              </div>
            </FadeInSection>
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════
          FOOTER
      ═══════════════════════════════════════════ */}
      <footer className="py-12 md:py-16" style={{ backgroundColor: "#2D2128", borderTop: "1px solid rgba(201, 169, 110, 0.1)" }}>
        <div className="container text-center">
          <div className="flex justify-center mb-6">
            <img src={ASSETS.divider} alt="" className="w-48 opacity-40" loading="lazy" />
          </div>
          <p className="font-display text-lg tracking-wider mb-2" style={{ color: "#E6EFF7" }}>
            Haemilsia <span className="italic" style={{ color: "#C9A96E" }}>Solo Salon</span>
          </p>
          <p className="font-sans-kr text-xs font-light mb-6" style={{ color: "rgba(190,174,219,0.5)" }}>
            혼자 오는 사람만 받는 작은 술집
          </p>
          <p className="font-sans-kr text-xs" style={{ color: "rgba(190,174,219,0.3)" }}>
            &copy; {new Date().getFullYear()} Haemilsia Solo Salon. All rights reserved.
          </p>
        </div>
      </footer>

      {/* ═══════════════════════════════════════════
          FLOATING CTA BUTTON (모바일)
      ═══════════════════════════════════════════ */}
      <motion.a
        href="https://tally.so"
        target="_blank"
        rel="noopener noreferrer"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: scrolled ? 1 : 0, y: scrolled ? 0 : 20 }}
        transition={{ duration: 0.4 }}
        className="fixed bottom-6 right-6 z-50 md:hidden flex items-center gap-2 px-5 py-3 shadow-lg"
        style={{
          backgroundColor: "#C9A96E",
          color: "#3A2D34",
          pointerEvents: scrolled ? "auto" : "none",
        }}
      >
        <Moon size={16} />
        <span className="font-display text-xs tracking-wider uppercase">Reserve</span>
      </motion.a>
    </div>
  );
}
