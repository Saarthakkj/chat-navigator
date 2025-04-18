# Chat Navigator

## Overview
Chat Navigator is a browser extension that enhances your experience with LLM chat applications by creating a navigable sidebar that indexes all conversation messages. This makes it easier to find and jump to specific parts of long conversations.

## Features
- **Automatic Message Indexing**: Automatically detects and indexes messages in the chat interface
- **Quick Navigation**: Provides clickable links to jump directly to specific messages
- **Real-time Updates**: Dynamically updates as new messages appear in the conversation
- **Unobtrusive Design**: Sits in a movable sidebar that doesn't interfere with the main chat interface

## How It Works
The extension:
1. Injects a sidebar into the page when you visit a supported LLM chat application
2. Scans the page for existing chat messages and indexes them
3. Watches for new messages as the conversation progresses and adds them to the index
4. Provides clickable links that scroll directly to the selected message

## Installation
1. Download the extension files
2. In Chrome, go to `chrome://extensions/`
3. Enable "Developer mode" in the top right
4. Click "Load unpacked" and select the extension directory
5. The extension will automatically activate when you visit supported chat applications

## Supported Applications
Currently works with LLM chat applications that use the article element structure for conversation messages.

## Customization
You can customize the extension by modifying the appearance settings in the content.js file. Look for the styling section where you can adjust properties like position, size, and colors.

## Future Improvements
- Ability to rename/add notes to conversation entries
- Search functionality within the sidebar
- Collapsible sections for long conversations
- User-configurable appearance settings
