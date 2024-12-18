 // DOM Elements
const chatContainer = document.getElementById('chat-container');
const messageInput = document.getElementById('message-input');
const sendButton = document.getElementById('send-button');
const modelSelect = document.getElementById('model-select');
const temperatureInput = document.getElementById('temperature');
const temperatureValue = document.getElementById('temperature-value');
let isLoading = false;

// Load Models
async function loadModels() {
    try {
        const response = await fetch('http://localhost:5000/models');
        const models = await response.json();
        
        for (const [key, desc] of Object.entries(models)) {
            const option = document.createElement('option');
            option.value = key;
            option.textContent = desc;
            modelSelect.appendChild(option);
        }
    } catch (error) {
        console.error('שגיאה בטעינת המודלים:', error);
    }
}

// Event Listeners
document.addEventListener('DOMContentLoaded', loadModels);

temperatureInput.addEventListener('input', (e) => {
    temperatureValue.textContent = e.target.value;
});

messageInput.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) {
        sendMessage();
    }
});

// Message Functions
function escapeHtml(unsafe) {
    return unsafe
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
}

function formatMessage(content) {
    if (!content) return '';
    
    try {
        if (typeof content === 'string' && content.startsWith('{')) {
            const jsonContent = JSON.parse(content);
            if (jsonContent.response) {
                content = jsonContent.response;
            }
        }
    } catch (e) {
        console.error('Error parsing JSON:', e);
    }

    const paragraphs = content.split('\n\n');
    let formattedContent = '';
    let isInCodeBlock = false;
    let currentCodeBlock = '';
    let currentLanguage = '';

    for (let paragraph of paragraphs) {
        paragraph = paragraph.trim();
        if (!paragraph) continue;

        if (paragraph.includes('```') && !isInCodeBlock) {
            const match = paragraph.match(/```(\w+)?/);
            if (match) {
                isInCodeBlock = true;
                currentLanguage = match[1] || 'code';
                currentCodeBlock = paragraph.replace(/```(\w+)?/, '').trim();
                continue;
            }
        }

        if (isInCodeBlock && paragraph.includes('```')) {
            currentCodeBlock += '\n' + paragraph.replace(/```/, '').trim();
            formattedContent += `
                <div class="code-container">
                    <div class="code-header">
                        <span class="language-label">${currentLanguage}</span>
                        <button class="copy-btn" onclick="copyCode(this)">העתק</button>
                    </div>
                    <pre class="code-content"><code>${currentCodeBlock}</code></pre>
                </div>`;
            isInCodeBlock = false;
            currentCodeBlock = '';
            currentLanguage = '';
            continue;
        }

        if (isInCodeBlock) {
            currentCodeBlock += '\n' + paragraph;
            continue;
        }

        formattedContent += `<div class="explanation-text">${paragraph}</div>`;
    }

    return formattedContent;
}

function createLoadingIndicator() {
    const loadingContainer = document.createElement('div');
    loadingContainer.className = 'loading-container';
    
    const textDiv = document.createElement('div');
    textDiv.className = 'loading-text';
    textDiv.textContent = 'מעבד את השאלה שלך...';
    
    const dotsContainer = document.createElement('div');
    dotsContainer.className = 'loading-dots';
    
    for (let i = 0; i < 3; i++) {
        const dot = document.createElement('div');
        dot.className = 'dot';
        dotsContainer.appendChild(dot);
    }
    
    loadingContainer.appendChild(textDiv);
    loadingContainer.appendChild(dotsContainer);
    return loadingContainer;
}

function addMessage(content, type) {
    const messageDiv = document.createElement('div');
    messageDiv.className = `message ${type}-message`;
    messageDiv.innerHTML = formatMessage(content);
    chatContainer.appendChild(messageDiv);
    chatContainer.scrollTop = chatContainer.scrollHeight;
}

// API Functions
async function sendMessage() {
    const message = messageInput.value.trim();
    if (!message || isLoading) return;

    isLoading = true;
    sendButton.disabled = true;
    messageInput.disabled = true;
    
    addMessage(message, 'user');
    messageInput.value = '';
    
    const loadingIndicator = createLoadingIndicator();
    chatContainer.appendChild(loadingIndicator);
    chatContainer.scrollTop = chatContainer.scrollHeight;

    try {
        const response = await fetch('http://localhost:5000/send', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ 
                message,
                model: modelSelect.value,
                temperature: parseFloat(temperatureInput.value)
            })
        });

        const data = await response.json();
        loadingIndicator.remove();
        
        if (data.response) {
            addMessage(data.response, 'assistant');
        }
    } catch (error) {
        console.error('Error:', error);
        loadingIndicator.remove();
        addMessage('שגיאה בתקשורת עם השרת', 'assistant');
    } finally {
        isLoading = false;
        sendButton.disabled = false;
        messageInput.disabled = false;
        messageInput.focus();
    }
}

async function clearChat() {
    try {
        await fetch('http://localhost:5000/clear', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ 
                model: modelSelect.value 
            })
        });
        chatContainer.innerHTML = '';
    } catch (error) {
        console.error('Error:', error);
    }
}

// Utility Functions
function copyCode(button) {
    const codeBlock = button.closest('.code-container');
    const codeElement = codeBlock.querySelector('code');
    const text = codeElement.textContent;
    
    navigator.clipboard.writeText(text).then(() => {
        const originalText = button.textContent;
        button.textContent = 'הועתק!';
        setTimeout(() => {
            button.textContent = originalText;
        }, 2000);
    });
}