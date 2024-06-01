const express = require('express');
const app = express();
const cors = require('cors');
require('dotenv').config();
require('./db');

const PORT = process.env.PORT || 8080;
const admin_approval = require('./controllers/Admin_Approval');
const authorize = require('./controllers/auth');

const employeeController = require('./controllers/Employee');
const tdsController = require('./controllers/TDS');
const viedoCoontroller = require('./controllers/Video');

const allowedOrigins = ['https://pimaths-sales-monitoring-dashboard.vercel.app', 'http://localhost:3000', 'http://localhost:4900'];

// Configure CORS options
const corsOptions = {
  origin: function (origin, callback) {
    // Allow requests with no origin, like mobile apps or curl requests
    if (!origin) return callback(null, true);
    if (allowedOrigins.indexOf(origin) === -1) {
      const msg = 'The CORS policy for this site does not allow access from the specified Origin.';
      return callback(new Error(msg), false);
    }
    return callback(null, true);
  },
  methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
  credentials: true,
  optionsSuccessStatus: 204 // Some legacy browsers (IE11, various SmartTVs) choke on 204
};

// Use the CORS middleware with options
app.use(cors(corsOptions));

app.use(express.json());

app.get('/', (req, res) => {
    res.send('products api running new deploy - 15');
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
