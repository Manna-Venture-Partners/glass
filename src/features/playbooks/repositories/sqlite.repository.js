const sqliteClient = require('../../common/services/sqliteClient');

// Playbooks CRUD
function getById(id) {
    const db = sqliteClient.getDb();
    return db.prepare('SELECT * FROM playbooks WHERE id = ?').get(id);
}

function getAll() {
    const db = sqliteClient.getDb();
    return db.prepare('SELECT * FROM playbooks ORDER BY created_at DESC').all();
}

function getByCategory(category) {
    const db = sqliteClient.getDb();
    return db.prepare('SELECT * FROM playbooks WHERE category = ? ORDER BY created_at DESC').all(category);
}

function getTemplates() {
    const db = sqliteClient.getDb();
    return db.prepare('SELECT * FROM playbooks WHERE is_template = 1 ORDER BY category, created_at').all();
}

function create(playbook) {
    const db = sqliteClient.getDb();
    const playbookId = require('crypto').randomUUID();
    const now = Math.floor(Date.now() / 1000);
    
    const query = `INSERT INTO playbooks (
        id, name, description, category, icon, is_premium, 
        is_template, created_by, created_at, updated_at, sync_state
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`;
    
    db.prepare(query).run(
        playbookId,
        playbook.name,
        playbook.description || null,
        playbook.category || null,
        playbook.icon || null,
        playbook.is_premium ? 1 : 0,
        playbook.is_template !== undefined ? (playbook.is_template ? 1 : 0) : 1,
        playbook.created_by || null,
        now,
        now,
        'clean'
    );
    
    return playbookId;
}

function update(playbookId, updates) {
    const db = sqliteClient.getDb();
    const now = Math.floor(Date.now() / 1000);
    
    const fields = [];
    const values = [];
    
    if (updates.name !== undefined) {
        fields.push('name = ?');
        values.push(updates.name);
    }
    if (updates.description !== undefined) {
        fields.push('description = ?');
        values.push(updates.description);
    }
    if (updates.category !== undefined) {
        fields.push('category = ?');
        values.push(updates.category);
    }
    if (updates.icon !== undefined) {
        fields.push('icon = ?');
        values.push(updates.icon);
    }
    if (updates.is_premium !== undefined) {
        fields.push('is_premium = ?');
        values.push(updates.is_premium ? 1 : 0);
    }
    
    fields.push('updated_at = ?');
    values.push(now);
    values.push(playbookId);
    
    const query = `UPDATE playbooks SET ${fields.join(', ')} WHERE id = ?`;
    db.prepare(query).run(...values);
    
    return { success: true };
}

function deletePlaybook(id) {
    const db = sqliteClient.getDb();
    const transaction = db.transaction(() => {
        db.prepare("DELETE FROM playbook_prompts WHERE playbook_id = ?").run(id);
        db.prepare("DELETE FROM playbook_documents WHERE playbook_id = ?").run(id);
        db.prepare("DELETE FROM user_playbooks WHERE playbook_id = ?").run(id);
        db.prepare("DELETE FROM playbooks WHERE id = ?").run(id);
    });
    
    try {
        transaction();
        return { success: true };
    } catch (err) {
        console.error('[Playbook] Failed to delete playbook:', err);
        throw err;
    }
}

// Playbook Prompts CRUD
function getPromptsByPlaybookId(playbookId) {
    const db = sqliteClient.getDb();
    return db.prepare(
        'SELECT * FROM playbook_prompts WHERE playbook_id = ? ORDER BY order_index ASC, priority DESC'
    ).all(playbookId);
}

function addPrompt(prompt) {
    const db = sqliteClient.getDb();
    const promptId = require('crypto').randomUUID();
    
    const query = `INSERT INTO playbook_prompts (
        id, playbook_id, trigger_type, trigger_value, 
        prompt_text, priority, order_index, sync_state
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`;
    
    db.prepare(query).run(
        promptId,
        prompt.playbook_id,
        prompt.trigger_type || null,
        prompt.trigger_value || null,
        prompt.prompt_text,
        prompt.priority || 0,
        prompt.order_index || 0,
        'clean'
    );
    
    return promptId;
}

