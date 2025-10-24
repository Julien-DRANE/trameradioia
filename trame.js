// ===== Utilitaires communs =====
const $ = (sel) => document.querySelector(sel);
const $$ = (sel) => Array.from(document.querySelectorAll(sel));

function setResult(text) {
  $('#resultat').textContent = text;
  localStorage.setItem('resultat', text);
}

function getField(id) {
  return (document.getElementById(id)?.value || '').trim();
}

// ===== Gestion des onglets =====
function initTabs() {
  const tabButtons = $$('.tab-btn');
  const panels = $$('.tab-panel');

  tabButtons.forEach((btn) => {
    btn.addEventListener('click', () => {
      tabButtons.forEach((b) => b.classList.remove('active'));
      panels.forEach((p) => p.classList.remove('active'));
      btn.classList.add('active');
      document.querySelector(`#panel-${btn.dataset.tab}`).classList.add('active');
    });
  });
}

// ===== MODE LIBRE =====
let argCount = 1;

function addArgument() {
  argCount++;
  const container = $('#dev-container');
  const div = document.createElement('div');
  div.classList.add('dev-field');
  div.innerHTML = `
    <label>Argument ${argCount} + exemple :</label>
    <textarea rows="4"></textarea>
    <button type="button" class="btn-remove-arg">❌ Supprimer</button>
  `;
  container.appendChild(div);

  div.querySelector('.btn-remove-arg').addEventListener('click', () => {
    div.remove();
  });
}

function compilerChronique() {
  const intro1 = getField('intro1');
  const intro2 = getField('intro2');
  const intro3 = getField('intro3');
  const concl1 = getField('concl1');
  const concl2 = getField('concl2');

  const args = $$('#dev-container textarea')
    .map((ta, i) => `Argument ${i + 1} : ${ta.value || '(vide)'}`)
    .join('\n');

  const texteFinal =
    'CHRONIQUE RADIO\n\n' +
    'Introduction :\n' +
    '1) ' + (intro1 || '(vide)') + '\n' +
    '2) ' + (intro2 || '(vide)') + '\n' +
    '3) ' + (intro3 || '(vide)') + '\n\n' +
    'Développement :\n' +
    args + '\n\n' +
    'Conclusion :\n' +
    '1) ' + (concl1 || '(vide)') + '\n' +
    '2) ' + (concl2 || '(vide)');

  setResult(texteFinal);
}

function resetChronique() {
  if (confirm('Voulez-vous vraiment effacer cette chronique et recommencer ?')) {
    $$('textarea').forEach((el) => (el.value = ''));
    $('#resultat').textContent = '';
    localStorage.clear();

    // ré-init participants & questions pour les autres onglets
    $('#g_participants').innerHTML = '';
    pIndex = 0; addParticipant(); addParticipant(); updatePreview();

    $('#i_questions').innerHTML = '';
    qIndex = 0; addQuestion(); addQuestion(); updateInterviewPreview();
  }
}

// ===== MODE GUIDÉ (chronique) =====
let pIndex = 0;

function addParticipant(defaultName = '') {
  pIndex++;
  const wrap = document.createElement('div');
  wrap.className = 'dev-field';
  wrap.innerHTML = `
    <label for="p_${pIndex}">Intervenant ${pIndex} :</label>
    <div style="display:flex; gap:.5rem; align-items:center;">
      <input id="p_${pIndex}" type="text" placeholder="Prénom / Rôle" value="${defaultName}" />
      <button type="button" class="btn-del-p">❌</button>
    </div>
  `;
  $('#g_participants').appendChild(wrap);

  wrap.querySelector('input').addEventListener('input', updatePreview);
  wrap.querySelector('.btn-del-p').addEventListener('click', () => {
    wrap.remove();
    updatePreview();
  });
}

function listParticipants() {
  return $$('#g_participants input').map((i) => i.value.trim()).filter(Boolean);
}

function partsAsText(parts) {
  if (parts.length === 0) return '______';
  if (parts.length === 1) return parts[0];
  if (parts.length === 2) return parts[0] + ' et ' + parts[1];
  return parts.slice(0, -1).join(', ') + ' et ' + parts.slice(-1);
}

