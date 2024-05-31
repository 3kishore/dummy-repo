const express = require('express');
const Employee = require('../Schema/Employee');
const Sales = require('../Schema/Orders');
const Mail = require('../Email/Mail')
const router = express.Router();
const Admin = require('../Schema/Admin')
const authGuard = require('../middleware/auth-middleware');

const sequence = require('../middleware/CounterSequence')

router.post('/approve-and-member',async(req,res)=>{
   try {
    let number =await sequence("empCode")
    const newEmployee = await Employee.create(req.body)
    let jobtitle = newEmployee.appliedFor
    const email = newEmployee.personalInfo.emailId
    let empid =  jobtitle.toUpperCase().substring(0,3)+String(number).padStart(6,'0')
    newEmployee.password = newEmployee.personalInfo.name
    newEmployee.empCode = empid
    const savedEmployee = await newEmployee.save()
    Mail(email,process.env.Subject,process.env.Body)

    Approval(newEmployee.empCode)
    
   // Mail(req.body.personalInformation.emailId)
   res.status(200).json({"status":true,"message":"success","content":null})
   } catch (error) {
    res.status(500).json({"status":false,"message":"Failed","content":null})
   }

    
})



router.post('/addOrder',async(req,res)=>{
    try{
    const newOrder = await Sales.create(req.body)
    .then(()=>{
        res.status(200).json({message:"Order Added Successfully"})
    })
    .catch((err)=>{
        res.status(500).json({message:"Order Not Added"+err})
    })
}
catch(err){
    console.log(err)
}
})

router.post('/get-order-by-date',async(req, res)=>{
    try {
        const date = new Date(req.body.date)
        const empcode = req.body.empCode
        const nextDate = new Date(date)
        nextDate.setDate(nextDate.getDate() + 1)

        
        const sales = await Sales.find({orderDate:{ $gte:date,$lte:nextDate},"empCode":empcode})

        const result = await Sales.aggregate([
            {
                $match: {
                    empCode: empcode,
                    orderDate: { $gte: date, $lt: nextDate }
                }
            },
            {
                $group: {
                    _id: "$empCode",
                    totalPoints: { $sum: "$points" }
                }
            }
        ]);
        
        
        let points =  Number(result[0].totalPoints)

        res.status(200).json({"status":true,"message":"success","content":{"Points":points,SoldTo:sales}})
    } catch (error) {
        res.status(500).json({"status":false,"message":"Failed","content":error.message})
    }
    
})


router.post('/get-my-sales-summary',async(req,res)=>{
    try {
        const today = new Date();
        const nextDate = new Date()
        const empcode = req.body.empCode
        
        nextDate.setDate(nextDate.getDate() - 7)

        const result = await Sales.aggregate([
            {$match: {
                "empCode": empcode,
                orderDate: { $gte: nextDate, $lt: today}
            }},
            {$group: {
                _id: { $dateToString: { format: "%Y-%m-%d", date: "$orderDate" } },
                totalPoints: { $sum: "$points" }
            }}
        ]);
        
        res.status(200).json({"status":true,"message":"success","content":result})
    } catch (error) {
        res.status(500).json({"status":false,"message":"Failed","content":null})
    }
})

router.get('/GetOrderByMonth',async(req, res)=>{
    try {
        const sales = await Sales.find({orderDate:{ $gte:req.query.FromDate,$lte:req.query.ToDate}}).exec()
        res.json(sales);
    } catch (error) {
        res.status(500).json({message:"Order Not Added"+err})
    }
    
})

router.get('/get-my-direct-team',authGuard,async (req,res)=>{
    try{
        const refferals = await Employee.find({referedBy:req.query.empCode},{"_id":0,"empCode":1,"personalInfo":{"name":1,"mobileNo":1},"address.current.postOffice":1,"points":1}).exec();
        res.status(200).json({"status":true,"message":"success","content":refferals})
    }
    catch (error) {
        res.status(500).json({"status":false,"message":"Failed","content":null})
    }
})

const Approval = async(empcode)=>{
    const newapproval = await Admin.findOne({'empCode':empcode}).exec()
    if(newapproval){
        newapproval.IsApproved = true
        await newapproval.save()
    }

}

module.exports = router;
