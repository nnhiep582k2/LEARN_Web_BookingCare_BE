require('dotenv').config();
import nodemailer from "nodemailer";

const sendSimpleEmail = async (dataSend) => {
    // create reusable transporter object using the default SMTP transport
    let transporter = nodemailer.createTransport({
        // host: "smtp.gmail.com",
        service: 'gmail',
        port: 465, //587,
        secure: true, // true for 465, false for other ports
        auth: {
            user: process.env.EMAIL_APP,
            pass: process.env.EMAIL_APP_PASSWORD,
        },
    });

    // send mail with defined transport object
    let info = await transporter.sendMail({
        from: '"Booking care | NNHiep 👻" <nnhiep582k2@gmail.com>', // sender address
        to: dataSend.receiverEmail,
        subject: "Thông tin đặt lịch khám bệnh", // Subject line
        html: getBodyHtmlEmail(dataSend),
    });  
}

const getBodyHtmlEmail = (dataSend) => {
    let result = '';
    if(dataSend.language === 'vi') {
        result = `
            <h3>Xin chào ${dataSend.patientName}!</h3>
            <p>Bạn nhận được email này vì đã đặt lịch khám bệnh online trên BookingCare</p>
            <p>Thông tin đặt lịch khám bệnh:</p>
            <div><b>Thời gian: ${dataSend.time}</b></div>
            <div><b>Bác sĩ: ${dataSend.doctorName}</b></div>

            <p>Nếu các thông tin trên là đúng, vui lòng click vào đường link bên 
            dưới để xác nhận và hoàn tất thủ tục đặt lịch khám bệnh.</p>
            <div><a href=${dataSend.redirectLink} target="_blank">Click here</a></div>
            <div>Cảm ơn vì đã lựa chọn dịch vụ trên BookingCare! Chúc bạn một ngày tốt lành!</div>
        `
    };
    if(dataSend.language === 'en') {
        result = `
            <h3>Dear ${dataSend.patientName}!</h3>
            <p>You received this email because you booked an online medical appointment on BookingCare</p>
            <p>Information to schedule an appointment:</p>
            <div><b>Time: ${dataSend.time}</b></div>
            <div><b>Doctor: ${dataSend.doctorName}</b></div>

            <p>If the above information is correct, please click on the link below to confirm and complete 
            the procedure to book an appointment.</p>
            <div><a href=${dataSend.redirectLink} target="_blank">Click here</a></div>
            <div>Thank you for choosing the service on BookingCare! Wish you a good day!</div>
        `
    };
    return result;
}

const getBodyHtmlEmailRemedy = (dataSend) => {
    let result = '';
    if(dataSend.language === 'vi') {
        result = `
            <h3>Xin chào ${dataSend.patientName}!</h3>
            <p>Bạn nhận được email này vì đã đặt lịch khám bệnh online trên BookingCare thành công.</p>
            <p>Thông tin đơn thuốc/hóa đơn được gửi trong file đính kèm.</p>

            <div>Cảm ơn vì đã lựa chọn dịch vụ trên BookingCare! Chúc bạn một ngày tốt lành!</div>
        `
    };
    if(dataSend.language === 'en') {
        result = `
            <h3>Dear ${dataSend.patientName}!</h3>
            <p>You received this email because you booked an online medical appointment on BookingCare successfully.</p>
            <p>Prescription/invoice information is sent in the attached file.</p>

            <div>Thank you for choosing the service on BookingCare! Wish you a good day!</div>
        `
    };
    return result;
}

const sendAttachment = async (dataSend) => {
    // create reusable transporter object using the default SMTP transport
    let transporter = nodemailer.createTransport({
        // host: "smtp.gmail.com",
        service: 'gmail',
        port: 465, //587,
        secure: true, // true for 465, false for other ports
        auth: {
            user: process.env.EMAIL_APP,
            pass: process.env.EMAIL_APP_PASSWORD,
        },
    });

    // send mail with defined transport object
    let info = await transporter.sendMail({
        from: '"Booking care | NNHiep 👻" <nnhiep582k2@gmail.com>', // sender address
        to: dataSend.email,
        subject: "Kết quả đặt lịch khám bệnh", // Subject line
        html: getBodyHtmlEmailRemedy(dataSend),
        attachments: {
            // encoded string as an attachment
            filename: `remedy-${dataSend.patientId}-${new Date().getTime()}.png`,
            content: dataSend.imageBase64.split("base64,")[1],
            encoding: 'base64',
        },
    });  
}

module.exports = {
    sendSimpleEmail, sendAttachment
}