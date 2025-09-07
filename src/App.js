// Import React and necessary hooks and libraries
import React, { useState, useEffect, createContext, useContext } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, Link, NavLink, useLocation } from 'react-router-dom';
import { initializeApp } from 'firebase/app';
import { getAuth, onAuthStateChanged, signOut, createUserWithEmailAndPassword, signInWithEmailAndPassword } from 'firebase/auth';
import { getFirestore, doc, getDoc, addDoc, updateDoc, deleteDoc, onSnapshot, collection, getDocs, serverTimestamp } from 'firebase/firestore';
import {
  AlertTriangle, Clipboard, DollarSign, Plus, RotateCcw, Search, User, X, Download, LogOut, Mail, Lock,
  LayoutDashboard, ShoppingCart, Users, Truck, CreditCard, FileText
} from 'lucide-react';

// --- CONSTANTS & CONFIGURATION ---
// NOTE: Replace placeholder values below with your actual Firebase and Cloudinary credentials.
const CURRENCY_SYMBOL = '₹';

const firebaseConfig = {
    apiKey: "YOUR_FIREBASE_API_KEY",
    authDomain: "YOUR_FIREBASE_AUTH_DOMAIN",
    projectId: "YOUR_FIREBASE_PROJECT_ID",
    storageBucket: "YOUR_FIREBASE_STORAGE_BUCKET",
    messagingSenderId: "YOUR_FIREBASE_MESSAGING_SENDER_ID",
    appId: "YOUR_FIREBASE_APP_ID",
};

const cloudinaryCloudName = "YOUR_CLOUDINARY_CLOUD_NAME";
const cloudinaryUploadPreset = "YOUR_CLOUDINARY_UPLOAD_PRESET";

// --- HELPER & UTILITY FUNCTIONS ---
const uploadImageToCloudinary = async (imageFile) => {
    if (!imageFile || !cloudinaryCloudName || !cloudinaryUploadPreset || cloudinaryCloudName.startsWith("YOUR_")) {
        console.error("Cloudinary configuration is missing or incomplete.");
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
        return data.secure_url || null;
    } catch (e) {
        console.error("Error uploading to Cloudinary:", e);
        return null;
    }
};

const calculateBalance = (cylinder) => {
    const amountFromCustomer = parseFloat(cylinder.amountFromCustomer || 0);
    const amountPaid = parseFloat(cylinder.amountPaid || 0);
    return (amountFromCustomer - amountPaid).toFixed(2);
};

// --- REACT CONTEXT FOR GLOBAL STATE MANAGEMENT ---
const AppContext = createContext();
const useApp = () => useContext(AppContext);

// --- MODAL COMPONENTS ---

const ModalContainer = ({ children, title, onClose }) => (
    <div className="fixed inset-0 bg-gray-900 bg-opacity-60 flex items-center justify-center p-4 z-50 backdrop-blur-sm animate-fade-in">
        <div className="bg-white p-6 rounded-xl shadow-2xl w-full max-w-lg relative transform transition-all animate-fade-in-up">
            <button onClick={onClose} className="absolute top-4 right-4 text-gray-400 hover:text-gray-600">
                <X size={24} />
            </button>
            <h3 className="text-xl font-bold text-gray-800 mb-4">{title}</h3>
            {children}
        </div>
    </div>
);

const CylinderModal = ({ onClose }) => {
    const { customers, suppliers, onAddCylinder, onUpdateCylinder, openModal, editingCylinder, isProcessing } = useApp();
    const initialState = {
        name: '', customerId: '', totalCylinderValue: '', amountFromCustomer: '',
        paymentPolicy: { type: 'percentage', value: '100' }, cylinderDate: '', supplier: '',
        imageUrl: '', imageFile: null
    };
    const [newCylinder, setNewCylinder] = useState(editingCylinder || initialState);
    const [isUploading, setIsUploading] = useState(false);

    useEffect(() => {
        if (editingCylinder) {
            setNewCylinder({
                ...editingCylinder,
                cylinderDate: editingCylinder.cylinderDate?.seconds ? new Date(editingCylinder.cylinderDate.seconds * 1000).toISOString().split('T')[0] : '',
            });
        }
    }, [editingCylinder]);

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setNewCylinder({ ...newCylinder, imageFile: file, imageUrl: URL.createObjectURL(file) });
        }
    };
    
    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsUploading(true);
        let finalData = { ...newCylinder };
        if (finalData.imageFile) {
            const uploadedUrl = await uploadImageToCloudinary(finalData.imageFile);
            if (uploadedUrl) finalData.imageUrl = uploadedUrl;
        }
        delete finalData.imageFile;
        
        let amountFromCustomer;
        if (finalData.paymentPolicy.type === 'percentage') {
            amountFromCustomer = parseFloat(finalData.totalCylinderValue) * (parseFloat(finalData.paymentPolicy.value) / 100);
        } else {
            amountFromCustomer = parseFloat(finalData.paymentPolicy.value);
        }
        finalData.amountFromCustomer = amountFromCustomer;

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
                <div className="overflow-y-auto max-h-[60vh] pr-4 space-y-4">
                    <div>
                        <div className="flex justify-between items-end mb-1">
                            <label className="block text-sm font-medium text-gray-700">Select Customer</label>
                            <button type="button" onClick={() => openModal('customer')} className="text-blue-600 hover:text-blue-800 text-sm font-medium flex items-center space-x-1">
                                <Plus size={16} /><span>Add New</span>
                            </button>
                        </div>
                        <select value={newCylinder.customerId} onChange={(e) => setNewCylinder({ ...newCylinder, customerId: e.target.value })} className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500" required>
                            <option value="" disabled>Select Customer</option>
                            {customers.map(c => (<option key={c.id} value={c.id}>{c.name}</option>))}
                        </select>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Cylinder Name</label>
                        <input type="text" value={newCylinder.name} onChange={(e) => setNewCylinder({ ...newCylinder, name: e.target.value })} className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500" required />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Total Value ({CURRENCY_SYMBOL})</label>
                        <input type="number" step="0.01" value={newCylinder.totalCylinderValue} onChange={(e) => setNewCylinder({ ...newCylinder, totalCylinderValue: e.target.value })} className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500" required />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Date</label>
                        <input type="date" value={newCylinder.cylinderDate} onChange={(e) => setNewCylinder({ ...newCylinder, cylinderDate: e.target.value })} className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500" />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Supplier</label>
                        <select value={newCylinder.supplier} onChange={(e) => setNewCylinder({ ...newCylinder, supplier: e.target.value })} className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500">
                            <option value="">Select Supplier</option>
                            {suppliers.map(s => (<option key={s.id} value={s.id}>{s.name}</option>))}
                        </select>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Cylinder Image</label>
                         <input type="file" accept="image/*" onChange={handleFileChange} className="w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"/>
                        {newCylinder.imageUrl && <img src={newCylinder.imageUrl} alt="preview" className="mt-4 w-full h-auto rounded-lg shadow-sm"/>}
                    </div>
                </div>
                <button type="submit" className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-4 rounded-lg transition-colors disabled:opacity-50" disabled={isProcessing || isUploading}>
                    {isProcessing || isUploading ? 'Processing...' : editingCylinder ? 'Update Cylinder' : 'Add Cylinder'}
                </button>
            </form>
        </ModalContainer>
    );
};

