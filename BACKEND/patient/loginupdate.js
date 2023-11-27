var constants = require("../config/constant");
var db = require("../databaseConnection"); 
const { DateTime } = require('luxon');



async function loginUpdate(emailId) {

  try {

    return new Promise((resolve, reject) => {


        const colomboDateTime = DateTime.local().setZone('Asia/Colombo');
        // Format the colomboDateTime in the desired format
        const formattedColomboTime = colomboDateTime.toFormat('yyyy-MM-dd HH:mm:ss');
        
        console.log(formattedColomboTime);


        const Is_Active = true;
        const data = {
            LAST_LOGIN_DATE: formattedColomboTime,
            IS_ACTIVE: Is_Active,
            EMAIL: emailId
        };

        var params = [data.LAST_LOGIN_DATE, data.IS_ACTIVE, data.EMAIL];

        db.query(constants.LOGIN_UPDATE, params, (err, result) => {

            if (err) {

                console.error("Error executing SQL query of login update:", err);
                reject(err);
                resolve(null);

            } else {

                console.log("Login details updated successfully! :", result);
                resolve(result); // Resolve the promise with the result
            }
      });
    });
  } catch (error) {
    console.error("Error executing SQL query:", error);
    throw error;
    
  }
}

module.exports = {
  loginUpdate
};
