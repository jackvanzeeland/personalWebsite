// Wordle solver interactive demo
// Loads precomputed guess sequences and remaining-word counts,
// then renders colored Wordle tiles for any word the user looks up.

type TileColor = 'correct' | 'present' | 'absent';

export class WordleSolver {
    private guessData: Record<string, string> | null = null;
    private remainingData: Record<string, Record<string, number>> | null = null;
    private searchBtn: HTMLButtonElement | null = null;
    private input: HTMLInputElement | null = null;
    private errorEl: HTMLElement | null = null;
    private resultsEl: HTMLElement | null = null;
    private dataLoaded = false;

    constructor() {
        this.searchBtn = document.getElementById('wordle-search') as HTMLButtonElement;
        this.input = document.getElementById('wordle-lookup') as HTMLInputElement;
        this.errorEl = document.getElementById('wordle-error');
        this.resultsEl = document.getElementById('wordle-results');

        if (this.searchBtn) this.searchBtn.disabled = true;
        this.loadData();
        this.setupListeners();
    }

    private async loadData(): Promise<void> {
        try {
            const [guessRes, remainRes] = await Promise.all([
                fetch('/assets/files/wordleGuesses.json'),
                fetch('/assets/files/wordleRemaining.json')
            ]);
            if (!guessRes.ok || !remainRes.ok) throw new Error('Fetch failed');
            this.guessData = await guessRes.json();
            this.remainingData = await remainRes.json();
            this.dataLoaded = true;
            if (this.searchBtn) this.searchBtn.disabled = false;
        } catch (err) {
            console.error('Failed to load Wordle data:', err);
            this.showError('Failed to load solver data. Please refresh and try again.');
        }
    }

    private setupListeners(): void {
        if (this.searchBtn) {
            this.searchBtn.addEventListener('click', () => this.solve());
        }
        if (this.input) {
            this.input.addEventListener('keydown', (e) => {
                if (e.key === 'Enter') this.solve();
            });
            // Strip non-alpha on input
            this.input.addEventListener('input', () => {
                if (!this.input) return;
                this.input.value = this.input.value.replace(/[^a-zA-Z]/g, '').slice(0, 5);
            });
        }
    }

    private solve(): void {
        if (!this.input || !this.dataLoaded) return;
        this.hideError();

        const word = this.input.value.toLowerCase().trim();
        if (word.length !== 5 || !/^[a-z]{5}$/.test(word)) {
            this.showError('Please enter exactly 5 letters.');
            return;
        }

        if (!this.guessData || !this.remainingData || !(word in this.guessData)) {
            this.showError('Word not found in our dataset. Try another 5-letter word.');
            return;
        }

        const guesses = this.guessData[word].split(',');
        const remaining = this.remainingData[word];
        this.renderResults(guesses, remaining, word);
    }

    /**
     * Two-pass Wordle color algorithm that correctly handles duplicate letters.
     * Pass 1: mark greens (exact matches), consuming those target letters.
     * Pass 2: mark yellows (present but wrong position), consuming on match.
     * Everything else is gray/absent.
     */
    private computeTileColors(guess: string, target: string): TileColor[] {
        const colors: TileColor[] = Array(5).fill('absent');
        const targetLetters = target.split('');

        // Pass 1 — greens
        for (let i = 0; i < 5; i++) {
            if (guess[i] === target[i]) {
                colors[i] = 'correct';
                targetLetters[i] = '';  // consume
            }
        }

        // Pass 2 — yellows
        for (let i = 0; i < 5; i++) {
            if (colors[i] === 'correct') continue;
            const idx = targetLetters.indexOf(guess[i]);
            if (idx !== -1) {
                colors[i] = 'present';
                targetLetters[idx] = '';  // consume
            }
        }

        return colors;
    }

    private renderResults(guesses: string[], remaining: Record<string, number>, target: string): void {
        if (!this.resultsEl) return;
        this.resultsEl.innerHTML = '';

        guesses.forEach((guess, i) => {
            const colors = this.computeTileColors(guess, target);
            const before = remaining[String(i)] ?? 0;
            const after = remaining[String(i + 1)] ?? 0;

            const row = document.createElement('div');
            row.className = 'wordle-guess-row';
            row.style.animationDelay = `${i * 0.12}s`;

            // Step label
            const label = document.createElement('span');
            label.className = 'wordle-step-label';
            label.textContent = `Guess ${i + 1}`;

            // Tiles
            const tilesContainer = document.createElement('div');
            tilesContainer.className = 'wordle-tiles';
            for (let j = 0; j < 5; j++) {
                const tile = document.createElement('span');
                tile.className = `wordle-tile wordle-tile--${colors[j]}`;
                tile.textContent = guess[j].toUpperCase();
                tilesContainer.appendChild(tile);
            }

            // Remaining count
            const remainingEl = document.createElement('span');
            remainingEl.className = 'wordle-remaining';
            remainingEl.innerHTML = `${before.toLocaleString()} &rarr; ${after.toLocaleString()}`;

            row.appendChild(label);
            row.appendChild(tilesContainer);
            row.appendChild(remainingEl);
            this.resultsEl!.appendChild(row);
        });
    }

    private showError(msg: string): void {
        if (!this.errorEl) return;
        this.errorEl.textContent = msg;
        this.errorEl.style.display = 'block';
        if (this.resultsEl) this.resultsEl.innerHTML = '';
    }

    private hideError(): void {
        if (this.errorEl) {
            this.errorEl.style.display = 'none';
            this.errorEl.textContent = '';
        }
    }
}