const AddCustomerModal = ({ onClose }) => {
    const { onAddCustomer, isProcessing } = useApp();
    const [newCustomer, setNewCustomer] = useState({ name: '', contactInfo: '' });
    const handleSubmit = (e) => { e.preventDefault(); if (newCustomer.name) onAddCustomer(newCustomer); };

    return (
        <ModalContainer title="Add New Customer" onClose={onClose}>
            <form onSubmit={handleSubmit} className="space-y-4">
                <input type="text" placeholder="Customer Name" value={newCustomer.name} onChange={(e) => setNewCustomer({ ...newCustomer, name: e.target.value })} className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500" required />
                <input type="text" placeholder="Contact Info" value={newCustomer.contactInfo} onChange={(e) => setNewCustomer({ ...newCustomer, contactInfo: e.target.value })} className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500" />
                <button type="submit" className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3 px-4 rounded-lg disabled:opacity-50" disabled={isProcessing}>
                    {isProcessing ? 'Processing...' : 'Add Customer'}
                </button>
            </form>
        </ModalContainer>
    );
};

const AddSupplierModal = ({ onClose }) => {
    const { onAddSupplier, isProcessing } = useApp();
    const [newSupplier, setNewSupplier] = useState({ name: '', contactInfo: '' });
    const handleSubmit = (e) => { e.preventDefault(); if (newSupplier.name) onAddSupplier(newSupplier); };
    
    return (
        <ModalContainer title="Add New Supplier" onClose={onClose}>
            <form onSubmit={handleSubmit} className="space-y-4">
                 <input type="text" placeholder="Supplier Name" value={newSupplier.name} onChange={(e) => setNewSupplier({ ...newSupplier, name: e.target.value })} className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500" required />
                 <input type="text" placeholder="Contact Info" value={newSupplier.contactInfo} onChange={(e) => setNewSupplier({ ...newSupplier, contactInfo: e.target.value })} className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500" />
                 <button type="submit" className="w-full bg-purple-600 hover:bg-purple-700 text-white font-bold py-3 px-4 rounded-lg disabled:opacity-50" disabled={isProcessing}>
                     {isProcessing ? 'Processing...' : 'Add Supplier'}
                 </button>
            </form>
        </ModalContainer>
    );
};

const AddPaymentModal = ({ onClose }) => {
    const { onAddPayment, onClearBalance, selectedCylinder, isProcessing } = useApp();
    const [newPayment, setNewPayment] = useState({ amount: '', note: '', date: new Date().toISOString().split('T')[0] });
    const handleSubmit = (e) => { e.preventDefault(); if (parseFloat(newPayment.amount) > 0) onAddPayment(selectedCylinder.id, newPayment.amount, newPayment.note, newPayment.date); };
    if (!selectedCylinder) return null;

    return (
        <ModalContainer title={`Add Payment for ${selectedCylinder.name}`} onClose={onClose}>
            <form onSubmit={handleSubmit} className="space-y-4">
                <input type="number" step="0.01" placeholder="Payment Amount" value={newPayment.amount} onChange={(e) => setNewPayment({ ...newPayment, amount: e.target.value })} className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-green-500" required />
                <input type="date" value={newPayment.date} onChange={(e) => setNewPayment({ ...newPayment, date: e.target.value })} className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-green-500" />
                <textarea placeholder="Notes (optional)" value={newPayment.note} onChange={(e) => setNewPayment({ ...newPayment, note: e.target.value })} className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-green-500" rows="3"></textarea>
                <button type="submit" className="w-full bg-green-600 hover:bg-green-700 text-white font-bold py-3 px-4 rounded-lg disabled:opacity-50" disabled={isProcessing}>Record Payment</button>
                <button type="button" onClick={() => onClearBalance(selectedCylinder.id)} className="w-full bg-red-600 hover:bg-red-700 text-white font-bold py-3 px-4 rounded-lg mt-2 disabled:opacity-50" disabled={isProcessing}>Clear Full Balance</button>
            </form>
        </ModalContainer>
    );
};

