document.addEventListener('DOMContentLoaded', () => {

    // --- ⚠️ CONFIGURATION ⚠️ ---
    // 1. Deploy your backend and put the URL here
    const BASE_URL = "https://qr-h6dd.onrender.com/api";

    // 2. Deploy your frontend to GitHub Pages and put the URL here
    //    (e.g., https://your-username.github.io/qr-user-details)
    const FRONTEND_URL = "https://krishpatel3085.github.io/QR";
    // ------------------------------


    // Check if we are on the main page (index.html)
    const userForm = document.getElementById('user-form');
    if (userForm) {
        const userListContainer = document.getElementById('user-list-container');

        // Load all existing users when the page loads
        loadUsers();

        // Handle form submission
        userForm.addEventListener('submit', handleFormSubmit);

        async function handleFormSubmit(e) {
            e.preventDefault();

            const email = document.getElementById('email').value;
            const username = document.getElementById('username').value;
            const mobile = document.getElementById('mobile').value;

            try {
                const response = await fetch(`${BASE_URL}/users`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ email, username, mobile })
                });

                if (!response.ok) {
                    throw new Error('Network response was not ok');
                }

                const newUser = await response.json();

                // Add new user to the list without reloading the whole page
                displayUserInList(newUser);

                // Clear the form
                userForm.reset();

            } catch (error) {
                console.error('Error creating user:', error);
                alert('Failed to create user. Please check the console.');
            }
        }

        async function loadUsers() {
            try {
                const response = await fetch(`${BASE_URL}/users`);
                if (!response.ok) {
                    throw new Error('Network response was not ok');
                }
                const users = await response.json();

                userListContainer.innerHTML = ''; // Clear existing list
                if (users.length === 0) {
                    userListContainer.innerHTML = '<p>No users found. Add one above!</p>';
                } else {
                    users.forEach(displayUserInList);
                }
            } catch (error) {
                console.error('Error loading users:', error);
                userListContainer.innerHTML = '<p>Error loading users. Is the backend running?</p>';
            }
        }

        function displayUserInList(user) {
            const card = document.createElement('div');
            card.className = 'user-card';

            const detailLink = `${FRONTEND_URL}/details.html?id=${user._id}`;

            card.innerHTML = `
                <h3>${user.username}</h3>
                <p>${user.email}</p>
                <div class="qr-code" id="qr-${user._id}"></div>
                <small>Scan to view details</small>
            `;

            userListContainer.appendChild(card);

            // Generate the QR Code
            new QRCode(document.getElementById(`qr-${user._id}`), {
                text: detailLink,
                width: 150,
                height: 150
            });
        }
    }

    // Check if we are on the details page (details.html)
    const detailsCardContainer = document.getElementById('details-card-container');
    if (detailsCardContainer) {
        loadUserDetails();

        async function loadUserDetails() {
            try {
                // Get the user ID from the URL (e.g., ?id=12345)
                const params = new URLSearchParams(window.location.search);
                const userId = params.get('id');

                if (!userId) {
                    detailsCardContainer.innerHTML = '<h2>Error</h2><p>No user ID provided.</p>';
                    return;
                }

                const response = await fetch(`${BASE_URL}/users/${userId}`);
                if (!response.ok) {
                    throw new Error('User not found');
                }

                const user = await response.json();

                // Display the user details
                detailsCardContainer.innerHTML = `
                    <h2>${user.username}</h2>
                    <p><strong>Email:</strong> ${user.email}</p>
                    <p><strong>Mobile:</strong> ${user.mobile}</p>
                `;

            } catch (error) {
                console.error('Error fetching details:', error);
                detailsCardContainer.innerHTML = '<h2>Error</h2><p>Could not find user details.</p>';
            }
        }
    }
});