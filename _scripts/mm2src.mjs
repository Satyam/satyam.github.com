import { writeFile } from 'node:fs/promises';
import { join } from 'node:path';
import { globby } from 'globby';
import { ensureDir } from 'fs-extra/esm';
import { ROOT, SRC_DIRS } from './constants.mjs';
import d from './dedent.mjs';

import { parse as htmlParse } from 'node-html-parser';
import matter from 'gray-matter';
import slugify from 'slugify';

const convert = async (name, category) => {
  const srcFolder = join(ROOT, name);
  const srcPostNames = await globby(['**.htm*', '**.md'], {
    cwd: srcFolder,
    deep: 5,
  });
  const outDir = join(SRC_DIRS.srcPosts, name);
  await ensureDir(outDir);
  //   ---
  // title: "El entierro de la sardina"
  // date: "2003-03-05"
  // categories: ["Viajes/Tres Cantos"]
  // language: "es-ES"
  // ---
  console.log(name, category);
  for (const srcFile of srcPostNames) {
    const fMat = matter.read(join(srcFolder, srcFile));
    const title = fMat.data.title;
    const slug = slugify(title, { lower: true, strict: true });
    const content = htmlParse(fMat.content);
    const anchors = content.querySelectorAll('a');
    if (anchors.length) {
      console.log('a', name, srcFile);
      console.log(anchors.map((a) => a.getAttribute('href')));
    }
    const breaks = content.querySelectorAll('br');
    if (breaks.length) {
      console.log('br', name, srcFile, breaks.length);
    }
    const emptyPs = content.querySelectorAll('p:empty');
    for (const p of emptyPs) {
      p.remove();
    }

    await writeFile(
      `${join(outDir, slug)}.html`,
      d`
      ---
      title: "${title}"
      date: "2000-01-01"
      categories: ["${category}"]
      language: "es-ES"
      ---
      ${content.outerHTML}
    `
    );
  }
};

convert('mitos', 'Rompiendo Mitos');
convert('milagros', 'Milagros Cotidianos');
