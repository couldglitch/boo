// script.js

// This function can be used to handle any client-side logic
function displayUsername() {
    const username = document.getElementById('username');
    if (username) {
        username.textContent = localStorage.getItem('username') || 'Guest';
    }
}

// Call the function to display the username when the dashboard loads
document.addEventListener('DOMContentLoaded', displayUsername);


function copyKey() {
    const keyCopy = document.getElementById('key-copy').innerText;
    const key = keyCopy.split(': ')[1]; // Extract the key part
    navigator.clipboard.writeText(key).then(() => {
        alert('Key copied to clipboard: ' + key);
    }).catch(err => {
        console.error('Failed to copy: ', err);
    });
}

const mobileMenu = document.getElementById('mobile-menu');
const nav = document.querySelector('nav');

mobileMenu.addEventListener('click', () => {
    nav.classList.toggle('active');
});