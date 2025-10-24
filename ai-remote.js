// ai-remote.js — utilise ton Worker Cloudflare pour réécrire le texte.
(() => {
  const ENDPOINT = "https://rewrite-proxy-antenne.chantanglais.workers.dev/rewrite";

  const $ = (id) => document.getElementById(id);
  const statusEl = () => $("iaLocalStatus");
  const outEl = () => $("resultat");
  const btn = () => $("btnRewriteLocal");
  const val = (id, def="") => ($(id)?.value || def).trim();

  async function rewriteRemote() {
    const src = (outEl()?.textContent || "").trim();
    if (!src) { alert("Compile d’abord un texte (ou insère depuis Guidé/Interview)."); return; }

    const payload = {
      text: src,
      style: (val("iaStyle") || "journalistique"),
      longueur: (val("iaLongueur") || "conserve"),
      addr: (val("iaTutoiement") || "neutre"),
      temperature: 0.7,
      max_tokens: 900
    };

    btn().disabled = true;
    statusEl().textContent = "🧠 Réécriture via Worker…";

    try {
      const r = await fetch(ENDPOINT, {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify(payload)
      });
      if (!r.ok) {
        const txt = await r.text().catch(()=>r.statusText);
        throw new Error(`HTTP ${r.status}: ${txt}`);
      }
      const data = await r.json();
      const rewritten = (data?.text || "").trim();
      if (!rewritten) throw new Error("Réponse vide.");
      outEl().textContent = rewritten;
      localStorage.setItem("resultat", rewritten);
      statusEl().textContent = "✅ Réécriture terminée.";
      setTimeout(() => statusEl().textContent = "", 2500);
    } catch (e) {
      console.error(e);
      statusEl().textContent = "❌ Erreur réécriture : " + (e?.message || e);
      alert("Erreur de réécriture. Réessaie dans quelques secondes.");
    } finally {
      btn().disabled = false;
    }
  }

  document.addEventListener("DOMContentLoaded", () => {
    const b = btn();
    if (b) b.addEventListener("click", rewriteRemote);
  });
})();
