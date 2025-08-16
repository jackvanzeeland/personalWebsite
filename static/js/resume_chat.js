
document.addEventListener('DOMContentLoaded', () => {
    const chatBox = document.getElementById('chat-box');
    const chatInput = document.getElementById('chat-input');
    const sendBtn = document.getElementById('send-btn');

    const sendMessage = async () => {
        const question = chatInput.value.trim();
        if (question === '') return;

        // Display user message
        appendMessage(question, 'user');
        chatInput.value = '';

        // Show thinking indicator
        const thinkingMessage = appendMessage('Thinking...', 'bot', true);

        try {
            const response = await fetch('/ask_openai_assistant', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ question: question }),
            });

            if (!response.ok) {
                throw new Error('Network response was not ok');
            }

            const data = await response.json();
            // Replace thinking message with actual answer
            console.log(data);
            thinkingMessage.querySelector('p').innerHTML = data.answer.replace(/\n/g, '<br>');
            thinkingMessage.classList.remove('thinking');

        } catch (error) {
            console.error('Error fetching response:', error);
            thinkingMessage.querySelector('p').textContent = 'Sorry, something went wrong. Please try again later.';
            thinkingMessage.classList.remove('thinking');
        }
    };

    const appendMessage = (text, sender, isThinking = false) => {
        const messageDiv = document.createElement('div');
        messageDiv.classList.add('chat-message', `${sender}-message`);
        if (isThinking) {
            messageDiv.classList.add('thinking');
        }
        
        const p = document.createElement('p');
        p.textContent = text;
        messageDiv.appendChild(p);
        chatBox.appendChild(messageDiv);

        // Scroll to the bottom
        chatBox.scrollTop = chatBox.scrollHeight;
        return messageDiv;
    };

    sendBtn.addEventListener('click', sendMessage);
    chatInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            sendMessage();
        }
    });
});
