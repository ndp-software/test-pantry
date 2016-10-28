import seedrandom from 'seedrandom'

export default function(name, seed) {
  const random = seedrandom(seed)

  // Returns a random integer between min (included) and max (excluded)
  // Using Math.round() will give you a non-uniform distribution!
  function randomInt(a, b) {
    let [min,max] = [a, b]
    if (max == undefined) {
      [min,max] = [0, min]
    }
    min = Math.ceil(min);
    max = Math.floor(max);
    return Math.floor(random() * (max - min)) + min;
  }

  function flipCoin() {
    return random() > 0.5
  }

  function sample(...args) {
    const a = args[0] && args.length == 1 && Array.isArray(args[0]) ? args[0] : args;
    return a[randomInt(0, a.length)]
  }

  return {
    count:   0,
             name,
             random,
             randomInt,
             flipCoin,
             sample,
    rollDie: randomInt
  }
}
