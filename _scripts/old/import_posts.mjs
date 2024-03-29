#!/usr/bin/env zx
import matter from 'gray-matter';

const inputSite = '../../satyam.com';
const SRC_DIRS = {
  POSTS: path.join(inputSite, '_posts'),
  IMGS: path.join(inputSite, 'assets', 'img'),
};
const DEST_DIRS = {
  POSTS: path.join(__dirname, 'posts'),
  IMGS: path.join(__dirname, 'imgs'),
};

// Copy Images

await fs.ensureDir(DEST_DIRS.IMGS);
await fs.copy(SRC_DIRS.IMGS, DEST_DIRS.IMGS);

// Copy and massage files

const catTitles = {
  viajes: 'Viajes',
  tecnologia: 'Tecnología',
  general: 'General',
  urbanismo: 'Urbanismo',
  historia: 'Historia',
  mitos: 'Mitos',
  papel: 'Papel',
  futuro: 'Futuro',
  'the-gods-that-werent': "The Gods that Weren't",
  egipto: 'Egipto',
  francia: 'Francia',
  grecia: 'Grecia',
  italia: 'Italia',
  sitges: 'Sitges',
  'tres-cantos': 'Tres Cantos',
  turquia: 'Turquía',
  'mega-ingenieria': 'Mega-Ingeniería',
  programacion: 'Programación',
};

// From: https://github.com/wooorm/franc/blob/main/packages/franc-min/data.js
const esRx = /\sde|de\s|os\s|\sla|\sa\s|la\s|\sy\s/gi;
const enRx = /the|\sth|\san|he\s|nd\s/gi;

await fs.ensureDir(DEST_DIRS.POSTS);
const postNames = await glob(path.join(SRC_DIRS.POSTS, '*.htm*'));
for (const postName of postNames) {
  const baseName = path.basename(postName);
  const { data, content } = matter.read(postName);

  // Expand categories to full names using `catTables`
  const cats = data.categories.map((cat) => {
    const [main, sub] = cat.split('/');
    return catTitles[main] + (sub ? '/' + catTitles[sub] : '');
  });

  // Check for English or Spanish

  const esMatch = content.match(esRx)?.length ?? 0;
  const enMatch = content.match(enRx)?.length ?? 0;
  const lang = esMatch > enMatch ? 'es-ES' : 'en-US';

  const ymd = baseName.split('-').slice(0, 3);

  await fs.writeFile(
    path.join(DEST_DIRS.POSTS, baseName),
    `---
title: "${data.title}"
date: "${ymd.join('-')}"
categories: ${JSON.stringify(cats)}
language: "${lang}"
---
${content}
`
  );
}
