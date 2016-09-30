import { expect } from 'chai'
import Pantry from './test-pantry'


describe('pantry', function () {

  let pantry = null

  beforeEach(function () {
    pantry = new Pantry()
  })

  describe('definition: ', function () {

    it('can be defined using `createRecipe(name, obj)` syntax', function () {
      pantry.createRecipe('myObj', { key : 'value' })
      const result = pantry.myObj()
      expect(result).to.eql({ key : 'value' })
    })

    it('can be defined using `createRecipe(name, fn)` syntax', function () {
      pantry.createRecipe('myObj', () => ({ key : 'value' }))
      const result = pantry.myObj()
      expect(result).to.eql({ key : 'value' })
    })

    it('can be defined `createRecipe(name, obj, afterCreateFn)` syntax', function () {
      pantry.createRecipe('myObj', { key : 'value' }, function (x) {
        return Object.assign({}, x, { key2 : `${x.key}2` })
      })

      const result = pantry.myObj()
      expect(result).to.eql({ key : 'value', key2 : 'value2' })
    })

    it('factory function can access context', function () {
      pantry.createRecipe('myObj', function () {
        return { key : `value-${this.count}` }
      })
      const result = pantry.myObj()
      expect(result).to.eql({ key : 'value-1' })
    })

    it('afterCreateFn can access context', function () {
      pantry.createRecipe('myObj', { key : 'value' }, function (x) {
        return Object.assign({}, x, { key1 : `${x.key}${this.count}` })
      })

      const result = pantry.myObj()
      expect(result).to.eql({ key : 'value', key1 : 'value1' })
    })

    it('createRecipe() returns the factory method', function () {
      const f      = pantry.createRecipe('myObj', { key : 'value' })
      const result = f()
      expect(result).to.eql({ key : 'value' })
    })

    it('a property defined as a fn is evaluated', function () {
      const f      = pantry.createRecipe('myObj', { key : () => 'value' })
      const result = f()
      expect(result).to.eql({ key : 'value' })
    })

    it('a property function is given a context', function () {
      const f       = pantry.createRecipe('myObj', {
        key : function () {
          return `value-${this.count}`
        }
      })
      const result1 = f()
      const result2 = f()
      expect(result1).not.to.eql(result2)
    })

    it('a property function can call another factory method', function () {
      pantry.createRecipe('room', {
        dimension : 'medium',
        house     : () => pantry('house')
      })
      pantry.createRecipe('house', { color : 'yellow' })
      const house = pantry.house()
      const rm    = pantry('room')
      expect(rm.house).to.eql({ color : 'yellow' })
    })

    it('a property function can be another factory method', function () {
      pantry.createRecipe('id', function () {
        return `id-${this.count}`
      })
      pantry.createRecipe('entity', {
        id   : pantry.id,
        name : 'name'
      })

      expect(pantry.entity()).to.eql({ id : 'id-1', name : 'name' })
      expect(pantry.entity()).to.eql({ id : 'id-2', name : 'name' })
    })
  })

  describe('cooking: ', function () {
    it('will return value directly from pantry function', function () {
      pantry.createRecipe('myObj', { key : 'value' })
      const result = pantry('myObj')
      expect(result).to.eql({ key : 'value' })
    })


    it('handles several different object-based factories', function () {
      pantry.createRecipe('id', {
        id : function () {
          return this.count
        }
      })
      pantry.createRecipe('named', {
        name : function () {
          return `name #${this.count}`
        }
      })
      pantry.createRecipe('timestamp', {
        timestamp : function () {
          return 'june 5th'
        }
      })

      const r = pantry('id', 'named', 'timestamp')

      expect(r).to.eql({ id : 1, name : 'name #1', timestamp : 'june 5th' })
    })

    it('handles several different fn-based factories', function () {
      pantry.createRecipe('id', function () {
        return {
          id : this.count
        }
      })
      pantry.createRecipe('named', function () {
        return {
          name : `name #${this.count}`
        }
      })
      pantry.createRecipe('timestamp', function () {
        return {
          timestamp : 'june 5th'
        }
      })

      const r = pantry('id', 'named', 'timestamp')

      expect(r).to.eql({ id : 1, name : 'name #1', timestamp : 'june 5th' })
    })

    it('can have factories and overrides', function () {
      pantry.createRecipe('id', function () {
        return {
          id : this.count
        }
      })
      pantry.createRecipe('named', function () {
        return {
          name : `name #${this.count}`
        }
      })
      const r = pantry('id', 'named', { 'timestamp' : 'june 4th' })
      expect(r).to.eql({ id : 1, name : 'name #1', timestamp : 'june 4th' })
    })

  })

  describe('features: ', function () {

  })
})