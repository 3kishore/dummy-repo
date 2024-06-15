const XLSX = require('xlsx');
const Users = require('../Schema/TDS');
const Quarterly = require('../Schema/QuarterlyPayout');
const Annual = require('../Schema/AnnualPayout');

const requiredColumn = 'A';
const maximumRowNumber = 1000000;
const batchSize = 500; // Adjust batch size as needed

class Excel {
  async importData(path) {
    try {
      const tasks = [
        this.importUsers(path, 'Month', this.parseRow.bind(this, 'Month')),
        this.importUsers(path, 'Quartely', this.parseRow.bind(this, 'Quarter')),
        this.importUsers(path, 'Annual', this.parseRow.bind(this, 'Annual'))
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

  parseRow(reportType, range, row) {
    const baseData = {
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
      report: reportType
    };

    if (reportType === 'Month') {
      return {
        ...baseData,
        month: range[`L${row}`]?.w || '',
        monthlyFixedCommissionPerPoint: range[`O${row}`]?.w || '',
        monthlyFixedCommission: range[`P${row}`]?.w || '',
        monthlySpecialCommissionPerPoints: range[`Q${row}`]?.w || '',
        monthlySpecialCommission: range[`R${row}`]?.w || '',
        totalCommission: range[`S${row}`]?.w || '',
        year: range[`M${row}`]?.w || '',
        Points: range[`N${row}`]?.w || '',
        tdsAmount: range[`T${row}`]?.w || '',
        netPayout: range[`U${row}`]?.w || '',
        transactionId: range[`V${row}`]?.w || '',
        transactionDate: range[`W${row}`]?.w || '',
        transactionStatus: range[`X${row}`]?.w || '',
      };
    } else if (reportType === 'Quarter') {
      return {
        ...baseData,
        quarter: range[`L${row}`]?.w || '',
        quarterlyCommissionPerPoints: range[`O${row}`]?.w || '',
        quarterlyCommission: range[`P${row}`]?.w || '',
        year: range[`M${row}`]?.w || '',
        Points: range[`N${row}`]?.w || '',
        tdsAmount: range[`Q${row}`]?.w || '',
        netPayout: range[`R${row}`]?.w || '',
        transactionId: range[`S${row}`]?.w || '',
        transactionDate: range[`T${row}`]?.w || '',
        transactionStatus: range[`U${row}`]?.w || '',
      };
    } else if (reportType === 'Annual') {
      return {
        ...baseData,
        annualCommissionPerPoints: range[`N${row}`]?.w || '',
        annualSpecialCommission: range[`O${row}`]?.w || '',
        year: range[`L${row}`]?.w || '',
        Points: range[`M${row}`]?.w || '',
        tdsAmount: range[`P${row}`]?.w || '',
        netPayout: range[`Q${row}`]?.w || '',
        transactionId: range[`R${row}`]?.w || '',
        transactionDate: range[`S${row}`]?.w || '',
        transactionStatus: range[`T${row}`]?.w || '',
        };
    }
  }

  async addUsers(rows) {
    try {
      const bulkOps = rows.map(row => {
        const filter = { empCode: row.empCode, report: row.report };
        
        if (row.report === 'Month') {
          filter.month = row.month;
        } else if (row.report === 'Quarter') {
          filter.quarter = row.quarter;
        } else if (row.report === 'Annual') {
          filter.year = row.year;
        }

        const update = {
          $setOnInsert: {
            empCode: row.empCode,
            employeeName: row.employeeName,
            roleName: row.roleName,
            department: row.department,
            zone: row.zone,
            region: row.region,
            area: row.area,
            points: row.Points,
            payoutType: row.payrollType,
            payrollCompanyName: row.payrollCompanyName,
            payrollCompanyEmployeeCode: row.payrollCompanyEmployeeCode,
            month: row.month,
            year: row.year,
            quarter: row.quarter,
            report: row.report,
            tdsAmount: row.tdsAmount,
            netPayout: row.netPayout,
            transacationId:row.transactionId,
            transactionDate:new Date(row.transactionDate).getTime(),
            transactionStatus:row.transactionStatus
          }
        };

        if (row.report === 'Month') {
          Object.assign(update.$setOnInsert, {
            monthlyCommissionPerPoints: row.monthlyFixedCommissionPerPoint,
            monthlyFixedCommission: row.monthlyFixedCommission,
            monthlySpecialCommissionPerPoints: row.monthlySpecialCommissionPerPoints,
            monthlySpecialCommission: row.monthlySpecialCommission,
            totalCommission: row.totalCommission
          });
        } else if (row.report === 'Quarter') {
          Object.assign(update.$setOnInsert, {
            quarterlyCommissionPerPoints: row.quarterlyCommissionPerPoints,
            quarterlyCommission: row.quarterlyCommission
          });
        } else if (row.report === 'Annual') {
          Object.assign(update.$setOnInsert, {
            annualCommissionPerPoints: row.annualCommissionPerPoints,
            annualSpecialCommission: row.annualSpecialCommission
          });
        }

        return {
          updateOne: {
            filter,
            update,
            upsert: true
          }
        };
      });

      if (rows[0].report === 'Month') {
        await Users.bulkWrite(bulkOps);
      } else if (rows[0].report === 'Quarter') {
        await Quarterly.bulkWrite(bulkOps);
      } else if (rows[0].report === 'Annual') {
        await Annual.bulkWrite(bulkOps);
      }

      console.log('Bulk write completed.');
    } catch (error) {
      console.error('Error in bulk write:', error);
    }
  }
}

const excelIns = new Excel();
module.exports = excelIns;
