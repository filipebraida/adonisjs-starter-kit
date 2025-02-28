import edge from 'edge.js'

const BASE_URL = new URL('../', import.meta.url)

edge.mount('users', new URL('ui', BASE_URL))
