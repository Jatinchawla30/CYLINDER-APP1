import React, { useEffect, useState } from "react";
import { db } from "../../firebase";
import { collection, getDocs, addDoc } from "firebase/firestore";

const Suppliers = () => {
  const [suppliers, setSuppliers] = useState([]);
  const [newSupplier, setNewSupplier] = useState("");

  useEffect(() => {
    const fetchSuppliers = async () => {
      const querySnapshot = await getDocs(collection(db, "suppliers"));
      setSuppliers(querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    };
    fetchSuppliers();
  }, []);

  const addSupplier = async () => {
    if (!newSupplier.trim()) return;
    await addDoc(collection(db, "suppliers"), { name: newSupplier });
    setNewSupplier("");
    window.location.reload();
  };

  return (
    <div className="p-6">
      <h1 className="text-xl font-bold mb-4">Suppliers</h1>
      <div className="flex gap-2 mb-4">
        <input
          type="text"
          value={newSupplier}
          onChange={(e) => setNewSupplier(e.target.value)}
          placeholder="New Supplier"
          className="border p-2 rounded w-full"
        />
        <button
          onClick={addSupplier}
          className="bg-green-600 text-white px-4 py-2 rounded"
        >
          Add
        </button>
      </div>
      <ul className="list-disc pl-6">
        {suppliers.map((s) => (
          <li key={s.id}>{s.name}</li>
        ))}
      </ul>
    </div>
  );
};

export default Suppliers;
