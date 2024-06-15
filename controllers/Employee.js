const express = require('express');
const Employee = require('../Schema/Employee');
const Sales = require('../Schema/Orders');
const Mail = require('../Email/Mail')
const router = express.Router();
const Admin = require('../Schema/Admin')
const authGuard = require('../middleware/auth-middleware');
const admin = require('../Schema/Admin')

const sequence = require('../middleware/CounterSequence');
const Orders = require('../Schema/Orders');
const EmailDetails = require('../Email/EmailDetails')


// router.post('/approve-and-member',async(req,res)=>{
//    try {
//     const id = req.body.id
//     const status = req.body.isApproved
//     if(status){
//     let number =await sequence("empCode")
//     const SelectAdmin = await admin.find({"_id":id})
//     const newEmployee = await Employee.create(SelectAdmin)
//     let jobtitle = newEmployee.role
//     const email = newEmployee.emailId
//     const department = {
//         directSalesTeam: 'direct-sales-team',
//         directPartnerSalesTeam: 'direct-partner-sales-team',
//         channelPartnerSalesTeam: 'channel-partner-sales-team'
//     }
//     let departmentPrefix = '';
//     if(newEmployee.department === department.directSalesTeam) {
//         departmentPrefix = 'TNDE';
//     } else if(newEmployee.department === department.directPartnerSalesTeam) {
//         departmentPrefix = 'TNDP';
//     } else {
//         departmentPrefix = 'TNCP';  
//     }
//     let jobPrefix = '';
//     let jobArray = [];
//     jobArray = jobtitle.split('-');
//     jobArray.forEach((obj) => {
//         jobPrefix += (jobArray.length === 1) ? obj.substring(0, 2).toUpperCase() : obj[0].toUpperCase();
//     })
//     // let empid =  jobtitle.toUpperCase().substring(0,3)+String(number).padStart(6,'0')
//     let empid = `${departmentPrefix}${jobPrefix}${String(number).padStart(4,'0')}`;
//     newEmployee.password = newEmployee.firstName
//     newEmployee.empCode = empid
//     //newEmployee.save()
//     // const savedEmployee = a
//     // const savedEmployee = await newEmployee.save()
//     Mail(email,process.env.Subject,process.env.Body)
// }
// else{
//     const reject = await admin.deleteOne({_id:id})
// }

//     //Approval(newEmployee.empCode)
    
//    // Mail(req.body.personalInformation.emailId)
//    res.status(200).json({"status":true,"message":"success","content":null})
//    } catch (error) {
//     res.status(500).json({"status":false,"message":"Failed","content":null})
   
//    }

    
// })

router.post('/approve-and-add-member',authGuard, async (req, res) => {

  try {
    
      const { id, isApproved: status } = req.body;
      const [selectedAdmin] = await admin.find({ "_id": id });

      if (status) {
          const number = await sequence("empCode");
          

          if (!selectedAdmin) {
              return res.status(404).json({ status: false, message: "Admin not found", content: null });
          }

          const newEmployee = await Employee.create(selectedAdmin.toObject());
          const { role: jobTitle, emailId: email, department: dept, firstName } = newEmployee;

          // const departmentPrefixes = {
          //     'direct-sales-team': 'TNDE',
          //     'direct-partner-sales-team': 'TNDP',
          //     'channel-partner-sales-team': 'TNCP'
          // };

          // const departmentPrefix = departmentPrefixes[dept] || 'TNCP';

          // const jobPrefix = jobTitle.split('-')
          //     .map(part => part.length === 1 ? part.toUpperCase() : part.substring(0, 2).toUpperCase())
          //     .join('');

          // const empCode = `${departmentPrefix}${jobPrefix}${String(number).padStart(4, '0')}`;
          const empCode = `SEC${String(number).padStart(7,'0')}`
          newEmployee.password = empCode;
          newEmployee.empCode = empCode;

          const body = `Dear ${newEmployee.firstName}\n\nWelcome to MathTutee! We are excited to have you join our team as a ${jobTitle}. Your skills and experience will be a valuable addition to our company\n\nPlease use below credentials to login\nEmpCode = ${empCode} \nPassword = ${empCode}\n\nIf you have any issues with login please contact your reporting manager or send your queries to below emailId ${EmailDetails.FromAddress} \n\nRegards,\nSalesAdmin`
          const subject = "Onboarding is successfull"

          await newEmployee.save();

         Mail(email, subject, body);
      } 
          await admin.deleteOne({ "_id": id });

          if(status == false){
          
            const rejectionMessage = `
            Dear ${selectedAdmin.firstName},

            We regret to inform you that your recruitment request for the role of ${selectedAdmin.role} in the ${selectedAdmin.department} department has been rejected. 

            After careful consideration, our recruitment team has determined that we are unable to proceed with this request at this time. 

            Request Details:
            Role: ${selectedAdmin.role}
            Department: ${selectedAdmin.department}
            Requested By: ${selectedAdmin.referedBy}

            If you have any questions or need further clarification, please do not hesitate to reach out to us at ${EmailDetails.FromAddress}. We are here to assist you and discuss any concerns you may have.

            Thank you for your understanding.

            Best regards,
            Sales Team
`
          const emailSubject = `Recruitment Request for ${selectedAdmin.role} - Rejection Notice`;
          Mail(selectedAdmin.emailId, emailSubject, rejectionMessage);
          }
          res.status(200).json({ status: true, message: "success", content: null });
      
  } catch (error) {
      console.error(error);
      res.status(500).json({ status: false, message: "Failed", content: null });
  }
});
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
        date.setDate(date.getDate() + 1)
        const empcode = req.body.empCode
        const nextDate = new Date(date)
        nextDate.setDate(nextDate.getDate() + 1)
       let points=0
        

        
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
        
        if(result.length > 0){
            points =  Number(result[0].totalPoints)
        }
        

        res.status(200).json({"status":true,"message":"success","content":{points:points, soldTo:sales}})
    } catch (error) {
        res.status(500).json({"status":false,"message":"Failed","content":error.message})
    }
    
})

