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

Use `this` context to access `count`, which is a serial number for the object.

```javascript
pantry.recipeFor('has-id', function () {
  return { id : `id-${this.count}` }
})
```

## Usage

```javascript
// my-test.js
import pantry from 'my-pantry'

// use the factory
const myUser = pantry('User')

// The factory function is also attached to the factory as a function
const myUser = pantry.User() or 
               pantry['User']()

// or combine them, to create "traits":
 const myUser = pantry('User', 'Player')

// or Mix-and-match:
 const myUser = pantry('User', 'Player', { gender: 'male' }, 'has-id')
```
Or ask for an array of objects by passing an integer:
```javascript
const myUsers = pantry(10, User)
// or
const myUsers = pantry.User(10)
```


## Legal

Copyright (c) 2016 Andrew J. Peterson
[Apache 2.0 License](https://github.com/ndp/test-pantry/raw/master/LICENSE)
