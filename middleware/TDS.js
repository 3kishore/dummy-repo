const XLSX = require('xlsx');
const Users = require('../Schema/TDS');

const filePath = 'TDS.xlsx';
const sheet = 'Sheet1';
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
        empCode: range[`A${row}`].w,
        Month: range[`B${row}`] ? range[`B${row}`].w : '',
        TdsAmount: range[`C${row}`] ? range[`C${row}`].w : '',
    };

      this.addUser(rowIns);
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
  addUser(rowIns) {
        const userIns = new Users({
          empCode: rowIns.empCode,
          Month : rowIns.Month,
          TdsAmount: rowIns.TdsAmount,

        });
    userIns.save();
  }
}

const excelIns = new Excel();
module.exports = excelIns;
