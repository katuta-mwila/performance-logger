import knex from 'knex'
import config from './knexfile.js'

//type Environment = 'development' | 'production' | 'test'
//const env = (process.env.NODE_ENV as Environment) || 'development'

const connection = knex(config["production"])

export default connection
