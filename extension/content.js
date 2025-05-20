//! TODO : 
//! 1. Fix the initial random animation [done]
//! 2. Make it support all websites 

//? claudes-chat-element :  *</div></div><div class="absolute bottom-0 right-2 pointer-events-none" style="transform: none;"><div class="rounded-lg transition min-w-max pointer-events-auto translate-y-4 bg-bg-300/90 backdrop-blur-sm translate-x-1 group-hover:translate-x-0.5 border-0.5 border-border-300 p-0.5 shadow-sm opacity-0 group-hover:opacity-100"><div class="text-text-300 flex items-stretch justify-between"><button class="flex flex-row items-center gap-1.5 rounded-md p-2 text-sm transition text-text-300 active:scale-95 select-auto hover:bg-bg-500 py-1" data-state="closed">Edit</button><div class="flex items-center gap-0.5"></div></div></div></div></div></div></div>/

console.log("[Content] content.js loaded");

// Global variable for chat sidebar and navigator bar
let chat_sidebar;
let navigator_bar;
let currentChatConfig = null;
let lastUrl = window.location.href;
var index = 1;
let messageIndexMap = new Map(); // Store message references by index

// Define selectors for different chat applications directly in content.js
const chatSelectors = {
    'chatgpt.com': {
        type: 'openai',
        selectors: {
            chatContainer: 'article', // Parent of messages
            messageSelector: '.whitespace-pre-wrap' // Individual message elements
        }
    },
    'claude.ai': {
        type: 'claude',
        selectors: {
            chatContainer: 'font-user-message grid grid-cols-1 gap-2 py-0.5 text-[0.9375rem] leading-6', // More specific parent for Claude messages
            messageSelector: '.whitespace-pre-wrap break-words', // Messages from Claude
        }
    },    
    'perplexity.ai': {
        type: 'perplexity',
        selectors: {
            chatContainer: 'main',
            messageSelector: 'div.prose' // General prose content for Perplexity
        }
    },
    'gemini.google.com': {
        type: 'gemini',
        selectors: {
            chatContainer: 'message-list', // Custom element or specific class for Gemini
            messageSelector: 'message-content' // Selector for actual message text
        }
    },
    'grok.com': {
        type: 'grok',
        selectors: {
            // These are guesses and might need refinement for Grok
            chatContainer: 'div[data-testid="conversation"] > div > div[style*="flex-direction: column;"]',
            messageSelector: 'div[data-testid^="message-"]'
        }
    },
    't3.chat': {
        type: 't3chat',
        selectors: {
            // These are guesses for T3 Chat
            chatContainer: '.chat-messages-container',
            messageSelector: '.message-bubble' 
        }
    }
};

// Function to determine which chat application is being used based on URL
function determineChatAppConfig(url) {
    console.log('[Content] Determining chat app for URL:', url);
    if (!url) {
        console.warn('[Content] No URL provided to determineChatAppConfig');
        return null;
    }
    for (const [domain, config] of Object.entries(chatSelectors)) {
        if (url.includes(domain)) {
            console.log('[Content] Found matching chat app:', config.type);
            return config;
        }
    }
    console.log('[Content] No matching chat app found for URL:', url);
    return null;
}

// Function to apply theme
function applyTheme(theme) {
    if (navigator_bar) {
        navigator_bar.className = `navigator-bar theme-${theme}`;
        console.log("[Content] Theme applied to navigator bar:", theme);
    }
    
    if (chat_sidebar) {
        chat_sidebar.className = `sidebar theme-${theme}`;
        console.log("[Content] Theme applied to sidebar:", theme);
    }
}

async function waitforelement(selector) {
    console.log("[Content] Waiting for element with selector:", selector);
    try {
        return new Promise((resolve) => {
            const checkElements = () => {
                let ele = document.querySelector(selector);
                if (ele) {
                    ele = ele.parentNode;
                    console.log("[Content] Element found:", selector);
                    resolve(ele);
                } else {
                    console.log("[Content] {else} Element not found:", selector);
                    setTimeout(checkElements, 500);
                }
            };  
            checkElements();
        });
    } catch (e) {
        console.error("[Content] Error executing waitforelements:", e);
    }
}

