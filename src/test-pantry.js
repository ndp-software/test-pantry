import newRecipeContext from './recipe-context.js'
import { looksLikeIterator, isEmptyObject } from './util'

export default function Pantry() {

  const pantry = function(...args) {
    let components = args
    const howMany  = typeof components[0] == 'number' ? components.shift() : 0
    components     = components.filter(n => n !== undefined)

    components.forEach(component => {
      if (typeof component == 'string' && !recipeFn(component)) {
        throw `Unknown factory/trait '${component}'`
      }
    })
    components.forEach(component => {
      if (typeof recipeFn(component) !== 'function'
          && typeof component !== 'object'
          && typeof component !== 'function') {
        throw `Factory/trait '${component}' not a function`
      }
    })

    const ctx = recipeCtx(components[0])
    if (!ctx) {
      throw `Unknown context '${components[0]}': unsupported usage`
    }

    // May need to flip the first and second parameter?
    if (components.length >= 2
        && typeof components[0] == 'string'
        && typeof components[1] == 'object') {
      [components[0], components[1]] = [components[1], components[0]]
    }

    if (howMany != 0) {
      return [...Array(howMany)].map(() => cook.call(ctx, components))
    }
    return cook.call(ctx, components)
  }

  function cook(components) {
    return components.reduce((acc, component) => {
      if (typeof component == 'object') {
        return Object.assign({}, acc, component)
      }
      return recipeFn(component).call(this, acc)
    }, {})
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

  function coerceToFn(objOrFn) {
    switch (typeof objOrFn) {
      case 'object':
        return buildObjectFn(objOrFn)
      case 'function':
        return buildMergeFn(objOrFn)
      case 'number':
        return () => objOrFn
      case 'string':
      {
        if (recipeFn(objOrFn)) {
          return recipeFn(objOrFn)
        }
        throw `Bad factory component. '${objOrFn}' is not a known factory name. If you want to return a string, use "()=>'${objOrFn}'"`
      }
      default:
        throw `Unknown factory component of type ${typeof objOrFn}: ${objOrFn}`
    }
  }

  // All storage of functions is here
  function recipeFn(name, fn) {
    if (fn) {
      pantry[`__${name}`] = fn
    }
    return pantry[`__${name}`] || typeof name == 'function' && buildMergeFn(name)
  }


  function recipeCtx(name, seed = undefined) {
    if (seed) {
      pantry[`__${name}__context`] = newRecipeContext(name, seed)
    }
    return pantry[`__${name}__context`]
  }

  const recipeFor = (name, ...objOrFns) => {

    recipeCtx(name, name)

    const fns = objOrFns.map(coerceToFn)

    recipeFn(name, function(initialValues = {}) {
      recipeCtx(name).count++;
      return fns.reduce((vals, fn) => fn.call(this, vals), initialValues)
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

    returnFn.reset = (seed = name) => {
      recipeCtx(name, seed)
    }

    pantry[name] = returnFn

    return returnFn
  }

  // Public API
  pantry.recipeFor = recipeFor
  return pantry
}
