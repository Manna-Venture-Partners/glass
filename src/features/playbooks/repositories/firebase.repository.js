const { 
    doc, getDoc, collection, addDoc, query, where, getDocs, 
    writeBatch, orderBy, updateDoc, deleteDoc, Timestamp 
} = require('firebase/firestore');
const { getFirestoreInstance } = require('../../common/services/firebaseClient');
const { createEncryptedConverter } = require('../../common/repositories/firestoreConverter');
const encryptionService = require('../../common/services/encryptionService');

// Encrypt description and processed_text fields
const playbookConverter = createEncryptedConverter(['description']);
const documentConverter = createEncryptedConverter(['processed_text']);
const promptConverter = createEncryptedConverter(['prompt_text']);

function playbooksCol() {
    const db = getFirestoreInstance();
    return collection(db, 'playbooks').withConverter(playbookConverter);
}

function promptsCol(playbookId) {
    const db = getFirestoreInstance();
    return collection(db, `playbooks/${playbookId}/prompts`).withConverter(promptConverter);
}

function documentsCol(playbookId) {
    const db = getFirestoreInstance();
    return collection(db, `playbooks/${playbookId}/documents`).withConverter(documentConverter);
}

function userPlaybooksCol() {
    const db = getFirestoreInstance();
    return collection(db, 'user_playbooks');
}

// Playbooks CRUD
async function getById(id) {
    const docRef = doc(playbooksCol(), id);
    const docSnap = await getDoc(docRef);
    return docSnap.exists() ? docSnap.data() : null;
}

async function getAll() {
    const q = query(playbooksCol(), orderBy('created_at', 'desc'));
    const snapshot = await getDocs(q);
    return snapshot.docs.map(d => d.data());
}

async function getByCategory(category) {
    const q = query(
        playbooksCol(), 
        where('category', '==', category), 
        orderBy('created_at', 'desc')
    );
    const snapshot = await getDocs(q);
    return snapshot.docs.map(d => d.data());
}

async function getTemplates() {
    const q = query(
        playbooksCol(), 
        where('is_template', '==', true),
        orderBy('category', 'asc'),
        orderBy('created_at', 'desc')
    );
    const snapshot = await getDocs(q);
    return snapshot.docs.map(d => d.data());
}

async function create(playbook) {
    const now = Timestamp.now();
    const newPlaybook = {
        name: playbook.name,
        description: playbook.description || null,
        category: playbook.category || null,
        icon: playbook.icon || null,
        is_premium: playbook.is_premium || false,
        is_template: playbook.is_template !== undefined ? playbook.is_template : true,
        created_by: playbook.created_by || null,
        created_at: now,
        updated_at: now,
    };
    
    const docRef = await addDoc(playbooksCol(), newPlaybook);
    console.log(`[Firebase] Created playbook ${docRef.id}`);
    return docRef.id;
}

async function update(playbookId, updates) {
    const docRef = doc(playbooksCol(), playbookId);
    const updateData = {
        ...updates,
        updated_at: Timestamp.now()
    };
    // Remove id from update data if present
    delete updateData.id;
    await updateDoc(docRef, updateData);
    return { success: true };
}

async function deletePlaybook(id) {
    const db = getFirestoreInstance();
    const batch = writeBatch(db);
    
    // Delete prompts subcollection
    const prompts = promptsCol(id);
    const promptsSnap = await getDocs(prompts);
    promptsSnap.forEach(d => batch.delete(d.ref));
    
    // Delete documents subcollection
    const documents = documentsCol(id);
    const documentsSnap = await getDocs(documents);
    documentsSnap.forEach(d => batch.delete(d.ref));
    
    // Delete user_playbooks references
    const userPlaybooksQuery = query(userPlaybooksCol(), where('playbook_id', '==', id));
    const userPlaybooksSnap = await getDocs(userPlaybooksQuery);
    userPlaybooksSnap.forEach(d => batch.delete(d.ref));
    
    // Delete the playbook itself
    const playbookRef = doc(playbooksCol(), id);
    batch.delete(playbookRef);
    
    await batch.commit();
    return { success: true };
}

// Prompts CRUD
async function getPromptsByPlaybookId(playbookId) {
    const q = query(
        promptsCol(playbookId),
        orderBy('order_index', 'asc'),
        orderBy('priority', 'desc')
    );
    const snapshot = await getDocs(q);
    return snapshot.docs.map(d => ({ id: d.id, ...d.data() }));
}

