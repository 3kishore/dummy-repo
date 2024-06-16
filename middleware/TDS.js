const XLSX = require('xlsx');
const Users = require('../Schema/TDS');
const Quarterly = require('../Schema/QuarterlyPayout');
const Annual = require('../Schema/AnnualPayout');

const REQUIRED_COLUMN = 'A';
const MAXIMUM_ROW_NUMBER = 1000000;

class Excel {
  async importData(path) {
    try {
      const tasks = [
        this.importSheetData(path, 'Month', this.parseMonthlyRow, Users),
        this.importSheetData(path, 'Quartely', this.parseQuarterlyRow, Quarterly),
        this.importSheetData(path, 'Annual', this.parseAnnualRow, Annual)
      ];

      await Promise.all(tasks);
      console.log('All records uploaded successfully.');
    } catch (error) {
      console.error('Error uploading data:', error);
    }
  }

  async importSheetData(path, sheetName, parseRowFunction, Model) {
    try {
      const workbook = XLSX.readFile(path);
      const worksheet = workbook.Sheets[sheetName];

      for (let row = 2; row <= MAXIMUM_ROW_NUMBER; row++) {
        if (!worksheet[`${REQUIRED_COLUMN}${row}`]) {
          break; // Stop if no more data
        }

        const rowData = parseRowFunction(worksheet, row);
        await this.saveRow(rowData, Model);
      }

      console.log(`${sheetName} data uploaded successfully.`);
    } catch (error) {
      console.error(`Error processing ${sheetName} data:`, error);
    }
  }

  parseMonthlyRow(sheet, row) {
    return {
      empCode: sheet[`B${row}`]?.w,
      employeeName: sheet[`C${row}`]?.w || '',
      roleName: sheet[`D${row}`]?.w || '',
      department: sheet[`E${row}`]?.w || '',
      zone: sheet[`F${row}`]?.w || '',
      region: sheet[`G${row}`]?.w || '',
      area: sheet[`H${row}`]?.w || '',
      payrollType: sheet[`I${row}`]?.w || '',
      payrollCompanyName: sheet[`J${row}`]?.w || '',
      payrollCompanyEmployeeCode: sheet[`K${row}`]?.w || '',
      month: sheet[`L${row}`]?.w || '',
      monthlyFixedCommissionPerPoint: sheet[`O${row}`]?.w || '',
      monthlyFixedCommission: sheet[`P${row}`]?.w || '',
      monthlySpecialCommissionPerPoints: sheet[`Q${row}`]?.w || '',
      monthlySpecialCommission: sheet[`R${row}`]?.w || '',
      totalCommission: sheet[`S${row}`]?.w || '',
      year: sheet[`M${row}`]?.w || '',
      points: sheet[`N${row}`]?.w || '',
      tdsAmount: sheet[`T${row}`]?.w || '',
      netPayout: sheet[`U${row}`]?.w || '',
      transactionId: sheet[`V${row}`]?.w || '',
      transactionDate: new Date(sheet[`W${row}`]?.w || ''),
      transactionStatus: sheet[`X${row}`]?.w || '',
      report: 'Month',
      financialYear: sheet[`Y${row}`]?.w || ''
    };
  }

  parseQuarterlyRow(sheet, row) {
    return {
      empCode: sheet[`B${row}`]?.w,
      employeeName: sheet[`C${row}`]?.w || '',
      roleName: sheet[`D${row}`]?.w || '',
      department: sheet[`E${row}`]?.w || '',
      zone: sheet[`F${row}`]?.w || '',
      region: sheet[`G${row}`]?.w || '',
      area: sheet[`H${row}`]?.w || '',
      payrollType: sheet[`I${row}`]?.w || '',
      payrollCompanyName: sheet[`J${row}`]?.w || '',
      payrollCompanyEmployeeCode: sheet[`K${row}`]?.w || '',
      quarter: sheet[`L${row}`]?.w || '',
      quarterlyCommissionPerPoints: sheet[`O${row}`]?.w || '',
      quarterlyCommission: sheet[`P${row}`]?.w || '',
      year: sheet[`M${row}`]?.w || '',
      points: sheet[`N${row}`]?.w || '',
      tdsAmount: sheet[`Q${row}`]?.w || '',
      netPayout: sheet[`R${row}`]?.w || '',
      transactionId: sheet[`S${row}`]?.w || '',
      transactionDate: new Date(sheet[`T${row}`]?.w || ''),
      transactionStatus: sheet[`U${row}`]?.w || '',
      report: 'Quarter',
      financialYear: sheet[`V${row}`]?.w || ''
    };
  }

