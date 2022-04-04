export interface Location {
  city: string
  region?: string
  country: string
  population: number
}

export interface Report {
  location: Location
  fromEpoch: number
  toEpoch: number
  totalDays: number
  totalCases: number
  incidenceRate: number
}

export interface Entry {
  city: string
  cases: number
  epoch: number
}

export type FilterType = 'city' | 'country' | 'region'

export interface Model {
  addCity(city: string, country: string, population: number, region?: string): Promise<void>
  getLocation(name: string, segment: FilterType): Promise<Location | undefined>
  updateCases(name: string, cases: number, epoch: number): Promise<void>
  incidenceBetweenDates(name: string, segment: FilterType, fromEpoch: number, toEpoch: number): Promise<Report>
  getCases(name: string, fromEpoch: number, toEpoch: number, region?: string): Promise<number>
}
