/**
 * Haemilsia Solo Salon — 홈페이지
 * Design: "Mystic Veil" — Victorian Gothic Salon
 * Colors: Jacarta #3F2A52, Dark Blue-Gray #75619D, Wisteria #BEAEDB,
 *         Bright Gray #E6EFF7, Black Coffee #3A2D34, Gold #C9A96E
 */

import { useEffect, useRef, useState } from "react";
import { motion, useInView, useScroll, useTransform } from "framer-motion";
import { Moon, Clock, Users, ShieldCheck, MapPin, Phone, Instagram, MessageCircle } from "lucide-react";
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
      <p className="font-display text-sm md:text-base tracking-[0.3em] uppercase text-gold mb-3"
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
              { label: "Experience", href: "#experience" },
              { label: "Rules", href: "#rules" },
              { label: "Gallery", href: "#gallery" },
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
          HERO SECTION
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
            className="inline-block px-8 py-3.5 font-display text-sm tracking-[0.25em] uppercase transition-all duration-500 hover:scale-105"
            style={{
              border: "1px solid #C9A96E",
              color: "#3A2D34",
              backgroundColor: "#C9A96E",
            }}
            whileHover={{ boxShadow: "0 0 30px rgba(201, 169, 110, 0.4)" }}
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
          ABOUT — 공감 섹션
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
                  src={ASSETS.heroMoon}
                  alt="프라이빗 살롱 인테리어"
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
          EXPERIENCE — 세션 흐름
      ═══════════════════════════════════════════ */}
      <section id="experience" className="relative py-24 md:py-32" style={{ backgroundColor: "#3F2A52" }}>
        <div className="absolute inset-0 opacity-30">
          <img src={ASSETS.rulesBg} alt="" className="w-full h-full object-cover" loading="lazy" />
        </div>
        <div className="relative z-10 container">
          <FadeInSection>
            <SectionTitle
              sub="The Session"
              main="90분의 여정"
              desc="세 가지 시간으로 구성된 당신만의 프라이빗 세션"
            />
          </FadeInSection>

          {/* Session flow illustration */}
          <FadeInSection delay={0.2}>
            <div className="max-w-4xl mx-auto mb-16">
              <img
                src={ASSETS.sessionFlow}
                alt="세션 흐름: Welcome - Conversation - Reflection"
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
                desc: "시그니처 웰컴 드링크와 함께 긴장을 풀어드립니다. 간단한 타로 카드 선택으로 오늘 밤의 테마를 정합니다.",
                image: ASSETS.tarotCards,
              },
              {
                phase: "02",
                title: "Deep Talk",
                titleKr: "깊은 대화",
                duration: "50분",
                desc: "타로 리딩을 매개로 자연스럽게 대화가 시작됩니다. 호스트가 당신의 이야기에 진심으로 귀 기울이며, 함께 의미를 찾아갑니다.",
                image: ASSETS.constellation,
              },
              {
                phase: "03",
                title: "Reflection",
                titleKr: "성찰의 시간",
                duration: "20분",
                desc: "마무리 음료와 함께 오늘의 대화를 되짚어봅니다. 작은 타로 카드 한 장을 기념으로 가져가실 수 있습니다.",
                image: ASSETS.purpleGoldSofa,
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
          RULES — 매장 규칙
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
                title: "연락처 교환 금지",
                desc: "세션 중 개인 연락처 교환은 정중히 사양합니다. 이 공간에서의 대화는 이 공간에 남깁니다.",
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
          GALLERY — 공간 갤러리
      ═══════════════════════════════════════════ */}
      <section id="gallery" className="relative py-24 md:py-32" style={{ backgroundColor: "#3F2A52" }}>
        <div className="container">
          <FadeInSection>
            <SectionTitle
              sub="The Space"
              main="비밀의 공간"
            />
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
          PRICING — 가격 안내
      ═══════════════════════════════════════════ */}
      <section className="relative py-24 md:py-32" style={{ backgroundColor: "#3A2D34" }}>
        <div className="container">
          <FadeInSection>
            <SectionTitle
              sub="Pricing"
              main="세션 안내"
            />
          </FadeInSection>

          <FadeInSection delay={0.2}>
            <div
              className="max-w-lg mx-auto p-8 md:p-12 text-center relative overflow-hidden"
              style={{
                backgroundColor: "rgba(63, 42, 82, 0.5)",
                border: "1px solid rgba(201, 169, 110, 0.25)",
              }}
            >
              {/* Corner ornaments */}
              <div className="absolute top-3 left-3 w-6 h-6" style={{ borderTop: "1px solid #C9A96E", borderLeft: "1px solid #C9A96E" }} />
              <div className="absolute top-3 right-3 w-6 h-6" style={{ borderTop: "1px solid #C9A96E", borderRight: "1px solid #C9A96E" }} />
              <div className="absolute bottom-3 left-3 w-6 h-6" style={{ borderBottom: "1px solid #C9A96E", borderLeft: "1px solid #C9A96E" }} />
              <div className="absolute bottom-3 right-3 w-6 h-6" style={{ borderBottom: "1px solid #C9A96E", borderRight: "1px solid #C9A96E" }} />

              <p className="font-display text-sm tracking-[0.3em] uppercase mb-4" style={{ color: "#C9A96E" }}>
                Private Session
              </p>
              <h3 className="font-serif-kr text-xl md:text-2xl font-light mb-2" style={{ color: "#E6EFF7" }}>
                1:1 프라이빗 세션
              </h3>
              <p className="font-sans-kr text-sm mb-6" style={{ color: "#BEAEDB" }}>
                90분 / 웰컴 드링크 + 타로 리딩 + 대화 + 마무리 음료
              </p>

              <div className="mb-6">
                <span className="font-display text-4xl md:text-5xl font-light" style={{ color: "#C9A96E" }}>
                  50,000
                </span>
                <span className="font-sans-kr text-sm ml-1" style={{ color: "#BEAEDB" }}>원</span>
              </div>

              <div className="space-y-2 mb-8 text-left max-w-xs mx-auto">
                {[
                  "시그니처 웰컴 드링크 1잔 포함",
                  "마무리 음료 1잔 포함",
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
        </div>
      </section>

      <GoldDivider />

      {/* ═══════════════════════════════════════════
          CONTACT — 위치 & 연락처
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
                  src={ASSETS.chairPink}
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
