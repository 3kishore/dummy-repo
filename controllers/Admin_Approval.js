const express = require('express');
const admin_approval = require('../Schema/Admin');
const router = express.Router();
const excel = require('../middleware/Excel');
const authGuard = require('../middleware/auth-middleware');
const Employee = require('../Schema/Employee');
const Orders = require('../Schema/Orders');
const sequence = require('../middleware/CounterSequence');
const Mail = require('../Email/Mail')
const EmailDetails = require('../Email/EmailDetails')
const Points  = require('../Schema/Points')
const runDate = require('../Schema/lastRundate')

router.post('/request-to-add-member',authGuard,async(req,res)=>{
    try{
        const new_approval = await admin_approval.create(req.body)
        //new_approval.IsApproved = false;
        const saved_approval = await new_approval.save()
        const adminBody = `Dear SaleAdmin\n\nThe recruit request for role - ${new_approval.role} has been raised by ${new_approval.referedBy} - ${new_approval.referalId}\nPlease take a neccessary action(Approve/Reject)\n\nRegards,\nSalesAdmin`;
        const adminSubject = `Recurit Request`

        const referalId = new_approval.referalId

        const referemp = await Employee.find({"empCode":referalId})

        const referEmail = referemp[0].emailId
        const firstName = referemp[0].firstName
        const lastName = referemp[0].lastName

        const referalbody = `Dear ${firstName} ${lastName},

    Thank you for submitting your referral request!

    We have successfully received your referral request and our team will review it shortly.
    
    If you have any questions or need further assistance, please do not hesitate to contact us.

    Best regards,
    SaleAdmin`

        const referalSubject = `Referral Request Submission Confirmation`

        console.log(new_approval.referalId)
        Mail(referEmail,referalSubject,referalbody)



        Mail(EmailDetails.FromAddress,adminSubject,adminBody)
        
        const employeeBody = `
        Dear ${new_approval.firstName},

        We are pleased to inform you that your recruitment request has been successfully placed. Thank you for submitting your request. Here are the details of your submission:

        Request Details:
        Role: ${new_approval.role}
        Department: ${new_approval.department}
        Requested By: ${new_approval.referedBy}

        Our recruitment team will review the request and you will be notified shortly.

        Regards,
        Sales Team
        `;
                    ;

        const employeeSubject = `Recruitment Request Successfully Placed`
        Mail(saved_approval.emailId,employeeSubject,employeeBody)

        res.status(200).json({"status":true,"message":"success","content":null})


    }
    catch(err){
        res.status(500).json({"status":false,"message":"Failed","content":null})
        console.log(err)
    }
})
router.post('/add-member-by-admin',async(req,res)=>{
    try {
        const number = await sequence("empCode");
        const newEmployee = await Employee.create(req.body)
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
        const saved_employee = await newEmployee.save()

        const body = `Dear ${newEmployee.firstName}\n\nWelcome to MathTutee! We are excited to have you join our team as a ${jobTitle}. Your skills and experience will be a valuable addition to our company\n\nPlease use below credentials to login\nEmpCode = ${empCode} \nPassword = ${empCode}\n\nIf you have any issues with login please contact your reporting manager or send your queries to below emailId ${EmailDetails.FromAddress} \n\nRegards,\nSalesAdmin`
        const subject = "Onboarding is successfull"

        Mail(email, subject, body);
        res.status(200).json({"status":true,"message":"success","content":null})
        
    } catch (error) {
        res.status(500).json({"status":false,"message":"Failed","content":null})
        console.log(error)
        
    }
})

router.post('/reject-member',authGuard,async(req,res)=>{
    try {
        const empcode= req.body.empCode;
        const reject = await admin_approval.deleteOne({"empCode":empcode})
        if (reject.deletedCount === 0) {
            return res.status(404).send({"status":true,"message":"No record found with the given empCode","content":null});
        }
        res.status(200).json({"status":true,"message":"success","content":null})
        
    } catch (error) {
        res.status(500).json({"status":false,"message":"Failed","content":null})
    }
}

)

router.get('/get-request-list',async(req,res)=>{
    try{
        const requests = await admin_approval.find({})
        res.status(200).json({"status":true,"message":"success","content":requests})
    }
    catch(err){
        res.status(500).json({"status":false,"message":"Failed","content":null})
    }
})

router.post('/upload-sales-data',async(req,res)=>{
    try{
        const filePath = req.body.filePath
        await excel.importData(filePath).then(()=>{
            TeamPoints()
            CalculatePoints()
            
            res.status(200).json({"status":true,"message":"success","content":null})
        }).catch(err=>{
            res.status(500).json({"status":false,"message":"Failed","content":err.message})
        });
       // await CalculatePoints()
       // await referalId()
     
        
        
    }
    catch(err){
        res.status(500).json({"status":false,"message":"Failed","content":null})
    }
})

router.get('/get-admin-direct-employees',authGuard,async(req,res)=>{
    try{
        const requests = await Employee.find({"appliedFor":{ $in: ['zonal-head', 'pdm'] }},{"_id":0,"empCode":1,"personalInfo":{"name":1,"mobileNo":1},"address.current.postOffice":1,"points":1})
        res.status(200).json({"status":true,"message":"success","content":requests})
    }
    catch(err){
        res.status(500).json({"status":false,"message":"Failed","content":null})
    }
})