function updatePrompt(promptId, updates) {
    const db = sqliteClient.getDb();
    
    const fields = [];
    const values = [];
    
    if (updates.trigger_type !== undefined) {
        fields.push('trigger_type = ?');
        values.push(updates.trigger_type);
    }
    if (updates.trigger_value !== undefined) {
        fields.push('trigger_value = ?');
        values.push(updates.trigger_value);
    }
    if (updates.prompt_text !== undefined) {
        fields.push('prompt_text = ?');
        values.push(updates.prompt_text);
    }
    if (updates.priority !== undefined) {
        fields.push('priority = ?');
        values.push(updates.priority);
    }
    if (updates.order_index !== undefined) {
        fields.push('order_index = ?');
        values.push(updates.order_index);
    }
    
    values.push(promptId);
    
    const query = `UPDATE playbook_prompts SET ${fields.join(', ')} WHERE id = ?`;
    db.prepare(query).run(...values);
    
    return { success: true };
}

function deletePrompt(promptId) {
    const db = sqliteClient.getDb();
    db.prepare('DELETE FROM playbook_prompts WHERE id = ?').run(promptId);
    return { success: true };
}

// User Playbooks CRUD
function getUserPlaybooks(userId) {
    const db = sqliteClient.getDb();
    const query = `
        SELECT 
            up.*,
            p.*
        FROM user_playbooks up
        INNER JOIN playbooks p ON up.playbook_id = p.id
        WHERE up.user_id = ?
        ORDER BY up.is_favorite DESC, up.usage_count DESC, up.last_used DESC
    `;
    
    return db.prepare(query).all(userId);
}

function addUserPlaybook(userId, playbookId) {
    const db = sqliteClient.getDb();
    const userPlaybookId = require('crypto').randomUUID();
    const now = Math.floor(Date.now() / 1000);
    
    // Check if already exists
    const existing = db.prepare(
        'SELECT * FROM user_playbooks WHERE user_id = ? AND playbook_id = ?'
    ).get(userId, playbookId);
    
    if (existing) {
        return existing.id;
    }
    
    const query = `INSERT INTO user_playbooks (
        id, user_id, playbook_id, is_favorite, 
        last_used, usage_count, sync_state
    ) VALUES (?, ?, ?, ?, ?, ?, ?)`;
    
    db.prepare(query).run(
        userPlaybookId,
        userId,
        playbookId,
        0,
        now,
        0,
        'clean'
    );
    
    return userPlaybookId;
}

function updateUserPlaybook(userId, playbookId, updates) {
    const db = sqliteClient.getDb();
    
    const fields = [];
    const values = [];
    
    if (updates.is_favorite !== undefined) {
        fields.push('is_favorite = ?');
        values.push(updates.is_favorite ? 1 : 0);
    }
    if (updates.customizations !== undefined) {
        fields.push('customizations = ?');
        values.push(JSON.stringify(updates.customizations));
    }
    
    values.push(userId, playbookId);
    
    const query = `UPDATE user_playbooks SET ${fields.join(', ')} WHERE user_id = ? AND playbook_id = ?`;
    db.prepare(query).run(...values);
    
    return { success: true };
}

function removeUserPlaybook(userId, playbookId) {
    const db = sqliteClient.getDb();
    db.prepare('DELETE FROM user_playbooks WHERE user_id = ? AND playbook_id = ?')
        .run(userId, playbookId);
    return { success: true };
}

function incrementUsage(userId, playbookId) {
    const db = sqliteClient.getDb();
    const now = Math.floor(Date.now() / 1000);
    
    db.prepare(`
        UPDATE user_playbooks 
        SET usage_count = usage_count + 1, last_used = ?
        WHERE user_id = ? AND playbook_id = ?
    `).run(now, userId, playbookId);
    
    return { success: true };
}

// Documents CRUD
function getDocumentsByPlaybookId(playbookId) {
    const db = sqliteClient.getDb();
    return db.prepare(
        'SELECT * FROM playbook_documents WHERE playbook_id = ? ORDER BY uploaded_at DESC'
    ).all(playbookId);
}

function addDocument(document) {
    const db = sqliteClient.getDb();
    const documentId = require('crypto').randomUUID();
    const now = Math.floor(Date.now() / 1000);
    
    const query = `INSERT INTO playbook_documents (
        id, playbook_id, file_name, file_url, file_type, 
        processed_text, uploaded_at, sync_state
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`;
    
    db.prepare(query).run(
        documentId,
        document.playbook_id,
        document.file_name,
        document.file_url,
        document.file_type || null,
        document.processed_text || null,
        now,
        'clean'
    );
    
    return documentId;
}

function deleteDocument(documentId) {
    const db = sqliteClient.getDb();
    db.prepare('DELETE FROM playbook_documents WHERE id = ?').run(documentId);
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

