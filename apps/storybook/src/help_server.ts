import { http, HttpResponse } from "msw";

import type { Data } from "@generated/data";
import { markdownSections } from "@web/app/core/utils/markdown_sections";
import type { HelpArticleRead } from "@web/app/help/queries/read_help_article";

type Locale = "en" | "pt";
type Text = Record<Locale, string>;
type HelpIndex = {
  space: { slug: string; title: Text; summary: Text; order: number };
  categories: { slug: string; title: Text; order: number }[];
  articles: {
    slug: string;
    title: Text;
    summary: Text;
    category: string;
    order: number;
    file: string;
    updatedAt: string;
  }[];
};

// The app's real help, read by Vite: the board shows what the repository holds.
const INDEXES = import.meta.glob<HelpIndex>(
  "../../web/app/*/help/*/index.json",
  {
    import: "default",
    eager: true,
  },
);
const MARKDOWN = import.meta.glob<string>("../../web/app/*/help/*/*/*.md", {
  query: "?raw",
  import: "default",
  eager: true,
});
const IMAGES = import.meta.glob<string>("../../web/app/*/help/*/images/*", {
  query: "?url",
  import: "default",
  eager: true,
});

const spaces = Object.entries(INDEXES)
  .map(([path, index]) => ({
    dir: path.replace(/\/index\.json$/, ""),
    ...index,
  }))
  .sort((a, b) => a.space.order - b.space.order);

function spaceOf(slug: string) {
  const space = spaces.find((candidate) => candidate.space.slug === slug);
  if (!space) throw new Error(`No help space "${slug}"`);
  return space;
}

/** The space's articles a reader of `readable` ("<space>/<article>") may read, in reading order. */
function readingOrder(slug: string, readable: string[]) {
  const space = spaceOf(slug);
  return [...space.categories]
    .sort((a, b) => a.order - b.order)
    .map((category) => ({
      category,
      articles: space.articles
        .filter((article) => article.category === category.slug)
        .filter((article) => readable.includes(`${slug}/${article.slug}`))
        .sort((a, b) => a.order - b.order),
    }))
    .filter((group) => group.articles.length > 0);
}

/** The spaces of the help index, as `help.index` sends them. */
export function helpSpaces(
  readable: string[],
  locale: Locale,
): Data.Help.HelpSpace[] {
  return spaces
    .map(({ space }) => ({
      slug: space.slug,
      title: space.title[locale],
      summary: space.summary[locale],
      articles: readingOrder(space.slug, readable).flatMap((group) =>
        group.articles.map((article) => ({
          slug: article.slug,
          title: article.title[locale],
        })),
      ),
    }))
    .filter((space) => space.articles.length > 0);
}

/** An article as `help.show` and `help.content` send it. */
export function helpArticle(
  slug: string,
  articleSlug: string,
  readable: string[],
  locale: Locale,
): HelpArticleRead {
  const space = spaceOf(slug);
  const order = readingOrder(slug, readable).flatMap((group) => group.articles);
  const index = order.findIndex((article) => article.slug === articleSlug);
  const article = order[index];
  if (!article)
    throw new Error(`No readable help article "${slug}/${articleSlug}"`);
  const markdown = MARKDOWN[`${space.dir}/${locale}/${article.file}`] ?? "";
  const link = (other?: (typeof order)[number]) =>
    other ? { slug: other.slug, title: other.title[locale] } : null;
  return {
    space: { slug, title: space.space.title[locale] },
    article: {
      slug: article.slug,
      title: article.title[locale],
      summary: article.summary[locale],
      updatedAt: article.updatedAt,
    },
    markdown,
    sections: markdownSections(markdown),
    previous: link(order[index - 1]),
    next: link(order[index + 1]),
    imagesUrl: `/help/${slug}/images`,
  };
}

/** The space's navigation, as `help.show` sends it beside the article. */
export function helpNavigation(
  slug: string,
  readable: string[],
  locale: Locale,
) {
  return readingOrder(slug, readable).map(({ category, articles }) => ({
    slug: category.slug,
    title: category.title[locale],
    articles: articles.map((article) => ({
      slug: article.slug,
      title: article.title[locale],
    })),
  }));
}

/**
 * Answers a screen's drawer (`help.content`) and the articles' images, in the
 * language the toolbar picked (the preview writes it on `<html lang>`).
 */
export function helpRoutes(readable: string[]) {
  return [
    http.get("/help/:space/:article/content", ({ params }) => {
      const locale = document.documentElement.lang === "pt" ? "pt" : "en";
      return HttpResponse.json(
        helpArticle(
          String(params.space),
          String(params.article),
          readable,
          locale,
        ),
      );
    }),
    http.get("/help/:space/images/:file", ({ params }) => {
      const space = spaceOf(String(params.space));
      const url = IMAGES[`${space.dir}/images/${String(params.file)}`];
      return url
        ? new Response(null, { status: 302, headers: { Location: url } })
        : new Response(null, { status: 404 });
    }),
  ];
}
