console.log("[Content] content.js loaded");

// Global variable for chat sidebar
let chat_sidebar;
let currentChatConfig = null;
let lastUrl = window.location.href;
var index = 1;

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
    if (chat_sidebar) {
        chat_sidebar.className = `sidebar theme-${theme}`;
        console.log("[Content] Theme applied:", theme);
    } else {
        console.warn('[Content] Chat sidebar not yet created for theme application');
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

// Function to initialize chat sidebar
async function initializeChatSidebar() {
    console.log("[Content] Initializing chat sidebar for URL:", window.location.href);
    currentChatConfig = determineChatAppConfig(window.location.href);
    
    if (currentChatConfig) {
        console.log("[Content] Determined chat config:", currentChatConfig);
        await setupChatSidebar();
    } else {
        console.warn("[Content] No chat configuration found for this URL. Sidebar not initialized.");
        // Optionally, remove the sidebar if it exists from a previous page
        if (chat_sidebar) {
            chat_sidebar.remove();
            chat_sidebar = null;
            console.log("[Content] Removed existing chat sidebar as no config for current URL.");
        }
    }
}

// Function to setup chat sidebar
async function setupChatSidebar() {
    console.log("[Content] Setting up chat sidebar with config:", currentChatConfig);
    if (!currentChatConfig || !currentChatConfig.selectors || !currentChatConfig.selectors.chatContainer) {
        console.warn("[Content] Invalid or incomplete chat config, skipping setup. Config:", currentChatConfig);
        return;
    }

    try {

        //! clicking on the chat link changes the url -> therefore possible that multiple windows of chat_sidebar are appended 
        if(document.querySelector("#chat.sidebar")) { return ; }

        console.log("[Content] {try} currentChatConfig.selectors.chatContainer:", currentChatConfig.selectors.chatContainer);
        const targetElementParent = await waitforelement(currentChatConfig.selectors.chatContainer);
        console.log("[Content] Found target element:", targetElementParent);

        // Create chat sidebar
        chat_sidebar = document.createElement("table");
        chat_sidebar.id = "chat";
        chat_sidebar.className = 'sidebar'; // Set base class for styling
        chat_sidebar.style.position = 'absolute'; // for dragging : https://www.w3schools.com/howto/howto_js_draggable.asp

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

        // Make the entire sidebar draggable by its header
        dragElement(chat_sidebar);
        console.log("[Content] Chat sidebar created and made draggable");

        document.body.appendChild(chat_sidebar);

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

        //resizing using jQuery  (for table ; without that right bottom button): 
        $(function() {
            chat_sidebar.style.width = '160px';
            chat_sidebar.style.height = '220px';
            
            // Initialize resizable after a small delay
            setTimeout(() => {
                $("#chat").resizable({
                    handles: "n, e, s, w, ne, se, sw, nw"
                });
                console.log("[Content] Chat sidebar made resizable");
            }, 100);
        });

        // Set initial font size
        chat_sidebar.style.fontSize = '1rem';
        
        // Add a small delay before starting the ResizeObserver
        setTimeout(() => {
            const resizeObserver = new ResizeObserver(() => {
                if (!chat_sidebar) return; // Guard against removed sidebar
                const width = chat_sidebar.offsetWidth;
                const height = chat_sidebar.offsetHeight;
                const fontSize = Math.min(width, height) / 12;
                //resize buttons of macos-controls  
                const closeBtn = chat_sidebar.querySelector(".close");
                const minimizeBtn = chat_sidebar.querySelector(".minimize");
                const maximizeBtn = chat_sidebar.querySelector(".maximize");
                
                if(closeBtn && minimizeBtn && maximizeBtn) {
                    closeBtn.style.width = `${fontSize}px/4`;
                    closeBtn.style.height = `${fontSize}px/4`;
                    minimizeBtn.style.width = `${fontSize}px/4`;
                    minimizeBtn.style.height = `${fontSize}px/4`;
                    maximizeBtn.style.width = `${fontSize}px/4`;
                    maximizeBtn.style.height = `${fontSize}px/4`;
                }
                
                chat_sidebar.style.fontSize = `${fontSize}px`;
            });
            
            resizeObserver.observe(chat_sidebar);
            console.log("[Content] ResizeObserver initialized for chat_sidebar");
        }, 100);

        // Apply saved theme
        chrome.storage.sync.get('theme', function(data) {
            const theme = data.theme || 'red';
            applyTheme(theme);
        });

        // Handle existing chats
        // Ensure targetElementParent is the correct element to query for messages
        const existingMessages = targetElementParent.querySelectorAll(currentChatConfig.selectors.messageSelector);
        console.log(`[Content] Processing ${existingMessages.length} existing chat messages using selector: ${currentChatConfig.selectors.messageSelector}`);
        index = 1; // Reset index for current page messages
        existingMessages.forEach((messageNode) => {
            try {
                messageNode.id = `index-${index}`;
                console.log("[Content] {try} messageNode.textContent:", messageNode.textContent);
                // Use textContent for cleaner text, innerHTML can be complex
                addRow(index + ". " + messageNode.textContent.substring(0, 12).trim() + "...", messageNode.id);
                index++;
            } catch (e) {
                console.error("[Content] Error processing existing message:", e, "Message content:", messageNode.innerHTML);
            }
        });

        // Observe new chats within the chatContainer (targetElementParent)
        const observerConfig = { childList: true, subtree: true }; // subtree true if messages are nested deeper
        const obs = new MutationObserver(mutationCallback);
        try {
            obs.observe(targetElementParent, observerConfig);
            console.log("[Content] MutationObserver initialized for target element:", targetElementParent);
        } catch (e) {
            console.error("[Content] Observer initialization failed, error:", e);
        }
    } catch (error) {
        console.error("[Content] Error in setupChatSidebar:", error);
    }
}

// Function to handle URL changes
function checkUrlChange() {
    const currentUrl = window.location.href;
    if (currentUrl !== lastUrl) {
        console.log('[Content] URL changed from', lastUrl, 'to', currentUrl);
        lastUrl = currentUrl;
        // Re-initialize the sidebar for the new URL
        // This will determine new config and setup if applicable
        initializeChatSidebar(); 
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
        // console.warn("[Content] MutationObserver: No chat config available for mutation callback");
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
                                addRow(index + ". " + messageNode.textContent.substring(0, 12).trim() + "...", messageNode.id);
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

function addRow(rowData, id) {
    if (chat_sidebar) {
        const newRow = chat_sidebar.insertRow();
        const cell = newRow.insertCell();
        cell.innerHTML = `<a href="#${id}">${rowData}</a>`;
        console.log("[Content] Added new row:", rowData);
    } else {
        console.error("[Content] Chat sidebar element not found");
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

// Initial load: determine config and setup sidebar
(async () => {
    await initializeChatSidebar();
})();


