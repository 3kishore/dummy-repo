const XLSX = require('xlsx');
const Users = require('../Schema/TDS');

const filePath = 'TDS.xlsx';
const requiredColumn = 'A';
const maximumRowNumber = 1000000;

class Excel {
  async importData(path) {
    const tasks = [
      this.importUsers(path, 'Month', this.parseMonthlyRow),
      this.importUsers(path, 'Quarterly', this.parseQuarterlyRow),
      this.importUsers(path, 'Annual', this.parseAnnualRow)
    ];

    await Promise.all(tasks).then(() => {
      console.log('All Records Uploaded finished!................... ^_^');
    });
  }

  async importUsers(path, sheetName, parseRowFunction) {
    const xlsx = XLSX.readFile(path);
    const range = xlsx.Sheets[sheetName];
    const rows = [];

    for (let row = 2; row <= maximumRowNumber; ++row) {
      if (!range[`${requiredColumn}${row}`]) {
        break; // stop if no more data
      }

      const rowIns = parseRowFunction(range, row);
      rows.push(rowIns);
    }

    await this.addUsers(rows);
    console.log(`${sheetName} data uploaded...`);
  }

  parseMonthlyRow(range, row) {
    return {
      empCode: range[`B${row}`].w,
      employeeName: range[`C${row}`] ? range[`C${row}`].w : '',
      roleName:range[`D${row}`] ? range[`D${row}`].w : '',
      department:range[`E${row}`] ? range[`E${row}`].w : '',
      zone: range[`F${row}`] ? range[`F${row}`].w : '',
      region: range[`G${row}`] ? range[`G${row}`].w : '',
      area: range[`H${row}`] ? range[`H${row}`].w : '',
      dateOfPayout:range[`I${row}`] ? range[`I${row}`].w : '',
      Points: range[`J${row}`] ? range[`J${row}`].w : '',
      monthlyFixedCommissionPerPoint: range[`K${row}`] ? range[`K${row}`].w : '',
      monthlyFixedCommission: range[`L${row}`] ? range[`L${row}`].w : '',
      monthlySpecialCommissionPerPoints: range[`M${row}`] ? range[`M${row}`].w : '',
      monthlySpecialCommission: range[`N${row}`] ? range[`N${row}`].w : '',
      totalCommission: range[`O${row}`] ? range[`O${row}`].w : '',
      tdsAmount: range[`P${row}`] ? range[`P${row}`].w : '',
      netPayout: range[`Q${row}`] ? range[`Q${row}`].w : '',
    };
  }

  parseQuarterlyRow(range, row) {
    return {
     empCode: range[`B${row}`].w,
      employeeName: range[`C${row}`] ? range[`C${row}`].w : '',
      roleName:range[`D${row}`] ? range[`D${row}`].w : '',
      department:range[`E${row}`] ? range[`E${row}`].w : '',
      zone: range[`F${row}`] ? range[`F${row}`].w : '',
      region: range[`G${row}`] ? range[`G${row}`].w : '',
      area: range[`H${row}`] ? range[`H${row}`].w : '',
      dateOfPayout:range[`I${row}`] ? range[`I${row}`].w : '',
      Points: range[`J${row}`] ? range[`J${row}`].w : '',
      monthlyFixedCommissionPerPoint: '',
      monthlyFixedCommission:  '',
      monthlySpecialCommissionPerPoints: range[`K${row}`] ? range[`K${row}`].w : '',
      monthlySpecialCommission: range[`L${row}`] ? range[`L${row}`].w : '',
      totalCommission: '',
      tdsAmount: range[`M${row}`] ? range[`M${row}`].w : '',
      netPayout: range[`N${row}`] ? range[`N${row}`].w : '',
    };
  }

  parseAnnualRow(range, row) {
    return {
      empCode: range[`B${row}`].w,
      employeeName: range[`C${row}`] ? range[`C${row}`].w : '',
      roleName:range[`D${row}`] ? range[`D${row}`].w : '',
      department:range[`E${row}`] ? range[`E${row}`].w : '',
      zone: range[`F${row}`] ? range[`F${row}`].w : '',
      region: range[`G${row}`] ? range[`G${row}`].w : '',
      area: range[`H${row}`] ? range[`H${row}`].w : '',
      dateOfPayout:range[`I${row}`] ? range[`I${row}`].w : '',
      Points: range[`J${row}`] ? range[`J${row}`].w : '',
      monthlyFixedCommissionPerPoint: '',
      monthlyFixedCommission:  '',
      monthlySpecialCommissionPerPoints: range[`K${row}`] ? range[`K${row}`].w : '',
      monthlySpecialCommission: range[`L${row}`] ? range[`L${row}`].w : '',
      totalCommission: '',
      tdsAmount: range[`M${row}`] ? range[`M${row}`].w : '',
      netPayout: range[`N${row}`] ? range[`N${row}`].w : '',
    };
  }

  async addUsers(rows) {
    const bulkOps = rows.map(row => ({
      updateOne: {
        filter: { empCode: row.empCode, dateOfPayout: row.dateOfPayout },
        update: {
          $setOnInsert: {
            empCode: row.empCode,
            dateOfPayout: row.dateOfPayout,
            employeeName: row.employeeName,
            roleName: row.roleName,
            department: row.department,
            zone: row.zone,
            region: row.region,
            area: row.area,
            points: row.Points,
            fixedCommissionPerPoint: row.monthlyFixedCommissionPerPoint,
            fixedCommission: row.monthlyFixedCommission,
            commissionPerPoints:row.monthlySpecialCommissionPerPoints,
            commission:row.monthlySpecialCommission,
            totalCommission: row.totalCommission,
            tdsAmount: row.tdsAmount,
            netPayout: row.netPayout,
          }
        },
        upsert: true
      }
    }));

    await Users.bulkWrite(bulkOps);
    console.log('Bulk write completed.');
  }
}

const excelIns = new Excel();
module.exports = excelIns;
