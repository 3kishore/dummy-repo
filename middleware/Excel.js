const XLSX = require('xlsx');
const Users = require('../Schema/Orders');
const PointsSchema = require('../Schema/Points');

const SHEET_NAME = 'Orders';
const REQUIRED_COLUMN = 'A';
const MAXIMUM_ROW_NUMBER = 1000000;

class Excel {
  async importData(path) {
    try {
      await this.importUsers(path);
      console.log('Upload finished!................... ^_^');
    } catch (error) {
      console.error('Error uploading data:', error);
    }
  }

  async importUsers(path) {
    try {
      const workbook = XLSX.readFile(path);
      const worksheet = workbook.Sheets[SHEET_NAME];
      console.log('Processing user data...');

      for (let row = 2; row <= MAXIMUM_ROW_NUMBER; row++) {
        if (!worksheet[`${REQUIRED_COLUMN}${row}`]) {
          break; // Stop if no more data
        }

        const rowIns = this.parseRow(worksheet, row);
        await this.addUser(rowIns);
      }

      console.log('User data upload complete!');
    } catch (error) {
      console.error('Error processing user data:', error);
    }
  }

  parseRow(sheet, row) {
    return {
      orderNo: sheet[`A${row}`]?.w,
      orderStatus: sheet[`B${row}`]?.w || '',
      orderDate: sheet[`C${row}`]?.w || '',
      firstName: sheet[`E${row}`]?.w || '',
      lastName: sheet[`F${row}`]?.w || '',
      address: sheet[`H${row}`]?.w || '',
      city: sheet[`I${row}`]?.w || '',
      postalCode: sheet[`K${row}`]?.w || '',
      emailId: sheet[`M${row}`]?.w || '',
      phNo: sheet[`N${row}`]?.w || '',
      orderTotal: sheet[`X${row}`]?.w || '',
      discountAmount: sheet[`AJ${row}`]?.w || '',
      netAmount: sheet[`AH${row}`]?.w || '',
      courseName: sheet[`AF${row}`]?.w || '',
      empCode: sheet[`AI${row}`]?.w || ''
    };
  }

  async addUser(rowIns) {
    try {
      const existingOrder = await Users.findOne({ orderNo: rowIns.orderNo, empCode: rowIns.empCode });
      if (existingOrder) {
        console.log(`Order No: ${rowIns.orderNo} for EmpCode: ${rowIns.empCode} already exists. Skipping...`);
        return;
      }

      const orderDate = new Date(rowIns.orderDate);
      orderDate.setDate(orderDate.getDate() + 1);
      const points = Number(rowIns.netAmount) / 250;

      const q1 = [4, 5, 6];
      const q2 = [7, 8, 9];
      const q3 = [10, 11, 12];
      const q4 = [1, 2, 3];
      let quarter = '';
      if (q1.includes(orderDate.getMonth() + 1)) {
        quarter = `q1-${orderDate.getFullYear()}-${orderDate.getFullYear() + 1}`;
      } else if (q2.includes(orderDate.getMonth() + 1)) {
        quarter = `q2-${orderDate.getFullYear()}-${orderDate.getFullYear() + 1}`;
      } else if (q3.includes(orderDate.getMonth() + 1)) {
        quarter = `q3-${orderDate.getFullYear()}-${orderDate.getFullYear() + 1}`;
      } else {
        quarter = `q4-${orderDate.getFullYear() - 1}-${orderDate.getFullYear()}`;
      }

      const userDoc = {
        orderNo: rowIns.orderNo,
        orderStatus: rowIns.orderStatus,
        orderDate: orderDate,
        orderMonth: orderDate.getMonth() + 1,
        orderQuarter: quarter,
        orderYear: orderDate.getFullYear(),
        firstName: rowIns.firstName,
        lastName: rowIns.lastName,
        address: rowIns.address,
        city: rowIns.city,
        postalCode: rowIns.postalCode,
        emailId: rowIns.emailId,
        phNo: rowIns.phNo,
        orderTotal: rowIns.orderTotal,
        discountAmount: rowIns.discountAmount,
        netAmount: rowIns.netAmount,
        points: points,
        courseName: rowIns.courseName,
        empCode: rowIns.empCode
      };

      const pointsDoc = {
        orderNo: rowIns.orderNo,
        empCode: rowIns.empCode,
        orderDate: orderDate,
        points: points,
      };

      // Insert user and points data
      await Users.create(userDoc);
      await PointsSchema.create(pointsDoc);
      console.log(`Inserted orderNo: ${rowIns.orderNo} for empCode: ${rowIns.empCode}`);
    } catch (error) {
      console.error('Error adding user:', error);
    }
  }
}

const excelIns = new Excel();
module.exports = excelIns;
