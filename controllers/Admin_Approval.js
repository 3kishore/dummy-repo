const express = require('express');
const admin_approval = require('../Schema/Admin');
const router = express.Router();
const excel = require('../middleware/Excel');
const authGuard = require('../middleware/auth-middleware');
const Employee = require('../Schema/Employee');
const Orders = require('../Schema/Orders');

router.post('/request-to-add-member',async(req,res)=>{
    try{
        const new_approval = await admin_approval.create(req.body)
        //new_approval.IsApproved = false;
        const saved_approval = await new_approval.save()
        res.status(200).json({"status":true,"message":"success","content":null})

    }
    catch(err){
        res.status(500).json({"status":false,"message":"Failed","content":null})
        console.log(err)
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
            res.status(200).json({"status":true,"message":"success","content":null})
        }).catch(err=>{
            res.status(500).json({"status":false,"message":"Failed","content":err.message})
        });
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


router.post('/my-Team-sales-points', async (req, res) => {
    try {
        const date = new Date(req.body.date);
        const nextDate = new Date(date);
        nextDate.setDate(nextDate.getDate() + 1);

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
        console.log(formattedResult)
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

                    console.log(teamPointsResults)

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

        res.status(200).json({ "status": true, "message": "success", "content": null });
    } catch (err) {
        res.status(500).json({ "status": false, "message": "Failed", "content": null });
        console.error(err);
    }
});



module.exports = router;