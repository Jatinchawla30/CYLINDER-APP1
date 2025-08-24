import { useState, useEffect } from 'react';
import { initializeApp } from 'firebase/app';
import { getAuth, onAuthStateChanged, signOut, signInAnonymously, createUserWithEmailAndPassword, signInWithEmailAndPassword } from 'firebase/auth';
import { getFirestore, doc, getDoc, addDoc, updateDoc, deleteDoc, onSnapshot, collection, getDocs, updateDoc as updateDocFirestore, serverTimestamp } from 'firebase/firestore';
import {
  AlertCircle,
  BarChart,
  Clipboard,
  DollarSign,
  Plus,
  RotateCcw,
  Search,
  Settings,
  User,
  X,
  FileText,
  Trash2,
  AlertTriangle,
  Download,
  LogOut,
  Mail,
  Lock
} from 'lucide-react';
import html2canvas from 'html2canvas';
import { jsPDF } from 'jspdf';
const CURRENCY_SYMBOL = process.env.REACT_APP_CURRENCY_SYMBOL || '₹';

// Firebase configuration from Environment Variables
const firebaseConfig = {
  apiKey: process.env.REACT_APP_FIREBASE_API_KEY,
  authDomain: process.env.REACT_APP_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.REACT_APP_FIREBASE_PROJECT_ID,
  storageBucket: process.env.REACT_APP_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.REACT_APP_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.REACT_APP_FIREBASE_APP_ID,
};

// Initialize Firebase services and get instances outside the component
const firebaseApp = initializeApp(firebaseConfig);
const auth = getAuth(firebaseApp);
const db = getFirestore(firebaseApp);

// Cloudinary image upload function
const uploadImageToCloudinary = async (imageFile) => {
    if (!imageFile) {
        return null;
    }

    const cloudinaryCloudName = process.env.REACT_APP_CLOUDINARY_CLOUD_NAME;
    const cloudinaryUploadPreset = process.env.REACT_APP_CLOUDINARY_UPLOAD_PRESET;

    if (!cloudinaryCloudName || !cloudinaryUploadPreset) {
        console.error("Cloudinary environment variables not set.");
        return null;
    }

    const formData = new FormData();
    formData.append('file', imageFile);
    formData.append('upload_preset', cloudinaryUploadPreset);

    try {
        const response = await fetch(`https://api.cloudinary.com/v1_1/${cloudinaryCloudName}/image/upload`, {
            method: 'POST',
            body: formData,
        });

        const data = await response.json();
        if (data && data.secure_url) {
            return data.secure_url;
        } else {
            console.error("Cloudinary upload failed:", data);
            return null;
        }
    } catch (e) {
        console.error("Error uploading to Cloudinary:", e);
        return null;
    }
};

// Helper function to calculate outstanding balance
const calculateBalance = (cylinder) => {
  const amountFromCustomer = parseFloat(cylinder.amountFromCustomer);
  const amountPaid = parseFloat(cylinder.amountPaid) || 0;
  return (amountFromCustomer - amountPaid).toFixed(2);
};

// All Modal Components with Tailwind CSS
const ModalContainer = ({ children, title, onClose }) => (
  <div className="fixed inset-0 bg-gray-900 bg-opacity-50 flex items-center justify-center p-4 z-50">
    <div className="bg-white p-6 rounded-xl shadow-2xl w-full max-w-lg relative">
      <button onClick={onClose} className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors duration-200">
        <X size={24} />
      </button>
      <h3 className="text-xl font-bold text-gray-800 mb-4">{title}</h3>
      {children}
    </div>
  </div>
);

