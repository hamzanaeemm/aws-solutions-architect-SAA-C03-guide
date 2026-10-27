/* Interactive practice: per-service learning tasks (match, sort, order, true/false) that unlock a 10-question SAA-C03-style test.
   Data comes from learn-data-*.js via L(id, {...}). Progress lives in localStorage under "saa-learn". */
window.LEARN = window.LEARN || {};
function L(id, data){ window.LEARN[id] = data; }

(function(){
const STORE = "saa-learn";
const PASS = 8; // 72% of 10 rounds up to 8, matching the 720/1000 pass mark
let progress = {};
try { progress = JSON.parse(localStorage.getItem(STORE) || "{}") || {}; } catch(e){ progress = {}; }
function save(){ try { localStorage.setItem(STORE, JSON.stringify(progress)); } catch(e){} }
function rec(id){ return progress[id] || (progress[id] = {done:{}, best:null, tries:0}); }

function el(tag, cls, text){
  const e = document.createElement(tag);
  if (cls) e.className = cls;
  if (text != null) e.textContent = text;
  return e;
}
function shuffle(a){
  a = a.slice();
  for (let i = a.length - 1; i > 0; i--){ const j = Math.floor(Math.random() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; }
  return a;
}
function taskKeys(d){ return ["match","sort","order","tf"].filter(k => d[k]); }
function tasksDone(id){ const d = window.LEARN[id], r = rec(id); return taskKeys(d).every(k => r.done[k]); }
function passed(id){ const r = progress[id]; return !!(r && r.best != null && r.best >= PASS); }

/* ---------- task: match terms to definitions ---------- */
function renderMatch(box, pairs, onDone){
  const left = el("div", "lm-col"), right = el("div", "lm-col");
  let pick = null, left2go = pairs.length;
  const rBtns = shuffle(pairs.map((p, i) => [p[1], i])).map(([txt, i]) => {
    const b = el("button", "lm-item", txt); b.dataset.i = i; right.appendChild(b); return b;
  });
  shuffle(pairs.map((p, i) => [p[0], i])).forEach(([txt, i]) => {
    const b = el("button", "lm-item lm-term", txt); b.dataset.i = i;
    b.addEventListener("click", () => {
      if (b.classList.contains("ok")) return;
      if (pick) pick.classList.remove("sel");
      pick = b; b.classList.add("sel");
    });
    left.appendChild(b);
  });
  rBtns.forEach(b => b.addEventListener("click", () => {
    if (!pick || b.classList.contains("ok")) return;
    if (pick.dataset.i === b.dataset.i){
      pick.classList.remove("sel"); pick.classList.add("ok"); b.classList.add("ok");
      pick.disabled = b.disabled = true; pick = null;
      if (--left2go === 0) onDone();
    } else {
      b.classList.add("bad"); pick.classList.add("bad");
      const p = pick; setTimeout(() => { b.classList.remove("bad"); p.classList.remove("bad"); }, 600);
    }
  }));
  const grid = el("div", "lm"); grid.append(left, right);
  box.append(el("p", "lt-help", "Tap a term, then tap its matching description."), grid);
}

/* ---------- task: sort items into buckets ---------- */
function renderSort(box, s, onDone){
  box.appendChild(el("p", "lt-help", s.prompt || "Put each item in the right group, then check."));
  const list = el("div", "ls");
  const rows = shuffle(s.items).map(([txt, ans]) => {
    const row = el("div", "ls-row"), name = el("div", "ls-name", txt), seg = el("div", "ls-seg");
    row.dataset.ans = ans; row.dataset.val = "";
    s.buckets.forEach((bk, bi) => {
      const b = el("button", "ls-opt", bk); b.setAttribute("aria-pressed", "false");
      b.addEventListener("click", () => {
        if (row.classList.contains("ok")) return;
        seg.querySelectorAll("button").forEach(x => x.setAttribute("aria-pressed", "false"));
        b.setAttribute("aria-pressed", "true"); row.dataset.val = bi; row.classList.remove("bad");
      });
      seg.appendChild(b);
    });
    row.append(name, seg); list.appendChild(row); return row;
  });
  const chk = el("button", "btn lt-check", "Check");
  const msg = el("span", "lt-msg");
  chk.addEventListener("click", () => {
    let wrong = 0;
    rows.forEach(r => {
      if (r.classList.contains("ok")) return;
      if (String(r.dataset.val) === String(r.dataset.ans)){ r.classList.add("ok"); r.querySelectorAll("button").forEach(x => x.disabled = true); }
      else { wrong++; r.classList.add("bad"); }
    });
    if (!wrong){ chk.hidden = true; msg.textContent = ""; onDone(); }
    else msg.textContent = wrong + " still in the wrong group. Fix the red ones.";
  });
  const bar = el("div", "lt-bar"); bar.append(chk, msg);
  box.append(list, bar);
}

/* ---------- task: put steps in order ---------- */
function renderOrder(box, o, onDone){
  box.appendChild(el("p", "lt-help", o.prompt || "Arrange the steps in the correct order, then check."));
  const list = el("ol", "lo");
  let items = shuffle(o.steps.map((t, i) => [t, i]));
  if (items.every(([, i], k) => i === k)) items.reverse();
  function draw(){
    list.innerHTML = "";
    items.forEach(([t], k) => {
      const li = el("li", "lo-row"), txt = el("span", "lo-txt", t), ctl = el("span", "lo-ctl");
      const up = el("button", "lo-btn", "↑"), dn = el("button", "lo-btn", "↓");
      up.setAttribute("aria-label", "Move up"); dn.setAttribute("aria-label", "Move down");
      up.disabled = k === 0; dn.disabled = k === items.length - 1;
      up.addEventListener("click", () => { [items[k-1], items[k]] = [items[k], items[k-1]]; draw(); });
      dn.addEventListener("click", () => { [items[k+1], items[k]] = [items[k], items[k+1]]; draw(); });
      ctl.append(up, dn); li.append(txt, ctl); list.appendChild(li);
    });
  }
  draw();
  const chk = el("button", "btn lt-check", "Check"), msg = el("span", "lt-msg");
  chk.addEventListener("click", () => {
    const rowsEl = [...list.children]; let right = 0;
    items.forEach(([, i], k) => { const ok = i === k; if (ok) right++; rowsEl[k].classList.toggle("ok", ok); rowsEl[k].classList.toggle("bad", !ok); });
    if (right === items.length){ list.querySelectorAll("button").forEach(b => b.disabled = true); chk.hidden = true; msg.textContent = ""; onDone(); }
    else msg.textContent = right + " of " + items.length + " in the right spot.";
  });
  const bar = el("div", "lt-bar"); bar.append(chk, msg);
  box.append(list, bar);
}

/* ---------- task: true/false flash round; misses come back until all are right ---------- */
function renderTF(box, cards, onDone){
  box.appendChild(el("p", "lt-help", "True or false? Anything you miss comes back at the end of the round."));
  const card = el("div", "ltf"), stmt = el("p", "ltf-q"), why = el("p", "ltf-why");
  const btns = el("div", "ltf-btns"), t = el("button", "btn", "True"), f = el("button", "btn", "False"), next = el("button", "btn", "Next");
  const count = el("span", "lt-msg");
  btns.append(t, f, next, count); card.append(stmt, btns, why); box.appendChild(card);
  let queue = shuffle(cards), cur = null, cleared = 0;
  function draw(){
    if (!queue.length){ card.replaceChildren(el("p", "ltf-q", "All " + cards.length + " statements cleared.")); onDone(); return; }
    cur = queue.shift();
    stmt.textContent = cur[0]; why.textContent = ""; why.className = "ltf-why";
    t.hidden = f.hidden = false; t.disabled = f.disabled = false; next.hidden = true;
    count.textContent = cleared + " / " + cards.length + " cleared";
  }
  function answer(v){
    const ok = v === cur[1];
    t.disabled = f.disabled = true; next.hidden = false;
    why.className = "ltf-why " + (ok ? "ok" : "bad");
    why.textContent = (ok ? "Correct. " : "Not quite: it's " + (cur[1] ? "true" : "false") + ". ") + (cur[2] || "");
    if (ok) cleared++; else queue.push(cur);
    count.textContent = cleared + " / " + cards.length + " cleared";
  }
  t.addEventListener("click", () => answer(true));
  f.addEventListener("click", () => answer(false));
  next.addEventListener("click", draw);
  draw();
}

/* ---------- the 10-question test ---------- */
function renderQuiz(box, id, d){
  box.innerHTML = "";
  const qs = shuffle(d.quiz).map(([q, opts, ans, exp]) => {
    const order = shuffle(opts.map((o, i) => i));
    return { q, opts, ans, exp, order, multi: ans.length > 1 };
  });
  const form = el("div", "lq");
  qs.forEach((Q, n) => {
    const wrap = el("fieldset", "lq-q");
    const lg = el("legend", "lq-stem");
    lg.append(el("span", "lq-n", (n + 1) + ". "), document.createTextNode(Q.q));
    wrap.appendChild(lg);
    Q.inputs = Q.order.map((oi, k) => {
      const lab = el("label", "lq-opt");
      const inp = document.createElement("input");
      inp.type = Q.multi ? "checkbox" : "radio"; inp.name = id + "-q" + n; inp.value = oi;
      lab.append(inp, el("span", "lq-letter", "ABCDE"[k] + "."), el("span", null, Q.opts[oi]));
      wrap.appendChild(lab); return inp;
    });
    Q.box = wrap; Q.expEl = el("p", "lq-exp"); Q.expEl.hidden = true; wrap.appendChild(Q.expEl);
    form.appendChild(wrap);
  });
  const bar = el("div", "lt-bar"), sub = el("button", "btn lt-check", "Submit test"), msg = el("span", "lt-msg");
  bar.append(sub, msg);
  box.append(el("p", "lt-help", "Scenario questions in the SAA-C03 style: pick the option that best meets every stated requirement. Pass mark is 8/10 (72%, like the real 720/1000)."), form, bar);
  sub.addEventListener("click", () => {
    const unanswered = qs.filter(Q => !Q.inputs.some(i => i.checked)).length;
    if (unanswered){ msg.textContent = unanswered + " question" + (unanswered > 1 ? "s" : "") + " unanswered."; return; }
    let score = 0;
    qs.forEach(Q => {
      const chosen = Q.inputs.filter(i => i.checked).map(i => +i.value).sort().join();
      const ok = chosen === Q.ans.slice().sort().join();
      if (ok) score++;
      Q.box.classList.add(ok ? "ok" : "bad");
      Q.inputs.forEach(i => { i.disabled = true; if (Q.ans.includes(+i.value)) i.parentElement.classList.add("right"); });
      Q.expEl.hidden = false;
      Q.expEl.textContent = (ok ? "✓ Correct. " : "✗ Answer: " + Q.ans.map(a => "ABCDE"[Q.order.indexOf(a)]).join(", ") + ". ") + Q.exp;
    });
    const r = rec(id); r.tries++; r.best = Math.max(r.best == null ? 0 : r.best, score); save(); refreshBadges();
    sub.hidden = true;
    msg.replaceChildren();
    msg.append(el("b", null, "Score " + score + "/10 · " + (score >= PASS ? "Passed" : "Not yet, needs 8") + ". "));
    const again = el("button", "btn", "Retake with new order");
    again.addEventListener("click", () => { renderQuiz(box, id, d); box.scrollIntoView({block:"start"}); });
    msg.appendChild(again);
    paintPanel(id);
  });
}

/* ---------- panel per section ---------- */
const NAMES = {match:"Match the pairs", sort:"Sort it", order:"Put it in order", tf:"True or false"};
const panels = {};
function paintPanel(id){
  const p = panels[id]; if (!p) return;
  const d = window.LEARN[id], r = rec(id), keys = taskKeys(d);
  const n = keys.filter(k => r.done[k]).length;
  p.meter.style.setProperty("--p", (n / keys.length * 100) + "%");
  p.stat.textContent = n + " / " + keys.length + " tasks done" + (r.best != null ? " · best test score " + r.best + "/10" : "");
  keys.forEach(k => p.heads[k].classList.toggle("done", !!r.done[k]));
  const open = tasksDone(id);
  p.lock.hidden = open; p.quizBtn.hidden = !open || p.quizStarted;
}
function buildPanel(sec){
  const id = sec.id, d = window.LEARN[id]; if (!d) return;
  const panel = el("div", "learn"); panel.id = id + "-practice";
  const head = el("div", "learn-head");
  const title = el("h2", null, "Practice: " + sec.dataset.label);
  const stat = el("span", "learn-stat"), meter = el("div", "learn-meter");
  head.append(title, stat, meter); panel.appendChild(head);
  const heads = {};
  const tasks = el("div", "learn-tasks");
  taskKeys(d).forEach(k => {
    const t = el("details", "lt"); const s = el("summary", null);
    const h = el("span", "lt-name", (d[k].title) || NAMES[k]);
    s.append(h, el("span", "lt-tick", "✓")); heads[k] = t;
    const body = el("div", "lt-body"); t.append(s, body);
    let built = false;
    t.addEventListener("toggle", () => {
      if (!t.open || built) return; built = true;
      const done = () => { rec(id).done[k] = true; save(); paintPanel(id); refreshBadges(); };
      if (k === "match") renderMatch(body, d.match, done);
      if (k === "sort") renderSort(body, d.sort, done);
      if (k === "order") renderOrder(body, d.order, done);
      if (k === "tf") renderTF(body, d.tf, done);
    });
    tasks.appendChild(t);
  });
  panel.appendChild(tasks);
  const quizWrap = el("div", "learn-quiz");
  quizWrap.appendChild(el("h3", null, "10-question test"));
  const lock = el("p", "learn-lock", "🔒 Finish every task above to unlock the test.");
  const quizBtn = el("button", "btn lt-check", "Start test");
  const quizBox = el("div");
  quizWrap.append(lock, quizBtn, quizBox);
  panel.appendChild(quizWrap);
  sec.appendChild(panel);
  const p = { meter, stat, heads, lock, quizBtn, quizStarted: false };
  panels[id] = p;
  quizBtn.addEventListener("click", () => { p.quizStarted = true; quizBtn.hidden = true; renderQuiz(quizBox, id, d); });
  // jump link in the section header
  const sh = sec.querySelector(".sec-head");
  if (sh){
    const a = el("a", "learn-jump", "Practice & test ↓"); a.href = "#" + panel.id;
    a.addEventListener("click", e => { e.preventDefault(); panel.scrollIntoView({behavior:"smooth", block:"start"}); });
    sh.appendChild(a);
  }
  paintPanel(id);
}

function refreshBadges(){
  document.querySelectorAll("#serviceRow button[data-tab]").forEach(b => {
    const id = b.dataset.tab; if (!window.LEARN[id]) return;
    b.classList.toggle("lp-pass", passed(id));
    b.classList.toggle("lp-ready", !passed(id) && tasksDone(id));
  });
  const ids = Object.keys(window.LEARN).filter(id => document.getElementById(id));
  const g = document.getElementById("learnProgress");
  if (g) g.textContent = ids.filter(passed).length + " / " + ids.length + " tests passed";
}

// data files load after this one, so build once the whole document has parsed
document.addEventListener("DOMContentLoaded", () => {
  document.querySelectorAll("section.tab").forEach(buildPanel);
  refreshBadges();
  new MutationObserver(refreshBadges).observe(document.getElementById("serviceRow"), {childList: true});
  document.getElementById("learnReset").addEventListener("click", () => {
    if (!confirm("Clear all practice progress and test scores?")) return;
    progress = {}; save(); location.reload();
  });
});
})();
