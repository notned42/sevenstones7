(() => {
  "use strict";

  const STORAGE_KEY = "seven-stones-save-v1";
  const MAX_TURNS = 10;
  const BASE_PURPLE = 7;
  const BAG_START = { orange: 7, blue: 7, green: 1 };
  const COLORS = ["orange", "blue", "green"];
  const COLOR_LABELS = { orange: "Orange", blue: "Blue", green: "Green" };
  const PAYOUTS = { orange: 2, blue: 2, green: 15 };

  const ACHIEVEMENTS = [
    { id: "tabula-rasa", name: "Tabula Rasa", icon: "✦", description: "Play your first round.", kind: "flat", value: 15, bonus: "+15 lifetime score" },
    { id: "loaves-and-fishes", name: "Loaves and Fishes", icon: "◉", description: "Hit a bid of 1 on green.", kind: "flat", value: 3.2, bonus: "+3.2 lifetime score" },
    { id: "non-sequitur", name: "Non Sequitur", icon: "↯", description: "Bid orange or blue while the other color is at least twice as likely.", kind: "flat", value: 4.2, bonus: "+4.2 lifetime score" },
    { id: "golden-calf", name: "Golden Calf", icon: "◌", description: "Bid orange on all ten turns of a round.", kind: "multiplier", value: 1.1, bonus: "×1.10 lifetime score" },
    { id: "achilles-heel", name: "Achilles’ Heel", icon: "⌁", description: "Lose a round after betting the same color every time.", kind: "multiplier", value: 1.2, bonus: "×1.20 lifetime score" },
    { id: "pearls-before-swine", name: "Pearls Before Swine", icon: "✧", description: "Lose at least 20 purple stones on one bid.", kind: "flat", value: 1.5, bonus: "+1.5 lifetime score" },
    { id: "once-in-a-blue-moon", name: "Once in a Blue Moon", icon: "☾", description: "Make your first blue bid after turn 7—and hit it.", kind: "flat", value: 3.1, bonus: "+3.1 lifetime score" },
    { id: "crossing-the-rubicon", name: "Crossing the Rubicon", icon: "⚑", description: "Go all in on a single bid.", kind: "flat", value: 2, bonus: "+2 lifetime score" },
    { id: "crocodile-tears", name: "Crocodile Tears", icon: "♢", description: "Hit green after bidding on it at least three times earlier in the round.", kind: "multiplier", value: 1.21, bonus: "×1.21 lifetime score" },
    { id: "thirty-pieces", name: "Thirty Pieces of Silver", icon: "Ⅹ", description: "Lose at least 30 purple stones on one bid.", kind: "round-bonus", value: 35, bonus: "+35 purple this round" },
    { id: "all-that-glitters", name: "All that Glitters Is Not Gold", icon: "✹", description: "Miss at least five orange bids in one round.", kind: "flat", value: 7, bonus: "+7 lifetime score" },
    { id: "deus-ex-machina", name: "Deus ex Machina", icon: "✚", description: "Lose at least 50 purple stones on a bid for the first time.", kind: "round-bonus", value: 60, bonus: "+60 purple this round" },
    { id: "waterloo", name: "Waterloo", icon: "♞", description: "Go all in on blue—and lose the bid.", kind: "flat", value: 4, bonus: "+4 lifetime score" },
    { id: "fiddle-while-rome-burns", name: "Fiddle While Rome Burns", icon: "≋", description: "Raise the bid for four consecutive losing bids.", kind: "flat", value: 7, bonus: "+7 lifetime score" },
    { id: "magnum-opus", name: "Magnum Opus", icon: "♛", description: "Set a new high round score after at least 15 rounds without one.", kind: "next-round", value: 20, bonus: "+20 purple next round" },
    { id: "fifteen-minutes", name: "Fifteen Minutes of Fame", icon: "◒", description: "Hit a green bid.", kind: "flat", value: 15, bonus: "+15 lifetime score" },
    { id: "noble-savage", name: "Noble Savage", icon: "☍", description: "Play at least eight turns where every bid has expected value below 1.", kind: "flat", value: 3.73, bonus: "+3.73 lifetime average" },
    { id: "cassandra-of-troy", name: "Cassandra of Troy", icon: "⌖", description: "Miss orange or blue for nine straight turns.", kind: "multiplier", value: 1.4, bonus: "×1.40 lifetime score" },
    { id: "faustian-bargain", name: "Faustian Bargain", icon: "♜", description: "Choose the guarantee when a bid could pay at least 100 purple stones.", kind: "flat", value: 17, bonus: "+17 lifetime score" },
    { id: "sacred-cow", name: "Sacred Cow", icon: "♉", description: "Donate all your current purple stones when offered the Faustian choice.", kind: "multiplier", value: 1.2, bonus: "×1.20 lifetime score" },
    { id: "scylla-and-charybdis", name: "Scylla and Charybdis", icon: "⚔", description: "Face an equal-chance split with one purple stone left.", kind: "flat", value: 0.5, bonus: "+0.5 lifetime score" },
    { id: "babylon", name: "Babylon", icon: "▲", description: "Reach 200 purple stones in one round.", kind: "multiplier", value: 1.4, bonus: "×1.40 lifetime score" },
    { id: "babylon-2", name: "Babylon 2.0", icon: "∞", description: "Earn 420 purple stones across your lifetime.", kind: "multiplier", value: 1.3, bonus: "×1.30 lifetime score" },
    { id: "holy-grail", name: "Holy Grail", icon: "◇", description: "Correctly guess ten bids in a row.", kind: "multiplier", value: 1.7, bonus: "×1.70 lifetime score" }
  ];
  const ACHIEVEMENT_MAP = Object.fromEntries(ACHIEVEMENTS.map((achievement) => [achievement.id, achievement]));

  const $ = (id) => document.getElementById(id);
  const ui = {
    playerName: $("player-name"),
    roundLabel: $("round-label"),
    roundHeading: $("round-heading"),
    roundPill: $("round-pill"),
    purpleCount: $("purple-count"),
    purpleBank: document.querySelector(".purple-bank"),
    miniStones: $("mini-stones"),
    turnCount: $("turn-count"),
    turnProgress: $("turn-progress"),
    turnStatus: $("turn-status"),
    bagChips: $("bag-chips"),
    bagGraphic: $("bag-graphic"),
    emptyRound: $("empty-round"),
    startRound: $("start-round"),
    bettingCard: $("betting-card"),
    potentialWin: $("potential-win"),
    colorButtons: [...document.querySelectorAll(".color-button")],
    bidRange: $("bid-range"),
    bidOutput: $("bid-output"),
    bidMaxLabel: $("bid-max-label"),
    expectedValue: $("expected-value"),
    evMeterFill: $("ev-meter-fill"),
    evNote: $("ev-note"),
    placeBet: $("place-bet"),
    placeButtonMeta: $("place-button-meta"),
    historyCount: $("history-count"),
    historyList: $("history-list"),
    lifetimeScore: $("lifetime-score"),
    lifetimeCaption: $("lifetime-caption"),
    roundsPlayed: $("rounds-played"),
    bestRound: $("best-round"),
    stonesEarned: $("stones-earned"),
    achievementCount: $("achievement-count"),
    achievementPreview: $("achievement-preview"),
    achievementGrid: $("achievement-grid"),
    toast: $("toast"),
    faustianModal: $("faustian-modal"),
    faustianCopy: $("faustian-copy"),
    roundModal: $("round-modal"),
    resultKicker: $("result-kicker"),
    resultTitle: $("round-modal-title"),
    resultScore: $("result-score"),
    resultBreakdown: $("result-breakdown"),
    resultAchievements: $("result-achievements"),
    nextRound: $("next-round"),
    closeResult: $("close-result")
  };

  let game = loadGame();
  let selectedColor = "orange";
  let toastTimer = null;
  let bagAnimationTimer = null;
  let queuedUnlocks = [];

  function freshGame() {
    return {
      version: 1,
      playerName: "Player",
      lifetime: {
        roundScores: [],
        roundSummaries: [],
        unlocked: [],
        totalPurpleEarned: 0,
        highRoundScore: 0,
        lastHighRound: 0,
        globalCorrectStreak: 0,
        faustianEncountered: false,
        nextRoundBase: BASE_PURPLE,
        nextRoundBonus: 0
      },
      activeRound: null
    };
  }

  function loadGame() {
    const fallback = freshGame();
    try {
      const saved = JSON.parse(localStorage.getItem(STORAGE_KEY) || "null");
      if (!saved || typeof saved !== "object") return fallback;
      const loaded = {
        ...fallback,
        ...saved,
        lifetime: { ...fallback.lifetime, ...(saved.lifetime || {}) }
      };
      if (!Array.isArray(loaded.lifetime.roundScores)) loaded.lifetime.roundScores = [];
      if (!Array.isArray(loaded.lifetime.roundSummaries)) loaded.lifetime.roundSummaries = [];
      if (!Array.isArray(loaded.lifetime.unlocked)) loaded.lifetime.unlocked = [];
      if (loaded.activeRound) loaded.activeRound = normalizeRound(loaded.activeRound);
      return loaded;
    } catch (error) {
      return fallback;
    }
  }

  function normalizeRound(round) {
    const normalized = {
      ...makeRound(round.roundNumber || 1, Math.max(0, Number(round.startingPurple) || BASE_PURPLE)),
      ...round,
      bag: { ...BAG_START, ...(round.bag || {}) },
      bidCounts: { orange: 0, blue: 0, green: 0, ...(round.bidCounts || {}) },
      bidSequence: Array.isArray(round.bidSequence) ? round.bidSequence : [],
      history: Array.isArray(round.history) ? round.history : [],
      earnedAchievements: Array.isArray(round.earnedAchievements) ? round.earnedAchievements : []
    };
    return normalized;
  }

  function saveGame() {
    try {
      game.playerName = (ui.playerName?.value || game.playerName || "Player").trim().slice(0, 24) || "Player";
      localStorage.setItem(STORAGE_KEY, JSON.stringify(game));
    } catch (error) {
      // The game remains playable when browser storage is blocked.
    }
  }

  function makeRound(roundNumber, startingPurple) {
    return {
      roundNumber,
      startingPurple,
      purple: startingPurple,
      bag: { ...BAG_START },
      turn: 0,
      bidCounts: { orange: 0, blue: 0, green: 0 },
      bidSequence: [],
      history: [],
      currentStreak: 0,
      longestStreak: 0,
      lastCorrectColor: null,
      orangeMisses: 0,
      previousBid: null,
      increasingLossStreak: 0,
      wrongNonGreenStreak: 0,
      nobleAllAgainstOdds: true,
      pendingBet: null,
      lastOutcome: null,
      endedByDonation: false,
      earnedAchievements: []
    };
  }

  function sumBag(bag) {
    return COLORS.reduce((sum, color) => sum + Math.max(0, Number(bag[color]) || 0), 0);
  }

  function nextRoundStartingPurple() {
    const lifetime = game.lifetime;
    const base = Number.isFinite(lifetime.nextRoundBase) ? lifetime.nextRoundBase : BASE_PURPLE;
    const bonus = Number.isFinite(lifetime.nextRoundBonus) ? lifetime.nextRoundBonus : 0;
    return Math.max(1, base + bonus);
  }

  function currentRoundOrNull() {
    return game.activeRound;
  }

  function clamp(number, min, max) {
    return Math.min(Math.max(number, min), max);
  }

  function roundNumber(value) {
    return Number(value).toLocaleString(undefined, { maximumFractionDigits: 0 });
  }

  function scoreNumber(value) {
    return Number(value || 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  }

  function percent(value) {
    return `${(value * 100).toFixed(1)}%`;
  }

  function colorLabel(color) {
    return COLOR_LABELS[color] || color;
  }

  function calculateRoundScore(round) {
    const turns = Number(round.turn) || 0;
    const x = turns / MAX_TURNS;
    const purple = Math.max(0, Number(round.purple) || 0);
    const greenLoss = isRoundLostOnGreen(round) ? 1 : 0;
    const fullRound = turns === MAX_TURNS ? 1 : 0;
    const streak = Math.max(1, Number(round.longestStreak) || 1);
    const base = (x ** 2) * purple - ((x ** 2) * purple * (0.5 * greenLoss)) + (7 * turns) + (7 * fullRound);
    return base * (streak ** (3 / 7));
  }

  function calculateLifetimeScore() {
    const scores = game.lifetime.roundScores;
    let score = scores.length ? scores.reduce((sum, value) => sum + Number(value || 0), 0) / scores.length : 0;
    for (const achievementId of game.lifetime.unlocked) {
      const achievement = ACHIEVEMENT_MAP[achievementId];
      if (!achievement) continue;
      if (achievement.kind === "flat") score += achievement.value;
      if (achievement.kind === "multiplier") score *= achievement.value;
    }
    return score;
  }

  function isRoundLostOnGreen(round) {
    const last = round.history[round.history.length - 1];
    return Boolean(round.purple <= 0 && last && last.color === "green" && !last.correct && !last.donated);
  }

  function unlock(achievementId) {
    if (game.lifetime.unlocked.includes(achievementId)) return false;
    const achievement = ACHIEVEMENT_MAP[achievementId];
    if (!achievement) return false;
    game.lifetime.unlocked.push(achievementId);
    queuedUnlocks.push(achievement.name);
    if (game.activeRound && !game.activeRound.earnedAchievements.includes(achievementId)) {
      game.activeRound.earnedAchievements.push(achievementId);
    }
    return true;
  }

  function flushUnlocks() {
    if (!queuedUnlocks.length) return;
    const names = queuedUnlocks.splice(0);
    const message = names.length === 1 ? `Achievement unlocked: ${names[0]}` : `Achievements unlocked: ${names.join(" · ")}`;
    showToast(message);
  }

  function showToast(message) {
    clearTimeout(toastTimer);
    ui.toast.textContent = message;
    ui.toast.classList.add("show");
    toastTimer = setTimeout(() => ui.toast.classList.remove("show"), 4400);
  }

  function startRound() {
    if (game.activeRound) return;
    const round = makeRound(game.lifetime.roundScores.length + 1, nextRoundStartingPurple());
    game.lifetime.nextRoundBase = BASE_PURPLE;
    game.lifetime.nextRoundBonus = 0;
    game.activeRound = round;
    closeRoundModal();
    saveGame();
    render();
    showToast(`Round ${String(round.roundNumber).padStart(2, "0")} is live.`);
  }

  function chooseColor(color) {
    if (!COLORS.includes(color)) return;
    selectedColor = color;
    renderBetControls();
  }

  function selectedBid() {
    const round = currentRoundOrNull();
    const max = round ? Math.max(1, round.purple) : BASE_PURPLE;
    return clamp(Math.round(Number(ui.bidRange.value) || 1), 1, max);
  }

  function probabilityFor(round, color) {
    const total = sumBag(round.bag);
    return total ? (Math.max(0, Number(round.bag[color]) || 0) / total) : 0;
  }

  function prepareBid(round, color, bid) {
    const total = sumBag(round.bag);
    const countsBefore = { ...round.bag };
    const probability = total ? (countsBefore[color] / total) : 0;
    const expectedValue = probability * PAYOUTS[color];
    const otherColor = color === "orange" ? "blue" : "orange";
    const otherProbability = total ? (countsBefore[otherColor] / total) : 0;
    const nonSequitur = (color === "orange" || color === "blue") && countsBefore[otherColor] >= countsBefore[color] * 2 && countsBefore[otherColor] > 0;
    const equalChance = round.purple === 1 && countsBefore[color] > 0 && COLORS.filter((candidate) => countsBefore[candidate] === countsBefore[color] && countsBefore[candidate] > 0).length >= 2;
    const allIn = bid === round.purple;
    const previousGreenBids = round.bidCounts.green;
    const previousBid = round.previousBid;
    const turnNumber = round.turn + 1;

    round.turn = turnNumber;
    round.bidCounts[color] += 1;
    round.bidSequence.push(color);
    round.nobleAllAgainstOdds = round.nobleAllAgainstOdds && expectedValue < 1;

    if (nonSequitur) unlock("non-sequitur");
    if (equalChance) unlock("scylla-and-charybdis");
    if (allIn) unlock("crossing-the-rubicon");

    return {
      turnNumber,
      color,
      bid,
      probability,
      expectedValue,
      countsBefore,
      previousGreenBids,
      previousBid,
      allIn,
      nonSequitur,
      equalChance
    };
  }

  function placeBid() {
    const round = currentRoundOrNull();
    if (!round || round.pendingBet || round.purple < 1 || round.turn >= MAX_TURNS) return;
    const bid = selectedBid();
    const meta = prepareBid(round, selectedColor, bid);
    const potentialPayout = bid * PAYOUTS[selectedColor];

    if (!game.lifetime.faustianEncountered && potentialPayout >= 100) {
      round.pendingBet = meta;
      saveGame();
      render();
      showFaustianModal(meta);
      return;
    }

    resolveBet(meta);
  }

  function drawStone(round, options = {}) {
    const available = COLORS.filter((color) => round.bag[color] > 0 && (!options.excludeColor || color !== options.excludeColor));
    const pool = available.reduce((sum, color) => sum + round.bag[color], 0);
    if (!pool) return null;
    if (options.forcedColor && round.bag[options.forcedColor] > 0 && options.forcedColor !== options.excludeColor) {
      round.bag[options.forcedColor] -= 1;
      return options.forcedColor;
    }
    let target = Math.floor(Math.random() * pool);
    for (const color of available) {
      if (target < round.bag[color]) {
        round.bag[color] -= 1;
        return color;
      }
      target -= round.bag[color];
    }
    return null;
  }

  function resolveBet(meta, options = {}) {
    const round = currentRoundOrNull();
    if (!round || (round.pendingBet && round.pendingBet !== meta)) return;
    round.pendingBet = null;
    const drawn = drawStone(round, options);
    animateBagDraw(drawn);
    const correct = drawn === meta.color;
    const payout = correct ? meta.bid * PAYOUTS[meta.color] : 0;

    if (correct) {
      round.purple = round.purple - meta.bid + payout;
      game.lifetime.totalPurpleEarned += payout;
    } else {
      round.purple -= meta.bid;
    }

    const event = {
      turn: meta.turnNumber,
      color: meta.color,
      bid: meta.bid,
      drawn,
      correct,
      payout,
      probability: meta.probability,
      expectedValue: meta.expectedValue,
      allIn: meta.allIn,
      forced: Boolean(options.excludeColor),
      donated: false
    };
    round.history.push(event);
    round.lastOutcome = event;

    if (correct) processCorrect(round, meta);
    else processWrong(round, meta);
    round.previousBid = meta.bid;

    finishIfNeeded(round);
  }

  function processCorrect(round, meta) {
    round.currentStreak = round.lastCorrectColor === meta.color ? round.currentStreak + 1 : 1;
    round.longestStreak = Math.max(round.longestStreak, round.currentStreak);
    round.lastCorrectColor = meta.color;
    round.wrongNonGreenStreak = 0;
    round.increasingLossStreak = 0;
    game.lifetime.globalCorrectStreak += 1;

    if (game.lifetime.globalCorrectStreak >= 10) unlock("holy-grail");
    if (meta.color === "green") {
      unlock("fifteen-minutes");
      if (meta.bid === 1) unlock("loaves-and-fishes");
      if (meta.previousGreenBids >= 3) unlock("crocodile-tears");
    }
    if (meta.color === "blue" && meta.turnNumber > 7 && round.bidCounts.blue === 1) unlock("once-in-a-blue-moon");
    if (round.purple >= 200) unlock("babylon");
    if (game.lifetime.totalPurpleEarned >= 420) unlock("babylon-2");
  }

  function processWrong(round, meta) {
    round.currentStreak = 0;
    round.lastCorrectColor = null;
    game.lifetime.globalCorrectStreak = 0;

    if (meta.color === "orange") {
      round.orangeMisses += 1;
      if (round.orangeMisses >= 5) unlock("all-that-glitters");
    }

    if (meta.color === "orange" || meta.color === "blue") {
      round.wrongNonGreenStreak += 1;
      if (round.wrongNonGreenStreak >= 9) unlock("cassandra-of-troy");
    } else {
      round.wrongNonGreenStreak = 0;
    }

    if (meta.previousBid !== null && meta.bid >= meta.previousBid + 1) round.increasingLossStreak += 1;
    else round.increasingLossStreak = 0;
    if (round.increasingLossStreak >= 4) unlock("fiddle-while-rome-burns");

    if (meta.bid >= 20) unlock("pearls-before-swine");
    if (meta.bid >= 30 && unlock("thirty-pieces")) round.purple += 35;
    if (meta.bid >= 50 && unlock("deus-ex-machina")) round.purple += 60;
    if (meta.allIn && meta.color === "blue") unlock("waterloo");
  }

  function resolveFaustian(choice) {
    const round = currentRoundOrNull();
    if (!round || !round.pendingBet) return;
    const meta = round.pendingBet;
    game.lifetime.faustianEncountered = true;
    closeFaustianModal();

    if (choice === "a") {
      unlock("faustian-bargain");
      resolveBet(meta, { excludeColor: meta.color });
    } else {
      unlock("sacred-cow");
      round.pendingBet = null;
      round.purple = 0;
      round.endedByDonation = true;
      round.lastCorrectColor = null;
      round.currentStreak = 0;
      game.lifetime.globalCorrectStreak = 0;
      round.history.push({
        turn: meta.turnNumber,
        color: meta.color,
        bid: meta.bid,
        drawn: null,
        correct: false,
        payout: 0,
        probability: meta.probability,
        expectedValue: meta.expectedValue,
        allIn: meta.allIn,
        forced: false,
        donated: true
      });
      round.lastOutcome = round.history[round.history.length - 1];
      game.lifetime.nextRoundBase = 14;
      finishRound(round, "donation");
    }
  }

  function finishIfNeeded(round) {
    if (round.purple <= 0) finishRound(round, "broke");
    else if (round.turn >= MAX_TURNS) finishRound(round, "turns");
    else {
      saveGame();
      render();
      flushUnlocks();
    }
  }

  function finishRound(round, reason) {
    if (game.activeRound !== round) return;
    const score = calculateRoundScore(round);
    const oldHigh = game.lifetime.highRoundScore;
    unlock("tabula-rasa");
    if (round.turn === MAX_TURNS && round.bidSequence.length === MAX_TURNS && round.bidSequence.every((color) => color === "orange")) unlock("golden-calf");
    if (reason === "broke" && round.bidSequence.length && round.bidSequence.every((color) => color === round.bidSequence[0])) unlock("achilles-heel");
    if (round.turn >= 8 && round.nobleAllAgainstOdds) unlock("noble-savage");

    const isNewHigh = score > oldHigh + 0.000001;
    if (isNewHigh && game.lifetime.lastHighRound > 0 && round.roundNumber - game.lifetime.lastHighRound >= 15) {
      if (unlock("magnum-opus")) game.lifetime.nextRoundBonus += 20;
    }
    if (isNewHigh) {
      game.lifetime.highRoundScore = score;
      game.lifetime.lastHighRound = round.roundNumber;
    }

    game.lifetime.roundScores.push(score);
    const earnedThisRound = [...round.earnedAchievements];
    const summary = {
      roundNumber: round.roundNumber,
      score,
      purple: Math.max(0, round.purple),
      turns: round.turn,
      streak: Math.max(1, round.longestStreak),
      greenLoss: isRoundLostOnGreen(round),
      reason,
      achievements: earnedThisRound
    };
    game.lifetime.roundSummaries.push(summary);
    if (game.lifetime.roundSummaries.length > 12) game.lifetime.roundSummaries.shift();
    game.activeRound = null;

    saveGame();
    render();
    showRoundModal(summary);
    flushUnlocks();
  }

  function showFaustianModal(meta) {
    ui.faustianCopy.textContent = `Your ${meta.bid}-stone bid on ${colorLabel(meta.color)} could pay ${roundNumber(meta.bid * PAYOUTS[meta.color])} purple stones. The bag has noticed your ambition.`;
    ui.faustianModal.hidden = false;
    document.body.classList.add("modal-open");
  }

  function animateBagDraw(color) {
    if (!color || !ui.bagGraphic) return;
    clearTimeout(bagAnimationTimer);
    ui.bagGraphic.style.setProperty("--draw-color", `var(--${color})`);
    ui.bagGraphic.classList.remove("is-drawing");
    void ui.bagGraphic.offsetWidth;
    ui.bagGraphic.classList.add("is-drawing");
    bagAnimationTimer = setTimeout(() => ui.bagGraphic.classList.remove("is-drawing"), 800);
  }

  function closeFaustianModal() {
    ui.faustianModal.hidden = true;
    if (ui.roundModal.hidden) document.body.classList.remove("modal-open");
  }

  function showRoundModal(summary) {
    const reasonCopy = {
      broke: ["ROUND ENDED", "The purple is gone."],
      turns: ["TEN TURNS COMPLETE", "You made it to the bell."],
      donation: ["THE SACRED COW", "The village has your stones."]
    }[summary.reason] || ["ROUND COMPLETE", "The bag has spoken."];
    ui.resultKicker.textContent = reasonCopy[0];
    ui.resultTitle.textContent = reasonCopy[1];
    ui.resultScore.textContent = scoreNumber(summary.score);
    ui.resultBreakdown.innerHTML = [
      ["Purple", roundNumber(summary.purple)],
      ["Turns", `${summary.turns} / ${MAX_TURNS}`],
      ["Longest streak", `${summary.streak}×`],
      ["Green risk", summary.greenLoss ? "Active" : "Clear"]
    ].map(([label, value]) => `<div class="breakdown-item"><span>${label}</span><strong>${value}</strong></div>`).join("");
    ui.resultAchievements.innerHTML = summary.achievements.length
      ? `New on the wall: ${summary.achievements.map((id) => ACHIEVEMENT_MAP[id]?.name).filter(Boolean).join(" · ")}`
      : "No new badges this round. The wall is patient.";
    ui.roundModal.hidden = false;
    document.body.classList.add("modal-open");
  }

  function closeRoundModal() {
    ui.roundModal.hidden = true;
    if (ui.faustianModal.hidden) document.body.classList.remove("modal-open");
  }

  function render() {
    const round = currentRoundOrNull();
    const nextNumber = game.lifetime.roundScores.length + 1;
    const displayRoundNumber = round ? round.roundNumber : nextNumber;
    const displayPurple = round ? round.purple : nextRoundStartingPurple();
    const displayBag = round ? round.bag : BAG_START;

    ui.roundLabel.textContent = round ? `ROUND ${String(round.roundNumber).padStart(2, "0")}` : "THE NEXT ROUND";
    ui.roundHeading.textContent = round ? "The bag is open." : "The bag is waiting.";
    ui.roundPill.textContent = `ROUND ${String(displayRoundNumber).padStart(2, "0")}`;
    ui.purpleCount.textContent = roundNumber(displayPurple);
    ui.turnCount.textContent = `${round ? round.turn : 0} / ${MAX_TURNS}`;
    ui.turnProgress.style.width = `${round ? clamp((round.turn / MAX_TURNS) * 100, 0, 100) : 0}%`;
    ui.turnStatus.textContent = round
      ? (round.pendingBet ? "The wager is hanging in the balance." : round.turn ? "Choose your next color." : "The first draw is yours to command.")
      : "Ready when you are.";
    ui.emptyRound.hidden = Boolean(round);
    ui.startRound.disabled = Boolean(round);
    renderBag(displayBag);
    renderMiniStones(displayPurple);
    renderBetControls();
    renderHistory(round);
    renderLifetime();
    renderAchievements();
    ui.playerName.value = game.playerName || "Player";
  }

  function renderBag(bag) {
    ui.bagChips.innerHTML = COLORS.map((color) => {
      const count = Math.max(0, Number(bag[color]) || 0);
      return `<span class="bag-chip ${color}-text"><span class="chip-dot" aria-hidden="true"></span>${colorLabel(color)} ${count}</span>`;
    }).join("");
  }

  function renderMiniStones(count) {
    const visible = Math.min(Math.max(0, Number(count) || 0), 22);
    const rotations = [-17, -8, 6, 17, -12, 4, 14, -5, 11, -14, 2, 17, -8, 8, -18, 12, -4, 16, -13, 6, -10, 12];
    ui.miniStones.innerHTML = Array.from({ length: visible }, (_, index) => `<span class="mini-stone" style="--rotation:${rotations[index % rotations.length]}deg"></span>`).join("");
  }

  function renderBetControls() {
    const round = currentRoundOrNull();
    const maxBid = round ? Math.max(1, round.purple) : BASE_PURPLE;
    const bid = selectedBid();
    ui.bidRange.max = String(maxBid);
    ui.bidRange.value = String(clamp(bid, 1, maxBid));
    ui.bidOutput.textContent = `${roundNumber(bid)} ${bid === 1 ? "purple" : "purple"}`;
    ui.bidMaxLabel.textContent = `${roundNumber(maxBid)} all in`;

    ui.colorButtons.forEach((button) => {
      const color = button.dataset.color;
      button.classList.toggle("selected", color === selectedColor);
      const probabilityElement = $(`${color}-probability`);
      const probability = round ? probabilityFor(round, color) : BAG_START[color] / 15;
      probabilityElement.textContent = percent(probability);
    });

    const probability = round ? probabilityFor(round, selectedColor) : BAG_START[selectedColor] / 15;
    const expectedValue = probability * PAYOUTS[selectedColor];
    const potentialPayout = bid * PAYOUTS[selectedColor];
    ui.potentialWin.textContent = round ? `Potential payout: ${roundNumber(potentialPayout)}` : "Choose a color";
    ui.expectedValue.textContent = `${expectedValue.toFixed(2)}× per purple`;
    ui.evMeterFill.style.width = `${clamp((expectedValue / 1.5) * 100, 0, 100)}%`;
    ui.evMeterFill.style.background = expectedValue < 1 ? "var(--gold)" : "var(--green)";
    ui.evNote.textContent = expectedValue < 0.999 ? "The odds are against you." : expectedValue > 1.001 ? "The odds lean your way." : "Fair value, for once.";
    ui.placeButtonMeta.textContent = `${roundNumber(bid)} purple on ${colorLabel(selectedColor).toLowerCase()}`;
    ui.placeBet.disabled = !round || Boolean(round.pendingBet) || round.purple < 1 || round.turn >= MAX_TURNS;
    ui.bettingCard.setAttribute("aria-disabled", String(!round));
  }

  function renderHistory(round) {
    if (!round || !round.history.length) {
      ui.historyCount.textContent = "No draws yet";
      ui.historyList.className = "history-list empty-history";
      ui.historyList.innerHTML = `<div class="history-placeholder">Your choices will appear here after the first draw.</div>`;
      return;
    }
    ui.historyCount.textContent = `${round.history.length} / ${MAX_TURNS} draws`;
    ui.historyList.className = "history-list";
    ui.historyList.innerHTML = [...round.history].reverse().map((event) => {
      const outcomeClass = event.donated ? "donate" : event.correct ? "win" : "loss";
      const outcomeText = event.donated ? "donated" : event.correct ? `hit ${colorLabel(event.drawn)}` : `drew ${colorLabel(event.drawn)}`;
      return `<div class="history-row">
        <span class="history-turn">${String(event.turn).padStart(2, "0")}</span>
        <span class="history-choice"><span class="chip-dot ${event.color}-text" aria-hidden="true"></span><strong>${colorLabel(event.color)}</strong></span>
        <span class="history-stake">−${roundNumber(event.bid)}</span>
        <span class="history-result ${outcomeClass}"><span class="result-stone" aria-hidden="true"></span>${outcomeText}</span>
      </div>`;
    }).join("");
  }

  function renderLifetime() {
    const scores = game.lifetime.roundScores;
    const lifetimeScore = calculateLifetimeScore();
    const unlocked = game.lifetime.unlocked.length;
    ui.lifetimeScore.textContent = scoreNumber(lifetimeScore);
    ui.roundsPlayed.textContent = roundNumber(scores.length);
    ui.bestRound.textContent = scores.length ? scoreNumber(game.lifetime.highRoundScore) : "—";
    ui.stonesEarned.textContent = roundNumber(game.lifetime.totalPurpleEarned);
    ui.achievementCount.textContent = `${unlocked} / ${ACHIEVEMENTS.length}`;
    ui.lifetimeCaption.textContent = scores.length
      ? `${unlocked} badge${unlocked === 1 ? " is" : "es are"} shaping the average.`
      : "Your legend begins with the first round.";
  }

  function renderAchievements() {
    const unlocked = new Set(game.lifetime.unlocked);
    ui.achievementPreview.innerHTML = ACHIEVEMENTS.slice(0, 12).map((achievement) => {
      const isUnlocked = unlocked.has(achievement.id);
      const label = isUnlocked ? `${achievement.name}: unlocked` : "Locked achievement";
      return `<span class="preview-badge ${isUnlocked ? "unlocked" : "locked"}" title="${label}" aria-label="${label}">${achievement.icon}</span>`;
    }).join("");
    ui.achievementGrid.innerHTML = ACHIEVEMENTS.map((achievement) => {
      const isUnlocked = unlocked.has(achievement.id);
      const copy = isUnlocked ? `<h3 class="achievement-name">${achievement.name}</h3>
        <p class="achievement-description">${achievement.description}</p>
        <div class="achievement-bonus">${achievement.bonus}</div>` : "";
      return `<article class="achievement-card ${isUnlocked ? "unlocked" : "locked"}" aria-label="${isUnlocked ? achievement.name : "Locked achievement"}">
        <span class="badge-state">${isUnlocked ? "Unlocked" : "Locked"}</span>
        <div class="badge-art" aria-hidden="true"><span class="badge-glyph">${achievement.icon}</span></div>
        ${copy}
      </article>`;
    }).join("");
  }

  function resetSave() {
    const confirmed = window.confirm("Reset your Seven Stones lifetime score and achievement wall? This cannot be undone.");
    if (!confirmed) return;
    game = freshGame();
    selectedColor = "orange";
    ui.playerName.value = "Player";
    closeFaustianModal();
    closeRoundModal();
    saveGame();
    render();
    showToast("The ledger is blank again.");
  }

  function scrollToAchievements() {
    document.getElementById("achievement-section")?.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  function bindEvents() {
    ui.startRound.addEventListener("click", startRound);
    $("open-achievements").addEventListener("click", scrollToAchievements);
    $("scroll-achievements").addEventListener("click", scrollToAchievements);
    $("reset-save").addEventListener("click", resetSave);
    ui.placeBet.addEventListener("click", placeBid);
    ui.bidRange.addEventListener("input", renderBetControls);
    ui.colorButtons.forEach((button) => button.addEventListener("click", () => chooseColor(button.dataset.color)));
    ui.playerName.addEventListener("input", saveGame);
    $("faustian-a").addEventListener("click", () => resolveFaustian("a"));
    $("faustian-b").addEventListener("click", () => resolveFaustian("b"));
    ui.nextRound.addEventListener("click", startRound);
    ui.closeResult.addEventListener("click", closeRoundModal);
    window.addEventListener("beforeunload", saveGame);
  }

  bindEvents();
  render();
  if (game.activeRound?.pendingBet) showFaustianModal(game.activeRound.pendingBet);
})();
