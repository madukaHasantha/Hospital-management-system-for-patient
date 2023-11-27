const nodemailer = require("nodemailer");
const bcrypt = require("bcrypt");
const db = require("../databaseConnection");
const constants = require("../config/constant");
const { DateTime } = require('luxon');
const schedule = require('node-schedule');




async function getUserIdByEmail(emailId) {
    try {

      return new Promise((resolve, reject) => {

        db.query(constants.GET_PATIENT_ID_BY_EMAIL, [emailId], (err, result) => {

          if (err) {

            console.error("Error executing SQL query getUserIdByEmail! ", err);
            reject(err);

          } else {

            if (result.length === 0) {

              console.log("User not found");
              resolve(null);

            } else {

              console.log(`User found: ${result[0].PATIENT_ID}`);
              resolve(result[0].PATIENT_ID);
            }
          }
        });
      });
    } catch (error) {
      console.error("Error executing SQL query:", error);
      throw error;
    }
  }
  


  

async function deleteOTP(patientID) {

  try{

      console.log('deleteOTP Function called after 8 minutes');
      console.log(patientID);

      await db.query(constants.DELETE_OTP, [patientID]);

      console.log("Successfully Deleted OTP!");
      



  } catch (error){

    console.log("Error with Deleting OTP!");
    console.error("Error adding OTP:", error);
    throw error;
    

  }

};



async function addOTP(newOTP) {

  try {
        var params = [newOTP.PATIENT_ID, newOTP.OTP_NUMBER, newOTP.OTP_VALIDITY_PERIOD];

        await db.query(constants.ADD_OTP, params);

        console.log("OTP added successfully");

        const delayInMilliseconds = 5 * 60 * 1000; // 5 minutes

        // Pass a function reference to scheduleJob, not the result of the function call
        const job = await schedule.scheduleJob(new Date(Date.now() + delayInMilliseconds), () => {
          deleteOTP(newOTP.PATIENT_ID);
      });

  } catch (error) {

    console.error("Error adding OTP:", error);
    throw error;
  }
}

  

async function sendOTP({ emailId, subject, message, duration = "5 min" }) {
  try {
    if (!(emailId && subject && message)) {
      throw new Error("Please provide values");
    }

    const genaratedOTP = `${1000 + Math.floor(Math.random() * 9000)}`;

    let transporter = nodemailer.createTransport({
      host: "smtp-mail.outlook.com",
      port: 587,
      secure: false,
      auth: {
        user: 'maduka970601@hotmail.com',
        pass: 'Maduka123'
      }
    });



    transporter.verify((error, success) => {

      if (error) {
            console.log(error);
      } else {
            console.log("Ready for sending emails");
      }
    });



    const mailOptions = {
      from: 'maduka970601@hotmail.com',
      to: emailId,
      subject,
      html: `<p>${message}</p><p>${genaratedOTP}</p><p>The duration is: ${duration}</p>`,
    };


    await transporter.sendMail(mailOptions);
    console.log("Email sent successfully");

    const hashedOTP = await bcrypt.hash(genaratedOTP, 10);

    const userId = await getUserIdByEmail(emailId);
    console.log(`The user ID: ${userId}`)
    

    // Create a DateTime instance for the current moment in the Colombo time zone (Asia/Colombo)
    const colomboDateTime = DateTime.local().setZone('Asia/Colombo');
    // Add 15 minutes to the colomboDateTime
    const futureColomboDateTime = colomboDateTime.plus({ minutes: 5 });
    // Format the futureColomboDateTime in the desired format
    const formattedFutureColomboTime = futureColomboDateTime.toFormat('yyyy-MM-dd HH:mm:ss');
    console.log(formattedFutureColomboTime);


    if (userId !== null) {

        const newOTPRecord = {

            PATIENT_ID: userId,
            OTP_NUMBER: hashedOTP,
            OTP_VALIDITY_PERIOD: formattedFutureColomboTime
        };


      OTPaddingResult = await addOTP(newOTPRecord);

      if (OTPaddingResult !== null) {

           return "OTP sent, hashed, and stored successfully";

      }else{

           return "OTP stored error!";
      }

    }else{

        return "The User is not found in this email! ";
    }

    
  } catch (error) {
    console.error("Error sending OTP:", error);
    throw error;
  }
}

module.exports = {
  sendOTP, getUserIdByEmail
};
