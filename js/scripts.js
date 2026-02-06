// ==========================================
// Random Waifu Generator - Main JavaScript
// ==========================================

// State Management
const state = {
    currentType: 'sfw',
    currentCategory: 'waifu',
    history: [],
    isLoading: false
};

// DOM Elements Cache
const elements = {
    generateBtn: document.getElementById('generateBtn'),
    imageContainer: document.getElementById('imageContainer'),
    errorMessage: document.getElementById('errorMessage'),
    historyGrid: document.getElementById('historyGrid'),
    typeBtns: document.querySelectorAll('.type-btn'),
    categoryBtns: document.querySelectorAll('.category-btn'),
    sfwCategories: document.getElementById('sfwCategories'),
    nsfwCategories: document.getElementById('nsfwCategories'),
    heartsContainer: document.getElementById('hearts')
};

// ==========================================
// Initialization
// ==========================================

document.addEventListener('DOMContentLoaded', () => {
    console.log('DOM loaded!');
    initializeEventListeners();
    startFloatingHearts();
});

// ==========================================
// Event Listeners
// ==========================================

function initializeEventListeners() {
    // Type toggle buttons (SFW/NSFW)
    elements.typeBtns.forEach(btn => {
        btn.addEventListener('click', handleTypeToggle);
    });

    // Category selection buttons
    elements.categoryBtns.forEach(btn => {
        btn.addEventListener('click', handleCategorySelect);
    });

    // Generate button
    if (elements.generateBtn) {
        elements.generateBtn.addEventListener('click', generateWaifu);
    }
}

// ==========================================
// Event Handlers
// ==========================================

function handleTypeToggle(e) {
    const btn = e.target;
    
    // Update active state
    elements.typeBtns.forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    
    // Update state
    state.currentType = btn.dataset.type;
    
    // Toggle category grids
    toggleCategoryGrid(state.currentType);
}

function toggleCategoryGrid(type) {
    if (type === 'nsfw') {
        elements.sfwCategories.style.display = 'none';
        elements.nsfwCategories.style.display = 'grid';
        resetActiveCategory(elements.nsfwCategories);
    } else {
        elements.nsfwCategories.style.display = 'none';
        elements.sfwCategories.style.display = 'grid';
        resetActiveCategory(elements.sfwCategories);
    }
    
    state.currentCategory = 'waifu';
}

function resetActiveCategory(container) {
    // Remove active from all
    elements.categoryBtns.forEach(b => {
        b.classList.remove('active');
    });
    
    // Add active to first button of visible grid
    const firstBtn = container.querySelector('.category-btn');
    if (firstBtn) {
        firstBtn.classList.add('active');
    }
}

function handleCategorySelect(e) {
    const btn = e.target;
    const parent = btn.parentElement;
    
    // Remove active from siblings
    parent.querySelectorAll('.category-btn').forEach(b => {
        b.classList.remove('active');
    });
    
    // Add active to clicked
    btn.classList.add('active');
    
    // Update state
    state.currentCategory = btn.dataset.cat;
}

// ==========================================
// Core Functionality
// ==========================================

async function generateWaifu() {
    if (state.isLoading) return;
    
    setLoadingState(true);
    hideError();
    
    try {
        const imageUrl = await fetchWaifuImage();
        displayImage(imageUrl);
        addToHistory(imageUrl);
    } catch (error) {
        handleError(error);
    } finally {
        setLoadingState(false);
    }
}

async function fetchWaifuImage() {
    const response = await fetch(
        `https://api.waifu.pics/${state.currentType}/${state.currentCategory}`
    );
    
    if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const data = await response.json();
    
    if (!data.url) {
        throw new Error('No image URL received from API');
    }
    
    return data.url;
}

function displayImage(url) {
    const html = `
        <img src="${url}" 
             alt="Random Waifu" 
             class="waifu-image" 
             id="waifuImage">
        <div class="image-info">
            Category: ${state.currentCategory.toUpperCase()} | 
            Type: ${state.currentType.toUpperCase()}
        </div>
        <a href="${url}" 
           download 
           class="download-btn" 
           id="downloadBtn" 
           target="_blank">
            <span>⬇️</span> Download Image
        </a>
    `;
    
    elements.imageContainer.innerHTML = html;
    
    // Handle image load
    const img = document.getElementById('waifuImage');
    if (img) {
        img.onload = () => {
            img.classList.add('loaded');
            showDownloadButton();
        };
        
        img.onerror = () => {
            showError('Failed to load image. Please try again.');
        };
    }
}

function showDownloadButton() {
    setTimeout(() => {
        const btn = document.getElementById('downloadBtn');
        if (btn) btn.classList.add('visible');
    }, 300);
}

// ==========================================
// History Management
// ==========================================

function addToHistory(url) {
    // Add to beginning
    state.history.unshift(url);
    
    // Keep max 12 items
    if (state.history.length > 12) {
        state.history.pop();
    }
    
    renderHistory();
}

function renderHistory() {
    if (state.history.length === 0) {
        elements.historyGrid.innerHTML = `
            <p style="color: rgba(255,255,255,0.5); grid-column: 1/-1;">
                There is no history yet
            </p>
        `;
        return;
    }
    
    elements.historyGrid.innerHTML = state.history.map(url => `
        <div class="history-item" onclick="viewHistory('${url}')">
            <img src="${url}" alt="History" loading="lazy">
        </div>
    `).join('');
}

// Global function for onclick handler
window.viewHistory = function(url) {
    displayImage(url);
};

// ==========================================
// UI State Management
// ==========================================

function setLoadingState(loading) {
    state.isLoading = loading;
    const btn = elements.generateBtn;
    
    if (loading) {
        btn.classList.add('loading');
        btn.innerHTML = '<span class="spinner"></span>Loading...';
    } else {
        btn.classList.remove('loading');
        btn.innerHTML = '<span>🎲 Generate Waifu</span>';
    }
}

function showError(message) {
    elements.errorMessage.textContent = message;
    elements.errorMessage.style.display = 'block';
    
    // Auto hide after 5 seconds
    setTimeout(hideError, 5000);
}

function hideError() {
    elements.errorMessage.style.display = 'none';
}

function handleError(error) {
    console.error('Error:', error);
    showError('Failed to load image. Please try again.');
}

// ==========================================
// Visual Effects
// ==========================================

function startFloatingHearts() {
    // Create initial heart
    createHeart();
    
    // Create new heart every second
    setInterval(createHeart, 1000);
}

function createHeart() {
    const heart = document.createElement('div');
    heart.className = 'heart';
    
    // Random heart emoji
    const emojis = ['💖', '💕', '💗', '💝', '💘'];
    heart.innerHTML = emojis[Math.floor(Math.random() * emojis.length)];
    
    // Random position and timing
    heart.style.left = Math.random() * 100 + '%';
    heart.style.animationDuration = (Math.random() * 3 + 3) + 's';
    heart.style.animationDelay = Math.random() * 2 + 's';
    
    elements.heartsContainer.appendChild(heart);
    
    // Remove after animation
    setTimeout(() => {
        if (heart.parentNode) {
            heart.remove();
        }
    }, 6000);
}

// ==========================================
// Utility Functions
// ==========================================

// Debounce function for performance
function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

// Preload image utility
function preloadImage(url) {
    return new Promise((resolve, reject) => {
        const img = new Image();
        img.onload = () => resolve(url);
        img.onerror = reject;
        img.src = url;
    });
}

// Export for testing (if needed)
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        state,
        fetchWaifuImage,
        addToHistory
    };
}