const QuickPaymentModal = ({ onClose }) => {
    const { cylinders, getCustomerName, onAddPayment, isProcessing } = useApp();
    const [quickPayment, setQuickPayment] = useState({ cylinderId: '', amount: '', note: '', date: new Date().toISOString().split('T')[0] });
    const cylindersWithBalance = cylinders.filter(c => parseFloat(c.balance) > 0);
    const selectedCylinder = cylinders.find(c => c.id === quickPayment.cylinderId);

    const handleSubmit = (e) => {
        e.preventDefault();
        if (quickPayment.cylinderId && parseFloat(quickPayment.amount) > 0) {
            onAddPayment(quickPayment.cylinderId, quickPayment.amount, quickPayment.note, quickPayment.date);
        }
    };

    return (
        <ModalContainer title="Quick Payment" onClose={onClose}>
            <form onSubmit={handleSubmit} className="space-y-4">
                 <select value={quickPayment.cylinderId} onChange={e => setQuickPayment({...quickPayment, cylinderId: e.target.value})} className="w-full px-4 py-2 border rounded-lg" required>
                    <option value="" disabled>Select a cylinder</option>
                    {cylindersWithBalance.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                 </select>
                {selectedCylinder && (
                    <div className="p-3 bg-gray-50 rounded-lg border">
                        <p>Customer: {getCustomerName(selectedCylinder.customerId)}</p>
                        <p>Balance Due: {CURRENCY_SYMBOL}{selectedCylinder.balance}</p>
                    </div>
                )}
                <input type="number" step="0.01" placeholder="Amount" value={quickPayment.amount} onChange={e => setQuickPayment({...quickPayment, amount: e.target.value})} className="w-full px-4 py-2 border rounded-lg" required/>
                <input type="date" value={quickPayment.date} onChange={e => setQuickPayment({...quickPayment, date: e.target.value})} className="w-full px-4 py-2 border rounded-lg"/>
                <textarea placeholder="Note (optional)" value={quickPayment.note} onChange={e => setQuickPayment({...quickPayment, note: e.target.value})} className="w-full px-4 py-2 border rounded-lg" rows="2"/>
                <button type="submit" className="w-full bg-green-600 hover:bg-green-700 text-white font-bold py-3 px-4 rounded-lg" disabled={isProcessing}>{isProcessing ? 'Processing...' : 'Record Payment'}</button>
            </form>
        </ModalContainer>
    );
};

const CustomerLedgerModal = ({onClose}) => {
    const { cylinders, selectedCustomer, exportToPdf, firebaseServices, user } = useApp();
    const [transactions, setTransactions] = useState([]);
    const [summary, setSummary] = useState({ totalValue: 0, totalPaid: 0, totalDue: 0});
    const [loading, setLoading] = useState(true);
    
    useEffect(() => {
        if (!selectedCustomer || !firebaseServices.db || !user) return;
        const fetchLedger = async () => {
            setLoading(true);
            const customerCylinders = cylinders.filter(c => c.customerId === selectedCustomer.id);
            let allTransactions = [];
            for (const cylinder of customerCylinders) {
                 allTransactions.push({ type: 'Cylinder', name: cylinder.name, amount: cylinder.amountFromCustomer, date: cylinder.createdAt, id: `cyl-${cylinder.id}` });
                 const paymentsRef = collection(firebaseServices.db, `artifacts/${firebaseConfig.appId}/users/${user.uid}/cylinders/${cylinder.id}/payments`);
                 const paymentsSnap = await getDocs(paymentsRef);
                 paymentsSnap.forEach(doc => {
                     allTransactions.push({ type: 'Payment', name: cylinder.name, amount: doc.data().amount, date: doc.data().date, id: doc.id });
                 });
            }
            allTransactions.sort((a,b) => (a.date?.seconds || 0) - (b.date?.seconds || 0));
            setTransactions(allTransactions);

            const totalValue = customerCylinders.reduce((sum, c) => sum + parseFloat(c.amountFromCustomer || 0), 0);
            const totalPaid = customerCylinders.reduce((sum, c) => sum + parseFloat(c.amountPaid || 0), 0);
            setSummary({ totalValue, totalPaid, totalDue: totalValue - totalPaid });
            setLoading(false);
        };
        fetchLedger();
    }, [selectedCustomer, cylinders, firebaseServices.db, user, firebaseConfig.appId]);

    if (!selectedCustomer) return null;

    return (
        <ModalContainer title={`Ledger for ${selectedCustomer.name}`} onClose={onClose}>
            <button onClick={() => exportToPdf('ledger-content', `Ledger_${selectedCustomer.name}.pdf`)} className="mb-4 bg-gray-500 text-white py-2 px-4 rounded-lg flex items-center"><Download size={16} className="mr-2" />Export PDF</button>
            <div id="ledger-content" className="p-4 border rounded-lg bg-gray-50">
                 <div className="grid grid-cols-3 gap-4 mb-4 text-center">
                    <div><span className="text-sm text-gray-500">Total Value</span><p className="font-bold">{CURRENCY_SYMBOL}{summary.totalValue.toFixed(2)}</p></div>
                    <div><span className="text-sm text-gray-500">Total Paid</span><p className="font-bold text-green-600">{CURRENCY_SYMBOL}{summary.totalPaid.toFixed(2)}</p></div>
                    <div><span className="text-sm text-gray-500">Total Due</span><p className="font-bold text-red-600">{CURRENCY_SYMBOL}{summary.totalDue.toFixed(2)}</p></div>
                 </div>
                 <div className="overflow-y-auto max-h-80 space-y-2">
                    {loading ? <p>Loading...</p> : transactions.map(t => (
                        <div key={t.id} className={`p-2 rounded-md flex justify-between ${t.type === 'Payment' ? 'bg-green-50' : 'bg-blue-50'}`}>
                            <div><p className="font-semibold">{t.name}</p><p className="text-xs text-gray-500">{t.date?.seconds ? new Date(t.date.seconds * 1000).toLocaleDateString() : 'N/A'}</p></div>
                            <p className={`font-bold ${t.type === 'Payment' ? 'text-green-600' : 'text-blue-800'}`}>{CURRENCY_SYMBOL}{parseFloat(t.amount).toFixed(2)}</p>
                        </div>
                    ))}
                 </div>
            </div>
        </ModalContainer>
    );
};

const CustomerCylinderListModal = ({ onClose }) => {
    const { cylinders, selectedCustomer } = useApp();
    if (!selectedCustomer) return null;
    const customerCylinders = cylinders.filter(c => c.customerId === selectedCustomer.id);
    return (
        <ModalContainer title={`Cylinders for ${selectedCustomer.name}`} onClose={onClose}>
            <div className="space-y-2 max-h-96 overflow-y-auto">
                {customerCylinders.length > 0 ? customerCylinders.map(c => (
                    <div key={c.id} className="p-3 bg-gray-50 rounded-lg">
                        <p className="font-semibold">{c.name}</p>
                        <p className="text-sm">Balance: {CURRENCY_SYMBOL}{c.balance}</p>
                    </div>
                )) : <p>No cylinders found for this customer.</p>}
            </div>
        </ModalContainer>
    );
};

const SupplierCylinderListModal = ({ onClose }) => {
    const { cylinders, selectedSupplier } = useApp();
    if (!selectedSupplier) return null;
    const supplierCylinders = cylinders.filter(c => c.supplier === selectedSupplier.id);
    return (
        <ModalContainer title={`Cylinders from ${selectedSupplier.name}`} onClose={onClose}>
            <div className="space-y-2 max-h-96 overflow-y-auto">
                {supplierCylinders.length > 0 ? supplierCylinders.map(c => (
                    <div key={c.id} className="p-3 bg-gray-50 rounded-lg">
                        <p className="font-semibold">{c.name}</p>
                    </div>
                )) : <p>No cylinders found from this supplier.</p>}
            </div>
        </ModalContainer>
    );
};

const GenerateMessageModal = ({ onClose }) => {
    const { reminderMessage, openModal } = useApp();
    const handleCopy = () => {
        navigator.clipboard.writeText(reminderMessage);
        onClose();
        openModal('message', { title: 'Copied!', message: 'Reminder message copied to clipboard.' });
    };
    return (
        <ModalContainer title="Generate Reminder Message" onClose={onClose}>
            <textarea value={reminderMessage} readOnly className="w-full p-2 border rounded-lg bg-gray-50 font-mono text-sm" rows="8"/>
            <button onClick={handleCopy} className="w-full mt-4 bg-green-600 text-white py-2 px-4 rounded-lg flex items-center justify-center"><Clipboard className="mr-2" />Copy to Clipboard</button>
        </ModalContainer>
    );
};

const MessageModal = ({ onClose }) => {
    const { messageModalContent } = useApp();
    return (
        <ModalContainer title={messageModalContent.title} onClose={onClose}>
            <p className="text-center text-lg">{messageModalContent.message}</p>
            <button onClick={onClose} className="w-full mt-4 bg-blue-600 text-white py-2 px-4 rounded-lg">Close</button>
        </ModalContainer>
    );
};

const ConfirmationModal = ({ onClose }) => {
    const { confirmationModalContent } = useApp();
    const { title, message, onConfirm } = confirmationModalContent;
    return (
        <ModalContainer title={title} onClose={onClose}>
            <p className="text-center text-lg">{message}</p>
            <div className="flex justify-center space-x-4 mt-6">
                <button onClick={onClose} className="bg-gray-300 hover:bg-gray-400 text-gray-800 font-bold py-2 px-6 rounded-lg">Cancel</button>
                <button onClick={() => { onConfirm(); onClose(); }} className="bg-red-600 hover:bg-red-700 text-white font-bold py-2 px-6 rounded-lg">Confirm</button>
            </div>
        </ModalContainer>
    );
};

const ErrorModal = ({ onClose }) => {
    const { authError } = useApp();
    return (
        <ModalContainer title="Application Error" onClose={onClose}>
             <div className="flex items-center space-x-4 text-red-700 bg-red-100 p-4 rounded-lg">
                <AlertTriangle size={24} />
                <p className="text-sm font-medium">{authError}</p>
            </div>
            <button onClick={onClose} className="w-full mt-4 bg-red-600 text-white py-2 px-4 rounded-lg">Close</button>
        </ModalContainer>
    );
};

// --- AUTHENTICATION COMPONENTS ---
const Login = () => {
    const { handleLogin, authError, clearAuthError, isProcessing } = useApp();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');

    useEffect(() => { if (authError && !authError.includes("configuration")) { const t = setTimeout(clearAuthError, 5000); return () => clearTimeout(t); } }, [authError, clearAuthError]);
    const handleSubmit = (e) => { e.preventDefault(); handleLogin(email, password); };

    return (
        <div className="flex items-center justify-center min-h-screen bg-gray-100 p-4">
            <div className="w-full max-w-md p-8 space-y-6 bg-white rounded-xl shadow-lg">
                <h1 className="text-3xl font-bold text-center text-blue-600">Login to Your Account</h1>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="relative"><Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} /><input type="email" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} className="w-full pl-10 pr-4 py-2 border rounded-lg" required /></div>
                    <div className="relative"><Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} /><input type="password" placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)} className="w-full pl-10 pr-4 py-2 border rounded-lg" required /></div>
                    {authError && <p className="text-red-500 text-sm text-center">{authError}</p>}
                    <button type="submit" className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-lg" disabled={isProcessing}>{isProcessing ? 'Logging in...' : 'Login'}</button>
                </form>
                <p className="text-center text-sm">Don't have an account? <Link to="/register" className="text-blue-600 hover:underline">Register here</Link></p>
            </div>
        </div>
    );
};

