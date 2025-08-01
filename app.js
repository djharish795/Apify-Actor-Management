// Enhanced Interactive Features
// TODO: Maybe add localStorage for session persistence later?
const AppState = {
    apiKey: '', // Store API key temporarily - need to think about security
    selectedActor: null,
    actors: [],
    schema: null,
    isExecuting: false,
    theme: 'light', // Default theme, user can toggle
    sessionStartTime: Date.now(),
    executionCount: 0, // Track for analytics
    currentView: 'grid' // grid or list view
};

// API endpoints - using localhost for development
// NOTE: In production, this should be configurable
const API_BASE = 'http://localhost:3000/api';

// Show/hide sections with smooth transitions
// Spent way too much time perfecting these animations lol
function showSection(sectionId) {
    // Update progress bar first
    updateProgressBar(sectionId);
    
    // Hide all sections with fade effect
    const sections = document.querySelectorAll('.section');
    sections.forEach(section => {
        section.style.opacity = '0';
        section.style.transform = 'translateY(20px)';
        setTimeout(() => section.classList.add('hidden'), 300);
    });
    
    // Show target section with animation
    setTimeout(() => {
        const targetSection = document.getElementById(sectionId);
        if (targetSection) { // safety check
            targetSection.classList.remove('hidden');
            setTimeout(() => {
                targetSection.style.opacity = '1';
                targetSection.style.transform = 'translateY(0)';
            }, 50);
        }
    }, 300);
}

// Progress bar management
function updateProgressBar(currentSection) {
    const stepMap = {
        'auth-section': 'auth',
        'actor-section': 'actor', 
        'schema-section': 'config',
        'results-section': 'results'
    };
    
    const currentStep = stepMap[currentSection];
    
    document.querySelectorAll('.progress-step').forEach(step => {
        step.classList.remove('active');
    });
    
    if (currentStep) {
        document.querySelector(`[data-step="${currentStep}"]`).classList.add('active');
    }
}

// Theme switching functionality
function toggleTheme() {
    const currentTheme = document.body.getAttribute('data-theme') || 'light';
    const newTheme = currentTheme === 'light' ? 'dark' : 'light';
    
    console.log(`Switching theme from ${currentTheme} to ${newTheme}`); // debug
    
    document.body.setAttribute('data-theme', newTheme);
    AppState.theme = newTheme;
    
    // Update icon
    const themeIcon = document.querySelector('#theme-toggle i');
    if (themeIcon) {
        themeIcon.className = newTheme === 'dark' ? 'fas fa-sun' : 'fas fa-moon';
    }
    
    showToast(`Switched to ${newTheme} theme`, 'success');
}

// Fullscreen toggle
function toggleFullscreen() {
    if (!document.fullscreenElement) {
        document.documentElement.requestFullscreen();
        document.querySelector('#fullscreen-toggle i').className = 'fas fa-compress';
    } else {
        document.exitFullscreen();
        document.querySelector('#fullscreen-toggle i').className = 'fas fa-expand';
    }
}

// Password visibility toggle
function togglePasswordVisibility() {
    const input = document.getElementById('api-key');
    const icon = document.querySelector('.toggle-password i');
    
    if (input.type === 'password') {
        input.type = 'text';
        icon.className = 'fas fa-eye-slash';
    } else {
        input.type = 'password';
        icon.className = 'fas fa-eye';
    }
}

// Toast notifications
function showToast(message, type = 'info', duration = 3000) {
    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;
    
    const icon = {
        success: 'fas fa-check-circle',
        error: 'fas fa-exclamation-triangle', 
        info: 'fas fa-info-circle',
        warning: 'fas fa-exclamation-circle'
    }[type] || 'fas fa-info-circle';
    
    toast.innerHTML = `
        <div style="display: flex; align-items: center; gap: 10px;">
            <i class="${icon}"></i>
            <span>${message}</span>
        </div>
    `;
    
    document.getElementById('toast-container').appendChild(toast);
    
    setTimeout(() => {
        toast.style.animation = 'slideOutRight 0.3s ease-out forwards';
        setTimeout(() => toast.remove(), 300);
    }, duration);
}

