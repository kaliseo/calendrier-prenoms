# Calendrier des fêtes des prénoms

Un calendrier recensant **toutes les fêtes des prénoms** (calendrier français des
saints), à ajouter à **Google Agenda / Apple Calendar / Outlook** ou à
**télécharger au format `.ics`**.

Chaque jour de l'année correspond à un événement « journée entière » qui **se
répète chaque année** (`RRULE:FREQ=YEARLY`). Un seul fichier suffit donc pour
toutes les années à venir.

## Contenu

| Fichier | Rôle |
| --- | --- |
| `src/prenoms.js` | Données : un ou plusieurs prénoms par jour (366 jours). |
| `src/generate-ics.js` | Génère le fichier `.ics` à partir des données. |
| `public/index.html` | Page web : « Ajouter à Google Agenda » et téléchargement. |
| `public/calendrier-prenoms.ics` | Le calendrier généré (hébergé tel quel). |
| `test/validate.js` | Vérifie la validité du `.ics`. |
| `.github/workflows/deploy.yml` | Régénère et publie sur GitHub Pages. |

## Générer le calendrier

```bash
node src/generate-ics.js      # écrit public/calendrier-prenoms.ics
node test/validate.js         # vérifie le fichier
```

## Hébergement

Le dossier `public/` est un site statique. N'importe quel hébergeur convient
(GitHub Pages, Netlify, un simple serveur web…). Il faut deux URL publiques :

- la page : `.../index.html`
- le calendrier : `.../calendrier-prenoms.ics`

### Avec GitHub Pages (automatique)

Le workflow `deploy.yml` régénère le `.ics` et publie `public/` à chaque push
sur `main`. Activez ensuite Pages dans **Settings → Pages → Source : GitHub
Actions**. Le site sera servi sur :

```
https://<utilisateur>.github.io/calendrier-prenoms/
```

La page détecte automatiquement sa propre URL : les boutons « Ajouter à Google
Agenda » et « S'abonner » pointent vers le bon `.ics` sans configuration.

## Comment les utilisateurs l'ajoutent

- **Google Agenda** : bouton « Ajouter à Google Agenda » (abonnement par URL,
  synchronisé et mis à jour automatiquement).
- **Apple Calendar / Outlook** : bouton « S'abonner (webcal) » ou copier l'URL.
- **Import ponctuel** : bouton « Télécharger le calendrier (.ics) ».

## Mettre à jour les prénoms

Modifiez `src/prenoms.js`, relancez `node src/generate-ics.js`, puis committez.
Comme Google Agenda et les autres agendas se resynchronisent périodiquement
(indice `REFRESH-INTERVAL` : 7 jours), les abonnés reçoivent la mise à jour
sans rien refaire.