router.post('/get-order-by-month',authGuard,async(req,res)=>{
    try {
        const empCode = req.body.empCode
        const month = req.body.month
        const year = req.body.year
        let points = 0

        const sales =await Sales.find({"empCode":empCode,"orderMonth":month, "orderYear":year})

        const results = await Orders.aggregate([
            {
              $match: { empCode:empCode,
                        orderMonth:month,orderYear:year
               }, // Filter by empCode
            },
            {
              $group: {
                _id: { month: "$orderMonth", year: "$orderYear" }, // Group by month and year
                totalOrders: { $sum: 1 },
                totalOrderAmount: { $sum: { $toDouble: "$orderTotal" } },
                totalDiscountAmount: { $sum: { $toDouble: "$discountAmount" } },
                totalNetAmount: { $sum: { $toDouble: "$netAmount" } },
                totalPoints: { $sum: "$points" } // Push all documents for the month
              },
            },
          ]);
          if(results.length > 0){
            points =  Number(results[0].totalPoints)
          }

        

        res.status(200).json({"status":true,"message":"success","content":{"Points":points,SoldTo:sales}})
        
    } catch (error) {
        res.status(500).json({"status":false,"message":"Failed","content":error.message})
    }
})

router.post('/get-order-by-quarter',authGuard,async(req,res)=>{

    const empCode = req.body.empCode
        const quarter = req.body.quarter
        const year = req.body.year
        let points = 0
        try{

        const sales =await Sales.find({"empCode":empCode,"orderQuarter":quarter, "orderYear":year})

        const results = await Orders.aggregate([
            {
              $match: { empCode:empCode,
                orderQuarter:quarter,orderYear:year
               }, // Filter by empCode
            },
            {
              $group: {
                _id: { year: "$orderQuarter"}, // Group by month and year
                totalOrders: { $sum: 1 },
                totalOrderAmount: { $sum: { $toDouble: "$orderTotal" } },
                totalDiscountAmount: { $sum: { $toDouble: "$discountAmount" } },
                totalNetAmount: { $sum: { $toDouble: "$netAmount" } },
                totalPoints: { $sum: "$points" } // Push all documents for the month
              },
            },
          ]);

          if(results.length > 0 ){
            points =  Number(results[0].totalPoints)
          }
        res.status(200).json({"status":true,"message":"success","content":{"Points":points,SoldTo:sales}})
        
    } catch (error) {
        res.status(500).json({"status":false,"message":"Failed","content":error.message})
        console.log(error)
    }

})

router.post('/get-order-by-year',authGuard,async(req,res)=>{

    const empCode = req.body.empCode
        const year = req.body.year
        let points = 0
        try{

        const sales =await Sales.find({"empCode":empCode,"orderYear":year})

        const results = await Orders.aggregate([
            {
              $match: { empCode:empCode,
                orderYear:year
               }, // Filter by empCode
            },
            {
              $group: {
                _id: { year: "$orderYear"}, // Group by month and year
                totalOrders: { $sum: 1 },
                totalOrderAmount: { $sum: { $toDouble: "$orderTotal" } },
                totalDiscountAmount: { $sum: { $toDouble: "$discountAmount" } },
                totalNetAmount: { $sum: { $toDouble: "$netAmount" } },
                totalPoints: { $sum: "$points" } // Push all documents for the month
              },
            },
          ]);

          if(results.length>0){
            points =  Number(results[0].totalPoints)
          }
        res.status(200).json({"status":true,"message":"success","content":{"Points":points,SoldTo:sales}})
        
    } catch (error) {
        res.status(500).json({"status":false,"message":"Failed","content":error.message})
        console.log(error)
    }

})