// Session timer
function updateSessionTimer() {
    const elapsed = Date.now() - AppState.sessionStartTime;
    const minutes = Math.floor(elapsed / 60000);
    const seconds = Math.floor((elapsed % 60000) / 1000);
    
    document.getElementById('session-time').textContent = 
        `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
}

// Search through actors - probably could optimize this later
function filterActors() {
    const searchInput = document.getElementById('actor-search');
    const searchTerm = searchInput.value.toLowerCase();
    const actorCards = document.querySelectorAll('.actor-card');
    const clearBtn = document.querySelector('.clear-search');
    
    // Show/hide clear button based on search input
    clearBtn.style.display = searchTerm ? 'block' : 'none';
    
    let visibleCount = 0; // track how many are visible
    
    actorCards.forEach(card => {
        const nameElement = card.querySelector('.actor-name');
        const descElement = card.querySelector('.actor-description');
        
        if (nameElement && descElement) {
            const name = nameElement.textContent.toLowerCase();
            const description = descElement.textContent.toLowerCase();
            
            const isMatch = name.includes(searchTerm) || description.includes(searchTerm);
            
            if (isMatch) {
                card.style.display = 'block';
                card.style.animation = 'fadeInUp 0.3s ease-out';
                visibleCount++;
            } else {
                card.style.display = 'none';
            }
        }
    });
    
    // Debug: log search results
    if (searchTerm) {
        console.log(`Search "${searchTerm}" found ${visibleCount} actors`);
    }
}

function clearSearch() {
    document.getElementById('actor-search').value = '';
    filterActors();
}

// View toggle for actors
function toggleView(view) {
    AppState.currentView = view;
    const container = document.getElementById('actors-list');
    const buttons = document.querySelectorAll('.view-btn');
    
    buttons.forEach(btn => btn.classList.remove('active'));
    document.querySelector(`[data-view="${view}"]`).classList.add('active');
    
    container.className = `actors-container ${view}-view`;
}

// Results view toggle
function toggleResultsView(view) {
    const buttons = document.querySelectorAll('.view-options .view-btn');
    buttons.forEach(btn => btn.classList.remove('active'));
    document.querySelector(`[data-view="${view}"]`).classList.add('active');
    
    // Implement view switching logic here
    showToast(`Switched to ${view} view`, 'info');
}

// Global loader
function showGlobalLoader(message = 'Loading...') {
    const loader = document.getElementById('global-loader');
    loader.querySelector('p').textContent = message;
    loader.classList.remove('hidden');
}

function hideGlobalLoader() {
    document.getElementById('global-loader').classList.add('hidden');
}

// Modal management
function showModal(modalId) {
    document.getElementById(modalId).classList.remove('hidden');
}

function closeModal(modalId) {
    document.getElementById(modalId).classList.add('hidden');
}

// Quick actions
function showQuickActions() {
    showModal('quick-actions-modal');
}

function quickExecute() {
    closeModal('quick-actions-modal');
    if (AppState.selectedActor) {
        executeActor();
    } else {
        showToast('Please select an actor first', 'warning');
    }
}

function showHistory() {
    closeModal('quick-actions-modal');
    showToast('Execution history feature coming soon!', 'info');
}

function showAnalytics() {
    closeModal('quick-actions-modal');
    showToast('Analytics dashboard coming soon!', 'info');
}

// Form management functions
// TODO: Add form validation before submission
function resetForm() {
    const form = document.getElementById('actor-form');
    if (form) {
        form.reset();
        showToast('Form reset successfully', 'success');
    }
}

// Feature placeholder - will implement preset saving later
function loadPreset() {
    // TODO: Implement preset loading from localStorage
    showToast('Preset loading feature coming soon!', 'info');
}

function savePreset() {
    // TODO: Save current form state to localStorage
    // Maybe add a modal to name the preset?
    showToast('Preset saved successfully!', 'success');
}

// Results management
function downloadResults(format) {
    showToast(`Downloading results as ${format.toUpperCase()}...`, 'info');
}

function shareResults() {
    navigator.clipboard.writeText(window.location.href).then(() => {
        showToast('Results link copied to clipboard!', 'success');
    });
}

function filterResults() {
    const filter = document.getElementById('results-filter').value;
    showToast(`Filtering results: ${filter}`, 'info');
}

function duplicateExecution() {
    showToast('Execution duplicated to queue', 'success');
    showSection('schema-section');
}

function scheduleExecution() {
    showToast('Scheduling feature coming soon!', 'info');
}

// Enhanced utility functions with animations
function showSection(sectionId) {
    // Hide all sections with fade effect
    document.querySelectorAll('.section').forEach(section => {
        section.style.opacity = '0';
        section.style.transform = 'translateY(20px)';
        setTimeout(() => section.classList.add('hidden'), 300);
    });
    
    // Show target section with animation
    setTimeout(() => {
        const targetSection = document.getElementById(sectionId);
        targetSection.classList.remove('hidden');
        setTimeout(() => {
            targetSection.style.opacity = '1';
            targetSection.style.transform = 'translateY(0)';
        }, 50);
    }, 300);
}

function showStatus(elementId, message, type = 'loading') {
    const element = document.getElementById(elementId);
    element.className = `status ${type}`;
    
    // Add icon based on type
    const icons = {
        loading: '⏳',
        success: '✅',
        error: '❌'
    };
    
    const icon = icons[type] || '📍';
    
    element.innerHTML = type === 'loading' ? 
        `<span class="loading-spinner"></span>${icon} ${message}` : 
        `${icon} ${message}`;
    
    // Add entrance animation
    element.style.animation = 'statusSlideIn 0.4s ease-out';
}

function hideStatus(elementId) {
    const element = document.getElementById(elementId);
    element.style.opacity = '0';
    setTimeout(() => {
        element.innerHTML = '';
        element.className = 'status';
        element.style.opacity = '1';
    }, 300);
}

// Enhanced authentication with visual feedback
async function authenticateUser() {
    const apiKey = document.getElementById('api-key').value.trim();
    const authSection = document.getElementById('auth-section');
    
    if (!apiKey) {
        showStatus('auth-status', 'Please enter your API key', 'error');
        // Shake animation for input
        const input = document.getElementById('api-key');
        input.style.animation = 'shake 0.5s ease-in-out';
        setTimeout(() => input.style.animation = '', 500);
        return;
    }

    showStatus('auth-status', 'Authenticating with Apify...');
    
    try {
        const response = await fetch(`${API_BASE}/authenticate`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ apiKey })
        });

        const data = await response.json();

        if (response.ok) {
            AppState.apiKey = apiKey;
            showStatus('auth-status', 'Authentication successful! 🎉', 'success');
            
            // Success animation
            authSection.classList.add('auth-success');
            setTimeout(() => authSection.classList.remove('auth-success'), 600);
            
            // Delay before transitioning
            setTimeout(() => {
                addParticleEffect();
                loadActors();
            }, 1200);
        } else {
            throw new Error(data.error || 'Authentication failed');
        }
    } catch (error) {
        showStatus('auth-status', `Authentication failed: ${error.message}`, 'error');
        // Error shake effect
        const input = document.getElementById('api-key');
        input.style.animation = 'shake 0.5s ease-in-out';
        setTimeout(() => input.style.animation = '', 500);
    }
}

// Add particle effect for success
function addParticleEffect() {
    const particles = 20;
    for (let i = 0; i < particles; i++) {
        setTimeout(() => createParticle(), i * 100);
    }
}

function createParticle() {
    const particle = document.createElement('div');
    particle.style.cssText = `
        position: fixed;
        width: 6px;
        height: 6px;
        background: radial-gradient(circle, #4facfe, #00f2fe);
        border-radius: 50%;
        pointer-events: none;
        z-index: 1000;
        left: ${Math.random() * window.innerWidth}px;
        top: ${Math.random() * window.innerHeight}px;
        animation: particleFloat 3s ease-out forwards;
    `;
    
    document.body.appendChild(particle);
    setTimeout(() => particle.remove(), 3000);
}

// Enhanced actor loading with staggered animations
async function loadActors() {
    showSection('actor-section');
    showStatus('actor-status', 'Loading your amazing actors...');

    try {
        const response = await fetch(`${API_BASE}/actors`, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${AppState.apiKey}`,
                'Content-Type': 'application/json',
            }
        });

        const data = await response.json();

        if (response.ok) {
            AppState.actors = data.actors;
            renderActorsWithAnimation(data.actors);
            hideStatus('actor-status');
        } else {
            throw new Error(data.error || 'Failed to load actors');
        }
    } catch (error) {
        showStatus('actor-status', `Failed to load actors: ${error.message}`, 'error');
    }
}

