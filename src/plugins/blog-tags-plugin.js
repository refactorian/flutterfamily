const fs = require('fs');
const path = require('path');
const matter = require('gray-matter');
const yaml = require('js-yaml');

module.exports = function blogTagsPlugin(context, options) {
  const blogDir = path.resolve(context.siteDir, 'blog');

  function getFiles(dir) {
    let results = [];
    if (!fs.existsSync(dir)) return results;
    const list = fs.readdirSync(dir);
    for (const file of list) {
      const fullPath = path.join(dir, file);
      const stat = fs.statSync(fullPath);
      if (stat && stat.isDirectory()) {
        results = results.concat(getFiles(fullPath));
      } else if (file.endsWith('.md') || file.endsWith('.mdx')) {
        results.push(fullPath);
      }
    }
    return results;
  }

  function getTagsData() {
    let tagsYml = {};
    const tagsYmlPath = path.join(blogDir, 'tags.yml');
    if (fs.existsSync(tagsYmlPath)) {
      try {
        tagsYml = yaml.load(fs.readFileSync(tagsYmlPath, 'utf8')) || {};
      } catch (err) {
        console.error('Error parsing tags.yml:', err);
      }
    }

    const files = getFiles(blogDir);
    const tagCounts = {};
    const tagToPermalinks = {};
    let totalPosts = 0;

    for (const file of files) {
      try {
        const content = fs.readFileSync(file, 'utf8');
        const parsed = matter(content);
        if (parsed.data.draft === true || parsed.data.unlisted === true) {
          continue;
        }
        totalPosts++;
        const slug = parsed.data.slug;
        const postPermalink = slug
          ? slug.startsWith('/')
            ? `/blog${slug}`
            : `/blog/${slug}`
          : undefined;

        const tags = parsed.data.tags;
        if (Array.isArray(tags)) {
          for (const t of tags) {
            const tagKey = typeof t === 'string' ? t : (t.label || t.key || t.permalink);
            if (tagKey) {
              tagCounts[tagKey] = (tagCounts[tagKey] || 0) + 1;
              if (postPermalink) {
                if (!tagToPermalinks[tagKey]) tagToPermalinks[tagKey] = [];
                tagToPermalinks[tagKey].push(postPermalink);

                const ymlDef = tagsYml[tagKey] || {};
                const permalinkSuffix = ymlDef.permalink
                  ? ymlDef.permalink.replace(/^\//, '')
                  : tagKey;
                const fullTagPermalink = `/blog/tags/${permalinkSuffix}`;
                if (!tagToPermalinks[fullTagPermalink]) tagToPermalinks[fullTagPermalink] = [];
                tagToPermalinks[fullTagPermalink].push(postPermalink);
              }
            }
          }
        }
      } catch (err) {
        console.error(`Error reading frontmatter from ${file}:`, err);
      }
    }

    const tagList = Object.entries(tagCounts).map(([key, count]) => {
      const ymlDef = tagsYml[key] || {};
      const label = ymlDef.label || key.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
      const permalinkSuffix = ymlDef.permalink ? ymlDef.permalink.replace(/^\//, '') : key;
      const permalink = `/blog/tags/${permalinkSuffix}`;
      return {
        key,
        label,
        permalink,
        count,
        description: ymlDef.description || '',
      };
    });

    tagList.sort((a, b) => b.count - a.count || a.label.localeCompare(b.label));

    return {
      totalPosts,
      tags: tagList,
      tagToPermalinks,
    };
  }

  return {
    name: 'blog-tags-plugin',

    getPathsToWatch() {
      return [
        path.join(blogDir, '**/*.{md,mdx}'),
        path.join(blogDir, 'tags.yml'),
      ];
    },

    async loadContent() {
      return getTagsData();
    },

    async contentLoaded({ content, actions }) {
      actions.setGlobalData(content);

      // Also persist to src/data/blogTagsData.json for zero-latency direct import
      const dataDir = path.resolve(context.siteDir, 'src/data');
      if (!fs.existsSync(dataDir)) {
        fs.mkdirSync(dataDir, { recursive: true });
      }
      fs.writeFileSync(
        path.join(dataDir, 'blogTagsData.json'),
        JSON.stringify(content, null, 2),
        'utf8'
      );
    },
  };
};
