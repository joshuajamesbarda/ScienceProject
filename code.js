document.addEventListener('DOMContentLoaded', () => {
    const cards = document.querySelectorAll('.game-card');

    // Add a simple "hover sound" or logging effect
    cards.forEach(card => {
        card.addEventListener('mouseenter', () => {
            console.log("Ready to play: " + card.querySelector('h2').innerText);
        });

        // Optional: Adding a click feedback
        card.addEventListener('click', () => {
            card.style.transform = "scale(0.9)";
        });
    });
});