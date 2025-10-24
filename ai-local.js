/* IA locale (WebLLM) — réécriture “style antenne” sans clé
   Tolérant aux blocages CDN/Worker et verbeux en diagnostics.
*/
(() => {
  const STATUS = () => document.getElementById('iaLocalStatus');
  const OUT = () => document.getElementById('resultat');
  const BTN = () => document.getElementById('btnRewriteLocal');

  let webllmClient = null;
  let webllmReady = false;

  const WEBLLM_SCRIPT = "https://unpkg.com/@mlc-ai/web-llm/dist/web-llm.min.js";
  const WORKER_CDN    = "https://unpkg.com/@mlc-ai/web-llm/dist/worker.js";
  const WORKER_LOCAL  = "/vendor/web-llm/worker.js"; // ← fallback local (à créer)
  const MODEL_NAME    = "Phi-3-mini-4k-instruct-q4f16_1-MLC"; // compact

  const text = (el, t) => { if (el) el.textContent = t; };
  const log  = (...args) => console.log("[AI-LOCAL]", ...args);

  // ---- DIAGNOSTIC ----
  function printEnvDiag() {
    const diag = [
      `webllm: ${!!window.webllm}`,
      `Worker: ${!!window.Worker}`,
      `GPU: ${!!navigator.gpu}`,
      `Cross-origin isolated: ${self.crossOriginIsolated === true}`,
      `Protocol: ${location.protocol}`
    ].join(" | ");
    log(diag);
    text(STATUS(), `Diagnostic: ${diag}`);
  }

  // Charge la lib web-llm si absente
  function ensureWebLLMScript() {
    return new Promise((resolve, reject) => {
      if (window.webllm) return resolve(true);
      const s = document.createElement('script');
      s.src = WEBLLM_SCRIPT;
      s.defer = true;
      s.onload = () => resolve(true);
      s.onerror = () => reject(new Error("CDN web-llm.min.js indisponible."));
      document.head.appendChild(s);
    });
  }

  // Essaie d’instancier un worker (CDN ou local)
  function tryCreateWorker(url) {
    try {
      const w = new Worker(url, { type: "module" });
      return w;
    } catch (e) {
      log("Worker init failed:", url, e);
      return null;
    }
  }

  async function ensureWebLLM() {
    if (webllmReady) return;

    printEnvDiag();
    await ensureWebLLMScript();

    if (!window.Worker) {
      throw new Error("Les Web Workers sont désactivés dans ce navigateur.");
    }

    text(STATUS(), "⏳ Initialisation de l’IA locale… (téléchargement du modèle)");

    // 1) Essai avec worker CDN
    let worker = tryCreateWorker(WORKER_CDN);

    // 2) Si échec, essai worker local
    if (!worker) {
      text(STATUS(), "⚠️ Worker CDN bloqué, tentative avec worker local…");
      worker = tryCreateWorker(WORKER_LOCAL);
    }

    if (!worker) {
      throw new Error("Impossible de créer un Worker (CDN et local ont échoué). Vérifie l’URL du worker local et les extensions de sécurité.");
    }

    // wasmProxy: permet de tourner même sans WebGPU (plus lent)
    webllmClient = new webllm.ChatWorkerClient(worker, { wasmProxy: true });

    // Progression de chargement
    webllmClient.setInitProgressCallback((p) => {
      const pct = p?.progress != null ? Math.round(p.progress * 100) : null;
      text(STATUS(), pct != null ? `⬇️ Téléchargement du modèle (${pct}%)…` : (p?.text || "Préparation du modèle…"));
    });

    try {
      await webllmClient.reload({ model: MODEL_NAME });
    } catch (e) {
      // Message lisible si COEP/COOP ou CORS posent souci
      throw new Error("Échec chargement modèle. Causes possibles: réseau bloqué, CORS, ou navigateur trop ancien. Détail: " + (e?.message || e));
    }

    webllmReady = true;
    text(STATUS(), "✅ IA locale prête.");
    setTimeout(() => text(STATUS(), ""), 2000);
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
      alert("Erreur IA locale.\n• Essaye un autre navigateur (Chrome/Edge récent)\n• Vérifie que /vendor/web-llm/worker.js existe\n• Ouvre via http://localhost (pas file://)\n• Désactive provisoirement les extensions de blocage.");
    } finally {
      btn.disabled = false;
    }
  }

  document.addEventListener('DOMContentLoaded', () => {
    const btn = BTN();
    if (btn) btn.addEventListener('click', rewriteWithLocalAI);
  });
})();
