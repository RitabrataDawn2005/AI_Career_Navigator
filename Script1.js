'use strict';
/* ---------- helpers & storage ---------- */
const $ = (s, r = document) => r.querySelector(s);
const $$ = (s, r = document) => [...r.querySelectorAll(s)];
const store = {
  get: (k, d) => { try { return JSON.parse(localStorage.getItem('careerai.' + k)) ?? d; } catch { return d; } },
  set: (k, v) => { try { localStorage.setItem('careerai.' + k, JSON.stringify(v)); } catch {} }
};
const wait = ms => new Promise(r => setTimeout(r, ms));

/* ---------- data model (edit freely) ---------- */
const INTERESTS = ['Programming', 'Artificial Intelligence', 'Data', 'Design', 'Business', 'Cybersecurity', 'Cloud', 'Mobile Development', 'Research', 'Management'];
const SKILLS = ['Python', 'Java', 'C++', 'HTML/CSS', 'JavaScript', 'SQL', 'Problem Solving', 'Communication', 'Leadership', 'Mathematics', 'Data Analysis'];
const GOALS = ['High salary', 'Job security', 'Creativity', 'Leadership', 'Research', 'Work-life balance', 'Entrepreneurship'];
const STREAMS = ['Computer Science / IT', 'Electronics / Electrical', 'Mathematics / Statistics', 'Business / Commerce', 'Design / Arts', 'Other'];
const DIFF = ['Easy', 'Medium', 'Hard'], LEVELS = ['Beginner', 'Intermediate', 'Advanced'];
const LEVEL_BASE = { Beginner: 45, Intermediate: 65, Advanced: 85 };
const WEIGHTS = { interests: 30, skills: 30, goals: 15, education: 10, work: 7, experience: 8 }; // sums to 100
const CAT_INFO = {
  'Software Development': { edu: STREAMS.slice(0, 3), env: 'Product teams, agile sprints, code reviews; often remote-friendly.', chal: 'Fast-changing tools and tight deadlines.', road: 'Programming fundamentals|OOP|Data structures & algorithms|SQL & databases|Git & GitHub|APIs|Frameworks|Build projects|Deployment|Interview preparation' },
  'AI & Data': { edu: [STREAMS[0], STREAMS[2], STREAMS[1]], env: 'Analytics or research teams working with large datasets.', chal: 'Messy data and heavy math/statistics.', road: 'Python & statistics|Math for ML|Data wrangling|SQL|Visualization|Machine learning|Deep learning basics|Projects & Kaggle|Deploy a model|Interview preparation' },
  'Cybersecurity': { edu: STREAMS.slice(0, 2), env: 'Security operations centers and consulting teams.', chal: 'On-call work and constantly evolving threats.', road: 'Networking basics|Linux|Security fundamentals|Scripting|Web security|Cryptography|Hands-on labs|Certifications|Incident response|Interview preparation' },
  'Cloud & DevOps': { edu: STREAMS.slice(0, 2), env: 'Platform teams keeping systems reliable and automated.', chal: 'Large systems, on-call duty, many tools.', road: 'Linux & networking|Scripting|Cloud fundamentals|Containers|CI/CD|Infrastructure as code|Monitoring|Certifications|Projects|Interview preparation' },
  'Design': { edu: [STREAMS[4], STREAMS[0]], env: 'Creative studios and product teams.', chal: 'Subjective feedback and balancing users with business needs.', road: 'Design principles|Figma|User research|Wireframing|Prototyping|Design systems|Usability testing|Portfolio|Case studies|Interview preparation' },
  'Business': { edu: [STREAMS[3], STREAMS[0], STREAMS[2]], env: 'Cross-functional teams bridging business and tech.', chal: 'Juggling stakeholders with conflicting needs.', road: 'Business fundamentals|Excel|SQL|Requirements gathering|Data visualization|Process modeling|Agile|Stakeholder communication|Case projects|Interview preparation' }
};
// m = ratings 1-3 for coding, math, AI, database
const mk = (name, cat, icon, diff, growth, desc, req, interests, goals, work, tools, m) =>
  ({ name, cat, icon, diff, growth, desc, req, interests, goals, work, tools, m: [...m].map(Number) });