// Function to initialize chat navigation system
async function initializeChatNavigation() {
    console.log("[Content] Initializing chat navigation for URL:", window.location.href);
    currentChatConfig = determineChatAppConfig(window.location.href);
    
    if (currentChatConfig) {
        console.log("[Content] Determined chat config:", currentChatConfig);
        await setupNavigator();
    } else {
        console.warn("[Content] No chat configuration found for this URL. Navigation not initialized.");
        // Optionally, remove any existing elements
        if (navigator_bar) {
            navigator_bar.remove();
            navigator_bar = null;
        }
        if (chat_sidebar) {
            chat_sidebar.remove();
            chat_sidebar = null;
        }
        console.log("[Content] Removed existing navigation elements as no config for current URL.");
    }
}

// Function to setup the navigator bar and sidebar
async function setupNavigator() {
    console.log("[Content] Setting up chat navigator with config:", currentChatConfig);
    if (!currentChatConfig || !currentChatConfig.selectors || !currentChatConfig.selectors.chatContainer) {
        console.warn("[Content] Invalid or incomplete chat config, skipping setup. Config:", currentChatConfig);
        return;
    }

    try {
        // Remove any existing elements
        if (document.querySelector("#chat-navigator-bar")) {
            document.querySelector("#chat-navigator-bar").remove();
        }
        if (document.querySelector("#chat.sidebar")) {
            document.querySelector("#chat.sidebar").remove();
        }

        console.log("[Content] {try} currentChatConfig.selectors.chatContainer:", currentChatConfig.selectors.chatContainer);
        const targetElementParent = await waitforelement(currentChatConfig.selectors.chatContainer);
        console.log("[Content] Found target element:", targetElementParent);

        // Clear index map
        messageIndexMap.clear();
        index = 1;

        // Create navigator bar (collapsed state)
        navigator_bar = document.createElement("div");
        navigator_bar.id = "chat-navigator-bar";
        navigator_bar.className = 'navigator-bar';
        
        // Add header to navigator bar
        const navHeader = document.createElement("div");
        navHeader.className = "nav-header";
        navHeader.innerHTML = `<span class="nav-title">Chat Messages</span>`;
        navigator_bar.appendChild(navHeader);

        // Create sidebar (expanded state - initially hidden)
        chat_sidebar = document.createElement("table");
        chat_sidebar.id = "chat";
        chat_sidebar.className = 'sidebar';
        chat_sidebar.style.display = 'none'; // Hidden initially
        chat_sidebar.style.position = 'absolute';

        // Create header row for dragging
        const headerRow = document.createElement("tr");
        const headerCell = document.createElement("td");
        headerCell.className = "sidebar-header";

        // Add macOS controls inside header
        headerCell.innerHTML = `
            <div class="macos-controls">
                <button class="close"></button>
                <button class="minimize"></button>
                <button class="maximize"></button>
            </div>
        `;

        headerCell.colSpan = 1;
        headerRow.appendChild(headerCell);
        chat_sidebar.appendChild(headerRow);

        // Make the sidebar draggable by its header
        dragElement(chat_sidebar);

        document.body.appendChild(navigator_bar);
        document.body.appendChild(chat_sidebar);

        // Hook up sidebar controls
        const closeBtn = chat_sidebar.querySelector(".close");
        const minimizeBtn = chat_sidebar.querySelector(".minimize");
        const maximizeBtn = chat_sidebar.querySelector(".maximize");
        
        closeBtn.addEventListener("click", () => {
            chat_sidebar.style.display = "none";
            console.log("[Content] Chat sidebar closed");
        });
        minimizeBtn.addEventListener("click", () => {
            chat_sidebar.classList.add("minimized");
            console.log("[Content] Chat sidebar minimized");
        });
        maximizeBtn.addEventListener("click", () => {
            chat_sidebar.classList.remove("minimized");
            console.log("[Content] Chat sidebar maximized");
        });

        // Setup jQuery resizable for sidebar
        $(function() {
            $("#chat").resizable({
                handles: "n, e, s, w, ne, se, sw, nw",
                start: function() {
                    resizeObserver.observe(chat_sidebar);
                },
                stop: function() {
                    resizeObserver.disconnect();
                }
            });
        });

        // Create but don't connect the observer initially
        const resizeObserver = new ResizeObserver(() => {
            if (!chat_sidebar) return;
            const width = chat_sidebar.offsetWidth;
            const height = chat_sidebar.offsetHeight;
            const fontSize = Math.min(width, height) / 10;
            chat_sidebar.style.fontSize = `${fontSize}px`;
        });

        // Apply theme 
        chrome.storage.sync.get('theme', function(data) {
            const theme = data.theme || 'red';
            applyTheme(theme);
        });

        // Setup the hover behavior for navigator bar - show expanded text labels
        navigator_bar.addEventListener('mouseenter', () => {
            navigator_bar.classList.add('expanded');
            
            // If user hovers the bar but doesn't have sidebar open yet, still position it
            const rect = navigator_bar.getBoundingClientRect();
            chat_sidebar.style.top = `${rect.top}px`;
            chat_sidebar.style.left = `${rect.right + 10}px`; // Position to the right of the bar
            chat_sidebar.style.display = "table";
        });
        
        navigator_bar.addEventListener('mouseleave', (e) => {
            if (e.relatedTarget !== chat_sidebar && !chat_sidebar.contains(e.relatedTarget)) {
                navigator_bar.classList.remove('expanded');
                setTimeout(() => {
                    if (!chat_sidebar.matches(':hover')) {
                        chat_sidebar.style.display = "none";
                    }
                }, 100);
            }
        });

        // Allow sidebar to close when mouse leaves it
        chat_sidebar.addEventListener('mouseleave', (e) => {
            if (e.relatedTarget !== navigator_bar) {
                setTimeout(() => {
                    if (!navigator_bar.matches(':hover')) {
                        chat_sidebar.style.display = "none";
                        navigator_bar.classList.remove('expanded');
                    }
                }, 100);
            }
        });

        // Handle existing chats
        const existingMessages = targetElementParent.querySelectorAll(currentChatConfig.selectors.messageSelector);
        console.log(`[Content] Processing ${existingMessages.length} existing chat messages using selector: ${currentChatConfig.selectors.messageSelector}`);
        
        existingMessages.forEach((messageNode) => {
            try {
                messageNode.id = `index-${index}`;
                messageIndexMap.set(index, messageNode);
                const shortText = messageNode.textContent.substring(0, 12).trim() + "...";
                addMessageToSidebar(index, shortText, messageNode.id);
                addMessageToBar(index);
                index++;
            } catch (e) {
                console.error("[Content] Error processing existing message:", e, "Message content:", messageNode.innerHTML);
            }
        });

        // Observe new chats within the chatContainer (targetElementParent)
        const observerConfig = { childList: true, subtree: true };
        const obs = new MutationObserver(mutationCallback);
        try {
            obs.observe(targetElementParent, observerConfig);
            console.log("[Content] MutationObserver initialized for target element:", targetElementParent);
        } catch (e) {
            console.error("[Content] Observer initialization failed, error:", e);
        }
    } catch (error) {
        console.error("[Content] Error in setupNavigator:", error);
    }
}

