import assert from 'assert'
import volatile from '../src/database/volatile'

const storage = {
  locations: [],
  entries: [],
}

const db = volatile(storage)

export const addCityNoRegion = async () => {
  await db.addCity('Barcelona', 'SP', 1, 'Catalonia')
  await db.addCity('Madrid', 'SP', 2, '')
  const location = await db.getLocation('Barcelona', 'city')
  assert(location.city === 'Barcelona', `Expected city name to be 'Barcelona', got ${location.city}`)
  assert(location.country === 'SP', `Expected city country to be 'SP', got ${location.country}`)
  assert(location.population === 1, `Expected city population to be 1, got ${location.population}`)
  assert(location.region === 'Catalonia', `Expected city region to be 'Catalonia', got ${location.region}`)
}

export const getLocationByRegion = async () => {
    const location = await db.getLocation('Catalonia', 'region')
    assert(location !== undefined, 'Expected city to be found')
    assert(location.city === 'Barcelona', `Expected city name to be 'Barcelona', got ${location.city}`)
}

export const getLocationByCountry = async () => {
    const location = await db.getLocation('SP', 'country')
    assert(location !== undefined, 'Expected city to be found')
    assert(location.city === 'Barcelona', `Expected city name to be 'Barcelona', got ${location.city}`)
}

export const updateCases = async () => {
  const location = await db.getLocation('Barcelona', 'city')
  db.updateCases(location.city, 10, 1)
  assert(storage.entries.length === 1, `Expected 1 entry, got ${storage.entries.length}`)
  assert(storage.entries[0].city === 'Barcelona', `Expected city to be 'Barcelona', got ${storage.entries[0].city}`)
  assert(storage.entries[0].cases === 10, `Expected 10 cases, got ${storage.entries[0].cases}`)
}

export const getCasesBetweenDates = async () => {
  const location = await db.getLocation('Barcelona', 'city')
  db.updateCases(location.city, 10, 2)

  const report = await db.incidenceBetweenDates('Barcelona', 'city', 1, 2)
  assert(report.totalCases === 20, `Expected 20 cases, got ${report.totalCases}`)
  assert(report.totalDays === 2, `Expected totalDays to be 2, got ${report.totalDays}`)
  assert(report.fromEpoch === 1, `Expected fromEpoch to be 1, got ${report.fromEpoch}`)
  assert(report.toEpoch === 2, `Expected toEpoch to be 2, got ${report.toEpoch}`)
}
