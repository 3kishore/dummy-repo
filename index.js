const express = require('express');
const app = express();
var cors = require('cors');
require('dotenv').config();
require('./db');

const PORT = process.env.PORT || 8080;
const admin_approval = require('./controllers/Admin_Approval');
const authorize = require('./controllers/auth');

const employeeController = require('./controllers/Employee');
const tdsController = require('./controllers/TDS');
const viedoCoontroller = require('./controllers/Video');

const allowedOrigin = 'https://pimaths-sales-monitoring-dashboard.vercel.app'; // Replace with your allowed domain

// Configure CORS options
const corsOptions = {
  origin: allowedOrigin,
  methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
  credentials: true, // Enable Access-Control-Allow-Credentials
  optionsSuccessStatus: 204 // Some legacy browsers (IE11, various SmartTVs) choke on 204
};

// Use CORS middleware with the specified options
app.use(cors(corsOptions));

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