/** The props of the help article page that the specs read. */
export type ArticleProps = {
  article: { slug: string; title: string }
  next: { slug: string } | null
  navigation: { articles: { slug: string }[] }[]
  markdown: string
  sections: { id: string }[]
}
