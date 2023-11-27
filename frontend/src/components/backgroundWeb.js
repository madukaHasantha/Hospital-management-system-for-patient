

import React from "react";
import "bootstrap/dist/css/bootstrap.min.css"; 
import patientImage from "../Images/patient.jpg";
import './backgroundWeb.css';

function BackgroundWeb() {
    return (
        <div className="container-fluid">
            <div className="row">
                <div className="col-sm-12 col-md-12 col-lg-9 col-xl-8 p-0">
                    <div className="test-imageDiv">
                        <img src={patientImage} alt="Image" className="img-fluid" />
                    </div>
                    <div className = "col-lg-4 col-xl-4 p-0"></div>
                </div>
            </div>
        </div>
    );
}

export default BackgroundWeb;
