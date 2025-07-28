// Global state
let currentUser = null;
let isAdmin = false;

// API Base URL
const API_BASE = window.location.origin;

// Utility functions
function formatCurrency(amount) {
    return new Intl.NumberFormat('id-ID', {
        style: 'currency',
        currency: 'IDR',
        minimumFractionDigits: 0
    }).format(amount);
}

function showToast(message, type = 'info') {
    const toast = document.getElementById('toast');
    const toastMessage = document.getElementById('toast-message');
    
    toastMessage.textContent = message;
    toast.className = `toast ${type}`;
    toast.classList.remove('hidden');
    
    setTimeout(() => {
        toast.classList.add('hidden');
    }, 3000);
}

function showPage(pageId) {
    document.querySelectorAll('.page').forEach(page => {
        page.classList.add('hidden');
    });
    document.getElementById(pageId).classList.remove('hidden');
}

function showLoading(show = true) {
    const loading = document.getElementById('loading');
    if (show) {
        loading.classList.remove('hidden');
    } else {
        loading.classList.add('hidden');
    }
}

// API functions
async function apiRequest(endpoint, options = {}) {
    try {
        const response = await fetch(`${API_BASE}${endpoint}`, {
            headers: {
                'Content-Type': 'application/json',
                ...options.headers
            },
            ...options
        });
        
        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.message || 'Request failed');
        }
        
        return await response.json();
    } catch (error) {
        console.error('API Request failed:', error);
        throw error;
    }
}

// Authentication
async function login(username, pin) {
    const data = await apiRequest('/api/login', {
        method: 'POST',
        body: JSON.stringify({ username, pin })
    });
    
    currentUser = data.user;
    localStorage.setItem('currentUser', JSON.stringify(currentUser));
    return data;
}

async function adminAccess(code) {
    const data = await apiRequest('/api/admin/access', {
        method: 'POST',
        body: JSON.stringify({ code })
    });
    
    isAdmin = true;
    return data;
}

function logout() {
    currentUser = null;
    isAdmin = false;
    localStorage.removeItem('currentUser');
    showPage('login-page');
}

// User data functions
async function getUserData(userId) {
    return await apiRequest(`/api/users/${userId}`);
}

async function updateUserBalance(userId, depositBalance, savingsBalance) {
    return await apiRequest(`/api/users/${userId}/balance`, {
        method: 'PATCH',
        body: JSON.stringify({ 
            depositBalance: parseFloat(depositBalance),
            savingsBalance: parseFloat(savingsBalance)
        })
    });
}

async function getAllUsers() {
    return await apiRequest('/api/users');
}

// Notifications
async function getNotifications(userId) {
    return await apiRequest(`/api/users/${userId}/notifikasi`);
}

async function sendNotification(userId, message) {
    return await apiRequest('/api/notifikasi', {
        method: 'POST',
        body: JSON.stringify({
            userId: parseInt(userId),
            message
        })
    });
}

async function markNotificationRead(notificationId) {
    return await apiRequest(`/api/notifikasi/${notificationId}/read`, {
        method: 'PATCH'
    });
}

// Chat functions
async function getChatMessages(userId) {
    return await apiRequest(`/api/users/${userId}/chat`);
}

async function sendChatMessage(userId, message, isFromAdmin = false) {
    return await apiRequest('/api/chat', {
        method: 'POST',
        body: JSON.stringify({
            userId: parseInt(userId),
            message,
            isFromAdmin
        })
    });
}

// UI Update functions
function updateBalanceDisplay(user) {
    document.getElementById('deposit-balance').textContent = formatCurrency(user.depositBalance || 0);
    document.getElementById('savings-balance').textContent = formatCurrency(user.savingsBalance || 0);
    
    updateWithdrawalInfo(user);
}

function updateWithdrawalInfo(user) {
    const depositAmount = user.depositBalance || 0;
    const savingsAmount = user.savingsBalance || 0;
    const requiredSavings = depositAmount * 0.015; // 1.5%
    
    const statusElement = document.getElementById('withdrawal-status');
    const progressFill = document.getElementById('progress-fill');
    
    if (savingsAmount >= requiredSavings) {
        statusElement.textContent = '✅ Anda dapat melakukan penarikan deposito penuh';
        statusElement.style.color = 'var(--success)';
        progressFill.style.width = '100%';
    } else {
        const remaining = requiredSavings - savingsAmount;
        statusElement.textContent = `⚠️ Anda perlu menambah ${formatCurrency(remaining)} ke tabungan untuk penarikan penuh`;
        statusElement.style.color = 'var(--warning)';
        
        const progress = savingsAmount / requiredSavings * 100;
        progressFill.style.width = `${Math.min(progress, 100)}%`;
    }
}

