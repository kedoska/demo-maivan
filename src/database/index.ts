import { Model } from '../model'

import volatile from './volatile'

export type Adapter = 'volatile'

export default (adapter: Adapter): Model => {
  switch (adapter) {
    case 'volatile':
      return volatile()
    default:
      throw new Error(`Unknown adapter: ${adapter}`)
  }
}
