
var db = require("../databaseConnection");
var validations = require("./patientValidation");
var constants = require("../config/constant");
const bcrypt = require("bcrypt");
const { Auth } = require("two-step-auth");
const nodemailer = require("nodemailer");
const sentEmailsToUser = require("./sendOTP");
const LoginUpdate = require("./loginupdate");
const { DateTime } = require('luxon');





module.exports.addPatient = async (req, res) => {
    try {
      if (
        !!req.body.patientId &&
        !!req.body.name &&
        !!req.body.dateOfBirth &&
        !!req.body.gender &&
        !!req.body.district &&
        !!req.body.address &&
        !!req.body.email &&
        !!req.body.phone &&
        !!req.body.userPassword &&
        !!req.body.userType
        
      ) {


        const colomboDateTime = DateTime.local().setZone('Asia/Colombo');
        // Format the colomboDateTime in the desired format
        const formattedColomboTime = colomboDateTime.toFormat('yyyy-MM-dd HH:mm:ss');
        const invaliedLoginCount = 0;
        const isActive = true;
        const softDelete = false;

        var errors = [];
        await db.query(constants.GET_PATIENT_BY_EMAIL, [req.body.email], (err, result) => {
          if (result.length != 0) {
            return res.status(400).json({ message: "Email is already exist" });
          } else {
            const data = {
              PATIENT_ID: req.body.patientId,
              NAME: req.body.name,
              DATE_OF_BIRTH: req.body.dateOfBirth,
              GENDER: req.body.gender,
              DISTRICT: req.body.district,
              ADDRESS: req.body.address,
              EMAIL: req.body.email,
              PHONE: req.body.phone,
              USER_PASSWORD: req.body.userPassword,
              DELETED: softDelete,
              USER_TYPE: req.body.userType,
              CREATED_DATE: formattedColomboTime,
              LAST_LOGIN_DATE: formattedColomboTime,
              INVALIED_LOGIN_COUNT: invaliedLoginCount,
              IS_ACTIVE: isActive,
            };
  
            if (errors.length == 0) {
              var params = [
                data.PATIENT_ID,
                data.NAME,
                data.DATE_OF_BIRTH,
                data.GENDER,
                data.DISTRICT,
                data.ADDRESS,
                data.EMAIL,
                data.PHONE,
                bcrypt.hashSync(data.USER_PASSWORD, 10),
                data.DELETED,
                data.USER_TYPE,
                data.CREATED_DATE,
                data.LAST_LOGIN_DATE,
                data.INVALIED_LOGIN_COUNT,
                data.IS_ACTIVE,
              ];
  
              db.query(constants.ADD_PATIENT, params, (err, result) => {
                if (err) {
                  return res.status(400).json({ error: err.message });
                } else {
                  console.log("A patient successfully added!")
                  return res.status(200).json({
                    message: "A patient successfully added!",
                    data: data,
                  });
                }
              });
            } else {
              return res.status(400).json({
                message: errors[0],
              });
            }
          }
        });
      } else {
        return res.status(400).json({
          message: "Please enter all the fields and try again!",
        });
      }
    } catch (e) {
      return res.status(400).json(e);
    }
  };
  



