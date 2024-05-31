const nodemailer = require('nodemailer')
require('dotenv').config()

const Mail = async(ToMailAddress,mailsubject,mailtext)=>{
    const transporter = nodemailer.createTransport({
        service: process.env.Service,
        auth: {
            user: process.env.SenderEmail,
            pass: process.env.EmailPassword
        }
    });
    var mailoptions = {
        from:process.env.SenderEmail,
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
