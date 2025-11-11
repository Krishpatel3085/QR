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
























    document.addEventListener('DOMContentLoaded', () => {

    // --- ⚠️ CONFIGURATION ⚠️ ---
    // 1. Deploy your backend and put the URL here
    const BASE_URL = "https://qr-h6dd.onrender.com/api";

    // 2. Deploy your frontend to GitHub Pages and put the URL here
    //    (e.g., https://your-username.github.io/qr-user-details)
    const FRONTEND_URL = "https://krishpatel3085.github.io/QR";
    // ------------------------------


    // --- Check if we are on the main page (index.html) ---
    const userForm = document.getElementById('user-form');
    if (userForm) {
        const userListContainer = document.getElementById('user-list-container');
        const generateBtn = document.getElementById('generate-btn');

        // Modal elements
        const modalOverlay = document.getElementById('modal-overlay');
        const modalQrCode = document.getElementById('modal-qr-code');
        const modalCloseBtn = document.getElementById('modal-close-btn');

        // Load all existing users when the page loads
        loadUsers();

        // Handle form submission
        userForm.addEventListener('submit', handleFormSubmit);

        async function handleFormSubmit(e) {
            e.preventDefault();
            generateBtn.disabled = true;
            generateBtn.textContent = 'Generating...';

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

                // --- 🌟 NEW v2 FLOW 🌟 ---
                // 1. Generate the link
                const detailLink = `${FRONTEND_URL}/details.html?id=${newUser._id}`;

                // 2. Open the modal and pass the user data
                openModalWithQR(detailLink, newUser);

            } catch (error) {
                console.error('Error creating user:', error);
                alert('Failed to create user. Please check the console.');
            } finally {
                generateBtn.disabled = false;
                generateBtn.textContent = 'Generate QR';
            }
        }

        function openModalWithQR(link, user) {
            // 1. Clear any old QR code
            modalQrCode.innerHTML = '';

            // 2. Generate new QR code inside the modal
            new QRCode(modalQrCode, {
                text: link,
                width: 200,
                height: 200
            });

            // 3. Show the modal
            modalOverlay.classList.add('show');

            // 4. Set up the close button listener
            //    We use .onclick to overwrite any previous listener
            modalCloseBtn.onclick = () => {
                closeModal();

                // 5. AFTER closing, add user to list and reset form
                displayUserInList(user);
                userForm.reset();
            };
        }

        function closeModal() {
            modalOverlay.classList.remove('show');
        }

        async function loadUsers() {
            try {
                const response = await fetch(`${BASE_URL}/users`);
                if (!response.ok) throw new Error('Network response was not ok');

                const users = await response.json();

                userListContainer.innerHTML = ''; // Clear existing list
                if (users.length === 0) {
                    userListContainer.innerHTML = '<p>No tickets generated yet.</p>';
                } else {
                    users.forEach(displayUserInList);
                }
            } catch (error) {
                console.error('Error loading users:', error);
                userListContainer.innerHTML = '<p>Error loading users. Is the backend running?</p>';
            }
        }

        // 🌟 UPDATED: Function to display user as a "Ticket Card"
        function displayUserInList(user) {
            const detailLink = `${FRONTEND_URL}/details.html?id=${user._id}`;

            // Use an <a> tag to make the whole card clickable
            const card = document.createElement('a');
            card.href = detailLink;
            card.className = 'ticket-card';
            card.target = "_blank"; // Open in new tab

            // Create a short "Booking ID" style from the MongoDB ID
            const shortId = user._id.substring(user._id.length - 6).toUpperCase();

            card.innerHTML = `
                <div class="ticket-qr" id="qr-thumb-${user._id}"></div>
                <div class="ticket-info">
                    <h3>${user.username}</h3>
                    <p>${user.email}</p>
                    <p>${user.mobile}</p>
                    <p class="user-id">ID: ${shortId}</p>
                </div>
            `;

            // Prepend new card to the top of the list
            userListContainer.prepend(card);

            // Generate the small thumbnail QR Code
            new QRCode(document.getElementById(`qr-thumb-${user._id}`), {
                text: detailLink,
                width: 80,
                height: 80,
                correctLevel: QRCode.CorrectLevel.L // Use lower correction for density
            });
        }
    }

    // --- Check if we are on the details page (details.html) ---
    const detailsCardContainer = document.getElementById('details-card-container');
    if (detailsCardContainer) {
        loadUserDetails();

        async function loadUserDetails() {
            try {
                const params = new URLSearchParams(window.location.search);
                const userId = params.get('id');

                if (!userId) {
                    detailsCardContainer.innerHTML = '<h2>Error</h2><p>No user ID provided.</p>';
                    return;
                }

                const response = await fetch(`${BASE_URL}/users/${userId}`);
                if (!response.ok) throw new Error('User not found');

                const user = await response.json();
                const detailLink = `${FRONTEND_URL}/details.html?id=${user._id}`;
                const shortId = user._id.substring(user._id.length - 6).toUpperCase();

                // 🌟 UPDATED: Render the "Large Ticket" style
                detailsCardContainer.innerHTML = `
                    <div class="ticket-card-large">
                        <h2>${user.username}</h2>
                        <div id="details-qr"></div>
                        <p><strong>Email:</strong> ${user.email}</p>
                        <p><strong>Mobile:</strong> ${user.mobile}</p>
                        <p class="user-id">Booking ID: ${shortId}</p>
                    </div>
                `;

                // Generate the large QR code for the details page
                new QRCode(document.getElementById('details-qr'), {
                    text: detailLink,
                    width: 250,
                    height: 250
                });

            } catch (error) {
                console.error('Error fetching details:', error);
                detailsCardContainer.innerHTML = '<h2>Error</h2><p>Could not find user details.</p>';
            }
        }
    }
});