function updateUserInfo(user) {
    document.getElementById('user-name').textContent = `Selamat Datang, ${user.username}`;
    document.getElementById('user-account').textContent = `ID: ${user.id} | BRI Mobile Banking`;
}

async function updateNotificationBadge() {
    if (!currentUser) return;
    
    try {
        const notifications = await getNotifications(currentUser.id);
        const unreadCount = notifications.filter(n => !n.isRead).length;
        
        const badge = document.getElementById('notification-count');
        if (unreadCount > 0) {
            badge.textContent = unreadCount;
            badge.classList.remove('hidden');
        } else {
            badge.classList.add('hidden');
        }
    } catch (error) {
        console.error('Failed to load notifications:', error);
    }
}

// Modal functions
function showModal(modalId) {
    document.getElementById(modalId).classList.remove('hidden');
}

function hideModal(modalId) {
    document.getElementById(modalId).classList.add('hidden');
}

// Notification modal
async function loadNotifications() {
    if (!currentUser) return;
    
    try {
        const notifications = await getNotifications(currentUser.id);
        const notificationList = document.getElementById('notification-list');
        
        if (notifications.length === 0) {
            notificationList.innerHTML = '<p style="text-align: center; color: var(--text-gray);">Tidak ada notifikasi</p>';
            return;
        }
        
        notificationList.innerHTML = notifications.map(notification => `
            <div class="notification-item ${!notification.isRead ? 'unread' : ''}" 
                 onclick="markAsRead(${notification.id})">
                <div class="notification-time">
                    ${new Date(notification.createdAt).toLocaleString('id-ID')}
                </div>
                <div class="notification-message">${notification.message}</div>
            </div>
        `).join('');
        
        // Mark all as read after viewing
        setTimeout(() => {
            notifications.forEach(async (notification) => {
                if (!notification.isRead) {
                    try {
                        await markNotificationRead(notification.id);
                    } catch (error) {
                        console.error('Failed to mark notification as read:', error);
                    }
                }
            });
            updateNotificationBadge();
        }, 1000);
        
    } catch (error) {
        console.error('Failed to load notifications:', error);
        showToast('Gagal memuat notifikasi', 'error');
    }
}

function markAsRead(notificationId) {
    // Visual feedback - remove unread styling
    const item = event.target.closest('.notification-item');
    if (item) {
        item.classList.remove('unread');
    }
}

// Chat modal
async function loadChatMessages() {
    if (!currentUser) return;
    
    try {
        const messages = await getChatMessages(currentUser.id);
        const chatMessages = document.getElementById('chat-messages');
        
        if (messages.length === 0) {
            chatMessages.innerHTML = '<p style="text-align: center; color: var(--text-gray);">Belum ada pesan</p>';
            return;
        }
        
        chatMessages.innerHTML = messages.map(message => `
            <div class="chat-message ${message.isFromAdmin ? 'admin' : 'user'}">
                <div class="message-bubble">${message.message}</div>
                <div class="message-time">
                    ${new Date(message.createdAt).toLocaleString('id-ID')}
                </div>
            </div>
        `).join('');
        
        // Scroll to bottom
        chatMessages.scrollTop = chatMessages.scrollHeight;
        
    } catch (error) {
        console.error('Failed to load chat messages:', error);
        showToast('Gagal memuat pesan chat', 'error');
    }
}

// Admin functions
async function loadUsersForAdmin() {
    try {
        const users = await getAllUsers();
        const userSelect = document.getElementById('user-select');
        const notificationUserSelect = document.getElementById('notification-user');
        
        const userOptions = users.map(user => 
            `<option value="${user.id}">${user.username} (ID: ${user.id})</option>`
        ).join('');
        
        userSelect.innerHTML = '<option value="">Pilih User</option>' + userOptions;
        notificationUserSelect.innerHTML = '<option value="">Pilih User</option>' + userOptions;
        
    } catch (error) {
        console.error('Failed to load users:', error);
        showToast('Gagal memuat daftar user', 'error');
    }
}

