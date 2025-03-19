const express = require('express');
const cors = require('cors');
const { db } = require('./db');
const { collection, getDocs, addDoc, updateDoc, deleteDoc, doc } = require('firebase/firestore');

const app = express();
const port = 3000;

app.use(cors());
app.use(express.json());

// GET - ดึงข้อมูลทั้งหมด
app.get('/api/documents', async (req, res) => {
    try {
        const documentsRef = collection(db, 'documents');
        const querySnapshot = await getDocs(documentsRef);
        const documents = [];
        querySnapshot.forEach((doc) => {
            documents.push({ id: doc.id, ...doc.data() });
        });
        res.json(documents);
    } catch (error) {
        console.error('Error:', error);
        res.status(500).json({ error: error.message });
    }
});

// POST - เพิ่มข้อมูลใหม่
app.post('/api/documents', async (req, res) => {
    try {
        const docRef = await addDoc(collection(db, 'documents'), req.body);
        res.status(201).json({ id: docRef.id });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// PUT - อัพเดทข้อมูล
app.put('/api/documents/:id', async (req, res) => {
    try {
        const docRef = doc(db, 'documents', req.params.id);
        await updateDoc(docRef, req.body);
        res.json({ message: 'Document updated successfully' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// DELETE - ลบข้อมูล
app.delete('/api/documents/:id', async (req, res) => {
    try {
        await deleteDoc(doc(db, 'documents', req.params.id));
        res.json({ message: 'Document deleted successfully' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});