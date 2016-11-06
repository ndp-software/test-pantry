import { expect } from 'chai'
import Pantry from './test-pantry'

const spec = it


describe('pantry', function() {

  let pantry = null

  beforeEach(function() {
    pantry = new Pantry()
  })

  describe('definition: ', function() {

    spec('a number', function() {
      pantry.recipeFor('id', 42)
      expect(pantry.id()).to.eql(42)
    })

    spec('an object literal', function() {
      pantry.recipeFor('myObj', {key: 'value'})
      const result = pantry.myObj()
      expect(result).to.eql({key: 'value'})
    })

    spec('a function returning an object', function() {
      pantry.recipeFor('myObj', () => ({key: 'value'}))
      const result = pantry.myObj()
      expect(result).to.eql({key: 'value'})
    })

    spec('a function returning a string', function() {
      pantry.recipeFor('id', function() {
        return `id-${this.count}`
      })
      expect(pantry.id()).to.eql('id-1')
    })

    spec('a function returning a number', function() {
      pantry.recipeFor('id', function() {
        return this.count
      })
      expect(pantry.id()).to.eql(1)
    })

    spec('an arbitrary string isn\'t allowed', function() {
      expect(() => pantry.recipeFor('id', 'id-1')).to.throw(/id\-1.*is not a known factory name/)
    })

    spec('another factory name', function() {
      pantry.recipeFor('a', {a: 'a'})
      pantry.recipeFor('b', {b: 'b'})
      pantry.recipeFor('c', {c: 'c'})

      pantry.recipeFor('abc', 'a', 'b', 'c')

      expect(pantry('abc')).to.eql({a: 'a', b: 'b', c: 'c'})
    })

    spec('another factory', function() {
      pantry.recipeFor('a', function() {
        return {a: 'a'}
      })
      pantry.recipeFor('b', function() {
        return {b: 'b'}
      })
      pantry.recipeFor('c', function() {
        return {c: 'c'}
      })

      pantry.recipeFor('abc', pantry.a, pantry.b, pantry.c)

      expect(pantry('abc')).to.eql({a: 'a', b: 'b', c: 'c'})
    })

    spec('an afterCreate function using first values', function() {
      pantry.recipeFor('person',
                       {first: 'foo', last: 'last'},
                       function(o) {
                         o.fullName = `${o.first} ${o.last}`;
                         return o
                       })

      const result = pantry.person()

      expect(Object.keys(result)).to.eql(['first', 'last', 'fullName'])
      expect(result.fullName).to.eql('foo last')
    })

    spec('an afterCreateFn can access context', function() {
      pantry.recipeFor('myObj', {key: 'value'}, function(x) {
        return Object.assign({}, x, {key1: `${x.key}${this.count}`})
      })

      const result = pantry.myObj()

      expect(result).to.eql({key: 'value', key1: 'value1'})
    })

    spec('can use `count`', function() {
      pantry.recipeFor('myObj', function() {
        return {key: `value-${this.count}`}
      })
      expect(pantry.myObj()).to.eql({key: 'value-1'})
      expect(pantry.myObj()).to.eql({key: 'value-2'})
    })

    spec('can use the factory\'s `name`', function() {
      pantry.recipeFor('dog', function() {
        return {key: this.name}
      })
      expect(pantry.dog()).to.eql({key: 'dog'})
    })

    spec('can use the factory\'s `name` in different factories', function() {
      pantry.recipeFor('hasId', function() {
        return {id: `${this.name}-${this.count}`}
      })
      pantry.recipeFor('dog', {bark: 'yes'}, 'hasId')
      pantry.recipeFor('cat', {meow: 'yes'}, 'hasId')

      expect(pantry.dog()).to.eql({id: 'dog-1', bark: 'yes'})
      expect(pantry.cat()).to.eql({id: 'cat-1', meow: 'yes'})
    })

    spec('can restart counts', function() {
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

    spec('recipeFor() returns the factory method', function() {
      const f = pantry.recipeFor('myObj', {key: 'value'})

      const result = f()

      expect(result).to.eql({key: 'value'})
    })

    spec('recipeFor() returns the factory method that accepts a count', function() {
      const f = pantry.recipeFor('myObj', {key: 'value'})

      expect(f(1)).to.eql([{key: 'value'}])
    })

    spec('can be defined with multiple objects', function() {
      pantry.recipeFor('abc', {a: 'a'}, {b: 'b'}, {c: 'c'})
      expect(pantry('abc')).to.eql({a: 'a', b: 'b', c: 'c'})
    })

    spec('can be defined with multiple functions', function() {
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

    spec('a property defined as a fn is evaluated', function() {
      const f      = pantry.recipeFor('myObj', {key: () => 'value'})
      const result = f()
      expect(result).to.eql({key: 'value'})
    })

    spec('a property function is given a context with a count reference', function() {
      const f       = pantry.recipeFor('myObj', {
        key: function() {
          return `value-${this.count}`
        }
      })
      const result1 = f()
      const result2 = f()
      expect(result1).not.to.eql(result2)
    })

    spec('a property function is given a context with a pantry reference', function() {
      pantry.recipeFor('myObj', {
        pantry: function() {
          return this.pantry
        }
      })
      const result = pantry.myObj()
      expect(result.pantry).to.eql(pantry)
    })

    spec('a property function can call another factory method', function() {
      pantry.recipeFor('house', {color: 'yellow'})
      expect(pantry.house()).to.eql({color: 'yellow'})

      pantry.recipeFor('room', {
        dimension: 'medium',
        house:     () => pantry('house')
      })
      const rm = pantry('room')
      expect(rm.house).to.eql({color: 'yellow'})
    })

    spec('a property function can be another factory method', function() {
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

    spec('can chain together functions for recipes', function() {
      pantry.recipeFor('x', function() {
        return {a: 'A'}
      }, function() {
        return {b: 'B'}
      })
      expect(pantry.x()).to.eql({a: 'A', b: 'B'})
    })

    spec('can chain together functions that feed into each other', function() {
      pantry.recipeFor('x', function() {
        return {a: 'A'}
      }, function(c) {
        return {b: c}
      })
      expect(pantry.x()).to.eql({b: {a: 'A'}})
    })

  })

  describe('cooking: ', function() {

    spec('handles several different object-based factories', function() {
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

    spec('handles several different fn-based factories', function() {
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

    spec('can have factories and overrides', function() {
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

    spec('can mutate the factory object with a provided function', function() {
      pantry.recipeFor('cat', function() {
        return {id: `id-${this.count}`, value: 'x'}
      })

      const result = pantry.cat(function(o) {
        o.id = `cat-id-${this.count}`;
        return o
      })

      expect(result).to.eql({'id': 'cat-id-1', value: 'x'})
    })

    spec('will override a property with a passed object\'s properties', function() {
      pantry.recipeFor('cat', function() {
        return {id: `cat-${this.count}`, value: 'x'}
      })

      const result = pantry.cat({id: 'override!'})

      expect(result).to.eql({'id': 'override!', value: 'x'})

    })

    spec('will merge a fn returning overrides', function() {
      pantry.recipeFor('cat', function() {
        return {id: `cat-${this.count}`, value: 'x'}
      })

      const result = pantry.cat(function() {
        return {id: `override-${this.count}`}
      })

      expect(result).to.eql({'id': 'override-1', value: 'x'})
    })

    spec('will merge an object with attr fn overrides', function() {
      pantry.recipeFor('cat', function() {
        return {id: `cat-${this.count}`, value: 'x'}
      })

      const result = pantry.cat({
        id:    function() {
          return `my-${this.count}`
        },
        value: 'x'
      })

      expect(result).to.eql({'id': 'my-1', value: 'x'})
    })

    describe('when recipe does not accept arguments, ', function() {

      spec('merges params given', function() {
        pantry.recipeFor('x', function() {
          return {x: 5}
        })
        expect(pantry('x', {y: 10})).to.eql({x: 5, y: 10})
        expect(pantry.x({y: 10})).to.eql({x: 5, y: 10})
      })
    })

    describe('when recipe accepts arguments, ', function() {

      spec('passes the first parameter in to first function', function() {
        pantry.recipeFor('x', function(inputs) {
          return {x: 3 * inputs.y}
        })
        const r = pantry.x({y: 10})
        expect(r).to.eql({x: 30})
      })
    })

    spec('an "after" function can access factory object', function() {
      pantry.recipeFor('cat', function() {
        return {id: `id-${this.count}`}
      })

      const cat = pantry.cat(function(o) {
        o.id = `cat-${o.id}`;
        return o
      })

      expect(cat).to.eql({
        'id': 'cat-id-1'
      })
    })

    spec('an "after" function can access `this` values', function() {
      pantry.recipeFor('cat', function() {
        return {id: `id-${this.count}`}
      })

      const cat = pantry.cat(function(o) {
        o.id = `cat-id-${this.count}`;
        return o
      })

      expect(cat).to.eql({
        'id': 'cat-id-1'
      })
    })

    describe('arrays of objs', function() {

      spec('will create multiple objects when a number is given', function() {
        pantry.recipeFor('myObj', {key: 'value'})
        const result = pantry(2, 'myObj')
        expect(result).to.eql([{key: 'value'}, {key: 'value'}])
      })

      spec('will create multiple objects specific recipe is given a number', function() {
        pantry.recipeFor('myObj', {key: 'value'})
        const result = pantry.myObj(2)
        expect(result).to.eql([{key: 'value'}, {key: 'value'}])
      })

      spec('can be used in a filled array loop', function() {
        pantry.recipeFor('myObj', {key: 'value'})
        const result = Array(2).fill().map(pantry.myObj)
        expect(result).to.eql([{key: 'value'}, {key: 'value'}])
      })

      spec('can be used in a `map` loop', function() {
        pantry.recipeFor('myObj', {key: 'value'})
        const result = [1, 3, 5].map(x => ({id: `id-${x}`})).map(pantry.myObj)
        expect(result).to.eql([
          {id: 'id-1', key: 'value'},
          {id: 'id-3', key: 'value'},
          {id: 'id-5', key: 'value'}
        ])
      })

      spec('can be with spread operator', function() {
        pantry.recipeFor('myObj', {key: 'value'})
        const result = [...Array(2)].map(pantry.myObj)
        expect(result).to.eql([{key: 'value'}, {key: 'value'}])
      })

    })

  })

  describe('random: ', function() {

    spec('provides predictable, but random numbers', function() {
      pantry.recipeFor('test', function() {
        return this.random()
      })

      expect(pantry.test()).to.eql(0.8722025543160253)
      expect(pantry.test()).to.eql(0.4023928518604753)
      expect(pantry.test()).to.eql(0.9647289658507073)
      expect(pantry.test()).to.eql(0.30479896375101545)
    })

    spec('provides some random coin flips', function() {
      pantry.recipeFor('test', function() {
        return {bool: this.flipCoin()}
      })

      for (let i = 0; i < 1000; i++) {
        const o = pantry.test()
        expect(typeof o.bool).to.eql('boolean')
      }

    })

    spec('provides some dieRoll', function() {
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

    spec('provides some randomInt', function() {
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

    spec('can sample one of several values', function() {
      pantry.recipeFor('roshambo', function() {
        return this.sample('rock', 'paper', 'scissors')
      })
      expect(pantry.roshambo()).to.eql('paper')
      expect(pantry.roshambo()).to.eql('rock')
      expect(pantry.roshambo()).to.eql('paper')
      expect(pantry.roshambo()).to.eql('scissors')
      expect(pantry.roshambo()).to.eql('rock')
    })

    spec('can sample from an array  values', function() {
      pantry.recipeFor('roshambo', function() {
        return this.sample(['rock', 'paper', 'scissors'])
      })
      expect(pantry.roshambo()).to.eql('paper')
      expect(pantry.roshambo()).to.eql('rock')
      expect(pantry.roshambo()).to.eql('paper')
      expect(pantry.roshambo()).to.eql('scissors')
      expect(pantry.roshambo()).to.eql('rock')
    })

    spec('random sequences are repeatable', function() {
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

    spec('can be seeded from the start', function() {
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

    spec('produces different values with different seeds', function() {
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

  describe('referencing other objects', function() {
    spec('can reference other factories', function() {
      pantry.recipeFor('unicorn', {horn: 'toot'})
      pantry.recipeFor('zoo', {animals: [pantry.unicorn()]})

      const zoo = pantry.zoo()

      expect(zoo).to.eql({animals: [{horn: 'toot'}]})
    })

    spec('can reference last generated object', function() {
      pantry.recipeFor('zoo', {
        value: function() {
          return Math.random()
        }
      })

      const zoo = pantry.zoo()

      expect(pantry.last('zoo')()).to.eql(zoo)
    })

    spec('recipe can reference last generated object', function() {
      pantry.recipeFor('unicorn', {
        location: pantry.last('zoo')
      })
      pantry.recipeFor('zoo', {
        value: function() {
          return `Zoological Garden #${Math.random()}`
        }
      })

      const zoo    = pantry.zoo(),
            animal = pantry.unicorn()

      expect(animal.location.name).to.eql(zoo.name)
    })

    spec('recipe can find last generated object from context', function() {
      pantry.recipeFor('unicorn', {
        location: function() { return this.last('zoo') }
      })
      pantry.recipeFor('zoo', {
        value: function() {
          return `Zoological Garden #${Math.random()}`
        }
      })

      const zoo    = pantry.zoo(),
            animal = pantry.unicorn()

      expect(animal.location.name).to.eql(zoo.name)
    })
  })

})