const CAREERS = [
  mk('Python Developer', 'Software Development', '🐍', 'Medium', 'High', 'Build software, automation tools, APIs and applications using Python.', { Python: 90, SQL: 70, Git: 70, 'Problem Solving': 75 }, ['Programming'], ['High salary', 'Job security'], ['Remote', 'Hybrid'], 'VS Code, Flask, Django, Postman', '3223'),
  mk('Full Stack Developer', 'Software Development', '🧩', 'Medium', 'High', 'Design and ship complete web apps, from interface to database.', { JavaScript: 85, 'HTML/CSS': 85, SQL: 70, Git: 70 }, ['Programming', 'Design'], ['Entrepreneurship', 'Creativity'], ['Remote', 'Hybrid'], 'React, Node.js, Git, Docker', '3113'),
  mk('AI/ML Engineer', 'AI & Data', '🤖', 'Hard', 'Very High', 'Train, evaluate and deploy machine learning models.', { Python: 90, Mathematics: 85, 'Data Analysis': 75, 'Problem Solving': 80 }, ['Artificial Intelligence', 'Research', 'Programming'], ['High salary', 'Research'], ['Hybrid', 'Remote'], 'PyTorch, scikit-learn, Jupyter', '3332'),
  mk('Data Scientist', 'AI & Data', '📊', 'Hard', 'High', 'Turn complex data into predictions and decisions.', { Python: 80, Mathematics: 80, SQL: 75, 'Data Analysis': 85 }, ['Data', 'Research', 'Artificial Intelligence'], ['High salary', 'Research'], ['Hybrid', 'Remote'], 'Pandas, SQL, Tableau, Jupyter', '2333'),
  mk('Data Analyst', 'AI & Data', '📈', 'Easy', 'High', 'Clean data, build dashboards and explain what the numbers mean.', { SQL: 85, 'Data Analysis': 85, Communication: 70, Python: 60 }, ['Data', 'Business'], ['Job security', 'Work-life balance'], ['Hybrid', 'Office'], 'Excel, SQL, Power BI, Tableau', '1213'),
  mk('Cybersecurity Analyst', 'Cybersecurity', '🛡️', 'Hard', 'Very High', 'Detect, investigate and prevent attacks on systems and data.', { 'Problem Solving': 85, Python: 60, Communication: 65, 'C++': 50 }, ['Cybersecurity'], ['Job security', 'High salary'], ['Office', 'Hybrid'], 'Wireshark, Kali Linux, Splunk', '2112'),
  mk('Cloud Engineer', 'Cloud & DevOps', '☁️', 'Medium', 'Very High', 'Design and run scalable infrastructure on cloud platforms.', { Python: 60, SQL: 60, 'Problem Solving': 75, Communication: 60 }, ['Cloud', 'Programming'], ['High salary', 'Job security'], ['Remote', 'Hybrid'], 'AWS, Azure, Terraform, Linux', '2112'),
  mk('UI/UX Designer', 'Design', '🎨', 'Easy', 'Medium', 'Research users and craft interfaces that feel effortless.', { 'HTML/CSS': 65, Communication: 80, 'Problem Solving': 70, Leadership: 40 }, ['Design'], ['Creativity', 'Work-life balance'], ['Flexible', 'Remote'], 'Figma, Miro, Adobe XD', '1111'),
  mk('Software Engineer', 'Software Development', '💻', 'Medium', 'High', 'Build reliable, scalable software systems in a team.', { Java: 80, 'C++': 70, 'Problem Solving': 85, Git: 75 }, ['Programming'], ['High salary', 'Job security'], ['Office', 'Hybrid'], 'IntelliJ, Git, Jenkins, Jira', '3212'),
  mk('DevOps Engineer', 'Cloud & DevOps', '⚙️', 'Hard', 'Very High', 'Automate building, testing and releasing software.', { Python: 65, 'Problem Solving': 80, Git: 80, Communication: 60 }, ['Cloud', 'Programming'], ['High salary'], ['Hybrid', 'Remote'], 'Docker, Kubernetes, CI/CD, Linux', '2112'),
  mk('Business Analyst', 'Business', '💼', 'Easy', 'Medium', 'Translate business needs into clear requirements and insights.', { Communication: 85, 'Data Analysis': 70, SQL: 60, Leadership: 60 }, ['Business', 'Management', 'Data'], ['Leadership', 'Work-life balance'], ['Office', 'Hybrid'], 'Excel, Power BI, Jira, SQL', '1122')
];
const TIPS = ['Build projects instead of only watching tutorials.', 'Learn Git and GitHub early.', 'Practice coding regularly, even 30 minutes a day.', 'Keep your resume focused on one page.', 'Document your projects properly with a clear README.'];
const FAQ = [
  ['How does the career assessment work?', 'You answer six short steps about education, interests, skills, work style, goals and experience. Your answers are compared with each career profile.'],
  ['Is this an actual AI system?', 'No. It is a frontend simulation. Recommendations come from a JavaScript weighted scoring algorithm, not a machine-learning model.'],
  ['How are career scores calculated?', 'Each career gets a weighted score: interests 30, skills 30, goals 15, education 10, work preference 7 and experience 8. Weights live in WEIGHTS in script.js.'],
  ['How should I use the roadmap?', 'Pick a career goal, then mark each stage Not Started, In Progress or Completed. Progress is saved in your browser.'],
  ['Can I save multiple careers?', 'Yes. Save as many as you like; they stay saved after a refresh.']
];

