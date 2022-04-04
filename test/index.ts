import {
  addCityNoRegion,
  getCasesBetweenDates,
  getLocationByRegion,
  updateCases,
} from './voltatile.spec'

const tests = []

const addTest = (name: string, fn: Function) => {
  tests.push({ name, fn })
}

void (async () => {
  addTest('addCityNoRegion', addCityNoRegion)
  addTest('getLocationByRegion', getLocationByRegion)
  addTest('updateCases', updateCases)
  addTest('getCasesBetweenDates', getCasesBetweenDates)

  for (const test of tests) {
    process.stdout.write(`${test.name} ... `)
    try {
      await test.fn()
      process.stdout.write('OK\n')
    } catch (error) {
      process.stdout.write(`${error.message}\n`)
      process.exit(1)
    }
  }
})()
