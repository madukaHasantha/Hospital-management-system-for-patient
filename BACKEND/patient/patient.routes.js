
var Router = require("express");
var patientController = require("./patientController.js");

const routes = new Router();



routes.post("/add_patient", patientController.addPatient);
//routes.post("/update_patient", patientController.updatePatient);
routes.get("/get_all_patients", patientController.getAllPatients);
// routes.get("/get_patient_byID", patientController.getPatientByID);
//routes.get("/soft_delete_patient", patientController.softDeletePatient);
//routes.get("/delete_patient", patientController.DeletePatient);
routes.post("/login_patient", patientController.loginPatient);
routes.post("/forgot_password", patientController.forgotPassword);
routes.post("/logout", patientController.logout);
routes.post("/match_otp", patientController.matchingOTP);
routes.post("/reset_password", patientController.resetPassword);




module.exports = routes;