router.post('/get-my-sales-summary',authGuard,async(req,res)=>{
  try {
      const today = new Date();
      const nextDate = new Date()
      const empcode = req.body.empCode
      
      nextDate.setDate(nextDate.getDate() - 7)

      const result = await Sales.aggregate([
        {
            $match: {
                "empCode":empcode,
                orderDate: { $gte: nextDate, $lt: today }
            }
        },
        {
            $group: {
                _id: { $dateToString: { format: "%Y-%m-%d", date: "$orderDate" } },
                totalPoints: { $sum: "$points" }
            }
        },
        {
            $sort: { "_id": 1 }
        }
    ]);
      
      res.status(200).json({"status":true,"message":"success","content":result})
  } catch (error) {
      res.status(500).json({"status":false,"message":"Failed","content":null})
      console.log(error)

  }
})

router.post('/get-my-monthly-sales-summary',authGuard,async(req,res)=>{
    try{
        const empcode = req.body.empCode      
          const results = await Orders.aggregate([
            {
              $match: { empCode:empcode }, // Filter by empCode
            },
            {
              $group: {
                _id: { month: "$orderMonth", year: "$orderYear" }, // Group by month and year
                totalOrders: { $sum: 1 },
                totalOrderAmount: { $sum: { $toDouble: "$orderTotal" } },
                totalDiscountAmount: { $sum: { $toDouble: "$discountAmount" } },
                totalNetAmount: { $sum: { $toDouble: "$netAmount" } },
                totalPoints: { $sum: "$points" } // Push all documents for the month
              },
            },
          ]);
          
          const formattedResult = results.map(record=>({
                orderMonth:record._id.month,
                orderYear:record._id.year,
                totalOrders:record.totalOrders,
                totalOrderAmount:record.totalOrderAmount,
                totalDiscountAmount:record.totalDiscountAmount,
                totalNetAmount:record.totalNetAmount,
          }));

          console.log(formattedResult)

        res.status(200).json({"status":true,"message":"success","content":formattedResult})
    }
    catch(err){
        res.status(500).json({"status":true,"message":"success","content":null})
        console.log(err)
    }
})

router.post('/get-my-yearly-sales-summary',authGuard,async (req,res)=>{
    try {
        const empcode = req.body.empCode      
          const results = await Orders.aggregate([
            {
              $match: { empCode:empcode }, // Filter by empCode
            },
            {
              $group: {
                _id: {  year: "$orderYear" }, // Group by month and year
                totalOrders: { $sum: 1 },
                totalOrderAmount: { $sum: { $toDouble: "$orderTotal" } },
                totalDiscountAmount: { $sum: { $toDouble: "$discountAmount" } },
                totalNetAmount: { $sum: { $toDouble: "$netAmount" } },
                totalPoints: { $sum: "$points" } // Push all documents for the month
              },
            },
          ]);

          const formattedResult = results.map(record=>({
            orderYear:record._id.year,
            totalOrders:record.totalOrders,
            totalOrderAmount:record.totalOrderAmount,
            totalDiscountAmount:record.totalDiscountAmount,
            totalNetAmount:record.totalNetAmount,
      }));

          res.status(200).json({"status":true,"message":"success","content":formattedResult})
    } catch (error) {
        res.status(500).json({"status":true,"message":"success","content":null})
        console.log(err)
    }
})

router.post('/get-my-quarterly-sales-summary',authGuard,async (req,res)=>{
    try {
        const empcode = req.body.empCode      
          const results = await Orders.aggregate([
            {
              $match: { empCode:empcode }, // Filter by empCode
            },
            {
              $group: {
                _id: {  year: "$orderQuarter" }, // Group by month and year
                totalOrders: { $sum: 1 },
                totalOrderAmount: { $sum: { $toDouble: "$orderTotal" } },
                totalDiscountAmount: { $sum: { $toDouble: "$discountAmount" } },
                totalNetAmount: { $sum: { $toDouble: "$netAmount" } },
                totalPoints: { $sum: "$points" } // Push all documents for the month
              },
            },
          ]);

          const formattedResult = results.map(record=>({
            quarter:record._id.year,
            totalOrders:record.totalOrders,
            totalOrderAmount:record.totalOrderAmount,
            totalDiscountAmount:record.totalDiscountAmount,
            totalNetAmount:record.totalNetAmount,
      }));

          res.status(200).json({"status":true,"message":"success","content":formattedResult})
    } catch (error) {
        res.status(500).json({"status":true,"message":"success","content":null})
        console.log(err)
    }
})

router.post('/GetOrderByMonth',authGuard,async(req, res)=>{
    try {
        
        const sales = await Sales.find().exec()
        res.json(sales);
    } catch (error) {
        res.status(500).json({message:"Order Not Added"+err})
    }
    
})

router.post('/get-my-direct-team',async (req,res)=>{
  try{
      const refferals = await Employee.find({referalId:req.body.empCode},{"_id":0,"empCode":1,"firstName":1,"mobileNo":1,"area":1,"zone":1,"state":1,"Points":1,"TeamPoints":1,"role":1,"region":1,"department":1}).exec();

      const formattedResult = refferals.map(record => ({
          empCode: record.empCode,
          name:record.firstName,
          mobileNo:record.mobileNo,
          area:record.area,
          zone:record.zone,
          region: record.region,
          state:record.state,
          role:record.role,
          department:record.department,
          
          points:Number(record.Points),
          teamPoints: Number(record.TeamPoints),
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
