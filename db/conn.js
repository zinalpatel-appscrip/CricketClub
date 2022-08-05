const { MongoClient } = require('mongodb')
const url = "mongodb://localhost:27017"
const client = new MongoClient(url)

async function dbConnect(tableName){
    let result = await client.connect()
    let db = result.db('cricketData')
    // console.log(tableName)
    return db.collection(tableName)
}

module.exports = dbConnect