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

    it('is defined using a function returning an object', function() {
      pantry.recipeFor('myObj', () => ({key: 'value'}))
      const result = pantry.myObj()
      expect(result).to.eql({key: 'value'})
    })

    it('is defined with function returning a string', function() {
      pantry.recipeFor('id', function() {
        return `id-${this.count}`
      })
      expect(pantry.id()).to.eql('id-1')
    })

    it('is defined with function returning a number', function() {
      pantry.recipeFor('id', function() {
        return this.count
      })
      expect(pantry.id()).to.eql(1)
    })

    it('can be defined with an afterCreate function', function() {
      const genName = () => 'foo'
      pantry.recipeFor('person',
                       function() {
                         return {first: genName(), last: 'last'}
                       },
                       function(o) {
                         o.fullName = `${o.first} ${o.last}`;
                         return o
                       })

      const result = pantry.person()
      expect(Object.keys(result)).to.eql(['first', 'last', 'fullName'])
      expect(result.fullName).to.eql('foo last')
    })

    it('can be built from other factories', function() {
      pantry.recipeFor('a', function() {
        return {a: 'a'}
      })
      pantry.recipeFor('b', function() {
        return {b: 'b'}
      })
      pantry.recipeFor('c', function() {
        return {c: 'c'}
      })
      pantry.recipeFor('abc', 'a', 'b', 'c')

      expect(pantry('abc')).to.eql({a: 'a', b: 'b', c: 'c'})

    })

    it('factory function can access context', function() {
      pantry.recipeFor('myObj', function() {
        return {key: `value-${this.count}`}
      })
      expect(pantry.myObj()).to.eql({key: 'value-1'})
      expect(pantry.myObj()).to.eql({key: 'value-2'})
    })

    it('can restart counts', function() {
      pantry.recipeFor('count', function() {
        return this.count
      })
      expect(pantry.count()).to.eql(1)
      expect(pantry.count()).to.eql(2)

      pantry.count.reset()
      expect(pantry.count()).to.eql(1)
      expect(pantry.count()).to.eql(2)

      pantry.count.reset()
      expect(pantry.count()).to.eql(1)
      expect(pantry.count()).to.eql(2)
      expect(pantry.count()).to.eql(3)
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

      expect(f(1)).to.eql([{key: 'value'}])
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

    it('can chain together functions for recipes', function() {
      pantry.recipeFor('x', function() {
        return {a: 'A'}
      }, function() {
        return {b: 'B'}
      })
      expect(pantry.x()).to.eql({a: 'A', b: 'B'})
    })

    it('can chain together functions that feed into each other', function() {
      pantry.recipeFor('x', function() {
        return {a: 'A'}
      }, function(c) {
        return {b: c}
      })
      expect(pantry.x()).to.eql({b: {a: 'A'}})
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

    describe('recipe does not accept arguments', function() {
      it('merges params given', function() {
        pantry.recipeFor('x', function() {
          return {x: 5}
        })
        expect(pantry('x', {y: 10})).to.eql({x: 5, y: 10})
        expect(pantry.x({y: 10})).to.eql({x: 5, y: 10})
      })
    })

    describe('recipe accepts arguments', function() {
      it('passes the first parameter in to first function', function() {
        pantry.recipeFor('x', function(inputs) {
          return {x: 3 * inputs.y}
        })
        const r = pantry.x({y: 10})
        expect(r).to.eql({x: 30})
      })
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

    it('can be used in a filled array loop', function() {
      pantry.recipeFor('myObj', {key: 'value'})
      const result = Array(2).fill().map(pantry.myObj)
      expect(result).to.eql([{key: 'value'}, {key: 'value'}])
    })

    it('can be used in a `map` loop', function() {
      pantry.recipeFor('myObj', {key: 'value'})
      const result = [1, 3, 5].map(x => ({id: `id-${x}`})).map(pantry.myObj)
      expect(result).to.eql([
        {id: 'id-1', key: 'value'},
        {id: 'id-3', key: 'value'},
        {id: 'id-5', key: 'value'}
      ])
    })

    it('can be with spread operator', function() {
      pantry.recipeFor('myObj', {key: 'value'})
      const result = [...Array(2)].map(pantry.myObj)
      expect(result).to.eql([{key: 'value'}, {key: 'value'}])
    })

    it('an "after" function can access factory object', function() {
      pantry.recipeFor('cat', function() {
        return {id: `id-${this.count}`}
      })

      const cats = pantry.cat(2, function(o) {
        o.id = `cat-${o.id}`;
        return o
      })

      expect(cats).to.eql([
        {
          'id': 'cat-id-1'
        },
        {
          'id': 'cat-id-2'
        }
      ])
    })

    xit('an "after" function can access `this` values', function() {
      pantry.recipeFor('cat', function() {
        return {id: `id-${this.count}`}
      })

      const cats = pantry.cat(2, function(o) {
        o.id = `cat-id-${this.count}`;
        return o
      })

      expect(cats).to.eql([
        {
          'id': 'cat-id-1'
        },
        {
          'id': 'cat-id-2'
        }
      ])
    })

  })


  describe('random: ', function() {

    it('provides predictable, but random numbers', function() {
      pantry.recipeFor('test', function() {
        return this.random()
      })

      expect(pantry.test()).to.eql(0.8722025543160253)
      expect(pantry.test()).to.eql(0.4023928518604753)
      expect(pantry.test()).to.eql(0.9647289658507073)
      expect(pantry.test()).to.eql(0.30479896375101545)
    })

    it('provides some random coin flips', function() {
      pantry.recipeFor('test', function() {
        return {bool: this.flipCoin()}
      })

      for (let i = 0; i < 1000; i++) {
        const o = pantry.test()
        expect(typeof o.bool).to.eql('boolean')
      }

    })

    it('provides some dieRoll', function() {
      pantry.recipeFor('dice', function() {
        return {
          die1: this.rollDie(6),
          die2: this.rollDie(6)
        }
      })
      for (let i = 0; i < 1000; i++) {
        const roll = pantry('dice')
        expect(typeof roll.die1).to.eql('number')
        expect(roll.die1).to.gte(0)
        expect(roll.die1).to.lt(7)
      }
    })

    it('provides some randomInt', function() {
      pantry.recipeFor('dice', function() {
        return {
          die1: this.randomInt(6),
          die2: this.randomInt(1, 6)
        }
      })
      for (let i = 0; i < 1000; i++) {
        const roll = pantry('dice')

        expect(typeof roll.die1).to.eql('number')
        expect(roll.die1).to.gte(0)
        expect(roll.die1).to.lt(6)

        expect(typeof roll.die2).to.eql('number')
        expect(roll.die2).to.gte(1)
        expect(roll.die2).to.lte(6)
      }
    })

    it('can sample one of several values', function() {
      pantry.recipeFor('roshambo', function() {
        return this.sample('rock', 'paper', 'scissors')
      })
      expect(pantry.roshambo()).to.eql('paper')
      expect(pantry.roshambo()).to.eql('rock')
      expect(pantry.roshambo()).to.eql('paper')
      expect(pantry.roshambo()).to.eql('scissors')
      expect(pantry.roshambo()).to.eql('rock')
    })

    it('can sample from an array  values', function() {
      pantry.recipeFor('roshambo', function() {
        return this.sample(['rock', 'paper', 'scissors'])
      })
      expect(pantry.roshambo()).to.eql('paper')
      expect(pantry.roshambo()).to.eql('rock')
      expect(pantry.roshambo()).to.eql('paper')
      expect(pantry.roshambo()).to.eql('scissors')
      expect(pantry.roshambo()).to.eql('rock')
    })

    it('random sequences are repeatable', function() {
      pantry.recipeFor('randomSequence', function() {
        return this.randomInt(10)
      })

      expect(pantry.randomSequence()).to.eql(9)
      expect(pantry.randomSequence()).to.eql(6)
      expect(pantry.randomSequence()).to.eql(2)
      expect(pantry.randomSequence()).to.eql(5)
      expect(pantry.randomSequence()).to.eql(1)
      expect(pantry.randomSequence()).to.eql(3)
      expect(pantry.randomSequence()).to.eql(3)

      pantry.randomSequence.reset()
      expect(pantry.randomSequence()).to.eql(9)
      expect(pantry.randomSequence()).to.eql(6)
      expect(pantry.randomSequence()).to.eql(2)
      expect(pantry.randomSequence()).to.eql(5)
      expect(pantry.randomSequence()).to.eql(1)
      expect(pantry.randomSequence()).to.eql(3)
      expect(pantry.randomSequence()).to.eql(3)
    })

    it('can be seeded from the start', function() {
      pantry.recipeFor('randomSequence', function() {
        return this.randomInt(1000)
      })

      pantry.randomSequence.reset('foo')
      expect(pantry.randomSequence()).to.eql(467)
      expect(pantry.randomSequence()).to.eql(731)

      pantry.randomSequence.reset('foo')
      expect(pantry.randomSequence()).to.eql(467)
      expect(pantry.randomSequence()).to.eql(731)

    })

    it('produces different values with different seeds', function() {
      pantry.recipeFor('randomSequence', function() {
        return this.randomInt(1000)
      })

      pantry.randomSequence.reset('foo')
      expect(pantry.randomSequence()).to.eql(467)
      expect(pantry.randomSequence()).to.eql(731)

      pantry.randomSequence.reset('bar')
      expect(pantry.randomSequence()).not.to.eql(467)
      expect(pantry.randomSequence()).not.to.eql(731)
    })

  })

})