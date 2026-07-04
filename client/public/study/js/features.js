/* ============================================================
 * features.js — 기본분석(analysis) · 분석훈련(practice) · 기록(records) 탭
 *
 * 데이터 소스: TAROT_ANALYSIS (analysis.js, typeof 가드로 접근)
 * 저장: core의 analysisChecks(섹션 체크) / analysisPractice(단계 훈련)
 * ============================================================ */

(function (app) {
  "use strict";

  /* ══════════ 공유 상수 ══════════ */

  // ①~⑩ 정식 순서 = analysisPractice의 stepIdx (0~9) 기준
  var SECTION_DEFS = [
    { key: "summary3sec",         num: "①", title: "3초 요약",            q: "이 카드를 한 문장으로 말하면?", anchor: true },
    { key: "directorIntent",      num: "②", title: "감독의 의도",          q: "라이더웨이트는 왜 이 장면으로 그렸을까?" },
    { key: "story",               num: "③", title: "카드 스토리",          q: "이 장면을 영화처럼 순서대로 말하면?" },
    { key: "symbolPriority",      num: "④", title: "핵심 상징 우선순위",    q: "가장 중요한 상징 3개는 무엇인가?" },
    { key: "observation",         num: "⑤", title: "관찰 — 사분도흐배방거색고속", q: "정보가 가장 많은 렌즈 3개를 골라 각 한 문장으로 관찰하면?" },
    { key: "psychology",          num: "⑥", title: "심리",                q: "이 장면은 어떤 심리 상태를 보여주는가?" },
    { key: "insight",             num: "⑦", title: "통찰",                q: "이 카드가 지금 나에게 주는 한 문장 통찰은?", anchor: true },
    { key: "uprightReversed",     num: "⑧", title: "정방향 / 역방향",       q: "에너지가 자연스럽게 흐를 때와 막힐 때는 어떻게 다른가?" },
    { key: "questionApplication", num: "⑨", title: "질문 적용",            q: "행동, 관계, 사업 질문에 각각 어떻게 적용할 수 있는가?" },
    { key: "memoryFormula",       num: "⑩", title: "암기 공식",            q: "이 카드를 외울 대표 문장은?", anchor: true }
  ];

  var stepIdxOf = {};
  SECTION_DEFS.forEach(function (d, i) { stepIdxOf[d.key] = i; });

  // 훈련 코스 (학습설계 리뷰: 관찰-먼저 3페이즈)
  var COURSE_CORE = ["observation", "symbolPriority", "psychology", "questionApplication"];
  var COURSE_FULL = [
    "observation", "symbolPriority", "story",          // 페이즈1 보기
    "directorIntent", "psychology", "uprightReversed", // 페이즈2 읽기
    "questionApplication", "insight", "summary3sec", "memoryFormula" // 페이즈3 말하기
  ];
  var FULL_PHASES = [
    { name: "보기 · 지각", from: 0, to: 2 },
    { name: "읽기 · 해석", from: 3, to: 5 },
    { name: "말하기 · 산출", from: 6, to: 9 }
  ];

  var CHECK_LABELS = { memorized: "외움", unsure: "애매함", again: "다시보기" };

  var LENS_ORDER = ["people", "mood", "tool", "flow", "background", "direction", "distance", "color", "height", "speed"];
  var LENS_CHAR = { people: "사", mood: "분", tool: "도", flow: "흐", background: "배", direction: "방", distance: "거", color: "색", height: "고", speed: "속" };

  function defOf(key) {
    for (var i = 0; i < SECTION_DEFS.length; i++) if (SECTION_DEFS[i].key === key) return SECTION_DEFS[i];
    return null;
  }

  function sectionOf(a, key) { return a ? a[key] : null; }

  /* DOM 빌더 유틸 */
  function elx(tag, cls, text) {
    var n = document.createElement(tag);
    if (cls) n.className = cls;
    if (text !== undefined && text !== null) n.textContent = text;
    return n;
  }

  function keywordChips(keywords, interactive, activeSet, onToggle) {
    var wrap = elx("div", "kw-chips");
    (keywords || []).forEach(function (kw) {
      var chip = elx(interactive ? "button" : "span", "kw-chip", kw);
      if (interactive) {
        chip.type = "button";
        if (activeSet && activeSet.indexOf(kw) !== -1) chip.classList.add("is-hit");
        chip.addEventListener("click", function () {
          chip.classList.toggle("is-hit");
          if (onToggle) onToggle(kw, chip.classList.contains("is-hit"));
        });
      }
      wrap.appendChild(chip);
    });
    return wrap;
  }

  /** 섹션 본문 렌더러 — analysis 아코디언과 practice 정답 예시가 공용 */
  function renderSectionContent(key, a, opts) {
    opts = opts || {};
    var s = sectionOf(a, key);
    var box = elx("div", "sec-content sec-" + key);
    if (!s) {
      box.appendChild(elx("p", "sec-missing", "이 섹션의 분석 데이터를 준비 중입니다."));
      return box;
    }

    switch (key) {
      case "summary3sec": {
        box.appendChild(elx("p", "sec-big", s.text));
        if (s.note) box.appendChild(elx("p", "sec-note", "☾ " + s.note));
        break;
      }
      case "directorIntent": {
        (s.points || []).forEach(function (p) {
          var item = elx("div", "di-point");
          item.appendChild(elx("p", "di-q", p.question));
          item.appendChild(elx("p", "di-a", p.answer));
          box.appendChild(item);
        });
        if (s.oneLine) box.appendChild(elx("p", "sec-oneline", s.oneLine));
        break;
      }
      case "story": {
        var ol = elx("ol", "story-steps");
        (s.steps || []).forEach(function (st) { ol.appendChild(elx("li", null, st)); });
        box.appendChild(ol);
        if (s.oneLine) box.appendChild(elx("p", "sec-oneline", s.oneLine));
        break;
      }
      case "symbolPriority": {
        (s.symbols || []).forEach(function (sym) {
          var row = elx("div", "sym-row");
          row.appendChild(elx("span", "sym-rank", String(sym.rank)));
          var body = elx("div", "sym-body");
          var nameLine = elx("p", "sym-name", sym.name + " ");
          var stars = "";
          for (var i = 0; i < (sym.importance || 0); i++) stars += "★";
          nameLine.appendChild(elx("span", "sym-stars", stars));
          body.appendChild(nameLine);
          body.appendChild(elx("p", "sym-meaning", sym.meaning));
          row.appendChild(body);
          box.appendChild(row);
        });
        break;
      }
      case "observation": {
        if (s.oneLine) box.appendChild(elx("p", "sec-oneline ob-oneline", s.oneLine));
        var framework = app.observationFramework();
        var chipRow = elx("div", "ob-chips");
        var panel = elx("div", "ob-panel");
        var keyLenses = s.keyLenses || [];
        // 핵심 렌즈 먼저, 나머지 뒤에
        var ordered = keyLenses.concat(LENS_ORDER.filter(function (k) { return keyLenses.indexOf(k) === -1; }));

        function showLens(lensKey) {
          panel.innerHTML = "";
          var fw = framework ? framework[lensKey] : null;
          var head = elx("p", "ob-lens-label", (fw ? fw.label : lensKey) + (keyLenses.indexOf(lensKey) !== -1 ? " ✦ 핵심 렌즈" : ""));
          panel.appendChild(head);
          if (fw && fw.items) {
            var ul = elx("ul", "ob-guide");
            fw.items.forEach(function (it) { ul.appendChild(elx("li", null, it)); });
            panel.appendChild(ul);
          }
          panel.appendChild(elx("p", "ob-sentence", (s.lenses && s.lenses[lensKey]) || "—"));
          chipRow.querySelectorAll(".ob-chip").forEach(function (c) {
            c.classList.toggle("is-active", c.dataset.lens === lensKey);
          });
        }

        ordered.forEach(function (lensKey) {
          var chip = elx("button", "ob-chip" + (keyLenses.indexOf(lensKey) !== -1 ? " is-key" : ""), LENS_CHAR[lensKey] || "?");
          chip.type = "button";
          chip.dataset.lens = lensKey;
          chip.title = framework && framework[lensKey] ? framework[lensKey].label : lensKey;
          chip.addEventListener("click", function () { showLens(lensKey); });
          chipRow.appendChild(chip);
        });
        box.appendChild(chipRow);
        box.appendChild(panel);
        if (ordered.length) showLens(ordered[0]);
        break;
      }
      case "psychology": {
        var ul2 = elx("ul", "psy-bullets");
        (s.bullets || []).forEach(function (b) { ul2.appendChild(elx("li", null, b)); });
        box.appendChild(ul2);
        if (s.oneLine) box.appendChild(elx("p", "sec-oneline", s.oneLine));
        break;
      }
      case "insight": {
        box.appendChild(elx("p", "sec-big insight-text", s.text));
        break;
      }
      case "uprightReversed": {
        var cmp = elx("div", "ur-compare");
        var up = elx("div", "ur-box ur-up");
        up.appendChild(elx("p", "ur-label", "정방향"));
        up.appendChild(elx("p", null, (s.upright && s.upright.meaning) || "—"));
        if (s.upright && s.upright.keywords) up.appendChild(keywordChips(s.upright.keywords, false));
        var rv = elx("div", "ur-box ur-rv");
        rv.appendChild(elx("p", "ur-label", "역방향"));
        [["부족", "lack"], ["과잉", "excess"], ["왜곡", "distortion"]].forEach(function (pair) {
          var row = elx("p", "ur-row");
          row.appendChild(elx("span", "ur-tag", pair[0]));
          row.appendChild(document.createTextNode((s.reversed && s.reversed[pair[1]]) || "—"));
          rv.appendChild(row);
        });
        cmp.appendChild(up);
        cmp.appendChild(rv);
        box.appendChild(cmp);
        break;
      }
      case "questionApplication": {
        var tabs = [["action", "행동"], ["relationship", "관계"], ["business", "사업"], ["health", "건강"]];
        var qRow = elx("div", "qa-chips");
        var qPanel = elx("p", "qa-panel");
        function showQ(k) {
          qPanel.textContent = s[k] || "—";
          qRow.querySelectorAll(".qa-chip").forEach(function (c) {
            c.classList.toggle("is-active", c.dataset.q === k);
          });
        }
        tabs.forEach(function (pair) {
          var chip = elx("button", "qa-chip", pair[1]);
          chip.type = "button";
          chip.dataset.q = pair[0];
          chip.addEventListener("click", function () { showQ(pair[0]); });
          qRow.appendChild(chip);
        });
        box.appendChild(qRow);
        box.appendChild(qPanel);
        showQ("action");
        break;
      }
      case "memoryFormula": {
        (s.formulas || []).forEach(function (f, i) {
          box.appendChild(elx("p", "mf-line", (i + 1) + ". " + f));
        });
        break;
      }
    }

    // 자가채점용 키워드 칩 (섹션에 keywords가 있으면 하단 표시)
    if (s.keywords && !opts.hideKeywords) {
      var kwWrap = elx("div", "sec-kw");
      kwWrap.appendChild(elx("span", "sec-kw-label", "핵심어"));
      kwWrap.appendChild(keywordChips(s.keywords, false));
      box.appendChild(kwWrap);
    }
    return box;
  }

  /* 카드 선택 스트립 (analysis/practice 공용 빌더) */
  function buildCardStrip(prefix, onChange) {
    var prev = document.getElementById(prefix + "PrevCard");
    var next = document.getElementById(prefix + "NextCard");
    var select = document.getElementById(prefix + "CardSelect");
    app.cards.forEach(function (c) {
      var opt = document.createElement("option");
      opt.value = c.id;
      opt.textContent = c.number + " · " + c.koreanName;
      select.appendChild(opt);
    });
    prev.addEventListener("click", function () { onChange(step(-1)); });
    next.addEventListener("click", function () { onChange(step(1)); });
    select.addEventListener("change", function () { onChange(parseInt(select.value, 10)); select.blur(); });
    function step(delta) {
      var ids = app.cards.map(function (c) { return c.id; });
      var pos = ids.indexOf(app.settings.currentCardId);
      if (pos === -1) pos = 0;
      return ids[(pos + delta + ids.length) % ids.length];
    }
    return { sync: function (id) { select.value = String(id); } };
  }

  function setCurrentCard(id) {
    app.settings.currentCardId = id;
    app.saveSettings();
  }

  /* ════════════════════════════════════════════
   * 기본분석 탭
   * ════════════════════════════════════════════ */

  app.modules.analysis = (function () {
    var st = {
      openKey: "summary3sec",   // 단일 개방 아코디언
      training: false,
      trainList: [],            // 훈련 순서 (섹션 키)
      trainIdx: 0,
      revealed: false,          // 현재 훈련 섹션 베일 해제 여부
      reviewOnly: false,        // 다시보기만 돌기
      countdownTimer: null
    };
    var dom = {};
    var strip = null;

    function cacheDom() {
      dom.image = document.getElementById("anImage");
      dom.imgFallback = document.getElementById("anImgFallback");
      dom.number = document.getElementById("anNumber");
      dom.name = document.getElementById("anName");
      dom.krName = document.getElementById("anKrName");
      dom.sections = document.getElementById("anSections");
      dom.missing = document.getElementById("anMissing");
      dom.trainBtn = document.getElementById("anTrainBtn");
      dom.reviewBtn = document.getElementById("anReviewOnlyBtn");
    }

    function currentCardId() { return app.settings.currentCardId; }

    function checksFor(cardId) { return app.checksData[cardId] || {}; }

    function setSectionCheck(key, value) {
      var cardId = currentCardId();
      app.ensureDailyFresh();
      if (!app.checksData[cardId]) app.checksData[cardId] = {};
      var wasComplete = app.isStepComplete(cardId, stepIdxOf[key], key);
      if (app.checksData[cardId][key] === value) {
        delete app.checksData[cardId][key]; // 토글 해제
      } else {
        app.checksData[cardId][key] = value;
      }
      app.saveChecks();
      if (!wasComplete && app.isStepComplete(cardId, stepIdxOf[key], key)) {
        app.daily.analysisSteps++;
      }
      app.markStudied(cardId);
      renderBadges();
      renderCheckRow(key);
    }

    function trainingSections() {
      if (!st.reviewOnly) return SECTION_DEFS.map(function (d) { return d.key; });
      var checks = checksFor(currentCardId());
      var list = SECTION_DEFS.filter(function (d) { return checks[d.key] === "again"; }).map(function (d) { return d.key; });
      return list;
    }

    /* ── 렌더 ── */

    function render() {
      var card = app.cardById(currentCardId());
      if (!card) return;
      if (strip) strip.sync(card.id);

      dom.number.textContent = card.number;
      dom.name.textContent = card.englishName;
      dom.krName.textContent = card.koreanName;
      dom.imgFallback.hidden = true;
      dom.image.style.display = "";
      dom.image.src = card.image;
      dom.image.alt = card.englishName + " 카드 이미지";

      var a = app.analysisFor(card.id);
      dom.missing.hidden = !!a;
      dom.sections.innerHTML = "";
      if (!a) return;

      SECTION_DEFS.forEach(function (def) {
        dom.sections.appendChild(buildSection(def, a));
      });
      renderBadges();
      applyTrainingView();
    }

    function buildSection(def, a) {
      var sec = elx("div", "an-section");
      sec.dataset.key = def.key;

      var head = elx("button", "an-head");
      head.type = "button";
      head.appendChild(elx("span", "an-num", def.num));
      head.appendChild(elx("span", "an-title", def.title));
      head.appendChild(elx("span", "an-badge"));
      head.appendChild(elx("span", "an-caret", "▾"));
      head.addEventListener("click", function () {
        if (st.training) return; // 훈련 중엔 헤더 클릭으로 건너뛰지 않음
        toggleSection(def.key);
      });
      sec.appendChild(head);

      var body = elx("div", "an-body");
      body.hidden = def.key !== st.openKey;

      // 베일 (훈련 모드): 본문 대신 질문 + 지연 게이트 버튼
      var veil = elx("div", "an-veil");
      veil.hidden = true;
      veil.appendChild(elx("p", "an-veil-q", "❝ " + def.q + " ❞"));
      veil.appendChild(elx("p", "an-veil-say", "먼저 소리 내어 말해보세요"));
      var revealBtn = elx("button", "an-reveal-btn", "정답 보기");
      revealBtn.type = "button";
      revealBtn.disabled = true;
      revealBtn.addEventListener("click", function () { revealCurrent(); });
      veil.appendChild(revealBtn);
      body.appendChild(veil);

      var content = renderSectionContent(def.key, a);
      body.appendChild(content);

      // 체크 3버튼
      var checkRow = elx("div", "an-check-row");
      [["memorized", "외움"], ["unsure", "애매함"], ["again", "다시보기"]].forEach(function (pair) {
        var b = elx("button", "an-check an-check-" + pair[0], pair[1]);
        b.type = "button";
        b.dataset.value = pair[0];
        b.addEventListener("click", function () { setSectionCheck(def.key, pair[0]); });
        checkRow.appendChild(b);
      });
      body.appendChild(checkRow);

      sec.appendChild(body);
      return sec;
    }

    function sectionEl(key) {
      return dom.sections.querySelector('.an-section[data-key="' + key + '"]');
    }

    function renderBadges() {
      var checks = checksFor(currentCardId());
      SECTION_DEFS.forEach(function (def) {
        var sec = sectionEl(def.key);
        if (!sec) return;
        var badge = sec.querySelector(".an-badge");
        var v = checks[def.key];
        badge.textContent = v ? CHECK_LABELS[v] : "";
        badge.className = "an-badge" + (v ? " bg-" + v : "");
        renderCheckRow(def.key);
      });
    }

    function renderCheckRow(key) {
      var sec = sectionEl(key);
      if (!sec) return;
      var v = checksFor(currentCardId())[key];
      sec.querySelectorAll(".an-check").forEach(function (b) {
        b.classList.toggle("is-active", b.dataset.value === v);
      });
    }

    function toggleSection(key) {
      if (st.openKey === key) {
        st.openKey = null;
      } else {
        st.openKey = key;
      }
      SECTION_DEFS.forEach(function (def) {
        var sec = sectionEl(def.key);
        if (!sec) return;
        var open = def.key === st.openKey;
        sec.querySelector(".an-body").hidden = !open;
        sec.classList.toggle("is-open", open);
      });
      if (st.openKey) {
        var openSec = sectionEl(st.openKey);
        if (openSec) openSec.scrollIntoView({ behavior: "smooth", block: "nearest" });
      }
    }

    /* ── 훈련 모드 ── */

    function startTraining() {
      var list = trainingSections();
      if (list.length === 0) {
        dom.trainBtn.textContent = "다시보기 섹션이 없습니다";
        setTimeout(updateTrainBtn, 1500);
        return;
      }
      st.training = true;
      st.trainList = list;
      st.trainIdx = 0;
      st.revealed = false;
      applyTrainingView();
      app.markStudied(currentCardId());
    }

    function endTraining() {
      st.training = false;
      st.revealed = false;
      clearCountdown();
      st.openKey = "summary3sec";
      applyTrainingView(); // 비훈련 브랜치가 openKey 기준으로 hidden/is-open을 한 번에 복원
      var el = sectionEl(st.openKey);
      if (el) el.scrollIntoView({ behavior: "smooth", block: "nearest" });
    }

    function clearCountdown() {
      if (st.countdownTimer) { clearInterval(st.countdownTimer); st.countdownTimer = null; }
    }

    /** 훈련 뷰 적용 — 베일 상태 계산 후 본문 표시 (무플래시: 전부 동기 1패스) */
    function applyTrainingView() {
      clearCountdown();
      updateTrainBtn();
      var currentKey = st.training ? st.trainList[st.trainIdx] : null;

      SECTION_DEFS.forEach(function (def) {
        var sec = sectionEl(def.key);
        if (!sec) return;
        var body = sec.querySelector(".an-body");
        var veil = sec.querySelector(".an-veil");
        var content = sec.querySelector(".sec-content");
        var checkRow = sec.querySelector(".an-check-row");

        if (st.training) {
          var isCurrent = def.key === currentKey;
          body.hidden = !isCurrent;
          sec.classList.toggle("is-open", isCurrent);
          sec.classList.toggle("is-train-current", isCurrent);
          if (isCurrent) {
            veil.hidden = st.revealed;
            content.style.display = st.revealed ? "" : "none";
            checkRow.style.display = st.revealed ? "" : "none";
            if (!st.revealed) startCountdown(veil.querySelector(".an-reveal-btn"));
            sec.scrollIntoView({ behavior: "smooth", block: "center" });
          }
        } else {
          sec.classList.remove("is-train-current");
          veil.hidden = true;
          content.style.display = "";
          checkRow.style.display = "";
          body.hidden = def.key !== st.openKey;
          sec.classList.toggle("is-open", def.key === st.openKey);
        }
      });
    }

    /** 지연 게이트: 3초 카운트다운 후 정답 버튼 활성화 */
    function startCountdown(btn) {
      var remain = 3;
      btn.disabled = true;
      btn.textContent = "정답 보기 (" + remain + ")";
      st.countdownTimer = setInterval(function () {
        remain--;
        if (remain <= 0) {
          clearCountdown();
          btn.disabled = false;
          btn.textContent = "정답 보기 (A)";
        } else {
          btn.textContent = "정답 보기 (" + remain + ")";
        }
      }, 1000);
    }

    function revealCurrent() {
      if (!st.training || st.revealed) return;
      var btn = sectionEl(st.trainList[st.trainIdx]).querySelector(".an-reveal-btn");
      if (btn.disabled) return; // 지연 게이트 미해제
      st.revealed = true;
      app.markStudied(currentCardId());
      applyTrainingView();
    }

    function trainStep(delta) {
      if (!st.training) return;
      var next = st.trainIdx + delta;
      if (next < 0) return;
      if (next >= st.trainList.length) { endTraining(); return; }
      st.trainIdx = next;
      st.revealed = false;
      applyTrainingView();
    }

    function updateTrainBtn() {
      if (st.training) {
        dom.trainBtn.textContent = "훈련 종료 (" + (st.trainIdx + 1) + "/" + st.trainList.length + ")";
        dom.trainBtn.classList.add("is-on");
      } else {
        dom.trainBtn.textContent = "▶ 훈련 시작 — 가리고 말하기";
        dom.trainBtn.classList.remove("is-on");
      }
      dom.reviewBtn.classList.toggle("is-active", st.reviewOnly);
    }

    function changeCard(id) {
      endTrainingSilently();
      setCurrentCard(id);
      st.openKey = "summary3sec";
      render();
    }

    function endTrainingSilently() {
      st.training = false;
      st.revealed = false;
      clearCountdown();
    }

    /* ── 키보드 ── */

    function handleKey(e) {
      switch (e.code) {
        case "ArrowRight": e.preventDefault(); moveCardBy(1); break;
        case "ArrowLeft":  e.preventDefault(); moveCardBy(-1); break;
        case "Space":
          e.preventDefault();
          if (st.training) { if (!st.revealed) revealCurrent(); else trainStep(1); }
          else if (st.openKey) toggleSection(st.openKey);
          else toggleSection("summary3sec");
          break;
        case "KeyN":
          if (st.training) trainStep(1);
          else openRelative(1);
          break;
        case "KeyP":
          if (st.training) trainStep(-1);
          else openRelative(-1);
          break;
        case "KeyA":
          if (st.training) revealCurrent();
          break;
        case "Digit1": case "Numpad1": checkCurrent("memorized"); break;
        case "Digit2": case "Numpad2": checkCurrent("unsure"); break;
        case "Digit3": case "Numpad3": checkCurrent("again"); break;
      }
    }

    function checkCurrent(value) {
      var key = st.training ? st.trainList[st.trainIdx] : st.openKey;
      if (!key) return;
      if (st.training && !st.revealed) return; // 인출 전 채점 차단
      setSectionCheck(key, value);
    }

    function openRelative(delta) {
      var keys = SECTION_DEFS.map(function (d) { return d.key; });
      var pos = st.openKey ? keys.indexOf(st.openKey) : -1;
      var next = Math.min(keys.length - 1, Math.max(0, pos + delta));
      if (keys[next] === st.openKey) return; // 경계: toggle로 닫지 않고 유지
      toggleSection(keys[next]);
    }

    function moveCardBy(delta) {
      var ids = app.cards.map(function (c) { return c.id; });
      var pos = ids.indexOf(currentCardId());
      if (pos === -1) pos = 0;
      changeCard(ids[(pos + delta + ids.length) % ids.length]);
    }

    return {
      init: function () {
        cacheDom();
        strip = buildCardStrip("an", changeCard);
        dom.image.addEventListener("error", function () {
          dom.image.style.display = "none";
          dom.imgFallback.hidden = false;
        });
        dom.trainBtn.addEventListener("click", function () {
          if (st.training) endTraining(); else startTraining();
        });
        dom.reviewBtn.addEventListener("click", function () {
          st.reviewOnly = !st.reviewOnly;
          updateTrainBtn();
        });
        app.onRollover(function () { /* 통계 없음 */ });
      },
      render: render,
      handleKey: handleKey,
      openCard: function (id) { changeCard(id); }, // records에서 진입용
      onEnter: function () { st.openKey = "summary3sec"; endTrainingSilently(); render(); },
      onLeave: function () { endTrainingSilently(); clearCountdown(); }
    };
  })();

  /* ════════════════════════════════════════════
   * 분석훈련 탭
   * ════════════════════════════════════════════ */

  app.modules.practice = (function () {
    var TIMER_TOTAL = 30;
    var st = {
      course: "core",          // core | full
      pos: 0,
      revealed: false,
      hintShown: false,
      timer: { remain: TIMER_TOTAL, running: false, intervalId: null }
    };
    var dom = {};
    var strip = null;
    var pendingSave = null;    // debounce 저장 {cardId, stepIdx}
    var saveTimer = null;
    var advanceTimer = null;   // 채점 후 자동 진행 지연 (탭/카드 전환 시 반드시 해제)

    function clearAdvance() {
      if (advanceTimer) { clearTimeout(advanceTimer); advanceTimer = null; }
    }

    function courseKeys() { return st.course === "core" ? COURSE_CORE : COURSE_FULL; }
    function currentKey() { return courseKeys()[st.pos]; }
    function currentCardId() { return app.settings.currentCardId; }

    function cacheDom() {
      ["prImage", "prImgFallback", "prCardName", "prPhase", "prDots", "prNum", "prQuestion",
       "prTimerWrap", "prRing", "prTimeLeft", "prPauseBtn", "prRevealBtn", "prHintBtn",
       "prAnswer", "prHint", "prModel", "prKeywords", "prAnchorWrap", "prAnchorInput",
       "prMemo", "prMemoDetails", "prPrevStep", "prNextStep", "prDone"].forEach(function (id) {
        dom[id] = document.getElementById(id);
      });
    }

    function entryFor(cardId, stepIdx) {
      var byCard = app.practiceData[cardId] || {};
      return byCard[stepIdx] || null;
    }

    function saveEntry(cardId, stepIdx, patch) {
      app.ensureDailyFresh();
      if (!app.practiceData[cardId]) app.practiceData[cardId] = {};
      var key = courseKeysSafe(stepIdx);
      var wasComplete = app.isStepComplete(cardId, stepIdx, key);
      var entry = app.practiceData[cardId][stepIdx] || { said: null, hitKeywords: [], text: "", memo: "", done: false };
      Object.assign(entry, patch, { updatedAt: new Date().toISOString() });
      app.practiceData[cardId][stepIdx] = entry;
      app.savePractice();
      if (!wasComplete && app.isStepComplete(cardId, stepIdx, key)) {
        app.daily.analysisSteps++;
        app.saveDaily();
      }
    }

    function courseKeysSafe(stepIdx) {
      return SECTION_DEFS[stepIdx] ? SECTION_DEFS[stepIdx].key : "";
    }

    /* debounce 저장 + flush (Codex P2: visibilitychange/pagehide 포함) */
    function queueTextSave() {
      var cardId = currentCardId();
      var stepIdx = stepIdxOf[currentKey()];
      pendingSave = { cardId: cardId, stepIdx: stepIdx };
      if (saveTimer) clearTimeout(saveTimer);
      saveTimer = setTimeout(flushTextSave, 500);
    }

    function flushTextSave() {
      if (saveTimer) { clearTimeout(saveTimer); saveTimer = null; }
      if (!pendingSave) return;
      var p = pendingSave;
      pendingSave = null;
      saveEntry(p.cardId, p.stepIdx, {
        text: dom.prAnchorInput.value || "",
        memo: dom.prMemo.value || ""
      });
    }

    /* ── 타이머 ── */

    function timerReset() {
      timerStop();
      st.timer.remain = TIMER_TOTAL;
      updateRing();
    }

    function timerStart() {
      if (st.timer.running || st.revealed) return;
      st.timer.running = true;
      dom.prPauseBtn.textContent = "일시정지 (Space)";
      st.timer.intervalId = setInterval(function () {
        st.timer.remain--;
        updateRing();
        if (st.timer.remain <= 0) reveal();
      }, 1000);
    }

    function timerStop() {
      st.timer.running = false;
      dom.prPauseBtn.textContent = "재개 (Space)";
      if (st.timer.intervalId) { clearInterval(st.timer.intervalId); st.timer.intervalId = null; }
    }

    function timerToggle() {
      if (st.revealed) return;
      if (st.timer.running) timerStop(); else timerStart();
    }

    function updateRing() {
      dom.prTimeLeft.textContent = st.timer.remain;
      var pct = (st.timer.remain / TIMER_TOTAL) * 360;
      dom.prRing.style.background =
        "conic-gradient(var(--gold) " + pct + "deg, rgba(201,162,92,0.15) " + pct + "deg)";
    }

    /* ── 렌더 ── */

    function render() {
      var card = app.cardById(currentCardId());
      if (!card) return;
      if (strip) strip.sync(card.id);

      dom.prImgFallback.hidden = true;
      dom.prImage.style.display = "";
      dom.prImage.src = card.image;
      dom.prImage.alt = card.englishName;
      dom.prCardName.textContent = card.number + " · " + card.englishName + " · " + card.koreanName;

      document.querySelectorAll("#prCourse .seg-btn").forEach(function (b) {
        b.classList.toggle("is-active", b.dataset.course === st.course);
      });

      renderStep();
    }

    function renderStep() {
      var keys = courseKeys();
      if (st.pos >= keys.length) st.pos = keys.length - 1;
      if (st.pos < 0) st.pos = 0;
      var def = defOf(currentKey());
      var cardId = currentCardId();
      var stepIdx = stepIdxOf[def.key];
      var a = app.analysisFor(cardId);

      // 페이즈 라벨
      if (st.course === "full") {
        var phase = FULL_PHASES.find(function (p) { return st.pos >= p.from && st.pos <= p.to; });
        dom.prPhase.textContent = phase ? ("페이즈 " + (FULL_PHASES.indexOf(phase) + 1) + "/3 — " + phase.name) : "";
      } else {
        dom.prPhase.textContent = "핵심 코스 — 이미지→상징→심리→적용";
      }

      // 진행 도트
      dom.prDots.innerHTML = "";
      keys.forEach(function (k, i) {
        var dot = elx("button", "pr-dot", "");
        dot.type = "button";
        var d = defOf(k);
        dot.title = d.num + " " + d.title;
        if (app.isStepComplete(cardId, stepIdxOf[k], k)) dot.classList.add("is-done");
        if (i === st.pos) dot.classList.add("is-current");
        dot.addEventListener("click", function () { gotoStep(i); });
        dom.prDots.appendChild(dot);
      });

      dom.prNum.textContent = def.num + " " + def.title;
      dom.prQuestion.textContent = def.q;

      // 상태 리셋
      st.revealed = false;
      st.hintShown = false;
      dom.prHint.hidden = true;
      dom.prAnswer.hidden = true;
      dom.prTimerWrap.hidden = false;
      timerReset();
      timerStart();

      // 완주 표시
      var doneCount = keys.filter(function (k) { return app.isStepComplete(cardId, stepIdxOf[k], k); }).length;
      dom.prDone.textContent = doneCount === keys.length ? "🎉 이 코스 완주!" : "";

      renderAnswerArea(def, a, cardId, stepIdx);
    }

    /** 정답 영역은 미리 구성하되 hidden (베일 원칙 — 공개는 reveal()에서만) */
    function renderAnswerArea(def, a, cardId, stepIdx) {
      var s = sectionOf(a, def.key);

      dom.prModel.innerHTML = "";
      dom.prModel.appendChild(renderSectionContent(def.key, a, { hideKeywords: true }));

      // 키워드 칩 (탭해서 자가 대조)
      var saved = entryFor(cardId, stepIdx);
      dom.prKeywords.innerHTML = "";
      // 키워드 칩 소스: keywords → (관찰) 핵심 렌즈 라벨 → (정역) upright.keywords
      var kws = [];
      if (s) {
        if (s.keywords) kws = s.keywords;
        else if (s.keyLenses) {
          var fw = app.observationFramework();
          kws = s.keyLenses.map(function (k) { return fw && fw[k] ? fw[k].label : k; });
        }
        else if (s.upright && s.upright.keywords) kws = s.upright.keywords;
      }
      if (kws.length) {
        dom.prKeywords.appendChild(keywordChips(kws, true, saved ? saved.hitKeywords : [], function (kw, on) {
          var entry = entryFor(cardId, stepIdx) || { hitKeywords: [] };
          var hits = (entry.hitKeywords || []).slice();
          var idx = hits.indexOf(kw);
          if (on && idx === -1) hits.push(kw);
          if (!on && idx !== -1) hits.splice(idx, 1);
          saveEntry(cardId, stepIdx, { hitKeywords: hits });
        }));
      }

      // 앵커 단계 한 줄 입력
      dom.prAnchorWrap.hidden = !def.anchor;
      dom.prAnchorInput.value = saved && saved.text ? saved.text : "";
      dom.prMemo.value = saved && saved.memo ? saved.memo : "";

      // 힌트 = oneLine/note
      var hint = s ? (s.oneLine || s.note || (s.text ? "핵심어: " + (s.keywords || []).join(", ") : "")) : "";
      dom.prHint.textContent = hint ? "힌트 — " + hint : "힌트가 없습니다";

      // 채점 버튼 상태
      document.querySelectorAll("#prGrade .pr-grade-btn").forEach(function (b) {
        b.classList.toggle("is-active", !!saved && saved.said === b.dataset.said);
      });
    }

    function reveal() {
      if (st.revealed) return;
      st.revealed = true;
      timerStop();
      dom.prTimerWrap.hidden = true;
      dom.prAnswer.hidden = false;
      app.markStudied(currentCardId());
    }

    function showHint() {
      st.hintShown = !st.hintShown;
      dom.prHint.hidden = !st.hintShown;
    }

    function grade(said) {
      if (!st.revealed) return;
      var cardId = currentCardId();
      var stepIdx = stepIdxOf[currentKey()];
      flushTextSave();
      saveEntry(cardId, stepIdx, { said: said, done: true });
      app.markStudied(cardId);
      document.querySelectorAll("#prGrade .pr-grade-btn").forEach(function (b) {
        b.classList.toggle("is-active", b.dataset.said === said);
      });
      clearAdvance();
      advanceTimer = setTimeout(function () {
        advanceTimer = null;
        if (app.activeTab !== "practice") return; // 탭 이탈 후 발화 방지 (타이머 재시작 누수)
        gotoStep(st.pos + 1);
      }, 450);
    }

    function gotoStep(pos) {
      flushTextSave();
      var keys = courseKeys();
      if (pos >= keys.length) {
        st.pos = keys.length - 1;
        renderStep(); // 마지막 단계 유지 + 완주 표시 갱신
        return;
      }
      st.pos = Math.max(0, pos);
      renderStep();
    }

    function changeCard(id) {
      flushTextSave();
      clearAdvance();
      timerStop();
      setCurrentCard(id);
      st.pos = 0;
      render();
    }

    function moveCardBy(delta) {
      var ids = app.cards.map(function (c) { return c.id; });
      var pos = ids.indexOf(currentCardId());
      if (pos === -1) pos = 0;
      changeCard(ids[(pos + delta + ids.length) % ids.length]);
    }

    function setCourse(course) {
      flushTextSave();
      clearAdvance();
      st.course = course;
      st.pos = 0;
      render();
    }

    function handleKey(e) {
      switch (e.code) {
        case "ArrowRight": e.preventDefault(); moveCardBy(1); break;
        case "ArrowLeft":  e.preventDefault(); moveCardBy(-1); break;
        case "Space": e.preventDefault(); timerToggle(); break;
        case "KeyA": if (!st.revealed) reveal(); break;
        case "KeyH": showHint(); break;
        case "KeyN": gotoStep(st.pos + 1); break;
        case "KeyP": gotoStep(st.pos - 1); break;
        case "KeyM":
          e.preventDefault();
          dom.prMemoDetails.open = true;
          if (dom.prAnswer.hidden) reveal(); // 메모는 정답 화면에 있으므로 공개
          dom.prMemo.focus();
          break;
        case "Digit1": case "Numpad1": grade("smooth"); break;
        case "Digit2": case "Numpad2": grade("stumble"); break;
        case "Digit3": case "Numpad3": grade("fail"); break;
      }
    }

    return {
      init: function () {
        cacheDom();
        strip = buildCardStrip("pr", changeCard);
        dom.prImage.addEventListener("error", function () {
          dom.prImage.style.display = "none";
          dom.prImgFallback.hidden = false;
        });
        document.querySelectorAll("#prCourse .seg-btn").forEach(function (b) {
          b.addEventListener("click", function () { setCourse(b.dataset.course); });
        });
        dom.prPauseBtn.addEventListener("click", timerToggle);
        dom.prRevealBtn.addEventListener("click", reveal);
        dom.prHintBtn.addEventListener("click", showHint);
        dom.prPrevStep.addEventListener("click", function () { gotoStep(st.pos - 1); });
        dom.prNextStep.addEventListener("click", function () { gotoStep(st.pos + 1); });
        document.querySelectorAll("#prGrade .pr-grade-btn").forEach(function (b) {
          b.addEventListener("click", function () { grade(b.dataset.said); });
        });
        dom.prAnchorInput.addEventListener("input", queueTextSave);
        dom.prMemo.addEventListener("input", queueTextSave);
        dom.prAnchorInput.addEventListener("blur", flushTextSave);
        dom.prMemo.addEventListener("blur", flushTextSave);
        // 모바일 Safari 대응 flush 트리거
        window.addEventListener("beforeunload", flushTextSave);
        window.addEventListener("pagehide", flushTextSave);
        document.addEventListener("visibilitychange", function () {
          if (document.visibilityState === "hidden") flushTextSave();
        });
      },
      render: render,
      handleKey: handleKey,
      onEnter: function () { st.pos = 0; render(); },
      onLeave: function () { flushTextSave(); clearAdvance(); timerStop(); }
    };
  })();

  /* ════════════════════════════════════════════
   * 기록 탭
   * ════════════════════════════════════════════ */

  app.modules.records = (function () {
    var dom = {};

    function cacheDom() {
      ["recStudied", "recSteps", "recRounds", "recLast", "recWeekDots", "recWeekCount",
       "recTodayCard", "recWeakList", "recWeakEmpty", "recExportBtn", "recResetBtn"].forEach(function (id) {
        dom[id] = document.getElementById(id);
      });
    }

    function completionFor(cardId) {
      var n = 0;
      SECTION_DEFS.forEach(function (def, i) {
        if (app.isStepComplete(cardId, i, def.key)) n++;
      });
      return n;
    }

    /** 오늘의 카드 — 결정적 선택 (Codex P2): 후보군 X → △ → 완료율 최저 → 전체 */
    function todaysCard() {
      var xs = [], tris = [];
      app.cards.forEach(function (c) {
        if (app.progress[c.id] === "x") xs.push(c.id);
        else if (app.progress[c.id] === "tri") tris.push(c.id);
      });
      var pool;
      if (xs.length) pool = xs;
      else if (tris.length) pool = tris;
      else {
        var min = 11, ids = [];
        app.cards.forEach(function (c) {
          var comp = completionFor(c.id);
          if (comp < min) { min = comp; ids = [c.id]; }
          else if (comp === min) ids.push(c.id);
        });
        pool = ids.length ? ids : app.cards.map(function (c) { return c.id; });
      }
      var seed = 0;
      var t = app.todayStr();
      for (var i = 0; i < t.length; i++) seed += t.charCodeAt(i);
      return app.cardById(pool[seed % pool.length]);
    }

    function render() {
      app.ensureDailyFresh();

      dom.recStudied.textContent = app.daily.studiedCards.length;
      dom.recSteps.textContent = app.daily.analysisSteps;
      dom.recRounds.textContent = app.daily.rounds;
      dom.recLast.textContent = app.daily.lastStudy || "—";

      // 주간 도트 (월~일)
      dom.recWeekDots.innerHTML = "";
      var week = app.currentWeekDates();
      var today = app.todayStr();
      var count = 0;
      var dayNames = ["월", "화", "수", "목", "금", "토", "일"];
      week.forEach(function (date, i) {
        var dot = elx("span", "wk-dot", dayNames[i]);
        if (app.daily.weekLog[date]) { dot.classList.add("is-on"); count++; }
        if (date === today) dot.classList.add("is-today");
        dom.recWeekDots.appendChild(dot);
      });
      dom.recWeekCount.textContent = "이번 주 " + count + "/7일";

      // 오늘의 카드
      var tc = todaysCard();
      dom.recTodayCard.innerHTML = "";
      if (tc) {
        var banner = elx("button", "today-card");
        banner.type = "button";
        var img = document.createElement("img");
        img.src = tc.image;
        img.alt = "";
        img.addEventListener("error", function () { img.style.display = "none"; });
        banner.appendChild(img);
        var txt = elx("div", "today-card-txt");
        txt.appendChild(elx("span", "today-card-label", "오늘의 카드"));
        txt.appendChild(elx("strong", null, tc.number + " · " + tc.koreanName));
        txt.appendChild(elx("span", "today-card-sub", "탭하면 기본분석으로 이동"));
        banner.appendChild(txt);
        banner.addEventListener("click", function () {
          app.modules.analysis.openCard(tc.id);
          app.setActiveTab("analysis");
        });
        dom.recTodayCard.appendChild(banner);
      }

      // 약한 카드 리스트 (X 먼저, 그다음 △ — 3중 정렬 없음)
      dom.recWeakList.innerHTML = "";
      var weak = [];
      app.cards.forEach(function (c) {
        if (app.progress[c.id] === "x") weak.push({ card: c, check: "x" });
      });
      app.cards.forEach(function (c) {
        if (app.progress[c.id] === "tri") weak.push({ card: c, check: "tri" });
      });
      dom.recWeakEmpty.hidden = weak.length > 0;
      weak.forEach(function (w) {
        var li = elx("li", "weak-row");
        var btn = elx("button", "weak-btn");
        btn.type = "button";
        btn.appendChild(elx("span", "weak-check wc-" + w.check, w.check === "x" ? "X" : "△"));
        btn.appendChild(elx("span", "weak-name", w.card.number + " · " + w.card.koreanName));
        var comp = completionFor(w.card.id);
        var bar = elx("span", "weak-bar");
        var fill = elx("span", "weak-fill");
        fill.style.width = (comp * 10) + "%";
        bar.appendChild(fill);
        btn.appendChild(bar);
        btn.appendChild(elx("span", "weak-comp", comp + "/10"));
        btn.addEventListener("click", function () {
          app.modules.analysis.openCard(w.card.id);
          app.setActiveTab("analysis");
        });
        li.appendChild(btn);
        dom.recWeakList.appendChild(li);
      });
    }

    function resetAll() {
      var ok = window.confirm(
        "학습 데이터를 초기화할까요?\n\n삭제: O/△/X 체크, 일일 통계, 분석훈련 입력, 섹션 체크 (4개 항목)\n유지: 모드·필터·탭 등 설정은 유지됩니다"
      );
      if (!ok) return;
      app.resetLearningData();
      app.modules.flashcard.render();
      render();
    }

    return {
      init: function () {
        cacheDom();
        dom.recExportBtn.addEventListener("click", app.exportData);
        dom.recResetBtn.addEventListener("click", resetAll);
        app.onRollover(render);
      },
      render: render,
      handleKey: function () { /* 기록 탭 단축키 없음 */ },
      onEnter: render,
      onLeave: function () { }
    };
  })();

})(TarotApp);