/* ---------- state ---------- */
let answers = store.get('answers', null);
let saved = store.get('saved', []);
let prog = store.get('prog', {});
let recent = store.get('recent', []);
let goal = store.get('goal', 'Python Developer');
let draft = answers ? structuredClone(answers) : { edu: {}, interests: [], skills: [], goals: [] };
let step = 0, activeCat = 'All';
const byName = n => CAREERS.find(c => c.name === n);

/* ---------- recommendation engine ---------- */
function scoreCareer(c, a) {
  const ratio = (m, t) => (t ? m / t : 0);
  const skillNames = Object.keys(c.req);
  const factors = {
    interests: ratio(c.interests.filter(i => a.interests.includes(i)).length, c.interests.length),
    skills: ratio(skillNames.filter(s => a.skills.includes(s)).length, skillNames.length),
    goals: ratio(c.goals.filter(g => a.goals.includes(g)).length, c.goals.length),
    education: CAT_INFO[c.cat].edu.includes(a.edu.stream) ? 1 : 0.4,
    work: a.work === 'Flexible' || c.work.includes(a.work) ? 1 : 0.5,
    experience: 1 - 0.35 * Math.abs(LEVELS.indexOf(a.level) - DIFF.indexOf(c.diff))
  };
  const total = Object.entries(WEIGHTS).reduce((sum, [k, w]) => sum + w * factors[k], 0);
  return Math.min(99, Math.round(total));
}
const ranked = () => CAREERS.map(c => ({ ...c, score: answers ? scoreCareer(c, answers) : null })).sort((a, b) => (b.score ?? 0) - (a.score ?? 0));
const userLevel = s => (answers && answers.skills.includes(s) ? LEVEL_BASE[answers.level] : 0);

