const sendGRIDkey ='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'
const sgMail = require('@sendgrid/mail')
sgMail.setApiKey(sendGRIDkey)

const SendEmail =  (link,receiver) => {
    var emailText = '<!DOCTYPE html><html><head><meta charset="UTF-8"></head><body><a clicktracking=off href='+link+'>CLICK HERE TO CONFIRM YOUR EMAIL</a></body></html>'
    sgMail.send({
        to: receiver,
        from:'tathung.94.2014@gmail.com',
        subject:'[Online Academy] Confirm your email',
        html: emailText
    })
}
module.exports =  SendEmail
