/* IA locale (WebLLM) — réécriture “style antenne” sans clé
   Dépendances : DOM de trame.html. Le script WebLLM sera injecté si absent.
*/
(() => {
  const STATUS = () => document.getElementById('iaLocalStatus');
  const OUT = () => document.getElementById('resultat');
  const BTN = () => document.getElementById('btnRewriteLocal');

  let webllmClient = null;
  let webllmReady = false;

  // CDNs & modèle
  const WEBLLM_SRC    = "https://unpkg.com/@mlc-ai/web-llm/dist/web-llm.min.js";
  const WEBLLM_WORKER = "https://unpkg.com/@mlc-ai/web-llm/dist/worker.js";
  const WEBLLM_MODEL  = "Phi-3-mini-4k-instruct-q4f16_1-MLC"; // compact, FR ok

  const text = (el, t) => { if (el) el.textContent = t; };

  // 🔧 Injecte le script WebLLM si absent (fix Live Server / timing)
  function ensureWebLLMScript() {
    return new Promise((resolve, reject) => {
      if (window.webllm) return resolve();
      const s = document.createElement('script');
      s.src = WEBLLM_SRC;
      s.defer = true;
      s.onload = () => resolve();
      s.onerror = () => reject(new Error("Impossible de charger WebLLM depuis le CDN."));
      document.head.appendChild(s);
    });
  }

  function buildLocalInstruction() {
    const style = document.getElementById('iaStyle')?.value || 'journalistique';
    const longueur = document.getElementById('iaLongueur')?.value || 'conserve';
    const addr = document.getElementById('iaTutoiement')?.value || 'neutre';

    const styleMap = {
      journalistique: "Ton journalistique radio, naturel, fluide, transitions orales.",
      dynamique: "Ton dynamique et énergique, phrases courtes, transitions rythmées.",
      sobre: "Ton sobre et clair, informatif, enchaînements posés.",
      pedagogique: "Ton pédagogique, clair, vulgarisation légère, transitions explicatives."
    };
    const lenMap = {
      conserve: "Conserver sensiblement la longueur.",
      condense: "Condense environ 25% sans perdre les infos clés.",
      developpe: "Développe environ 25% avec explications légères."
    };
    const addrMap = {
      neutre: "Adresse neutre (sans tutoiement/vouvoiement marqué).",
      vous: "Adresse l'auditoire au 'vous'.",
      tu: "Adresse l'auditoire au 'tu'."
    };

    return [
      styleMap[style], lenMap[longueur], addrMap[addr],
      "Respecte strictement les faits. Écris pour l’oral antenne : connecteurs (d’abord, ensuite, enfin, en résumé), phrases naturelles.",
      "Évite les puces, pas de jargon. Ajoute un lancement simple et une chute courte si pertinent. N’invente aucune info."
    ].join(" ");
  }

  // 🚀 Prépare le moteur WebLLM (charge le script si besoin + worker + modèle)
  async function ensureWebLLM() {
    if (webllmReady) return;
    await ensureWebLLMScript();

    if (!window.Worker) {
      throw new Error("Les Web Workers sont désactivés dans ce navigateur.");
    }

    text(STATUS(), "⏳ Initialisation de l’IA locale… (téléchargement du modèle)");

    // Worker module depuis CDN
    webllmClient = new webllm.ChatWorkerClient(
      new Worker(WEBLLM_WORKER, { type: "module" }),
      { wasmProxy: true } // permet de tourner même sans WebGPU (plus lent)
    );

    // Progression de téléchargement/compilation
    webllmClient.setInitProgressCallback((p) => {
      const pct = p?.progress != null ? Math.round(p.progress * 100) : null;
      text(STATUS(), pct != null ? `⬇️ Téléchargement du modèle (${pct}%)…` : (p?.text || "Préparation du modèle…"));
    });

    await webllmClient.reload({ model: WEBLLM_MODEL });
    webllmReady = true;
    text(STATUS(), "✅ IA locale prête.");
    setTimeout(() => text(STATUS(), ""), 2000);
  }

  // ✨ Action de réécriture
  async function rewriteWithLocalAI() {
    const out = OUT();
    const status = STATUS();
    const btn = BTN();
    const source = (out?.textContent || '').trim();

    if (!source) {
      alert("Compile d’abord un texte (ou insère depuis l’onglet guidé / interview).");
      return;
    }

    btn.disabled = true;
    try {
      await ensureWebLLM();
      text(status, "🧠 Réécriture locale en cours…");

      const messages = [
        { role: "system", content: "Tu es un rédacteur radio francophone. Tu rends un texte brut fluide et naturel à dire à l’antenne, sans inventer d’informations." },
        { role: "user", content: `Consignes: ${buildLocalInstruction()}\n\nTexte à réécrire:\n${source}` }
      ];

      const result = await webllmClient.chatCompletion({
        messages,
        temperature: 0.7,
        max_tokens: 1000,
        stream: false
      });

      const rewritten = result?.choices?.[0]?.message?.content?.trim();
      if (!rewritten) throw new Error("Réponse vide.");

      out.textContent = rewritten;
      localStorage.setItem("resultat", rewritten);
      text(status, "✅ Réécriture terminée (IA locale).");
      setTimeout(() => text(status, ""), 4000);
    } catch (e) {
      console.error(e);
      text(STATUS(), "❌ Erreur IA locale : " + (e?.message || e));
      alert("Erreur IA locale. Vérifie le chargement CDN, utilise un navigateur récent (Chrome/Edge) et ouvre via http://localhost (pas file://).");
    } finally {
      btn.disabled = false;
    }
  }

  // 🔌 Wiring
  document.addEventListener('DOMContentLoaded', () => {
    const btn = BTN();
    if (btn) btn.addEventListener('click', rewriteWithLocalAI);
  });
})();
