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
      continue;
    }
    // $content is the actual post content, one and only one per post.
    const $content = $$content[0];

    // remove pointless sections
    $content.querySelector('div.post-info').remove();
    $content.querySelector('div.post-footer').remove();

    // Images are inserted as thumbnails surrounded by an anchor pointed to the full image.
    // Sometimes they have a div with the caption, sometimes it is within the image.
    // All images point to the same folder.
    for (const $img of $content.querySelectorAll(
      'img[src^="/blog/wp-content/"]'
    )) {
      // Anchor pointing to the full-size image.
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
        // actually, didn't find any img without anchor
      }

      // Pick the caption from either of the two alternatives
      const caption =
        $caption?.querySelector('p.wp-caption-text')?.textContent ??
        $img.getAttribute('alt');

      const title = $img.getAttribute('title');

      // Take the reference to the full image, no thumbnail
      // These days there is enough bandwidth anyway
      const srcHref = $anchor.getAttribute('href');
      const destHref = path.join('/assets/img', path.basename(srcHref));

      // Since I'm going to copy them all to the same folder
      // I want to be sure not to have duplicate names.
      const imgFile = path.basename(srcHref).toLowerCase();
      if (imgFiles.includes(imgFile)) {
        console.error('nombre duplicado', srcHref);
        // didn't find duplicates so I didn't bother to add code to
        // change the name to something unique
      } else {
        imgFiles.push(imgFile);
      }

      // now do copy the image
      fs.copySync(path.join(srcSite, srcHref), path.join(destSite, destHref));

      // Now replace the div enclosing the image and the caption
      // or the image (both enclosed in an anchor)
      // with a figure tag
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

    // Posts were stored as an index.html file in a folder named for the post
    // Need to change that to an html file named for the post.
    for (const $intralink of $content.querySelectorAll('a[href^="/blog"]')) {
      // console.log('Internal reference', $intralink.outerHTML);
      $intralink.setAttribute(
        'href',
        $intralink.getAttribute('href').replace(/\/$/, '.html')
      );
    }

    // Remove spurious empty paragraphs (usually at the end)
    for (const $empty of $content.querySelectorAll('p:empty')) {
      $empty.remove();
    }

    const excerptSeparator = '<span class="more"></span>';
    // change the tag signalling the end of the excerpt for the new one.
    for (const $more of $content.querySelectorAll('span[id^="more"]')) {
      $more.replaceWith(excerptSeparator);
    }

    // Check if the article does indeed have an exceprt separator
    // and if not insert one after the first element, usually a paragraph
    if ($content.querySelectorAll('span.more') == 0) {
      $content.childNodes.find(($n) => {
        if ($n.tagName) {
          $n.insertAdjacentHTML('afterend', excerptSeparator);
          return true;
        }
      });
    }

    // Now we are puting together the strings we need to
    // make the actual new blog post.

    // Now that we cleaned it all, get the remaining content
    // and decode the entities that are not needed with utf-8 encoding.
    const content = entityDecoder($content.innerHTML);

    // Get the basic page info from the post info section
    const $$postInfo = root.querySelectorAll('.post-info');
    if ($$postInfo.length !== 1) {
      console.error('not just one post-info section', $$postInfo.length);
      continue;
    }
    const $postInfo = $$postInfo[0];
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

      // Finally, write it!
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
  }
}
