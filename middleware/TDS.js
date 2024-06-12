const XLSX = require('xlsx');
const Users = require('../Schema/TDS');

const requiredColumn = 'A';
const maximumRowNumber = 1000000;
const batchSize = 500; // Adjust batch size as needed

class Excel {
  async importData(path) {
    try {
      const tasks = [
        this.importUsers(path, 'Month', this.parseMonthlyRow),
        this.importUsers(path, 'Quartely', this.parseQuarterlyRow),
        this.importUsers(path, 'Annual', this.parseAnnualRow)
      ];

      await Promise.all(tasks);
      console.log('All Records Uploaded finished!................... ^_^');
    } catch (error) {
      console.error('Error uploading data:', error);
    }
  }

  async importUsers(path, sheetName, parseRowFunction) {
    try {
      const xlsx = XLSX.readFile(path);
      const range = xlsx.Sheets[sheetName];
      const rows = [];

      for (let row = 2; row <= maximumRowNumber; ++row) {
        if (!range[`${requiredColumn}${row}`]) {
          break; // stop if no more data
        }

        const rowIns = parseRowFunction(range, row);
        rows.push(rowIns);

        if (rows.length === batchSize) {
          await this.addUsers(rows);
          rows.length = 0; // Clear the array
        }
      }

      if (rows.length > 0) {
        await this.addUsers(rows);
      }

      console.log(`${sheetName} data uploaded...`);
    } catch (error) {
      console.error(`Error processing ${sheetName} data:`, error);
    }
  }

  parseMonthlyRow(range, row) {
    return {
      empCode: range[`B${row}`].w,
      employeeName: range[`C${row}`]?.w || '',
      roleName: range[`D${row}`]?.w || '',
      department: range[`E${row}`]?.w || '',
      zone: range[`F${row}`]?.w || '',
      region: range[`G${row}`]?.w || '',
      area: range[`H${row}`]?.w || '',
      payrollType: range[`I${row}`]?.w || '',
      payrollCompanyName: range[`J${row}`]?.w || '',
      payrollCompanyEmployeeCode: range[`K${row}`]?.w || '',
      month: range[`L${row}`]?.w || '',
      year: range[`M${row}`]?.w || '',
      Points: range[`N${row}`]?.w || '',
      monthlyFixedCommissionPerPoint: range[`O${row}`]?.w || '',
      monthlyFixedCommission: range[`P${row}`]?.w || '',
      monthlySpecialCommissionPerPoints: range[`Q${row}`]?.w || '',
      monthlySpecialCommission: range[`R${row}`]?.w || '',
      totalCommission: range[`S${row}`]?.w || '',
      tdsAmount: range[`T${row}`]?.w || '',
      netPayout: range[`U${row}`]?.w || '',
      report: 'Month'
    };
  }

  parseQuarterlyRow(range, row) {
    return {
      empCode: range[`B${row}`].w,
      employeeName: range[`C${row}`]?.w || '',
      roleName: range[`D${row}`]?.w || '',
      department: range[`E${row}`]?.w || '',
      zone: range[`F${row}`]?.w || '',
      region: range[`G${row}`]?.w || '',
      area: range[`H${row}`]?.w || '',
      payrollType: range[`I${row}`]?.w || '',
      payrollCompanyName: range[`J${row}`]?.w || '',
      payrollCompanyEmployeeCode: range[`K${row}`]?.w || '',
      quarter: range[`L${row}`]?.w || '',
      year: range[`M${row}`]?.w || '',
      Points: range[`N${row}`]?.w || '',
      monthlyFixedCommissionPerPoint: '',
      monthlyFixedCommission: '',
      monthlySpecialCommissionPerPoints: range[`O${row}`]?.w || '',
      monthlySpecialCommission: range[`P${row}`]?.w || '',
      totalCommission: '',
      tdsAmount: range[`Q${row}`]?.w || '',
      netPayout: range[`R${row}`]?.w || '',
      report: 'Quarter'
    };
  }

  parseAnnualRow(range, row) {
    return {
      empCode: range[`B${row}`].w,
      employeeName: range[`C${row}`]?.w || '',
      roleName: range[`D${row}`]?.w || '',
      department: range[`E${row}`]?.w || '',
      zone: range[`F${row}`]?.w || '',
      region: range[`G${row}`]?.w || '',
      area: range[`H${row}`]?.w || '',
      payrollType: range[`I${row}`]?.w || '',
      payrollCompanyName: range[`J${row}`]?.w || '',
      payrollCompanyEmployeeCode: range[`K${row}`]?.w || '',
      year: range[`L${row}`]?.w || '',
      Points: range[`M${row}`]?.w || '',
      monthlyFixedCommissionPerPoint: '',
      monthlyFixedCommission: '',
      monthlySpecialCommissionPerPoints: range[`N${row}`]?.w || '',
      monthlySpecialCommission: range[`O${row}`]?.w || '',
      totalCommission: '',
      tdsAmount: range[`P${row}`]?.w || '',
      netPayout: range[`Q${row}`]?.w || '',
      report: 'Annual'
    };
  }

  async addUsers(rows) {
    try {
      const bulkOps = rows.map(row => {
        const filter = { empCode: row.empCode,report: row.report};
        if (row.report === 'Month') {
          filter.month = row.month;
        } else if (row.report === 'Quarter') {
          filter.quarter = row.quarter;
        } else if (row.report === 'Annual') {
          filter.year = row.year;
        }

        return {
          updateOne: {
            filter,
            update: {
              $setOnInsert: {
                empCode: row.empCode,
                employeeName: row.employeeName,
                roleName: row.roleName,
                department: row.department,
                zone: row.zone,
                region: row.region,
                area: row.area,
                points: row.Points,
                payrollType: row.payrollType,
                payrollCompanyName: row.payrollCompanyName,
                payrollCompanyEmployeeCode: row.payrollCompanyEmployeeCode,
                fixedCommissionPerPoint: row.monthlyFixedCommissionPerPoint,
                fixedCommission: row.monthlyFixedCommission,
                commissionPerPoints: row.monthlySpecialCommissionPerPoints,
                commission: row.monthlySpecialCommission,
                totalCommission: row.totalCommission,
                tdsAmount: row.tdsAmount,
                netPayout: row.netPayout,
                month: row.month,
                year: row.year,
                quarter: row.quarter,
                report: row.report
              }
            },
            upsert: true
          }
        };
      });

      await Users.bulkWrite(bulkOps);
      console.log('Bulk write completed.');
    } catch (error) {
      console.error('Error in bulk write:', error);
    }
  }
}

const excelIns = new Excel();
module.exports = excelIns;
