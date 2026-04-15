# AsciiDoc Alive

[AsciiDoc Alive](https://asciidocalive.draftview.app/) is a live AsciiDoc editor with real-time preview, syntax highlighting, and export functionality.

<img src="https://raw.githubusercontent.com/gaurav-nelson/asciidocalive/refs/heads/main/public/og-image-asciidocalive.png" style="image-rendering:-webkit-optimize-contrast;">

> Why? Because I wanted a simple, clean, and fast AsciiDoc editor since asciidoclive.com is not working right now.

> Need feedback on the AsciiDoc you are previewing? Review it visually with [DraftView](https://www.draftview.app/).

## 🔄 Important: For Existing Users

**If you're seeing an old version of the app, please perform a hard refresh:**
- **Windows/Linux**: Press `Ctrl + Shift + R` or `Ctrl + F5`
- **Mac**: Press `Cmd + Shift + R` or `Shift + Reload Button`
- **Mobile**: Clear browser cache or force close and reopen the browser

This is a one-time action. Future updates will load automatically!

## Use Cases

- Draft and preview AsciiDoc in the browser without installing anything
- Work across multiple documents in one session
- Share a document instantly with a compressed URL
- Save drafts to GitHub Gist and load them back later
- Review diagrams, math, and structured technical content on desktop or mobile

## Features

### Editing Experience
- **Real-time Preview**: See your AsciiDoc rendered as you type
- **Formatting Toolbar**: Insert bold, italic, headings, links, tables, code blocks, and more with one click
- **Keyboard Shortcuts**: Fast editing shortcuts including `Ctrl+B`, `Ctrl+I`, and `Ctrl+K`
- **Syntax Highlighting**: Code highlighting with line numbering
- **Synchronized Scrolling**: Editor and preview scroll together for easy navigation
- **Document Outline**: See all headings in the sidebar and jump to sections quickly
- **Focus Mode**: Distraction-free writing environment
- **Dark Mode**: Toggle between light and dark themes
- **Experimental UI Elements**: Preview support for keyboard shortcuts, buttons, and menu UI macros

### Document Management & Sharing
- **Multi-Document Management**: Create, rename, and switch between multiple documents from the sidebar
- **Auto-save**: Your work is saved automatically to IndexedDB
- **URL-Based Sharing**: Share your document as a compressed URL so others can open their own copy instantly
- **GitHub Gist Integration**: Save documents to GitHub Gist and load them back using your Personal Access Token

### File Handling
- **Import**: Load local AsciiDoc files or fetch from GitHub and GitLab URLs
- **Export**: Save as HTML, PDF, or AsciiDoc format

### Diagrams & Mathematical Expressions
- **Kroki Diagram Support**: Render diagrams using [Kroki.io](https://kroki.io)
  - Supports PlantUML, Mermaid, GraphViz, Ditaa, and many more diagram types
  - Intelligent caching for better performance
  - Refresh diagrams on demand
- **MathJax Integration**: Render mathematical expressions and formulas beautifully

### Performance, Privacy & Device Support
- **Fully Functional on Mobile**: Edit, preview, and manage documents comfortably on mobile devices
- **Offline Support**: Works completely offline as a Progressive Web App (PWA)
- **IndexedDB Storage**: Fast, reliable local storage for your documents
- **No Registration Required**: Start writing immediately
- **Privacy First**: No ads, tracking, or cookies
- **Diagram Caching**: Kroki diagrams are cached locally to reduce network requests

## Install as a Progressive Web App

AsciiDoc Alive works well in the browser and is now fully usable on mobile. You can also install it as a web app on your device for a more native app-like experience:

- **Desktop**: Use the "Install" option in your browser's menu (Chrome, Edge, Firefox).
    ![Image](https://github.com/user-attachments/assets/b2f73c8c-b5b8-423c-9abd-469415ead94a)

    ![Image](https://github.com/user-attachments/assets/c6872173-37d4-400f-a2e0-82d2a181d4f7)
- **Mobile**: Use the "Add to Home Screen" option in your browser's menu (Chrome, Safari).
