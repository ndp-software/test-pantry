export function looksLikeIterator(args) {
  return args.length == 3
         && typeof args[1] == 'number'
         && typeof args[2] == 'object'
}

export function isEmptyObject(o) {
  return typeof o == 'object'
         && Object.keys(o).length == 0
}

