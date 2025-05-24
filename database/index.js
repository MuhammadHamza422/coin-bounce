const mongoose = require("mongoose");
const {MongoDb_Connection_String} = require('../config/index')

const dbConnect = async () =>{
    try {
        const conn = await mongoose.connect(MongoDb_Connection_String)
        console.log(`Database connected to host: ${conn.connection.host}`)
    } catch (error) {
        console.log(`Error: ${error}`)
    }
}

module.exports = dbConnect;
