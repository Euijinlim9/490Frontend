import React, { useEffect, useState } from "react";
import "../../styles/CoachApplication.css";

function CoachApplication(){
    const[coaches, setCoaches] = useState([]);
    const [selectedCoach, setSelectedCoach] = useState(null);

    useEffect(() => {
        const token = localStorage.getItem("token");
        const fetchData = async () => {
            try{
                const [coachInfo, qualInfo, certInfo] = await Promise.all([
                    fetch("http://localhost:4000/api/coach",{
                        headers: { Authorization: `Bearer ${token}` },
                    }),
                    fetch("http://localhost:4000/api/qualifications",{
                        headers: { Authorization: `Bearer ${token}` },
                    }),
                    fetch("http://localhost:4000/api/certifications",{
                        headers: { Authorization: `Bearer ${token}` },
                    }),
                ]);
                const coaches = await coachInfo.json();
                const qualifications = await qualInfo.json();
                const certifications = await certInfo.json();
                const merged = coaches.map((coach) => {
                    const qualification = qualifications.find(
                        (q) => q.coach_id === coach.user_id
                    );
                    const coachCerts = certifications.filter(
                        (c) => c.coach_id === coach.user_id
                    );
                    return {
                        ...coach,
                        ...qualification,
                        certifications: coachCerts,
                    };
                });
                setCoaches(merged);
            } catch (err) {
                console.error("No available Information", err);
            }
        };
        fetchData();
    }, []);

    return(
    <div className="coach-app-container">
        {coaches.map((coach) => (
          <div
            key={coach.user_id}
            className="coach-app-card"
          >
            <h3>
              {coach.first_name} {coach.last_name}
            </h3>
                    <button className="view-btn" onClick={() => setSelectedCoach(coach)}>
                        VIEW
                    </button>
                    <div className="btn-footer">
                        <button className="accept-btn">
                            ACCEPT
                            </button>
                            <button className="reject-btn" type="button">
                                REJECT
                            </button>
            </div>
          </div>
          ))}
          {selectedCoach && (
            <div className="modal-container" onClick={() => setSelectedCoach(null)}>
                <div className="modal" onClick={(e)=> e.stopPropagation()}>
                    <div className="modal-header2">
                        <h2>{selectedCoach.first_name} {selectedCoach.last_name}'s Application</h2>
                    </div>
                    <div className="modal-content">
                        <p>Name: {selectedCoach.first_name} {selectedCoach.last_name}</p>
                        <p>Email: {selectedCoach.email}</p>
                        <p>Phone Number: {selectedCoach.phone}</p>
                        <h5>Certifications:</h5>
                        {selectedCoach.certifications?.map((c, i) => (
                            <div key={c.certification_id}>
                                <p>Status: {c.status}</p>
                                <a href={c.document_url}
                                target="_blank"
                                rel="noreferrer">
                                    View Document
                                </a>
                            </div>
                        ))}
                    </div>
                    <div className="btn-footer">
                        <button className="accept-btn">
                            ACCEPT
                        </button>
                        <button className="reject-btn" type="button">
                            REJECT
                        </button>
            </div>
            <button className="view-btn" type="button" onClick={() => setSelectedCoach(null)}>
                BACK
            </button>
            </div>

            </div>
          )}
          </div>
    );
}

export default CoachApplication;

