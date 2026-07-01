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
| `index.html` | Page web : « Ajouter à Google Agenda » et téléchargement. |
| `calendrier-prenoms.ics` | Le calendrier généré (servi tel quel). |
| `test/validate.js` | Vérifie la validité du `.ics`. |
| `.github/workflows/deploy.yml` | Régénère et vérifie le `.ics` à chaque push. |

## Générer le calendrier

```bash
node src/generate-ics.js      # écrit calendrier-prenoms.ics (à la racine)
node test/validate.js         # vérifie le fichier
```

## Hébergement

Le site est statique (fichiers à la racine du dépôt). N'importe quel hébergeur
convient (GitHub Pages, Netlify, un simple serveur web…). Il faut deux URL
publiques :

- la page : `.../index.html`
- le calendrier : `.../calendrier-prenoms.ics`

### Avec GitHub Pages

Ce dépôt est configuré en **Settings → Pages → Source : « Deploy from a branch »
→ `main` / `(root)`**. GitHub sert alors directement les fichiers de la racine
sur :

```
https://<utilisateur>.github.io/calendrier-prenoms/
```

La page détecte automatiquement sa propre URL : les boutons « Ajouter à Google
Agenda » et « S'abonner » pointent vers le bon `.ics` sans configuration.

Le workflow `deploy.yml` ne déploie pas (c'est GitHub Pages qui s'en charge) : il
régénère le `.ics` à chaque push et échoue si le fichier commité n'est plus à
jour par rapport aux données.

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
