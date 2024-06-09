const express = require('express')
const authGuard = require('../middleware/auth-middleware');
const Users = require('../Schema/Employee')
const jwt = require('jsonwebtoken');
const router = express.Router();
const Mail = require('../Email/Mail');

require('dotenv').config()


router.get('', (req, res) => {res.send('Works Fine')});


router.get('/all-users', authGuard, async (req, res) => {
    try {
        const users = await Users.find({}).exec();
        res.json(users);
    } catch (err) {
        res.status(500).json({ error: 'Error fetching users' });
    }
});

router.post('/authorize', async (req, res) => {
    const empCode = req.body.empCode
    const password = req.body.password
    let token=null;
    let role;
    let region,state,area;

    try {
        const user = await Users.findOne({ empCode:empCode }).exec();
        const name = user.firstName
         
        let jwtSecretKey = process.env.JWT_SECRET_KEY;
        
        if (!user) {
            return res.status(400).send({status: 'False',message: 'User not found'});
        }
        else if (user.password!==  password) {
            return res.status(400).send({status: 'False',message: 'Invalid Password'});
        }
        else if (user.password ===  password) {
        token = jwt.sign({ userId: user._id },jwtSecretKey , {
          expiresIn: '2h' // Token expiration time (e.g., 2 hour)
          
      });
      role = user.role
      region = user.region
      state = user.state
      area = user.area

    }
        res.status(200).json({status:true,message:'Success',content:{
            // "name":name,
            //  "empCode":empCode,
            "token":token,
            // "role":role,
            // "region":region,
            // "state":state,
            // "area":area,
            ...user._doc

        } });
    } catch (err) {
        res.status(500).json({"status":false,"message":"Failed","content":null})
        console.log(err.message)
    }
});

router.post('/forget-password',async(req,res)=>{
    const email = req.body.emailId
    try{
        const user = await Users.findOne({'personalInfo.emailId':email}).exec()
        if(!user){
            res.status(200).json({"status": false,"message":"User Not Found","content":null});
        }
        else{
            Mail(email,process.env.PasswordSubject,process.env.PasswordReset)
            res.status(200).json({"status":true,"message":"success","content":null})
        }
    }
    catch(err){
        res.status(500).json({"status":false,"message":"Failed","content":null})
    }
})

router.post('/reset-password',async(req,res)=>{
    const email = req.body.emailId
    const password = req.body.password
    try{
        const user = await Users.findOne({'personalInfo.emailId':email}).exec()
        if(!user){
            res.status(200).json({"status":false,"message":"User Not Found","content":null});
        }
        else{
            user.password =  password
            user.save()
            res.status(200).json({"status":true,"message":"success","content":null})
        }
    }
    catch(err){
        res.status(500).json({"status":false,"message":"Failed","content":null})
    }
})


module.exports = router;
