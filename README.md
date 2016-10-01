# Test Pantry
Easy Test Factories: Your <del>JS</del> ES Test Sous Chef 

## Installation & Usage

`$ npm install -D test-pantry`

## Define your Factory (or Factories)

Create and export factories in a file near your tests:
 
```javascript
// my-pantry.js
import TestPantry from `test-pantry`

export default const pantry = new TestPantry()
...
```

Factories are defined with functions or object literals:

```
pantry.recipeFor('Player', function() { return { score: Math.random() } })
pantry.recipeFor('User', { name: 'Andy P', email: 'andy@ndpsoftware.com' })
```

### Factory Conveniences

Object literal properties expressed as functions are evaluated:

```javascript
pantry.recipeFor('myObj', { key : () => Math.random() })
```

An `afterCreate` method is supported, for making small changes to your objects:

```javascript
const genName = () => Math.random().toString(32)
pantry.recipeFor( 'person',
                  function() { return { first: genName(), last: genName() } },
                  function(o) { o.fullName = `${o.first} ${o.last}`; return o })
```                 
(In fact, you can chain together as many items as you need.)

## Utilities on Factory Context

Factories receive some utilties within the `this` context when they are execute.
The most basic of these is a variable called `count`, which is a serial number 
for the object.

```javascript
pantry.recipeFor('has-id', function () {
  return { id : `id-${this.count}` }
})
```

This also provides:

  * **`this.random()`** A random float between 0 (inclusive) and 1 (exclusive). See `Math.random`
  * **`this.randomInt(6)`** A random integer 0..5. Alias: `rollDie`.
  * **`this.randomInt(6, 10)`** A random integer 6..10
  * **`this.flipCoin()`** A boolean, true or false
  * **`this.count`** an index of which execution of the factory this is

## Usage

```javascript
// my-test.js
import pantry from 'my-pantry'

// use the factory
const myUser = pantry('user')
const myUser = pantry.user()   // alternate call syntax

// The factory function is also attached to the factory as a function
const myUser = pantry.User() or 
               pantry['User']()

// or combine them, to create "traits":
 const myUser = pantry('User', 'Player')

// or Mix-and-match:
 const myUser = pantry('user', 'Player', { gender: 'male' }, 'has-id')
```
Or ask for an array of objects by passing an integer:
```javascript
const myUsers = pantry(10, user)
// or
const myUsers = pantry.user(10)
```

### Count reset

The `count` can be reset, which is useful so that a test always gets the 
 same mocked data. This is done calling the `reset` function on the specific factory:

```
pantry.recipeFor('num', function() { return this.count  })

pantry.num() // => 1
pantry.num() // => 2
pantry.num() // => 3
f.reset()
pantry.num() // => 1
```

### Random

The pseudo random number generators included as designed to provide random--
but repeatable-- sequences. This is done by explicitly seeding a pseudo random number
generator (prng). This is done for you, and each factory has its own sequence.

Do this by using the `reset` method on the factory:

```
  pantry.recipeFor('randomSequence', function() {
    return this.randomInt(10)
  })

  expect(pantry.randomSequence()).to.eql(9)
  expect(pantry.randomSequence()).to.eql(6)
  expect(pantry.randomSequence()).to.eql(2)
  expect(pantry.randomSequence()).to.eql(5)

  pantry.randomSequence.reset()
  expect(pantry.randomSequence()).to.eql(9)
  expect(pantry.randomSequence()).to.eql(6)
  expect(pantry.randomSequence()).to.eql(2)
  ...
```

For some tests, it may make sense to set the seed before you start:

```
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
```


## Legal

Copyright (c) 2016 Andrew J. Peterson
[Apache 2.0 License](https://github.com/ndp/test-pantry/raw/master/LICENSE)
