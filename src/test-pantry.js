export default function Pantry() {

  function buildMergeFn (fn) {
    if (fn.arity === 0) {
      return function (initialValues) {
        return Object.assign({}, initialValues, fn())
      }
    } else {
      return fn
    }
  }

  const pantry = function (...names) {
    names.forEach(name => {
      if (!pantry[name] && typeof name !== 'object') {
        throw(`Unknown factory/trait '${name}'`)
      }
    })
    names.forEach(name => {
      if (typeof pantry[name] !== 'function' && typeof name !== 'object') {
        throw(`Factory/trait '${name}' not a function`)
      }
    })
    return names.reduce((acc, name) => {
      return typeof name == 'object'
        ? Object.assign({}, acc, name)
        : buildMergeFn(pantry[name])(acc)
    }, {})
  }

  function buildObject (initialValues, values) {
    const result = initialValues
    Object.keys(values).forEach(k => {
      const v   = values[k]
      result[k] = (typeof(v) == 'function') ? v.apply(this) : v
    })
    return result
  }

  function buildObjectFn (values) {
    return function (initialValues) {
      return buildObject.call(this, initialValues, values)
    }
  }

  function buildFn (valOrFn) {
    return (typeof valOrFn == 'function' ?
            valOrFn :
            buildObjectFn(valOrFn))
  }

  pantry.createRecipe = (name, valOrFn, afterCreateFn) => {
    let count = 0
    const f   = (initialValues = {}) => {
      count++
      const context = { count },
            fn      = buildFn(valOrFn).bind(context),
            result  = fn(initialValues)
      return afterCreateFn ? afterCreateFn.call(context, result) : result
    }
    f.arity   = typeof(valOrFn) == 'function' && valOrFn.length
    return pantry[name] = f
  }

  return pantry
}
