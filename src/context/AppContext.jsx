import React, { createContext, useContext, useState, useEffect } from 'react';
import { useTheme } from '../hooks/useTheme';
import { auth, db } from '../services/firebase';
import { onAuthStateChanged } from 'firebase/auth';
import { collection, query, onSnapshot, addDoc, deleteDoc, updateDoc, doc } from 'firebase/firestore';

const AppContext = createContext();

export function AppProvider({ children }) {
    const { theme, toggleTheme } = useTheme();

    // Auth State
    const [user, setUser] = useState(null);
    const [authLoading, setAuthLoading] = useState(true);

    // Data State
    const [responsibles, setResponsibles] = useState([]);
    const [paymentMethods, setPaymentMethods] = useState([]);
    const [transactions, setTransactions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [currentDate, setCurrentDate] = useState(new Date());

    // Global Modal State
    const [isTransactionModalOpen, setIsTransactionModalOpen] = useState(false);
    const [editingTransaction, setEditingTransaction] = useState(null);

    // Context Actions (CRUD)
    const addTransaction = async (data) => {
        if (!user) return;
        try {
            await addDoc(collection(db, `users/${user.uid}/transactions`), data);
        } catch (e) {
            console.error("Error adding transaction: ", e);
        }
    };

    const updateTransaction = async (id, data) => {
        if (!user) return;
        try {
            const docRef = doc(db, `users/${user.uid}/transactions`, id);
            await updateDoc(docRef, data);
        } catch (e) {
            console.error("Error updating transaction: ", e);
        }
    };

    const deleteTransaction = async (id) => {
        if (!user) return;
        try {
            const docRef = doc(db, `users/${user.uid}/transactions`, id);
            await deleteDoc(docRef);
        } catch (e) {
            console.error("Error deleting transaction: ", e);
        }
    };

    const addResponsible = async (data) => {
        if (!user) return;
        try {
            await addDoc(collection(db, `users/${user.uid}/responsibles`), data);
        } catch (e) {
            console.error("Error adding responsible: ", e);
        }
    };

    const deleteResponsible = async (id) => {
        if (!user) return;
        try {
            const docRef = doc(db, `users/${user.uid}/responsibles`, id);
            await deleteDoc(docRef);
        } catch (e) {
            console.error("Error deleting responsible: ", e);
        }
    };

    const addPaymentMethod = async (data) => {
        if (!user) return;
        try {
            await addDoc(collection(db, `users/${user.uid}/payment_methods`), data);
        } catch (e) {
            console.error("Error adding payment method: ", e);
        }
    };

    const deletePaymentMethod = async (id) => {
        if (!user) return;
        try {
            const docRef = doc(db, `users/${user.uid}/payment_methods`, id);
            await deleteDoc(docRef);
        } catch (e) {
            console.error("Error deleting payment method: ", e);
        }
    };

    const openTransactionModal = (transaction = null) => {
        setEditingTransaction(transaction);
        setIsTransactionModalOpen(true);
    };

    const closeTransactionModal = () => {
        setEditingTransaction(null);
        setIsTransactionModalOpen(false);
    };

    // Auth Listener
    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
            setUser(currentUser);
            setAuthLoading(false);
        });
        return () => unsubscribe();
    }, []);

    // Data Listener (Firestore)
    useEffect(() => {
        if (!user) {
            setTransactions([]);
            setResponsibles([]);
            setPaymentMethods([]);
            setLoading(false);
            return;
        }

        setLoading(true);

        const qTrans = query(collection(db, `users/${user.uid}/transactions`)); // Can add orderBy('date', 'desc') but string dates might be tricky. Let's sort client side or ensure ISO.
        const qResp = query(collection(db, `users/${user.uid}/responsibles`));
        const qPay = query(collection(db, `users/${user.uid}/payment_methods`));

        const unsubTrans = onSnapshot(qTrans, (snapshot) => {
            if (snapshot.metadata.hasPendingWrites) {
                // Local write detected - we can update if we want optimistic UI
                // But Firestore default behavior handles this.
            }
            const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
            // Client-side sort by date desc
            data.sort((a, b) => new Date(b.date) - new Date(a.date));
            setTransactions(data);
        }, (error) => {
            console.error("Firestore Error (Transactions):", error);
            // Verify permissions or quota
        });

        const unsubResp = onSnapshot(qResp, (snapshot) => {
            const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
            setResponsibles(data);
        });

        const unsubPay = onSnapshot(qPay, (snapshot) => {
            const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
            setPaymentMethods(data);
        });

        setLoading(false);

        return () => {
            unsubTrans();
            unsubResp();
            unsubPay();
        };
    }, [user]);

    const value = {
        user,
        authLoading,
        theme,
        toggleTheme,
        responsibles,
        addResponsible,
        deleteResponsible,
        paymentMethods,
        addPaymentMethod,
        deletePaymentMethod,
        transactions,
        addTransaction,
        updateTransaction,
        deleteTransaction,
        loading,
        isTransactionModalOpen,
        openTransactionModal,
        closeTransactionModal,
        editingTransaction,
        currentDate,
        setCurrentDate
    };

    return (
        <AppContext.Provider value={value}>
            {children}
        </AppContext.Provider>
    );
}

export function useApp() {
    return useContext(AppContext);
}
