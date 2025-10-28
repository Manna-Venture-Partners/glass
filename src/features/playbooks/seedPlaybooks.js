const sqliteClient = require('../common/services/sqliteClient');

// Default system playbooks to seed
const DEFAULT_PLAYBOOKS = [
    {
        name: 'Sales Demo',
        description: 'Product pitches, feature explanations, and sales conversations',
        category: 'sales',
        icon: '💰',
        is_premium: false,
        is_template: true,
        prompts: [
            {
                trigger_type: 'keyword',
                trigger_value: 'objection',
                prompt_text: 'Help address this objection professionally. First acknowledge the concern, then provide a clear, solution-focused response.',
                priority: 10,
                order_index: 1
            },
            {
                trigger_type: 'keyword',
                trigger_value: 'pricing',
                prompt_text: 'Address pricing questions by highlighting value and ROI. Provide specific pricing information if available, or offer to schedule a detailed pricing discussion.',
                priority: 9,
                order_index: 2
            },
            {
                trigger_type: 'keyword',
                trigger_value: 'feature',
                prompt_text: 'Explain how this feature solves a specific customer problem. Use concrete examples and benefits.',
                priority: 8,
                order_index: 3
            }
        ]
    },
    {
        name: 'Objection Handler',
        description: 'Common objections and professional rebuttals',
        category: 'sales',
        icon: '🛡️',
        is_premium: false,
        is_template: true,
        prompts: [
            {
                trigger_type: 'keyword',
                trigger_value: 'too expensive',
                prompt_text: 'Address cost concerns by focusing on ROI and long-term value. Provide specific cost-benefit analysis or offer flexible payment options.',
                priority: 10,
                order_index: 1
            },
            {
                trigger_type: 'keyword',
                trigger_value: 'need to think',
                prompt_text: 'Gently probe what specific concerns need to be addressed. Offer additional information or resources to help with decision-making.',
                priority: 8,
                order_index: 2
            },
            {
                trigger_type: 'keyword',
                trigger_value: 'competitor',
                prompt_text: 'Highlight our unique differentiators. Focus on specific advantages without disparaging competitors.',
                priority: 7,
                order_index: 3
            }
        ]
    },
    {
        name: 'Technical Interview',
        description: 'Coding help, algorithm explanations, technical support',
        category: 'interview',
        icon: '💻',
        is_premium: false,
        is_template: true,
        prompts: [
            {
                trigger_type: 'keyword',
                trigger_value: 'algorithm',
                prompt_text: 'Explain the algorithm step by step, discuss time/space complexity, and provide example implementations.',
                priority: 10,
                order_index: 1
            },
            {
                trigger_type: 'keyword',
                trigger_value: 'code review',
                prompt_text: 'Review the code for correctness, efficiency, and best practices. Suggest improvements constructively.',
                priority: 9,
                order_index: 2
            },
            {
                trigger_type: 'keyword',
                trigger_value: 'technical question',
                prompt_text: 'Provide a clear, concise technical explanation with relevant examples and context.',
                priority: 8,
                order_index: 3
            }
        ]
    },
    {
        name: 'Behavioral Interview',
        description: 'STAR method responses and behavioral questions',
        category: 'interview',
        icon: '⭐',
        is_premium: false,
        is_template: true,
        prompts: [
            {
                trigger_type: 'keyword',
                trigger_value: 'tell me about',
                prompt_text: 'Help structure a STAR (Situation, Task, Action, Result) response. Identify the situation, your role, actions taken, and outcomes achieved.',
                priority: 10,
                order_index: 1
            },
            {
                trigger_type: 'keyword',
                trigger_value: 'challenge',
                prompt_text: 'Frame the challenge clearly, explain your approach to solving it, and highlight the positive outcome and lessons learned.',
                priority: 9,
                order_index: 2
            },
            {
                trigger_type: 'keyword',
                trigger_value: 'weakness',
                prompt_text: 'Select a genuine weakness that shows self-awareness. Explain steps taken to address it and demonstrate growth.',
                priority: 8,
                order_index: 3
            }
        ]
    },
    {
        name: 'Customer Support',
        description: 'Troubleshooting, empathy responses, problem resolution',
        category: 'support',
        icon: '🎧',
        is_premium: false,
        is_template: true,
        prompts: [
            {
                trigger_type: 'keyword',
                trigger_value: 'issue',
                prompt_text: 'Acknowledge the issue with empathy. Provide step-by-step troubleshooting guidance and offer escalation if needed.',
                priority: 10,
                order_index: 1
            },
            {
                trigger_type: 'keyword',
                trigger_value: 'complaint',
                prompt_text: 'Listen actively, validate concerns, apologize if appropriate, and provide a clear resolution path.',
                priority: 9,
                order_index: 2
            },
            {
                trigger_type: 'keyword',
                trigger_value: 'how to',
                prompt_text: 'Provide clear, concise instructions. Break down complex steps into smaller, manageable actions.',
                priority: 8,
                order_index: 3
            }
        ]
    },
    {
        name: 'General Meeting',
        description: 'Note-taking, action items, and meeting summaries',
        category: 'meeting',
        icon: '📝',
        is_premium: false,
        is_template: true,
        prompts: [
            {
                trigger_type: 'keyword',
                trigger_value: 'action item',
                prompt_text: 'Capture the action item with owner, deadline, and specific deliverable. Set reminders for follow-up.',
                priority: 10,
                order_index: 1
            },
            {
                trigger_type: 'keyword',
                trigger_value: 'decision',
                prompt_text: 'Document the decision clearly, including rationale and stakeholders involved.',
                priority: 9,
                order_index: 2
            },
            {
                trigger_type: 'keyword',
                trigger_value: 'summary',
                prompt_text: 'Create a concise meeting summary with key points, decisions, and next steps.',
                priority: 8,
                order_index: 3
            }
        ]
    }
];

