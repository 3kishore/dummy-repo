const express = require('express');
const router = express.Router();
const Mail = require('../Email/Mail')
const EmailDetails = require('../Email/EmailDetails')

const authGuard = require('../middleware/auth-middleware');

router.post('/raise-support-ticket',authGuard,async(req,res)=>{
    try{
        // {
        //     "issueType": "Sales report related",
        //     "content": "sxcsc",
        //     "empCode": "TNCPPR0023",
        //     "emailId": "porulsusendran03@gmail.com"
        //   }

        const issueType = req.body.issueType
        const content = req.body.content
        const empCode = req.body.empCode
        const emailId = req.body.emailId

        const subject = "Support Ticket: Sales Report Issue"
        const message = `
            Dear Admin,

            A new issue has been submitted by empCode - ${empCode}. Please review the details below and take the necessary action.

            **Issue type:** ${issueType}

            **Issue Description:**
            ${content}

            Please prioritize this issue and update the submitter with the status and resolution at your earliest convenience. If you require any additional information, feel free to contact the submitter directly.

            Thank you for your prompt attention to this matter.

            Best regards,
            Support Team
            `;
        Mail(EmailDetails.FromAddress,subject,message)

        const empSubject = `Subject: New Issue Submitted: ${issueType}`

        const empmessage = `Dear ${empCode},

        We are pleased to inform you that your issue has been successfully submitted to the admin for further review.
        
        **Issue Description:**
        ${content}
        
        Our admin team is currently reviewing your submission and will get back to you with a resolution or further instructions as soon as possible. We appreciate your patience and understanding.
        
        If you have any additional information or updates regarding this issue, please feel free to reply to this email.
        
        Thank you for bringing this to our attention.
        
        Best regards,
        Support Team
        `;

        Mail(emailId,subject,empmessage)

        res.status(200).json({"status":true,"message":"success","content":null})
             
    }
    catch(err){
        console.log(err)
        res.status(500).json({"status":false,"message":"Failed","content":err.message})
    }

})

module.exports = router;