const TeamPoints = async() => {
    try {
        // const date = new Date(req.body.date);
        // const nextDate = new Date(date);
        // nextDate.setDate(nextDate.getDate() + 1);

        // Step 1: Aggregate orders to calculate total points for each employee
        const aggregatedOrders = await Orders.aggregate([
            {
                $group: {
                    _id: { empCode: "$empCode" },
                    totalPoints: { $sum: "$points" }
                }
            }
        ]);

        // Format the result
        const formattedResult = aggregatedOrders.map(record => ({
            empCode: record._id.empCode,
            MyPoints: Number(record.totalPoints),
            TeamPoints: 0
        }));

        // Step 2: Update individual points for each employee
        const updateEmployeePointsPromises = formattedResult.map(record => 
            Employee.updateOne(
                { empCode: record.empCode },
                { $set: { Points: record.MyPoints } }
            )
        );
        await Promise.all(updateEmployeePointsPromises);
        //console.log(formattedResult)
        // Step 3: Update team points for each employee based on referrals
        for (const record of formattedResult) {
            let emp = record.empCode;
            const referEmpSet = new Set();

            while (true) {
                const output = await Employee.aggregate([
                    {
                        $lookup: {
                            from: 'employees',
                            localField: 'referalId',
                            foreignField: 'empCode',
                            as: 'referedPerson'
                        }
                    },
                    { $unwind: '$referedPerson' },
                    { $match: { empCode: emp } },
                    {
                        $project: {
                            referalId: 1
                        }
                    }
                ]);

                if (output.length === 0) break;

                emp = output[0].referalId;

                if (!referEmpSet.has(emp)) {
                    referEmpSet.add(emp);

                    const teamPointsResults = await Employee.aggregate([
                        { $match: { referalId: emp } },
                        {
                            $group: {
                                _id: "$referalId",
                                totalPoints: { $sum: "$Points" },
                                totalTeamPoints: { $sum: "$TeamPoints" }
                            }
                        }
                    ]);

                    //console.log(teamPointsResults)

                    if (teamPointsResults.length > 0) {
                        const teamPointsData = teamPointsResults[0];
                        await Employee.updateOne(
                            { empCode: teamPointsData._id },
                            { $set: { TeamPoints: teamPointsData.totalPoints + teamPointsData.totalTeamPoints } }
                        );
                    }
                }
            }
        }

    } catch (err) {
        console.error(err);
    }
};




const CalculatePoints = async () => {
  try {
    // Fetch the last run date
    let lastRunDateRecord = await runDate.findOne({ _id: 'LastRunDate' }).exec();
    let date;

    if (!lastRunDateRecord) {
      date = new Date(2024, 0, 1);
      await runDate.create({ _id: 'LastRunDate', lastRundate: date });
    } else {
      date = lastRunDateRecord.lastRundate;
    }

    console.log(date);

    // Fetch all distinct referalIds from the Points collection with createDate greater than or equal to the last run date
    const distinctReferralIds = await Points.find({ createDate: { $gte: date } }).distinct('referalId').exec();

    // Use a set to keep track of processed referralIds to avoid duplicates
    const processedReferralIds = new Set();

    // Loop through each distinct referralId
    for (let initialReferralId of distinctReferralIds) {
      let currentReferralId = initialReferralId;

      // Continue processing while there are more referral IDs to follow
      while (currentReferralId) {
        // Skip already processed referral IDs
        if (processedReferralIds.has(currentReferralId)) break;

        // Fetch points for the current referralId
        const pointsRecords = await Points.find({ referalId: currentReferralId, createDate: { $gte: date } }).exec();

        // Fetch the employee associated with the current referralId
        const employee = await Employee.findOne({ empCode: currentReferralId }).exec();

        // If there are no points records or no employee, break the loop
        if (!pointsRecords.length || !employee) break;

        // Process each point record individually
        for (const record of pointsRecords) {
          // Check if the record already exists in the Points collection
          const existingRecord = await Points.findOne({ orderNo: record.orderNo, empCode: currentReferralId }).exec();

          if (!existingRecord) {
            const formattedResult = {
              orderNo: record.orderNo,
              empCode: currentReferralId,
              orderDate: record.orderDate,
              points: record.points,
              referalId: employee.referalId,
              orderMonth: record.orderMonth,
              orderQuarter:record.orderQuarter,
              orderYear:record.orderYear,
              orderTotal:record.orderTotal,
              discountAmount:record.discountAmount,
              netAmount:record.netAmount,
              courseName:record.courseName,
            };

            // Insert the new record into the Points collection
            await Points.create(formattedResult);
          }
        }

        // Mark current referral ID as processed
        processedReferralIds.add(currentReferralId);

        // Move to the next referral ID
        currentReferralId = employee.referalId;
      }
    }

    // Update the last run date to the current date
    await runDate.updateOne({ _id: 'LastRunDate' }, { $set: { lastRundate: new Date() } });
  } catch (error) {
    console.error('Error processing points:', error);
  }
};



module.exports = router;