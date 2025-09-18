import React, { useEffect, useState } from "react";
import { db } from "../../firebase";
import { collection, getDocs, addDoc } from "firebase/firestore";

const Jobs = () => {
  const [jobs, setJobs] = useState([]);
  const [newJob, setNewJob] = useState("");

  useEffect(() => {
    const fetchJobs = async () => {
      const querySnapshot = await getDocs(collection(db, "jobs"));
      setJobs(querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    };
    fetchJobs();
  }, []);

  const addJob = async () => {
    if (!newJob.trim()) return;
    await addDoc(collection(db, "jobs"), { name: newJob });
    setNewJob("");
    window.location.reload();
  };

  return (
    <div className="p-6">
      <h1 className="text-xl font-bold mb-4">Jobs</h1>
      <div className="flex gap-2 mb-4">
        <input
          type="text"
          value={newJob}
          onChange={(e) => setNewJob(e.target.value)}
          placeholder="New Job"
          className="border p-2 rounded w-full"
        />
        <button
          onClick={addJob}
          className="bg-purple-600 text-white px-4 py-2 rounded"
        >
          Add
        </button>
      </div>
      <ul className="list-disc pl-6">
        {jobs.map((j) => (
          <li key={j.id}>{j.name}</li>
        ))}
      </ul>
    </div>
  );
};

export default Jobs;
