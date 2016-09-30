import { expect } from 'chai'
import Pantry from './test-pantry'


describe('pantry', function() {

  let pantry = null

  beforeEach(function() {
    pantry = new Pantry()
  })

  describe('definition: ', function() {

    it('is defined using an object literal', function() {
      pantry.recipeFor('myObj', {key: 'value'})
      const result = pantry.myObj()
      expect(result).to.eql({key: 'value'})
    })

    it('is defined using a function', function() {
      pantry.recipeFor('myObj', () => ({key: 'value'}))
      const result = pantry.myObj()
      expect(result).to.eql({key: 'value'})
    })

    it('is defined with simply a string', function() {
      pantry.recipeFor('id', function() {
        return `id-${this.count}`
      })
      expect(pantry.id()).to.eql('id-1')
    })

    it('can be defined with an afterCreate function', function() {
      const genName = () => Math.random().toString(32)
      pantry.recipeFor( 'person',
                        function() { return { first: genName(), last: genName() } },
                        function(o) { o.fullName = `${o.first} ${o.last}`; return o })

      const result = pantry.person()
      expect(Object.keys(result)).to.eql(['first', 'last', 'fullName'])
    })

    it('factory function can access context', function() {
      pantry.recipeFor('myObj', function() {
        return {key: `value-${this.count}`}
      })
      const result = pantry.myObj()
      expect(result).to.eql({key: 'value-1'})
    })

    it('afterCreateFn can access context', function() {
      pantry.recipeFor('myObj', {key: 'value'}, function(x) {
        return Object.assign({}, x, {key1: `${x.key}${this.count}`})
      })

      const result = pantry.myObj()
      expect(result).to.eql({key: 'value', key1: 'value1'})
    })

    it('recipeFor() returns the factory method', function() {
      const f      = pantry.recipeFor('myObj', {key: 'value'})
      const result = f()
      expect(result).to.eql({key: 'value'})
    })

    it('can be defined with multiple objects', function() {
      pantry.recipeFor('abc', {a: 'a'}, {b: 'b'}, {c: 'c'})
      expect(pantry('abc')).to.eql({a: 'a', b: 'b', c: 'c'})
    })

    it('can be defined with multiple functions', function() {
      pantry.recipeFor('abc',
                       function() {
                         return {a: 'a'}
                       },
                       function() {
                         return {b: 'b'}
                       },
                       function() {
                         return {c: 'c'}
                       })
      expect(pantry.abc()).to.eql({a: 'a', b: 'b', c: 'c'})
      expect(pantry('abc')).to.eql({a: 'a', b: 'b', c: 'c'})
    })

    it('a property defined as a fn is evaluated', function() {
      const f      = pantry.recipeFor('myObj', {key: () => 'value'})
      const result = f()
      expect(result).to.eql({key: 'value'})
    })

    it('a property function is given a context', function() {
      const f       = pantry.recipeFor('myObj', {
        key: function() {
          return `value-${this.count}`
        }
      })
      const result1 = f()
      const result2 = f()
      expect(result1).not.to.eql(result2)
    })

    it('a property function can call another factory method', function() {
      pantry.recipeFor('house', {color: 'yellow'})
      expect(pantry.house()).to.eql({color: 'yellow'})

      pantry.recipeFor('room', {
        dimension: 'medium',
        house:     () => pantry('house')
      })
      const rm = pantry('room')
      expect(rm.house).to.eql({color: 'yellow'})
    })

    it('a property function can be another factory method', function() {
      pantry.recipeFor('id', function() {
        return `id-${this.count}`
      })
      pantry.recipeFor('entity', {
        id:   pantry.id,
        name: 'name'
      })

      expect(pantry.entity()).to.eql({id: 'id-1', name: 'name'})
      expect(pantry.entity()).to.eql({id: 'id-2', name: 'name'})
    })
  })

  describe('cooking: ', function() {
    it('will return value directly from pantry function', function() {
      pantry.recipeFor('myObj', {key: 'value'})
      const result = pantry('myObj')
      expect(result).to.eql({key: 'value'})
    })


    it('handles several different object-based factories', function() {
      pantry.recipeFor('id', {
        id: function() {
          return this.count
        }
      })
      pantry.recipeFor('named', {
        name: function() {
          return `name #${this.count}`
        }
      })
      pantry.recipeFor('timestamp', {
        timestamp: function() {
          return 'june 5th'
        }
      })

      const r = pantry('id', 'named', 'timestamp')

      expect(r).to.eql({id: 1, name: 'name #1', timestamp: 'june 5th'})
    })

    it('handles several different fn-based factories', function() {
      pantry.recipeFor('id', function() {
        return {
          id: this.count
        }
      })
      pantry.recipeFor('named', function() {
        return {
          name: `name #${this.count}`
        }
      })
      pantry.recipeFor('timestamp', function() {
        return {
          timestamp: 'june 5th'
        }
      })

      const r = pantry('id', 'named', 'timestamp')

      expect(r).to.eql({id: 1, name: 'name #1', timestamp: 'june 5th'})
    })

    it('can have factories and overrides', function() {
      pantry.recipeFor('id', function() {
        return {
          id: this.count
        }
      })
      pantry.recipeFor('named', function() {
        return {
          name: `name #${this.count}`
        }
      })
      const r = pantry('id', 'named', {'timestamp': 'june 4th'})
      expect(r).to.eql({id: 1, name: 'name #1', timestamp: 'june 4th'})
    })

    it('will create multiple objects when a number is given', function() {
      pantry.recipeFor('myObj', {key: 'value'})
      const result = pantry(2, 'myObj')
      expect(result).to.eql([{key: 'value'}, {key: 'value'}])
    })

    it('will create multiple objects specific recipe is given a number', function() {
      pantry.recipeFor('myObj', {key: 'value'})
      const result = pantry.myObj(2)
      expect(result).to.eql([{key: 'value'}, {key: 'value'}])
    })

  })

  describe('features: ', function() {

  })
})