const Register = () => {
    const { handleRegister, authError, clearAuthError, isProcessing } = useApp();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    useEffect(() => { if (authError) { const t = setTimeout(clearAuthError, 5000); return () => clearTimeout(t); } }, [authError, clearAuthError]);
    const handleSubmit = (e) => { e.preventDefault(); handleRegister(email, password); };

    return (
         <div className="flex items-center justify-center min-h-screen bg-gray-100 p-4">
            <div className="w-full max-w-md p-8 space-y-6 bg-white rounded-xl shadow-lg">
                <h1 className="text-3xl font-bold text-center text-blue-600">Create a New Account</h1>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="relative"><Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} /><input type="email" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} className="w-full pl-10 pr-4 py-2 border rounded-lg" required /></div>
                    <div className="relative"><Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} /><input type="password" placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)} className="w-full pl-10 pr-4 py-2 border rounded-lg" required /></div>
                     {authError && <p className="text-red-500 text-sm text-center">{authError}</p>}
                    <button type="submit" className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-lg" disabled={isProcessing}>{isProcessing ? 'Registering...' : 'Register'}</button>
                </form>
                 <p className="text-center text-sm">Already have an account? <Link to="/login" className="text-blue-600 hover:underline">Login here</Link></p>
            </div>
        </div>
    );
};

