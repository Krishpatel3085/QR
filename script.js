document.addEventListener('DOMContentLoaded', () => {

    // --- ⚠️ CONFIGURATION ⚠️ ---
    const BASE_URL = "https://qr-h6dd.onrender.com/api"; 
    const FRONTEND_URL = "https://krishpatel3085.github.io/QR"; 
    // ------------------------------

    // --- NEW: A helper function to check for valid MongoDB IDs ---
    // A valid ID is 24 characters long and only contains 0-9 or a-f.
    const isValidMongoId = (id) => {
        const mongoIdRegex = /^[0-9a-fA-F]{24}$/;
        return id && mongoIdRegex.test(id);
    };


    // --- Check if we are on the main page (index.html) ---
    const userForm = document.getElementById('user-form');
    if (userForm) {
        const userListContainer = document.getElementById('user-list-container');
        const generateBtn = document.getElementById('generate-btn');
        const modalOverlay = document.getElementById('modal-overlay');
        const modalQrCode = document.getElementById('modal-qr-code');
        const modalCloseBtn = document.getElementById('modal-close-btn');

        loadUsers();
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
                
                // --- NEW VALIDATION ---
                // Check if the server returned a valid user object with a valid ID
                if (!newUser || !isValidMongoId(newUser._id)) {
                    throw new Error('Server returned an invalid user object.');
                }
                
                const detailLink = `${FRONTEND_URL}/details.html?id=${newUser._id}`;
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
            modalQrCode.innerHTML = '';
            new QRCode(modalQrCode, {
                text: link,
                width: 200,
                height: 200
            });
            modalOverlay.classList.add('show');
            
            modalCloseBtn.onclick = () => {
                modalOverlay.classList.remove('show');
                displayUserInList(user); // Add user to list *after* closing
                userForm.reset();
            };
        }

        async function loadUsers() {
            try {
                const response = await fetch(`${BASE_URL}/users`);
                if (!response.ok) throw new Error('Network response was not ok');
                
                const users = await response.json();
                userListContainer.innerHTML = ''; 
                
                const validUsers = users.filter(user => isValidMongoId(user._id));
                
                if (validUsers.length === 0) {
                    userListContainer.innerHTML = '<p>No valid tickets found.</p>';
                } else {
                    validUsers.forEach(displayUserInList);
                }
            } catch (error) {
                console.error('Error loading users:', error);
                userListContainer.innerHTML = '<p>Error loading users.</p>';
            }
        }

        function displayUserInList(user) {
            // --- NEW VALIDATION ---
            // Double-check: Do not display a card if the ID is invalid.
            if (!isValidMongoId(user._id)) {
                console.warn('Skipping user with invalid ID:', user);
                return; 
            }

            const detailLink = `${FRONTEND_URL}/details.html?id=${user._id}`;
            const card = document.createElement('a');
            card.href = detailLink;
            card.className = 'ticket-card';
            card.target = "_blank"; 
            
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
            
            userListContainer.prepend(card);

            new QRCode(document.getElementById(`qr-thumb-${user._id}`), {
                text: detailLink,
                width: 80,
                height: 80,
                correctLevel : QRCode.CorrectLevel.L
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

                // --- NEW VALIDATION ---
                // Check the ID from the URL *before* making the API call.
                if (!isValidMongoId(userId)) {
                    console.error('Invalid ID in URL:', userId);
                    detailsCardContainer.innerHTML = '<h2>Error</h2><p>The User ID in the URL is invalid.</p>';
                    return; // Stop execution
                }

                const response = await fetch(`${BASE_URL}/users/${userId}`);
                if (!response.ok) {
                    throw new Error('User not found');
                }
                
                const user = await response.json();
                const detailLink = `${FRONTEND_URL}/details.html?id=${user._id}`;
                const shortId = user._id.substring(user._id.length - 6).toUpperCase();

                detailsCardContainer.innerHTML = `
                    <div class="ticket-card-large">
                        <h2>${user.username}</h2>
                        <div id="details-qr"></div>
                        <p><strong>Email:</strong> ${user.email}</p>
                        <p><strong>Mobile:</strong> ${user.mobile}</p>
                        <p class="user-id">Booking ID: ${shortId}</p>
                    </div>
                `;
                
                new QRCode(document.getElementById('details-qr'), {
                    text: detailLink,
                    width: 250,
                    height: 250
                });

            } catch (error) {
                console.error('Error fetching details:', error);
                // This is the error you were seeing!
                detailsCardContainer.innerHTML = '<h2>Error</h2><p>Could not find user details.</p>';
            }
        }
    }
});