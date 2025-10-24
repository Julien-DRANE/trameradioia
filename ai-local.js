/* IA locale (WebLLM) — réécriture “style antenne” sans clé
   Tolérant aux blocages CDN/Worker : essaie CDN puis bascule en local.
*/
(() => {
  const STATUS = () => document.getElementById('iaLocalStatus');
  const OUT = () => document.getElementById('resultat');
  const BTN = () => document.getElementById('btnRewriteLocal');

  let webllmClient = null;
  let webllmReady = false;

  // --- chemins ---
  const CDN_SCRIPT   = "https://unpkg.com/@mlc-ai/web-llm/dist/web-llm.min.js";
  const CDN_WORKER   = "https://unpkg.com/@mlc-ai/web-llm/dist/worker.js";
  const LOCAL_SCRIPT = "/vendor/web-llm/web-llm.min.js";
  const LOCAL_WORKER = "/vendor/web-llm/worker.js";

  // Modèle compact
  const MODEL_NAME   = "Phi-3-mini-4k-instruct-q4f16_1-MLC";

  const text = (el, t) => { if (el) el.textContent = t; };
  const log  = (...a) => console.log("[AI-LOCAL]", ...a);

  // Affiche un petit diagnostic utile
  function printEnvDiag() {
    const diag = [
      `webllm:${!!window.webllm}`,
      `Worker:${!!window.Worker}`,
      `GPU:${!!navigator.gpu}`,
      `Prot:${location.protocol}`,
      `COI:${self.crossOriginIsolated === true}`
    ].join(" | ");
    log(diag);
    text(STATUS(), `Diagnostic: ${diag}`);
  }

  // Injecte un script <script src=...> et résout quand chargé
  function injectScript(src) {
    return new Promise((resolve, reject) => {
      const s = document.createElement('script');
      s.src = src;
      s.defer = true;
      s.onload = () => resolve(true);
      s.onerror = () => reject(new Error("échec chargement " + src));
      document.head.appendChild(s);
    });
  }

  // Charge web-llm soit via CDN, soit via local
  async function ensureWebLLMScript() {
    if (window.webllm) return "present";
    // 1) tente CDN
    try {
      await injectScript(CDN_SCRIPT);
      log("CDN web-llm.min.js OK");
      return "cdn";
    } catch (e) {
      log("CDN web-llm.min.js KO", e);
      // 2) fallback local
      await injectScript(LOCAL_SCRIPT);
      log("LOCAL web-llm.min.js OK");
      return "local";
    }
  }

  // Essaie d’instancier un Worker module
  function tryCreateWorker(url) {
    try { return new Worker(url, { type: "module" }); }
    catch (e) { log("Worker fail", url, e); return null; }
  }

  async function ensureWebLLM() {
    if (webllmReady) return;

    printEnvDiag();
    if (!window.Worker) throw new Error("Les Web Workers sont désactivés.");

    const origin = await ensureWebLLMScript(); // "cdn" | "local" | "present"

    text(STATUS(), "⏳ Initialisation de l’IA locale… (téléchargement du modèle)");

    // on privilégie le worker du même “origine” que la lib
    let worker =
      (origin === "cdn")   ? tryCreateWorker(CDN_WORKER)   :
      (origin === "local") ? tryCreateWorker(LOCAL_WORKER) :
                              tryCreateWorker(CDN_WORKER) || tryCreateWorker(LOCAL_WORKER);

    if (!worker) {
      // dernier essai : l’autre origine
      worker = tryCreateWorker(CDN_WORKER) || tryCreateWorker(LOCAL_WORKER);
    }
    if (!worker) {
      throw new Error("Impossible de créer un Worker (CDN & local). Vérifie /vendor/web-llm/worker.js et les extensions de sécurité.");
    }

    // wasmProxy => autorise le fallback CPU/WASM (plus lent), pas besoin absolu de WebGPU.
    webllmClient = new webllm.ChatWorkerClient(worker, { wasmProxy: true });

    webllmClient.setInitProgressCallback((p) => {
      const pct = p?.progress != null ? Math.round(p.progress * 100) : null;
      text(STATUS(), pct != null ? `⬇️ Téléchargement du modèle (${pct}%)…` : (p?.text || "Préparation du modèle…"));
    });

    try {
      await webllmClient.reload({ model: MODEL_NAME });
    } catch (e) {
      throw new Error("Échec chargement modèle (réseau/CORS/navigateur). Détail: " + (e?.message || e));
    }

    webllmReady = true;
    text(STATUS(), "✅ IA locale prête.");
    setTimeout(() => text(STATUS(), ""), 1500);
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

    if (!source) { alert("Compile d’abord un texte (ou insère depuis Guidé/Interview)."); return; }

    btn.disabled = true;
    try {
      await ensureWebLLM();
      text(status, "🧠 Réécriture locale en cours…");

      const messages = [
        { role: "system", content: "Tu es un rédacteur radio francophone. Tu rends un texte brut fluide et naturel à dire à l’antenne, sans inventer d’informations." },
        { role: "user", content: `Consignes: ${buildLocalInstruction()}\n\nTexte à réécrire:\n${source}` }
      ];

      const result = await webllmClient.chatCompletion({ messages, temperature: 0.7, max_tokens: 1000, stream: false });
      const rewritten = result?.choices?.[0]?.message?.content?.trim();
      if (!rewritten) throw new Error("Réponse vide.");

      out.textContent = rewritten;
      localStorage.setItem("resultat", rewritten);
      text(status, "✅ Réécriture terminée (IA locale).");
      setTimeout(() => text(status, ""), 3000);
    } catch (e) {
      console.error(e);
      text(STATUS(), "❌ Erreur IA locale : " + (e?.message || e));
      alert("Erreur IA locale.\n• Vérifie /vendor/web-llm/web-llm.min.js et /vendor/web-llm/worker.js\n• Essaie Chrome/Edge récents\n• Ouvre via http://localhost (pas file://)\n• Désactive temporairement les bloqueurs.");
    } finally {
      btn.disabled = false;
    }
  }

  document.addEventListener('DOMContentLoaded', () => {
    const btn = BTN();
    if (btn) btn.addEventListener('click', rewriteWithLocalAI);
  });
})();
