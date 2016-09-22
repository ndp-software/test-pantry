import { expect } from 'chai'


const pop = function (name) {
  return pop[name]()
}

pop.define = (name, values) => {
  let count = 0
  return pop[name] = () => {
    count++
    const result = {}
    Object.keys(values).forEach(function (k) {
      const v   = values[k]
      result[k] = (typeof(v) == 'function') ? v.apply({ count }) : v
    })
    return result
  }
}

describe('pop', function () {

  it('can define and use an empty factory', function () {
    pop.define('myObj', {})

    const result = pop.myObj()
    expect(result).to.eql({})
  })

  it('can return a value', function () {
    pop.define('myObj', { key : 'value' })
    const result = pop.myObj()
    expect(result).to.eql({ key : 'value' })
  })

  it('will return value directly from pop function', function () {
    pop.define('myObj', { key : 'value' })
    const result = pop('myObj')
    expect(result).to.eql({ key : 'value' })
  })

  it('returns the factory method', function () {
    const f      = pop.define('myObj', { key : 'value' })
    const result = f()
    expect(result).to.eql({ key : 'value' })
  })

  it('can express a property as a function', function () {
    const f      = pop.define('myObj', { key : () => 'value' })
    const result = f()
    expect(result).to.eql({ key : 'value' })
  })

  it('can get unique IDs from the context', function () {
    const f       = pop.define('myObj', {
      key : function () {
        return `value-${this.count}`
      }
    })
    const result1 = f()
    const result2 = f()
    expect(result1).not.to.eql(result2)
  })

  it('can refer to another factory method', function () {
    pop.define('room', {
      dimension : 'medium',
      house     : pop('house')
    })
    pop.define('house', { color : 'yellow' })
    const house = pop.house()
    console.log('house', house)
    const rm    = pop('room')
    console.log(rm)
    expect(rm.house).to.eql({ color : 'yellow' })
  })


})