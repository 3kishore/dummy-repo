const express = require('express');
const app = express();
// var cors = require('cors');
require('dotenv').config();
require('./db');

const PORT = process.env.PORT || 8080;
const admin_approval = require('./controllers/Admin_Approval');
const authorize = require('./controllers/auth');

const employeeController = require('./controllers/Employee');
const tdsController = require('./controllers/TDS');
const viedoCoontroller = require('./controllers/Video');

// app.use(cors());
app.use(express.json());

app.get('/', (req, res) => {
    res.send('products api running new deploy - 12');
});

app.get('/ping', (req, res) => {
    res.send('PONG')
});

app.use('/admin',admin_approval)

app.use('/auth',authorize)

app.use('/video', viedoCoontroller);

app.use('/employee', employeeController);

app.use('/tds', tdsController);

app.listen(8080, () => {
    console.log('Server is listenin on PORT :' + PORT);
})