# Test Pantry  [![Build Status](https://travis-ci.org/ndp-software/test-pantry.svg?branch=master)](https://travis-ci.org/ndp-software/test-pantry)
Easy Test Factories: Your <del>Javascript</del> ES Test Sous Chef 

## Installation & Basic Usage

`# $ npm install -D test-pantry`

### Basic Factory Definition

Create and export factories in a file near your tests:
 
```javascript
// my-pantries.js

import TestPantry from `test-pantry`
 
const pantry = new TestPantry()
```

Within this file, factories are defined with functions or object literals:

```
pantry.recipeFor('player', function() { return { score: Math.random() } })
pantry.recipeFor('user', { name: 'Andy P', email: 'andy@ndpsoftware.com' })
```

For any object returned from a factory, properties expressed as functions are evaluated:

```
pantry.recipeFor('keyed', { key: () => Math.random() })
```

### Basic Factory Usage

```javascript
// my-test.js -- needs to `import pantry from 'my-pantry'`

// use the factory
pantry('user')  // => { name: 'Andy P', email: 'andy@ndpsoftware.com' }

// alternate call syntax:
pantry.user()   // => { name: 'Andy P', email: 'andy@ndpsoftware.com' }

// or combine them, to create "traits". Each factory's results are merged:
pantry('user', 'player') // => { name: 'Andy P',
                         //      email: 'andy@ndpsoftware.com',
                         //      score: 0.6207161337323834 }

// or Mix-and-match as many as you'd like:
pantry('user', 'player', { gender: 'male' }, 'keyed')
   // => { name: 'Andy P',
   //      email: 'andy@ndpsoftware.com',
   //      score: 0.20819184742637864,
   //      gender: 'male',
   //      key: 0.652420063866042 }
```
Arrays of objects are created by passing an integer as the first parameter:

```javascript
pantry(3, 'user') // or `pantry.user(10)`
                  //  => [ { name: 'Andy P', email: 'andy@ndpsoftware.com' },
                  //       { name: 'Andy P', email: 'andy@ndpsoftware.com' },
                  //       { name: 'Andy P', email: 'andy@ndpsoftware.com' } ]
```

## Advanced

### Multiple Factories

There is no single, global factory. Generally you will just need one factory for your
code, but it's easy to create more with `new TestPantry()`.


### Factory Conveniences

Most factory libraries support an `afterCreate` method, for making changes to your objects
before they are returned. Test Pantry allows any number of methods or object literals to be 
chained together to make your factory. Each method is given the object returned from 
the previous factory methods:

```javascript
pantry.recipeFor( 'person',
                  function() { return { first: 'Jennie', last: 'Lou' } },
                  function(o) { o.fullName = `${o.first} ${o.last}`; return o })
                  
pantry.person() // => { first: 'Jennie', last: 'Lou', fullName: 'Jennie Lou' }                  
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

  * **`this.random()`** A random float between 0 (inclusive) and 1 (exclusive). This is an alternative to `Math.random`. Sometimes in a test it's useful to use random numbers, but doing so can make writing assertions harder. This method meets you half way: it provides a random series of numbers-- but always the same sequence (based on a controllable seed). See [Random Reset](#random-reset) below
  * **`this.randomInt(6)`** A random integer 0..5. Alias: `rollDie`.
  * **`this.randomInt(6, 10)`** A random integer 6..10
  * **`this.sample('rock', 'paper', 'scissors')`** Return one of the given parameters
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
pantry.num.reset()
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

const assert = function(x) { if (!x) throw "Assertion failure!" }

assert( pantry.randomSequence() == 9)
assert( pantry.randomSequence() == 6)
assert( pantry.randomSequence() == 2)
assert( pantry.randomSequence() == 5)

pantry.randomSequence.reset()   // let's start over

assert( pantry.randomSequence() == 9)
assert( pantry.randomSequence() == 6)
assert( pantry.randomSequence() == 2)
```

For some tests, it may make sense to set the seed before you start:

```
pantry.recipeFor('randomSequence', function() {
  return this.randomInt(1000)
})

// 'test 1'
pantry.randomSequence.reset('foo')
assert( pantry.randomSequence() == 467)
assert( pantry.randomSequence() == 731)

// 'test 2'
pantry.randomSequence.reset('foo')
assert( pantry.randomSequence() == 467)
assert( pantry.randomSequence() == 731)
```

## Legal

Copyright (c) 2016 Andrew J. Peterson
[Apache 2.0 License](https://github.com/ndp/test-pantry/raw/master/LICENSE)
