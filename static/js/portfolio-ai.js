/**
 * Portfolio AI Assistant - Navbar Integration
 * Handles modal, messages, API calls to Portfolio AI
 */

(function() {
    'use strict';

    // DOM Elements
    const toggleBtn = document.getElementById('portfolio-ai-toggle');
    const modal = document.getElementById('portfolio-ai-modal');
    const backdrop = document.getElementById('ai-modal-backdrop');
    const closeBtn = document.getElementById('ai-modal-close');
    const clearBtn = document.getElementById('ai-clear-chat');
    const input = document.getElementById('ai-question-input');
    const sendBtn = document.getElementById('ai-send-btn');
    const messagesContainer = document.getElementById('ai-messages');
    const modalBody = document.querySelector('.ai-modal-body');

    // State
    let conversationHistory = [];

    /**
     * Initialize Portfolio AI
     */
    function init() {
        if (!toggleBtn || !modal) {
            console.warn('Portfolio AI elements not found');
            return;
        }

        // Event listeners
        toggleBtn.addEventListener('click', openModal);
        closeBtn.addEventListener('click', closeModal);
        clearBtn.addEventListener('click', clearChat);
        backdrop.addEventListener('click', closeModal);
        sendBtn.addEventListener('click', sendMessage);
        input.addEventListener('keypress', (e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                sendMessage();
            }
        });

        // ESC to close
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && !modal.classList.contains('hidden')) {
                closeModal();
            }
        });

        // Load conversation history from session
        loadHistory();
    }

    /**
     * Open modal
     */
    function openModal() {
        modal.classList.remove('hidden');
        backdrop.classList.remove('hidden');
        input.focus();

        // Show welcome if first time
        if (conversationHistory.length === 0) {
            addMessage('assistant', 'Hi! Ask me about Jack\'s projects, technologies, or how things work. Try: "How does the Wordle algorithm work?" or "What technologies power the Lyric Animator?"');
        }
    }

    /**
     * Close modal
     */
    function closeModal() {
        modal.classList.add('hidden');
        backdrop.classList.add('hidden');
    }

    /**
     * Clear chat conversation
     */
    function clearChat() {
        if (confirm('Clear conversation history?')) {
            // Clear conversation history
            conversationHistory = [];

            // Clear UI
            messagesContainer.innerHTML = '';

            // Clear session storage
            sessionStorage.removeItem('portfolio_ai_history');

            // Show welcome message
            addMessage('assistant', 'Hi! Ask me about Jack\'s projects, technologies, or how things work. Try: "How does the Wordle algorithm work?" or "What technologies power the Lyric Animator?"');

            console.log('Portfolio AI: Conversation cleared');
        }
    }

    /**
     * Send message to Portfolio AI
     */
    async function sendMessage() {
        const question = input.value.trim();
        if (!question) return;

        // Add user message to UI
        addMessage('user', question);
        input.value = '';

        // Show loading
        setLoading(true);

        try {
            const response = await fetch('/ask_portfolio_ai', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ question })
            });

            const data = await response.json();

            if (response.ok && data.answer) {
                addMessage('assistant', data.answer);
            } else {
                addMessage('assistant', 'Sorry, I encountered an error. Please try again.');
            }
        } catch (error) {
            console.error('Portfolio AI error:', error);
            addMessage('assistant', 'Sorry, I couldn\'t process your question. Please try again.');
        } finally {
            setLoading(false);
        }
    }

    /**
     * Add message to conversation
     */
    function addMessage(role, content) {
        const message = { role, content, timestamp: Date.now() };
        conversationHistory.push(message);

        // Add to UI
        const messageEl = document.createElement('div');
        messageEl.className = `ai-message ${role}`;
        messageEl.textContent = content;
        messagesContainer.appendChild(messageEl);

        // Scroll to bottom (scroll the modal body, not the messages container)
        if (modalBody) {
            setTimeout(() => {
                modalBody.scrollTop = modalBody.scrollHeight;
            }, 100);
        }

        // Save to session storage
        saveHistory();
    }

    /**
     * Set loading state
     */
    function setLoading(loading) {
        sendBtn.disabled = loading;
        sendBtn.classList.toggle('loading', loading);
        input.disabled = loading;
    }

    /**
     * Save conversation history
     */
    function saveHistory() {
        try {
            sessionStorage.setItem('portfolio_ai_history', JSON.stringify(conversationHistory));
        } catch (e) {
            console.warn('Could not save conversation history');
        }
    }

    /**
     * Load conversation history
     */
    function loadHistory() {
        try {
            const saved = sessionStorage.getItem('portfolio_ai_history');
            if (saved) {
                conversationHistory = JSON.parse(saved);
                conversationHistory.forEach(msg => {
                    const messageEl = document.createElement('div');
                    messageEl.className = `ai-message ${msg.role}`;
                    messageEl.textContent = msg.content;
                    messagesContainer.appendChild(messageEl);
                });
            }
        } catch (e) {
            console.warn('Could not load conversation history');
        }
    }

    // Initialize on DOM ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }

})();