async function addPrompt(prompt) {
    const newPrompt = {
        trigger_type: prompt.trigger_type || null,
        trigger_value: prompt.trigger_value || null,
        prompt_text: prompt.prompt_text,
        priority: prompt.priority || 0,
        order_index: prompt.order_index || 0,
    };
    
    const docRef = await addDoc(promptsCol(prompt.playbook_id), newPrompt);
    return docRef.id;
}

async function updatePrompt(promptId, playbookId, updates) {
    const docRef = doc(promptsCol(playbookId), promptId);
    await updateDoc(docRef, updates);
    return { success: true };
}

async function deletePrompt(promptId, playbookId) {
    const docRef = doc(promptsCol(playbookId), promptId);
    await deleteDoc(docRef);
    return { success: true };
}

// User Playbooks CRUD
async function getUserPlaybooks(userId) {
    const q = query(
        userPlaybooksCol(),
        where('user_id', '==', userId),
        orderBy('is_favorite', 'desc'),
        orderBy('usage_count', 'desc')
    );
    const snapshot = await getDocs(q);
    
    // Fetch associated playbook data
    const playbooks = await Promise.all(
        snapshot.docs.map(async (doc) => {
            const userPlaybook = doc.data();
            const playbook = await getById(userPlaybook.playbook_id);
            return { ...userPlaybook, playbook };
        })
    );
    
    return playbooks;
}

async function addUserPlaybook(userId, playbookId) {
    // Check if already exists
    const q = query(
        userPlaybooksCol(),
        where('user_id', '==', userId),
        where('playbook_id', '==', playbookId)
    );
    const existingSnap = await getDocs(q);
    
    if (!existingSnap.empty) {
        return existingSnap.docs[0].data().id;
    }
    
    const newUserPlaybook = {
        user_id: userId,
        playbook_id: playbookId,
        is_favorite: false,
        customizations: null,
        last_used: Timestamp.now(),
        usage_count: 0,
    };
    
    const docRef = await addDoc(userPlaybooksCol(), newUserPlaybook);
    return docRef.id;
}

async function updateUserPlaybook(userId, playbookId, updates) {
    const q = query(
        userPlaybooksCol(),
        where('user_id', '==', userId),
        where('playbook_id', '==', playbookId)
    );
    const snapshot = await getDocs(q);
    
    if (snapshot.empty) {
        throw new Error('User playbook not found');
    }
    
    const docRef = snapshot.docs[0].ref;
    await updateDoc(docRef, updates);
    return { success: true };
}

async function removeUserPlaybook(userId, playbookId) {
    const q = query(
        userPlaybooksCol(),
        where('user_id', '==', userId),
        where('playbook_id', '==', playbookId)
    );
    const snapshot = await getDocs(q);
    
    if (!snapshot.empty) {
        await deleteDoc(snapshot.docs[0].ref);
    }
    
    return { success: true };
}

async function incrementUsage(userId, playbookId) {
    const q = query(
        userPlaybooksCol(),
        where('user_id', '==', userId),
        where('playbook_id', '==', playbookId)
    );
    const snapshot = await getDocs(q);
    
    if (!snapshot.empty) {
        const docRef = snapshot.docs[0].ref;
        const currentData = snapshot.docs[0].data();
        await updateDoc(docRef, {
            usage_count: currentData.usage_count + 1,
            last_used: Timestamp.now()
        });
    }
    
    return { success: true };
}

// Documents CRUD
async function getDocumentsByPlaybookId(playbookId) {
    const q = query(
        documentsCol(playbookId),
        orderBy('uploaded_at', 'desc')
    );
    const snapshot = await getDocs(q);
    return snapshot.docs.map(d => ({ id: d.id, ...d.data() }));
}

async function addDocument(document) {
    const newDocument = {
        file_name: document.file_name,
        file_url: document.file_url,
        file_type: document.file_type || null,
        processed_text: document.processed_text || null,
        uploaded_at: Timestamp.now(),
    };
    
    const docRef = await addDoc(documentsCol(document.playbook_id), newDocument);
    return docRef.id;
}

async function deleteDocument(documentId, playbookId) {
    const docRef = doc(documentsCol(playbookId), documentId);
    await deleteDoc(docRef);
    return { success: true };
}

module.exports = {
    // Playbooks
    getById,
    getAll,
    getByCategory,
    getTemplates,
    create,
    update,
    deletePlaybook,
    
    // Prompts
    getPromptsByPlaybookId,
    addPrompt,
    updatePrompt,
    deletePrompt,
    
    // User Playbooks
    getUserPlaybooks,
    addUserPlaybook,
    updateUserPlaybook,
    removeUserPlaybook,
    incrementUsage,
    
    // Documents
    getDocumentsByPlaybookId,
    addDocument,
    deleteDocument,
};