// Enhanced actor rendering with animations
function renderActorsWithAnimation(actors) {
    const actorsContainer = document.getElementById('actors-list');
    
    if (actors.length === 0) {
        actorsContainer.innerHTML = `
            <div style="text-align: center; color: rgba(255,255,255,0.8); padding: 40px;">
                <div style="font-size: 3rem; margin-bottom: 20px;">🎭</div>
                <h3>No actors found</h3>
                <p>Create some actors in your Apify Console first!</p>
            </div>
        `;
        return;
    }

    actorsContainer.innerHTML = actors.map((actor, index) => `
        <div class="actor-card" onclick="selectActor('${actor.id}')" style="animation-delay: ${index * 0.1}s">
            <div class="actor-name">${actor.name || actor.title || 'Unnamed Actor'}</div>
            <div class="actor-description">${actor.description || 'No description available'}</div>
            <div style="margin-top: 15px; font-size: 0.85rem; color: rgba(255,255,255,0.6);">
                ${actor.isPublic ? '🌐 Public' : '🔒 Private'} • ${actor.username || 'Your Actor'}
            </div>
        </div>
    `).join('');
}

// Enhanced actor selection with smooth transitions
async function selectActor(actorId) {
    // Enhanced selection animation
    document.querySelectorAll('.actor-card').forEach(card => {
        card.classList.remove('selected');
        card.style.transform = 'scale(1)';
    });
    
    const selectedCard = event.target.closest('.actor-card');
    selectedCard.classList.add('selected');
    selectedCard.style.transform = 'scale(1.02)';

    const actor = AppState.actors.find(a => a.id === actorId);
    AppState.selectedActor = actor;

    // Add loading state to selected card
    const originalContent = selectedCard.innerHTML;
    selectedCard.innerHTML += '<div style="position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%);"><div class="loading-spinner"></div></div>';

    try {
        await loadActorSchema(actorId);
    } finally {
        selectedCard.innerHTML = originalContent;
    }
}

