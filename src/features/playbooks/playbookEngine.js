const playbookRepository = require('./repositories');
const authService = require('../common/services/authService');
const { createLLM } = require('../common/ai/factory');
const modelStateService = require('../common/services/modelStateService');

class PlaybookEngine {
    constructor() {
        this.activePlaybook = null;
        this.activePlaybookId = null;
        this.context = []; // Rolling context window
        this.llm = null;
        this.lastTriggerTime = 0;
        this.triggerCooldown = 5000; // 5 seconds between triggers
    }

    async initialize() {
        try {
            const modelInfo = await modelStateService.getCurrentModelInfo('llm');
            if (modelInfo && modelInfo.apiKey) {
                this.llm = createLLM(modelInfo.provider, {
                    apiKey: modelInfo.apiKey,
                    model: modelInfo.model,
                });
            }
            console.log('[PlaybookEngine] Initialized with LLM provider');
        } catch (error) {
            console.warn('[PlaybookEngine] LLM initialization failed, context detection disabled:', error.message);
        }
    }

    async loadPlaybook(playbookId) {
        try {
            const playbook = await playbookRepository.getById(playbookId);
            if (!playbook) {
                console.error('[PlaybookEngine] Playbook not found:', playbookId);
                return false;
            }

            const prompts = await playbookRepository.getPromptsByPlaybookId(playbookId);
            const documents = await playbookRepository.getDocumentsByPlaybookId(playbookId);

            this.activePlaybook = {
                ...playbook,
                prompts,
                documents
            };
            this.activePlaybookId = playbookId;

            // Clear context when loading new playbook
            this.context = [];

            console.log(`[PlaybookEngine] Loaded playbook: ${playbook.name} with ${prompts.length} prompts`);
            return true;
        } catch (error) {
            console.error('[PlaybookEngine] Error loading playbook:', error);
            return false;
        }
    }

    unloadPlaybook() {
        this.activePlaybook = null;
        this.activePlaybookId = null;
        this.context = [];
        console.log('[PlaybookEngine] Unloaded active playbook');
    }

    hasActivePlaybook() {
        return this.activePlaybook !== null;
    }

    getActivePlaybookId() {
        return this.activePlaybookId;
    }

    async processTranscript(transcript, screenContent = null) {
        if (!this.activePlaybook) {
            return null;
        }

        // Update rolling context window
        this.context.push(transcript);
        if (this.context.length > 10) {
            this.context.shift(); // Keep last 10 turns
        }

        // Check for triggered prompts
        const triggeredPrompts = this.activePlaybook.prompts.filter(prompt => {
            if (prompt.trigger_type === 'keyword') {
                const transcriptLower = transcript.toLowerCase();
                const triggerLower = prompt.trigger_value.toLowerCase();
                return transcriptLower.includes(triggerLower);
            }
            
            if (prompt.trigger_type === 'context') {
                // Will be handled asynchronously
                return false;
            }
            
            return false;
        });

        if (triggeredPrompts.length === 0) {
            // Try context-based detection
            const contextPrompts = this.activePlaybook.prompts.filter(p => p.trigger_type === 'context');
            if (contextPrompts.length > 0 && this.llm) {
                const contextMatches = await this.detectContextMatches(transcript, contextPrompts);
                if (contextMatches.length > 0) {
                    triggeredPrompts.push(...contextMatches);
                }
            }
        }

        if (triggeredPrompts.length === 0) {
            return null;
        }

        // Sort by priority
        triggeredPrompts.sort((a, b) => (b.priority || 0) - (a.priority || 0));
        const topPrompt = triggeredPrompts[0];

        // Throttle triggers to avoid spam
        const now = Date.now();
        if (now - this.lastTriggerTime < this.triggerCooldown) {
            return null;
        }
        this.lastTriggerTime = now;

        // Increment usage
        try {
            await playbookRepository.incrementUsage(this.activePlaybookId);
        } catch (error) {
            console.warn('[PlaybookEngine] Failed to increment usage:', error.message);
        }

        return {
            type: 'playbook_suggestion',
            prompt: topPrompt.prompt_text,
            triggerValue: topPrompt.trigger_value,
            triggerType: topPrompt.trigger_type,
            priority: topPrompt.priority,
            playbookName: this.activePlaybook.name,
        };
    }

    async detectContextMatches(transcript, contextPrompts) {
        if (!this.llm) {
            return [];
        }

        const matches = [];

        for (const prompt of contextPrompts) {
            try {
                const detected = await this.detectContext(transcript, prompt.trigger_value);
                if (detected) {
                    matches.push(prompt);
                }
            } catch (error) {
                console.warn(`[PlaybookEngine] Context detection failed for "${prompt.trigger_value}":`, error.message);
            }
        }

        return matches;
    }

    async detectContext(transcript, contextType) {
        if (!this.llm) {
            return false;
        }

        try {
            const prompt = `Analyze this transcript and determine if it contains a "${contextType}".\nTranscript: "${transcript}"\n\nRespond with YES or NO only.`;

            const response = await this.llm.complete([
                { role: 'user', content: prompt }
            ]);

            const result = response.toLowerCase().trim();
            return result.includes('yes');
        } catch (error) {
            console.error('[PlaybookEngine] Context detection error:', error);
            return false;
        }
    }

    async generateContextualResponse(userPrompt, conversationHistory = []) {
        if (!this.activePlaybook) {
            return null;
        }

        // Get all manual triggers (highest priority prompts)
        const manualPrompts = this.activePlaybook.prompts
            .filter(p => p.trigger_type === 'manual')
            .sort((a, b) => (b.priority || 0) - (a.priority || 0));

        if (manualPrompts.length === 0) {
            return null;
        }

        // Use the highest priority manual prompt
        const bestPrompt = manualPrompts[0];

        // Get RAG context if available
        const ragContext = this.getRelevantDocs(userPrompt);

        // Build enhanced context
        const enhancedContext = `${bestPrompt.prompt_text}
        
${ragContext ? `Document Context:\n${ragContext}\n\n` : ''}Recent conversation:
${conversationHistory.slice(-5).join('\n')}

User Request: ${userPrompt}

Provide a concise, actionable response that aligns with the playbook guidance.`;

        return {
            enhancedPrompt: enhancedContext,
            originalPrompt: bestPrompt.prompt_text,
            playbookName: this.activePlaybook.name,
            priority: bestPrompt.priority
        };
    }

    getRelevantDocs(query) {
        if (!this.activePlaybook || !this.activePlaybook.documents || this.activePlaybook.documents.length === 0) {
            return '';
        }

        // Simple keyword matching for now (can upgrade to embeddings later)
        const queryLower = query.toLowerCase();
        const relevantDocs = this.activePlaybook.documents.filter(doc => {
            const docText = (doc.processed_text || doc.file_name || '').toLowerCase();
            const keywords = queryLower.split(' ');
            return keywords.some(keyword => docText.includes(keyword));
        });

        return relevantDocs
            .map(doc => doc.processed_text || `[${doc.file_name}]`)
            .join('\n\n');
    }

    getContextWindow() {
        return [...this.context];
    }

    clearContext() {
        this.context = [];
    }
}

const playbookEngine = new PlaybookEngine();

module.exports = playbookEngine;

