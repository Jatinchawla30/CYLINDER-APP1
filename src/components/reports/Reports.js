import React, { useEffect, useState } from "react";
import { db } from "../../firebase";
import { collection, getDocs } from "firebase/firestore";

const Reports = () => {
  const [reports, setReports] = useState([]);

  useEffect(() => {
    const fetchReports = async () => {
      const querySnapshot = await getDocs(collection(db, "reports"));
      setReports(querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    };
    fetchReports();
  }, []);

  return (
    <div className="p-6">
      <h1 className="text-xl font-bold mb-4">Reports</h1>
      {reports.length === 0 ? (
        <p>No reports available</p>
      ) : (
        <ul className="list-disc pl-6">
          {reports.map((r) => (
            <li key={r.id}>{r.title || "Untitled Report"}</li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default Reports;
