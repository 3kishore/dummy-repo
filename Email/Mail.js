const nodemailer = require('nodemailer')
const EmailDetails = require('../Email/EmailDetails')
require('dotenv').config()

const Mail = async(ToMailAddress,mailsubject,mailtext)=>{
    const transporter = nodemailer.createTransport({
        service: process.env.Service,
        auth: {
            user: EmailDetails.FromAddress,
            pass: EmailDetails.EmailPassword
        }
    });
    var mailoptions = {
        from:EmailDetails.FromAddress,
        to:ToMailAddress,
        subject:mailsubject,
        text:mailtext
    }

    transporter.sendMail(mailoptions,(error,info)=>{
            if(error){
                console.log(error)
            }
            else{
                console.log('Email sent:'+info.response)
            }
    })
}

module.exports = Mail;
