/* global __initial_auth_token */
import { useState, useEffect } from 'react';
import { initializeApp } from 'firebase/app';
import { getAuth, signInWithCustomToken, onAuthStateChanged, signOut, signInAnonymously, createUserWithEmailAndPassword, signInWithEmailAndPassword } from 'firebase/auth';
import { getFirestore, doc, getDoc, addDoc, setDoc, updateDoc, deleteDoc, onSnapshot, collection, query, where, serverTimestamp, getDocs, updateDoc as updateDocFirestore } from 'firebase/firestore';
import {


// Cloudinary image upload function (placed before usage so ESLint sees it)
const uploadImageToCloudinary = async (imageFile) => {
  if (!imageFile) return null;
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
  Lock,
  UserPlus
} from 'lucide-react';

// Include jsPDF and html2canvas libraries for PDF export
const script1 = document.createElement('script');
script1.src = "https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js";
document.head.appendChild(script1);

const script2 = document.createElement('script');
script2.src = "https://cdnjs.cloudflare.com/ajax/libs/html2canvas/1.4.1/html2canvas.min.js";
document.head.appendChild(script2);

// Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyBL0hWDfSRuILLHSTxsbqlWnT3EwNzIEcs",
  authDomain: "cylinder-app-28a3d.firebaseapp.com",
  projectId: "cylinder-app-28a3d",
  storageBucket: "cylinder-app-28a3d.appspot.com",
  messagingSenderId: "52349586303",
  appId: "1:52349586303:web:6e3b5f111f92e7930c284a"
};

// Initialize Firebase services and get instances
const firebaseApp = initializeApp(firebaseConfig);
const auth = getAuth(firebaseApp);
const db = getFirestore(firebaseApp);

