import { db } from '../firebase';
import { doc, setDoc, getDoc, updateDoc, collection, query, where, limit, getDocs } from 'firebase/firestore';

export const createUserProfile = async (userId, data) => {
    try {
        await setDoc(doc(db, 'users', userId), {
            ...data,
            createdAt: new Date().toISOString(),
            partnerUid: data.partnerUid || null,
            targetWeight: data.targetWeight || null
        });
    } catch (error) {
        console.error("Error creating user profile:", error);
        throw error;
    }
};

export const updateUserProfile = async (userId, data) => {
    try {
        const docRef = doc(db, 'users', userId);
        await updateDoc(docRef, data);
    } catch (error) {
        console.error("Error updating user profile:", error);
        throw error;
    }
};

export const getUserProfile = async (userId) => {
    try {
        const docRef = doc(db, 'users', userId);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
            return docSnap.data();
        } else {
            return null;
        }
    } catch (error) {
        console.error("Error getting user profile:", error);
        throw error;
    }
};

// Find partner by their "partnerCode"
export const getPartnerByCode = async (partnerCode) => {
    try {
        const q = query(collection(db, 'users'), where("partnerCode", "==", partnerCode), limit(1));
        const querySnapshot = await getDocs(q);
        if (!querySnapshot.empty) {
            return { id: querySnapshot.docs[0].id, ...querySnapshot.docs[0].data() };
        }
        return null;
    } catch (error) {
        console.error("Error finding partner:", error);
        return null;
    }
};

// Simple ID generator for couple matching
export const generatePartnerCode = () => {
    return Math.random().toString(36).substring(2, 8).toUpperCase();
};
