Webradio – Écriture de trame (Annexe)

Ressource annexe du projet Webradio – Écriture de trame destinée aux équipes pédagogiques (DRANE La Réunion).
👉 Production : https://webraio-ecriture-trame-e6dc63.forge.apps.education.fr/annexe.html

📚 À propos

Cette ressource propose des modèles directement exploitables pour préparer et mener une émission webradio en milieu scolaire : trames (conducteurs), checklists, rôles, timings, conseils techniques et d’animation. L’objectif : réduire le temps de préparation et sécuriser la conduite pédagogique d’une séance.

🗺️ Sommaire

🎯 Objectif

✨ Contenu & fonctionnalités

🖨️ Impression & formats

♿ Accessibilité (RGAA)

🧪 Tests rapides (checklist)

🛠️ Développement local

🚀 Déploiement (GitLab Pages)

🗂️ Arborescence (indicative)

📦 Ressources incluses

🤝 Contribution

🗓️ Versionnement

👤 Crédits

📄 Licence

🎯 Objectif

Fournir des supports et exemples concrets pour l’écriture de trames webradio (conducteurs, checklists, modèles de rubriques, conseils d’animation et de technique), prêts à être utilisés en classe ou lors d’ateliers, du collège au lycée.

✨ Contenu & fonctionnalités

Pages d’annexes structurées : modèles, fiches pratiques, rappels techniques.

Ressources imprimables et téléchargeables (PDF/HTML).

Responsive : lisible sur ordinateur, tablette et smartphone.

Bonnes pratiques : prise de son, balance des niveaux, rôles en équipe, timing.

Accessibilité : respect des recommandations RGAA dans la mesure du possible.

Usage hors-ligne (option) : impression ou export PDF des trames pour un usage sans réseau.

🖨️ Impression & formats

Les pages de trame sont pensées pour impression A4 (portrait).

Conseil : Imprimer “Ajuster à la page” pour éviter les coupures.

Export PDF recommandé depuis le navigateur (Ctrl/Cmd + P → Enregistrer en PDF).

Les zones “à compléter” sont espacées pour l’écriture manuscrite.

♿ Accessibilité (RGAA)

Principes appliqués :

Structure sémantique (h1 → h2 → h3, listes, tableaux simples).

Alt text sur images porteuses de sens ; images décoratives marquées en décoratif.

Contrastes vérifiés (niveau AA visé).

Focus visible et navigation au clavier.

Libellés explicites pour les liens et boutons.

Titres de page uniques et pertinents.

Améliorations possibles : audit RGAA complet, gestion ARIA renforcée, préférences utilisateurs (taille de police, interlignage).

🧪 Tests rapides (checklist)

 Tous les liens internes/externes fonctionnent

 Les documents téléchargeables existent et sont à jour

 Titres uniques par page et hiérarchie sémantique correcte

 Affichage mobile OK (petits écrans)

 Contraste AA (ou supérieur)

 Impression sans coupure d’éléments essentiels

 Validation HTML/CSS (W3C) sans erreurs bloquantes

🛠️ Développement local
Option 1 — Site statique “pur”

Ouvrir annexe.html dans un navigateur récent.

Option 2 — Petit serveur local

Évite certains soucis (CORS, chemins relatifs) et simule mieux la prod.

# Python 3
python3 -m http.server 5173

# Puis ouvrir : http://localhost:5173/annexe.html


(Si tu utilises Node/Vite, indique ici les commandes npm run dev.)



🗂️ Arborescence (indicative)
.
├── index.html                 # Accueil (si présent)
├── annexe.html                # Page des annexes (URL publique)
├── assets/
│   ├── css/
│   │   └── styles.css         # Styles du site
│   ├── js/
│   │   └── main.js            # Scripts éventuels
│   └── img/                   # Illustrations / pictos
├── docs/                      # PDF / modèles à télécharger (optionnel)
├── README.md
└── LICENSE

📦 Ressources incluses

Modèles de conducteur (émission, chronique, interview, micro-trottoir).

Checklists (avant émission, pendant, après).

Rôles et responsabilités (animateur·rice, technicien·ne, chroniqueur·se, régie).

Timing type (structure minute par minute).

Conseils audio (placement micro, niveaux, silence, gestion du stress).

Aides à l’évaluation (critères de qualité orale, travail d’équipe).

Adapter le vocabulaire et la granularité selon cycle/niveau (ex. barèmes simplifiés au collège).

🤝 Contribution

Créer une branche (feat/... ou fix/...).

Commits descriptifs (FR), captures d’écran si UI modifiée.

Ouvrir une Merge Request avec : objectif, changements clés, avant/après.

Vérifier la checklist Accessibilité & Impression avant review.

Convention de nommage (suggestion)

Fichiers : kebab-case (trame-interview.html, conducteur-emission.pdf)

Images : kebab-case + suffixe taille (schema-600w.png)

CSS/JS : kebab-case

🗓️ Versionnement

CHANGELOG.md (recommandé) : journaliser les évolutions notables.

Tags Git (v1.0.0, v1.1.0) pour marquer les jalons (ajout modèle, refonte styles, etc.).

👤 Crédits

DRANE La Réunion – Mission Numérique & Audiovisuel - julien.majorel@ac-reunion.fr

Référent webradio / formation : Julien MAJOREL


📄 Licence

Ce projet est distribué sous licence MIT.
Voir le fichier LICENSE pour plus de détails.