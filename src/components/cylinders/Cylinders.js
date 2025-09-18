import React, { useEffect, useState } from "react";
import { db } from "../../firebase";
import { collection, getDocs, addDoc } from "firebase/firestore";

const Cylinders = () => {
  const [cylinders, setCylinders] = useState([]);
  const [newCylinder, setNewCylinder] = useState("");

  useEffect(() => {
    const fetchCylinders = async () => {
      const querySnapshot = await getDocs(collection(db, "cylinders"));
      setCylinders(querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    };
    fetchCylinders();
  }, []);

  const addCylinder = async () => {
    if (!newCylinder.trim()) return;
    await addDoc(collection(db, "cylinders"), { name: newCylinder });
    setNewCylinder("");
    window.location.reload();
  };

  return (
    <div className="p-6">
      <h1 className="text-xl font-bold mb-4">Cylinders</h1>
      <div className="flex gap-2 mb-4">
        <input
          type="text"
          value={newCylinder}
          onChange={(e) => setNewCylinder(e.target.value)}
          placeholder="New Cylinder"
          className="border p-2 rounded w-full"
        />
        <button
          onClick={addCylinder}
          className="bg-blue-600 text-white px-4 py-2 rounded"
        >
          Add
        </button>
      </div>
      <ul className="list-disc pl-6">
        {cylinders.map((c) => (
          <li key={c.id}>{c.name}</li>
        ))}
      </ul>
    </div>
  );
};

export default Cylinders;
