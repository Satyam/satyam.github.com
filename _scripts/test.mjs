#!/usr/bin/env zx
import { parse } from 'node-html-parser';

const srcSite = '..';
const destSite = '../../satyam.com';

const decoderTable = {
  '&aacute;': 'á',
  '&eacute;': 'é',
  '&iacute;': 'í',
  '&oacute;': 'ó',
  '&uacute;': 'ú',
  '&#133;': ' ',
  '&#x26;': '&',
  '&#x3C;': '&lt;',
  '&quot;': '"',
  '&ntilde;': 'ñ',
  '&iexcl;': '¡',
  '&iquest;': '¿',
};
const entRex = /&[^;]+;/g;
const entityDecoder = (src) =>
  src.replaceAll(entRex, (m) => {
    if (decoderTable[m]) return decoderTable[m];
    // console.error('unencoded', m);
    return m;
  });
/*
// Mitos:
{
  const pages = await glob(path.join(srcSite, 'mitos', '*.htm*'));
  const mitosSite = path.join(destSite, '_mitos');
  fs.ensureDir(mitosSite);
  fs.emptyDir(mitosSite);

  for (const page of pages) {
    const root = parse(entityDecoder(await fs.readFile(page, 'utf8')));
    const title =
      root.querySelector('title')?.innerHTML ??
      root.querySelector('h1')?.innerHTML;

    root.querySelector('h1').remove();
    const body = root.querySelector('body')?.innerHTML;
    console.log(page);
    await fs.writeFile(
      path.join(mitosSite, path.basename(page)),
      `---
permalink: /_mitos/${path.basename(page)}
layout: page
title: ${title}
---
${body}
`
    );
  }
}
// Milagros:
{
  const pages = await glob(path.join(srcSite, 'milagros', '*.htm*'));
  const milagrosSite = path.join(destSite, '_milagros');
  fs.ensureDir(milagrosSite);
  fs.emptyDir(milagrosSite);

  for (const page of pages) {
    const root = parse(entityDecoder(await fs.readFile(page, 'utf8')));
    const title =
      root.querySelector('title')?.innerHTML ??
      root.querySelector('h1')?.innerHTML;

    root.querySelector('h1').remove();
    const body = root.querySelector('body');
    const allTds = body.querySelectorAll('td');
    const lastTd = allTds[allTds.length - 1]?.innerHTML;
    console.log(page);
    await fs.writeFile(
      path.join(milagrosSite, path.basename(page)),
      `---
permalink: /_milagros/${path.basename(page)}
layout: page
title: ${title}
---
${lastTd}
`
    );
  }
}
*/
// posts
{
  const imgFiles = [];
  const postsSite = path.join(destSite, '_posts');
  fs.ensureDir(postsSite);
  fs.emptyDir(postsSite);
  const globFilenames = await glob(
    path.join(srcSite, 'blog/20*/*/*/*/index.html')
  );
  const blogInfoRex =
    /blog\/(?<year>\d+)\/(?<month>\d+)\/(?<day>\d+)\/(?<slug>[^\/]+)/;
  for (const name of globFilenames) {
    // console.log(name);
    const m = blogInfoRex.exec(name);
    // if (m) console.log(m.groups);
    if (!m) {
      console.error('no match', name);
      continue;
    }
    const { year, month, day, slug } = m.groups;
    const filename = `${year}-${month}-${day}-${slug}.html`;
    console.log(filename);
    const root = parse(await fs.readFile(name, 'utf8'));
    const $$content = root.querySelectorAll('.post-content');
    if ($$content.length !== 1) {
      console.error('not just one content', $$content.length, name);
      console.log(root.outerHTML);
    } else {
      const $content = $$content[0];
      $content.querySelector('div.post-info').remove();
      $content.querySelector('div.post-footer').remove();

      for (const $img of $content.querySelectorAll(
        'img[src^="/blog/wp-content/"]'
      )) {
        const $anchor = $img.closest('a[href^="/blog/wp-content/"]');
        const $caption = $img.closest('div.wp-caption');
        // console.log('------------------');
        // if ($caption) {
        //   console.log('has caption', $anchor ? 'has anchor' : 'no anchor');
        //   console.log($caption.outerHTML);
        // } else if ($anchor) {
        //   console.log('has anchor');
        //   console.log($anchor.outerHTML);
        // } else {
        //   console.log('only image');
        //   console.log($img.outerHTML);
        // }
        if (!$anchor) {
          console.error('no anchor', $img.outerHTML);
          continue;
        }
        const caption =
          $caption?.querySelector('p.wp-caption-text')?.textContent ??
          $img.getAttribute('alt');
        const srcHref = $anchor.getAttribute('href');
        const destHref = path.join('/assets/img', path.basename(srcHref));
        const imgFile = path.basename(srcHref).toLowerCase();
        if (imgFiles.includes(imgFile)) {
          console.error('nombre duplicado', srcHref);
        } else {
          imgFiles.push(imgFile);
        }

        const title = $img.getAttribute('title');
        fs.copySync(path.join(srcSite, srcHref), path.join(destSite, destHref));
        ($caption ?? $anchor).replaceWith(`
        <figure>
          <img 
            src="${destHref}" 
            alt="${caption}" 
            ${title ? `title="${title}"` : ''}
          />
          <figcaption>${caption}</figcaption>
        </figure>`);
      }
      //TODO falta convertir enlaces entre articulos a nuevo formato
      for (const $intralink of $content.querySelectorAll('a[href^="/blog"]')) {
        // console.log('Internal reference', $intralink.outerHTML);
        $intralink.setAttribute(
          'href',
          $intralink.getAttribute('href').replace(/\/$/, '.html')
        );
      }
      for (const $empty of $content.querySelectorAll('p:empty')) {
        $empty.remove();
      }
      for (const $more of $content.querySelectorAll('span[id^="more"]')) {
        $more.replaceWith('<span class="more"></span>');
      }
      if ($content.querySelectorAll('span.more') == 0) {
        console.log('first', $content.outerHTML.substring(0, 80));
        $content.childNodes.find(($n) => {
          if ($n.tagName) {
            $n.insertAdjacentHTML('afterend', '<span class="more"></span>');
            return true;
          }
        });
      }

      const content = entityDecoder($content.innerHTML);
      const $$postInfo = root.querySelectorAll('.post-info');
      $$postInfo.forEach(async ($postInfo) => {
        const $postTitle = $postInfo.querySelector('.post-title');
        if ($postTitle) {
          const title = entityDecoder($postTitle.textContent)
            .trim()
            .replaceAll(/\s+/g, ' ');
          const category = entityDecoder(
            $postInfo.querySelector('a[rel~="category"]').textContent
          )
            .trim()
            .replaceAll(/\s+/g, ' ');
          // console.log(title, category, slug);
          await fs.writeFile(
            path.join(postsSite, filename),
            `---
title:  "${title}"
date:   ${year}-${month}-${day}
category: "${category}"
---
${content}
    `
          );
        }
      });
    }
  }
}
