import React, { useEffect, useState } from "react";
import { db } from "../../firebase";
import { collection, getDocs, addDoc } from "firebase/firestore";

const Payments = () => {
  const [payments, setPayments] = useState([]);
  const [newPayment, setNewPayment] = useState("");

  useEffect(() => {
    const fetchPayments = async () => {
      const querySnapshot = await getDocs(collection(db, "payments"));
      setPayments(querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    };
    fetchPayments();
  }, []);

  const addPayment = async () => {
    if (!newPayment.trim()) return;
    await addDoc(collection(db, "payments"), { description: newPayment });
    setNewPayment("");
    window.location.reload();
  };

  return (
    <div className="p-6">
      <h1 className="text-xl font-bold mb-4">Payments</h1>
      <div className="flex gap-2 mb-4">
        <input
          type="text"
          value={newPayment}
          onChange={(e) => setNewPayment(e.target.value)}
          placeholder="New Payment"
          className="border p-2 rounded w-full"
        />
        <button
          onClick={addPayment}
          className="bg-red-600 text-white px-4 py-2 rounded"
        >
          Add
        </button>
      </div>
      <ul className="list-disc pl-6">
        {payments.map((p) => (
          <li key={p.id}>{p.description}</li>
        ))}
      </ul>
    </div>
  );
};

export default Payments;
