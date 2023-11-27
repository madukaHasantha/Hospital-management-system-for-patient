

var patientRoutes = require("./patient/patient.routes.js");

module.exports = function (app) {
    
      app.use("/api/exeve/patientRoutes", patientRoutes);
     
  };