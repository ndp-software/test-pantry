# test-pantry
Javascript Test Factory Sous Chef

## Installation & Usage

`$ npm install -D test-pantry`

```javascript
// my-pantry.js
import TestPantry from `test-pantry`

export default const pantry = new TestPantry()

pantry.defineRecipe('user', { name: 'Andy P', id: this.count })
...

```

```javascript
// my-test.js
import pantry from 'my-pantry'

// use the factory
const myUser = pantry('user')
```
