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

  const postsArray = srcPostNames.map((srcFile) => {
    const fMat = matter.read(join(srcFolder, srcFile));
    const title = fMat.data.title;
    const slug = slugify(title, { lower: true, strict: true });
    return {
      srcFile,
      title,
      slug,
      content: fMat.content,
    };
  });

  const index = () => {
    if (postsArray.length) {
      return d`
        <ul>
          ${postsArray
            .map(
              ({ slug, title }) => d`
                <li><a href="./2000/01/01/${slug}.html">
                  ${title}
                </a></li>
              `
            )
            .join('')}
        </ul>
      `;
    }
    return '';
  };
  for (const { srcFile, title, slug, content } of postsArray) {
    const dom = htmlParse(content);
    const anchors = dom.querySelectorAll('a');
    if (anchors.length) {
      console.log('a', name, srcFile);
      console.log(anchors.map((a) => a.getAttribute('href')));
    }
    const breaks = dom.querySelectorAll('br');
    if (breaks.length) {
      console.log('br', name, srcFile, breaks.length);
    }
    const emptyPs = dom.querySelectorAll('p:empty');
    for (const p of emptyPs) {
      p.remove();
    }

    const isIndex = srcFile.includes('index');
    await writeFile(
      `${join(outDir, slug)}.html`,
      d`
      ---
      title: "${title}"
      date: "${isIndex ? '2000-01-02' : '2000-01-01'}"
      categories: ["${category}"]
      language: "es-ES"
      ---
      ${dom.outerHTML}
      ${isIndex ? index() : ''}
    `
    );
  }
};

convert('mitos', 'Rompiendo Mitos');
convert('milagros', 'Milagros Cotidianos');
