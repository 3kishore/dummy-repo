// const mongoose = require('mongoose');
// require('dotenv').config();
// const db = process.env.ConnectionString

// const connectdb = async () =>{
//     try{
//         await mongoose.connect(db);

//         console.log('Connected to MongoDB');

//     }
//     catch(err){
//         console.log("mongo eroor:", err.message);
//         process.exit(1);
//     }
// };

// module.exports = connectdb;

const mongoose = require('mongoose');
const dbHOST = process.env.ConnectionString;

mongoose.connect(dbHOST)
    .then(() => {
        console.log('MongoDB Connnected...')
    }).catch((err) => {
        console.log('Error while Mongo Conn..', err);
    })