const sqliteRepository = require('./sqlite.repository');
const firebaseRepository = require('./firebase.repository');

let authService = null;

function setAuthService(service) {
    authService = service;
}

function getBaseRepository() {
    if (!authService) {
        return sqliteRepository;
    }
    const user = authService.getCurrentUser();
    if (user && user.isLoggedIn) {
        return firebaseRepository;
    }
    return sqliteRepository;
}

// Adapter functions that handle UID injection where needed
const playbookRepositoryAdapter = {
    setAuthService,
    
    // Playbooks
    getById: (id) => getBaseRepository().getById(id),
    
    getAll: () => getBaseRepository().getAll(),
    
    getByCategory: (category) => getBaseRepository().getByCategory(category),
    
    getTemplates: () => getBaseRepository().getTemplates(),
    
    create: (playbook) => {
        const uid = authService ? authService.getCurrentUserId() : null;
        return getBaseRepository().create(playbook);
    },
    
    update: (playbookId, updates) => getBaseRepository().update(playbookId, updates),
    
    deletePlaybook: (id) => getBaseRepository().deletePlaybook(id),
    
    // Prompts - these don't need UID injection as playbook_id is the key
    getPromptsByPlaybookId: (playbookId) => getBaseRepository().getPromptsByPlaybookId(playbookId),
    
    addPrompt: (prompt) => getBaseRepository().addPrompt(prompt),
    
    updatePrompt: (promptId, playbookId, updates) => getBaseRepository().updatePrompt(promptId, playbookId, updates),
    
    deletePrompt: (promptId, playbookId) => getBaseRepository().deletePrompt(promptId, playbookId),
    
    // User Playbooks
    getUserPlaybooks: () => {
        const uid = authService.getCurrentUserId();
        return getBaseRepository().getUserPlaybooks(uid);
    },
    
    addUserPlaybook: (playbookId) => {
        const uid = authService.getCurrentUserId();
        return getBaseRepository().addUserPlaybook(uid, playbookId);
    },
    
    updateUserPlaybook: (playbookId, updates) => {
        const uid = authService.getCurrentUserId();
        return getBaseRepository().updateUserPlaybook(uid, playbookId, updates);
    },
    
    removeUserPlaybook: (playbookId) => {
        const uid = authService.getCurrentUserId();
        return getBaseRepository().removeUserPlaybook(uid, playbookId);
    },
    
    incrementUsage: (playbookId) => {
        const uid = authService.getCurrentUserId();
        return getBaseRepository().incrementUsage(uid, playbookId);
    },
    
    // Documents
    getDocumentsByPlaybookId: (playbookId) => getBaseRepository().getDocumentsByPlaybookId(playbookId),
    
    addDocument: (document) => getBaseRepository().addDocument(document),
    
    deleteDocument: (documentId, playbookId) => getBaseRepository().deleteDocument(documentId, playbookId),
};

module.exports = playbookRepositoryAdapter;