// Event Listeners
document.addEventListener('DOMContentLoaded', function() {
    // Initialize lucide icons
    if (typeof lucide !== 'undefined') {
        lucide.createIcons();
    }
    
    // Check for stored user
    const storedUser = localStorage.getItem('currentUser');
    if (storedUser) {
        currentUser = JSON.parse(storedUser);
        showDashboard();
    } else {
        showLoading(false);
        showPage('login-page');
    }
    
    // Login form
    document.getElementById('login-form').addEventListener('submit', async (e) => {
        e.preventDefault();
        
        const username = document.getElementById('username').value;
        const pin = document.getElementById('pin').value;
        
        try {
            showLoading(true);
            await login(username, pin);
            showLoading(false);
            showDashboard();
            showToast('Login berhasil!', 'success');
        } catch (error) {
            showLoading(false);
            showToast(error.message, 'error');
        }
    });
    
    // Dashboard navigation
    document.getElementById('logout-btn').addEventListener('click', logout);
    
    document.getElementById('notification-btn').addEventListener('click', () => {
        showModal('notification-modal');
        loadNotifications();
    });
    
    document.getElementById('chat-btn').addEventListener('click', () => {
        showModal('chat-modal');
        loadChatMessages();
    });
    
    // Admin access
    document.getElementById('admin-access-btn').addEventListener('click', async () => {
        const code = prompt('Masukkan kode admin:');
        if (!code) return;
        
        try {
            await adminAccess(code);
            showPage('admin-page');
            loadUsersForAdmin();
            showToast('Akses admin berhasil!', 'success');
        } catch (error) {
            showToast(error.message, 'error');
        }
    });
    
    document.getElementById('back-to-dashboard').addEventListener('click', () => {
        showDashboard();
    });
    
    // Admin forms
    document.getElementById('balance-form').addEventListener('submit', async (e) => {
        e.preventDefault();
        
        const userId = document.getElementById('user-select').value;
        const depositBalance = document.getElementById('deposit-input').value;
        const savingsBalance = document.getElementById('savings-input').value;
        
        if (!userId || !depositBalance || !savingsBalance) {
            showToast('Semua field harus diisi', 'error');
            return;
        }
        
        try {
            await updateUserBalance(userId, depositBalance, savingsBalance);
            showToast('Saldo berhasil diupdate!', 'success');
            
            // Reset form
            document.getElementById('balance-form').reset();
            
            // Update current user data if it's the same user
            if (currentUser && currentUser.id == userId) {
                const updatedUser = await getUserData(userId);
                currentUser = updatedUser;
                localStorage.setItem('currentUser', JSON.stringify(currentUser));
                updateBalanceDisplay(currentUser);
            }
        } catch (error) {
            showToast(error.message, 'error');
        }
    });
    
    document.getElementById('notification-form').addEventListener('submit', async (e) => {
        e.preventDefault();
        
        const userId = document.getElementById('notification-user').value;
        const message = document.getElementById('notification-message').value;
        
        if (!userId || !message) {
            showToast('Semua field harus diisi', 'error');
            return;
        }
        
        try {
            await sendNotification(userId, message);
            showToast('Notifikasi berhasil dikirim!', 'success');
            
            // Reset form
            document.getElementById('notification-form').reset();
        } catch (error) {
            showToast(error.message, 'error');
        }
    });
    
    // Chat form
    document.getElementById('chat-form').addEventListener('submit', async (e) => {
        e.preventDefault();
        
        const message = document.getElementById('chat-input').value.trim();
        if (!message) return;
        
        try {
            await sendChatMessage(currentUser.id, message, isAdmin);
            document.getElementById('chat-input').value = '';
            loadChatMessages();
        } catch (error) {
            showToast('Gagal mengirim pesan', 'error');
        }
    });
    
    // Modal close buttons
    document.getElementById('close-notification').addEventListener('click', () => {
        hideModal('notification-modal');
    });
    
    document.getElementById('close-chat').addEventListener('click', () => {
        hideModal('chat-modal');
    });
    
    // Close modals when clicking outside
    document.addEventListener('click', (e) => {
        if (e.target.classList.contains('modal')) {
            e.target.classList.add('hidden');
        }
    });
});

// Dashboard functions
async function showDashboard() {
    if (!currentUser) {
        showPage('login-page');
        return;
    }
    
    try {
        // Refresh user data
        const userData = await getUserData(currentUser.id);
        currentUser = userData;
        localStorage.setItem('currentUser', JSON.stringify(currentUser));
        
        // Update UI
        updateUserInfo(currentUser);
        updateBalanceDisplay(currentUser);
        updateNotificationBadge();
        
        showPage('dashboard-page');
        
    } catch (error) {
        console.error('Failed to load dashboard:', error);
        showToast('Gagal memuat dashboard', 'error');
        logout();
    }
}

// Auto-refresh functions
setInterval(() => {
    if (currentUser && document.getElementById('dashboard-page').classList.contains('hidden') === false) {
        updateNotificationBadge();
    }
}, 30000); // Refresh every 30 seconds

// Initialize app
window.addEventListener('load', () => {
    showLoading(false);
});