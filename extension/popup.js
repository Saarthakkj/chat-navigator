document.addEventListener('DOMContentLoaded', function() {
    const themeSelector = document.getElementById('themeSelector');
    const sidebar = document.getElementById('chat');

    // Load saved theme and set initial state
    chrome.storage.sync.get('theme', function(data) {
        const savedTheme = data.theme || 'red'; // Default to red
        themeSelector.value = savedTheme;
        if (sidebar) {
            sidebar.className = 'sidebar theme-' + savedTheme;
        }
    });

    // Theme switching
    themeSelector.addEventListener('change', function(e) {
        const selectedTheme = e.target.value;
        // Save the theme to storage
        chrome.storage.sync.set({theme: selectedTheme}, function() {
            console.log('Theme saved:', selectedTheme);
        });
        // Update popup sidebar
        if (sidebar) {
            sidebar.className = 'sidebar theme-' + selectedTheme;
        }
    });
});