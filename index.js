const express = require('express');
const app = express();
require('dotenv').config();
require('./db');
const PORT = process.env.PORT || 8080;
const productRoutes = require('./routes/productRoutes');
const userRoutes = require('./routes/userRoutes');
const admin_approval = require('./conrollers/Admin_Approval');
const authorize = require('./conrollers/auth');

const employeeController = require('./conrollers/Employee');
const tdsController = require('./conrollers/TDS');
const viedoCoontroller = require('./conrollers/Video');
app.use(express.json());

app.get('/', (req, res) => {
    res.send('products api running new deploy - 8');
});

app.get('/ping', (req, res) => {
    res.send('PONG')
});
// /products
app.use('/products', productRoutes);
// /users
app.use('/users', userRoutes);

app.use('/admin',admin_approval)

app.use('/auth',authorize)

app.use('/video', viedoCoontroller);

app.use('/employee', employeeController);

app.use('/tds', tdsController);

app.listen(8080, () => {
    console.log('Server is listenin on PORT :' + PORT);
})