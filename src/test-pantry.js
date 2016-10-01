import seedrandom from 'seedrandom'

export default function Pantry() {

  const pantry = function(...names) {

    const howMany = typeof names[0] == 'number' ? names.shift() : 0

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

    if (howMany == 0) {
      return cook(names)
    } else {
      return [...Array(howMany)].map(() => cook(names))
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

  const recipeFor = (name, ...objOrFns) => {
    let count  = 0
    let random = seedrandom(name)

    // Returns a random integer between min (included) and max (excluded)
    // Using Math.round() will give you a non-uniform distribution!
    function randomInt(min, max) {
      if (max == undefined) [min,max] = [0, min]
      min = Math.ceil(min);
      max = Math.floor(max);
      return Math.floor(random() * (max - min)) + min;
    }

    function flipCoin() {
      return random() > 0.5
    }

    const fns = objOrFns
      .map(objOrFn => {
             const type = typeof objOrFn;
             if (type === 'object') {
               return buildObjectFn(objOrFn)
             } else if (type === 'function') {
               return buildMergeFn(objOrFn)
             }
           })

    recipeFn(name, (initialValues = {}) => {
      count++
      const context = {
                 count,
                 random,
                 randomInt,
                 flipCoin,
        rollDie: randomInt,
      }
      return fns.reduce((vals, fn) => fn.call(context, vals), initialValues)
    })

    // And return a fn that calls `pantry()` with the right arguments
    const returnFn = pantry[name] = (...args) => {
      if (typeof args[0] == 'number') {
        const count = args.shift()
        return pantry(count, name, ...args)
      } else {
        return pantry(name, ...args)
      }
    }
    returnFn.reset = (seed = name) => {
      count  = 0
      random = seedrandom(seed)
    }
    return returnFn
  }

  function recipeFn(name, fn) {
    if (fn) {
      pantry[`__${name}`] = fn
    }
    return pantry[`__${name}`]
  }

  // Public API
  pantry.recipeFor = recipeFor
  return pantry
}
