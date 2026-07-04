/* ============================================================
 * core.js — TarotApp 코어
 *
 * 역할:
 *   - TarotApp 네임스페이스 생성 (모듈 augmentation의 뿌리)
 *   - localStorage 5키 전체 소유 (progress/dailyStats/settings/analysisPractice/analysisChecks)
 *   - 일일 통계 롤오버 (자정 넘김 + weekLog 이월)
 *   - 탭 라우터 + 전역 keydown 디스패처 (활성 탭 모듈로 위임)
 *   - cardById 헬퍼 (id=배열인덱스 가정 제거)
 *
 * 로드 순서 계약: cards.js → analysis.js → core.js → flashcard.js → features.js
 * init은 core가 DOMContentLoaded 1곳에서 모듈 순서대로 호출한다.
 * ============================================================ */

window.TarotApp = (function () {
  "use strict";

  var APP_VERSION = "2.0.0";

  var STORAGE_KEYS = {
    progress:         "tarotMajorFlashnote.progress",
    dailyStats:       "tarotMajorFlashnote.dailyStats",
    settings:         "tarotMajorFlashnote.settings",
    analysisPractice: "tarotMajorFlashnote.analysisPractice",
    analysisChecks:   "tarotMajorFlashnote.analysisChecks"
  };

  var MODES   = ["3s", "15s", "60s"];
  var FILTERS = ["all", "o", "tri", "x", "weak"];
  var TABS    = ["flashcard", "analysis", "practice", "records"];
  var DECKS   = ["major", "minor"];
  var SUITS   = ["all", "wands", "cups", "swords", "pentacles"];

  /* 메이저(0~21) + 마이너(22~77, cards-minor.js가 있으면) 통합 목록 */
  var ALL_CARDS = TAROT_CARDS.concat(
    typeof TAROT_CARDS_MINOR !== "undefined" ? TAROT_CARDS_MINOR : []
  );

  var SETTINGS_DEFAULTS = {
    mode: "3s", filter: "all", activeTab: "flashcard", currentCardId: 0,
    deck: "major", minorSuit: "all",
    deckMemory: { major: 0, minor: 22 } // 덱별 마지막 카드 기억
  };
  /* deckRounds는 중첩 객체라 공유 참조 오염 방지를 위해 defaults에 넣지 않고 매번 생성 */
  var DAILY_DEFAULTS = { flips: 0, analysisSteps: 0, studiedCards: [], weekLog: {} };
  function freshDeckRounds() {
    return {
      major: { rounds: 0, roundSeen: [], steps: 0 },
      minor: { rounds: 0, roundSeen: [], steps: 0 }
    };
  }

  var app = {
    version: APP_VERSION,
    STORAGE_KEYS: STORAGE_KEYS,
    MODES: MODES,
    FILTERS: FILTERS,
    TABS: TABS,
    DECKS: DECKS,
    SUITS: SUITS,
    cards: ALL_CARDS,
    progress: {},      // { [cardId]: "o"|"tri"|"x" }
    daily: null,       // 일일 통계 (아래 loadDaily)
    settings: null,    // { mode, filter, activeTab, currentCardId }
    practiceData: {},  // { [cardId]: { [stepIdx]: {said, hitKeywords, text, done, updatedAt} } }
    checksData: {}     // { [cardId]: { [sectionKey]: "memorized"|"unsure"|"again" } }
  };

  /* ══════════ 공통 유틸 ══════════ */

  app.todayStr = function () {
    var d = new Date();
    return d.getFullYear() + "-" +
      String(d.getMonth() + 1).padStart(2, "0") + "-" +
      String(d.getDate()).padStart(2, "0");
  };

  function loadJSON(key, fallback) {
    try {
      var raw = localStorage.getItem(key);
      return raw ? JSON.parse(raw) : fallback;
    } catch (e) { return fallback; }
  }

  function saveJSON(key, value) {
    try { localStorage.setItem(key, JSON.stringify(value)); } catch (e) { /* 무시 */ }
  }
  app.loadJSON = loadJSON;
  app.saveJSON = saveJSON;

  /* 카드 조회 — 배열 인덱싱 금지, id 맵 경유 */
  var cardMap = null;
  app.cardById = function (id) {
    if (!cardMap) {
      cardMap = {};
      ALL_CARDS.forEach(function (c) { cardMap[c.id] = c; });
    }
    return cardMap[id] || null;
  };

  /* ══════════ 덱 (메이저/마이너 학습 분리) ══════════ */

  app.hasMinorDeck = function () {
    return typeof TAROT_CARDS_MINOR !== "undefined" && TAROT_CARDS_MINOR.length > 0;
  };

  /** 활성 덱의 카드 목록 */
  app.deckCards = function (deck) {
    var d = deck || app.settings.deck;
    return ALL_CARDS.filter(function (c) {
      return d === "minor" ? c.arcana === "minor" : c.arcana !== "minor";
    });
  };

  function cardInDeck(id, deck) {
    var c = app.cardById(id);
    if (!c) return false;
    return deck === "minor" ? c.arcana === "minor" : c.arcana !== "minor";
  }

  var deckListeners = [];
  app.onDeckChange = function (fn) { deckListeners.push(fn); };

  app.setDeck = function (deck) {
    if (DECKS.indexOf(deck) === -1 || deck === app.settings.deck) return;
    if (deck === "minor" && !app.hasMinorDeck()) return;

    // 떠나는 덱의 현재 카드 기억 → 돌아올 때 복원.
    // flashcard 탭은 내부 state.index로 이동하며 탭을 벗어날 때만 settings.currentCardId를
    // 동기화하므로(onLeave), 덱 전환이 같은 탭 안에서 일어나면 값이 낡아 있을 수 있다 —
    // 활성 모듈에 getCurrentCardId가 있으면 그걸로 최신값을 직접 물어본다.
    // (getCurrentCardId는 flashcard만 노출. analysis/practice는 카드 이동 즉시
    //  settings.currentCardId에 저장하므로 폴백값이 곧 최신값이라 노출이 불필요)
    var activeMod = app.modules[app.activeTab];
    var liveCardId = (activeMod && activeMod.getCurrentCardId) ? activeMod.getCurrentCardId() : null;
    app.settings.deckMemory[app.settings.deck] = (liveCardId !== null && liveCardId !== undefined)
      ? liveCardId
      : app.settings.currentCardId;
    app.settings.deck = deck;
    var remembered = app.settings.deckMemory[deck];
    app.settings.currentCardId = cardInDeck(remembered, deck)
      ? remembered
      : app.deckCards(deck)[0].id;
    app.saveSettings();

    document.body.classList.toggle("deck-minor", deck === "minor");
    document.querySelectorAll("#deckSwitch .seg-btn").forEach(function (btn) {
      btn.classList.toggle("is-active", btn.dataset.deck === deck);
    });
    deckListeners.forEach(function (fn) {
      try { fn(); } catch (e) { /* 한 모듈 실패가 전체를 막지 않게 */ }
    });
  };

  /* 분석 데이터 조회 — analysis.js 미로드/카드 결손에도 안전 */
  app.analysisFor = function (cardId) {
    if (typeof TAROT_ANALYSIS === "undefined") return null;
    return TAROT_ANALYSIS[cardId] || null;
  };
  app.observationFramework = function () {
    return (typeof OBSERVATION_FRAMEWORK !== "undefined") ? OBSERVATION_FRAMEWORK : null;
  };

  /* ══════════ 저장소 ══════════ */

  app.loadProgress = function () { app.progress = loadJSON(STORAGE_KEYS.progress, {}); };
  app.saveProgress = function () { saveJSON(STORAGE_KEYS.progress, app.progress); };

  app.loadPractice = function () { app.practiceData = loadJSON(STORAGE_KEYS.analysisPractice, {}); };
  app.savePractice = function () { saveJSON(STORAGE_KEYS.analysisPractice, app.practiceData); };

  app.loadChecks = function () { app.checksData = loadJSON(STORAGE_KEYS.analysisChecks, {}); };
  app.saveChecks = function () { saveJSON(STORAGE_KEYS.analysisChecks, app.checksData); };

  /* 이번 주(월~일) 날짜 문자열 7개 */
  app.currentWeekDates = function () {
    var now = new Date();
    var day = now.getDay(); // 0=일
    var monOffset = (day === 0 ? -6 : 1 - day);
    var dates = [];
    for (var i = 0; i < 7; i++) {
      var d = new Date(now.getFullYear(), now.getMonth(), now.getDate() + monOffset + i);
      dates.push(d.getFullYear() + "-" +
        String(d.getMonth() + 1).padStart(2, "0") + "-" +
        String(d.getDate()).padStart(2, "0"));
    }
    return dates;
  };

  function pruneWeekLog(weekLog) {
    var keep = {};
    var week = app.currentWeekDates();
    Object.keys(weekLog || {}).forEach(function (date) {
      if (week.indexOf(date) !== -1) keep[date] = true;
    });
    return keep;
  }

  /** 일일 통계 로드.
   *  - 날짜 동일: 신규 필드 기본값 병합 (없으면 ++ 시 NaN — Codex P1)
   *  - 날짜 변경: lastStudy + weekLog(주 내 prune)만 이월, 나머지 리셋 (Codex P1) */
  app.loadDaily = function () {
    var d = loadJSON(STORAGE_KEYS.dailyStats, null);
    var today = app.todayStr();
    if (!d || d.date !== today) {
      d = Object.assign({}, DAILY_DEFAULTS, {
        date: today,
        deckRounds: freshDeckRounds(),
        lastStudy: d ? d.lastStudy : null,
        weekLog: pruneWeekLog(d ? d.weekLog : {})
      });
      saveJSON(STORAGE_KEYS.dailyStats, d);
    } else {
      var raw = d;
      d = Object.assign({}, DAILY_DEFAULTS, raw);
      d.weekLog = pruneWeekLog(d.weekLog);
      // 레거시 마이그레이션: 구버전의 rounds/roundSeen/analysisSteps(단일 덱)를 메이저 버킷으로 이관
      if (!raw.deckRounds) {
        d.deckRounds = freshDeckRounds();
        d.deckRounds.major.rounds = raw.rounds || 0;
        d.deckRounds.major.roundSeen = raw.roundSeen || [];
        d.deckRounds.major.steps = raw.analysisSteps || 0;
      } else {
        ["major", "minor"].forEach(function (dk) {
          if (!d.deckRounds[dk]) d.deckRounds[dk] = { rounds: 0, roundSeen: [], steps: 0 };
          if (typeof d.deckRounds[dk].steps !== "number") d.deckRounds[dk].steps = 0;
        });
      }
    }
    app.daily = d;
  };

  app.saveDaily = function () { saveJSON(STORAGE_KEYS.dailyStats, app.daily); };

  /* 자정 롤오버 — 모든 학습 기록 지점에서 선행 호출. 롤오버 시 등록된 리스너 통지 */
  var rolloverListeners = [];
  app.onRollover = function (fn) { rolloverListeners.push(fn); };

  app.ensureDailyFresh = function () {
    if (app.daily && app.daily.date !== app.todayStr()) {
      app.saveDaily();   // 어제 기록 마감
      app.loadDaily();   // 새 날짜 레코드 (lastStudy·weekLog 이월)
      rolloverListeners.forEach(function (fn) {
        try { fn(); } catch (e) { /* 렌더 실패가 학습을 막지 않게 */ }
      });
    }
  };

  /** 학습 행위 공통 기록: 오늘 학습 카드(유니크) + 주간 로그 + 마지막 학습일 */
  app.markStudied = function (cardId) {
    app.ensureDailyFresh();
    if (app.daily.studiedCards.indexOf(cardId) === -1) app.daily.studiedCards.push(cardId);
    app.daily.weekLog[app.todayStr()] = true;
    app.daily.lastStudy = app.todayStr();
    app.saveDaily();
  };

  /* settings — 항상 전체 객체 직렬화 (부분 저장으로 mode/filter 유실 금지 — Codex P1) */
  app.loadSettings = function () {
    var s = loadJSON(STORAGE_KEYS.settings, {});
    var merged = Object.assign({}, SETTINGS_DEFAULTS);
    merged.deckMemory = { major: 0, minor: 22 }; // 중첩 객체는 공유 참조 방지 위해 매번 생성
    if (MODES.indexOf(s.mode) !== -1) merged.mode = s.mode;
    if (FILTERS.indexOf(s.filter) !== -1) merged.filter = s.filter;
    if (TABS.indexOf(s.activeTab) !== -1) merged.activeTab = s.activeTab;
    if (DECKS.indexOf(s.deck) !== -1) merged.deck = s.deck;
    if (SUITS.indexOf(s.minorSuit) !== -1) merged.minorSuit = s.minorSuit;
    if (s.deckMemory) {
      DECKS.forEach(function (dk) {
        // 존재 확인 + 덱 소속 확인 — 오염된 기억값(다른 덱 id)이 영속되지 않게 정화
        var mc = (typeof s.deckMemory[dk] === "number") ? app.cardById(s.deckMemory[dk]) : null;
        if (mc && ((dk === "minor") === (mc.arcana === "minor"))) {
          merged.deckMemory[dk] = s.deckMemory[dk];
        }
      });
    }
    if (typeof s.currentCardId === "number" && app.cardById(s.currentCardId)) {
      merged.currentCardId = s.currentCardId;
    }
    // 마이너 데이터가 없는데 마이너 덱이 저장돼 있으면 메이저로 폴백
    if (merged.deck === "minor" && !app.hasMinorDeck()) merged.deck = "major";
    // 현재 카드가 활성 덱에 없으면 덱 첫 카드로 보정
    var inDeck = app.deckCards(merged.deck).some(function (c) { return c.id === merged.currentCardId; });
    if (!inDeck) merged.currentCardId = app.deckCards(merged.deck)[0].id;
    app.settings = merged;
  };

  app.saveSettings = function () {
    saveJSON(STORAGE_KEYS.settings, app.settings);
  };

  /* ══════════ 완료율 (분석 10단계) ══════════ */

  /** 단계 완료 판정: 자가채점(said) OR 유효 텍스트(trim>=2) OR 섹션 "외움" */
  app.isStepComplete = function (cardId, stepIdx, sectionKey) {
    var p = (app.practiceData[cardId] || {})[stepIdx];
    if (p && (p.said || (p.text && p.text.trim().length >= 2) || p.done)) return true;
    var c = (app.checksData[cardId] || {})[sectionKey];
    return c === "memorized";
  };

  /* ══════════ 탭 라우터 ══════════ */

  app.activeTab = "flashcard";

  app.setActiveTab = function (tab) {
    if (TABS.indexOf(tab) === -1 || tab === app.activeTab) {
      if (tab === app.activeTab) return;
      tab = "flashcard";
    }
    var prev = app.modules[app.activeTab];
    if (prev && prev.onLeave) prev.onLeave();

    TABS.forEach(function (t) { document.body.classList.remove("tab-" + t); });
    document.body.classList.add("tab-" + tab);
    app.activeTab = tab;
    app.settings.activeTab = tab;
    app.saveSettings();

    // 포커스 리셋 — 이전 탭 버튼에 남은 포커스가 단축키를 가로채지 않게
    if (document.activeElement && document.activeElement.blur) document.activeElement.blur();

    document.querySelectorAll("#tabBar .tab-btn").forEach(function (btn) {
      btn.classList.toggle("is-active", btn.dataset.tab === tab);
    });

    var next = app.modules[tab];
    if (next && next.onEnter) next.onEnter();
  };

  /* ══════════ 전역 keydown 디스패처 ══════════ */

  function bindKeyboard() {
    document.addEventListener("keydown", function (e) {
      var el = document.activeElement;
      var tag = (el && el.tagName || "").toLowerCase();

      // 입력 요소 안: Escape=blur만 처리, 나머지는 타이핑 보호
      if (tag === "input" || tag === "textarea" || tag === "select") {
        if (e.key === "Escape") { el.blur(); e.preventDefault(); }
        return;
      }
      if (e.metaKey || e.ctrlKey || e.altKey) return;
      // <summary> 포커스 + Space는 단축키 안내 토글이 우선
      if (tag === "summary" && e.code === "Space") return;

      var mod = app.modules[app.activeTab];
      if (mod && mod.handleKey) mod.handleKey(e);
    });
  }

  /* ══════════ 데이터 초기화 / 내보내기 (records에서 호출) ══════════ */

  /** 학습 데이터 4키만 삭제 — settings(모드·탭·현재카드)는 보존 (Codex P2 정책) */
  app.resetLearningData = function () {
    ["progress", "dailyStats", "analysisPractice", "analysisChecks"].forEach(function (k) {
      try { localStorage.removeItem(STORAGE_KEYS[k]); } catch (e) { /* 무시 */ }
    });
    app.progress = {};
    app.practiceData = {};
    app.checksData = {};
    app.loadDaily();
    app.daily.lastStudy = null;
    app.daily.weekLog = {};
    app.saveDaily();
  };

  app.exportData = function () {
    var payload = {
      exportedAt: new Date().toISOString(),
      appVersion: APP_VERSION,
      progress: app.progress,
      dailyStats: app.daily,
      settings: app.settings,
      analysisPractice: app.practiceData,
      analysisChecks: app.checksData
    };
    var blob = new Blob([JSON.stringify(payload, null, 2)], { type: "application/json" });
    var a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = "tarot-flashnote-backup-" + app.todayStr().replace(/-/g, "") + ".json";
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    setTimeout(function () { URL.revokeObjectURL(a.href); }, 1000);
  };

  /* ══════════ 초기화 오케스트레이션 ══════════ */

  app.modules = {}; // flashcard.js / features.js가 등록

  function init() {
    app.loadProgress();
    app.loadDaily();
    app.loadSettings();
    app.loadPractice();
    app.loadChecks();

    // 모듈 init (등록 순서 고정)
    ["flashcard", "analysis", "practice", "records"].forEach(function (name) {
      var m = app.modules[name];
      if (m && m.init) m.init();
    });

    // 탭 바 바인딩
    document.querySelectorAll("#tabBar .tab-btn").forEach(function (btn) {
      btn.addEventListener("click", function () { app.setActiveTab(btn.dataset.tab); });
    });

    // 덱 스위치 (메이저/마이너) — 마이너 데이터 없으면 숨김
    var deckWrap = document.getElementById("deckSwitchWrap");
    if (deckWrap) {
      if (!app.hasMinorDeck()) {
        deckWrap.hidden = true;
      } else {
        document.querySelectorAll("#deckSwitch .seg-btn").forEach(function (btn) {
          btn.classList.toggle("is-active", btn.dataset.deck === app.settings.deck);
          btn.addEventListener("click", function () { app.setDeck(btn.dataset.deck); });
        });
      }
    }
    document.body.classList.toggle("deck-minor", app.settings.deck === "minor");

    bindKeyboard();

    // 마지막 탭 복원 (activeTab 초기값과 다르면 전환)
    app.activeTab = null; // 강제 첫 적용
    var startTab = app.settings.activeTab || "flashcard";
    app.activeTab = "___none";
    app.setActiveTab(startTab);
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    // 로드 순서상 core가 먼저 실행되므로 이 분기는 거의 안 타지만 방어
    setTimeout(init, 0);
  }

  return app;
})();
