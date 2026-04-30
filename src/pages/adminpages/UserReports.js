import React, { useState, useEffect }from "react";
import "../../styles/UserReports.css"
import "../../styles/Coach.css"

function UserReport(){
    const[reports, setReports]=useState([]);
    const [selectedReport, setSelectedReport] = useState(null);
    const [query, setQuery] = useState("");
    const [searchQuery, setSearchQuery] = useState("");
    const [filter, setFilter] = useState("");

    useEffect(() =>{
        const fetchReports = async () => {
            try {
                const token = localStorage.getItem("token");
                const res = await fetch ("http://localhost:4000/admin/coach-reports",
                {
                    headers: {Authorization: `Bearer ${token}`,},
                }
    );
    const data = await res.json();

    if (!res.ok) {
        throw new Error(data.message || "Failed to fetch reports");
    }
    setReports(data.reports);
} catch (err){
    console.error("Error fetching reports:", err);
}
        };
        fetchReports();

    }, []);

    const handleSearch = () => {
    setSearchQuery(query);
};

    const filteredReports = reports.filter((r) => {
    if (!searchQuery) return true;

    const search = searchQuery.toLowerCase();
    const name = `${r.coach?.first_name || ""} ${r.coach?.last_name || ""}`.toLowerCase();
    const category = (r.category || "").toLowerCase();
    const severity = (r.severity || "").toLowerCase();
    const status = (r.status || "").toLowerCase();

    if (filter === "name") {
      return name.includes(search);
    }

    if (filter === "category") {
      return category.includes(search);
    }

    if (filter === "severity") {
      return severity.includes(search);
    }

    if (filter === "status") {
      return status.includes(search);
    }

    return (
      name.includes(search) ||
      category.includes(search) ||
      severity.includes(search) ||
      status.includes(search)
    );
  });

    return(
        <div className="report-container">
            <div className="report-header">
                <h2>Coach Reports</h2>
                <div className="search-container">
                    <input
                    type="text"
                    placeholder="Search Coach Reports"
                    className="search-input"
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    onKeyDown={(e) => {
                        if (e.key === "Enter") handleSearch();
                    }}
                    />
                    
                    <select
                    className="filter-dropdown"
                    value={filter}
                    onChange={(e) => setFilter(e.target.value)}
                    >
          <option value="" disabled>
            Filter
          </option>
          <option value="name">Coach Name</option>
          <option value="category">Category</option>
          <option value="severity">Severity</option>
          <option value="status">Status</option>
        </select>
        <button className="search-button" onClick={handleSearch}>
          Search
        </button>
            </div>
            </div>

            <table className="reports-table">
                <thead>
                    <tr>
                        <th>#</th>
                        <th>Coach</th>
                        <th>Category</th>
                        <th>Severity</th>
                        <th>Status</th>
                        <th>Date</th>
                        <th>Action</th>
                    </tr>
                </thead>
                <tbody>
                    {filteredReports.map((r,i) =>(
                        <tr key={r.report_id}>
                            <td>
                                <span className="font-style">
                                {i+1}
                                </span>
                            </td>
                            <td>
                                <span className="font-style">
                                {r.coach?.first_name} {r.coach?.last_name}
                                </span>
                            </td>
                            <td>
                                <span className="font-style">
                                {r.category}
                                </span>
                            </td>
                            
                            <td>
                                <span className={`badge severity-${r.severity}`}>
                                    {r.severity}
                                </span>
                            </td>
                            <td>
                                <span className={`badge status-${r.status}`}>
                                    {r.status}
                                </span>
                            </td>
                            <td>
                                <span className="font-style">
                                {new Date (r.created_at).toLocaleDateString()}
                                </span>
                            </td>
                            <td>
                                <button className="viewreport-btn" onClick={() => setSelectedReport(r)}>
                                    View
                                </button>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>

            {selectedReport && (
                <div className="modal-overlay" onClick={() => setSelectedReport(null)}>
                    <div className="report-modal" onClick={(e) => e.stopPropagation()}>
                        <h2>Coach Report Details</h2>
                        <p>
                            <strong>Coach:</strong>{" "}
                            <span className="font-style"></span>
                            {selectedReport.coach?.first_name} {selectedReport.coach?.last_name}
                        </p>
                        <p>
                            <strong>Category:</strong>{" "}
                            <span className="font-style"></span>
                            {selectedReport.category}
                        </p>
                        <p>
                            <strong>Status:</strong>{" "}
                            <span className="font-style"></span>
                            {selectedReport.status}
                        </p>
                        <p>
                            <strong>Title:</strong>{" "}
                            {selectedReport.title}
                        </p>
                        <p>
                            <strong>Description:</strong>
                            <br />
                            {selectedReport.description}
                        </p>
                        <p>
                            <strong>Evidence:</strong>
                        </p>
                        {selectedReport.evidence_urls?.length ? (
                            selectedReport.evidence_urls.map((url, i) => (
                            <div key={i}>
                                <a href={url} target="_blank" rel="noreferrer">
                                    View File {i + 1}
                                </a>
                            </div>
                            ))
                        ) : (
                        <p>No evidence provided</p>
                        )}
                        <div className="report-btn-footer">
                        <button className="report-back-btn"onClick={() => setSelectedReport(null)}>
                            Back
                        </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

export default UserReport;