/* ---------- animations ---------- */
const countUp = (el, to, suf = '') => {
  const t0 = performance.now();
  const tick = now => {
    const p = Math.min(1, (now - t0) / 1000);
    el.textContent = Math.round(to * p) + suf;
    if (p < 1) requestAnimationFrame(tick);
  };
  requestAnimationFrame(tick);
};
const io = new IntersectionObserver(entries => entries.forEach(e => {
  if (!e.isIntersecting) return;
  const el = e.target; io.unobserve(el);
  if (el.dataset.w) el.style.width = el.dataset.w + '%';
  if (el.dataset.h) el.style.height = el.dataset.h + '%';
  if (el.classList.contains('ring')) el.classList.add('in');
  if (el.dataset.count) countUp(el, +el.dataset.count, el.dataset.suf || '');
}), { threshold: 0.2 });
const watch = (root = document) => $$('[data-w],[data-h],[data-count],.ring', root).forEach(el => io.observe(el));

/* ---------- assessment ---------- */
const STEPS = [
  { t: 'Education', edu: true },
  { t: 'Interests', key: 'interests', multi: true, opts: INTERESTS },
  { t: 'Skills', key: 'skills', multi: true, opts: SKILLS },
  { t: 'Work preference', key: 'work', opts: ['Remote', 'Office', 'Hybrid', 'Flexible'] },
  { t: 'Career preference', key: 'goals', multi: true, opts: GOALS },
  { t: 'Experience level', key: 'level', opts: LEVELS }
];
const sel = (id, label, opts, val) => `<label>${label}<select id="${id}" data-edu="${id}"><option value="">Choose...</option>${opts.map(o => `<option${o === val ? ' selected' : ''}>${o}</option>`).join('')}</select></label>`;
function renderStep() {
  const s = STEPS[step];
  $('#stepLabel').textContent = `Step ${step + 1} of ${STEPS.length}`;
  $('#stepName').textContent = s.t;
  $('#quizBar').style.width = ((step + 1) / STEPS.length) * 100 + '%';
  $('.bar.thick[role=progressbar]').setAttribute('aria-valuenow', Math.round(((step + 1) / STEPS.length) * 100));
  $('#err').textContent = '';
  $('#prev').disabled = step === 0;
  $('#next').textContent = step === STEPS.length - 1 ? 'Submit Assessment' : 'Next';
  $('#stepBody').innerHTML = s.edu
    ? `<legend>Tell us about your education</legend>${sel('level', 'Current education level', ['High school', 'Diploma', "Bachelor's", "Master's", 'Self-taught'], draft.edu.level)}${sel('stream', 'Degree / stream', STREAMS, draft.edu.stream)}${sel('year', 'Year of study', ['1st', '2nd', '3rd', '4th', 'Graduated'], draft.edu.year)}`
    : `<legend>${s.multi ? 'Select all that apply' : 'Choose one'}</legend><div class="opts">${s.opts.map(o => {
        const on = s.multi ? draft[s.key].includes(o) : draft[s.key] === o;
        return `<button type="button" class="opt" aria-pressed="${on}" data-o="${o}">${o}</button>`;
      }).join('')}</div>`;
}
function validateStep() {
  const s = STEPS[step];
  const ok = s.edu ? ['level', 'stream', 'year'].every(k => draft.edu[k]) : s.multi ? draft[s.key].length > 0 : Boolean(draft[s.key]);
  if (!ok) $('#err').textContent = s.edu ? 'Please complete all three education fields.' : `Please choose ${s.multi ? 'at least one option' : 'an option'} to continue.`;
  return ok;
}
$('#stepBody').addEventListener('click', e => {
  const b = e.target.closest('.opt'); if (!b) return;
  const s = STEPS[step], o = b.dataset.o;
  if (s.multi) draft[s.key] = draft[s.key].includes(o) ? draft[s.key].filter(x => x !== o) : [...draft[s.key], o];
  else draft[s.key] = o;
  renderStep();
  $(`.opt[data-o="${CSS.escape(o)}"]`)?.focus();
});
$('#stepBody').addEventListener('change', e => { if (e.target.dataset.edu) draft.edu[e.target.dataset.edu] = e.target.value; });
$('#prev').onclick = () => { step--; renderStep(); };
$('#next').onclick = async () => {
  if (!validateStep()) return;
  if (step < STEPS.length - 1) { step++; renderStep(); return; }
  answers = structuredClone(draft); store.set('answers', answers);
  goal = ranked()[0].name; store.set('goal', goal);
  $('#results').hidden = false; $('#analyzing').hidden = false; $('#profile').hidden = true;
  $('#results').scrollIntoView({ behavior: 'smooth' });
  await wait(2200);
  $('#analyzing').hidden = true; showProfile(); render();
  $('#profile').scrollIntoView({ behavior: 'smooth' });
};

