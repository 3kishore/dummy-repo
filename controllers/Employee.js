const express = require('express');
const Employee = require('../Schema/Employee');
const Sales = require('../Schema/Orders');
const Mail = require('../Email/Mail')
const router = express.Router();
const Admin = require('../Schema/Admin')
const authGuard = require('../middleware/auth-middleware');

const sequence = require('../middleware/CounterSequence')

router.post('/approve-and-member',authGuard,async(req,res)=>{
   try {
    let number =await sequence("empCode")
    const newEmployee = await Employee.create(req.body)
    let jobtitle = newEmployee.appliedFor
    const email = newEmployee.personalInfo.emailId
    const department = {
        directSalesTeam: 'direct-sales-team',
        directPartnerSalesTeam: 'direct-partner-sales-team',
        channelPartnerSalesTeam: 'channel-partner-sales-team'
    }
    let departmentPrefix = '';
    if(newEmployee.department === department.directSalesTeam) {
        departmentPrefix = 'TNDES';
    } else if(newEmployee.department === department.directPartnerSalesTeam) {
        departmentPrefix = 'TNDPS';
    } else {
        departmentPrefix = 'TNCPS';  
    }
    let jobPrefix = '';
    let jobArray = [];
    jobArray = jobtitle.split('-');
    jobArray.forEach((obj) => {
        jobPrefix += obj[0].toUpperCase();
    })
    // let empid =  jobtitle.toUpperCase().substring(0,3)+String(number).padStart(6,'0')
    let empid = `${departmentPrefix}${jobPrefix}${number}`;
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



router.post('/addOrder',authGuard,async(req,res)=>{
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

router.post('/get-order-by-date',authGuard,async(req, res)=>{
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


router.post('/get-my-sales-summary',authGuard,async(req,res)=>{
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

router.get('/GetOrderByMonth',authGuard,async(req, res)=>{
    try {
        const sales = await Sales.find({orderDate:{ $gte:req.query.FromDate,$lte:req.query.ToDate}}).exec()
        res.json(sales);
    } catch (error) {
        res.status(500).json({message:"Order Not Added"+err})
    }
    
})

router.post('/get-my-direct-team',authGuard,async (req,res)=>{
    try{
        const refferals = await Employee.find({referedPersonEmpCode:req.body.empCode},{"_id":0,"empCode":1,"personalInfo":{"name":1,"mobileNo":1},"location":1,"Points":1,"TeamPoints":1}).exec();

        const formattedResult = refferals.map(record => ({
            empCode: record.empCode,
            Name:record.personalInfo.name,
            mobileNo:record.personalInfo.mobileNo,
            Location:record.location,
            Points:Number(record.Points),
            TeamPoints: Number(record.TeamPoints),
        }));

        res.status(200).json({"status":true,"message":"success","content":formattedResult})
    }
    catch (error) {
        res.status(500).json({"status":false,"message":"Failed","content":null})
        console.log(error)
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
