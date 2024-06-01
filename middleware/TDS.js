const XLSX = require('xlsx');
const Users = require('../Schema/TDS');

const filePath = 'TDS.xlsx';
const sheet = 'Month';
const requiredColumn = 'A';
const maximumRowNumber = 1000000;

class Excel {
  async importData() {
    /* Promise all take array of independent commands */
    await Promise.all([this.importUsers()]).then(() => {
      console.log('Uploaded finished!................... ^_^');
    });
  }

  async importUsers() {
    const xlsx = XLSX.readFile(filePath);
    const range = xlsx.Sheets[sheet];

    console.log('Users data uploaded...');

    for (let row = 2; row <= maximumRowNumber; ++row) {
      if (!range[`${requiredColumn}${row}`]) {
        break; // stop if no another  data
      }

      const rowIns = {
        empCode: range[`B${row}`].w,
        dateOfPayout: range[`C${row}`] ? range[`C${row}`].w : '',
        monthlyCommissionPerPoints: range[`D${row}`] ? range[`D${row}`].w : '',
        monthlyFixedCommission: range[`E${row}`] ? range[`E${row}`].w : '',
        monthlySpecialCommissionPerPoints: range[`F${row}`] ? range[`F${row}`].w : '',
        monthlySpecialCommission: range[`G${row}`] ? range[`G${row}`].w : '',
        totalCommission: range[`H${row}`] ? range[`H${row}`].w : '',
        tdsAmount: range[`I${row}`] ? range[`I${row}`].w : '',
        netPayout: range[`J${row}`] ? range[`J${row}`].w : '',
  
    };

     await this.addUser(rowIns);
      // this.updateUser(rowIns);
    }
    console.log('Users Done!');
  }

  updateUser(rowIns) {
    // update existed user
    return Users.findOneAndUpdate(
      {
        empCode: rowIns.empCode,
        month: rowIns.month // your condition
      },
      {
        $set: {
            TdsAmount: rowIns.TdsAmount,
        }, // update values
      },
      {
        new: true, // return new one
      },
      (error, result) => {
        console.log([error, result]);
      },
    );
  }

  async addUser(rowIns) {
        const result  = await Users.find({"empCode": rowIns.empCode,"dateOfPayout": rowIns.dateOfPayout})
        console.log(result.length);
        if(result.length == 0){
        const userIns = new Users({
          empCode: rowIns.empCode,
          dateOfPayout : rowIns.dateOfPayout,
          monthlyCommissionPerPoints: rowIns.monthlyCommissionPerPoints,
          monthlyFixedCommission: rowIns.monthlyFixedCommission,
          monthlySpecialCommissionPerPoints: rowIns.monthlySpecialCommissionPerPoints,
          monthlySpecialCommission: rowIns.monthlySpecialCommission,
          totalCommission: rowIns.totalCommission,
          tdsAmount: rowIns.tdsAmount,
          netPayout: rowIns.netPayout,

        });
    userIns.save();
      }
  }
}

const excelIns = new Excel();
module.exports = excelIns;
