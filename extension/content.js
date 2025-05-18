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

    document.body.appendChild(chat_sidebar);

    const closeBtn = chat_sidebar.querySelector(".close");
    const minimizeBtn = chat_sidebar.querySelector(".minimize");
    const maximizeBtn = chat_sidebar.querySelector(".maximize");
    
    closeBtn.addEventListener("click", () => {
        chat_sidebar.style.display = "none";
    });
    minimizeBtn.addEventListener("click", () => {
        chat_sidebar.classList.add("minimized");
    });
    maximizeBtn.addEventListener("click", () => {
        chat_sidebar.classList.remove("minimized");
    }); 




    //resizing using jQuery  (for table ; without that right bottom button): 
    $(function() {
        //! Set initial size before making resizable
        chat_sidebar.style.width = '160px';  // Set a reasonable initial width
        chat_sidebar.style.height = '220px'; // Set a reasonable initial height
        
        // Initialize resizable after a small delay
        setTimeout(() => {
            $("#chat").resizable({
                handles: "n, e, s, w, ne, se, sw, nw"
            });
        }, 100);
    });

    // Set initial font size
    chat_sidebar.style.fontSize = '1rem';
    
    // Add a small delay before starting the ResizeObserver
    setTimeout(() => {
        const resizeObserver = new ResizeObserver(() => {
            const width = chat_sidebar.offsetWidth;
            const height = chat_sidebar.offsetHeight;
            const fontSize = Math.min(width, height) / 10;
            //resize buttons of macos-controls  
            const closeBtn = chat_sidebar.querySelector(".close");
            const minimizeBtn = chat_sidebar.querySelector(".minimize");
            const maximizeBtn = chat_sidebar.querySelector(".maximize");
            closeBtn.style.width = `${fontSize}px/4`;
            closeBtn.style.height = `${fontSize}px/4`;
            minimizeBtn.style.width = `${fontSize}px/4`;
            minimizeBtn.style.height = `${fontSize}px/4`;
            maximizeBtn.style.width = `${fontSize}px/4`;
            maximizeBtn.style.height = `${fontSize}px/4`;
            chat_sidebar.style.fontSize = `${fontSize}px`;
        });
        
        resizeObserver.observe(chat_sidebar);
    }, 100);

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
                addRow(index + ". " + chats.innerHTML.substring(0, 14), chats.id);
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