// Function to add a message indicator to the navigator bar
function addMessageToBar(messageIndex) {
    if (!navigator_bar) return;

    const barItem = document.createElement("div");
    barItem.className = "nav-item";
    barItem.dataset.index = messageIndex;
    
    // Create wrapper for better hover effects
    const barItemContent = document.createElement("div");
    barItemContent.className = "nav-item-content";
    
    // Get the message text for this item
    let messageText = "Message " + messageIndex;
    if (messageIndexMap.has(messageIndex)) {
        const messageNode = messageIndexMap.get(messageIndex);
        messageText = messageNode.textContent.substring(0, 30).trim();
        if (messageNode.textContent.length > 30) {
            messageText += "...";
        }
    }
    
    // Add the anchor text that will show on hover
    const anchorText = document.createElement("span");
    anchorText.className = "nav-item-text";
    anchorText.textContent = messageText;
    barItemContent.appendChild(anchorText);
    
    barItem.appendChild(barItemContent);
    
    // Add click event to scroll to the message
    barItem.addEventListener("click", () => {
        // Ensure sidebar is visible
        navigator_bar.classList.add('expanded');
        chat_sidebar.style.display = "table";
        
        const messageId = `index-${messageIndex}`;
        const messageElement = document.getElementById(messageId);
        if (messageElement) {
            messageElement.scrollIntoView({ behavior: "smooth", block: "center" });
            
            // Add a brief highlight effect
            messageElement.classList.add("highlight-message");
            setTimeout(() => {
                messageElement.classList.remove("highlight-message");
            }, 2000);
            
            // Mark this nav item as active
            document.querySelectorAll('.nav-item').forEach(item => {
                item.classList.remove('active');
            });
            barItem.classList.add('active');
        }
    });
    
    navigator_bar.appendChild(barItem);
}