// Enhanced schema loading with form animations
async function loadActorSchema(actorId) {
    showStatus('actor-status', 'Loading actor configuration...');

    try {
        const response = await fetch(`${API_BASE}/actors/${actorId}/schema`, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${AppState.apiKey}`,
                'Content-Type': 'application/json',
            }
        });

        const data = await response.json();

        if (response.ok) {
            AppState.schema = data.schema;
            renderSchemaFormWithAnimation(data.schema);
            showSection('schema-section');
            hideStatus('actor-status');
        } else {
            throw new Error(data.error || 'Failed to load schema');
        }
    } catch (error) {
        showStatus('actor-status', `Failed to load schema: ${error.message}`, 'error');
    }
}

// Enhanced form rendering with staggered animations
function renderSchemaFormWithAnimation(schema) {
    const actorInfo = document.getElementById('actor-info');
    const form = document.getElementById('actor-form');

    // Enhanced actor info display
    actorInfo.innerHTML = `
        <div style="display: flex; align-items: center; gap: 15px; margin-bottom: 15px;">
            <div style="font-size: 2rem;">🎭</div>
            <div>
                <h3 style="color: white; margin: 0; font-size: 1.4rem;">${AppState.selectedActor.name}</h3>
                <p style="color: rgba(255,255,255,0.8); margin: 5px 0 0 0; font-size: 0.9rem;">
                    ${AppState.selectedActor.description || 'Ready to execute'}
                </p>
            </div>
        </div>
        <div style="background: rgba(79, 172, 254, 0.1); padding: 15px; border-radius: 12px; border-left: 4px solid #4facfe;">
            <small style="color: rgba(255,255,255,0.9);">
                📋 Configure the parameters below and click Execute to run this actor
            </small>
        </div>
    `;

    // Generate form fields with enhanced styling
    const properties = schema.properties || {};
    
    form.innerHTML = Object.keys(properties).map((key, index) => {
        const property = properties[key];
        return generateEnhancedFormField(key, property, index);
    }).join('');

    // Add staggered animation to form fields
    setTimeout(() => {
        document.querySelectorAll('.form-group').forEach((field, index) => {
            field.style.setProperty('--index', index);
            field.style.animation = `formFieldAppear 0.5s ease-out ${index * 0.1}s forwards`;
        });
    }, 100);
}

// Enhanced form field generation
function generateEnhancedFormField(key, property, index) {
    const { type, title, description, default: defaultValue, enum: enumValues } = property;
    const label = title || key.charAt(0).toUpperCase() + key.slice(1);
    const placeholder = description || `Enter ${label}`;

    let inputElement = '';
    let fieldIcon = '📝';

    // Type-specific icons and inputs
    switch (type) {
        case 'string':
            fieldIcon = '✏️';
            if (enumValues) {
                inputElement = `
                    <select id="input-${key}" name="${key}" style="background-image: url('data:image/svg+xml;charset=US-ASCII,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 4 5"><path fill="%23ffffff" d="M2 0L0 2h4zm0 5L0 3h4z"/></svg>');">
                        ${enumValues.map(value => 
                            `<option value="${value}" ${value === defaultValue ? 'selected' : ''}>${value}</option>`
                        ).join('')}
                    </select>
                `;
            } else if (description && description.toLowerCase().includes('url')) {
                fieldIcon = '🔗';
                inputElement = `<input type="url" id="input-${key}" name="${key}" placeholder="${placeholder}" value="${defaultValue || ''}" />`;
            } else if (description && description.length > 100) {
                fieldIcon = '📄';
                inputElement = `<textarea id="input-${key}" name="${key}" placeholder="${placeholder}" rows="4">${defaultValue || ''}</textarea>`;
            } else {
                inputElement = `<input type="text" id="input-${key}" name="${key}" placeholder="${placeholder}" value="${defaultValue || ''}" />`;
            }
            break;
        case 'number':
        case 'integer':
            fieldIcon = '🔢';
            inputElement = `<input type="number" id="input-${key}" name="${key}" placeholder="${placeholder}" value="${defaultValue || ''}" />`;
            break;
        case 'boolean':
            fieldIcon = '✅';
            inputElement = `
                <select id="input-${key}" name="${key}">
                    <option value="true" ${defaultValue === true ? 'selected' : ''}>✅ True</option>
                    <option value="false" ${defaultValue === false ? 'selected' : ''}>❌ False</option>
                </select>
            `;
            break;
        case 'array':
            fieldIcon = '📋';
            inputElement = `<textarea id="input-${key}" name="${key}" placeholder="Enter JSON array format" rows="3">${JSON.stringify(defaultValue || [], null, 2)}</textarea>`;
            break;
        case 'object':
            fieldIcon = '📦';
            inputElement = `<textarea id="input-${key}" name="${key}" placeholder="Enter JSON object format" rows="4">${JSON.stringify(defaultValue || {}, null, 2)}</textarea>`;
            break;
        default:
            inputElement = `<input type="text" id="input-${key}" name="${key}" placeholder="${placeholder}" value="${defaultValue || ''}" />`;
    }

    return `
        <div class="form-group" style="opacity: 0; transform: translateX(-20px);">
            <label for="input-${key}" style="display: flex; align-items: center; gap: 8px;">
                <span>${fieldIcon}</span>
                ${label}${property.required ? ' <span style="color: #ff6b6b;">*</span>' : ''}
            </label>
            ${inputElement}
            ${description ? `<small style="color: rgba(255,255,255,0.7); font-size: 0.85rem; margin-top: 5px; display: block;">💡 ${description}</small>` : ''}
        </div>
    `;
}

// Enhanced execution with real-time feedback
async function executeActor() {
    if (AppState.isExecuting) return;

    AppState.isExecuting = true;
    const executeBtn = document.getElementById('execute-btn');
    const originalText = executeBtn.textContent;
    
    executeBtn.innerHTML = '<span class="loading-spinner"></span>🚀 Executing...';
    executeBtn.disabled = true;

    try {
        showStatus('execution-status', 'Preparing execution parameters...');

        // Enhanced form data collection with validation
        const formData = new FormData(document.getElementById('actor-form'));
        const inputs = {};

        for (const [key, value] of formData.entries()) {
            const property = AppState.schema.properties[key];
            
            try {
                switch (property.type) {
                    case 'number':
                    case 'integer':
                        inputs[key] = value ? Number(value) : undefined;
                        break;
                    case 'boolean':
                        inputs[key] = value === 'true';
                        break;
                    case 'array':
                    case 'object':
                        if (value.trim()) {
                            inputs[key] = JSON.parse(value);
                        }
                        break;
                    default:
                        inputs[key] = value || undefined;
                }
            } catch (e) {
                throw new Error(`Invalid ${property.type} format for "${key}": ${e.message}`);
            }
        }

        showStatus('execution-status', '🚀 Launching actor execution...');

        const response = await fetch(`${API_BASE}/actors/${AppState.selectedActor.id}/run`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${AppState.apiKey}`,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ inputs })
        });

        const data = await response.json();

        if (response.ok) {
            AppState.executionCount++;
            document.getElementById('executions-count').textContent = AppState.executionCount;
            displayEnhancedResults(data);
            showToast('Actor executed successfully! 🎉', 'success');
        } else {
            throw new Error(data.error || 'Execution failed');
        }
    } catch (error) {
        showStatus('execution-status', `Execution failed: ${error.message}`, 'error');
    } finally {
        AppState.isExecuting = false;
        executeBtn.innerHTML = originalText;
        executeBtn.disabled = false;
    }
}

