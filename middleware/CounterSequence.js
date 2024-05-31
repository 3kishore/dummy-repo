const Counter = require('../Schema/Counter');

const getNextSequenceValue = async (sequenceName) => {
    const sequenceDocument = await Counter.findOneAndUpdate(
        { _id: sequenceName },
        { $inc: { sequence_value: 1 } },
        { new: true, upsert: true }
    );

    return sequenceDocument.sequence_value;
};

module.exports = getNextSequenceValue;