/* ---------- results & insights ---------- */
function insightsFor(list) {
  const top = list[0], missing = Object.entries(top.req).filter(([s, r]) => userLevel(s) < r).sort((a, b) => userLevel(a[0]) - userLevel(b[0])).slice(0, 2).map(x => x[0]);
  const out = [];
  const tech = answers.interests.filter(i => ['Programming', 'Artificial Intelligence', 'Data', 'Cloud', 'Cybersecurity', 'Mobile Development'].includes(i));
  out.push(tech.length ? `Your strongest area is ${tech[0] === 'Programming' ? 'programming' : tech[0].toLowerCase()}.` : `Your strongest area is ${answers.interests[0].toLowerCase()}.`);
  if (answers.interests.includes('Artificial Intelligence') && answers.interests.includes('Data')) out.push('You have strong interest in AI and data.');
  out.push(`${top.name} is your top match at ${top.score}%, fitting your ${answers.work.toLowerCase()} work preference.`);
  if (missing.length) out.push(`Improving ${missing.join(' and ')} could significantly increase your career readiness.`);
  return out;
}
function showProfile() {
  $('#results').hidden = false; $('#profile').hidden = false;
  const list = ranked();
  $('#insights').innerHTML = insightsFor(list).map(t => `<li>${t}</li>`).join('');
  $('#recGrid').innerHTML = list.slice(0, 6).map(card).join('');
  watch($('#recGrid'));
}
const isSaved = n => saved.includes(n);
function card(c) {
  return `<article class="card career"><div class="row"><span class="ico" aria-hidden="true">${c.icon}</span>${c.score != null ? `<div class="ring" style="--t:${c.score}" role="img" aria-label="${c.score}% match"><span>${c.score}%</span></div>` : ''}</div>
  <h3>${c.name}</h3><p>${c.desc}</p><p class="tags">${Object.keys(c.req).map(k => `<span>${k}</span>`).join('')}</p>
  <p class="meta"><span class="pill">${c.diff}</span><span class="pill">Growth: ${c.growth}</span></p>
  <div class="row"><button class="btn sm" data-view="${c.name}">View Career</button><button class="btn ghost sm" data-save="${c.name}" aria-pressed="${isSaved(c.name)}">${isSaved(c.name) ? '♥ Saved' : '♡ Save'}</button></div></article>`;
}

/* ---------- career details modal ---------- */
function openCareer(name) {
  const c = ranked().find(x => x.name === name), info = CAT_INFO[c.cat];
  const skills = Object.keys(c.req), half = Math.ceil(skills.length / 2);
  recent = [name, ...recent.filter(n => n !== name)].slice(0, 5); store.set('recent', recent);
  const why = answers
    ? `Your profile matches ${c.score}%. You already list ${skills.filter(s => answers.skills.includes(s)).join(', ') || 'no listed skills yet'} from the required set${c.interests.some(i => answers.interests.includes(i)) ? ', and your interests align with this field' : ''}.`
    : 'Take the assessment to see how this career matches your profile.';
  $('#mBody').innerHTML = `<h2 id="mTitle">${c.icon} ${c.name}</h2><p>${c.desc}</p>
  <h3>What professionals do</h3><p>${c.desc} Day to day they collaborate with teammates, solve problems and keep improving their work.</p>
  <h3>Required skills</h3><p class="tags">${skills.map(s => `<span>${s}</span>`).join('')}</p>
  <p><strong>Beginner skills:</strong> ${skills.slice(0, half).join(', ')}<br><strong>Advanced skills:</strong> ${skills.slice(half).join(', ')}</p>
  <p><strong>Typical tools:</strong> ${c.tools}</p><p><strong>Work environment:</strong> ${info.env}</p>
  <p><strong>Career growth:</strong> ${c.growth} demand, with paths into senior and lead roles.</p><p><strong>Challenges:</strong> ${info.chal}</p>
  <p><strong>Why this matches you:</strong> ${why}</p><button class="btn" id="buildRoad">Build My Roadmap</button> `;
  $('#buildRoad').onclick = () => { setGoal(name); $('#modal').close(); $('#roadmap').scrollIntoView({ behavior: 'smooth' }); };
  $('#modal').showModal(); renderSaved();
}
$('#mClose').onclick = () => $('#modal').close();
$('#modal').addEventListener('click', e => { if (e.target.id === 'modal') e.target.close(); });