function renderTemplate(tpl, ctx) {
  // Condition simple: {{date? (le {{date}}) :}}
  tpl = tpl.replace(/\{\{date\?\s*\(([^)]*)\)\s*:\s*\}\}/g, (_, inside) =>
    ctx.date ? inside.replace(/\{\{date\}\}/g, ctx.date) : ''
  );
  tpl = tpl.replace(/\{\{i_date\?\s*\(([^)]*)\)\s*:\s*\}\}/g, (_, inside) =>
    ctx.i_date ? inside.replace(/\{\{i_date\}\}/g, ctx.i_date) : ''
  );
  // Variables simples {{var}}
  return tpl.replace(/\{\{\s*([a-zA-Z0-9_]+)\s*\}\}/g, (_, key) => (ctx[key] ?? '______'));
}

function buildContextChronique() {
  const participants = listParticipants();
  return {
    radio: getField('g_radio') || '______',
    college: getField('g_college') || '______',
    theme: getField('g_theme') || '______',
    date: getField('g_date'),
    participants: partsAsText(participants),
    p1: participants[0] || '______',
    dev1: getField('g_dev1') || '______',
    ex1: getField('g_ex1') || '______',
    dev2: getField('g_dev2') || '______',
    ex2: getField('g_ex2') || '______',
    dev3: getField('g_dev3') || '______',
    ex3: getField('g_ex3') || '______',
    conc_resume: getField('g_conc_resume') || '______',
    conc_ouverture: getField('g_conc_ouverture') || '______',
    conc_appel: getField('g_conc_appel') || ''
  };
}

function updatePreview() {
  const ctx = buildContextChronique();
  const tpl = $('#g_template').value;
  const out = renderTemplate(tpl, ctx);
  $('#g_preview').textContent = out;
}

// ===== MODE INTERVIEW =====
let qIndex = 0;

function addQuestion(q = '', r = '') {
  qIndex++;
  const block = document.createElement('div');
  block.className = 'dev-field';
  block.innerHTML = `
    <label>Question ${qIndex} :</label>
    <textarea rows="2" placeholder="Question principale">${q}</textarea>
    <label class="small">Relance (facultative) :</label>
    <input type="text" placeholder="Et concrètement ? Un exemple ?" value="${r}" />
    <div><button type="button" class="btn-del-q">❌ Supprimer</button></div>
  `;
  $('#i_questions').appendChild(block);

  block.querySelector('textarea').addEventListener('input', updateInterviewPreview);
  block.querySelector('input').addEventListener('input', updateInterviewPreview);
  block.querySelector('.btn-del-q').addEventListener('click', () => {
    block.remove();
    updateInterviewPreview();
  });
}

function listQuestions() {
  const blocks = $$('#i_questions .dev-field');
  return blocks
    .map((b) => {
      const qta = b.querySelector('textarea');
      const rinput = b.querySelector('input');
      return { q: (qta?.value || '').trim(), r: (rinput?.value || '').trim() };
    })
    .filter((x) => x.q);
}

function buildInterviewBlock() {
  const qs = listQuestions();
  if (qs.length === 0) return '• ______';
  return qs
    .map(({ q, r }, idx) => {
      let s = `• Q${idx + 1} — ${q}`;
      if (r) s += `\n  Relance : ${r}`;
      return s;
    })
    .join('\n');
}

function updateInterviewPreview() {
  const ctx = {
    i_radio: getField('i_radio') || '______',
    i_college: getField('i_college') || '______',
    i_theme: getField('i_theme') || '______',
    i_date: getField('i_date'),
    i_interviewer: getField('i_interviewer') || '______',
    i_guest: getField('i_guest') || '______',
    i_bloc: buildInterviewBlock()
  };
  const tpl = $('#i_template').value;
  $('#i_preview').textContent = renderTemplate(tpl, ctx);
}