module.exports.getAllPatients = async (req, res) => {

    try {
      await db.query(constants.GET_ALL_PATIENT, (err, rows) => {
        if (err) {
          return res.status(400).json({ error: err.message });
        } else {
          return res.status(200).json({
            message: "Success",
            data: rows,
          });
        }
      });
    } catch (e) {
      return res.status(400).json(e);
    }
  };


  


  
  module.exports.loginPatient = async (req, res) => {
    try {
      const email = req.body.email;
      const password = req.body.userPassword;
      
  
      console.log(email);
      var data = {};
  
      await db.query(constants.GET_PATIENT_BY_EMAIL, [email], (err, result) => {

          console.log(result.length);
          if (result.length != 0) {

            if (err) {

              return res.status(400).json({ error: err.message });

            } else {

              data = result[0];

              
              if (bcrypt.compareSync(password, data.USER_PASSWORD)) {

                  db.query(constants.GET_LOGIN_STATUS, [email], (err, result) => {
                                  
                      const isActiveResult = result[0].IS_ACTIVE;
                      console.log(isActiveResult);

                    if(isActiveResult == 0){

                        login_update = LoginUpdate.loginUpdate(email);

                  
                        if(login_update !== null){
                         
                            return res.status(200).json({
                            message: "A user Details sucessfully updated and loged!",
                            });
    
                        }else{
    
                          return res.status(200).json({
                          message: "A user Details updating erorr!!",
                          });
                        }

                    }else{

                      console.log("you are already loged in!");
                      return res.status(400).json({message:"you are already loged in!" });
                      
                    }

                  });

              } else {

                incrementInvalidLoginCount(email);
                return res.status(400).json({
                  message: "Wrong Password!",
                });
              }
          }
        } else {
            
            return res.status(400).json({
              message: "you are not a user!",
            });
        }
      });
    } catch (e) {
      return res.status(400).json(e);
    }
  };

  
  async function incrementInvalidLoginCount(emailId) {
    try {
      
      await db.query(constants.INVALIED_LOGIN_COUNT_UPDATE, [emailId]);
      console.log("Invalid login count incremented!");

    } catch (error) {
      console.error("Error incrementing invalid login count:", error);
      throw error;
    }
  }


  module.exports.logout = async (req, res) => {

    try {

      const email = req.body.email;
      console.log(email);
      await db.query(constants.GET_PATIENT_BY_EMAIL, [email], (err, result) => {

              console.log(result.length);
              if (result.length != 0) {

                    if (err) {

                           console.log("Error with user finding!");
                           console.log(err);
                           return res.status(400).json({message:"Error with user finding!" });
                      
                      

                    } else {

                            db.query(constants.GET_LOGIN_STATUS, [email], (err, result) => {
                              
                              const isActiveResult = result[0].IS_ACTIVE;
                              console.log(isActiveResult);

                            if(isActiveResult == 1){

                                  const invaliedLoginCount = 0;
                                  const isActive = false;
            
                                  const data = {
                                    INVALIED_LOGIN_COUNT: invaliedLoginCount,
                                    IS_ACTIVE: isActive,
                                    EMAIL:email
                                    
                                  };
                        
                                var params = [data.INVALIED_LOGIN_COUNT, data.IS_ACTIVE, data.EMAIL];
                                db.query(constants.LOGOUT, params, (err, result) => {
          
                                if (err) {
          
                                        console.log("Error with log out!");
                                        console.log(err);
                                        return res.status(400).json({message:"Error with log out!" });
                                        
          
                                }else{
          
                                        console.log("The user logout!");
                                        return res.status(400).json({message:"The user logout!" });
                                        
                                }
          
                                });

                            }else{
                                    console.log("you are already logout!");
                                    return res.status(400).json({message:"you are already logout!" });

                            }
                      })
                    }

            } else {

              console.log("you are not a user!");
              console.log(err);
              return res.status(400).json({message:"you are not a user!" });
              
            }
      });

    } catch (e) {
      return res.status(400).json(e);
    }
  };
  



module.exports.forgotPassword = async (req, res) => {
  try {
    const email = req.body.email;

    await db.query(constants.GET_PATIENT_BY_EMAIL, [email], async (err, result) => {

      if (err) {

        return res.status(400).json({ error: err.message });

      } else{

        if (result.length === 0) {

          
          return res.status(400).json({
            message: "You are not a user!",
          });
        }else{

          // Send OTP via email
          const otpDetails = {
            emailId: req.body.email,
            subject: "Email verification",
            message: "Verify your email with the code below.",
            duration: "5 min",
          };
        

            try {

              const createdEmailVerificationOTP = await sentEmailsToUser.sendOTP(otpDetails);
              res.status(200).json({ message: createdEmailVerificationOTP });
              
            } catch (error) {

              console.log(error);
              res.status(500).json({ message: "Error sending OTP via email" });
            }


        } 
        
      }  
      
        
        
    });
  } catch (e) {
    console.log(e);
    return res.status(400).json(e);
  }

};


module.exports.matchingOTP = async (req, res) => {

  try{

      const email = req.body.email;
      const otp = req.body.otp;
      

      const userId = await sentEmailsToUser.getUserIdByEmail(email);

      if (userId !== null) {

        await db.query(constants.GET_ALL_OTP_RECODE_BY_EMAIL, [userId], async (err, result) => {

          if (err) {

                onsole.log("SQL Error with get all otp recode!");
                console.log(err);
                return res.status(400).json({message:"SQL Error with get all otp recode!" });
            
          } else{

              if (result.length === 0){

                    
                    return res.status(400).json({message:"The OTP expired!!" });
                    onsole.log("The OTP expired!");

              }else{

                    console.log("OTP details found");
                    console.log(result[0].OTP_NUMBER);

                 if (bcrypt.compareSync(otp, result[0].OTP_NUMBER)) {

                      console.log("OTP number matched");
                      return res.status(400).json({message:"OTP number matched" });

                 }else{
                      
                      console.log("The OTP Number is wrong!!");
                      return res.status(400).json({message:"The OTP Number is wrong!!" }); 
                 }

                    

              }
            }    

        });


      }else{

        console.log("The User is not found in this email! ")
        return "The User is not found in this email! ";
      }
      

  }catch(e){

      return res.status(400).json(e);
  }

};


    
module.exports.resetPassword = async (req, res) =>{

  try{

        email = req.body.email
        newPassword = req.body.newPassword;
        hashedPassword = bcrypt.hashSync(newPassword, 10)

        await db.query(constants.UPDATE_PATIENT_PASSWORD, [hashedPassword, email], async (err, result) => {

          if (err) {

            onsole.log("SQL Error with reset password!");
            console.log(err);
            return res.status(400).json({message:"SQL Error with reset password!" });
        
          } else{

            //onsole.log("Password successfully reseted");
            return res.status(400).json({message:"Password successfully reseted" });
          }

        });


  }catch(e){

       return res.status(400).json(e);
  }
  




};

  