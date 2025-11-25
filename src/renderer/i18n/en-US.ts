// English (US) Language Pack
import { TranslationKeys } from './zh-CN';

export const enUS: TranslationKeys = {
  // Common
  common: {
    save: 'Save',
    cancel: 'Cancel',
    close: 'Close',
    open: 'Open',
    delete: 'Delete',
    rename: 'Rename',
    refresh: 'Refresh',
    search: 'Search',
    settings: 'Settings',
    file: 'File',
    folder: 'Folder',
    loading: 'Loading...',
    confirm: 'Confirm',
    yes: 'Yes',
    no: 'No',
  },

  // Menu
  menu: {
    file: 'File',
    openFile: 'Open File',
    openFolder: 'Open Folder',
    saveFile: 'Save File',
    settings: 'Settings',
    exit: 'Exit',
  },

  // Sidebar
  sidebar: {
    explorer: 'Explorer',
    search: 'Search',
    git: 'Git',
    settings: 'Settings',
    chat: 'AI Chat',
  },

  // File Explorer
  fileExplorer: {
    explorer: 'EXPLORER',
    noFolderOpened: 'No folder opened',
    openFolderToStart: 'Open a folder to get started',
    newFile: 'New File',
    newFolder: 'New Folder',
    rename: 'Rename',
    delete: 'Delete',
    copyPath: 'Copy Path',
    enterFileName: 'Enter file name:',
    enterFolderName: 'Enter folder name:',
    enterNewName: 'Enter new name:',
    confirmDelete: 'Are you sure you want to delete "{0}"?',
  },

  // Tabs
  tabs: {
    unsavedChanges: '"{0}" has unsaved changes. Close anyway?',
    closeAll: 'Close All',
    closeOthers: 'Close Others',
  },

  // Quick Open
  quickOpen: {
    title: 'Quick Open',
    placeholder: 'Type to search files...',
    noResults: 'No matching files found',
    recentFiles: 'Recent Files',
  },

  // Global Search
  globalSearch: {
    title: 'Search',
    searchPlaceholder: 'Search...',
    filesPlaceholder: 'Files to include (e.g. *.ts)',
    matchCase: 'Match Case',
    useRegex: 'Use Regular Expression',
    searchButton: 'Search',
    resultsInFiles: '{0} results in {1} files',
    noResults: 'No results found',
  },

  // Git Panel
  git: {
    title: 'GIT',
    branch: 'Branch',
    changes: 'Changes',
    modified: 'Modified',
    added: 'Added',
    deleted: 'Deleted',
    untracked: 'Untracked',
    noChanges: 'No changes',
    commitMessage: 'Commit message...',
    commitAll: 'Commit All',
    refresh: 'Refresh',
    notGitRepo: 'Not a git repository',
    commitSuccess: 'Committed successfully!',
    commitFailed: 'Commit failed: {0}',
  },

  // AI Composer
  composer: {
    title: 'AI Composer',
    context: 'Context: {0} open files',
    promptPlaceholder: `Describe what you want to change across multiple files...

Examples:
- Refactor the API calls to use async/await
- Add error handling to all functions
- Update all React components to use TypeScript
- Extract repeated code into a utility function`,
    generate: 'Generate Edits',
    generating: 'Generating...',
    proposedChanges: 'Proposed Changes ({0} files)',
    applyAll: 'Apply All',
    confirmApply: 'Apply {0} file edit(s)? This will overwrite the current content.',
    error: 'Error: {0}',
  },

  // Chat Panel
  chat: {
    title: 'AI Assistant',
    placeholder: 'Ask AI or request code help...',
    send: 'Send',
    copyCode: 'Copy Code',
    applyToEditor: 'Apply to Editor',
    thinking: 'Thinking...',
    error: 'AI Error: {0}',
  },

  // Settings
  settings: {
    title: 'Settings',
    apiConfiguration: 'API Configuration',
    appearance: 'Appearance',
    mcpServers: 'MCP Servers',
    language: 'Language',

    // API Configuration
    aiProvider: 'AI Provider',
    apiKey: 'API Key',
    model: 'Model',
    temperature: 'Temperature',
    maxTokens: 'Max Tokens',
    azureEndpoint: 'Azure Endpoint',
    azureApiVersion: 'Azure API Version',
    saveApiSettings: 'Save API Settings',
    apiSettingsSaved: 'API settings saved successfully!',
    fillRequired: 'Please fill API Key and Model',
    fillAzureRequired: 'Please fill Azure Endpoint, API Key, and deployment name',

    // Appearance
    uiTheme: 'UI Theme (Chat Panel)',
    editorTheme: 'Editor Theme (Code Editor)',
    fontFamily: 'Font Family',
    fontSize: 'Font Size',
    lineHeight: 'Line Height',
    darkThemes: 'Dark Themes',
    lightThemes: 'Light Themes',
    dark: 'Dark',
    light: 'Light',
    saveAppearance: 'Save Appearance Settings',
    appearanceSaved: 'Appearance settings saved!',
    themeTip: '💡 Tip: Monaco Editor supports custom themes. More themes coming soon!',
    fontTip: 'Choose your preferred coding font',
    compact: 'Compact',
    normal: 'Normal',
    spacious: 'Spacious',
    defaultValue: 'default',

    // MCP
    mcpServerName: 'Server Name',
    mcpCommand: 'Command',
    mcpArguments: 'Arguments',
    mcpAddServer: 'Add MCP Server',
    mcpActiveServers: 'Active Servers:',
    mcpNoServers: 'No MCP servers configured',
    mcpRemove: 'Remove',

    // Language
    languageSettings: 'Language Settings',
    displayLanguage: 'Display Language',
    selectLanguage: 'Select interface language',
    restartRequired: 'Reload required after changing language',
  },

  // Editor
  editor: {
    welcome: '// Welcome to AI Code Editor\n// Start typing or chat with AI...\n',
    folderOpened: '// Folder opened: {0}\n// Use File > Open File to open a file from this folder',
    openFile: 'Open File',
    openFolder: 'Open Folder',
    noFileOpen: 'No file open',
    formatNotSupported: 'Current file type does not support formatting',
  },

  // Shortcuts
  shortcuts: {
    quickOpen: 'Ctrl+P: Quick Open',
    globalSearch: 'Ctrl+Shift+F: Global Search',
    save: 'Ctrl+S: Save',
    gitPanel: 'Ctrl+Shift+G: Git Panel',
    composer: 'Ctrl+Shift+C: AI Composer',
  },

  // TODO Tracker
  todo: {
    title: 'TODO Tracker',
    addTodo: 'Add TODO',
    myTodos: 'My TODOs',
    scanned: 'Scanned',
    all: 'All',
    active: 'Active',
    completed: 'Completed',
    noTodosYet: 'No TODOs yet',
    noWorkspaceFolder: 'No workspace folder open',
    scanWorkspace: 'Scan Workspace',
    scanning: 'Scanning...',
    text: 'Text',
    priority: 'Priority',
    high: 'High',
    medium: 'Medium',
    low: 'Low',
    add: 'Add',
    goToFile: 'Go to file',
  },

  // Git Stash
  gitStash: {
    title: 'Git Stash',
    noWorkspaceFolder: 'No workspace folder open',
    noStashes: 'No stashes',
    saveStash: 'Save Stash',
    message: 'Message (optional)',
    save: 'Save',
    apply: 'Apply',
    pop: 'Pop',
    drop: 'Drop',
    clear: 'Clear All',
    confirmDrop: 'Are you sure you want to drop this stash?',
    confirmClear: 'Are you sure you want to clear all stashes? This cannot be undone!',
    viewChanges: 'View Changes',
    branch: 'Branch',
  },

  // Developer Tools
  tools: {
    title: 'Developer Tools',
    httpClient: 'HTTP Client',
    httpClientDesc: 'Test REST APIs and HTTP requests with custom headers and body',
    regexTester: 'Regex Tester',
    regexTesterDesc: 'Test and debug regular expressions with live matching and groups',
    colorPicker: 'Color Picker',
    colorPickerDesc: 'Pick colors and convert between HEX, RGB, HSL formats',
    jsonViewer: 'JSON Viewer',
    jsonViewerDesc: 'Format, validate, and analyze JSON data with statistics',
    codeAnalysis: 'Code Analysis',
    codeAnalysisDesc: 'Analyze code for issues, complexity, and best practices',
    back: 'Back',
    send: 'Send',
    sending: 'Sending...',
    request: 'Request',
    response: 'Response',
    headers: 'Headers',
    body: 'Body',
    addHeader: 'Add Header',
    remove: 'Remove',
    loadSample: 'Load Sample',
    clear: 'Clear',
    copy: 'Copy',
    copied: 'Copied!',
    analyze: 'Analyze Code',
    results: 'Results',
    errors: 'Errors',
    warnings: 'Warnings',
    info: 'Info',
    lines: 'Lines',
    complexity: 'Complexity',
    noIssues: 'No issues found! Your code looks clean.',
  },

  // Error Messages
  errors: {
    failedToLoadFile: 'Failed to load file',
    failedToSaveFile: 'Failed to save file',
    failedToReadDir: 'Failed to read directory',
    failedToCreateFile: 'Failed to create file',
    failedToCreateFolder: 'Failed to create folder',
    failedToRename: 'Failed to rename',
    failedToDelete: 'Failed to delete',
    electronAPINotAvailable: 'electronAPI not injected, IPC unavailable',
    runWithElectron: 'Please run via npm start or packaged app, do not open dist/renderer/index.html directly.',
  },
};
