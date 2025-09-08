import { useState, useEffect } from "react";
import { db } from "../firebase";
import { collection, addDoc, getDocs } from "firebase/firestore";

const Cylinders = () => {
  const [cylinders, setCylinders] = useState([]);
  const [form, setForm] = useState({ name: "", size: "", status: "Available" });

  // Fetch cylinders
  useEffect(() => {
    const fetchCylinders = async () => {
      const querySnapshot = await getDocs(collection(db, "cylinders"));
      setCylinders(querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    };
    fetchCylinders();
  }, []);

  // Add new cylinder
  const handleSubmit = async (e) => {
    e.preventDefault();
    await addDoc(collection(db, "cylinders"), form);
    setForm({ name: "", size: "", status: "Available" });
    alert("Cylinder added!");
    window.location.reload();
  };

  return (
    <div className="p-6">
      <h2 className="text-xl font-bold mb-4">Manage Cylinders</h2>

      {/* Add cylinder form */}
      <form onSubmit={handleSubmit} className="space-y-3 mb-6">
        <input
          type="text"
          placeholder="Cylinder Name"
          value={form.name}
          onChange={(e) => setForm({ ...form, name: e.target.value })}
          className="border p-2 rounded w-full"
          required
        />
        <input
          type="text"
          placeholder="Size"
          value={form.size}
          onChange={(e) => setForm({ ...form, size: e.target.value })}
          className="border p-2 rounded w-full"
          required
        />
        <select
          value={form.status}
          onChange={(e) => setForm({ ...form, status: e.target.value })}
          className="border p-2 rounded w-full"
        >
          <option value="Available">Available</option>
          <option value="In Use">In Use</option>
          <option value="Maintenance">Maintenance</option>
        </select>
        <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded">
          Add Cylinder
        </button>
      </form>

      {/* Cylinder list */}
      <table className="w-full border-collapse border border-gray-300">
        <thead>
          <tr className="bg-gray-200">
            <th className="border p-2">Name</th>
            <th className="border p-2">Size</th>
            <th className="border p-2">Status</th>
          </tr>
        </thead>
        <tbody>
          {cylinders.map((cyl) => (
            <tr key={cyl.id}>
              <td className="border p-2">{cyl.name}</td>
              <td className="border p-2">{cyl.size}</td>
              <td className="border p-2">{cyl.status}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default Cylinders;
