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

  var SETTINGS_DEFAULTS = { mode: "3s", filter: "all", activeTab: "flashcard", currentCardId: 0 };
  var DAILY_DEFAULTS = {
    flips: 0, rounds: 0, roundSeen: [],
    analysisSteps: 0, studiedCards: [], weekLog: {}
  };

  var app = {
    version: APP_VERSION,
    STORAGE_KEYS: STORAGE_KEYS,
    MODES: MODES,
    FILTERS: FILTERS,
    TABS: TABS,
    cards: TAROT_CARDS,
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

  /* 카드 조회 — TAROT_CARDS[id] 직접 인덱싱 금지 (마이너 아르카나 확장 대비) */
  var cardMap = null;
  app.cardById = function (id) {
    if (!cardMap) {
      cardMap = {};
      TAROT_CARDS.forEach(function (c) { cardMap[c.id] = c; });
    }
    return cardMap[id] || null;
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
        lastStudy: d ? d.lastStudy : null,
        weekLog: pruneWeekLog(d ? d.weekLog : {})
      });
      saveJSON(STORAGE_KEYS.dailyStats, d);
    } else {
      d = Object.assign({}, DAILY_DEFAULTS, d);
      d.weekLog = pruneWeekLog(d.weekLog);
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
    if (MODES.indexOf(s.mode) !== -1) merged.mode = s.mode;
    if (FILTERS.indexOf(s.filter) !== -1) merged.filter = s.filter;
    if (TABS.indexOf(s.activeTab) !== -1) merged.activeTab = s.activeTab;
    if (typeof s.currentCardId === "number" && app.cardById(s.currentCardId)) {
      merged.currentCardId = s.currentCardId;
    }
    app.settings = merged;
  };

  app.saveSettings = function () {
    saveJSON(STORAGE_KEYS.settings, Object.assign({}, SETTINGS_DEFAULTS, app.settings));
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
