/* Med MCQ Trainer – mobile-first quiz app
   - Loads ./ .data/questions.yaml
   - Uses only questions with uses_image === false
   - Tracks daily progress (Europe/Stockholm) + per-category accuracy via localStorage
   - Quick start (5 / 10) and focus on weak categories
*/

(() => {
  "use strict";

  // ---------- Config ----------
  const QUESTIONS_PATH = "./.data/questions.yaml";
  const TZ = "Europe/Stockholm";
  const LS_STATS = "mmcq_stats_v1";         // { days: {YYYY-MM-DD:{attempted,correct}}, categories: {name:{attempted,correct}} }
  const LS_CACHE = "mmcq_cache_v1";         // reserved for future (not used heavily here)
  const MAX_CATS_AUTO = 3;

  // ---------- State ----------
  let allQuestions = [];
  let filteredQuestions = [];
  let categories = [];
  let selectedCategories = new Set();
  let session = null;

  // ---------- DOM ----------
  const elHome = $("#screen-home");
  const elQuiz = $("#screen-quiz");
  const elQuestionText = $("#questionText");
  const elOptions = $("#optionsContainer");
  const elFeedback = $("#feedback");
  const elCorrectness = $("#correctness");
  const elMoreInfo = $("#moreInfo");
  const elChipCategory = $("#chipCategory");
  const elChipNumber = $("#chipNumber");
  const elQuizIndex = $("#quizIndex");
  const elQuizTotal = $("#quizTotal");
  const elBtnNext = $("#btnNext");
  const elBtnFinish = $("#btnFinish");
  const elQuizSummary = $("#quizSummary");
  const elSumScore = $("#sumScore");
  const elSumCatBreakdown = $("#sumCatBreakdown");
  const elBtnDone = $("#btnDone");

  // Home stats
  const elTodayCorrect = $("#stat-today-correct");
  const elTodayAttempted = $("#stat-today-attempted");
  const elTodayAccuracy = $("#stat-today-accuracy");
  const elQuestionCount = $("#questionCount");
  const elCatsContainer = $("#categories-container");
  const elBtnAutoSelectWeak = $("#btnAutoSelectWeak");

  // Header buttons
  const elBtnReset = $("#btnReset");
  const elBtnBackHome = $("#btnBackHome");

  // Quick start buttons
  $all('[data-quick]').forEach(btn => btn.addEventListener('click', () => {
    const n = parseInt(btn.getAttribute('data-quick'), 10) || 5;
    startQuiz({count: n, categories: null});
  }));

  $("#btnStartFocused5").addEventListener('click', () => startFocused(5));
  $("#btnStartFocused10").addEventListener('click', () => startFocused(10));

  elBtnAutoSelectWeak.addEventListener('click', autoSelectWeakCategories);
  elBtnBackHome.addEventListener('click', goHome);
  elBtnReset.addEventListener('click', resetProgress);

  elBtnNext.addEventListener('click', nextQuestion);
  elBtnFinish.addEventListener('click', finishQuiz);
  elBtnDone.addEventListener('click', () => {
    hide(elQuizSummary);
    goHome();
  });

  // ---------- Init ----------
  document.addEventListener('DOMContentLoaded', init);

  async function init(){
    try{
      const raw = await fetch(QUESTIONS_PATH, {cache:'no-store'});
      if(!raw.ok) throw new Error(`Failed to load questions: ${raw.status}`);
      const text = await raw.text();
      allQuestions = jsyaml.load(text);

      // Validate & normalize
      if(!Array.isArray(allQuestions)) throw new Error("YAML did not parse to an array.");
      filteredQuestions = allQuestions.filter(q => q && q.uses_image === false);

      // Derive categories
      categories = Array.from(new Set(filteredQuestions.map(q => q.category))).sort((a,b)=>a.localeCompare(b));

      // Pre-select none on first load
      selectedCategories = new Set();

      // Paint UI
      elQuestionCount.textContent = `${filteredQuestions.length} questions available (images excluded).`;
      renderHomeStats();
      renderCategoryList();
    }catch(err){
      console.error(err);
      elQuestionCount.textContent = "Couldn't load questions. Ensure ./.data/questions.yaml exists and is valid YAML.";
    }
  }

  // ---------- Home UI ----------
  function renderHomeStats(){
    const stats = loadStats();
    const today = todayKey();
    const d = stats.days[today] || {attempted:0, correct:0};
    const acc = d.attempted ? Math.round(100 * d.correct / d.attempted) : 0;
    elTodayCorrect.textContent = d.correct;
    elTodayAttempted.textContent = d.attempted;
    elTodayAccuracy.textContent = `${acc}%`;
  }

  function renderCategoryList(){
    const stats = loadStats();
    elCatsContainer.innerHTML = "";

    // Build list with accuracy info
    const catRows = categories.map(name => {
      const s = stats.categories[name] || {attempted:0, correct:0};
      const acc = s.attempted ? Math.round(100 * s.correct / s.attempted) : null; // null shows "—"
      return {name, attempted: s.attempted, correct: s.correct, accuracy: acc};
    });

    // Sort ascending by accuracy (nulls last)
    catRows.sort((a,b) => {
      if(a.accuracy === null && b.accuracy === null) return a.name.localeCompare(b.name);
      if(a.accuracy === null) return 1;
      if(b.accuracy === null) return -1;
      if(a.accuracy !== b.accuracy) return a.accuracy - b.accuracy;
      return a.name.localeCompare(b.name);
    });

    for(const row of catRows){
      const id = `cat_${slug(row.name)}`;
      const wrap = document.createElement('label');
      wrap.className = "category";
      wrap.innerHTML = `
        <div class="left">
          <input type="checkbox" id="${id}" ${selectedCategories.has(row.name)?'checked':''} />
          <div>
            <div class="cat-name">${escapeHTML(row.name)}</div>
            <div class="cat-meta">
              ${row.attempted ? `${row.accuracy}% · ${row.correct}/${row.attempted} correct` : "— no attempts yet"}
            </div>
          </div>
        </div>
      `;

      wrap.querySelector('input').addEventListener('change', (e) => {
        if(e.target.checked) selectedCategories.add(row.name);
        else selectedCategories.delete(row.name);
      });

      elCatsContainer.appendChild(wrap);
    }
  }

  function autoSelectWeakCategories(){
    // Recompute sorted by lowest accuracy among attempted; then add unattempted if needed
    const stats = loadStats();
    const withStats = categories.map(name => {
      const s = stats.categories[name] || {attempted:0, correct:0};
      const accuracy = s.attempted ? (s.correct / s.attempted) : null;
      return {name, attempted: s.attempted, accuracy};
    });

    const attempted = withStats.filter(c => c.attempted>0).sort((a,b)=>a.accuracy-b.accuracy);
    const notTried = withStats.filter(c => c.attempted===0).sort((a,b)=>a.name.localeCompare(b.name));

    const pick = [...attempted.slice(0, MAX_CATS_AUTO), ...notTried].slice(0, MAX_CATS_AUTO);
    selectedCategories = new Set(pick.map(p=>p.name));
    renderCategoryList();
  }

  function startFocused(count){
    if(selectedCategories.size === 0){
      // If nothing selected, fallback to auto-select
      autoSelectWeakCategories();
    }
    startQuiz({count, categories: new Set(selectedCategories)});
  }

  // ---------- Quiz Flow ----------
  function startQuiz({count=5, categories=null} = {}){
    // Pool based on categories
    let pool = filteredQuestions;
    if(categories && categories.size){
      pool = filteredQuestions.filter(q => categories.has(q.category));
    }
    if(pool.length === 0){
      alert("No questions available for the selected categories.");
      return;
    }

    // Sample without replacement
    const N = Math.min(count, pool.length);
    const picked = sample(pool, N);

    session = {
      index: 0,
      total: N,
      items: picked.map(q => ({
        q,
        // shuffle options and keep answer index mapping
        shuffled: shuffleOptions(q),
        answered: false,
        correct: null
      })),
      correctCount: 0,
      catTally: {} // {category:{attempted,correct}}
    };

    elQuizTotal.textContent = N.toString();
    elQuizSummary.hidden = true;
    show(elQuiz); hide(elHome);
    showQuestion();
  }

  function showQuestion(){
    const i = session.index;
    const item = session.items[i];
    const {q, shuffled} = item;

    elQuizIndex.textContent = (i+1).toString();
    elChipCategory.textContent = q.category;
    elChipNumber.textContent = `#${q.number ?? "—"}`;
    elQuestionText.textContent = q.question;

    elOptions.innerHTML = "";
    shuffled.options.forEach((optText, idx) => {
      const btn = document.createElement('button');
      btn.className = "option-btn";
      btn.type = "button";
      btn.innerHTML = escapeHTML(optText);
      btn.addEventListener('click', () => handleAnswer(idx));
      elOptions.appendChild(btn);
    });

    elFeedback.hidden = true;
    elCorrectness.textContent = "";
    elCorrectness.className = "correctness";
    elMoreInfo.textContent = "";
    elBtnNext.disabled = true;
    elBtnFinish.hidden = (session.index !== session.total - 1);
    elBtnNext.hidden = (session.index === session.total - 1);
  }

  function handleAnswer(chosenIdx){
    const item = session.items[session.index];
    if(item.answered) return;

    const {q, shuffled} = item;
    const correctIdxShuffled = shuffled.mapIndex[q.correct_option_index];

    item.answered = true;
    const wasCorrect = (chosenIdx === correctIdxShuffled);
    item.correct = wasCorrect;
    if(wasCorrect) session.correctCount++;

    // Paint option buttons
    const buttons = Array.from(elOptions.querySelectorAll('.option-btn'));
    buttons.forEach((b,i) => {
      b.disabled = true;
      if(i === correctIdxShuffled) b.classList.add('correct');
      if(i === chosenIdx && i !== correctIdxShuffled) b.classList.add('wrong');
    });

    // Feedback & more info
    elFeedback.hidden = false;
    elCorrectness.textContent = wasCorrect ? "Correct" : "Incorrect";
    elCorrectness.className = "correctness " + (wasCorrect ? "good" : "bad");
    elMoreInfo.textContent = (q.more_information || "").trim();

    // Persist stats
    bumpStats({category: q.category, correct: wasCorrect});

    // Enable next/finish
    elBtnNext.disabled = false;
  }

  function nextQuestion(){
    if(session.index < session.total - 1){
      session.index++;
      showQuestion();
    }
  }

  function finishQuiz(){
    // Build summary
    elSumScore.textContent = `${session.correctCount}/${session.total} correct`;
    const rows = compileSessionCategoryBreakdown();
    renderSummaryCategories(rows);
    hide(elOptions); // avoid stray focus jumps on tiny screens
    show(elQuizSummary);
  }

  function compileSessionCategoryBreakdown(){
    const tally = {};
    for(const item of session.items){
      const cat = item.q.category;
      if(!tally[cat]) tally[cat] = {attempted:0, correct:0};
      tally[cat].attempted++;
      tally[cat].correct += item.correct ? 1 : 0;
    }
    return Object.entries(tally).map(([name, v]) => ({
      name, attempted: v.attempted, correct: v.correct,
      accuracy: Math.round(100 * v.correct / v.attempted)
    })).sort((a,b)=>a.name.localeCompare(b.name));
  }

  function renderSummaryCategories(rows){
    elSumCatBreakdown.innerHTML = "";
    rows.forEach(r => {
      const div = document.createElement('div');
      div.className = "category";
      div.innerHTML = `
        <div class="left">
          <div>
            <div class="cat-name">${escapeHTML(r.name)}</div>
            <div class="cat-meta">${r.accuracy}% · ${r.correct}/${r.attempted} correct</div>
          </div>
        </div>
      `;
      elSumCatBreakdown.appendChild(div);
    });
  }

  function goHome(){
    show(elHome); hide(elQuiz);
    show(elOptions);
    elQuizSummary.hidden = true;
    renderHomeStats();
    renderCategoryList();
  }

  // ---------- Stats ----------
  function loadStats(){
    try{
      const raw = localStorage.getItem(LS_STATS);
      if(!raw) return { days:{}, categories:{} };
      const parsed = JSON.parse(raw);
      return { days: parsed.days || {}, categories: parsed.categories || {} };
    }catch(e){
      console.warn("Stats parse error:", e);
      return { days:{}, categories:{} };
    }
  }

  function saveStats(stats){
    localStorage.setItem(LS_STATS, JSON.stringify(stats));
  }

  function bumpStats({category, correct}){
    const stats = loadStats();
    // per-day
    const t = todayKey();
    stats.days[t] = stats.days[t] || {attempted:0, correct:0};
    stats.days[t].attempted++;
    if(correct) stats.days[t].correct++;

    // per-category
    stats.categories[category] = stats.categories[category] || {attempted:0, correct:0};
    stats.categories[category].attempted++;
    if(correct) stats.categories[category].correct++;

    saveStats(stats);
    renderHomeStats(); // keep home numbers fresh when navigating back
  }

  function resetProgress(){
    if(confirm("Reset all local progress and stats on this device?")){
      localStorage.removeItem(LS_STATS);
      renderHomeStats();
      renderCategoryList();
      alert("Progress reset.");
    }
  }

  // ---------- Helpers ----------
  function todayKey(){
    // YYYY-MM-DD in Europe/Stockholm
    const fmt = new Intl.DateTimeFormat('en-CA', {timeZone: TZ, year:'numeric', month:'2-digit', day:'2-digit'});
    const parts = fmt.formatToParts(new Date());
    const y = parts.find(p=>p.type==='year').value;
    const m = parts.find(p=>p.type==='month').value;
    const d = parts.find(p=>p.type==='day').value;
    return `${y}-${m}-${d}`;
  }

  function shuffleOptions(q){
    // Returns {options:[text...], mapIndex: {originalIndex -> newIndex}}
    const arr = q.options.slice(); // as-is
    const idxs = arr.map((_,i)=>i);
    // Fisher–Yates
    for(let i=idxs.length-1;i>0;i--){
      const j = Math.floor(Math.random()*(i+1));
      [idxs[i], idxs[j]] = [idxs[j], idxs[i]];
    }
    const mapIndex = {}; // original -> shuffled
    idxs.forEach((orig, pos) => { mapIndex[orig] = pos; });
    const shuffledOptions = idxs.map(i => String(arr[i]));
    return {options: shuffledOptions, mapIndex};
  }

  function sample(arr, n){
    const a = arr.slice();
    for(let i=a.length-1;i>0;i--){
      const j = Math.floor(Math.random()*(i+1));
      [a[i], a[j]] = [a[j], a[i]];
    }
    return a.slice(0, n);
  }

  function slug(s){ return String(s).toLowerCase().replace(/[^a-z0-9]+/g,'-').replace(/^-+|-+$/g,''); }
  function escapeHTML(s){ return String(s).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c])); }

  function $(sel){ return document.querySelector(sel); }
  function $all(sel){ return Array.from(document.querySelectorAll(sel)); }
  function show(el){ el.classList.add('active'); el.style.display='block'; }
  function hide(el){ el.classList.remove('active'); el.style.display='none'; }
})();