// Enhanced results display with animations
function displayEnhancedResults(data) {
    showSection('results-section');
    
    const executionInfo = document.getElementById('execution-info');
    const resultsContainer = document.getElementById('results-container');

    // Enhanced execution info
    executionInfo.innerHTML = `
        <h3>🎉 Execution Completed Successfully!</h3>
        <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 15px; margin-top: 15px;">
            <div style="background: rgba(255,255,255,0.1); padding: 15px; border-radius: 12px; text-align: center;">
                <div style="font-size: 1.5rem; margin-bottom: 5px;">🎭</div>
                <strong>Actor:</strong><br>${AppState.selectedActor.name}
            </div>
            <div style="background: rgba(255,255,255,0.1); padding: 15px; border-radius: 12px; text-align: center;">
                <div style="font-size: 1.5rem; margin-bottom: 5px;">🆔</div>
                <strong>Run ID:</strong><br><code style="font-size: 0.8rem;">${data.runId}</code>
            </div>
            <div style="background: rgba(255,255,255,0.1); padding: 15px; border-radius: 12px; text-align: center;">
                <div style="font-size: 1.5rem; margin-bottom: 5px;">${data.status === 'SUCCEEDED' ? '✅' : '⚠️'}</div>
                <strong>Status:</strong><br>${data.status}
            </div>
            <div style="background: rgba(255,255,255,0.1); padding: 15px; border-radius: 12px; text-align: center;">
                <div style="font-size: 1.5rem; margin-bottom: 5px;">⏱️</div>
                <strong>Duration:</strong><br>${(data.duration / 1000).toFixed(2)}s
            </div>
        </div>
    `;

    // Enhanced results display
    if (data.results && data.results.length > 0) {
        resultsContainer.innerHTML = `
            <div style="display: flex; align-items: center; gap: 10px; margin-bottom: 20px;">
                <h4 style="color: white; margin: 0;">📊 Results</h4>
                <span style="background: #4facfe; color: white; padding: 4px 12px; border-radius: 20px; font-size: 0.85rem;">
                    ${data.results.length} items
                </span>
            </div>
            ${data.results.map((item, index) => `
                <div class="result-item" style="animation-delay: ${index * 0.1}s;">
                    <div style="display: flex; align-items: center; gap: 10px; margin-bottom: 10px;">
                        <strong style="color: #4facfe;">📌 Item ${index + 1}</strong>
                        <span style="background: rgba(79, 172, 254, 0.2); color: #4facfe; padding: 2px 8px; border-radius: 10px; font-size: 0.8rem;">
                            ${typeof item === 'object' ? Object.keys(item).length + ' fields' : typeof item}
                        </span>
                    </div>
                    <pre style="background: rgba(0,0,0,0.2); padding: 15px; border-radius: 8px; overflow-x: auto; font-size: 0.85rem; color: rgba(255,255,255,0.9);">${JSON.stringify(item, null, 2)}</pre>
                </div>
            `).join('')}
        `;
    } else {
        resultsContainer.innerHTML = `
            <div style="text-align: center; padding: 40px; color: rgba(255,255,255,0.8);">
                <div style="font-size: 3rem; margin-bottom: 20px;">📭</div>
                <h3>No Results Returned</h3>
                <p>The actor completed successfully but didn't return any data.</p>
                <p style="font-size: 0.9rem; margin-top: 15px; opacity: 0.7;">
                    This might be normal depending on the actor's purpose.
                </p>
            </div>
        `;
    }
    
    // Animate result items
    setTimeout(() => {
        document.querySelectorAll('.result-item').forEach((item, index) => {
            setTimeout(() => {
                item.style.opacity = '1';
                item.style.transform = 'translateX(0)';
            }, index * 100);
        });
    }, 100);
}

