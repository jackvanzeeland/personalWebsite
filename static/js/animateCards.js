const cards = document.querySelectorAll('.card');

const observer = new IntersectionObserver(entries => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.classList.add('visible');
            observer.unobserve(entry.target); // Only animate once
        }
    });
}, {
    threshold: 0.2 // Trigger when 10% of the card is visible
});

cards.forEach(card => observer.observe(card));