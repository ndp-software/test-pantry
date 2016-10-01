# Test Pantry
Easy Test Factories: Your <del>Javascript</del> ES Test Sous Chef 

## Installation & Basic Usage

`$ npm install -D test-pantry`

### Basic Factory Definition

Create and export factories in a file near your tests:
 
```javascript
// my-pantry.js
import TestPantry from `test-pantry`

export default const pantry = new TestPantry()
...
```

Within this file, factories are defined with functions or object literals:

```
pantry.recipeFor('player', function() { return { score: Math.random() } })
pantry.recipeFor('user', { name: 'Andy P', email: 'andy@ndpsoftware.com' })
```

### Basic Factory Usage

```javascript
// my-test.js
import pantry from 'my-pantry'

// use the factory
const myUser = pantry('user')
const myUser = pantry.user()   // alternate call syntax

// or combine them, to create "traits". Each factory's results are merged:
const myUser = pantry('user', 'player')

// or Mix-and-match as many as you'd like:
 const myUser = pantry('user', 'player', { gender: 'male' }, 'has-id')
```
Arrays of objects are created by passing an integer as the first parameter:
```javascript
const myUsers = pantry(10, 'user')
// or
const myUsers = pantry.user(10)
```

## Advanced

### Factory Conveniences

For any object returned from a factory, properties expressed as functions are evaluated:

```javascript
pantry.recipeFor('myObj', { key : () => Math.random() })
```

Most factory tools support an `afterCreate` method, for making small changes to your objects
before they are returned. Test Pantry allows any number of methods or object literals to be 
chained together to make your factory. Each method is given the object returned from 
the previous factory methods:

```javascript
const genName = () => Math.random().toString(32)
pantry.recipeFor( 'person',
                  function() { return { first: genName(), last: genName() } },
                  function(o) { o.fullName = `${o.first} ${o.last}`; return o })
```                 

### Utilities on Factory Context

Factories receive a few convenience utilities within the `this` context when they execute.
The most basic of these is a variable called `count`, which is a serial number 
for the object.

```javascript
pantry.recipeFor('has-id', function () {
  return { id : `id-${this.count}` }
})

pantry('has-id') // => { id : 'id-1' }
pantry('has-id') // => { id : 'id-2' }
```

The `this` context also provides:

  * **`this.random()`** A random float between 0 (inclusive) and 1 (exclusive). This is an alternative to `Math.random`. Sometimes in a test it's useful to use random numbers, but doing so can make writing assertions harder. This method meets you half way: it provides a random series of numbers-- but always the same sequence (based on a controllable seed). See [Random Reset](#Random Reset) below
  * **`this.randomInt(6)`** A random integer 0..5. Alias: `rollDie`.
  * **`this.randomInt(6, 10)`** A random integer 6..10
  * **`this.flipCoin()`** A boolean, true or false
  * **`this.count`** an index of which execution of the factory this is
  
For more variety, use a package like [Faker](https://www.npmjs.com/package/faker)

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

### Random Reset

The pseudo random number generators included as designed to provide random--
but repeatable-- sequences. This is done by explicitly seeding a pseudo random number
generator (PRNG). This is done for you, and each factory has its own sequence.

Here's an example:

```
  pantry.recipeFor('randomSequence', function() {
    return this.randomInt(10)
  })

  expect(pantry.randomSequence()).to.eql(9)
  expect(pantry.randomSequence()).to.eql(6)
  expect(pantry.randomSequence()).to.eql(2)
  expect(pantry.randomSequence()).to.eql(5)

  pantry.randomSequence.reset()   // <--- let's start over
  expect(pantry.randomSequence()).to.eql(9)
  expect(pantry.randomSequence()).to.eql(6)
  expect(pantry.randomSequence()).to.eql(2)
  ...
```

For some tests, it may make sense to set the seed before you start:

```
pantry.recipeFor('randomSequence', function() {
  return this.randomInt(1000)
})

it('test 1', function() {
  pantry.randomSequence.reset('foo')
  expect(pantry.randomSequence()).to.eql(467)
  expect(pantry.randomSequence()).to.eql(731)
})
it('test 2', function() {
  pantry.randomSequence.reset('foo')
  expect(pantry.randomSequence()).to.eql(467)
  expect(pantry.randomSequence()).to.eql(731)
})
```

## Legal

Copyright (c) 2016 Andrew J. Peterson
[Apache 2.0 License](https://github.com/ndp/test-pantry/raw/master/LICENSE)