// Enhanced reset with transition
function resetApp() {
    // Add transition effect
    const currentSection = document.querySelector('.section:not(.hidden)');
    if (currentSection) {
        currentSection.style.opacity = '0';
        currentSection.style.transform = 'scale(0.95)';
    }
    
    setTimeout(() => {
        AppState.selectedActor = null;
        AppState.schema = null;
        AppState.isExecuting = false;
        
        showSection('actor-section');
        
        // Clear selections with animation
        document.querySelectorAll('.actor-card').forEach(card => {
            card.classList.remove('selected');
            card.style.transform = 'scale(1)';
        });
    }, 300);
}

// Initialize everything when page loads
document.addEventListener('DOMContentLoaded', function() {
    console.log('🕷️ Apify Pro starting up...');
    
    // Start the session timer
    setInterval(updateSessionTimer, 1000);
    
    // Set up the progress bar
    updateProgressBar('auth-section');
    
    // Animate sections on load (makes it feel smooth)
    setTimeout(() => {
        const sections = document.querySelectorAll('.section');
        sections.forEach((section, index) => {
            section.style.animationDelay = `${index * 0.2}s`;
        });
    }, 100);
    
    // Set up keyboard shortcuts - power user feature!
    document.addEventListener('keydown', function(e) {
        if (e.ctrlKey || e.metaKey) {
            switch(e.key) {
                case 'Enter':
                    // Quick submit when focused on API key
                    if (document.getElementById('api-key') === document.activeElement) {
                        authenticateUser();
                    }
                    break;
                case 'k':
                    e.preventDefault();
                    const searchBox = document.getElementById('actor-search');
                    if (searchBox) {
                        searchBox.focus();
                    }
                    break;
                case 't':
                    e.preventDefault();
                    toggleTheme();
                    break;
            }
        }
        
        // ESC key closes modals (standard UX pattern)
        if (e.key === 'Escape') {
            document.querySelectorAll('.modal:not(.hidden)').forEach(modal => {
                modal.classList.add('hidden');
            });
        }
    });
    
    // Auto-save form data as user types (might be useful)
    document.addEventListener('input', function(e) {
        if (e.target.closest('#actor-form')) {
            localStorage.setItem('formData', JSON.stringify(getFormData()));
        }
    });
    
    // Set up any tooltips or help text
    initializeTooltips();
    
    // Welcome message after everything loads
    setTimeout(() => {
        showToast('Welcome to Apify Pro! 🚀', 'success', 4000);
    }, 1000);
});

