const playbookRepository = require('./repositories');
const authService = require('../common/services/authService');

class PlaybookService {
    constructor() {
        // Set auth service for the repository adapter
        playbookRepository.setAuthService(authService);
        console.log('[PlaybookService] Service instance created.');
    }

    initialize() {
        this.setupIpcHandlers();
        console.log('[PlaybookService] Initialized.');
    }

    // Get all playbooks
    async getAllPlaybooks() {
        return await playbookRepository.getAll();
    }

    // Get templates (system playbooks)
    async getTemplates() {
        return await playbookRepository.getTemplates();
    }

    // Get playbooks by category
    async getByCategory(category) {
        return await playbookRepository.getByCategory(category);
    }

    // Get a specific playbook with all its prompts
    async getPlaybookWithPrompts(playbookId) {
        const playbook = await playbookRepository.getById(playbookId);
        if (!playbook) {
            return null;
        }
        
        const prompts = await playbookRepository.getPromptsByPlaybookId(playbookId);
        const documents = await playbookRepository.getDocumentsByPlaybookId(playbookId);
        
        return {
            ...playbook,
            prompts,
            documents
        };
    }

    // Create a new playbook (for user-created playbooks)
    async createPlaybook(playbookData) {
        const playbookId = await playbookRepository.create({
            ...playbookData,
            is_template: false,
            created_by: authService.getCurrentUserId()
        });
        
        // If prompts are provided, add them
        if (playbookData.prompts && playbookData.prompts.length > 0) {
            for (const prompt of playbookData.prompts) {
                await playbookRepository.addPrompt({
                    ...prompt,
                    playbook_id: playbookId
                });
            }
        }
        
        return playbookId;
    }

    // Update an existing playbook
    async updatePlaybook(playbookId, updates) {
        return await playbookRepository.update(playbookId, updates);
    }

    // Delete a playbook
    async deletePlaybook(playbookId) {
        return await playbookRepository.deletePlaybook(playbookId);
    }

    // Add a prompt to a playbook
    async addPrompt(playbookId, promptData) {
        return await playbookRepository.addPrompt({
            ...promptData,
            playbook_id: playbookId
        });
    }

    // Update a prompt
    async updatePrompt(playbookId, promptId, updates) {
        return await playbookRepository.updatePrompt(promptId, playbookId, updates);
    }

    // Delete a prompt
    async deletePrompt(playbookId, promptId) {
        return await playbookRepository.deletePrompt(promptId, playbookId);
    }

    // Get user's playbooks
    async getUserPlaybooks() {
        return await playbookRepository.getUserPlaybooks();
    }

    // Add a playbook to user's collection
    async addToUserCollection(playbookId) {
        await playbookRepository.incrementUsage(playbookId);
        return await playbookRepository.addUserPlaybook(playbookId);
    }

    // Remove a playbook from user's collection
    async removeFromUserCollection(playbookId) {
        return await playbookRepository.removeUserPlaybook(playbookId);
    }

    // Mark as favorite
    async toggleFavorite(playbookId) {
        const userPlaybooks = await this.getUserPlaybooks();
        const userPlaybook = userPlaybooks.find(up => up.playbook_id === playbookId);
        
        if (userPlaybook) {
            return await playbookRepository.updateUserPlaybook(playbookId, {
                is_favorite: !userPlaybook.is_favorite
            });
        } else {
            // Add to collection if not already there
            await this.addToUserCollection(playbookId);
            return await playbookRepository.updateUserPlaybook(playbookId, {
                is_favorite: true
            });
        }
    }

    // Find matching playbook prompt based on trigger
    async findMatchingPrompt(playbookId, triggerData) {
        const prompts = await playbookRepository.getPromptsByPlaybookId(playbookId);
        
        // Find prompts that match the trigger
        const matches = prompts.filter(prompt => {
            if (!prompt.trigger_type || !prompt.trigger_value) return false;
            
            const { trigger_type, trigger_value } = triggerData;
            
            switch (prompt.trigger_type) {
                case 'keyword':
                    return trigger_value.toLowerCase().includes(prompt.trigger_value.toLowerCase());
                case 'context':
                    // TODO: Implement context matching with semantic analysis
                    return false;
                case 'timer':
                    return prompt.trigger_type === trigger_type;
                default:
                    return false;
            }
        });
        
        // Return the highest priority match
        if (matches.length > 0) {
            return matches.sort((a, b) => (b.priority || 0) - (a.priority || 0))[0];
        }
        
        return null;
    }

    // Get suggested playbook based on conversation context
    async getSuggestedPlaybook(conversationText) {
        // Analyze conversation text for keywords/categories
        const keywords = conversationText.toLowerCase();
        
        if (keywords.includes('sale') || keywords.includes('demo') || keywords.includes('feature')) {
            return await this.getByCategory('sales');
        } else if (keywords.includes('interview') || keywords.includes('coding') || keywords.includes('algorithm')) {
            return await this.getByCategory('interview');
        } else if (keywords.includes('meeting') || keywords.includes('action item')) {
            return await this.getByCategory('meeting');
        } else if (keywords.includes('support') || keywords.includes('troubleshoot') || keywords.includes('issue')) {
            return await this.getByCategory('support');
        }
        
        return await this.getByCategory('generic');
    }

    setupIpcHandlers() {
        const { ipcMain } = require('electron');
        
        // Template playbooks
        ipcMain.handle('playbook:getTemplates', async () => {
            try {
                return await this.getTemplates();
            } catch (error) {
                console.error('[PlaybookService] Error getting templates:', error);
                return [];
            }
        });
        
        // User playbooks
        ipcMain.handle('playbook:getUserPlaybooks', async () => {
            try {
                return await this.getUserPlaybooks();
            } catch (error) {
                console.error('[PlaybookService] Error getting user playbooks:', error);
                return [];
            }
        });
        
        // Get playbook with prompts
        ipcMain.handle('playbook:getWithPrompts', async (event, playbookId) => {
            try {
                return await this.getPlaybookWithPrompts(playbookId);
            } catch (error) {
                console.error('[PlaybookService] Error getting playbook with prompts:', error);
                return null;
            }
        });
        
        // Add to user collection
        ipcMain.handle('playbook:addToCollection', async (event, playbookId) => {
            try {
                return await this.addToUserCollection(playbookId);
            } catch (error) {
                console.error('[PlaybookService] Error adding playbook to collection:', error);
                return { success: false, error: error.message };
            }
        });
        
        // Toggle favorite
        ipcMain.handle('playbook:toggleFavorite', async (event, playbookId) => {
            try {
                return await this.toggleFavorite(playbookId);
            } catch (error) {
                console.error('[PlaybookService] Error toggling favorite:', error);
                return { success: false, error: error.message };
            }
        });
        
        // Get suggested playbook
        ipcMain.handle('playbook:getSuggested', async (event, conversationText) => {
            try {
                return await this.getSuggestedPlaybook(conversationText);
            } catch (error) {
                console.error('[PlaybookService] Error getting suggested playbook:', error);
                return [];
            }
        });
        
        console.log('[PlaybookService] IPC handlers registered.');
    }
}

const playbookService = new PlaybookService();

module.exports = playbookService;

