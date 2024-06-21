const runDate = require('../Schema/lastRundate')

const UpdateNextValue = async(sequenceName)=>{
    const sequenceDocument = await runDate.findOneAndUpdate(
        { _id: sequenceName },
        { new: true, upsert: true }
    );
}