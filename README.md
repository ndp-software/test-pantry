# test-pantry
Javascript Test Factory Sous Chef

## Installation & Usage

`$ npm install -D test-pantry`

## Define your Factory (or Factories)

Create and export factories in a factory file near your tests:
 
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

### Convenience Features

Object literal properties expressed as functions will be evaluated:

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

// or combine them:
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
