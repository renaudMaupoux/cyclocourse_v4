/**
 * Parse un CSV type CycloCourse : numero;nom;club;categorie (ou virgules).
 * En-têtes acceptés (insensible à la casse) : numero/dossard, nom/name, club (optionnel), categorie/category/cat.
 */

export interface ParsedRiderRow {
  numero: number;
  nom: string;
  club: string;
  category: number;
}

function normalizeHeader(h: string): string {
  return h
    .trim()
    .toLowerCase()
    .normalize('NFD')
    .replace(/\p{M}/gu, '');
}

export function parseRidersCsv(csvText: string): ParsedRiderRow[] {
  const text = csvText.replace(/^\uFEFF/, '').trim();
  if (!text) {
    throw new Error('Fichier vide');
  }

  const lines = text.split(/\r?\n/).map((l) => l.trim()).filter(Boolean);
  if (lines.length < 2) {
    throw new Error('Le CSV doit contenir une ligne d’en-tête et au moins une ligne de données');
  }

  const headerLine = lines[0];
  const sep = headerLine.includes(';') ? ';' : ',';
  const headers = headerLine.split(sep).map(normalizeHeader);

  const idxNum = headers.findIndex((h) => h === 'numero' || h === 'dossard' || h === 'n°' || h === 'no');
  const idxNom = headers.findIndex((h) => h === 'nom' || h === 'name' || h === 'coureur');
  const idxClub = headers.findIndex((h) => h === 'club' || h === 'equipe' || h === 'team');
  const idxCat = headers.findIndex(
    (h) => h === 'categorie' || h === 'category' || h === 'cat' || h === 'categ'
  );

  if (idxNum < 0 || idxNom < 0 || idxCat < 0) {
    throw new Error('Colonnes requises : numero (ou dossard), nom, categorie (ou category)');
  }

  const out: ParsedRiderRow[] = [];

  for (let i = 1; i < lines.length; i++) {
    const line = lines[i];
    const parts = line.split(sep).map((p) => p.trim());
    if (parts.length < Math.max(idxNum, idxNom, idxCat) + 1) {
      continue;
    }

    const numero = parseInt(parts[idxNum], 10);
    const nom = (parts[idxNom] ?? '').trim();
    const club = idxClub >= 0 ? (parts[idxClub] ?? '').trim() : '';
    const category = parseInt(parts[idxCat], 10);

    if (Number.isNaN(numero) || numero < 1 || numero > 1000) {
      continue;
    }
    if (!nom) {
      continue;
    }
    if (Number.isNaN(category) || category < 1 || category > 6) {
      continue;
    }

    out.push({ numero, nom, club, category });
  }

  if (out.length === 0) {
    throw new Error('Aucune ligne valide (dossard 1–1000, nom, catégorie 1–6)');
  }

  out.sort((a, b) => a.numero - b.numero);
  return out;
}
