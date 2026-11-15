import router from '@adonisjs/core/services/router'

import { controllers } from '#generated/controllers'
import { middleware } from '#start/kernel'

// The slugs the help's indexes allow (`HelpCatalog`).
const SLUG = /^[a-z0-9]+(?:-[a-z0-9]+)*$/

router
  .group(() => {
    router.get('/help', [controllers.help.Help, 'index']).as('help.index')
    // Without an article, the space's opening one.
    router.get('/help/:space', [controllers.help.HelpArticles, 'show']).as('help.space')
    // Before `help.show`: `images` is not an article.
    router
      .get('/help/:space/images/:file', [controllers.help.HelpImages])
      .where('file', /^[a-z0-9][a-z0-9.-]*$/)
      .as('help.image')
    router.get('/help/:space/:article', [controllers.help.HelpArticles, 'show']).as('help.show')
    router
      .get('/help/:space/:article/content', [controllers.help.HelpArticleContent])
      .as('help.content')
  })
  .where('space', SLUG)
  .where('article', SLUG)
  .use(middleware.auth())