// --- LAYOUT COMPONENTS ---
const Sidebar = () => {
    const navItems = [
        { path: "/dashboard", icon: LayoutDashboard, label: "Dashboard" }, { path: "/cylinders", icon: ShoppingCart, label: "Cylinders" },
        { path: "/customers", icon: Users, label: "Customers" }, { path: "/suppliers", icon: Truck, label: "Suppliers" },
        { path: "/payments", icon: CreditCard, label: "Payments" }, { path: "/reports", icon: FileText, label: "Reports" },
    ];
    return (
        <aside className="w-64 bg-white border-r border-gray-200 flex-col hidden md:flex">
            <div className="h-16 flex items-center justify-center border-b"><h1 className="text-2xl font-bold text-blue-600">GasFlow</h1></div>
            <nav className="flex-1 px-4 py-6 space-y-2">
                {navItems.map(item => (
                    <NavLink key={item.path} to={item.path} className={({ isActive }) => `flex items-center px-4 py-2.5 rounded-lg text-sm font-medium transition-colors ${isActive ? 'bg-blue-100 text-blue-700' : 'text-gray-600 hover:bg-gray-100'}`}>
                        <item.icon className="w-5 h-5 mr-3" />{item.label}
                    </NavLink>
                ))}
            </nav>
        </aside>
    );
};

const Topbar = () => {
    const { user, handleSignOut, openModal } = useApp();
    const location = useLocation();
    const getPageTitle = () => { const path = location.pathname.split('/')[1]; return path.charAt(0).toUpperCase() + path.slice(1) || 'Dashboard'; };

    return (
        <header className="h-16 bg-white border-b flex items-center justify-between px-6">
            <h2 className="text-xl font-semibold text-gray-800">{getPageTitle()}</h2>
            <div className="flex items-center space-x-4">
                <button onClick={() => openModal('quickPayment')} className="bg-green-500 hover:bg-green-600 text-white font-bold py-2 px-4 rounded-lg text-sm flex items-center"><DollarSign size={16} className="mr-2"/>Quick Pay</button>
                <span className="text-sm text-gray-600 hidden sm:inline">{user?.email}</span>
                <button onClick={handleSignOut} className="flex items-center bg-red-500 hover:bg-red-600 text-white font-bold py-2 px-4 rounded-lg text-sm"><LogOut size={16} className="mr-0 sm:mr-2" /> <span className="hidden sm:inline">Logout</span></button>
            </div>
        </header>
    );
};

// --- FEATURE PAGES ---
const Dashboard = () => {
    const { cylinders, customers, suppliers, getCustomerName } = useApp();
    const totalOutstanding = cylinders.reduce((acc, cyl) => acc + parseFloat(cyl.balance), 0);
    const cylindersWithBalance = cylinders.filter(c => parseFloat(c.balance) > 0);

    return (
        <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <div className="bg-white p-6 rounded-lg shadow"><h3 className="text-gray-500">Total Cylinders</h3><p className="text-3xl font-bold">{cylinders.length}</p></div>
                <div className="bg-white p-6 rounded-lg shadow"><h3 className="text-gray-500">Total Customers</h3><p className="text-3xl font-bold">{customers.length}</p></div>
                <div className="bg-white p-6 rounded-lg shadow"><h3 className="text-gray-500">Total Suppliers</h3><p className="text-3xl font-bold">{suppliers.length}</p></div>
                <div className="bg-white p-6 rounded-lg shadow"><h3 className="text-gray-500">Outstanding</h3><p className="text-3xl font-bold text-red-500">{CURRENCY_SYMBOL}{totalOutstanding.toFixed(2)}</p></div>
            </div>
            <div className="bg-white p-6 rounded-lg shadow">
                <h3 className="text-xl font-bold mb-4">Cylinders with Outstanding Balances</h3>
                <div className="space-y-2 max-h-96 overflow-y-auto">
                    {cylindersWithBalance.length > 0 ? cylindersWithBalance.map(c => (
                        <div key={c.id} className="p-3 bg-gray-50 rounded-md flex justify-between items-center">
                            <div><p className="font-semibold">{c.name}</p><p className="text-sm text-gray-600">{getCustomerName(c.customerId)}</p></div>
                            <p className="font-bold text-red-500">{CURRENCY_SYMBOL}{c.balance}</p>
                        </div>
                    )) : <p className="text-gray-500">No outstanding balances.</p>}
                </div>
            </div>
        </div>
    );
};

