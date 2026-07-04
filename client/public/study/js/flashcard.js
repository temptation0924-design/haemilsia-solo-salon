/* ============================================================
 * flashcard.js — 빠른회독 탭 (기존 app.js의 최소 API 추출 이동)
 *
 * 이동 원칙: 내부 로직은 v1과 동일 유지, 변경점은
 *   - 저장소(progress/daily/settings)를 core(app.*)로 위임
 *   - 전역 keydown 리스너 제거 → handleKey(e) 노출 (core가 라우팅)
 *   - body.className 통짜 덮어쓰기 → classList (탭 클래스 보존)
 *   - resetAll 제거 (기록 탭이 core.resetLearningData로 수행)
 *   - 카드 조회는 app.cardById() 경유
 *
 * 노출 API: init, render, getCurrentCardId, setCurrentCardById,
 *           handleKey, onDailyRollover(내부 등록), onEnter, onLeave
 * ============================================================ */

TarotApp.modules.flashcard = (function (app) {
  "use strict";

  var CHECKS = { o: "O", tri: "△", x: "X" };

  var state = {
    order: [],   // 활성 덱의 카드 순서 (rebuildOrder에서 채움)
    index: 0,
    flipped: false
  };

  function deckTotal() { return app.deckCards().length; }
  function roundBucket() { return app.daily.deckRounds[app.settings.deck]; }

  function rebuildOrder() {
    state.order = app.deckCards().map(function (c) { return c.id; });
  }

  /* ── DOM 참조 ── */
  var $ = function (id) { return document.getElementById(id); };
  var el = {};

  function cacheDom() {
    el = {
      flipCard: $("flipCard"),
      emptyState: $("emptyState"),
      cardStage: $("cardStage"),
      flipHint: $("flipHint"),
      cardImage: $("cardImage"),
      cardFallback: $("cardFallback"),
      fbNumber: $("fbNumber"),
      fbName: $("fbName"),
      cardNumber: $("cardNumber"),
      cardEnglishName: $("cardEnglishName"),
      cardKoreanName: $("cardKoreanName"),
      cardQuestion: $("cardQuestion"),
      backNumber: $("backNumber"),
      backName: $("backName"),
      bkThree: $("bkThree"),
      bkIntent: $("bkIntent"),
      bkSymbols: $("bkSymbols"),
      bkPsych: $("bkPsych"),
      bkSituation: $("bkSituation"),
      bkAdvice: $("bkAdvice"),
      bkReversed: $("bkReversed"),
      bkSelfQ: $("bkSelfQ"),
      progressCount: $("progressCount"),
      progressCheck: $("progressCheck"),
      statTotal: $("statTotal"),
      statO: $("statO"),
      statTri: $("statTri"),
      statX: $("statX"),
      statRounds: $("statRounds"),
      statRoundsLabel: $("statRoundsLabel"),
      statFlips: $("statFlips"),
      statLastStudy: $("statLastStudy")
    };
  }

  /* ══════════ 덱·필터 ══════════ */

  function matchesFilter(cardId, filter) {
    var check = app.progress[cardId];
    switch (filter) {
      case "o":    return check === "o";
      case "tri":  return check === "tri";
      case "x":    return check === "x";
      case "weak": return check === "tri" || check === "x";
      default:     return true;
    }
  }

  function filteredIds() {
    var suit = app.settings.deck === "minor" ? app.settings.minorSuit : "all";
    return state.order.filter(function (id) {
      if (!matchesFilter(id, app.settings.filter)) return false;
      if (suit !== "all") {
        var c = app.cardById(id);
        if (!c || c.suit !== suit) return false;
      }
      return true;
    });
  }

  function currentCard() {
    var ids = filteredIds();
    if (ids.length === 0) return null;
    if (state.index >= ids.length) state.index = ids.length - 1;
    if (state.index < 0) state.index = 0;
    return app.cardById(ids[state.index]);
  }

  /* ══════════ 렌더링 ══════════ */

  function renderCard(withEnterAnimation) {
    var ids = filteredIds();
    var isEmpty = ids.length === 0;

    el.flipCard.hidden = isEmpty;
    el.emptyState.hidden = !isEmpty;
    el.flipHint.style.visibility = isEmpty ? "hidden" : "visible";

    if (isEmpty) {
      el.progressCount.textContent = "0 / 0";
      el.progressCheck.textContent = "";
      renderCheckButtons(null);
      return;
    }

    var card = currentCard();

    el.cardNumber.textContent = card.number;
    el.cardEnglishName.textContent = card.englishName;
    el.cardKoreanName.textContent = card.koreanName;
    el.cardQuestion.textContent = card.question;

    el.cardFallback.hidden = true;
    el.cardImage.style.display = "";
    el.fbNumber.textContent = card.number;
    el.fbName.textContent = card.englishName + " · " + card.koreanName;
    if (card.image) {
      el.cardImage.src = card.image;
      el.cardImage.alt = card.englishName + " 카드 이미지";
    } else {
      showImageFallback();
    }

    el.backNumber.textContent = card.number;
    el.backName.textContent = card.englishName;
    el.bkThree.textContent = card.threeSecond;
    el.bkIntent.textContent = card.directorIntent;
    el.bkPsych.textContent = card.psychology;
    el.bkSituation.textContent = card.situation;
    el.bkAdvice.textContent = card.advice;
    el.bkReversed.textContent = card.reversed;
    el.bkSelfQ.textContent = card.selfQuestion;

    el.bkSymbols.innerHTML = "";
    card.symbols.forEach(function (s) {
      var li = document.createElement("li");
      li.textContent = s;
      el.bkSymbols.appendChild(li);
    });

    el.progressCount.textContent = (state.index + 1) + " / " + ids.length;
    renderProgressCheck(card);
    renderCheckButtons(card);

    if (withEnterAnimation) {
      el.flipCard.classList.remove("is-entering");
      void el.flipCard.offsetWidth;
      el.flipCard.classList.add("is-entering");
    }
  }

  function showImageFallback() {
    el.cardImage.style.display = "none";
    el.cardFallback.hidden = false;
  }

  function renderProgressCheck(card) {
    var check = card ? app.progress[card.id] : null;
    el.progressCheck.textContent = check ? CHECKS[check] : "";
    el.progressCheck.className = "progress-check" + (check ? " pc-" + check : "");
  }

  function renderCheckButtons(card) {
    var check = card ? app.progress[card.id] : null;
    document.querySelectorAll("#tab-flashcard .check-btn").forEach(function (btn) {
      btn.classList.toggle("is-active", btn.dataset.check === check);
    });
  }

  function renderModeButtons() {
    document.querySelectorAll("#modeButtons .seg-btn").forEach(function (btn) {
      btn.classList.toggle("is-active", btn.dataset.mode === app.settings.mode);
    });
    // classList로 모드 클래스만 교체 — 탭 클래스(tab-*)를 보존 (Codex/ENG P1)
    app.MODES.forEach(function (m) { document.body.classList.remove("mode-" + m); });
    document.body.classList.add("mode-" + app.settings.mode);
  }

  function renderFilterButtons() {
    document.querySelectorAll("#filterButtons .chip").forEach(function (btn) {
      btn.classList.toggle("is-active", btn.dataset.filter === app.settings.filter);
    });
    document.querySelectorAll("#suitButtons .chip").forEach(function (btn) {
      btn.classList.toggle("is-active", btn.dataset.suit === app.settings.minorSuit);
    });
  }

  function setSuit(suit) {
    app.settings.minorSuit = suit;
    state.index = 0;
    setFlipped(false);
    resetBackScroll();
    app.saveSettings();
    renderFilterButtons();
    renderCard(true);
  }

  /** 덱 전환 시: 순서 재구성 + 현재 카드 복원 + 전체 재렌더 */
  function onDeckChange() {
    rebuildOrder();
    state.index = 0;
    setFlipped(false);
    resetBackScroll();
    var ids = filteredIds();
    var pos = ids.indexOf(app.settings.currentCardId);
    if (pos !== -1) state.index = pos;
    renderAll(true);
  }

  function renderStats() {
    var counts = { o: 0, tri: 0, x: 0 };
    app.deckCards().forEach(function (c) {
      var v = app.progress[c.id];
      if (counts[v] !== undefined) counts[v]++;
    });
    el.statTotal.textContent = deckTotal();
    el.statO.textContent = counts.o;
    el.statTri.textContent = counts.tri;
    el.statX.textContent = counts.x;
    var bucket = roundBucket();
    el.statRounds.textContent = bucket.rounds;
    // 회독 = 덱 전체(필터·슈트 무관)를 한 바퀴. 진행률을 병기해 "필터만 돌면 왜 안 오르지?" 혼란 방지
    el.statRoundsLabel.textContent = bucket.roundSeen.length > 0
      ? "오늘 회독 · " + bucket.roundSeen.length + "/" + deckTotal()
      : "오늘 회독";
    el.statFlips.textContent = app.daily.flips;
    el.statLastStudy.textContent = app.daily.lastStudy || "—";
  }

  function renderAll(withEnterAnimation) {
    renderModeButtons();
    renderFilterButtons();
    renderCard(withEnterAnimation);
    renderStats();
  }

  /* ══════════ 동작 ══════════ */

  function setFlipped(flipped) {
    state.flipped = flipped;
    el.flipCard.classList.toggle("is-flipped", flipped);
  }

  function flipCard() {
    var card = currentCard();
    if (!card) return;

    app.ensureDailyFresh();
    setFlipped(!state.flipped);

    if (state.flipped) {
      app.daily.flips++;
      var bucket = roundBucket();
      if (bucket.roundSeen.indexOf(card.id) === -1) {
        bucket.roundSeen.push(card.id);
        if (bucket.roundSeen.length >= deckTotal()) {
          bucket.rounds++;
          bucket.roundSeen = [];
        }
      }
      app.markStudied(card.id); // lastStudy·weekLog·studiedCards + saveDaily
      renderStats();
    }
  }

  function moveCard(delta) {
    var ids = filteredIds();
    if (ids.length === 0) return;
    state.index = (state.index + delta + ids.length) % ids.length;
    setFlipped(false);
    resetBackScroll();
    renderCard(true);
  }

  function resetBackScroll() {
    var bs = document.querySelector("#tab-flashcard .back-scroll");
    if (bs) bs.scrollTop = 0;
  }

  function shuffleJump() {
    var ids = filteredIds();
    if (ids.length <= 1) return;
    var next = state.index;
    while (next === state.index) {
      next = Math.floor(Math.random() * ids.length);
    }
    state.index = next;
    setFlipped(false);
    resetBackScroll();
    renderCard(true);
  }

  function reshuffleOrder() {
    for (var i = state.order.length - 1; i > 0; i--) {
      var j = Math.floor(Math.random() * (i + 1));
      var tmp = state.order[i];
      state.order[i] = state.order[j];
      state.order[j] = tmp;
    }
    state.index = 0;
    setFlipped(false);
    resetBackScroll();
    renderCard(true);
  }

  function setCheck(check) {
    var card = currentCard();
    if (!card) return;

    app.ensureDailyFresh();
    if (app.progress[card.id] === check) {
      delete app.progress[card.id];
    } else {
      app.progress[card.id] = check;
    }
    app.markStudied(card.id);
    app.saveProgress();

    renderProgressCheck(card);
    renderCheckButtons(card);
    renderStats();

    if (app.settings.filter !== "all" && !matchesFilter(card.id, app.settings.filter)) {
      setTimeout(function () {
        setFlipped(false);
        resetBackScroll();
        renderCard(true);
      }, 350);
    }
  }

  function setMode(mode) {
    app.settings.mode = mode;
    app.saveSettings();
    renderModeButtons();
  }

  function setFilter(filter) {
    app.settings.filter = filter;
    state.index = 0;
    setFlipped(false);
    resetBackScroll();
    app.saveSettings();
    renderFilterButtons();
    renderCard(true);
  }

  /* ══════════ 입력 ══════════ */

  function bindButtons() {
    $("prevBtn").addEventListener("click", function () { moveCard(-1); });
    $("nextBtn").addEventListener("click", function () { moveCard(1); });
    $("prevBtnTop").addEventListener("click", function () { moveCard(-1); });
    $("nextBtnTop").addEventListener("click", function () { moveCard(1); });
    $("flipBtn").addEventListener("click", flipCard);
    $("shuffleBtn").addEventListener("click", shuffleJump);
    $("emptyResetFilter").addEventListener("click", function () { setFilter("all"); });

    document.querySelectorAll("#modeButtons .seg-btn").forEach(function (btn) {
      btn.addEventListener("click", function () { setMode(btn.dataset.mode); });
    });
    document.querySelectorAll("#filterButtons .chip").forEach(function (btn) {
      btn.addEventListener("click", function () { setFilter(btn.dataset.filter); });
    });
    document.querySelectorAll("#suitButtons .chip").forEach(function (btn) {
      btn.addEventListener("click", function () { setSuit(btn.dataset.suit); });
    });
    document.querySelectorAll("#tab-flashcard .check-btn").forEach(function (btn) {
      btn.addEventListener("click", function () { setCheck(btn.dataset.check); });
    });

    el.flipCard.addEventListener("click", function () {
      if (Date.now() - touch.lastSwipeAt < 350) return;
      flipCard();
    });

    el.cardImage.addEventListener("error", showImageFallback);

    $("flipInner").addEventListener("animationend", function () {
      el.flipCard.classList.remove("is-entering");
    });
  }

  /** core 디스패처가 활성 탭=빠른회독일 때 호출 */
  function handleKey(e) {
    switch (e.code) {
      case "Space": {
        if (!currentCard()) return; // 빈 필터: 포커스된 버튼 기본 동작 유지
        e.preventDefault();
        flipCard();
        break;
      }
      case "Enter":
      case "NumpadEnter":
        if (document.activeElement === el.flipCard) {
          e.preventDefault();
          flipCard();
        }
        break;
      case "ArrowRight":
        e.preventDefault();
        moveCard(1);
        break;
      case "ArrowLeft":
        e.preventDefault();
        moveCard(-1);
        break;
      case "KeyS":
        shuffleJump();
        break;
      case "KeyR":
        reshuffleOrder();
        break;
      case "Digit1": case "Numpad1":
        setCheck("o");
        break;
      case "Digit2": case "Numpad2":
        setCheck("tri");
        break;
      case "Digit3": case "Numpad3":
        setCheck("x");
        break;
    }
  }

  /* 터치 스와이프 */
  var touch = { startX: 0, startY: 0, active: false, lastSwipeAt: 0 };

  function bindTouch() {
    var SWIPE_MIN = 48;
    var RATIO = 1.5;

    el.cardStage.addEventListener("touchstart", function (e) {
      if (e.touches.length !== 1) return;
      touch.startX = e.touches[0].clientX;
      touch.startY = e.touches[0].clientY;
      touch.active = true;
    }, { passive: true });

    el.cardStage.addEventListener("touchend", function (e) {
      if (!touch.active) return;
      touch.active = false;
      var t = e.changedTouches[0];
      var dx = t.clientX - touch.startX;
      var dy = t.clientY - touch.startY;
      if (Math.abs(dx) >= SWIPE_MIN && Math.abs(dx) > Math.abs(dy) * RATIO) {
        touch.lastSwipeAt = Date.now();
        moveCard(dx < 0 ? 1 : -1);
      }
    }, { passive: true });
  }

  /* ══════════ 노출 API ══════════ */

  return {
    init: function () {
      cacheDom();
      rebuildOrder();
      bindButtons();
      bindTouch();
      app.onRollover(renderStats);
      app.onDeckChange(onDeckChange);
      renderAll(false);
    },
    render: function () { renderAll(false); },
    getCurrentCardId: function () {
      var c = currentCard();
      return c ? c.id : null;
    },
    setCurrentCardById: function (id) {
      var ids = filteredIds();
      var pos = ids.indexOf(id);
      state.index = pos !== -1 ? pos : 0; // 필터에 없으면 첫 카드 폴백
      setFlipped(false);
      renderCard(false);
    },
    handleKey: handleKey,
    onEnter: function () {
      this.setCurrentCardById(app.settings.currentCardId);
    },
    onLeave: function () {
      var id = this.getCurrentCardId();
      if (id !== null) {
        app.settings.currentCardId = id;
        app.saveSettings();
      }
    }
  };
})(TarotApp);
