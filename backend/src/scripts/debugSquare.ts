import 'dotenv/config'
import { env } from '../config/env'
import { isSquareConfigured, getSquareSetupStatus } from '../services/squareClient'

console.log('TOKEN has placeholder:', env.SQUARE_ACCESS_TOKEN?.includes('placeholder'))
console.log('isSquareConfigured:', isSquareConfigured())
console.log('status:', getSquareSetupStatus())
