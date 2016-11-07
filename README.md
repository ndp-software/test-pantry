# Test Pantry  [![Build Status](https://travis-ci.org/ndp-software/test-pantry.svg?branch=master)](https://travis-ci.org/ndp-software/test-pantry)
Easy Test Factories: Your ES Sous Chef

  * natural and simple Javascript syntax and semantics
  * fluid usage, combining factories, traits and functions when defining factories or on usage
  * full featured with traits and after-create functionality
  * predictable ids and other random data

## Installation & Basic Usage

`npm install -D test-pantry`

(Test Pantry is built using **UMD**. It should work in all appropriate environments, but it's currently only tested with node.)

### Define a Factory

```javascript
// my-pantry.js
import TestPantry from 'test-pantry'
 
const pantry = new TestPantry()
```

Your _pantry_ is ready to remember _recipes_ to build objects. Use `recipeFor`, and provide it with a name and with either an object literal:
```javascript
pantry.recipeFor('user', { 
  name: 'Andreas Pepper', 
  email: 'andreas@ndpsoftware.com' 
})
```
 
 or a function:
```javascript
pantry.recipeFor('player', function() { 
  return { score: Math.random() } 
})
```

### Use a Factory

```javascript
// my-test.js
import pantry from 'my-pantry'

pantry('user')  // --> { name: 'Andreas Pepper', email: 'andreas@ndpsoftware.com' }

// alternate call syntax:
pantry.user()   // --> { name: 'Andreas Pepper', email: 'andreas@ndpsoftware.com' }
```

## Features

### Lists
Multiple objects can be created by passing an integer as the first parameter:

```javascript
pantry(3, 'user') // or `pantry.user(10)`
                  //  => [ { name: 'Andreas Pepper', email: 'andreas@ndpsoftware.com' },
                  //       { name: 'Andreas Pepper', email: 'andreas@ndpsoftware.com' },
                  //       { name: 'Andreas Pepper', email: 'andreas@ndpsoftware.com' } ]
```

### Dynamic Object Literals
For factories defined with an object literal, properties expressed as functions are evaluated:

```javascript
pantry.recipeFor('keyed', { key: () => Math.random() })
```

### After-Build Functions

When defining a factory, an "after-create" function can be provided to post-process the created objects before they are returned:

```javascript
pantry.recipeFor( 'person',
                  function() { return { first: 'Jennie', last: 'Lou' } },
                  function(o) { o.fullName = `${o.first} ${o.last}`; return o })
                  
pantry.person() // --> { first: 'Jennie', last: 'Lou', fullName: 'Jennie Lou' }                  
```                 

In fact, Test Pantry allows any number of methods or object literals to be 
chained together to define a factory. Each method is given the object returned from 
the previous factory method.


### Traits
Factories can be considered **traits** and combined as needed. Results of multiple factories are merged:

```javascript
pantry('user', 'player') // => { name: 'Andreas Pepper',
                         //      email: 'andreas@ndpsoftware.com',
                         //      score: 0.6207161337323834 }
```
Although you'll want to put some thought and perhaps use a naming scheme, mix and match as many as you like:

```javascript
pantry('user', 'player', { gender: 'male' }, 'keyed')
   // => { name: 'Andreas Pepper',
   //      email: 'andreas@ndpsoftware.com',
   //      score: 0.20819184742637864,
   //      gender: 'male',
   //      key: 0.652420063866042 }
```
### Providing Defaults or Overrides

TBD

### Sequences
Factories defined with functions will receive a convenience utilities attached to `this` context. The value `this.name` is the name of the factory being used, and `this.count` is a serial number of the object. With these, it's easy to build a standard serial number sequence:

```javascript
pantry.recipeFor('has-id', function () {
  return { id : `${this.name}-${this.count}` }
})
pantry('has-id') // --> { id : 'has-id-1' }
```
Since `name` is dynamic, it will change in a different factory context:

```javascript
pantry.recipeFor('book', {}, 'has-id')
pantry('book') // --> { id : 'book-1' }
```

### Generating Random Data

The `this` context provides functions for generating random data:

#### `this.randomInt` (alias `this.rollDie`)

Given an integer `n`, returns a random integer from `0` to `n-1`. Given two integers, returns a random integer from the first to the second, evenly distributed.
```javascript
pantry.recipeFor('randomSequence', function() {
  return this.randomInt(10)
})

pantry.randomSequence() // --> 9
pantry.randomSequence() // --> 6
pantry.randomSequence() // --> 2
pantry.randomSequence() // --> 5
...
```

#### `this.random()`

Returns a random float between 0 (inclusive) and 1 (exclusive). 

This is an alternative to `Math.random`. Sometimes in a test it's useful to use random numbers, but doing so can make writing assertions difficult. This method meets you half way: it provides a random series of numbers-- but always the same sequence (based on a controllable seed). See [Random Reset](#random-reset) below

#### `this.sample()`

Return one of the given parameters. For example: `this.sample('rock', 'paper', 'scissors')`

#### `this.flipCoin()`
Returns a boolean, `true` or `false`.


For more variety of random functions, use a package like [Faker](https://www.npmjs.com/package/faker)


### Defining Object Networks

When working with data models, you'll have one object refer to another object. There are several techniques to create these from factories:
  
1. The simplest is to create related objects in the factory:
  
    ```javascript
    pantry.recipeFor('school', {})
    pantry.recipeFor('teacher', { school: pantry.school })
    ```
    This works, until you need several objects to share a reference. The teacher factory above will create a new school for each teacher object. 

2. This can be fixed by overriding a value during factory usage. Using the same factories:
    ```javascript
    const school = pantry.school()
    pantry(5, 'teacher', { school }) // only one school
    // or
    pantry(5, 'teacher', { school: pantry.school })
    ```
    This works, but _requires the user of the factory to do something special_. This is not ideal.

3. To move this behavior into the factory, Test Pantry provides a function `this.last`, which remembers the previous object created:
    
    ```javascript
    pantry.recipeFor('teacher', { school: pantry.last('school') })
    pantry.school() // make a school
    pantry(5, 'teacher') // all part of `school`
    ```
    The `last` function returns a function that returns the last object created. 
 
4. If there is no previous object, *`last` will create one*. This allows the consuming factory to function without having special prerequisites. This code works fine:
    
    ```javascript
    pantry.recipeFor('teacher', { school: pantry.last('school') })
    pantry(5, 'teacher') // all part of one `school`
    ```

Note that `factory.last` is also available as `this.last()` within the factory function context.

## Advanced Usage

### Multiple Factories

There is no single, global factory. Generally you will just need one factory for your
code, but it's easy to create more with `new TestPantry()`.

### Factory functions

If you'd rather not export a factory that generates different types of objects, you can export individual functions. The individual factory functions are available and work independently. In fact, `recipeFor` returns the factory function:
```
const unicornFactory = pantry.recipeFor('unicorn', {})
//...
const myUnicorn = unicornFactory()
```

### Count reset

The `count` can be reset, which is useful so that a test always gets the 
 same mocked data. This is done calling the `reset` function on the specific factory:

```javascript
pantry.recipeFor('num', function() { return this.count  })

pantry.num() // --> 1
pantry.num() // --> 2
pantry.num() // --> 3
pantry.num.reset()
pantry.num() // --> 1
```

### Random Reset

The pseudo random number generators included as designed to provide random--
but repeatable-- sequences. This is done by explicitly seeding a pseudo random number
generator (PRNG). This is done for you, and each factory has its own sequence, but the factory has `reset` method that re-seeds.

Here's an example:

```javascript
pantry.recipeFor('randomSequence', function() {
  return this.randomInt(10)
})

pantry.randomSequence() // --> 9
pantry.randomSequence() // --> 6
pantry.randomSequence() // --> 2
pantry.randomSequence() // --> 5

pantry.randomSequence.reset()   // let's start over

pantry.randomSequence() // --> 9
pantry.randomSequence() // --> 6
pantry.randomSequence() // --> 2
```

For some tests, it makes sense to set the seed before you start. This may make sense in a `before` block:

```javascript
pantry.recipeFor('randomSequence', function() {
  return this.randomInt(1000)
})

// 'test 1'
pantry.randomSequence.reset('foo')
pantry.randomSequence() // --> 467
pantry.randomSequence() // --> 731

// 'test 2'
pantry.randomSequence.reset('foo')
pantry.randomSequence() // --> 467
pantry.randomSequence() // --> 731
```

## Reference

The following are available within a factory context:

  * **`this.count`** an index of which execution of the factory this is
  * **`this.flipCoin()`** A boolean, true or false
  * **`this.last(name)`** a function that returns the last generated object of factory `name`. If there is is no object yet, it will build one.
  * **`this.name`** the name of the main factory generating objects. If a factory is an aggregate of several factories, it will be the first definition that defines the name.
  * **`this.pantry`** reference to the pantry itself. Useful if the same function is shared between different pantries.
  * **`this.random()`** A random float between 0 (inclusive) and 1 (exclusive). This is an alternative to `Math.random`. Sometimes in a test it's useful to use random numbers, but doing so can make writing assertions harder. This method meets you half way: it provides a random series of numbers-- but always the same sequence (based on a controllable seed). See [Random Reset](#random-reset) below
  * **`this.randomInt(6)`** A random integer 0..5. Alias: `rollDie`.
  * **`this.randomInt(6, 10)`** A random integer 6..10
  * **`this.sample('rock', 'paper', 'scissors')`** Return one of the given parameters


## Legal

Copyright (c) 2016 Andrew J. Peterson
[Apache 2.0 License](https://github.com/ndp/test-pantry/raw/master/LICENSE)


## Documentation Todo

* document Extend a factory
* pass in a param to generate N of some child object
* parameterized factories
