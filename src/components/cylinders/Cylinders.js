// src/components/cylinders/Cylinders.js
import React, { useEffect, useState } from "react";
import { collection, addDoc, getDocs, deleteDoc, doc, updateDoc } from "firebase/firestore";
import { db } from "../../firebase";

const Cylinders = () => {
  const [cylinders, setCylinders] = useState([]);
  const [newCylinder, setNewCylinder] = useState({ name: "", size: "", status: "Available" });
  const [editingId, setEditingId] = useState(null);
  const [editData, setEditData] = useState({ name: "", size: "", status: "" });

  // Fetch cylinders
  useEffect(() => {
    const fetchCylinders = async () => {
      const querySnapshot = await getDocs(collection(db, "cylinders"));
      setCylinders(querySnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() })));
    };
    fetchCylinders();
  }, []);

  // Add cylinder
  const handleAdd = async () => {
    if (!newCylinder.name || !newCylinder.size) return;
    const docRef = await addDoc(collection(db, "cylinders"), newCylinder);
    setCylinders([...cylinders, { id: docRef.id, ...newCylinder }]);
    setNewCylinder({ name: "", size: "", status: "Available" });
  };

  // Delete cylinder
  const handleDelete = async (id) => {
    await deleteDoc(doc(db, "cylinders", id));
    setCylinders(cylinders.filter((c) => c.id !== id));
  };

  // Start editing
  const handleEdit = (cylinder) => {
    setEditingId(cylinder.id);
    setEditData({ name: cylinder.name, size: cylinder.size, status: cylinder.status });
  };

  // Save edit
  const handleUpdate = async () => {
    const cylinderRef = doc(db, "cylinders", editingId);
    await updateDoc(cylinderRef, editData);
    setCylinders(cylinders.map((c) => (c.id === editingId ? { id: editingId, ...editData } : c)));
    setEditingId(null);
    setEditData({ name: "", size: "", status: "" });
  };

  return (
    <div>
      <h1 className="text-2xl font-bold mb-4">Cylinders</h1>

      {/* Add Cylinder Form */}
      <div className="flex gap-2 mb-4">
        <input
          type="text"
          placeholder="Cylinder Name"
          className="border p-2 rounded"
          value={newCylinder.name}
          onChange={(e) => setNewCylinder({ ...newCylinder, name: e.target.value })}
        />
        <input
          type="text"
          placeholder="Size"
          className="border p-2 rounded"
          value={newCylinder.size}
          onChange={(e) => setNewCylinder({ ...newCylinder, size: e.target.value })}
        />
        <button
          onClick={handleAdd}
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
        >
          Add
        </button>
      </div>

      {/* Cylinder List */}
      <ul className="space-y-2">
        {cylinders.map((c) => (
          <li key={c.id} className="flex justify-between items-center bg-white shadow p-3 rounded">
            {editingId === c.id ? (
              <div className="flex gap-2">
                <input
                  type="text"
                  className="border p-2 rounded"
                  value={editData.name}
                  onChange={(e) => setEditData({ ...editData, name: e.target.value })}
                />
                <input
                  type="text"
                  className="border p-2 rounded"
                  value={editData.size}
                  onChange={(e) => setEditData({ ...editData, size: e.target.value })}
                />
                <select
                  className="border p-2 rounded"
                  value={editData.status}
                  onChange={(e) => setEditData({ ...editData, status: e.target.value })}
                >
                  <option value="Available">Available</option>
                  <option value="In Use">In Use</option>
                  <option value="Damaged">Damaged</option>
                </select>
                <button
                  onClick={handleUpdate}
                  className="bg-green-600 text-white px-3 py-1 rounded hover:bg-green-700"
                >
                  Save
                </button>
              </div>
            ) : (
              <>
                <span>{c.name} ({c.size}) - {c.status}</span>
                <div className="flex gap-2">
                  <button
                    onClick={() => handleEdit(c)}
                    className="bg-yellow-500 text-white px-3 py-1 rounded hover:bg-yellow-600"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => handleDelete(c.id)}
                    className="bg-red-600 text-white px-3 py-1 rounded hover:bg-red-700"
                  >
                    Delete
                  </button>
                </div>
              </>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
};

export default Cylinders;