const Cylinders = () => {
    const { cylinders, getCustomerName, handleEditCylinder, handleDeleteCylinder, handleAddPayment, openModal } = useApp();
    return (
        <div className="bg-white p-6 rounded-lg shadow">
            <div className="flex justify-between items-center mb-4"><h2 className="text-xl font-bold">Manage Cylinders</h2><button onClick={() => openModal('cylinder')} className="bg-blue-600 text-white font-bold py-2 px-4 rounded-lg flex items-center"><Plus size={20} className="mr-2"/>Add Cylinder</button></div>
            <div className="space-y-4">{cylinders.map(c => (<div key={c.id} className="bg-gray-50 p-4 rounded-lg md:flex justify-between items-center space-y-2 md:space-y-0"><div><h3 className="text-lg font-semibold">{c.name}</h3><p className="text-sm">Customer: {getCustomerName(c.customerId)}</p><p className="text-sm">Balance: {CURRENCY_SYMBOL}{c.balance}</p></div><div className="flex space-x-2"><button onClick={() => handleAddPayment(c)} className="bg-green-500 text-white text-xs py-1 px-2 rounded">Add Payment</button><button onClick={() => handleEditCylinder(c)} className="bg-blue-500 text-white text-xs py-1 px-2 rounded">Edit</button><button onClick={() => handleDeleteCylinder(c)} className="bg-red-500 text-white text-xs py-1 px-2 rounded">Delete</button></div></div>))}</div>
        </div>
    );
};

const Customers = () => {
    const { customers, openModal, handleDeleteCustomer, handleViewLedger, handleGenerateReminder, handleViewCylinders } = useApp();
    return (
        <div className="bg-white p-6 rounded-lg shadow">
            <div className="flex justify-between items-center mb-4"><h2 className="text-xl font-bold">Manage Customers</h2><button onClick={() => openModal('customer')} className="bg-indigo-600 text-white font-bold py-2 px-4 rounded-lg flex items-center"><Plus size={20} className="mr-2"/>Add Customer</button></div>
             <div className="space-y-4">{customers.map(c => (<div key={c.id} className="bg-gray-50 p-4 rounded-lg md:flex justify-between items-center space-y-2 md:space-y-0"><div><h3 className="text-lg font-semibold">{c.name}</h3><p className="text-sm">Contact: {c.contactInfo || 'N/A'}</p></div><div className="flex flex-wrap gap-2"><button onClick={() => handleViewCylinders(c)} className="bg-blue-500 text-white text-xs py-1 px-2 rounded">Cylinders</button><button onClick={() => handleViewLedger(c)} className="bg-gray-500 text-white text-xs py-1 px-2 rounded">Ledger</button><button onClick={() => handleGenerateReminder(c)} className="bg-teal-500 text-white text-xs py-1 px-2 rounded">Reminder</button><button onClick={() => handleDeleteCustomer(c)} className="bg-red-500 text-white text-xs py-1 px-2 rounded">Delete</button></div></div>))}</div>
        </div>
    );
};

const Suppliers = () => {
    const { suppliers, openModal, handleDeleteSupplier, handleViewSupplierCylinders } = useApp();
     return (
        <div className="bg-white p-6 rounded-lg shadow">
            <div className="flex justify-between items-center mb-4"><h2 className="text-xl font-bold">Manage Suppliers</h2><button onClick={() => openModal('supplier')} className="bg-purple-600 text-white font-bold py-2 px-4 rounded-lg flex items-center"><Plus size={20} className="mr-2"/>Add Supplier</button></div>
             <div className="space-y-4">{suppliers.map(s => (<div key={s.id} className="bg-gray-50 p-4 rounded-lg md:flex justify-between items-center space-y-2 md:space-y-0"><div><h3 className="text-lg font-semibold">{s.name}</h3><p className="text-sm">Contact: {s.contactInfo || 'N/A'}</p></div><div className="flex space-x-2"><button onClick={() => handleViewSupplierCylinders(s)} className="bg-purple-500 text-white text-xs py-1 px-2 rounded">Cylinders</button><button onClick={() => handleDeleteSupplier(s)} className="bg-red-500 text-white text-xs py-1 px-2 rounded">Delete</button></div></div>))}</div>
        </div>
    );
};

const Payments = () => <div className="bg-white p-6 rounded-lg shadow-md"><h3>Payments Page</h3><p>This section is a placeholder and will show a history of all payments received across all customers and cylinders.</p></div>;
const Reports = () => <div className="bg-white p-6 rounded-lg shadow-md"><h3>Reports Page</h3><p>This section is a placeholder and will allow generating detailed reports, such as monthly statements, outstanding balances, and more.</p></div>;


