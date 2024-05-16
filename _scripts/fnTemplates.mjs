import slugify from 'slugify';
import d from './dedent.mjs';

export const metaBlock = (post) => d`
  <div class="post-meta">
    <div class="date-published">
      Publicado el: 
      <time  datetime="${post.ISODate}" itemprop="datePublished">
        ${post.localizedDate}
      </time>
    </div>
    ${
      post.categories?.length
        ? d`
          <div class="post-cats">Archivado bajo: ${post.categories
            .map((cat) =>
              cat.sub
                ? d`
                  <a
                    href="categories/#${slugify(cat.main)}_${slugify(cat.sub)}"
                    rel="category tag"
                  >
                    ${cat.main} / ${cat.sub}
                  </a>
                `
                : d`
                  <a href="categories/#${slugify(cat.main)}" rel="category tag">
                    ${cat.main}
                  </a>
                `
            )
            .join(',\n')}</div>`
        : ''
    }
  </div>
`;

export const createExcerptEntry = (post) => d`
  <div class="excerpt">
    <div class="excerpt-title p-name" itemprop="name headline">
      <a class="home-post-link" href="${post.relURL}">${post.title}</a>
    </div>
    ${metaBlock(post)}
    <blockquote>${post.excerpt}</blockquote>
  </div>
`;