// Main App component
const App = () => {
  // Constant for currency symbol for easy global changes
  const CURRENCY_SYMBOL = '₹';
  
  // State variables for Firebase services and data
  const [user, setUser] = useState(null);
  const [isAuthReady, setIsAuthReady] = useState(false);
  const [cylinders, setCylinders] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [suppliers, setSuppliers] = useState([]); 
  
  // State variables for UI
  const [view, setView] = useState('dashboard');
  const [showModal, setShowModal] = useState(null);
  const [selectedCylinder, setSelectedCylinder] = useState(null);
  const [editingCylinder, setEditingCylinder] = useState(null); 
  const [selectedCustomerForLedger, setSelectedCustomerForLedger] = useState(null);
  const [selectedCustomerForCylinderList, setSelectedCustomerForCylinderList] = useState(null);
  const [selectedSupplierForCylinderList, setSelectedSupplierForCylinderList] = useState(null);
  const [reminderMessage, setReminderMessage] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [confirmationModal, setConfirmationModal] = useState(null);
  const [error, setError] = useState(null); 
  const [isAddingCustomerFromCylinder, setIsAddingCustomerFromCylinder] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);

  // Global variables from the Canvas environment, with fallbacks for local development
  const appId = "cylinder-app-28a3d";
  const initialAuthToken = (typeof window !== 'undefined' && typeof window.__initial_auth_token !== 'undefined') ? window.__initial_auth_token : null;
  
  // Cloudinary configuration
  const cloudinaryCloudName = "dhruvsb";
  const cloudinaryUploadPreset = "CYLINDER-APP";
  
  // 1. Initialize Firebase and listen for auth state changes
  useEffect(() => {
    try {
      // Set up authentication state listener
      onAuthStateChanged(auth, (user) => {
        if (user) {
          setUser(user);
        } else {
          setUser(null);
        }
        setIsAuthReady(true);
      });

      // Sign in with custom token if available (for Canvas environment)
      if (initialAuthToken) {
        signInWithCustomToken(auth, initialAuthToken).catch(e => {
            console.error("Custom token sign-in failed:", e);
            // Fallback to anonymous sign-in if custom token fails
            signInAnonymously(auth).catch(console.error);
        });
      } else {
        // Sign in anonymously for local testing or when no custom token is available
        signInAnonymously(auth).catch(console.error);
      }
    } catch (e) {
      console.error("Firebase initialization error:", e);
      setError("Failed to initialize Firebase. Please try reloading the application.");
    }
  }, []);

  // Get the current user's ID or a fallback
  const userId = user?.uid || 'anonymous';

  // 2. Fetch data from Firestore once authenticated
  useEffect(() => {
    // Only proceed if Firebase is initialized and the user is authenticated
    if (!db || !isAuthReady || !user || !userId) {
        setLoading(false);
        return;
    }

    // Set up a real-time listener for cylinders
    const unsubscribeCylinders = onSnapshot(collection(db, `artifacts/${appId}/users/${userId}/cylinders`), (snapshot) => {
      try {
        const cylinderData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        setCylinders(cylinderData);
      } catch (e) {
        console.error("Failed to fetch cylinders:", e);
        setError("Could not load cylinder data. Please check your connection.");
      } finally {
        setLoading(false);
      }
    });

    // Set up a real-time listener for customers
    const unsubscribeCustomers = onSnapshot(collection(db, `artifacts/${appId}/users/${userId}/customers`), (snapshot) => {
      try {
        const customerData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        setCustomers(customerData);
      } catch (e) {
        console.error("Failed to fetch customers:", e);
        setError("Could not load customer data. Please check your connection.");
      }
    });

    // Set up a real-time listener for suppliers
    const unsubscribeSuppliers = onSnapshot(collection(db, `artifacts/${appId}/users/${userId}/suppliers`), (snapshot) => {
        try {
            const supplierData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
            setSuppliers(supplierData);
        } catch (e) {
            console.error("Failed to fetch suppliers:", e);
            setError("Could not load supplier data. Please check your connection.");
        }
    });

    // Clean up listeners on component unmount
    return () => {
      unsubscribeCylinders();
      unsubscribeCustomers();
      unsubscribeSuppliers();
    };
  }, [db, isAuthReady, user, userId]);

  // Handle user login with email and password
  const handleLogin = async (email, password) => {
      if (!auth) return;
      try {
          setError(null);
          await signInWithEmailAndPassword(auth, email, password);
      } catch (e) {
          setError(e.message);
          console.error("Login failed:", e);
      }
  };

  // Handle user registration with email and password
  const handleRegister = async (email, password) => {
      if (!auth) return;
      try {
          setError(null);
          await createUserWithEmailAndPassword(auth, email, password);
      } catch (e) {
          setError(e.message);
          console.error("Registration failed:", e);
      }
  };

  // Handle user logout
  const handleLogout = async () => {
      if (!auth) return;
      try {
          setError(null);
          await signOut(auth);
          // Sign in anonymously after logout so app is still usable
          signInAnonymously(auth);
      } catch (e) {
          setError(e.message);
          console.error("Logout failed:", e);
      }
  };

  // Helper function to get customer name from ID
  const getCustomerName = (id) => {
    const customer = customers.find(c => c.id === id);
    return customer ? customer.name : 'Unknown Customer';
  };
  
  // Helper function to get supplier name from ID
  const getSupplierName = (id) => {
    const supplier = suppliers.find(s => s.id === id);
    return supplier ? supplier.name : 'Unknown Supplier';
  };
  
  // Helper function to calculate outstanding balance
  const calculateBalance = (cylinder) => {
    const amountFromCustomer = parseFloat(cylinder.amountFromCustomer);
    const amountPaid = parseFloat(cylinder.amountPaid) || 0;
    return (amountFromCustomer - amountPaid).toFixed(2);
  };
  
  // Deletion helper function for subcollections
  const deleteCollection = async (collectionPath) => {
    const querySnapshot = await getDocs(collection(db, collectionPath));
    const deletePromises = querySnapshot.docs.map(doc => deleteDoc(doc.ref));
    return Promise.all(deletePromises);
  };

  // PDF Export function
  const exportToPdf = (elementId, filename) => {
    const input = document.getElementById(elementId);
    if (!input) {
      setError("Element not found for PDF export.");
      return;
    }
    
    // Dynamically import html2canvas and jspdf
    if (typeof window.html2canvas !== 'undefined' && typeof window.jspdf !== 'undefined') {
        window.html2canvas(input, { scale: 3 }).then((canvas) => {
            const imgData = canvas.toDataURL('image/png');
            const pdf = new window.jspdf.jsPDF('p', 'mm', 'a4');
            const imgWidth = 210; 
            const pageHeight = 295;
            const imgHeight = canvas.height * imgWidth / canvas.width;
            let heightLeft = imgHeight;
            let position = 0;

            pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
            heightLeft -= pageHeight;

            while (heightLeft >= 0) {
                position = heightLeft - imgHeight;
                pdf.addPage();
                pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
                heightLeft -= pageHeight;
            }
            pdf.save(filename);
        }).catch(err => {
            console.error("PDF export failed:", err);
            setError("Failed to export to PDF. Please try again.");
        });
    } else {
        setError("PDF export failed: html2canvas or jspdf library not loaded.");
    }
  };

  // Cloudinary image upload function
  // Handlers for data
  const handleAddCylinder = async (newCylinderData) => {
    if (!db || isProcessing) return;
    setIsProcessing(true);
    try {
      const totalCylinderValue = parseFloat(newCylinderData.totalCylinderValue);
      let amountFromCustomer = totalCylinderValue;
      if (newCylinderData.paymentPolicy.type === 'percentage') {
        const percentage = parseFloat(newCylinderData.paymentPolicy.value);
        if (!isNaN(percentage)) {
          amountFromCustomer = totalCylinderValue * (percentage / 100);
        }
      }

      await addDoc(collection(db, `artifacts/${appId}/users/${userId}/cylinders`), {
        ...newCylinderData,
        totalCylinderValue: totalCylinderValue,
        amountFromCustomer: amountFromCustomer,
        numberOfCylinders: parseInt(newCylinderData.numberOfCylinders, 10) || 1,
        amountPaid: 0,
        balance: amountFromCustomer,
        createdAt: serverTimestamp(),
        cylinderDate: newCylinderData.cylinderDate ? new Date(newCylinderData.cylinderDate) : null
      });
      setShowModal(null);
    } catch (e) {
      console.error("Error adding cylinder: ", e);
      setError("Failed to add new cylinder. Please try again.");
    } finally {
      setIsProcessing(false);
    }
  };

  const handleUpdateCylinder = async (cylinderId, updatedCylinderData) => {
    if (!db || isProcessing) return;
    setIsProcessing(true);
    try {
      const cylinderRef = doc(db, `artifacts/${appId}/users/${userId}/cylinders`, cylinderId);
      const currentCylinderData = cylinders.find(c => c.id === cylinderId);

      const totalCylinderValue = parseFloat(updatedCylinderData.totalCylinderValue);
      let amountFromCustomer = totalCylinderValue;
      if (updatedCylinderData.paymentPolicy.type === 'percentage') {
        const percentage = parseFloat(updatedCylinderData.paymentPolicy.value);
        if (!isNaN(percentage)) {
          amountFromCustomer = totalCylinderValue * (percentage / 100);
        }
      }
      
      const updatedAmountPaid = currentCylinderData?.amountPaid || 0;
      const updatedBalance = amountFromCustomer - updatedAmountPaid;

      // Create a new object to avoid sending the image file to Firestore
      const sanitizedData = { ...updatedCylinderData };
      delete sanitizedData.imageFile;

      await updateDocFirestore(cylinderRef, {
        ...sanitizedData,
        totalCylinderValue: totalCylinderValue,
        amountFromCustomer: amountFromCustomer,
        balance: updatedBalance,
      });

      setEditingCylinder(null);
      setShowModal(null);
    } catch (e) {
      console.error("Error updating cylinder: ", e);
      setError("Failed to update cylinder. Please try again.");
    } finally {
      setIsProcessing(false);
    }
  };


  const handleAddPayment = async (cylinderId, amount, note, date) => {
    if (!db || isProcessing) return;
    setIsProcessing(true);
    try {
      const cylinderRef = doc(db, `artifacts/${appId}/users/${userId}/cylinders`, cylinderId);
      const cylinderSnap = await getDoc(cylinderRef);
      const cylinder = cylinderSnap.data();

      if (!cylinder) {
        console.error("Cylinder not found for payment.");
        setError("Cylinder not found for payment. Please refresh and try again.");
        setIsProcessing(false);
        return;
      }
      
      const paymentAmount = parseFloat(amount);
      const updatedAmountPaid = (parseFloat(cylinder.amountPaid) || 0) + paymentAmount;
      const updatedBalance = parseFloat(cylinder.balance) - paymentAmount;

      await updateDocFirestore(cylinderRef, {
        amountPaid: updatedAmountPaid,
        balance: updatedBalance,
        lastPaymentDate: serverTimestamp()
      });

      await addDoc(collection(db, `artifacts/${appId}/users/${userId}/cylinders/${cylinderId}/payments`), {
        amount: paymentAmount,
        date: date ? new Date(date) : serverTimestamp(),
        note: note
      });
      
      setShowModal(null);
    } catch (e) {
      console.error("Error adding payment: ", e);
      setError("Failed to record payment. Please try again.");
    } finally {
      setIsProcessing(false);
    }
  };

  const handleAddCustomer = async (newCustomerData) => {
    if (!db || isProcessing) return;
    setIsProcessing(true);
    try {
      await addDoc(collection(db, `artifacts/${appId}/users/${userId}/customers`), newCustomerData);
      
      if (isAddingCustomerFromCylinder) {
        setIsAddingCustomerFromCylinder(false);
        setShowModal('addCylinder');
      } else {
        setShowModal(null);
      }
    } catch (e) {
      console.error("Error adding customer: ", e);
      setError("Failed to add customer. Please try again.");
    } finally {
      setIsProcessing(false);
    }
  };
  
  const handleAddSupplier = async (newSupplierData) => {
      if (!db || isProcessing) return;
      setIsProcessing(true);
      try {
          await addDoc(collection(db, `artifacts/${appId}/users/${userId}/suppliers`), newSupplierData);
          setShowModal(null);
      } catch (e) {
          console.error("Error adding supplier: ", e);
          setError("Could not load supplier data. Please check your connection.");
      } finally {
        setIsProcessing(false);
      }
  };

  const handleClearBalance = async (cylinderId) => {
    if (!db || isProcessing) return;
    setIsProcessing(true);
    try {
      const cylinderRef = doc(db, `artifacts/${appId}/users/${userId}/cylinders`, cylinderId);
      const cylinder = cylinders.find(c => c.id === cylinderId);
      if (!cylinder) {
        setError("Cylinder not found.");
        setIsProcessing(false);
        return;
      }

      await updateDocFirestore(cylinderRef, {
        amountPaid: parseFloat(cylinder.amountFromCustomer),
        balance: 0,
        lastPaymentDate: serverTimestamp(),
      });

      await addDoc(collection(db, `artifacts/${appId}/users/${userId}/cylinders/${cylinderId}/payments`), {
          amount: parseFloat(cylinder.balance),
          date: serverTimestamp(),
          note: 'Balance written off as bad debt.'
      });

      setShowModal(null);
    } catch (e) {
      console.error("Error clearing balance:", e);
      setError("Failed to clear balance. Please try again.");
    } finally {
      setIsProcessing(false);
    }
  };

  const handleDeleteCylinder = async (cylinderId) => {
    if (!db) return;
    try {
      setLoading(true);
      await deleteCollection(`artifacts/${appId}/users/${userId}/cylinders/${cylinderId}/payments`);
      await deleteDoc(doc(db, `artifacts/${appId}/users/${userId}/cylinders`, cylinderId));
      console.log(`Cylinder ${cylinderId} and its payments deleted successfully.`);
      setLoading(false);
      setConfirmationModal(null);
    } catch (e) {
      console.error("Error deleting cylinder: ", e);
      setError("Failed to delete cylinder. Please try again.");
      setLoading(false);
    }
  };

  const handleDeleteCustomer = async (customerId) => {
    if (!db) return;
    try {
      setLoading(true);
      const cylindersToDelete = cylinders.filter(c => c.customerId === customerId);
      const deletePromises = cylindersToDelete.map(c => handleDeleteCylinder(c.id));
      await Promise.all(deletePromises);
      await deleteDoc(doc(db, `artifacts/${appId}/users/${userId}/customers`, customerId));
      console.log(`Customer ${customerId} and all associated cylinders deleted.`);
      setLoading(false);
      setConfirmationModal(null);
    } catch (e) {
      console.error("Error deleting customer: ", e);
      setError("Failed to delete customer. Please try again.");
      setLoading(false);
    }
  };
  
  // New handler for deleting a supplier
  const handleDeleteSupplier = async (supplierId) => {
      if (!db) return;
      try {
          setLoading(true);
          const cylindersToDelete = cylinders.filter(c => c.supplier === supplierId);
          if (cylindersToDelete.length > 0) {
              setError("Cannot delete supplier with associated cylinders.");
              setConfirmationModal(null);
              setLoading(false);
              return;
          }
          await deleteDoc(doc(db, `artifacts/${appId}/users/${userId}/suppliers`, supplierId));
          console.log(`Supplier ${supplierId} deleted successfully.`);
          setLoading(false);
          setConfirmationModal(null);
      } catch (e) {
          console.error("Error deleting supplier: ", e);
          setError("Failed to delete supplier. Please try again.");
          setLoading(false);
      }
  };

  const handleOpenAddCustomerFromCylinder = () => {
    setIsAddingCustomerFromCylinder(true);
    setShowModal('addCustomer');
  };

  const handleEditCylinder = (cylinder) => {
    setEditingCylinder(cylinder);
    setShowModal('addCylinder');
  };

  const handleViewCylinderList = (customer) => {
    setSelectedCustomerForCylinderList(customer);
    setShowModal('customerCylinderList');
  };

  const handleViewSupplierCylinderList = (supplier) => {
      setSelectedSupplierForCylinderList(supplier);
      setShowModal('supplierCylinderList');
  };

  const generateReminderMessage = (cylinder) => {
    const balance = parseFloat(cylinder.balance).toFixed(2);
    const message = `Dear Customer,\n\nThis is a friendly reminder regarding the outstanding balance for the cylinder "${cylinder.name}". The amount due is ${CURRENCY_SYMBOL}${balance}.\n\nPlease let us know when you can clear the payment.\n\nThank you,\nSHRI GURUNAK INDUSTRIES`;
    setReminderMessage(message);
    setSelectedCylinder(cylinder);
    setShowModal('generateMessage');
  };

  const handleCopyToClipboard = () => {
    try {
      const textarea = document.getElementById('reminder-message-textarea');
      if (textarea) {
        textarea.select();
        document.execCommand('copy');
        setShowModal('copySuccess');
      }
    } catch (err) {
      console.error('Failed to copy text: ', err);
      setError("Failed to copy message to clipboard.");
    }
  };

  const handleViewLedger = (customer) => {
    setSelectedCustomerForLedger(customer);
    setShowModal('customerLedger');
  };

  const filteredCylinders = cylinders.filter(c => 
    c.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
    getCustomerName(c.customerId).toLowerCase().includes(searchQuery.toLowerCase())
  );
  
  const totalCylinders = cylinders.length;
  const totalOutstandingBalance = cylinders.reduce((sum, c) => sum + parseFloat(c.balance), 0);
  const overdueCylinders = cylinders.filter(c => c.balance > 0 && c.cylinderDate && new Date(c.cylinderDate.seconds * 1000) < new Date());

  const renderView = () => {
    switch (view) {
      case 'dashboard':
        return (
          <div className="p-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div className="bg-white p-6 rounded-xl shadow-lg flex flex-col items-center justify-center">
              <BarChart className="text-blue-500 mb-2" size={48} />
              <p className="text-lg font-semibold">Total Cylinders</p>
              <h3 className="text-3xl font-bold text-gray-800">{totalCylinders}</h3>
            </div>
            <div className="bg-white p-6 rounded-xl shadow-lg flex flex-col items-center justify-center">
              <DollarSign className="text-green-500 mb-2" size={48} />
              <p className="text-lg font-semibold">Total Outstanding</p>
              <h3 className="text-3xl font-bold text-gray-800">{CURRENCY_SYMBOL}{totalOutstandingBalance.toFixed(2)}</h3>
            </div>
            <div className="bg-white p-6 rounded-xl shadow-lg flex flex-col items-center justify-center">
              <AlertCircle className="text-red-500 mb-2" size={48} />
              <p className="text-lg font-semibold">Overdue Payments</p>
              <h3 className="text-3xl font-bold text-gray-800">{overdueCylinders.length}</h3>
            </div>
            <div className="md:col-span-2 lg:col-span-3">
              <h4 className="text-xl font-bold text-gray-800 mb-4">Quick Actions</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <button
                  onClick={() => { setEditingCylinder(null); setShowModal('addCylinder'); }}
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-6 rounded-lg shadow-md transition-colors duration-200"
                >
                  <Plus className="inline-block mr-2" /> Add New Cylinder
                </button>
                <button
                  onClick={() => setView('customers')}
                  className="w-full text-left px-4 py-2 rounded-lg flex items-center space-x-3 transition-colors duration-200"
                >
                  <User size={20} />
                  <span>Manage Customers</span>
                </button>
                <button
                  onClick={() => setView('reminders')}
                  className="w-full bg-yellow-500 hover:bg-yellow-600 text-white font-bold py-3 px-6 rounded-lg shadow-md transition-colors duration-200"
                >
                  <AlertCircle className="inline-block mr-2" /> View Reminders
                </button>
                <button
                  onClick={() => setShowModal('quickPayment')}
                  className="w-full bg-green-600 hover:bg-green-700 text-white font-bold py-3 px-6 rounded-lg shadow-md transition-colors duration-200"
                >
                  <DollarSign className="inline-block mr-2" /> Quick Payment
                </button>
              </div>
            </div>
            {overdueCylinders.length > 0 && (
              <div className="md:col-span-2 lg:col-span-3 mt-8 bg-red-100 border-l-4 border-red-500 p-4 rounded-xl shadow-inner">
                <h4 className="text-xl font-bold text-red-800 mb-2">Overdue Cylinders</h4>
                <p className="text-sm text-red-700 mb-4">You have {overdueCylinders.length} payments that are overdue. Please visit the reminders page to follow up.</p>
                <ul className="space-y-2">
                  {overdueCylinders.map(c => (
                    <li key={c.id} className="flex justify-between items-center bg-red-50 p-3 rounded-lg shadow-sm">
                      <span className="font-medium text-red-900">{c.name} ({getCustomerName(c.customerId)})</span>
                      <span className="font-bold text-red-700">{CURRENCY_SYMBOL}{parseFloat(c.balance).toFixed(2)} Due</span>
                      <button 
                          onClick={(e) => { e.stopPropagation(); generateReminderMessage(cylinder); }}
                          className="bg-red-500 hover:bg-red-600 text-white py-1 px-3 rounded-full text-sm font-semibold transition-colors duration-200"
                      >
                          Remind
                      </button>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        );
      case 'cylinders':
        return (
          <div className="p-6">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-gray-800">Cylinder Tracking</h2>
              <div className="flex items-center space-x-2">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                  <input
                    type="text"
                    placeholder="Search cylinders..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <button
                  onClick={() => exportToPdf('cylinders-table', 'Cylinder_List.pdf')}
                  className="bg-gray-500 hover:bg-gray-600 text-white font-bold py-2 px-4 rounded-lg shadow-md transition-colors duration-200"
                >
                  <Download size={20} className="inline-block mr-2" /> Export to PDF
                </button>
                <button
                  onClick={() => { setEditingCylinder(null); setShowModal('addCylinder'); }}
                  className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-lg shadow-md transition-colors duration-200"
                >
                  <Plus size={20} className="inline-block mr-2" /> Add Cylinder
                </button>
              </div>
            </div>
            {filteredCylinders.length === 0 ? (
              <p className="text-center text-gray-500">No cylinders found.</p>
            ) : (
              <div id="cylinders-table" className="overflow-x-auto bg-white rounded-xl shadow-lg">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Cylinder Name</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Customer</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Total Value</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Amount Paid</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Balance</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date of Cylinder</th>
                      <th className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {filteredCylinders.map((cylinder) => (
                      <tr key={cylinder.id} className="cursor-pointer hover:bg-gray-50" onClick={() => handleEditCylinder(cylinder)}>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{cylinder.name}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{getCustomerName(cylinder.customerId)}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{CURRENCY_SYMBOL}{parseFloat(cylinder.totalCylinderValue).toFixed(2)}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{CURRENCY_SYMBOL}{parseFloat(cylinder.amountPaid).toFixed(2)}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-gray-900">{CURRENCY_SYMBOL}{parseFloat(cylinder.balance).toFixed(2)}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {cylinder.cylinderDate ? new Date(cylinder.cylinderDate.seconds * 1000).toLocaleDateString('en-GB') : 'N/A'}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium space-x-2 flex items-center justify-end">
                          <button
                            onClick={(e) => { e.stopPropagation(); setSelectedCylinder(cylinder); setShowModal('addPayment'); }}
                            className="text-indigo-600 hover:text-indigo-900 transition-colors duration-200"
                          >
                            Add Payment
                          </button>
                          <button
                            onClick={(e) => { e.stopPropagation(); generateReminderMessage(cylinder); }}
                            className="text-yellow-600 hover:text-yellow-900 transition-colors duration-200"
                          >
                            Remind
                          </button>
                          <button
                            onClick={(e) => { e.stopPropagation(); setConfirmationModal({
                                type: 'deleteCylinder',
                                id: cylinder.id,
                                name: cylinder.name
                            }); }}
                            className="text-red-600 hover:text-red-900 transition-colors duration-200 ml-2"
                          >
                            <Trash2 size={16} />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        );
      case 'customers':
        return (
          <div className="p-6">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-gray-800">Customer Management</h2>
              <button
                onClick={() => exportToPdf('customers-table', 'Customer_List.pdf')}
                className="bg-gray-500 hover:bg-gray-600 text-white font-bold py-2 px-4 rounded-lg shadow-md transition-colors duration-200 mr-2"
              >
                <Download size={20} className="inline-block mr-2" /> Export to PDF
              </button>
              <button
                onClick={() => setShowModal('addCustomer')}
                className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2 px-4 rounded-lg shadow-md transition-colors duration-200"
              >
                <Plus size={20} className="inline-block mr-2" /> Add Customer
              </button>
            </div>
            {customers.length === 0 ? (
              <p className="text-center text-gray-500">No customers found.</p>
            ) : (
              <div id="customers-table" className="overflow-x-auto bg-white rounded-xl shadow-lg">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Customer Name</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Contact Info</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {customers.map((customer) => (
                      <tr key={customer.id}>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{customer.name}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{customer.contactInfo}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium space-x-2 flex items-center justify-end">
                          <button
                            onClick={() => handleViewLedger(customer)}
                            className="text-blue-600 hover:text-blue-900 transition-colors duration-200"
                          >
                            View Ledger
                          </button>
                          <button
                            onClick={() => handleViewCylinderList(customer)}
                            className="text-indigo-600 hover:text-indigo-900 transition-colors duration-200"
                          >
                            List of Cylinders
                          </button>
                          <button
                            onClick={() => setConfirmationModal({
                                type: 'deleteCustomer',
                                id: customer.id,
                                name: customer.name
                            })}
                            className="text-red-600 hover:text-red-900 transition-colors duration-200 ml-2"
                          >
                            <Trash2 size={16} />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        );
      case 'suppliers':
          return (
              <div className="p-6">
                  <div className="flex justify-between items-center mb-6">
                      <h2 className="text-2xl font-bold text-gray-800">Supplier Management</h2>
                      <button
                          onClick={() => setShowModal('addSupplier')}
                          className="bg-purple-600 hover:bg-purple-700 text-white font-bold py-2 px-4 rounded-lg shadow-md transition-colors duration-200"
                      >
                          <Plus size={20} className="inline-block mr-2" /> Add Supplier
                      </button>
                  </div>
                  {suppliers.length === 0 ? (
                      <p className="text-center text-gray-500">No suppliers found.</p>
                  ) : (
                      <div id="suppliers-table" className="overflow-x-auto bg-white rounded-xl shadow-lg">
                          <table className="min-w-full divide-y divide-gray-200">
                              <thead className="bg-gray-50">
                                  <tr>
                                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Supplier Name</th>
                                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Contact Info</th>
                                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                                  </tr>
                              </thead>
                              <tbody className="bg-white divide-y divide-gray-200">
                                  {suppliers.map((supplier) => (
                                      <tr key={supplier.id}>
                                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{supplier.name}</td>
                                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{supplier.contactInfo || 'N/A'}</td>
                                          <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium space-x-2 flex items-center justify-end">
                                              <button
                                                  onClick={() => handleViewSupplierCylinderList(supplier)}
                                                  className="text-purple-600 hover:text-purple-900 transition-colors duration-200"
                                              >
                                                  View Cylinders
                                              </button>
                                              <button
                                                  onClick={() => setConfirmationModal({
                                                      type: 'deleteSupplier',
                                                      id: supplier.id,
                                                      name: supplier.name
                                                  })}
                                                  className="text-red-600 hover:text-red-900 transition-colors duration-200 ml-2"
                                              >
                                                  <Trash2 size={16} />
                                              </button>
                                          </td>
                                      </tr>
                                  ))}
                              </tbody>
                          </table>
                      </div>
                  )}
              </div>
          );
      case 'reminders':
        return (
          <div className="p-6">
            <h2 className="text-2xl font-bold text-gray-800 mb-6">Reminders</h2>
            {overdueCylinders.length === 0 ? (
              <div className="bg-green-100 border-l-4 border-green-500 p-4 rounded-xl">
                <p className="font-bold text-green-800">No Overdue Payments!</p>
                <p className="text-sm text-green-700 mt-1">All good. Keep up the great work!</p>
              </div>
            ) : (
              <div className="space-y-4">
                {overdueCylinders.map((c) => (
                  <div key={c.id} className="bg-white p-4 rounded-xl shadow-lg flex justify-between items-center">
                    <div>
                      <p className="text-lg font-bold text-gray-800">{c.name}</p>
                      <p className="text-sm text-gray-600">Customer: {getCustomerName(c.customerId)}</p>
                      <p className="text-sm text-red-500 font-bold mt-1">Balance Due: {CURRENCY_SYMBOL}{parseFloat(c.balance).toFixed(2)}</p>
                      <p className="text-xs text-gray-500">Due since: {c.cylinderDate ? new Date(c.cylinderDate.seconds * 1000).toLocaleDateString('en-GB') : 'N/A'}</p>
                    </div>
                    <button
                      onClick={() => generateReminderMessage(cylinder)}
                      className="bg-yellow-500 hover:bg-yellow-600 text-white font-bold py-2 px-4 rounded-lg shadow-md transition-colors duration-200"
                    >
                      <FileText className="inline-block mr-2" /> Generate Message
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        );
      default:
        return null;
    }
  };

  if (!isAuthReady) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-100">
        <div className="flex items-center space-x-2 text-gray-600">
          <RotateCcw className="animate-spin text-blue-500" size={24} />
          <span>Initializing Firebase...</span>
        </div>
      </div>
    );
  }

  if (!user || user.isAnonymous) {
      return (
        <LoginPage
            onLogin={handleLogin}
            onRegister={handleRegister}
            error={error}
            clearError={() => setError(null)}
        />
      );
  }

  return (
    <div className="min-h-screen h-screen overflow-hidden bg-gray-100 font-sans flex flex-col md:flex-row">
      <aside className="bg-gray-800 text-white w-full md:w-64 p-6 flex flex-col md:h-screen overflow-y-auto">
        <h1 className="text-2xl font-bold mb-8 text-center text-blue-400">Cylinder Tracker</h1>
        <nav className="flex-grow">
          <ul className="space-y-2">
            <li>
              <button
                onClick={() => setView('dashboard')}
                className={`w-full text-left px-4 py-2 rounded-lg flex items-center space-x-3 transition-colors duration-200 ${view === 'dashboard' ? 'bg-blue-600' : 'hover:bg-gray-700'}`}
              >
                <BarChart size={20} />
                <span>Dashboard</span>
              </button>
            </li>
            <li>
              <button
                onClick={() => setView('cylinders')}
                className={`w-full text-left px-4 py-2 rounded-lg flex items-center space-x-3 transition-colors duration-200 ${view === 'cylinders' ? 'bg-blue-600' : 'hover:bg-gray-700'}`}
              >
                <RotateCcw size={20} />
                <span>Cylinders</span>
              </button>
            </li>
            <li>
              <button
                onClick={() => setView('customers')}
                className={`w-full text-left px-4 py-2 rounded-lg flex items-center space-x-3 transition-colors duration-200 ${view === 'customers' ? 'bg-blue-600' : 'hover:bg-gray-700'}`}
              >
                <User size={20} />
                <span>Customers</span>
              </button>
            </li>
             <li>
              <button
                onClick={() => setView('suppliers')}
                className={`w-full text-left px-4 py-2 rounded-lg flex items-center space-x-3 transition-colors duration-200 ${view === 'suppliers' ? 'bg-blue-600' : 'hover:bg-gray-700'}`}
              >
                <Settings size={20} />
                <span>Suppliers</span>
              </button>
            </li>
            <li>
              <button
                onClick={() => setView('reminders')}
                className={`w-full text-left px-4 py-2 rounded-lg flex items-center space-x-3 transition-colors duration-200 ${view === 'reminders' ? 'bg-blue-600' : 'hover:bg-gray-700'}`}
              >
                <AlertCircle size={20} />
                <span>Reminders</span>
              </button>
            </li>
          </ul>
        </nav>
        <div className="mt-8 pt-4 border-t border-gray-700">
          <button
              onClick={handleLogout}
              className="w-full text-left px-4 py-2 rounded-lg flex items-center space-x-3 transition-colors duration-200 hover:bg-gray-700"
            >
              <LogOut size={20} />
              <span>Logout</span>
            </button>
          <p className="text-xs text-gray-400 text-center mt-2">User ID: {userId}</p>
        </div>
      </aside>

      <main className="flex-grow bg-gray-100 p-4 md:p-8 overflow-y-auto">
        {renderView()}
      </main>

      {showModal === 'addCylinder' && (
        <CylinderModal
          customers={customers}
          suppliers={suppliers}
          onClose={() => { setShowModal(null); setEditingCylinder(null); }}
          onAddCylinder={handleAddCylinder}
          onUpdateCylinder={handleUpdateCylinder}
          onOpenAddCustomer={handleOpenAddCustomerFromCylinder}
          editingCylinder={editingCylinder}
          currencySymbol={CURRENCY_SYMBOL}
          isProcessing={isProcessing}
        />
      )}
      {showModal === 'addPayment' && (
        <AddPaymentModal
          selectedCylinder={selectedCylinder}
          onClose={() => setShowModal(null)}
          onAddPayment={handleAddPayment}
          onClearBalance={handleClearBalance}
          cylinders={cylinders}
          currencySymbol={CURRENCY_SYMBOL}
          isProcessing={isProcessing}
        />
      )}
      {showModal === 'quickPayment' && (
        <QuickPaymentModal
          cylinders={cylinders}
          customers={customers}
          getCustomerName={getCustomerName}
          calculateBalance={calculateBalance}
          onClose={() => setShowModal(null)}
          onAddPayment={handleAddPayment}
          currencySymbol={CURRENCY_SYMBOL}
          isProcessing={isProcessing}
        />
      )}
      {showModal === 'addCustomer' && (
        <AddCustomerModal
          onClose={() => setShowModal(null)}
          onAddCustomer={handleAddCustomer}
          isProcessing={isProcessing}
        />
      )}
      {showModal === 'addSupplier' && (
        <AddSupplierModal
          onClose={() => setShowModal(null)}
          onAddSupplier={handleAddSupplier}
          isProcessing={isProcessing}
        />
      )}
      {showModal === 'customerLedger' && (
        <CustomerLedgerModal
          db={db}
          appId={appId}
          userId={userId}
          selectedCustomer={selectedCustomerForLedger}
          cylinders={cylinders}
          onClose={() => setShowModal(null)}
          onAddPayment={(cylinder) => {
            setSelectedCylinder(cylinder);
            setShowModal('addPayment');
          }}
          currencySymbol={CURRENCY_SYMBOL}
          exportToPdf={exportToPdf}
        />
      )}
      {showModal === 'customerCylinderList' && (
        <CustomerCylinderListModal
          selectedCustomer={selectedCustomerForCylinderList}
          cylinders={cylinders}
          onClose={() => setShowModal(null)}
          currencySymbol={CURRENCY_SYMBOL}
          exportToPdf={exportToPdf}
        />
      )}
      {showModal === 'supplierCylinderList' && (
        <SupplierCylinderListModal
          selectedSupplier={selectedSupplierForCylinderList}
          cylinders={cylinders}
          onClose={() => setShowModal(null)}
          currencySymbol={CURRENCY_SYMBOL}
          exportToPdf={exportToPdf}
        />
      )}
      {showModal === 'generateMessage' && (
        <GenerateMessageModal
          reminderMessage={reminderMessage}
          onClose={() => setShowModal(null)}
          onCopy={handleCopyToClipboard}
        />
      )}
      {showModal === 'copySuccess' && (
        <MessageModal
          title="Success"
          message="Message successfully copied to clipboard!"
          onClose={() => setShowModal(null)}
        />
      )}
      {confirmationModal && (
          <ConfirmationModal
              title="Confirm Deletion"
              message={`Are you sure you want to delete ${confirmationModal.name}? This action cannot be undone.`}
              onClose={() => setConfirmationModal(null)}
              onConfirm={() => {
                  if (confirmationModal.type === 'deleteCylinder') {
                      handleDeleteCylinder(confirmationModal.id);
                  } else if (confirmationModal.type === 'deleteCustomer') {
                      handleDeleteCustomer(confirmationModal.id);
                  } else if (confirmationModal.type === 'deleteSupplier') {
                      handleDeleteSupplier(confirmationModal.id);
                  }
              }}
          />
      )}
      {error && (
        <ErrorModal
          message={error}
          onClose={() => setError(null)}
        />
      )}
    </div>
  );
};

const LoginPage = ({ onLogin, onRegister, error, clearError }) => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [isRegistering, setIsRegistering] = useState(false);

    useEffect(() => {
        if (error) {
            const timer = setTimeout(() => {
                clearError();
            }, 5000);
            return () => clearTimeout(timer);
        }
    }, [error, clearError]);

    const handleSubmit = (e) => {
        e.preventDefault();
        if (isRegistering) {
            onRegister(email, password);
        } else {
            onLogin(email, password);
        }
    };

    return (
        <div className="flex items-center justify-center min-h-screen bg-gray-100 p-4">
            <div className="w-full max-w-md p-8 space-y-6 bg-white rounded-xl shadow-lg">
                <h1 className="text-3xl font-bold text-center text-blue-600">Cylinder Tracker</h1>
                <p className="text-center text-gray-600">{isRegistering ? "Create a new account" : "Login to your account"}</p>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="relative">
                        <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                        <input
                            type="email"
                            placeholder="Email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                            required
                        />
                    </div>
                    <div className="relative">
                        <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                        <input
                            type="password"
                            placeholder="Password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                            required
                        />
                    </div>
                    {error && <p className="text-red-500 text-sm text-center">{error}</p>}
                    <button
                        type="submit"
                        className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-lg transition-colors duration-200"
                    >
                        {isRegistering ? "Register" : "Login"}
                    </button>
                </form>
                <div className="flex items-center justify-center">
                    <button
                        onClick={() => { setIsRegistering(!isRegistering); clearError(); }}
                        className="text-blue-600 hover:underline text-sm"
                    >
                        {isRegistering ? "Already have an account? Login" : "Don't have an account? Register"}
                    </button>
                </div>
            </div>
        </div>
    );
};

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
        <div className="overflow-y-auto max-h-96 pr-4"> {/* Added overflow and max-height */}
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
              <span className="font-medium text-gray-800">{customerNameForQuickPayment}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Amount Due:</span>
              <span className="font-bold text-red-500">{currencySymbol}{balanceForQuickPayment}</span>
            </div>
          </div>
        )}
        <div>
          <label htmlFor="quickPaymentAmount" className="block text-sm font-medium text-gray-700">Payment Amount ({currencySymbol})</label>
          <input
            id="quickPaymentAmount"
            type="number"
            placeholder="Enter payment amount"
            value={quickPayment.amount}
            onChange={(e) => setQuickPayment({ ...quickPayment, amount: e.target.value })}
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
            value={quickPayment.date}
            onChange={(e) => setQuickPayment({ ...quickPayment, date: e.target.value })}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
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
                <span className="text-xl font-bold text-gray-800">{currencySymbol}{summary.totalCylinderValue}</span>
            </div>
            <div className="bg-white p-4 rounded-lg shadow-md flex flex-col items-center">
                <span className="text-sm font-semibold text-gray-500">Amount Paid</span>
                <span className="text-xl font-bold text-green-600">{currencySymbol}{summary.totalAmountPaid}</span>
            </div>
            <div className="bg-white p-4 rounded-lg shadow-md flex flex-col items-center">
                <span className="text-sm font-semibold text-gray-500">Outstanding</span>
                <span className="text-xl font-bold text-red-600">{currencySymbol}{summary.totalOutstanding}</span>
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
                          {transaction.type === 'Payment' ? `+ ${currencySymbol}${parseFloat(transaction.amount).toFixed(2)}` : `- ${currencySymbol}${parseFloat(transaction.amount).toFixed(2)}`}
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