// --- MAIN APP PROVIDER & ROUTER SETUP ---
const AppProvider = ({ children }) => {
    const [firebaseServices, setFirebaseServices] = useState({ auth: null, db: null });
    const [user, setUser] = useState(null);
    const [isAuthReady, setIsAuthReady] = useState(false);
    const [authError, setAuthError] = useState('');
    const [isProcessing, setIsProcessing] = useState(false);
    const [cylinders, setCylinders] = useState([]);
    const [customers, setCustomers] = useState([]);
    const [suppliers, setSuppliers] = useState([]);
    const [modal, setModal] = useState({type: null, payload: null});
    const [reminderMessage, setReminderMessage] = useState('');
    
    useEffect(() => {
        try {
            if (Object.values(firebaseConfig).some(val => val && val.startsWith("YOUR_"))) {
                 setAuthError("Firebase configuration is incomplete. Please replace the placeholder values in App.js with your actual credentials.");
                 setIsAuthReady(true);
                 return;
            }
            const app = initializeApp(firebaseConfig);
            const auth = getAuth(app);
            const db = getFirestore(app);
            setFirebaseServices({ auth, db });
            const unsub = onAuthStateChanged(auth, u => { setUser(u); setIsAuthReady(true); });
            return () => unsub();
        } catch (e) { setAuthError(e.message); setIsAuthReady(true); }
    }, []);

    useEffect(() => {
        if (!user || !firebaseServices.db) { setCylinders([]); setCustomers([]); setSuppliers([]); return; }
        const { db } = firebaseServices;
        const appId = firebaseConfig.appId;
        const uid = user.uid;
        if (!appId || appId.startsWith("YOUR_")) return; 

        const unsub = (path, setter) => onSnapshot(collection(db, `artifacts/${appId}/users/${uid}/${path}`), snap => setter(snap.docs.map(d => ({id: d.id, ...d.data()}))));
        const unsubs = [
            unsub('customers', setCustomers), 
            unsub('suppliers', setSuppliers), 
            onSnapshot(collection(db, `artifacts/${appId}/users/${uid}/cylinders`), snap => {
                const cylinderList = snap.docs.map(d => ({id: d.id, ...d.data(), balance: calculateBalance(d.data())}));
                setCylinders(cylinderList);
            })
        ];
        return () => unsubs.forEach(u => typeof u === 'function' && u());
    }, [user, firebaseServices.db]);

    const firestoreOp = async (operation, closeModal = true) => {
        if (!user) return;
        setIsProcessing(true);
        try { 
            await operation(); 
            if (closeModal) setModal({type: null, payload: null});
        }
        catch (error) { setAuthError(error.message); setModal({type: 'error', payload: null}); }
        finally { setIsProcessing(false); }
    };
    
    const onAddCylinder = (data) => firestoreOp(() => addDoc(collection(firebaseServices.db, `artifacts/${firebaseConfig.appId}/users/${user.uid}/cylinders`), { ...data, amountPaid: 0, createdAt: serverTimestamp()}));
    const onUpdateCylinder = (id, data) => firestoreOp(() => updateDoc(doc(firebaseServices.db, `artifacts/${firebaseConfig.appId}/users/${user.uid}/cylinders`, id), data));
    const onAddCustomer = (data) => firestoreOp(() => addDoc(collection(firebaseServices.db, `artifacts/${firebaseConfig.appId}/users/${user.uid}/customers`), { ...data, createdAt: serverTimestamp() }));
    const onAddSupplier = (data) => firestoreOp(() => addDoc(collection(firebaseServices.db, `artifacts/${firebaseConfig.appId}/users/${user.uid}/suppliers`), { ...data, createdAt: serverTimestamp() }));
    const onAddPayment = (cylId, amount, note, date) => firestoreOp(async () => {
        const cylRef = doc(firebaseServices.db, `artifacts/${firebaseConfig.appId}/users/${user.uid}/cylinders`, cylId);
        const cylDoc = await getDoc(cylRef);
        const currentPaid = parseFloat(cylDoc.data().amountPaid || 0);
        await updateDoc(cylRef, { amountPaid: currentPaid + parseFloat(amount) });
        await addDoc(collection(cylRef, 'payments'), { amount, note, date: new Date(date), createdAt: serverTimestamp() });
    });
    const onClearBalance = (cylId) => firestoreOp(async () => {
        const cylRef = doc(firebaseServices.db, `artifacts/${firebaseConfig.appId}/users/${user.uid}/cylinders`, cylId);
        const data = (await getDoc(cylRef)).data();
        const amountToPay = parseFloat(data.amountFromCustomer) - parseFloat(data.amountPaid || 0);
        if (amountToPay > 0) onAddPayment(cylId, amountToPay.toString(), 'Balance cleared', new Date().toISOString().split('T')[0]);
    });
    const onDelete = (collectionName, docId) => firestoreOp(() => deleteDoc(doc(firebaseServices.db, `artifacts/${firebaseConfig.appId}/users/${user.uid}/${collectionName}`, docId)));

    const openModal = (type, payload = null) => setModal({ type, payload });
    const closeModal = () => setModal({ type: null, payload: null });
    
    const handleEditCylinder = (cylinder) => openModal('cylinder', cylinder);
    const handleAddPayment = (cylinder) => openModal('payment', cylinder);
    const handleViewLedger = (customer) => openModal('ledger', customer);
    const handleViewCylinders = (customer) => openModal('customerCylinders', customer);
    const handleViewSupplierCylinders = (supplier) => openModal('supplierCylinders', supplier);
    const handleGenerateReminder = (customer) => {
        const customerCylinders = cylinders.filter(c => c.customerId === customer.id && parseFloat(c.balance) > 0);
        if (customerCylinders.length === 0) { openModal('message', { title: 'All Clear!', message: `No outstanding payments for ${customer.name}.` }); return; }
        const totalDue = customerCylinders.reduce((sum, c) => sum + parseFloat(c.balance), 0).toFixed(2);
        const message = `Dear ${customer.name},\nThis is a reminder for your outstanding balance of ${CURRENCY_SYMBOL}${totalDue} for:\n${customerCylinders.map(c => `- ${c.name}: ${CURRENCY_SYMBOL}${c.balance}`).join('\n')}\nThank you.`;
        setReminderMessage(message);
        openModal('reminder');
    };
    const createDeleteHandler = (type, item) => {
        openModal('confirmation', { title: `Delete ${type}`, message: `Are you sure you want to delete ${item.name}?`, onConfirm: () => onDelete(`${type.toLowerCase()}s`, item.id) });
    };
    
    const exportToPdf = async (elementId, fileName) => {
        // PDF generation libraries (html2canvas, jspdf) must be available on the window object in the execution environment.
        if (typeof window.html2canvas === 'undefined' || typeof window.jspdf === 'undefined') {
             openModal('message', { title: 'Export Error', message: 'PDF generation libraries are not available.' });
             return;
        }
        const { jsPDF } = window.jspdf;
        const element = document.getElementById(elementId);
        if (!element) return;
        try {
            const canvas = await window.html2canvas(element, { useCORS: true });
            const imgData = canvas.toDataURL('image/png');
            const pdf = new jsPDF({ orientation: 'p', unit: 'mm', format: 'a4' });
            const imgProps = pdf.getImageProperties(imgData);
            const pdfWidth = pdf.internal.pageSize.getWidth();
            const pdfHeight = (imgProps.height * pdfWidth) / imgProps.width;
            pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
            pdf.save(fileName);
        } catch (error) {
            console.error("Error generating PDF:", error);
            openModal('message', { title: 'Export Error', message: 'An error occurred while generating the PDF.' });
        }
    };

    const value = {
        user, isAuthReady, authError, isProcessing, cylinders, customers, suppliers, reminderMessage, firebaseServices,
        editingCylinder: modal.type === 'cylinder' ? modal.payload : null,
        selectedCylinder: modal.type === 'payment' ? modal.payload : null,
        selectedCustomer: ['ledger', 'customerCylinders'].includes(modal.type) ? modal.payload : null,
        selectedSupplier: modal.type === 'supplierCylinders' ? modal.payload : null,
        messageModalContent: modal.type === 'message' ? modal.payload : {},
        confirmationModalContent: modal.type === 'confirmation' ? modal.payload : {},
        handleLogin: (email, password) => { setIsProcessing(true); signInWithEmailAndPassword(firebaseServices.auth, email, password).catch(e => setAuthError(e.message)).finally(() => setIsProcessing(false)); },
        handleRegister: (email, password) => { setIsProcessing(true); createUserWithEmailAndPassword(firebaseServices.auth, email, password).catch(e => setAuthError(e.message)).finally(() => setIsProcessing(false)); },
        handleSignOut: () => signOut(firebaseServices.auth),
        clearAuthError: () => setAuthError(''),
        onAddCylinder, onUpdateCylinder, onAddCustomer, onAddSupplier, onAddPayment, onClearBalance,
        openModal, closeModal, handleEditCylinder, handleAddPayment, handleViewLedger, handleGenerateReminder, handleViewCylinders, handleViewSupplierCylinders,
        handleDeleteCylinder: (c) => createDeleteHandler('Cylinder', c),
        handleDeleteCustomer: (c) => createDeleteHandler('Customer', c),
        handleDeleteSupplier: (s) => createDeleteHandler('Supplier', s),
        getCustomerName: (id) => customers.find(c => c.id === id)?.name || 'Unknown',
        exportToPdf,
    };

    const renderModal = () => {
        const modals = {
            cylinder: <CylinderModal onClose={closeModal} />,
            customer: <AddCustomerModal onClose={closeModal} />,
            supplier: <AddSupplierModal onClose={closeModal} />,
            payment: <AddPaymentModal onClose={closeModal} />,
            quickPayment: <QuickPaymentModal onClose={closeModal} />,
            ledger: <CustomerLedgerModal onClose={closeModal} />,
            customerCylinders: <CustomerCylinderListModal onClose={closeModal} />,
            supplierCylinders: <SupplierCylinderListModal onClose={closeModal} />,
            reminder: <GenerateMessageModal onClose={closeModal} />,
            message: <MessageModal onClose={closeModal} />,
            confirmation: <ConfirmationModal onClose={closeModal} />,
            error: <ErrorModal onClose={closeModal} />,
        };
        return modals[modal.type] || null;
    };

    return (<AppContext.Provider value={value}>{children}{renderModal()}</AppContext.Provider>);
};

