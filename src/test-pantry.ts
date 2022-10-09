import newRecipeContext from './recipe-context'
import { looksLikeIterator, isEmptyObject } from './util'

export class Pantry {
  constructor () {
  }
  [k: string]: any

  pantry (...args) {
    let components = args
    const howMany = typeof components[0] == 'number' ? components.shift() : 0
    components = components.filter(n => n !== undefined)

    components.forEach(component => {
      if (typeof component == 'string' && !this.recipeFn(component)) {
        throw `Unknown factory/trait '${component}'`
      }
    })
    components.forEach(component => {
      if (typeof this.recipeFn(component) !== 'function'
        && typeof component !== 'object'
        && typeof component !== 'function') {
        throw `Factory/trait '${component}' not a function`
      }
    })

    const ctx = this.recipeCtx(components[0])
    if (!ctx) {
      throw `Unknown context '${components[0]}': unsupported usage`
    }

    // May need to flip the first and second parameter?
    let initialValues = {}
    if (components.length >= 2
      && typeof components[0] == 'string'
      && this.recipeFn(components[0]).handlesInput
      && typeof components[1] == 'object') {
      initialValues = components[1]
      components.splice(1, 1)
    }

    if (howMany != 0) {
      return [...Array(howMany)].map(() => this.cook.call(ctx, components, initialValues))
    }
    return this.cook.call(ctx, components, initialValues)
  }

  recipeFor (name, ...objOrFns) {

    this.recipeCtx(name, name)

    const handlesInput = objOrFns.length > 0
      && typeof objOrFns[0] == 'function'
      && objOrFns[0].length > 0


    const fns = objOrFns.map(this.coerceToFn)

    this.recipeFn(name, function (initialValues = {}) {
      this.recipeCtx(name).count++;
      return fns.reduce((vals, fn) => fn.call(this, vals), initialValues)
    }, handlesInput)

    // And return a fn that calls `pantry()` with the arguments
    // Need to switch the number (if given) to be first.
    const returnFn = (...args) => {
      if (typeof args[0] == 'number') {
        const count = args.shift()
        return this.pantry(count, name, ...args)
      } else if (looksLikeIterator(args)) {
        // Support `Array(2).fill().map(factory)` and other iterators
        return this.pantry(name, args[0])
      }
      return this.pantry(name, ...args)
    }

    returnFn.reset = (seed = name) => {
      this.recipeCtx(name, seed)
    }

    this.pantry[name] = returnFn

    return returnFn
  }

  cook (components, initialValues) {
    return this.lastGenerated(components[0], components.reduce((acc, component) => {
      if (typeof component == 'object') {
        return { ...acc, ...this.callPropertyFns.call(this, component) }
      }
      return this.recipeFn(component).call(this, acc)
    }, initialValues))
  }

// Given an obj, returns an object with all of the
// properties whose values are functions called.
  callPropertyFns (o) {
    return Object.keys(o).reduce((result, k) => {
      const v = o[k]
      result[k] = typeof v == 'function' ? v.call(this) : v
      return result
    }, {})
  }

// Given a function, returns a version of that function that will
// merges its output with the input.
// Assumes that if the function accepts an object, it will do the merging
// itself; therefore, just implemented for the arity of 0 case.
  buildMergeFn (fn) {
    if (fn.length === 0) {
      return function (input) {
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

  buildObject (initialValues, values) {
    return Object.assign({}, initialValues, this.callPropertyFns.call(this, values))
  }

  buildObjectFn (values) {
    return function (initialValues) {
      return this.buildObject.call(this, initialValues, values)
    }
  }

  coerceToFn (objOrFn) {
    switch (typeof objOrFn) {
      case 'object':
        return this.buildObjectFn(objOrFn)
      case 'function':
        return this.buildMergeFn(objOrFn)
      case 'number':
        return () => objOrFn
      case 'string': {
        if (this.recipeFn(objOrFn)) {
          return this.recipeFn(objOrFn)
        }
        throw `Bad factory component. '${objOrFn}' is not a known factory name. If you want to return a string, use "()=>'${objOrFn}'"`
      }
      default:
        throw `Unknown factory component of type ${typeof objOrFn}: ${objOrFn}`
    }
  }

// All storage of functions is here
  recipeFn (name, fn?: Function, handlesInput?: boolean) {
    if (fn) {
      fn.handlesInput = handlesInput
      this.pantry[`__${name}`] = fn
    }
    return this.pantry[`__${name}`] || typeof name == 'function' && this.buildMergeFn(name)
  }

// All storage of context is here
  recipeCtx (name, seed = undefined) {
    if (seed) {
      this.pantry[`__${name}__context`] = newRecipeContext(name, seed, this.pantry)
    }
    return this.pantry[`__${name}__context`]
  }

// All storage of last is here
  lastGenerated (name, value) {
    const key = `__${name}__last`
    if (value !== undefined) {
      this.pantry[key] = value
    }
    return this.pantry[key]
  }

}

//
// export function ZXPantry () {
//
//   // Private fn returns function that returns last generated name
//   this.pantry.last = function (name) {
//     return () => lastGenerated(name) || this.pantry(name)
//   }
//
//   // Public API
//   this.pantry.recipeFor = recipeFor
//   return this.pantry
// }