/* ---------- skill gap & roadmap ---------- */
function setGoal(n) { goal = n; store.set('goal', n); renderGap(); renderRoad(); renderStats(); $$('.goalSel').forEach(s => (s.value = n)); }
function renderGap() {
  const c = byName(goal);
  const rows = Object.entries(c.req).map(([s, r]) => ({ s, r, u: userLevel(s) }));
  const focus = rows.filter(x => x.u < x.r).sort((a, b) => b.r - b.u - (a.r - a.u)).slice(0, 4);
  $('#gapBody').innerHTML = `<div class="row between"><strong>Your Current Skills</strong><span class="muted">versus Skills Required (orange marker)</span></div>` +
    rows.map(x => `<div class="gap-row"><div class="row between"><span>${x.s} ${x.u === 0 ? '<span class="miss">Missing</span>' : ''}</span><span class="muted">Your level: ${x.u}% / Required: ${x.r}%</span></div><i class="bar"><b data-w="${x.u}"></b><span class="req" style="left:${x.r}%"></span></i></div>`).join('') +
    `<p><strong>${focus.length ? `You should focus on these ${focus.length} skills next: ${focus.map(f => f.s).join(', ')}.` : 'You meet every required skill level. Great work!'}</strong></p>`;
  watch($('#gapBody'));
}
const roadPct = n => { const st = CAT_INFO[byName(n).cat].road.split('|'), p = prog[n] || []; return Math.round(st.reduce((s, _, i) => s + (p[i] || 0) / 2, 0) / st.length * 100); };
function renderRoad() {
  const c = byName(goal), steps = CAT_INFO[c.cat].road.split('|'), p = prog[goal] || [];
  const label = ['Not Started', 'In Progress', 'Completed'];
  $('#roadBody').innerHTML = `<p class="muted">Career goal: <strong>${goal}</strong></p><p>Roadmap Progress <strong>${roadPct(goal)}%</strong></p><i class="bar thick"><b data-w="${roadPct(goal)}"></b></i>
  <ol class="steps">${steps.map((t, i) => `<li class="s${p[i] || 0}" data-n="${String(i + 1).padStart(2, '0')}"><span>${t}</span><button class="st" data-step="${i}" aria-label="${t}: ${label[p[i] || 0]}. Click to change.">${label[p[i] || 0]}</button></li>`).join('')}</ol>`;
  watch($('#roadBody'));
}
$('#roadBody').addEventListener('click', e => {
  const b = e.target.closest('[data-step]'); if (!b) return;
  const i = +b.dataset.step, p = prog[goal] || (prog[goal] = []);
  p[i] = ((p[i] || 0) + 1) % 3; store.set('prog', prog);
  renderRoad(); renderStats(); $(`[data-step="${i}"]`).focus();
});

