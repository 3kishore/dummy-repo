const XLSX = require('xlsx');
const Users = require('../Schema/Orders');

const sheet = 'Orders';
const requiredColumn = 'A';
const maximumRowNumber = 1000000;
const batchSize = 500; // Adjust batch size as needed

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
      const xlsx = XLSX.readFile(path);
      const range = xlsx.Sheets[sheet];
      const usersData = [];

      console.log('Processing user data...');

      for (let row = 2; row <= maximumRowNumber; ++row) {
        if (!range[`${requiredColumn}${row}`]) {
          break; // stop if no more data
        }

        const rowIns = {
          orderNo: range[`A${row}`]?.w,
          orderStatus: range[`B${row}`]?.w || '',
          orderDate: range[`C${row}`]?.w || '',
          firstName: range[`E${row}`]?.w || '',
          lastName: range[`F${row}`]?.w || '',
          address: range[`H${row}`]?.w || '',
          city: range[`I${row}`]?.w || '',
          postalCode: range[`K${row}`]?.w || '',
          emailId: range[`M${row}`]?.w || '',
          phNo: range[`N${row}`]?.w || '',
          orderTotal: range[`X${row}`]?.w || '',
          discountAmount: range[`AJ${row}`]?.w || '',
          netAmount: range[`AH${row}`]?.w || '',
          courseName: range[`AF${row}`]?.w || '',
          empCode: range[`AI${row}`]?.w || ''
        };

        usersData.push(rowIns);

        // Insert in batches
        if (usersData.length === batchSize) {
          await this.addUsers(usersData);
          usersData.length = 0; // Clear the array
        }
      }

      // Insert remaining records
      if (usersData.length > 0) {
        await this.addUsers(usersData);
      }

      console.log('User data upload complete!');
    } catch (error) {
      console.error('Error processing user data:', error);
    }
  }

  async addUsers(usersData) {
    try {
      const userDocs = usersData.map(rowIns => {
        const orderDate = new Date(rowIns.orderDate);
        orderDate.setDate(orderDate.getDate() +1)
        const points = Number(rowIns.netAmount / 250);

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

        return {
          orderNo: rowIns.orderNo,
          orderStatus: rowIns.orderStatus,
          orderDate: orderDate.getTime()+1,
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
      });

      // Perform batch insert
      await Users.insertMany(userDocs, { ordered: false });
    } catch (error) {
      console.error('Error adding users:', error);
    }
  }
}

const excelIns = new Excel();
module.exports = excelIns;
