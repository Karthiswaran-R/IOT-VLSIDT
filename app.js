
    const loginForm = document.querySelector('#loginForm');
    loginForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        const username = document.querySelector('#username').value;
        const password = document.querySelector('#password').value;
        
        const response = await fetch('http://localhost:3000/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username, password })
        });
        
        const data = await response.json();
        if (data.token) {
            localStorage.setItem('token', data.token);
            alert('Logged in successfully!');
            window.location.reload();
        } else {
            alert('Invalid credentials!');
        }
    });
    
    const signupForm = document.querySelector('#signupForm');
    signupForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        const username = document.querySelector('#new-username').value;
        const password = document.querySelector('#new-password').value;
        
        const response = await fetch('http://localhost:3000/signup', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username, password })
        });
        
        if (response.status === 201) {
            alert('User created! Please login.');
        }
    });
    
    document.getElementById('logout-btn').addEventListener('click', () => {
        localStorage.removeItem('token');
        alert('Logged out successfully!');
        window.location.reload();
    });
    
    async function fetchDevices() {
        const token = localStorage.getItem('token');
        if (!token) {
            alert('Please log in first');
            return;
        }
    
        const response = await fetch('http://localhost:3000/devices', {
            headers: { 'Authorization': `Bearer ${token}` }
        });
    
        const devices = await response.json();
        devices.forEach(device => {
            createDeviceWidget(device);
        });
    }
    
    async function createDeviceWidget(device) {
        const deviceContainer = document.getElementById('devices-list');
        const deviceDiv = document.createElement('div');
        deviceDiv.className = 'device-widget';
        deviceDiv.innerHTML = `
            <h4>${device.name}</h4>
            <button class="btn btn-danger" data-id="${device._id}">Remove</button>
        `;
        deviceContainer.appendChild(deviceDiv);
    
        document.querySelector(`[data-id="${device._id}"]`).addEventListener('click', async (e) => {
            const deviceId = e.target.getAttribute('data-id');
            const token = localStorage.getItem('token');
            
            const response = await fetch(`http://localhost:3000/devices/${deviceId}`, {
                method: 'DELETE',
                headers: { 'Authorization': `Bearer ${token}` }
            });
    
            if (response.ok) {
                e.target.closest('.device-widget').remove();
            } else {
                alert('Failed to remove device.');
            }
        });
    }
    
    document.addEventListener('DOMContentLoaded', fetchDevices);
    