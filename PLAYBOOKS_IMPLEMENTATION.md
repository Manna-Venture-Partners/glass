# Playbooks Implementation Summary

## Overview

Playbooks are contextual AI prompt libraries that help users prepare for specific conversations (sales demos, interviews, customer support, etc.). They provide triggered prompts based on keywords, context, or timers.

## Architecture

### Database Schema

Added four new tables to `src/features/common/config/schema.js`:

1. **playbooks** - Main playbook definitions
   - System templates vs user-created playbooks
   - Categories: sales, interview, meeting, support, generic
   - Premium flag for future monetization

2. **playbook_prompts** - Individual prompts within playbooks
   - Trigger-based (keyword, context, timer, manual)
   - Priority and ordering for matching

3. **playbook_documents** - RAG documents attached to playbooks
   - For future enhanced context

4. **user_playbooks** - User's collection and preferences
   - Favorite status
   - Usage tracking
   - Customizations

### Repository Layer

Following the dual-repository pattern:

- `src/features/playbooks/repositories/sqlite.repository.js` - Local SQLite operations
- `src/features/playbooks/repositories/firebase.repository.js` - Firebase sync operations
- `src/features/playbooks/repositories/index.js` - Adapter that routes based on auth state

Both repositories expose identical interfaces and handle encryption for sensitive fields.

### Service Layer

`src/features/playbooks/playbookService.js` provides:

- Template management
- User playbook collection
- Trigger matching (keyword-based)
- Usage tracking
- IPC handlers for UI integration

### Seed Data

`src/features/playbooks/seedPlaybooks.js` seeds 6 default system playbooks:

1. **Sales Demo** - Product pitches, feature explanations
2. **Objection Handler** - Rebuttals to common sales objections
3. **Technical Interview** - Algorithm explanations
4. **Behavioral Interview** - STAR method responses
5. **Customer Support** - Troubleshooting guidance
6. **General Meeting** - Action items and summaries

## Integration Points

### Feature Bridge

Playbook service is initialized in `src/bridge/featureBridge.js` with IPC handlers for:

**Service Handlers:**
- `playbook:getTemplates` - Get system playbooks
- `playbook:getUserPlaybooks` - Get user's collection
- `playbook:getWithPrompts` - Get playbook with all prompts
- `playbook:addToCollection` - Add playbook to user collection
- `playbook:toggleFavorite` - Toggle favorite status
- `playbook:getSuggested` - Smart playbook suggestions

**Engine Handlers:**
- `playbook-engine:initialize` - Initialize the engine with LLM
- `playbook-engine:load` - Load a playbook into the engine
- `playbook-engine:unload` - Unload the active playbook
- `playbook-engine:getActive` - Check if playbook is active
- `playbook-engine:processTranscript` - Process transcript for triggers

### Live Integration ✅

#### AskService Integration ✅ COMPLETE

The playbook engine is integrated into `src/features/ask/askService.js`:

- On `sendMessage()`, the engine checks for an active playbook
- Generates contextual response using manual-trigger prompts
- Injects playbook guidance into the system prompt
- Includes RAG context from playbook documents
- Tracks enhanced context for better AI responses

**Key Features:**
- Automatic context injection from active playbook
- RAG document retrieval for relevant context
- Priority-based prompt selection
- Non-blocking if playbook unavailable

#### ListenService Integration ✅ COMPLETE

The playbook engine is integrated into `src/features/listen/listenService.js`:

- On `handleTranscriptionComplete()`, processes transcript in real-time
- Detects keyword-based triggers
- Supports AI-based context detection (optional)
- Sends live suggestions to UI via `playbook-suggestion` event
- Throttles triggers (5s cooldown) to prevent spam

**Key Features:**
- Real-time transcript analysis
- Multiple trigger types (keyword, context)
- Rolling context window (last 10 turns)
- Priority sorting for best match
- Usage tracking per trigger

## Usage Workflow

1. User browses templates in settings
2. User adds playbook to collection
3. User selects active playbook for session
4. During conversation, matching triggers activate
5. AI receives context-specific guidance
6. User can favorite, customize, and track usage

## Next Steps

### Required for Full Implementation

1. **UI Components** (pickleglass_web/app/settings/)
   - Playbook browser
   - Playbook selector
   - Active playbook indicator
   - Prompt suggestions display

2. **askService Integration**
   - Inject playbook prompts into context
   - Handle multi-prompt scenarios
   - Track which prompts were used

3. **listenService Integration**
   - Real-time trigger detection
   - Live suggestion overlay
   - Conversation analysis for playbook suggestions

4. **Advanced Features**
   - Context-based triggers (semantic analysis)
   - Timer-based prompts
   - Custom user playbook creation
   - Playbook sharing
   - RAG integration for documents

## Database Migration

When this code is deployed, the new playbook tables will be created automatically when the database initializes. The seed function will populate default system playbooks.

## Files Created/Modified

### New Files
- `src/features/playbooks/repositories/sqlite.repository.js` ✅
- `src/features/playbooks/repositories/firebase.repository.js` ✅
- `src/features/playbooks/repositories/index.js` ✅
- `src/features/playbooks/playbookService.js` ✅
- `src/features/playbooks/playbookEngine.js` ✅
- `src/features/playbooks/seedPlaybooks.js` ✅

### Modified Files
- `src/features/common/config/schema.js` - Added 4 new tables ✅
- `src/features/common/services/sqliteClient.js` - Added seed call ✅
- `src/bridge/featureBridge.js` - Added playbook service & engine ✅
- `src/features/listen/listenService.js` - Added real-time playbook triggers ✅
- `src/features/ask/askService.js` - Added playbook context injection ✅

## Testing Checklist

- [ ] Verify playbook tables created on fresh install
- [ ] Verify seed data populates correctly
- [ ] Test SQLite operations (CRUD)
- [ ] Test Firebase operations (when logged in)
- [ ] Test dual-repository switching
- [ ] Test IPC handlers
- [ ] Test trigger matching
- [ ] Test usage tracking
- [ ] Verify encryption for sensitive fields

## Security Considerations

- Encrypted fields: `description`, `prompt_text`, `processed_text`
- User ID injection handled by adapter
- Premium playbooks gated by `is_premium` flag
- Sync state tracked for offline/online consistency

