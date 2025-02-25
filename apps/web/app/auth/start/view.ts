import edge from 'edge.js'

const BASE_URL = new URL('../', import.meta.url)

edge.mount('auth', new URL('ui', BASE_URL))
