const express = require('express');
const app = express();
require('dotenv').config();
require('./db');
const PORT = process.env.PORT || 8080;
const productRoutes = require('./routes/productRoutes');
const userRoutes = require('./routes/userRoutes');
const admin_approval = require('./conrollers/Admin_Approval');
const authorize = require('./conrollers/auth')
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

app.listen(8080, () => {
    console.log('Server is listenin on PORT :' + PORT);
})