// Function to add a message to the sidebar table
function addMessageToSidebar(messageIndex, rowData, id) {
    if (!chat_sidebar) return;
    
    const newRow = chat_sidebar.insertRow();
    const cell = newRow.insertCell();
    cell.innerHTML = `<a href="#${id}">${messageIndex}. ${rowData}</a>`;
    
    // Add hover behavior to show full text
    cell.addEventListener("mouseenter", () => {
        if (messageIndexMap.has(messageIndex)) {
            const fullMessage = messageIndexMap.get(messageIndex);
            const fullText = fullMessage.textContent.trim();
            
            // Create or update tooltip
            let tooltip = document.getElementById("message-tooltip");
            if (!tooltip) {
                tooltip = document.createElement("div");
                tooltip.id = "message-tooltip";
                tooltip.className = "message-tooltip";
                document.body.appendChild(tooltip);
            }
            
            tooltip.textContent = fullText;
            
            // Position the tooltip
            const rect = cell.getBoundingClientRect();
            tooltip.style.top = `${rect.top}px`;
            tooltip.style.left = `${rect.right + 10}px`;
            tooltip.style.display = "block";
        }
    });
    
    cell.addEventListener("mouseleave", () => {
        const tooltip = document.getElementById("message-tooltip");
        if (tooltip) {
            tooltip.style.display = "none";
        }
    });
    
    console.log("[Content] Added new sidebar row:", rowData);
}

// Function to handle URL changes
function checkUrlChange() {
    const currentUrl = window.location.href;
    if (currentUrl !== lastUrl) {
        console.log('[Content] URL changed from', lastUrl, 'to', currentUrl);
        lastUrl = currentUrl;
        // Re-initialize the navigation for the new URL
        initializeChatNavigation(); 
    }
}

// Start checking for URL changes
setInterval(checkUrlChange, 1000);

// Listen for theme changes from storage
chrome.storage.onChanged.addListener(function(changes, namespace) {
    if (changes.theme) {
        console.log("[Content] Theme change detected:", changes.theme.newValue);
        applyTheme(changes.theme.newValue);
    }
});

// Callback for MutationObserver
function mutationCallback(mutationList, observer) {
    if (!currentChatConfig || !currentChatConfig.selectors || !currentChatConfig.selectors.messageSelector) {
        return;
    }

    for (const mutation of mutationList) {
        if (mutation.type === 'childList') {
            mutation.addedNodes.forEach(node => {
                // Check if the added node itself is a message or contains messages
                if (node.nodeType === Node.ELEMENT_NODE) {
                    const messages = [];
                    if (node.matches(currentChatConfig.selectors.messageSelector)) {
                        messages.push(node);
                    }
                    // Also check children if the added node is a container
                    messages.push(...node.querySelectorAll(currentChatConfig.selectors.messageSelector));
                    
                    messages.forEach(messageNode => {
                        if (!messageNode.id) { // Process only if not already processed
                            try {
                                messageNode.id = `index-${index}`;
                                messageIndexMap.set(index, messageNode);
                                const shortText = messageNode.textContent.substring(0, 12).trim() + "...";
                                addMessageToSidebar(index, shortText, messageNode.id);
                                addMessageToBar(index);
                                index++;
                                console.log("[Content] Added new chat message via MutationObserver:", messageNode.id);
                            } catch (e) {
                                console.error("[Content] Error processing new message via MutationObserver:", e, "Message content:", messageNode.innerHTML);
                            }
                        }
                    });
                }
            });
        }
    }
}

function dragElement(elmnt) {
    var pos1 = 0, pos2 = 0, pos3 = 0, pos4 = 0;
    const header = elmnt.querySelector('.sidebar-header');
    
    if (header) {
        header.onmousedown = dragMouseDown;
    } else {
        elmnt.onmousedown = dragMouseDown;
    }   

    function dragMouseDown(e) {
        e = e || window.event;
        e.preventDefault();
        // get the mouse cursor position at startup:
        pos3 = e.clientX;
        pos4 = e.clientY;
        document.onmouseup = closeDragElement;
        // call a function whenever the cursor moves:
        document.onmousemove = elementDrag;
    }

    function elementDrag(e) {
        e = e || window.event;
        e.preventDefault();
        // calculate the new cursor position:
        pos1 = pos3 - e.clientX;
        pos2 = pos4 - e.clientY;
        pos3 = e.clientX;
        pos4 = e.clientY;
        elmnt.style.top = (elmnt.offsetTop - pos2) + "px";
        elmnt.style.left = (elmnt.offsetLeft - pos1) + "px";
    }

    function closeDragElement() {
        document.onmouseup = null;
        document.onmousemove = null;
    }
}

// Initial load: determine config and setup navigation
(async () => {
    await initializeChatNavigation();
})();