  parseAnnualRow(sheet, row) {
    return {
      empCode: sheet[`B${row}`]?.w,
      employeeName: sheet[`C${row}`]?.w || '',
      roleName: sheet[`D${row}`]?.w || '',
      department: sheet[`E${row}`]?.w || '',
      zone: sheet[`F${row}`]?.w || '',
      region: sheet[`G${row}`]?.w || '',
      area: sheet[`H${row}`]?.w || '',
      payrollType: sheet[`I${row}`]?.w || '',
      payrollCompanyName: sheet[`J${row}`]?.w || '',
      payrollCompanyEmployeeCode: sheet[`K${row}`]?.w || '',
      year: sheet[`L${row}`]?.w || '',
      annualCommissionPerPoints: sheet[`N${row}`]?.w || '',
      annualSpecialCommission: sheet[`O${row}`]?.w || '',
      points: sheet[`M${row}`]?.w || '',
      tdsAmount: sheet[`P${row}`]?.w || '',
      netPayout: sheet[`Q${row}`]?.w || '',
      transactionId: sheet[`R${row}`]?.w || '',
      transactionDate: new Date(sheet[`S${row}`]?.w || ''),
      transactionStatus: sheet[`T${row}`]?.w || '',
      report: 'Annual',
      financialYear: sheet[`U${row}`]?.w || ''
    };
  }

  async saveRow(row, Model) {
    try {
      row.transactionDate
      let date = 1000 * 60 * 60 * 24
      //date.setDate(date+1)
     
      const filter = { empCode: row.empCode, report: row.report };

      if (row.report === 'Month') {
        filter.month = row.month;
      } else if (row.report === 'Quarter') {
        filter.quarter = row.quarter;
      } else if (row.report === 'Annual') {
        filter.year = row.year;
      }

      const update = {
        $set: {
          empCode: row.empCode,
          employeeName: row.employeeName,
          roleName: row.roleName,
          department: row.department,
          zone: row.zone,
          region: row.region,
          area: row.area,
          points: row.points,
          payoutType: row.payrollType,
          payrollCompanyName: row.payrollCompanyName,
          payrollCompanyEmployeeCode: row.payrollCompanyEmployeeCode,
          month: row.month,
          year: row.year,
          quarter: row.quarter,
          report: row.report,
          tdsAmount: row.tdsAmount,
          netPayout: row.netPayout,
          transactionId: row.transactionId,
          transactionDate: row.transactionDate.getTime() + date,
          transactionStatus: row.transactionStatus,
          financialYear: row.financialYear
        }
      };

      if (row.report === 'Month') {
        Object.assign(update.$set, {
          monthlyCommissionPerPoints: row.monthlyFixedCommissionPerPoint,
          monthlyFixedCommission: row.monthlyFixedCommission,
          monthlySpecialCommissionPerPoints: row.monthlySpecialCommissionPerPoints,
          monthlySpecialCommission: row.monthlySpecialCommission,
          totalCommission: row.totalCommission
        });
      } else if (row.report === 'Quarter') {
        Object.assign(update.$set, {
          quarterlyCommissionPerPoints: row.quarterlyCommissionPerPoints,
          quarterlyCommission: row.quarterlyCommission
        });
      } else if (row.report === 'Annual') {
        Object.assign(update.$set, {
          annualCommissionPerPoints: row.annualCommissionPerPoints,
          annualSpecialCommission: row.annualSpecialCommission
        });
      }

      await Model.updateOne(filter, update, { upsert: true });
      
    } catch (error) {
      console.error('Error saving row:', error);
    }
  }
}

const excelIns = new Excel();
module.exports = excelIns;
