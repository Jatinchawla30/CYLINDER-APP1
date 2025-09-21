import React, { useEffect, useState } from "react";
import { db } from "../../firebase";
import { collection, getDocs, addDoc } from "firebase/firestore";

const Customers = () => {
  const [customers, setCustomers] = useState([]);
  const [newCustomer, setNewCustomer] = useState("");

  useEffect(() => {
    const fetchCustomers = async () => {
      const querySnapshot = await getDocs(collection(db, "customers"));
      setCustomers(querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    };
    fetchCustomers();
  }, []);

  const addCustomer = async () => {
    if (!newCustomer.trim()) return;
    await addDoc(collection(db, "customers"), { name: newCustomer });
    setNewCustomer("");
    window.location.reload();
  };

  return (
    <div className="p-6">
      <h1 className="text-xl font-bold mb-4">Customers</h1>
      <div className="flex gap-2 mb-4">
        <input
          type="text"
          value={newCustomer}
          onChange={(e) => setNewCustomer(e.target.value)}
          placeholder="New Customer"
          className="border p-2 rounded w-full"
        />
        <button
          onClick={addCustomer}
          className="bg-yellow-600 text-white px-4 py-2 rounded"
        >
          Add
        </button>
      </div>
      <ul className="list-disc pl-6">
        {customers.map((c) => (
          <li key={c.id}>{c.name}</li>
        ))}
      </ul>
    </div>
  );
};

export default Customers;
