export default function Pantry() {

  const pantry = function(...names) {

    let count = 0
    if (typeof names[0] == 'number') {
      count = names[0]
      names.shift()
    }

    names.forEach(name => {
      if (!recipeFn(name) && typeof name !== 'object') {
        throw(`Unknown factory/trait '${name}'`)
      }
    })
    names.forEach(name => {
      if (typeof recipeFn(name) !== 'function' && typeof name !== 'object') {
        throw(`Factory/trait '${name}' not a function`)
      }
    })

    if (count == 0) {
      return cook(names)
    } else {
      return [...Array(count)].map(() => cook(names))
    }
  }

  function cook(names) {
    return names.reduce((acc, name) => {
      return typeof name == 'object'
        ? Object.assign({}, acc, name)
        : buildMergeFn(recipeFn(name))(acc)
    }, {})
  }

  function isEmptyObject(o) {
    return typeof(o) == 'object'
      && Object.keys(o).length == 0
  }

  function buildMergeFn(fn) {
    if (fn.length === 0) {
      return function(input) {
        const values = fn.call(this)
        if (typeof(values) !== 'object') {
          if (!isEmptyObject(input)) {
            throw `Unable to combine '${typeof(values)}' with input '${JSON.stringify(input)}'`
          }
          return values
        }
        return Object.assign({}, input, values)
      }
    } else {
      return fn
    }
  }

  function callPropertyFns(o) {
    return Object.keys(o).reduce((result, k) => {
      const v   = o[k]
      result[k] = (typeof(v) == 'function') ? v.call(this) : v
      //console.log(v, typeof v, v.toString(), result[k])
      return result
    }, {})
  }

  function buildObject(initialValues, values) {
    return Object.assign({}, initialValues, callPropertyFns.call(this, values))
  }

  function buildObjectFn(values) {
    return function(initialValues) {
      return buildObject.call(this, initialValues, values)
    }
  }

  function buildFn(valOrFn) {
    return (typeof valOrFn == 'function' ?
      valOrFn :
      buildObjectFn(valOrFn))
  }

  pantry.recipeFor = (name, ...objOrFns) => {
    let count = 0
    const fns = objOrFns
      .map(objOrFn => {
             const type = typeof objOrFn;
             //console.log(type, objOrFn)
             if (type === 'object') {
               return buildObjectFn(objOrFn)
             } else if (type === 'function') {
               return buildMergeFn(objOrFn)
             }
           })

    recipeFn(name, (initialValues = {}) => {
      count++
      const context = {count}
      return fns.reduce((vals, fn) => fn.call(context, vals), initialValues)
    })

    // And return a fn that calls `pantry()` with the right arguments
    return pantry[name] = (...args) => {
      if (typeof args[0] == 'number') {
        const count = args.shift()
        return pantry(count, name, ...args)
      } else {
        return pantry(name, ...args)
      }
    }
  }

  function recipeFn(name, fn) {
    if (fn) {
      pantry[`__${name}`] = fn
    }
    return pantry[`__${name}`]
  }

  return pantry
}