async function seedDefaultPlaybooks() {
    const db = sqliteClient.getDb();
    
    try {
        // Check if playbooks already exist
        const existing = db.prepare('SELECT COUNT(*) as count FROM playbooks WHERE is_template = 1').get();
        
        if (existing.count > 0) {
            console.log('[PlaybookSeed] Default playbooks already exist, skipping seed.');
            return;
        }
        
        console.log('[PlaybookSeed] Seeding default playbooks...');
        const now = Math.floor(Date.now() / 1000);
        
        for (const playbook of DEFAULT_PLAYBOOKS) {
            // Insert playbook
            const playbookId = require('crypto').randomUUID();
            const playbookInsert = `
                INSERT INTO playbooks (
                    id, name, description, category, icon, 
                    is_premium, is_template, created_by, 
                    created_at, updated_at, sync_state
                ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            `;
            
            db.prepare(playbookInsert).run(
                playbookId,
                playbook.name,
                playbook.description,
                playbook.category,
                playbook.icon,
                0, // is_premium
                1, // is_template
                null, // created_by (system templates)
                now,
                now,
                'clean'
            );
            
            // Insert prompts
            if (playbook.prompts) {
                for (const prompt of playbook.prompts) {
                    const promptId = require('crypto').randomUUID();
                    const promptInsert = `
                        INSERT INTO playbook_prompts (
                            id, playbook_id, trigger_type, trigger_value, 
                            prompt_text, priority, order_index, sync_state
                        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)
                    `;
                    
                    db.prepare(promptInsert).run(
                        promptId,
                        playbookId,
                        prompt.trigger_type,
                        prompt.trigger_value,
                        prompt.prompt_text,
                        prompt.priority || 0,
                        prompt.order_index || 0,
                        'clean'
                    );
                }
            }
            
            console.log(`[PlaybookSeed] Seeded playbook: ${playbook.name}`);
        }
        
        console.log('[PlaybookSeed] Successfully seeded all default playbooks.');
        
    } catch (error) {
        console.error('[PlaybookSeed] Error seeding playbooks:', error);
        throw error;
    }
}

module.exports = {
    seedDefaultPlaybooks,
    DEFAULT_PLAYBOOKS
};