const AppRoutes = () => {
    const { user, isAuthReady, authError } = useApp();
    
    if (!isAuthReady) return <div className="flex items-center justify-center h-screen"><RotateCcw className="animate-spin text-blue-500" size={48} /></div>;
    
    if (authError && authError.includes("configuration")) return <div className="flex items-center justify-center h-screen bg-red-50 text-red-700 p-4 text-center">{authError}</div>;

    return (
        <Routes>
            <Route path="/login" element={!user ? <Login /> : <Navigate to="/dashboard" />} />
            <Route path="/register" element={!user ? <Register /> : <Navigate to="/dashboard" />} />
            <Route path="/*" element={user ? (
                <div className="flex min-h-screen bg-gray-50">
                    <Sidebar />
                    <div className="flex-1 flex flex-col min-w-0">
                        <Topbar />
                        <main className="p-6 flex-1 overflow-y-auto">
                            <Routes>
                                <Route path="/dashboard" element={<Dashboard />} />
                                <Route path="/cylinders" element={<Cylinders />} />
                                <Route path="/customers" element={<Customers />} />
                                <Route path="/suppliers" element={<Suppliers />} />
                                <Route path="/payments" element={<Payments />} />
                                <Route path="/reports" element={<Reports />} />
                                <Route path="*" element={<Navigate to="/dashboard" />} />
                            </Routes>
                        </main>
                    </div>
                </div>
            ) : <Navigate to="/login" />} />
        </Routes>
    );
};

export default function App() {
    return (
        <AppProvider>
            <Router>
                <AppRoutes />
            </Router>
        </AppProvider>
    );
}