const CylinderModal = ({ customers, suppliers, onClose, onAddCylinder, onUpdateCylinder, onOpenAddCustomer, editingCylinder, currencySymbol, isProcessing }) => {
  const [newCylinder, setNewCylinder] = useState(
    editingCylinder || {
      name: '',
      customerId: '',
      totalCylinderValue: '',
      amountFromCustomer: '',
      paymentPolicy: { type: 'percentage', value: '100' },
      cylinderDate: '', 
      size: '',
      length: '',
      diameter: '',
      numberOfColors: '',
      numberOfCylinders: '1',
      cylinderType: 'surface',
      supplier: '',
      imageUrl: '', 
      imageFile: null, 
    }
  );
  const [validationErrors, setValidationErrors] = useState({});
  const [isUploading, setIsUploading] = useState(false);

  useEffect(() => {
    if (editingCylinder) {
      setNewCylinder({
        ...editingCylinder,
        cylinderDate: editingCylinder.cylinderDate ? new Date(editingCylinder.cylinderDate.seconds * 1000).toISOString().split('T')[0] : '',
      });
    }
  }, [editingCylinder]);

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setNewCylinder({ ...newCylinder, imageFile: file, imageUrl: URL.createObjectURL(file) });
    }
  };


  const validate = () => {
    const errors = {};
    if (!newCylinder.name) errors.name = 'Cylinder name is required.';
    if (!newCylinder.customerId) errors.customerId = 'Customer selection is required.';
    if (!newCylinder.totalCylinderValue || isNaN(parseFloat(newCylinder.totalCylinderValue))) errors.totalCylinderValue = 'Total value must be a number.';
    
    if (newCylinder.paymentPolicy.type === 'percentage') {
      const percentage = parseFloat(newCylinder.paymentPolicy.value);
      if (isNaN(percentage) || percentage < 0 || percentage > 100) {
        errors.paymentPolicyValue = 'Percentage must be between 0 and 100.';
      }
    } else if (newCylinder.paymentPolicy.type === 'fixed_amount_per_order') {
      const amount = parseFloat(newCylinder.paymentPolicy.value);
      if (isNaN(amount) || amount <= 0) {
        errors.paymentPolicyValue = 'Fixed amount must be a positive number.';
      }
    }

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate() || isProcessing) return;
    
    setIsUploading(true);

    let finalData = { ...newCylinder };
    if (finalData.imageFile) {
        const imageUrl = await uploadImageToCloudinary(finalData.imageFile);
        if (imageUrl) {
            finalData = { ...finalData, imageUrl };
        } else {
            setIsUploading(false);
            return;
        }
    }

    delete finalData.imageFile;

    if (editingCylinder) {
      onUpdateCylinder(editingCylinder.id, finalData);
    } else {
      onAddCylinder(finalData);
    }

    setIsUploading(false);
  };


  return (
    <ModalContainer title={editingCylinder ? "Edit Cylinder" : "Add New Cylinder"} onClose={onClose}>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="overflow-y-auto max-h-96 pr-4">
          <div>
            <div className="flex justify-between items-end mb-1">
              <label htmlFor="customerSelect" className="block text-sm font-medium text-gray-700">Select Customer</label>
              <button
                type="button"
                onClick={onOpenAddCustomer}
                className="text-blue-600 hover:text-blue-800 text-sm font-medium flex items-center space-x-1"
              >
                <Plus size={16} />
                <span>Add New</span>
              </button>
            </div>
            <select
              id="customerSelect"
              value={newCylinder.customerId}
              onChange={(e) => setNewCylinder({ ...newCylinder, customerId: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            >
              <option value="" disabled>Select Customer</option>
              {customers.map(c => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>
            {validationErrors.customerId && <p className="text-red-500 text-xs mt-1">{validationErrors.customerId}</p>}
          </div>
          <div>
            <label htmlFor="cylinderName" className="block text-sm font-medium text-gray-700">Cylinder Name</label>
            <input
              id="cylinderName"
              type="text"
              placeholder="Cylinder Name"
              value={newCylinder.name}
              onChange={(e) => setNewCylinder({ ...newCylinder, name: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
            {validationErrors.name && <p className="text-red-500 text-xs mt-1">{validationErrors.name}</p>}
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label htmlFor="totalCylinderValue" className="block text-sm font-medium text-gray-700">Total Cylinder Value ({currencySymbol})</label>
              <input
                id="totalCylinderValue"
                type="number"
                placeholder="Total Value"
                value={newCylinder.totalCylinderValue}
                onChange={(e) => setNewCylinder({ ...newCylinder, totalCylinderValue: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
              {validationErrors.totalCylinderValue && <p className="text-red-500 text-xs mt-1">{validationErrors.totalCylinderValue}</p>}
            </div>
          </div>
          <div>
            <label htmlFor="cylinderDate" className="block text-sm font-medium text-gray-700">Date of the Cylinder</label>
            <input
              id="cylinderDate"
              type="date"
              placeholder="Date of the Cylinder"
              value={newCylinder.cylinderDate}
              onChange={(e) => setNewCylinder({ ...newCylinder, cylinderDate: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label htmlFor="size" className="block text-sm font-medium text-gray-700">Size</label>
                <input
                  id="size"
                  type="text"
                  placeholder="Size"
                  value={newCylinder.size}
                  onChange={(e) => setNewCylinder({ ...newCylinder, size: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label htmlFor="length" className="block text-sm font-medium text-gray-700">Length</label>
                <input
                  id="length"
                  type="text"
                  placeholder="Length"
                  value={newCylinder.length}
                  onChange={(e) => setNewCylinder({ ...newCylinder, length: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label htmlFor="diameter" className="block text-sm font-medium text-gray-700">Diameter</label>
                <input
                  id="diameter"
                  type="text"
                  placeholder="Diameter"
                  value={newCylinder.diameter}
                  onChange={(e) => setNewCylinder({ ...newCylinder, diameter: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label htmlFor="numberOfColors" className="block text-sm font-medium text-gray-700">Number of Colors</label>
                <input
                  id="numberOfColors"
                  type="number"
                  placeholder="Number of Colors"
                  value={newCylinder.numberOfColors}
                  onChange={(e) => setNewCylinder({ ...newCylinder, numberOfColors: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                  <label htmlFor="cylinderType" className="block text-sm font-medium text-gray-700">Cylinder Type</label>
                  <select
                      id="cylinderType"
                      value={newCylinder.cylinderType}
                      onChange={(e) => setNewCylinder({ ...newCylinder, cylinderType: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                      <option value="surface">Surface</option>
                      <option value="reverse">Reverse</option>
                  </select>
              </div>
              <div>
                  <label htmlFor="supplier" className="block text-sm font-medium text-gray-700">Supplier</label>
                  <select
                    id="supplier"
                    value={newCylinder.supplier}
                    onChange={(e) => setNewCylinder({ ...newCylinder, supplier: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">Select Supplier</option>
                    {suppliers.map(s => (
                      <option key={s.id} value={s.id}>{s.name}</option>
                    ))}
                  </select>
              </div>
          </div>

          <div className="pt-4 border-t border-gray-200">
            <label htmlFor="cylinderImage" className="block text-sm font-bold text-gray-700 mb-2">Cylinder Image</label>
            <input
              id="cylinderImage"
              type="file"
              onChange={handleFileChange}
              className="w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
            />
            {newCylinder.imageUrl && (
              <div className="mt-4">
                <p className="text-sm text-gray-600 mb-2">Image Preview:</p>
                <img src={newCylinder.imageUrl} alt="Cylinder Preview" className="w-full h-auto rounded-lg" />
              </div>
            )}
          </div>
        </div>
        
        <button
          type="submit"
          className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-lg transition-colors duration-200"
          disabled={isProcessing || isUploading}
        >
          {isProcessing || isUploading ? 'Processing...' : editingCylinder ? 'Update Cylinder' : 'Add Cylinder'}
        </button>
      </form>
    </ModalContainer>
  );
};

const AddPaymentModal = ({ selectedCylinder, onClose, onAddPayment, onClearBalance, cylinders, currencySymbol, isProcessing }) => {
  const [newPayment, setNewPayment] = useState({ amount: '', note: '', date: '' });
  const [validationErrors, setValidationErrors] = useState({});

  useEffect(() => {
      setNewPayment(prev => ({...prev, date: new Date().toISOString().split('T')[0]}));
  }, []);

  const validate = () => {
    const errors = {};
    const amount = parseFloat(newPayment.amount);
    if (isNaN(amount) || amount <= 0) errors.amount = 'Payment amount must be a positive number.';
    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (validate()) {
      onAddPayment(selectedCylinder.id, newPayment.amount, newPayment.note, newPayment.date);
    }
  };

  return (
    <ModalContainer title={`Add Payment for ${selectedCylinder?.name}`} onClose={onClose}>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="paymentAmount" className="block text-sm font-medium text-gray-700">Payment Amount</label>
          <input
            id="paymentAmount"
            type="number"
            placeholder="Payment Amount"
            value={newPayment.amount}
            onChange={(e) => setNewPayment({ ...newPayment, amount: e.target.value })}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
          />
          {validationErrors.amount && <p className="text-red-500 text-xs mt-1">{validationErrors.amount}</p>}
        </div>
        <div>
          <label htmlFor="paymentDate" className="block text-sm font-medium text-gray-700">Payment Date</label>
          <input
            id="paymentDate"
            type="date"
            value={newPayment.date}
            onChange={(e) => setNewPayment({ ...newPayment, date: e.target.value })}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <div>
          <label htmlFor="paymentNotes" className="block text-sm font-medium text-gray-700">Notes (optional)</label>
          <textarea
            id="paymentNotes"
            placeholder="Notes (optional)"
            value={newPayment.note}
            onChange={(e) => setNewPayment({ ...newPayment, note: e.target.value })}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            rows="3"
          ></textarea>
        </div>
        <button
          type="submit"
          className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2 px-4 rounded-lg transition-colors duration-200"
          disabled={isProcessing}
        >
          {isProcessing ? 'Processing...' : 'Record Payment'}
        </button>
        <button
          type="button"
          onClick={() => onClearBalance(selectedCylinder.id)}
          className="w-full bg-red-600 hover:bg-red-700 text-white font-bold py-2 px-4 rounded-lg transition-colors duration-200 mt-2"
          disabled={isProcessing}
        >
          {isProcessing ? 'Processing...' : 'Clear All Balance'}
        </button>
      </form>
    </ModalContainer>
  );
};

const QuickPaymentModal = ({ cylinders, customers, getCustomerName, calculateBalance, onClose, onAddPayment, currencySymbol, isProcessing }) => {
  const [quickPayment, setQuickPayment] = useState({ cylinderId: '', amount: '', note: '', date: '' });
  const [validationErrors, setValidationErrors] = useState({});
  
  const cylindersWithBalance = cylinders.filter(c => parseFloat(c.balance) > 0);

  useEffect(() => {
      setQuickPayment(prev => ({...prev, date: new Date().toISOString().split('T')[0]}));
  }, []);

  const getCylinderById = (id) => cylinders.find(c => c.id === id);
  const selectedCylinderForPayment = quickPayment.cylinderId ? getCylinderById(quickPayment.cylinderId) : null;
  const customerNameForQuickPayment = selectedCylinderForPayment ? getCustomerName(selectedCylinderForPayment.customerId) : '';
  const balanceForQuickPayment = selectedCylinderForPayment ? calculateBalance(selectedCylinderForPayment) : '0.00';

  const validate = () => {
    const errors = {};
    const amount = parseFloat(quickPayment.amount);
    if (!quickPayment.cylinderId) errors.cylinderId = 'Please select a cylinder.';
    if (isNaN(amount) || amount <= 0) errors.amount = 'Payment amount must be a positive number.';
    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (validate()) {
      onAddPayment(quickPayment.cylinderId, quickPayment.amount, "Payment added via Quick Payment modal", quickPayment.date);
    }
  };

  return (
    <ModalContainer title="Quick Payment" onClose={onClose}>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="quickPaymentCylinder" className="block text-sm font-medium text-gray-700">Select Cylinder</label>
          <select
            id="quickPaymentCylinder"
            value={quickPayment.cylinderId}
            onChange={(e) => setQuickPayment({ ...quickPayment, cylinderId: e.target.value })}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
          >
            <option value="" disabled>Select a cylinder</option>
            {cylindersWithBalance.map(c => (
              <option key={c.id} value={c.id}>{c.name}</option>
            ))}
          </select>
          {validationErrors.cylinderId && <p className="text-red-500 text-xs mt-1">{validationErrors.cylinderId}</p>}
        </div>
        {selectedCylinderForPayment && (
          <div className="space-y-2 p-4 bg-gray-50 rounded-lg border border-gray-200">
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Customer:</span>
              <span className="font-medium text-gray-800">{getCustomerName(selectedCylinderForPayment.customerId)}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Amount Due:</span>
              <span className="font-bold text-red-500">{CURRENCY_SYMBOL}{calculateBalance(selectedCylinderForPayment)}</span>
            </div>
          </div>
        )}
        <div>
          <label htmlFor="paymentNotes" className="block text-sm font-medium text-gray-700">Notes (optional)</label>
          <textarea
            id="paymentNotes"
            placeholder="Notes (optional)"
            value={quickPayment.note}
            onChange={(e) => setQuickPayment({ ...quickPayment, note: e.target.value })}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            rows="3"
          ></textarea>
        </div>
        <button
          type="submit"
          className="w-full bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-4 rounded-lg transition-colors duration-200"
          disabled={isProcessing}
        >
          {isProcessing ? 'Processing...' : 'Record Payment'}
        </button>
      </form>
    </ModalContainer>
  );
};

const AddCustomerModal = ({ onClose, onAddCustomer, isProcessing }) => {
  const [newCustomer, setNewCustomer] = useState({ name: '', contactInfo: '' });
  const [validationErrors, setValidationErrors] = useState({});

  const validate = () => {
    const errors = {};
    if (!newCustomer.name) errors.name = 'Customer name is required.';
    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (validate()) {
      onAddCustomer(newCustomer);
    }
  };

  return (
    <ModalContainer title="Add New Customer" onClose={onClose}>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="customerName" className="block text-sm font-medium text-gray-700">Customer Name</label>
          <input
            id="customerName"
            type="text"
            placeholder="Customer Name"
            value={newCustomer.name}
            onChange={(e) => setNewCustomer({ ...newCustomer, name: e.target.value })}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
          />
          {validationErrors.name && <p className="text-red-500 text-xs mt-1">{validationErrors.name}</p>}
        </div>
        <div>
          <label htmlFor="customerContact" className="block text-sm font-medium text-gray-700">Contact Info (Phone/Email)</label>
          <input
            id="customerContact"
            type="text"
            placeholder="Contact Info (Phone/Email)"
            value={newCustomer.contactInfo}
            onChange={(e) => setNewCustomer({ ...newCustomer, contactInfo: e.target.value })}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <button
          type="submit"
          className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2 px-4 rounded-lg transition-colors duration-200"
          disabled={isProcessing}
        >
          {isProcessing ? 'Processing...' : 'Add Customer'}
        </button>
      </form>
    </ModalContainer>
  );
};

const AddSupplierModal = ({ onClose, onAddSupplier, isProcessing }) => {
    const [newSupplier, setNewSupplier] = useState({ name: '', contactInfo: '' });
    const [validationErrors, setValidationErrors] = useState({});

    const validate = () => {
        const errors = {};
        if (!newSupplier.name) errors.name = 'Supplier name is required.';
        setValidationErrors(errors);
        return Object.keys(errors).length === 0;
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        if (validate()) {
            onAddSupplier(newSupplier);
        }
    };

    return (
        <ModalContainer title="Add New Supplier" onClose={onClose}>
            <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                    <label htmlFor="supplierName" className="block text-sm font-medium text-gray-700">Supplier Name</label>
                    <input
                        id="supplierName"
                        type="text"
                        placeholder="Supplier Name"
                        value={newSupplier.name}
                        onChange={(e) => setNewSupplier({ ...newSupplier, name: e.target.value })}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                        required
                    />
                    {validationErrors.name && <p className="text-red-500 text-xs mt-1">{validationErrors.name}</p>}
                </div>
                <div>
                    <label htmlFor="supplierContact" className="block text-sm font-medium text-gray-700">Contact Info (Phone/Email)</label>
                    <input
                        id="supplierContact"
                        type="text"
                        placeholder="Contact Info (Phone/Email)"
                        value={newSupplier.contactInfo}
                        onChange={(e) => setNewSupplier({ ...newSupplier, contactInfo: e.target.value })}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                    />
                </div>
                <button
                    type="submit"
                    className="w-full bg-purple-600 hover:bg-purple-700 text-white font-bold py-2 px-4 rounded-lg shadow-md transition-colors duration-200"
                    disabled={isProcessing}
                >
                    {isProcessing ? 'Processing...' : 'Add Supplier'}
                </button>
            </form>
        </ModalContainer>
    );
};

const CustomerLedgerModal = ({ db, appId, userId, selectedCustomer, cylinders, onClose, onAddPayment, currencySymbol, exportToPdf }) => {
  const [customerTransactions, setCustomerTransactions] = useState([]);
  const [loadingTransactions, setLoadingTransactions] = useState(true);
  const [summary, setSummary] = useState({
      totalCylinders: 0,
      totalCylinderValue: 0,
      totalAmountPaid: 0,
      totalOutstanding: 0
  });

  useEffect(() => {
    if (!db || !selectedCustomer) return;

    const fetchLedgerData = async () => {
      setLoadingTransactions(true);
      const allTransactions = [];
      const customerCylinders = cylinders.filter(c => c.customerId === selectedCustomer.id);
      
      let totalCylinderValue = 0;
      let totalAmountPaid = 0;
      let totalOutstanding = 0;

      try {
        const fetchPromises = customerCylinders.map(async (cylinder) => {
          totalCylinderValue += parseFloat(cylinder.totalCylinderValue || 0);
          totalAmountPaid += parseFloat(cylinder.amountPaid || 0);
          totalOutstanding += parseFloat(cylinder.balance || 0);
          
          allTransactions.push({
            type: 'Cylinder Creation',
            cylinderName: cylinder.name,
            amount: parseFloat(cylinder.amountFromCustomer), 
            date: cylinder.createdAt,
            id: `cylinder-creation-${cylinder.id}`
          });
          
          const paymentsCollectionRef = collection(db, `artifacts/${appId}/users/${userId}/cylinders/${cylinder.id}/payments`);
          const paymentSnapshot = await getDocs(paymentsCollectionRef);
          
          paymentSnapshot.forEach((doc) => {
            const newPayment = doc.data();
            allTransactions.push({
              type: 'Payment',
              cylinderName: cylinder.name,
              amount: parseFloat(newPayment.amount),
              date: newPayment.date,
              note: newPayment.note,
              id: `payment-${doc.id}`
            });
          });
        });
        
        await Promise.all(fetchPromises);
        
        allTransactions.sort((a, b) => a.date?.seconds - b.date?.seconds);
        setCustomerTransactions(allTransactions);
        setSummary({
            totalCylinders: customerCylinders.length,
            totalCylinderValue: totalCylinderValue.toFixed(2),
            totalAmountPaid: totalAmountPaid.toFixed(2),
            totalOutstanding: totalOutstanding.toFixed(2),
        });
      } catch (e) {
        console.error("Failed to fetch customer ledger:", e);
      } finally {
        setLoadingTransactions(false);
      }
    };

    fetchLedgerData();
  }, [db, selectedCustomer, cylinders, appId, userId]);

  return (
    <ModalContainer title={`Report for ${selectedCustomer?.name}`} onClose={onClose}>
      <div className="flex justify-between items-center mb-4">
        <p className="text-gray-600 text-sm">Contact: {selectedCustomer?.contactInfo}</p>
        <button
          onClick={() => exportToPdf('customer-ledger-content', `Report_${selectedCustomer?.name}.pdf`)}
          className="bg-gray-500 hover:bg-gray-600 text-white font-bold py-2 px-4 rounded-lg shadow-md transition-colors duration-200"
        >
          <Download size={20} className="inline-block mr-2" /> Export to PDF
        </button>
      </div>

      <div id="customer-ledger-content" className="p-4 border rounded-lg bg-gray-50">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            <div className="bg-white p-4 rounded-lg shadow-md flex flex-col items-center">
                <span className="text-sm font-semibold text-gray-500">Total Cylinders</span>
                <span className="text-xl font-bold text-gray-800">{summary.totalCylinders}</span>
            </div>
            <div className="bg-white p-4 rounded-lg shadow-md flex flex-col items-center">
                <span className="text-sm font-semibold text-gray-500">Total Value</span>
                <span className="text-xl font-bold text-gray-800">{CURRENCY_SYMBOL}{summary.totalCylinderValue}</span>
            </div>
            <div className="bg-white p-4 rounded-lg shadow-md flex flex-col items-center">
                <span className="text-sm font-semibold text-gray-500">Amount Paid</span>
                <span className="text-xl font-bold text-green-600">{CURRENCY_SYMBOL}{summary.totalAmountPaid}</span>
            </div>
            <div className="bg-white p-4 rounded-lg shadow-md flex flex-col items-center">
                <span className="text-sm font-semibold text-gray-500">Outstanding</span>
                <span className="text-xl font-bold text-red-600">{CURRENCY_SYMBOL}{summary.totalOutstanding}</span>
            </div>
        </div>

        <h4 className="text-lg font-bold text-gray-800 mb-2">Transaction History</h4>
        {loadingTransactions ? (
          <div className="flex items-center justify-center p-8">
            <RotateCcw className="animate-spin text-blue-500" size={24} />
            <span className="ml-2 text-gray-600">Loading ledger...</span>
          </div>
        ) : (
          <div className="space-y-4 p-4 border rounded-lg bg-white">
            <div className="overflow-y-auto max-h-80">
              {customerTransactions.length === 0 ? (
                <p className="text-center text-gray-500 py-4">No transactions found for this customer.</p>
              ) : (
                <div className="space-y-2">
                  {customerTransactions.map((transaction) => (
                    <div key={transaction.id} className="bg-white p-3 rounded-lg flex justify-between items-center shadow-sm">
                      <div>
                        <p className="text-sm font-semibold text-gray-800">{transaction.type}</p>
                        <p className="text-xs text-gray-600">{transaction.cylinderName}</p>
                        {transaction.note && <p className="text-xs text-gray-500 italic">Note: {transaction.note}</p>}
                      </div>
                      <div className="text-right">
                        <p className={`font-bold ${transaction.type === 'Payment' ? 'text-green-600' : 'text-indigo-600'}`}>
                          {transaction.type === 'Payment' ? `+ ${CURRENCY_SYMBOL}${parseFloat(transaction.amount).toFixed(2)}` : `- ${CURRENCY_SYMBOL}${parseFloat(transaction.amount).toFixed(2)}`}
                        </p>
                        <p className="text-xs text-gray-500">{new Date(transaction.date?.seconds * 1000).toLocaleDateString('en-GB')}</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </ModalContainer>
  );
};

const CustomerCylinderListModal = ({ selectedCustomer, cylinders, onClose, currencySymbol, exportToPdf }) => {
  const customerCylinders = cylinders.filter(c => c.customerId === selectedCustomer.id);

  return (
    <ModalContainer title={`Cylinders for ${selectedCustomer.name}`} onClose={onClose}>
      <div className="flex justify-end items-center mb-4">
          <button
            onClick={() => exportToPdf('customer-cylinders-list-content', `Cylinders_${selectedCustomer.name}.pdf`)}
            className="bg-gray-500 hover:bg-gray-600 text-white font-bold py-2 px-4 rounded-lg shadow-md transition-colors duration-200"
          >
            <Download size={20} className="inline-block mr-2" /> Export to PDF
          </button>
      </div>

      <div id="customer-cylinders-list-content" className="space-y-4 p-4 border rounded-lg bg-gray-50">
        {customerCylinders.length === 0 ? (
          <p className="text-center text-gray-500">No cylinders found for this customer.</p>
        ) : (
            <div className="space-y-4">
              {customerCylinders.map(cylinder => (
                  <div key={cylinder.id} className="bg-white p-4 rounded-lg shadow-sm">
                      <h4 className="text-lg font-bold text-gray-800">{cylinder.name}</h4>
                      {cylinder.imageUrl && (
                          <div className="my-2">
                              <img src={cylinder.imageUrl} alt={cylinder.name} className="w-full h-auto rounded-lg" />
                          </div>
                      )}
                      <div className="text-sm text-gray-600 space-y-1">
                          <p>Size: {cylinder.size || 'N/A'}</p>
                          <p>Length: {cylinder.length || 'N/A'}</p>
                          <p>Diameter: {cylinder.diameter || 'N/A'}</p>
                          <p>Colors: {cylinder.numberOfColors || 'N/A'}</p>
                          <p>Date: {cylinder.cylinderDate ? new Date(cylinder.cylinderDate.seconds * 1000).toLocaleDateString('en-GB') : 'N/A'}</p>
                      </div>
                  </div>
              ))}
          </div>
        )}
      </div>
    </ModalContainer>
  );
};

const SupplierCylinderListModal = ({ selectedSupplier, cylinders, onClose, currencySymbol, exportToPdf }) => {
    const [searchQuery, setSearchQuery] = useState('');
    const supplierCylinders = cylinders.filter(c => c.supplier === selectedSupplier.id);
    const filteredCylinders = supplierCylinders.filter(c => 
        c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (c.size && c.size.toLowerCase().includes(searchQuery.toLowerCase())) ||
        (c.length && c.length.toLowerCase().includes(searchQuery.toLowerCase())) ||
        (c.diameter && c.diameter.toLowerCase().includes(searchQuery.toLowerCase())) ||
        (c.numberOfColors && c.numberOfColors.toString().includes(searchQuery.toLowerCase())) ||
        (c.cylinderDate ? new Date(c.cylinderDate.seconds * 1000).toLocaleDateString('en-GB').includes(searchQuery) : false)
    );

    return (
        <ModalContainer title={`Cylinders from ${selectedSupplier.name}`} onClose={onClose}>
            <div className="flex justify-between items-center mb-4">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                  <input
                    type="text"
                    placeholder="Search cylinders..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                  />
                </div>
                <button
                    onClick={() => exportToPdf('supplier-cylinders-list-content', `Cylinders_${selectedSupplier.name}.pdf`)}
                    className="bg-gray-500 hover:bg-gray-600 text-white font-bold py-2 px-4 rounded-lg shadow-md transition-colors duration-200"
                >
                    <Download size={20} className="inline-block mr-2" /> Export to PDF
                </button>
            </div>

            <div id="supplier-cylinders-list-content" className="space-y-4 p-4 border rounded-lg bg-gray-50">
                {filteredCylinders.length === 0 ? (
                    <p className="text-center text-gray-500">No matching cylinders found.</p>
                ) : (
                    <div className="space-y-4 overflow-y-auto max-h-96">
                        {filteredCylinders.map(cylinder => (
                            <div key={cylinder.id} className="bg-white p-4 rounded-lg shadow-sm">
                                <h4 className="text-lg font-bold text-gray-800">{cylinder.name}</h4>
                                {cylinder.imageUrl && (
                                    <div className="my-2">
                                        <img src={cylinder.imageUrl} alt={cylinder.name} className="w-full h-auto rounded-lg" />
                                    </div>
                                )}
                                <div className="text-sm text-gray-600 space-y-1">
                                    <p>Size: {cylinder.size || 'N/A'}</p>
                                    <p>Length: {cylinder.length || 'N/A'}</p>
                                    <p>Diameter: {cylinder.diameter || 'N/A'}</p>
                                    <p>Colors: {cylinder.numberOfColors || 'N/A'}</p>
                                    <p>Date: {cylinder.cylinderDate ? new Date(cylinder.cylinderDate.seconds * 1000).toLocaleDateString('en-GB') : 'N/A'}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </ModalContainer>
    );
};

const GenerateMessageModal = ({ reminderMessage, onClose, onCopy }) => (
  <ModalContainer title="Generate Reminder Message" onClose={onClose}>
    <div className="space-y-4">
      <textarea
        id="reminder-message-textarea"
        value={reminderMessage}
        readOnly
        className="w-full p-4 border border-gray-300 rounded-lg bg-gray-50 font-mono text-sm resize-none"
        rows="8"
      />
      <p className="text-gray-600 text-sm">You can edit the message above before sending.</p>
      <button
        onClick={onCopy}
        className="w-full bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-4 rounded-lg transition-colors duration-200"
      >
        <Clipboard className="inline-block mr-2" /> Copy to Clipboard
      </button>
    </div>
  </ModalContainer>
);

const MessageModal = ({ title, message, onClose }) => (
  <ModalContainer title={title} onClose={onClose}>
    <p className="text-center text-lg text-gray-700">{message}</p>
    <button
      onClick={onClose}
      className="w-full mt-4 bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-lg transition-colors duration-200"
    >
      Close
    </button>
  </ModalContainer>
);

const ConfirmationModal = ({ title, message, onClose, onConfirm }) => (
    <ModalContainer title={title} onClose={onClose}>
        <p className="text-center text-lg text-gray-700">{message}</p>
        <div className="flex justify-center space-x-4 mt-6">
            <button
                onClick={onClose}
                className="bg-gray-300 hover:bg-gray-400 text-gray-800 font-bold py-2 px-6 rounded-lg transition-colors duration-200"
            >
                Cancel
            </button>
            <button
                onClick={onConfirm}
                className="bg-red-600 hover:bg-red-700 text-white font-bold py-2 px-6 rounded-lg transition-colors duration-200"
            >
                Confirm Delete
            </button>
        </div>
    </ModalContainer>
);

const ErrorModal = ({ message, onClose }) => (
  <ModalContainer title="Application Error" onClose={onClose}>
    <div className="flex items-center space-x-4 text-red-700 bg-red-100 p-4 rounded-lg">
      <AlertTriangle size={24} />
      <p className="text-sm font-medium">{message}</p>
    </div>
    <button
      onClick={onClose}
      className="w-full mt-4 bg-red-600 hover:bg-red-700 text-white font-bold py-2 px-4 rounded-lg transition-colors duration-200"
    >
      Close
    </button>
  </ModalContainer>
);

export default App;
