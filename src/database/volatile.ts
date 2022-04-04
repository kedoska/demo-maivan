import { Location, Entry, FilterType, Model } from '../model'

export interface Storage {
  locations: Location[]
  entries: Entry[]
}

let storage: Storage = {
  locations: [],
  entries: [],
}

export default (initialState?: Storage): Model => {
  if (initialState) {
    const { locations = [], entries = [] } = initialState
    storage = { locations, entries }
  }

  const filterBy = (prop: FilterType, value: string) => (location: Location) => location[prop] === value

  return {
    addCity: async (city: string, country: string, population: number, region?: string) => {
      storage.locations.push({
        city,
        country,
        population,
        region,
      })
    },
    getLocation: async (name: string, segment: FilterType) => storage.locations.find(filterBy(segment, name)),
    updateCases: async (name: string, cases: number, epoch: number) => {
      const location = storage.locations.find(({ city }) => city === name)
      if (!location) {
        throw new Error(`City ${name} not found`)
      }
      storage.entries.push({
        city: location.city,
        cases,
        epoch,
      })
    },
    incidenceBetweenDates: async (name: string, segment: FilterType, fromEpoch: number, toEpoch: number) => {
      const locations = storage.locations.filter(filterBy(segment, name))
      if (!locations.length) {
        throw new Error(`${segment} ${name} not found`)
      }

      const entries = storage.entries.filter(
        (entry) =>
          entry.epoch >= fromEpoch && entry.epoch <= toEpoch && locations.map((x) => x.city).includes(entry.city),
      )

      const population = locations.reduce((acc, { population }) => acc + population, 0)
      const totalDays = entries.reduce((acc, { epoch }) => {
        if (acc.includes(epoch)) {
          return acc
        }
        return [...acc, epoch]
      }, []).length
      const totalCases = entries.reduce((acc, entry) => acc + entry.cases, 0)
      const incidenceRate = (totalCases / population) * 100000
      const location = {
        ...locations[0],
        population,
      }
      return {
        location,
        fromEpoch,
        toEpoch,
        totalDays,
        totalCases,
        incidenceRate,
      }
    },
    // incidenceByDate: async (name: string, segment: FilterType, epoch: number) => {
    //   const locations = storage.locations.filter(filterBy(segment, name))
    //   if (!locations.length) {
    //     throw new Error(`${segment} ${name} not found`)
    //   }

    //   const entries = storage.entries.filter(
    //     (entry) =>
    //       entry.epoch === epoch && locations.map((x) => x.city).includes(entry.city),
    //   )

    //   const population = locations.reduce((acc, { population }) => acc + population, 0)
    //   const totalDays = entries.reduce((acc, { epoch }) => {
    //     if (acc.includes(epoch)) {
    //       return acc
    //     }
    //     return [...acc, epoch]
    //   }, []).length
    //   const totalCases = entries.reduce((acc, entry) => acc + entry.cases, 0)
    //   const incidenceRate = (totalCases / population) * 100000
    //   const location = {
    //     ...locations[0],
    //     population,
    //   }
    //   return {
    //     location,
    //     fromEpoch: epoch,
    //     toEpoch: epoch,
    //     totalDays,
    //     totalCases,
    //     incidenceRate,
    //   }
    // },
    getCases: async (name: string, fromEpoch: number, toEpoch: number, region?: string) => {
      throw new Error('Not implemented')
    },
  }
}
