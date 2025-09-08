// src/components/suppliers/Suppliers.js
import React, { useEffect, useState } from "react";
import { collection, addDoc, getDocs, deleteDoc, doc } from "firebase/firestore";
import { db } from "../../firebase";

const Suppliers = () => {
  const [suppliers, setSuppliers] = useState([]);
  const [newSupplier, setNewSupplier] = useState({ name: "", contact: "", email: "" });

  // Fetch suppliers
  useEffect(() => {
    const fetchSuppliers = async () => {
      const querySnapshot = await getDocs(collection(db, "suppliers"));
      setSuppliers(querySnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() })));
    };
    fetchSuppliers();
  }, []);

  // Add supplier
  const handleAdd = async () => {
    if (!newSupplier.name || !newSupplier.contact) return;
    const docRef = await addDoc(collection(db, "suppliers"), newSupplier);
    setSuppliers([...suppliers, { id: docRef.id, ...newSupplier }]);
    setNewSupplier({ name: "", contact: "", email: "" });
  };

  // Delete supplier
  const handleDelete = async (id) => {
    await deleteDoc(doc(db, "suppliers", id));
    setSuppliers(suppliers.filter((s) => s.id !== id));
  };

  return (
    <div>
      <h1 className="text-2xl font-bold mb-4">Suppliers</h1>

      {/* Add Supplier Form */}
      <div className="flex gap-2 mb-4">
        <input
          type="text"
          placeholder="Supplier Name"
          className="border p-2 rounded"
          value={newSupplier.name}
          onChange={(e) => setNewSupplier({ ...newSupplier, name: e.target.value })}
        />
        <input
          type="text"
          placeholder="Contact"
          className="border p-2 rounded"
          value={newSupplier.contact}
          onChange={(e) => setNewSupplier({ ...newSupplier, contact: e.target.value })}
        />
        <input
          type="email"
          placeholder="Email"
          className="border p-2 rounded"
          value={newSupplier.email}
          onChange={(e) => setNewSupplier({ ...newSupplier, email: e.target.value })}
        />
        <button
          onClick={handleAdd}
          className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
        >
          Add
        </button>
      </div>

      {/* Supplier List */}
      <ul className="space-y-2">
        {suppliers.map((s) => (
          <li key={s.id} className="flex justify-between items-center bg-white shadow p-3 rounded">
            <span>{s.name} - {s.contact} - {s.email}</span>
            <button
              onClick={() => handleDelete(s.id)}
              className="bg-red-600 text-white px-3 py-1 rounded hover:bg-red-700"
            >
              Delete
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default Suppliers;