/* ---------- saved, explore, compare ---------- */
function renderSaved() {
  const list = ranked().filter(c => isSaved(c.name));
  $('#savedGrid').innerHTML = list.length ? list.map(c => `<article class="card career"><h3>${c.icon} ${c.name}</h3><p class="muted">${c.score != null ? c.score + '% match' : 'Take the assessment for a match score'}</p><div class="row"><button class="btn sm" data-view="${c.name}">View</button><button class="btn ghost sm" data-save="${c.name}">Remove</button></div></article>`).join('')
    : `<div class="card center"><h3>No saved careers yet</h3><p class="muted">Tap "Save" on any career card and it will appear here.</p><a class="btn sm" href="#explore">Explore careers</a></div>`;
  $('#recent').textContent = recent.length ? 'Recently viewed: ' + recent.join(', ') : '';
}
function renderExplore() {
  const q = $('#search').value.trim().toLowerCase(), d = $('#diff').value;
  const list = ranked().filter(c => (activeCat === 'All' || c.cat === activeCat) && (!d || c.diff === d) &&
    (!q || (c.name + c.desc + Object.keys(c.req).join(' ')).toLowerCase().includes(q)));
  $('#exGrid').innerHTML = list.length ? list.map(card).join('') : '<p class="muted">No careers match these filters. Try clearing the search.</p>';
  watch($('#exGrid'));
}
$('#cats').innerHTML = ['All', ...Object.keys(CAT_INFO)].map(c => `<button class="cat" aria-pressed="${c === 'All'}" data-cat="${c}">${c}</button>`).join('');
$('#cats').onclick = e => { const b = e.target.closest('[data-cat]'); if (!b) return; activeCat = b.dataset.cat; $$('.cat').forEach(x => x.setAttribute('aria-pressed', x === b)); renderExplore(); };
$('#search').oninput = renderExplore; $('#diff').onchange = renderExplore;

const LMH = ['Low', 'Medium', 'High'];
$('#cmpBtn').onclick = () => {
  const names = [...new Set(['#cmpA', '#cmpB', '#cmpC'].map(s => $(s).value).filter(Boolean))];
  if (names.length < 2) { $('#cmpOut').innerHTML = '<p class="err">Choose at least two different careers.</p>'; return; }
  const cs = names.map(n => ranked().find(c => c.name === n));
  const best = answers ? cs.reduce((a, b) => (b.score > a.score ? b : a)).name : null;
  const rows = [['Coding', c => LMH[c.m[0] - 1]], ['Mathematics', c => LMH[c.m[1] - 1]], ['AI', c => LMH[c.m[2] - 1]], ['Database', c => LMH[c.m[3] - 1]], ['Difficulty', c => c.diff], ['Learning Time', c => ({ Easy: 'Low', Medium: 'Medium', Hard: 'High' })[c.diff]], ['Your match', c => (c.score != null ? c.score + '%' : 'Take assessment')]];
  $('#cmpOut').innerHTML = `<table><thead><tr><th>Feature</th>${cs.map(c => `<th class="${c.name === best ? 'best' : ''}" scope="col">${c.name}${c.name === best ? ' ★ Best for you' : ''}</th>`).join('')}</tr></thead><tbody>${rows.map(([f, fn]) => `<tr><th scope="row">${f}</th>${cs.map(c => `<td class="${c.name === best ? 'best' : ''}">${fn(c)}</td>`).join('')}</tr>`).join('')}</tbody></table>`;
};

/* ---------- stats dashboard ---------- */
function renderStats() {
  const list = ranked(), done = Object.values(prog).flat().filter(v => v === 2).length;
  const avg = answers ? Math.round(list.reduce((s, c) => s + c.score, 0) / list.length) : 0;
  const items = [['Top career match', answers ? list[0].name : 'Not yet', null], ['Average match score', avg, '%'], ['Skills completed', done, ''], ['Roadmap progress', roadPct(goal), '%'], ['Saved careers', saved.length, '']];
  $('#stats').innerHTML = items.map(([l, v, suf]) => `<div class="card stat"><strong ${suf === null ? '' : `data-count="${v}" data-suf="${suf}"`}>${suf === null ? v : '0' + suf}</strong><span class="muted">${l}</span></div>`).join('');
  $('#chart').innerHTML = `<strong>Top 5 matches</strong>` + (answers ? `<div class="bars chart">${list.slice(0, 5).map(c => `<div class="col"><i data-h="${c.score}"></i><span>${c.score}%<br>${c.name}</span></div>`).join('')}</div>` : '<p class="muted">Complete the assessment to see your match chart.</p>');
  watch($('#stats')); watch($('#chart'));
}
function render() { renderExplore(); renderSaved(); renderGap(); renderRoad(); renderStats(); if (answers && !$('#profile').hidden) showProfile(); }

