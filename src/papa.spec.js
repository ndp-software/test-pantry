import { expect } from 'chai'


const papa = function (name) {
  return papa[name]()
}

papa.define = (name, values) => {
  let count = 0
  return papa[name] = () => {
    count++
    const result = {}
    Object.keys(values).forEach(function (k) {
      const v   = values[k]
      result[k] = (typeof(v) == 'function') ? v.apply({ count }) : v
    })
    return result
  }
}

describe('papa', function () {

  it('can define and use an empty factory', function () {
    papa.define('myObj', {})

    const result = papa.myObj()
    expect(result).to.eql({})
  })

  it('can return a value', function () {
    papa.define('myObj', { key : 'value' })
    const result = papa.myObj()
    expect(result).to.eql({ key : 'value' })
  })

  it('will return value directly from papa function', function () {
    papa.define('myObj', { key : 'value' })
    const result = papa('myObj')
    expect(result).to.eql({ key : 'value' })
  })

  it('returns the factory method', function () {
    const f      = papa.define('myObj', { key : 'value' })
    const result = f()
    expect(result).to.eql({ key : 'value' })
  })

  it('can express a property as a function', function () {
    const f      = papa.define('myObj', { key : () => 'value' })
    const result = f()
    expect(result).to.eql({ key : 'value' })
  })

  it('can get unique IDs from the context', function () {
    const f       = papa.define('myObj', {
      key : function () {
        return `value-${this.count}`
      }
    })
    const result1 = f()
    const result2 = f()
    expect(result1).not.to.eql(result2)
  })

  it('can refer to another factory method', function () {
    papa.define('room', {
      dimension : 'medium',
      house     : papa('house')
    })
    papa.define('house', { color : 'yellow' })
    const house = papa.house()
    console.log('house', house)
    const rm    = papa('room')
    console.log(rm)
    expect(rm.house).to.eql({ color : 'yellow' })
  })


})