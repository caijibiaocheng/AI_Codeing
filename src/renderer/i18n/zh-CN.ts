// 简体中文语言包
export const zhCN = {
  // 通用
  common: {
    save: '保存',
    cancel: '取消',
    close: '关闭',
    open: '打开',
    delete: '删除',
    rename: '重命名',
    refresh: '刷新',
    search: '搜索',
    settings: '设置',
    file: '文件',
    folder: '文件夹',
    loading: '加载中...',
    confirm: '确认',
    yes: '是',
    no: '否',
  },

  // 菜单
  menu: {
    file: '文件',
    openFile: '打开文件',
    openFolder: '打开文件夹',
    saveFile: '保存文件',
    settings: '设置',
    exit: '退出',
  },

  // 侧边栏
  sidebar: {
    explorer: '资源管理器',
    search: '搜索',
    git: 'Git',
    settings: '设置',
    chat: 'AI 聊天',
  },

  // 文件浏览器
  fileExplorer: {
    explorer: '资源管理器',
    noFolderOpened: '未打开文件夹',
    openFolderToStart: '打开一个文件夹以开始',
    newFile: '新建文件',
    newFolder: '新建文件夹',
    rename: '重命名',
    delete: '删除',
    copyPath: '复制路径',
    enterFileName: '请输入文件名：',
    enterFolderName: '请输入文件夹名：',
    enterNewName: '请输入新名称：',
    confirmDelete: '确定要删除 "{0}" 吗？',
  },

  // 标签页
  tabs: {
    unsavedChanges: '"{0}" 有未保存的更改。仍要关闭吗？',
    closeAll: '关闭所有',
    closeOthers: '关闭其他',
  },

  // 快速打开
  quickOpen: {
    title: '快速打开文件',
    placeholder: '输入文件名搜索...',
    noResults: '未找到匹配的文件',
    recentFiles: '最近打开',
  },

  // 全局搜索
  globalSearch: {
    title: '全局搜索',
    searchPlaceholder: '搜索内容...',
    filesPlaceholder: '要包含的文件（如 *.ts）',
    matchCase: '区分大小写',
    useRegex: '使用正则表达式',
    searchButton: '搜索',
    resultsInFiles: '在 {0} 个文件中找到 {1} 个结果',
    noResults: '未找到结果',
  },

  // Git 面板
  git: {
    title: 'GIT',
    branch: '分支',
    changes: '更改',
    modified: '已修改',
    added: '已添加',
    deleted: '已删除',
    untracked: '未跟踪',
    noChanges: '没有更改',
    commitMessage: '提交消息...',
    commitAll: '提交所有',
    refresh: '刷新',
    notGitRepo: '不是 Git 仓库',
    commitSuccess: '提交成功！',
    commitFailed: '提交失败：{0}',
  },

  // AI Composer
  composer: {
    title: 'AI Composer',
    context: '上下文：{0} 个打开的文件',
    promptPlaceholder: `描述你想要在多个文件中进行的更改...

示例：
- 重构 API 调用以使用 async/await
- 为所有函数添加错误处理
- 将所有 React 组件更新为 TypeScript
- 将重复代码提取到工具函数中`,
    generate: '生成编辑',
    generating: '生成中...',
    proposedChanges: '建议的更改（{0} 个文件）',
    applyAll: '应用全部',
    confirmApply: '应用 {0} 个文件的编辑？这将覆盖当前内容。',
    error: '错误：{0}',
  },

  // 聊天面板
  chat: {
    title: 'AI 助手',
    placeholder: '向 AI 提问或请求代码帮助...',
    send: '发送',
    copyCode: '复制代码',
    applyToEditor: '应用到编辑器',
    thinking: '思考中...',
    error: 'AI 错误：{0}',
  },

  // 设置
  settings: {
    title: '设置',
    apiConfiguration: 'API 配置',
    appearance: '外观',
    mcpServers: 'MCP 服务器',
    language: '语言',

    // API 配置
    aiProvider: 'AI 提供商',
    apiKey: 'API 密钥',
    model: '模型',
    temperature: '温度',
    maxTokens: '最大令牌数',
    azureEndpoint: 'Azure 端点',
    azureApiVersion: 'Azure API 版本',
    saveApiSettings: '保存 API 设置',
    apiSettingsSaved: 'API 设置已保存！',
    fillRequired: '请填写 API 密钥和模型',
    fillAzureRequired: '请填写 Azure 端点、API 密钥和部署名称',

    // 外观
    uiTheme: 'UI 主题（聊天面板）',
    editorTheme: '编辑器主题（代码编辑器）',
    fontFamily: '字体系列',
    fontSize: '字体大小',
    lineHeight: '行高',
    darkThemes: '深色主题',
    lightThemes: '浅色主题',
    dark: '深色',
    light: '浅色',
    saveAppearance: '保存外观设置',
    appearanceSaved: '外观设置已保存！',
    themeTip: '💡 提示：Monaco Editor 支持自定义主题。更多主题即将推出！',
    fontTip: '选择你喜欢的编程字体',
    compact: '紧凑',
    normal: '正常',
    spacious: '宽松',
    defaultValue: '默认',

    // MCP
    mcpServerName: '服务器名称',
    mcpCommand: '命令',
    mcpArguments: '参数',
    mcpAddServer: '添加 MCP 服务器',
    mcpActiveServers: '活动服务器：',
    mcpNoServers: '未配置 MCP 服务器',
    mcpRemove: '移除',

    // 语言
    languageSettings: '语言设置',
    displayLanguage: '显示语言',
    selectLanguage: '选择界面语言',
    restartRequired: '更改语言后需要重新加载应用',
  },

  // 编辑器
  editor: {
    welcome: '// 欢迎使用 AI 代码编辑器\n// 开始输入或与 AI 聊天...\n',
    folderOpened: '// 文件夹已打开：{0}\n// 使用 文件 > 打开文件 从此文件夹打开文件',
    openFile: '打开文件',
    openFolder: '打开文件夹',
    noFileOpen: '没有打开的文件',
    formatNotSupported: '当前文件类型不支持格式化',
  },

  // 快捷键提示
  shortcuts: {
    quickOpen: 'Ctrl+P：快速打开',
    globalSearch: 'Ctrl+Shift+F：全局搜索',
    save: 'Ctrl+S：保存',
    gitPanel: 'Ctrl+Shift+G：Git 面板',
    composer: 'Ctrl+Shift+C：AI Composer',
  },

  // TODO 追踪器
  todo: {
    title: 'TODO 追踪器',
    addTodo: '添加 TODO',
    myTodos: '我的 TODO',
    scanned: '扫描的',
    all: '全部',
    active: '进行中',
    completed: '已完成',
    noTodosYet: '暂无 TODO',
    noWorkspaceFolder: '未打开工作区文件夹',
    scanWorkspace: '扫描工作区',
    scanning: '扫描中...',
    text: '内容',
    priority: '优先级',
    high: '高',
    medium: '中',
    low: '低',
    add: '添加',
    goToFile: '跳转到文件',
  },

  // Git Stash
  gitStash: {
    title: 'Git Stash',
    noWorkspaceFolder: '未打开工作区文件夹',
    noStashes: '暂无 Stash',
    saveStash: '保存 Stash',
    message: '消息（可选）',
    save: '保存',
    apply: '应用',
    pop: '弹出',
    drop: '删除',
    clear: '清空全部',
    confirmDrop: '确定要删除这个 stash 吗？',
    confirmClear: '确定要清空所有 stash 吗？此操作不可撤销！',
    viewChanges: '查看更改',
    branch: '分支',
  },

  // 开发工具
  tools: {
    title: '开发工具',
    httpClient: 'HTTP 客户端',
    httpClientDesc: '测试 REST API 和 HTTP 请求，支持自定义请求头和请求体',
    regexTester: '正则测试器',
    regexTesterDesc: '测试和调试正则表达式，实时匹配和分组显示',
    colorPicker: '颜色选择器',
    colorPickerDesc: '选择颜色并在 HEX、RGB、HSL 格式之间转换',
    jsonViewer: 'JSON 查看器',
    jsonViewerDesc: '格式化、验证和分析 JSON 数据',
    codeAnalysis: '代码分析',
    codeAnalysisDesc: '分析代码问题、复杂度和最佳实践',
    back: '返回',
    send: '发送',
    sending: '发送中...',
    request: '请求',
    response: '响应',
    headers: '请求头',
    body: '请求体',
    addHeader: '添加请求头',
    remove: '移除',
    loadSample: '加载示例',
    clear: '清除',
    copy: '复制',
    copied: '已复制！',
    analyze: '分析代码',
    results: '结果',
    errors: '错误',
    warnings: '警告',
    info: '信息',
    lines: '行数',
    complexity: '复杂度',
    noIssues: '未发现问题！代码看起来很干净。',
  },

  // 错误消息
  errors: {
    failedToLoadFile: '加载文件失败',
    failedToSaveFile: '保存文件失败',
    failedToReadDir: '读取目录失败',
    failedToCreateFile: '创建文件失败',
    failedToCreateFolder: '创建文件夹失败',
    failedToRename: '重命名失败',
    failedToDelete: '删除失败',
    electronAPINotAvailable: 'electronAPI 未注入，IPC 不可用',
    runWithElectron: '请通过 npm start 或打包应用运行，不要直接打开 dist/renderer/index.html。',
  },
};

export type TranslationKeys = typeof zhCN;
