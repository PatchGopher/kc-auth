import postgres from 'postgres'

const sql = postgres({ 
    host: 'localhost', 
    database: 'app',
    user: 'postgres',
    password: 'postgres',
    port: 5432
}) 

export default sql