// ===== Export PDF =====
async function exportPDF() {
  const JsPDFCtor = window.jspdf?.jsPDF;
  if (!JsPDFCtor) {
    alert("jsPDF n'est pas chargé.");
    return;
  }
  const doc = new JsPDFCtor({ unit: 'mm', format: 'a4' });
  const fontSel = ($('#fontSelect')?.value || 'helvetica');
  const fontSize = parseInt($('#fontSize')?.value || '12', 10);
  try { doc.setFont(fontSel); } catch (_) { doc.setFont('helvetica'); }
  doc.setFontSize(fontSize);

  const bleuFonce = [0, 38, 84];
  const margin = 20;
  const pageWidth = doc.internal.pageSize.getWidth() - margin * 2;
  let y = 20;

  function writeBlock(text, color = [0, 0, 0], bold = false) {
    doc.setFont(undefined, bold ? 'bold' : 'normal');
    doc.setTextColor(...color);
    const lines = doc.splitTextToSize(text, pageWidth);
    for (const line of lines) {
      if (y > doc.internal.pageSize.getHeight() - 20) { doc.addPage(); y = 20; }
      doc.text(line, margin, y); y += 6;
    }
    y += 2;
  }

  const contenu =
    $('#resultat').textContent?.trim() ||
    $('#g_preview').textContent?.trim() ||
    $('#i_preview').textContent?.trim() ||
    '';

  writeBlock('CHRONIQUE RADIO', bleuFonce, true); y += 6;
  if (contenu) { writeBlock(contenu); } else { writeBlock('(aucun contenu à exporter)', [120, 120, 120]); }

  const pageCount = doc.internal.getNumberOfPages();
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    doc.setFontSize(10);
    doc.setTextColor(150);
    doc.text(`Page ${i}/${pageCount}`, doc.internal.pageSize.getWidth() - 30, doc.internal.pageSize.getHeight() - 10);
    doc.text('Concours NON AU HARCÈLEMENT – Atelier radio', margin, doc.internal.pageSize.getHeight() - 10);
  }

  doc.save('chronique.pdf');
}

// ===== Wiring des événements =====
document.addEventListener('DOMContentLoaded', () => {
  // Tabs
  initTabs();

  // Mode libre
  $('#addArgBtn').addEventListener('click', addArgument);
  $('#compileBtn').addEventListener('click', compilerChronique);
  $('#resetBtn').addEventListener('click', resetChronique);

  // Mode guidé : init + listeners
  addParticipant(); addParticipant(); updatePreview();
  [
    'g_radio','g_college','g_theme','g_date','g_template',
    'g_dev1','g_ex1','g_dev2','g_ex2','g_dev3','g_ex3',
    'g_conc_resume','g_conc_ouverture','g_conc_appel'
  ].forEach(id => {
    document.addEventListener('input', e => { if (e.target && e.target.id === id) updatePreview(); });
  });
  $('#btnAddP').addEventListener('click', () => { addParticipant(); updatePreview(); });
  $('#btnClearP').addEventListener('click', () => { $('#g_participants').innerHTML = ''; pIndex = 0; updatePreview(); });
  $('#btnGenGuide').addEventListener('click', updatePreview);
  $('#btnInsertGuide').addEventListener('click', () => setResult($('#g_preview').textContent || ''));

  // Interview : init + listeners
  addQuestion('Qu’est-ce que {{i_theme}} dans votre établissement ?');
  addQuestion('Quels effets observez-vous chez les élèves ?', 'Avez-vous un exemple concret ?');
  updateInterviewPreview();

  ['i_radio','i_college','i_theme','i_date','i_interviewer','i_guest','i_template'].forEach(id => {
    document.addEventListener('input', e => { if (e.target && e.target.id === id) updateInterviewPreview(); });
  });
  $('#btnAddQ').addEventListener('click', () => { addQuestion(); updateInterviewPreview(); });
  $('#btnClearQ').addEventListener('click', () => { $('#i_questions').innerHTML = ''; qIndex = 0; updateInterviewPreview(); });
  $('#btnGenItw').addEventListener('click', updateInterviewPreview);
  $('#btnInsertItw').addEventListener('click', () => setResult($('#i_preview').textContent || ''));

  // Export
  $('#exportPdfBtn').addEventListener('click', exportPDF);
});