/* ---------- global events ---------- */
document.addEventListener('click', e => {
  const v = e.target.closest('[data-view]'); if (v) openCareer(v.dataset.view);
  const s = e.target.closest('[data-save]');
  if (s) {
    const n = s.dataset.save;
    saved = isSaved(n) ? saved.filter(x => x !== n) : [...saved, n]; store.set('saved', saved);
    $$('[data-save]').forEach(b => { if (b.textContent.includes('Remove')) return; const on = isSaved(b.dataset.save); b.textContent = on ? '♥ Saved' : '♡ Save'; b.setAttribute('aria-pressed', on); });
    renderSaved(); renderStats();
  }
});
$$('.goalSel, #cmpA, #cmpB, #cmpC').forEach(s => { s.innerHTML = (s.id === 'cmpC' ? '<option value="">None</option>' : '') + CAREERS.map(c => `<option>${c.name}</option>`).join(''); });
$$('.goalSel').forEach(s => s.addEventListener('change', () => setGoal(s.value)));
$('#cmpA').value = 'Python Developer'; $('#cmpB').value = 'Data Scientist';

/* theme, nav, tip, faq, feedback */
const root = document.documentElement;
root.dataset.theme = store.get('theme', 'dark');
$('#theme').onclick = () => { root.dataset.theme = root.dataset.theme === 'dark' ? 'light' : 'dark'; store.set('theme', root.dataset.theme); };
window.addEventListener('scroll', () => $('#nav').classList.toggle('scrolled', scrollY > 20), { passive: true });
const closeMenu = () => { $('#menu').classList.remove('open'); $('#burger').setAttribute('aria-expanded', 'false'); };
$('#burger').onclick = () => $('#burger').setAttribute('aria-expanded', $('#menu').classList.toggle('open'));
$('#menu').onclick = e => { if (e.target.closest('a')) closeMenu(); };
let tipIdx = Math.floor(Date.now() / 864e5) % TIPS.length;
const showTip = () => ($('#tipText').textContent = TIPS[tipIdx]);
$('#tipBtn').onclick = () => { tipIdx = (tipIdx + 1) % TIPS.length; showTip(); };
$('#faqList').innerHTML = FAQ.map(([q, a], i) => `<div class="card faq"><button aria-expanded="false" aria-controls="fa${i}">${q}<span aria-hidden="true">+</span></button><p id="fa${i}" hidden>${a}</p></div>`).join('');
$('#faqList').onclick = e => {
  const b = e.target.closest('button'); if (!b) return;
  const open = b.getAttribute('aria-expanded') === 'true';
  b.setAttribute('aria-expanded', !open); b.nextElementSibling.hidden = open; b.lastChild.textContent = open ? '+' : '−';
};
$('#fb').addEventListener('submit', e => {
  e.preventDefault();
  const [n, m, f] = ['#fbName', '#fbEmail', '#fbMsg'].map(s => $(s).value.trim());
  if (!n || !f || !/^\S+@\S+\.\S+$/.test(m)) { $('#fbErr').textContent = 'Enter your name, a valid email and your feedback.'; return; }
  $('#fbErr').textContent = '';
  location.href = `mailto:hello@example.com?subject=${encodeURIComponent('CareerAI feedback from ' + n)}&body=${encodeURIComponent(f + '\n\nReply to: ' + m)}`; // placeholder address
});

/* init */
showTip(); renderStep(); render(); watch();
if (answers) { step = 0; showProfile(); $('#analyzing').hidden = true; }