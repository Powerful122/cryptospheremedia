// Initialize Icons
lucide.createIcons();

// Mobile Menu Toggle
const btn = document.getElementById('mobile-menu-btn');
const menu = document.getElementById('mobile-menu');

btn.addEventListener('click', () => {
    menu.classList.toggle('hidden');
});

// Modal Logic
function openModal(modalId) {
    document.getElementById(modalId).classList.remove('hidden');
    document.body.style.overflow = 'hidden'; // Prevent scrolling background
}

function closeModal(modalId) {
    document.getElementById(modalId).classList.add('hidden');
    document.body.style.overflow = 'auto'; // Restore scrolling
}

// Close modal on Escape key
document.addEventListener('keydown', (event) => {
    if (event.key === "Escape") {
        closeModal('privacyModal');
    }
});
