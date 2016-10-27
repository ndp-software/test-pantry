import seedrandom from 'seedrandom'

export default function Pantry() {

  const pantry = function(...args) {
    let names     = args
    const howMany = typeof names[0] == 'number' ? names.shift() : 0
    names         = names.filter(n => n !== undefined)

    names.forEach(name => {
      if (typeof name == 'string' && !recipeFn(name)) {
        throw `Unknown factory/trait '${name}'`
      }
    })
    names.forEach(name => {
      if (typeof recipeFn(name) !== 'function'
          && typeof name !== 'object'
          && typeof name !== 'function') {
        throw `Factory/trait '${name}' not a function`
      }
    })

    // May need to flip the first and second parameter
    if (names.length >= 2
        && typeof names[0] == 'string'
        && typeof names[1] == 'object') {
      [names[0], names[1]] = [names[1], names[0]]
    }

    if (howMany != 0) {
      return [...Array(howMany)].map(() => cook(names))
    }
    return cook(names)
  }

  function cook(names) {
    return names.reduce((acc, name) => {
      if (typeof name == 'object')
        return Object.assign({}, acc, name)
      return recipeFn(name)(acc)
    }, {})
  }

  function isEmptyObject(o) {
    return typeof o == 'object'
           && Object.keys(o).length == 0
  }

  // Given an obj, returns an object with all of the
  // properties whose values are functions called.
  function callPropertyFns(o) {
    return Object.keys(o).reduce((result, k) => {
      const v   = o[k]
      result[k] = typeof v == 'function' ? v.call(this) : v
      return result
    }, {})
  }

  // Given a function, returns a version of that function that will
  // merges its output with the input.
  // Assumes that if the function accepts an object, it will do the merging
  // itself; therefore, just implemented for the arity of 0 case.
  function buildMergeFn(fn) {
    if (fn.length === 0) {
      return function(input) {
        const values = fn.call(this)
        if (typeof values !== 'object') {
          if (!isEmptyObject(input)) {
            throw `Unable to combine '${typeof values}' with input '${JSON.stringify(input)}'`
          }
          return values
        }
        return Object.assign({}, input, values)
      }
    }
    return fn
  }

  function buildObject(initialValues, values) {
    return Object.assign({}, initialValues, callPropertyFns.call(this, values))
  }

  function buildObjectFn(values) {
    return function(initialValues) {
      return buildObject.call(this, initialValues, values)
    }
  }

  // All storage of functions is here
  function recipeFn(name, fn) {
    if (fn) {
      pantry[`__${name}`] = fn
    }
    return pantry[`__${name}`] || (typeof name == 'function' && name)
  }

  const recipeFor = (name, ...objOrFns) => {
    let count  = 0
    let random = seedrandom(name)

    // Returns a random integer between min (included) and max (excluded)
    // Using Math.round() will give you a non-uniform distribution!
    function randomInt(a, b) {
      let [min,max] = [a, b]
      if (max == undefined) {
        [min,max] = [0, min]
      }
      min = Math.ceil(min);
      max = Math.floor(max);
      return Math.floor(random() * (max - min)) + min;
    }

    function flipCoin() {
      return random() > 0.5
    }

    function sample(...args) {
      if (args[0] && args.length == 1 && Array.isArray(args[0])) args = args[0]
      return args[randomInt(0, args.length)]
    }

    const fns = objOrFns
      .map(objOrFn => {
             const type = typeof objOrFn;
             if (type === 'object') {
               return buildObjectFn(objOrFn)
             } else if (type === 'function') {
               return buildMergeFn(objOrFn)
             }
             return recipeFn(objOrFn) // String case + catch all
           })

    recipeFn(name, (initialValues = {}) => {
      count++
      const context = {
                 count,
                 random,
                 randomInt,
                 flipCoin,
                 sample,
        rollDie: randomInt
      }
      return fns.reduce((vals, fn) => fn.call(context, vals), initialValues)
    })

    // And return a fn that calls `pantry()` with the arguments
    // Need to switch the number (if given) to be first.
    const returnFn = (...args) => {
      if (typeof args[0] == 'number') {
        const count = args.shift()
        return pantry(count, name, ...args)
      } else if (looksLikeIterator(args)) {
        // Support `Array(2).fill().map(factory)` and other iterators
        return pantry(name, args[0])
      }
      return pantry(name, ...args)
    }

    function looksLikeIterator(args) {
      return args.length == 3
             && typeof args[1] == 'number'
             && typeof args[2] == 'object'
    }

    returnFn.reset = (seed = name) => {
      count  = 0
      random = seedrandom(seed)
    }

    pantry[name] = returnFn

    return returnFn
  }

  // Public API
  pantry.recipeFor = recipeFor
  return pantry
}
