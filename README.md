# Chat Navigator

## Overview
Chat Navigator is a browser extension designed to enhance the user experience of LLM chat applications by providing an interactive navigation sidebar. The extension automatically indexes conversation messages and enables quick navigation through long chat histories.

## Features
- Real-time message indexing and navigation
- Movable sidebar interface
- Theme customization with multiple color schemes
- Automatic detection of new messages
- Direct message linking and navigation
- Cross-platform compatibility with major LLM chat applications

## Technical Implementation
- Built as a Chrome extension using Manifest V3
- Utilizes MutationObserver for real-time message detection
- Implements drag-and-drop functionality for sidebar positioning
- Features a modular theme system with CSS variables
- Persists user preferences using Chrome Storage API

## Supported Platforms
- ChatGPT (chat.openai.com)
- Claude (claude.ai)
- Perplexity AI (perplexity.ai)
- Other LLM chat applications using article-based message structure

## Installation
1. Clone the repository
2. Open Chrome and navigate to `chrome://extensions/`
3. Enable Developer mode
4. Click "Load unpacked" and select the extension directory
5. The extension will automatically activate on supported chat applications

## Usage
1. Visit any supported LLM chat application
2. The navigation sidebar will appear on the right side of the screen
3. Click any indexed message to navigate directly to that point in the conversation
4. Drag the sidebar to reposition it anywhere on the screen
5. Use the extension popup to customize the theme

## Development
The extension consists of several key components:
- `content.js`: Main extension logic and DOM manipulation
- `popup.html/js`: Theme selection interface
- `style.css`: Theme definitions and UI styling
- `manifest.json`: Extension configuration and permissions

## Future Enhancements
- Message search functionality
- Custom message annotations
- Collapsible conversation sections
- Enhanced theme customization options
- Support for additional chat platforms

## License
[License information to be added]

## Contributing
[Contribution guidelines to be added]
