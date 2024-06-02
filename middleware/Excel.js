const XLSX = require('xlsx');
const Users = require('../Schema/Orders');

const filePath = 'Orders.xlsx';
const sheet = 'Sheet1';
const requiredColumn = 'A';
const maximumRowNumber = 1000000;

class Excel {
  async importData() {
    try{
      /* Promise all take array of independent commands */
      await Promise.all([this.importUsers()]).then(() => {
        console.log('Uploaded finished!................... ^_^');
      });
    }
    catch(error){
      throw error;
    }
    
    
  }

  async importUsers() {
    try {
      const xlsx = XLSX.readFile(filePath);
      const range = xlsx.Sheets[sheet];
  
      console.log('Users data uploaded...');
  
      for (let row = 2; row <= maximumRowNumber; ++row) {
        if (!range[`${requiredColumn}${row}`]) {
          break; // stop if no another  data
        }
  
        const rowIns = {
          orderNo: range[`A${row}`].w,
          orderStatus: range[`B${row}`] ? range[`B${row}`].w : '',
          orderDate: range[`C${row}`] ? range[`C${row}`].w : '',
          firstName: range[`E${row}`] ? range[`E${row}`].w : '',
          lastName: range[`F${row}`] ? range[`F${row}`].w : '',
          address: range[`H${row}`] ? range[`H${row}`].w : '',
          city: range[`I${row}`] ? range[`I${row}`].w : '',
          postalCode: range[`K${row}`] ? range[`K${row}`].w : '',
          emailId: range[`M${row}`] ? range[`M${row}`].w : '',
          phNo: range[`N${row}`] ? range[`N${row}`].w : '',
          orderTotal: range[`X${row}`] ? range[`X${row}`].w : '',
          discountAmount: range[`AJ${row}`] ? range[`AJ${row}`].w : '',
          netAmount: range[`AH${row}`] ? range[`AH${row}`].w : '',
          courseName: range[`AF${row}`] ? range[`AF${row}`].w : '',
          empCode: range[`AL${row}`] ? range[`AL${row}`].w : '',
      };
  
       await this.addUser(rowIns);
        // this.updateUser(rowIns);
      }
      console.log('Users Done!');
      
    } catch (error) {
      throw error;
      
    }
  }


  async addUser(rowIns) {

    try {
      const result = await Users.find({"empCode": rowIns.empCode,"orderNo": rowIns.orderNo})
    console.log(result.length);
    if (result.length == 0){
    const points = Number(rowIns.orderTotal/250)
    let orderDate = new Date(rowIns.orderDate)

        const userIns = new Users({
          orderNo: rowIns.orderNo,
          orderStatus : rowIns.orderStatus,
          orderDate: orderDate.getTime(),
          firstName : rowIns.firstName, 
          lastName: rowIns.lastName,
          address: rowIns.address,
          city: rowIns.city,
          postalCode: rowIns.postalCode,
          emailId: rowIns.emailId,
          phNo:rowIns.phNo,
          orderTotal:rowIns.orderTotal,
          discountAmount:rowIns.discountAmount,
          netAmount:rowIns.netAmount,
          points:points,
          courseName:rowIns.courseName,
          empCode:rowIns.empCode,

        });
    userIns.save();
      }
    } catch (error) {
      throw error;
      
    }
    
  }
}

const excelIns = new Excel();
module.exports = excelIns;
