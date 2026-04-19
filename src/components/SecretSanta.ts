// Secret Santa matching functionality
export class SecretSanta {
    private names: string[] = [];
    private matches: Map<string, string> = new Map();

    constructor() {
        this.setupEventListeners();
    }

    private setupEventListeners(): void {
        const addNameBtn = document.getElementById('add-name') as HTMLButtonElement;
        const nameInput = document.getElementById('name-input') as HTMLInputElement;
        const nameList = document.getElementById('name-list');
        const matchBtn = document.getElementById('generate-matches') as HTMLButtonElement;
        const clearBtn = document.getElementById('clear-all') as HTMLButtonElement;

        if (addNameBtn && nameInput) {
            addNameBtn.addEventListener('click', () => this.addName(nameInput, nameList));
            nameInput.addEventListener('keypress', (e) => {
                if (e.key === 'Enter') {
                    this.addName(nameInput, nameList);
                }
            });
        }

        if (matchBtn) {
            matchBtn.addEventListener('click', () => this.generateMatches());
        }

        if (clearBtn) {
            clearBtn.addEventListener('click', () => this.clearAll());
        }
    }

    private addName(input: HTMLInputElement, list: HTMLElement | null): void {
        if (!input.value.trim() || !list) return;

        const name = input.value.trim();

        // Check for duplicates
        if (this.names.some(n => n.toLowerCase() === name.toLowerCase())) {
            this.showMessage(`${name} is already in the list!`, 'warning');
            return;
        }

        this.names.push(name);
        const pill = document.createElement('span');
        pill.className = 'santa-name-pill';
        pill.innerHTML = `
            ${name}
            <button class="remove-name" aria-label="Remove ${name}">&times;</button>
        `;

        const removeBtn = pill.querySelector('.remove-name');
        if (removeBtn) {
            removeBtn.addEventListener('click', () => {
                this.names = this.names.filter(n => n !== name);
                pill.remove();
                this.updateMatchButton();
            });
        }

        list.appendChild(pill);
        input.value = '';
        input.focus();
        this.updateMatchButton();
    }

    private generateMatches(): void {
        if (this.names.length < 2) {
            this.showMessage('Need at least 2 people to generate matches!', 'warning');
            return;
        }

        // Use the original algorithm logic
        const givers = [...this.names];
        const receivers = [...this.names];

        // Shuffle both lists
        for (let i = givers.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [givers[i], givers[j]] = [givers[j], givers[i]];
        }

        for (let i = receivers.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [receivers[i], receivers[j]] = [receivers[j], receivers[i]];
        }

        // Ensure no one gives to themselves
        for (let i = 0; i < givers.length; i++) {
            if (givers[i] === receivers[i]) {
                if (i === receivers.length - 1) {
                    [receivers[i], receivers[0]] = [receivers[0], receivers[i]];
                } else {
                    [receivers[i], receivers[i + 1]] = [receivers[i + 1], receivers[i]];
                }
            }
        }

        // Create matches map
        this.matches.clear();
        for (let i = 0; i < givers.length; i++) {
            this.matches.set(givers[i], receivers[i]);
        }

        this.displayMatches();
    }

    private displayMatches(): void {
        const resultsDiv = document.getElementById('santa-results');
        if (!resultsDiv) return;

        resultsDiv.innerHTML = `
            <div class="matches-container">
                <h4>Secret Santa Matches</h4>
                <p class="santa-match-count">${this.matches.size} matches generated</p>
                <div class="matches-grid">
                    ${Array.from(this.matches.entries()).map(([giver, receiver]) => `
                        <div class="match-card">
                            <div class="match-giver">
                                <span class="label">Giver</span>
                                <span class="name giver-name">${giver}</span>
                            </div>
                            <div class="match-arrow">&rarr;</div>
                            <div class="match-receiver">
                                <span class="label">Receiver</span>
                                <span class="name receiver-name">${receiver}</span>
                            </div>
                        </div>
                    `).join('')}
                </div>
            </div>
        `;

        this.addRevealFunctionality();
    }

    private addRevealFunctionality(): void {
        const matchCards = document.querySelectorAll('.match-card');

        matchCards.forEach((card) => {
            const giverSpan = card.querySelector('.giver-name');
            const receiverSpan = card.querySelector('.receiver-name');

            if (giverSpan && receiverSpan) {
                const giverName = giverSpan.textContent || '';
                const receiver = this.matches.get(giverName) || 'Unknown';

                // Initially hide receiver
                receiverSpan.textContent = '???';
                receiverSpan.classList.add('hidden');

                // Add reveal/hide toggle button
                const revealBtn = document.createElement('button');
                revealBtn.className = 'reveal-btn';
                revealBtn.textContent = 'Reveal';
                let isRevealed = false;
                revealBtn.addEventListener('click', () => {
                    if (isRevealed) {
                        receiverSpan.textContent = '???';
                        receiverSpan.classList.remove('revealed');
                        receiverSpan.classList.add('hidden');
                        revealBtn.textContent = 'Reveal';
                        revealBtn.classList.remove('reveal-btn--hide');
                    } else {
                        receiverSpan.textContent = receiver;
                        receiverSpan.classList.remove('hidden');
                        receiverSpan.classList.add('revealed');
                        revealBtn.textContent = 'Hide';
                        revealBtn.classList.add('reveal-btn--hide');
                    }
                    isRevealed = !isRevealed;
                });

                card.appendChild(revealBtn);
            }
        });
    }

    private clearAll(): void {
        this.names = [];
        this.matches.clear();

        const nameList = document.getElementById('name-list');
        const resultsDiv = document.getElementById('santa-results');

        if (nameList) nameList.innerHTML = '';
        if (resultsDiv) resultsDiv.innerHTML = '';

        this.updateMatchButton();
        this.showMessage('All cleared!', 'info');
    }

    private updateMatchButton(): void {
        const matchBtn = document.getElementById('generate-matches') as HTMLButtonElement;
        if (matchBtn) {
            matchBtn.disabled = this.names.length < 2;
        }
    }

    private showMessage(message: string, type: 'info' | 'warning' | 'success'): void {
        const toast = document.createElement('div');
        toast.className = `santa-toast santa-toast--${type}`;
        toast.textContent = message;

        const container = document.querySelector('.santa-demo-container');
        if (container) {
            // Insert after the heading
            const heading = container.querySelector('.santa-demo-heading');
            if (heading && heading.nextSibling) {
                container.insertBefore(toast, heading.nextSibling);
            } else {
                container.prepend(toast);
            }

            setTimeout(() => {
                toast.remove();
            }, 3000);
        }
    }
}
