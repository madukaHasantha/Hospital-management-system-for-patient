

import React from "react";
import patientImage from "../Images/patient.jpg";
import './backgroundWeb.css'

function BackgroundWeb() {
    return (
        <div className="container">
            <div className="row">
                <div className="col-8 p-0" >
                    <div className="test-imageDiv" style={{}}>
                        <img src={patientImage} alt="Image" style={{ height: "100vh"}}/>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default BackgroundWeb;