// Helper functions for new features
function getFormData() {
    const formData = new FormData(document.getElementById('actor-form'));
    const data = {};
    for (const [key, value] of formData.entries()) {
        data[key] = value;
    }
    return data;
}

function initializeTooltips() {
    // Add tooltips to interactive elements
    const tooltipElements = document.querySelectorAll('[title]');
    tooltipElements.forEach(element => {
        element.addEventListener('mouseenter', showTooltip);
        element.addEventListener('mouseleave', hideTooltip);
    });
}

function showTooltip(e) {
    // Tooltip implementation
}

function hideTooltip(e) {
    // Hide tooltip implementation
}

// Performance monitoring
function trackPerformance(action, startTime) {
    const endTime = performance.now();
    const duration = endTime - startTime;
    console.log(`⚡ ${action} completed in ${duration.toFixed(2)}ms`);
}

// Add CSS animations for enhanced effects
const additionalCSS = `
@keyframes shake {
    0%, 100% { transform: translateX(0); }
    25% { transform: translateX(-5px); }
    75% { transform: translateX(5px); }
}

@keyframes particleFloat {
    0% { 
        opacity: 1; 
        transform: translateY(0) scale(1); 
    }
    100% { 
        opacity: 0; 
        transform: translateY(-100px) scale(0); 
    }
}

@keyframes slideOutRight {
    from {
        transform: translateX(0);
        opacity: 1;
    }
    to {
        transform: translateX(100%);
        opacity: 0;
    }
}

@keyframes fadeInUp {
    from {
        opacity: 0;
        transform: translateY(20px);
    }
    to {
        opacity: 1;
        transform: translateY(0);
    }
}
`;

// Inject additional CSS
const styleSheet = document.createElement('style');
styleSheet.textContent = additionalCSS;
document.head.appendChild(styleSheet);