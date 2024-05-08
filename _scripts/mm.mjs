import { open, readFile, writeFile } from 'node:fs/promises';
import { join, extname } from 'node:path';
import { ensureDir, pathExists, copy } from 'fs-extra/esm';
import { globby } from 'globby';
import matter from 'gray-matter';
import slugify from 'slugify';

import { metaBlock, createExcerptEntry } from './fnTemplates.mjs';

import { ROOT, ASSETS } from './constants.mjs';
import {
  site,
  prepareTemplate,
  resolveVars,
  copyStyles,
  copyJs,
} from './utils.mjs';

const meses = [
  '??',
  'Enero',
  'Febrero',
  'Marzo',
  'Abril',
  'Mayo',
  'Junio',
  'Julio',
  'Agosto',
  'Setiembre',
  'Octubre',
  'Noviembre',
  'Diciembre',
];
const postTpl = await prepareTemplate('post', {
  ...site,
  root: '/_mitos',
});

const formatDMY = (day, month, year) =>
  `${parseInt(day, 10)} / ${meses[parseInt(month, 10)]} / ${year}`;

const mimi = async (name) => {
  const inFolder = join(ROOT, name);
  const outFolder = join(ROOT, 'docs', name);
  await ensureDir(outFolder);

  const srcPostNames = await globby(['**.htm*', '**.md'], {
    cwd: inFolder,
    deep: 5,
  });
  const pagesArray = srcPostNames
    .map((srcFileName) => {
      const fMat = matter.read(join(inFolder, srcFileName));
      const title = fMat.data.title;
      if (!title) {
        throw new Error(`Missing title: ${srcFileName}`);
      }
      const slug = slugify(fMat.data.title, { lower: true, strict: true });
      return {
        ...fMat.data,
        slug,
        // srcFileName,
        content: fMat.content,
      };
    })
    .sort((a, b) => {
      // sorting by title
      if (a.title < b.title) return -1;
      if (a.title > b.title) return 1;
      return 0;
    });
  for (const {
    date = '1/1/2000',
    locale = 'es_ES',
    slug,
    permalink, // to ignore
    ...rest
  } of pagesArray) {
    const [day, month, year] = date.split('/').map((p) => p.padStart(2, '0'));
    const result = {
      ...rest,
      year,
      month,
      day,
      locale,
      ISODate: `${year}-${month}-${day}T00:00:00+01:00`,
      localizedDate: formatDMY(day, month, year),
      relURL: `${slug}.html`,
      fullURL: `${site.url}/${name}/${slug}.html`,
    };
    result.metaBlock = metaBlock(result);
    const out = resolveVars(postTpl, 'post', result);
    await writeFile(join(outFolder, `${slug}.html`), out);
  }
  // await copyStyles(join(outFolder, ASSETS, 'css'));
};

await mimi('_milagros');
await mimi('_mitos');
