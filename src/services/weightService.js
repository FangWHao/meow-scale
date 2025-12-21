import { db } from '../firebase';
import { collection, addDoc, query, where, getDocs, limit, updateDoc, doc } from 'firebase/firestore';

export const addWeightRecord = async (userId, record) => {
    try {
        const todayStr = new Date().toLocaleDateString();

        const q = query(
            collection(db, 'weights'),
            where("userId", "==", userId)
        );

        const querySnapshot = await getDocs(q);
        const todayDoc = querySnapshot.docs.find(doc => {
            const timestamp = doc.data().timestamp;
            return new Date(timestamp).toLocaleDateString() === todayStr;
        });
        const data = {
            userId,
            weight: Number(record.weight),
            bmi: Number(record.bmi),
            timestamp: record.timestamp || new Date().toISOString()
        };

        if (todayDoc) {
            await updateDoc(doc(db, 'weights', todayDoc.id), data);
            return { type: 'update', id: todayDoc.id };
        } else {
            const newDoc = await addDoc(collection(db, 'weights'), data);
            return { type: 'add', id: newDoc.id };
        }
    } catch (error) {
        console.error("Error adding weight:", error);
        throw error;
    }
};

export const getWeightHistory = async (userId) => {
    try {
        const q = query(
            collection(db, 'weights'),
            where("userId", "==", userId),
            limit(100)
        );
        const querySnapshot = await getDocs(q);
        return querySnapshot.docs
            .map(doc => ({ id: doc.id, ...doc.data() }))
            .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
    } catch (error) {
        console.error("Error getting weight history:", error);
        throw error;
    }
};
