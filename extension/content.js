console.log("content.js loaded");

// Global variable for chat sidebar
let chat_sidebar;

var index = 1;
// Function to apply theme
function applyTheme(theme) {
    if (chat_sidebar) {
        chat_sidebar.className = `sidebar theme-${theme}`;
    } else {
        console.warn('Chat sidebar not yet created');
    }
}

async function waitforelement(tagName) {
    try {
        return new Promise((resolve) => {
            const checkElements = () => {
                let ele = document.querySelector(tagName);
                if (ele) {
                    ele = ele.parentNode;
                    resolve(ele);
                } else {
                    setTimeout(checkElements, 500);
                }
            };
            checkElements();
        });
    } catch (e) {
        console.error("Error executing waitforelements:", e);
    }
}

(async () => {
    const targetElement = await waitforelement('article');

    // Create chat sidebar
    chat_sidebar = document.createElement("table");
    chat_sidebar.id = "chat";
    chat_sidebar.className = 'sidebar'; // Set base class for styling

    // Add dragging functionality
    let isDragging = false;
    let offsetX, offsetY;

    // document.querySelector("#chat.sidebar .handle").addEventListener("mousedown", startDragging);

    chat_sidebar.addEventListener('mousedown', (e) => {
        isDragging = true;
        offsetX = e.clientX - chat_sidebar.getBoundingClientRect().left;
        offsetY = e.clientY - chat_sidebar.getBoundingClientRect().top;
        chat_sidebar.style.cursor = 'grabbing';
        e.preventDefault();
    });

    document.addEventListener('mousemove', (e) => {
        if (!isDragging) return;
        let newX = e.clientX - offsetX;
        let newY = e.clientY - offsetY;
        const maxX = window.innerWidth - chat_sidebar.offsetWidth;
        const maxY = window.innerHeight - chat_sidebar.offsetHeight;
        newX = Math.min(Math.max(0, newX), maxX);
        newY = Math.min(Math.max(0, newY), maxY);
        chat_sidebar.style.left = `${newX}px`;
        chat_sidebar.style.top = `${newY}px`;
        chat_sidebar.style.right = 'auto';
    });

    document.addEventListener('mouseup', () => {
        if (isDragging) {
            isDragging = false;
            chat_sidebar.style.cursor = 'move';
        }
    });

    chat_sidebar.addEventListener('selectstart', (e) => {
        if (isDragging) e.preventDefault();
    });

    document.body.appendChild(chat_sidebar);

    // Apply saved theme
    chrome.storage.sync.get('theme', function(data) {
        const theme = data.theme || 'red';
        applyTheme(theme);
    });

    // Handle existing chats
    const childnodeTraversal = targetElement.querySelectorAll("*");
    // let index = 1;
    childnodeTraversal.forEach((chats) => {
        if (chats.className === "whitespace-pre-wrap") {
            try {
                chats.id = `index-${index}`;
                addRow(index + ". " + chats.innerHTML.substring(0, 12), chats.id);
                index++;
            } catch (e) {
                console.log("Error adding id and passing it in addRow:", e);
            }
        }
    });

    // Observe new chats
    const config = { childList: true };
    const obs = new MutationObserver(callback);
    try {
        obs.observe(targetElement, config);
    } catch (e) {
        console.error("Observer initialization failed, error:", e);
    }
})();

// Listen for theme changes
chrome.storage.onChanged.addListener(function(changes, namespace) {
    if (changes.theme) {
        applyTheme(changes.theme.newValue);
    }
});

function callback(mutationList, observer) {
    for (const mutation of mutationList) {
        mutation.addedNodes.forEach(node => {
            if (node.tagName.toLowerCase() === 'article') {
                try {
                    const chatText = node.querySelectorAll('*');
                    chatText.forEach(chat => {
                        if (chat.className === "whitespace-pre-wrap") {
                            chat.id = `index-${index}`;
                            addRow(index + ". " + chat.innerHTML.slice(0, 12), chat.id);
                            index++;
                        }
                    });
                } catch (e) {
                    console.log("Error detecting text content:", e);
                }
            }
        });
    }
}

function addRow(rowData, id) {
    if (chat_sidebar) {
        const newRow = chat_sidebar.insertRow();
        const cell = newRow.insertCell();
        cell.innerHTML = `<a href="#${id}">${rowData}</a>`;
    } else {
        console.error("Chat sidebar element not found");
    }
}