/**
 * 项目模板管理器
 * 创建和管理项目模板，快速初始化新项目
 */
import React, { useState, useEffect } from 'react';
import { useApp } from '../contexts/AppContext';

interface ProjectTemplate {
  id: string;
  name: string;
  description: string;
  category: 'frontend' | 'backend' | 'fullstack' | 'mobile' | 'desktop' | 'library' | 'other';
  language: string;
  framework?: string;
  files: TemplateFile[];
  dependencies?: Record<string, string>;
  scripts?: Record<string, string>;
  createdAt: number;
  updatedAt: number;
}

interface TemplateFile {
  path: string;
  content: string;
  isTemplate?: boolean;
}

const ProjectTemplatesPanel: React.FC<{ onClose: () => void }> = ({ onClose }) => {
  const { currentFolder, setCurrentFolder } = useApp();
  const [templates, setTemplates] = useState<ProjectTemplate[]>([]);
  const [selectedTemplate, setSelectedTemplate] = useState<ProjectTemplate | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [isCreating, setIsCreating] = useState(false);
  const [newProjectName, setNewProjectName] = useState('');
  const [newProjectPath, setNewProjectPath] = useState('');

  // 内置模板
  const builtinTemplates: ProjectTemplate[] = [
    {
      id: 'react-typescript',
      name: 'React + TypeScript',
      description: '现代React应用模板，使用TypeScript和Vite',
      category: 'frontend',
      language: 'TypeScript',
      framework: 'React',
      files: [
        {
          path: 'package.json',
          content: `{
  "name": "{{projectName}}",
  "version": "0.1.0",
  "type": "module",
  "scripts": {
    "dev": "vite",
    "build": "tsc && vite build",
    "preview": "vite preview"
  },
  "dependencies": {
    "react": "^18.2.0",
    "react-dom": "^18.2.0"
  },
  "devDependencies": {
    "@types/react": "^18.2.0",
    "@types/react-dom": "^18.2.0",
    "@vitejs/plugin-react": "^4.0.0",
    "typescript": "^5.0.0",
    "vite": "^4.4.0"
  }
}`,
          isTemplate: true
        },
        {
          path: 'src/App.tsx',
          content: `import React from 'react';

function App() {
  return (
    <div className="App">
      <header className="App-header">
        <h1>{{projectName}}</h1>
        <p>Welcome to your new React + TypeScript project!</p>
      </header>
    </div>
  );
}

export default App;`,
          isTemplate: true
        },
        {
          path: 'src/main.tsx',
          content: `import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './index.css';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
);`
        },
        {
          path: 'index.html',
          content: `<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <link rel="icon" type="image/svg+xml" href="/vite.svg" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>{{projectName}}</title>
  </head>
  <body>
    <div id="root"></div>
    <script type="module" src="/src/main.tsx"></script>
  </body>
</html>`,
          isTemplate: true
        }
      ],
      createdAt: Date.now(),
      updatedAt: Date.now()
    },
    {
      id: 'node-express',
      name: 'Node.js + Express',
      description: 'Express.js后端API模板',
      category: 'backend',
      language: 'JavaScript',
      framework: 'Express',
      files: [
        {
          path: 'package.json',
          content: `{
  "name": "{{projectName}}",
  "version": "1.0.0",
  "description": "{{description}}",
  "main": "src/index.js",
  "scripts": {
    "start": "node src/index.js",
    "dev": "nodemon src/index.js",
    "test": "jest"
  },
  "dependencies": {
    "express": "^4.18.0",
    "cors": "^2.8.5",
    "helmet": "^7.0.0",
    "morgan": "^1.10.0"
  },
  "devDependencies": {
    "nodemon": "^3.0.0",
    "jest": "^29.0.0"
  }
}`,
          isTemplate: true
        },
        {
          path: 'src/index.js',
          content: `const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(helmet());
app.use(cors());
app.use(morgan('combined'));
app.use(express.json());

// Routes
app.get('/', (req, res) => {
  res.json({ message: 'Welcome to {{projectName}} API!' });
});

app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

// Error handling
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Something went wrong!' });
});

app.listen(PORT, () => {
  console.log(\`Server is running on port \${PORT}\`);
});`,
          isTemplate: true
        }
      ],
      createdAt: Date.now(),
      updatedAt: Date.now()
    },
    {
      id: 'python-flask',
      name: 'Python + Flask',
      description: 'Flask Web应用模板',
      category: 'backend',
      language: 'Python',
      framework: 'Flask',
      files: [
        {
          path: 'requirements.txt',
          content: `Flask==2.3.0
Flask-CORS==4.0.0
python-dotenv==1.0.0
gunicorn==21.0.0`
        },
        {
          path: 'app.py',
          content: `from flask import Flask, jsonify
from flask_cors import CORS
import os
from datetime import datetime

app = Flask(__name__)
CORS(app)

@app.route('/')
def home():
    return jsonify({
        'message': 'Welcome to {{projectName}}!',
        'timestamp': datetime.utcnow().isoformat()
    })

@app.route('/api/health')
def health():
    return jsonify({'status': 'OK'})

if __name__ == '__main__':
    port = int(os.environ.get('PORT', 5000))
    app.run(debug=True, host='0.0.0.0', port=port)`,
          isTemplate: true
        }
      ],
      createdAt: Date.now(),
      updatedAt: Date.now()
    }
  ];

  useEffect(() => {
    loadTemplates();
  }, []);

  const loadTemplates = async () => {
    try {
      if (window.electronAPI) {
        const customTemplates = await window.electronAPI.getProjectTemplates();
        setTemplates([...builtinTemplates, ...customTemplates]);
      } else {
        setTemplates(builtinTemplates);
      }
    } catch (error) {
      console.error('[ProjectTemplatesPanel] Failed to load templates:', error);
      setTemplates(builtinTemplates);
    }
  };

  const filteredTemplates = templates.filter(template => {
    const matchesSearch = template.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         template.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || template.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const handleCreateProject = async () => {
    if (!selectedTemplate || !newProjectName || !newProjectPath) {
      return;
    }

    setIsCreating(true);
    try {
      if (window.electronAPI) {
        // 替换模板变量
        const processedFiles = selectedTemplate.files.map(file => ({
          ...file,
          content: file.isTemplate 
            ? file.content.replace(/\{\{projectName\}\}/g, newProjectName)
                           .replace(/\{\{description\}\}/g, selectedTemplate.description)
            : file.content
        }));

        const result = await window.electronAPI.createProjectFromTemplate(
          newProjectPath,
          newProjectName,
          processedFiles,
          selectedTemplate.dependencies,
          selectedTemplate.scripts
        );

        if (result.success) {
          // 打开新项目
          setCurrentFolder(result.projectPath);
          onClose();
        } else {
          console.error('[ProjectTemplatesPanel] Failed to create project:', result.error);
        }
      }
    } catch (error) {
      console.error('[ProjectTemplatesPanel] Error creating project:', error);
    } finally {
      setIsCreating(false);
    }
  };

  const getCategoryIcon = (category: string) => {
    const icons = {
      frontend: '⚛️',
      backend: '🔧',
      fullstack: '🌐',
      mobile: '📱',
      desktop: '🖥️',
      library: '📚',
      other: '📦'
    };
    return icons[category as keyof typeof icons] || '📦';
  };

  const categories = [
    { value: 'all', label: '全部' },
    { value: 'frontend', label: '前端' },
    { value: 'backend', label: '后端' },
    { value: 'fullstack', label: '全栈' },
    { value: 'mobile', label: '移动端' },
    { value: 'desktop', label: '桌面端' },
    { value: 'library', label: '库/框架' },
    { value: 'other', label: '其他' }
  ];

  return (
    <div className="side-panel">
      <div className="panel-header">
        <div className="panel-title">
          <span>📁</span>
          <span>项目模板</span>
        </div>
        <button className="panel-close" onClick={onClose}>×</button>
      </div>

      <div className="panel-toolbar">
        <input
          type="text"
          className="panel-search"
          placeholder="搜索模板..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
        <select
          className="panel-filter"
          value={selectedCategory}
          onChange={(e) => setSelectedCategory(e.target.value)}
        >
          {categories.map(cat => (
            <option key={cat.value} value={cat.value}>{cat.label}</option>
          ))}
        </select>
      </div>

      <div className="panel-content">
        <div className="templates-grid">
          {filteredTemplates.map(template => (
            <div
              key={template.id}
              className={`template-card ${selectedTemplate?.id === template.id ? 'selected' : ''}`}
              onClick={() => setSelectedTemplate(template)}
            >
              <div className="template-header">
                <span className="template-icon">{getCategoryIcon(template.category)}</span>
                <h3 className="template-name">{template.name}</h3>
              </div>
              <p className="template-description">{template.description}</p>
              <div className="template-meta">
                <span className="template-language">{template.language}</span>
                {template.framework && (
                  <span className="template-framework">{template.framework}</span>
                )}
              </div>
              <div className="template-stats">
                <span>{template.files.length} 个文件</span>
                {template.dependencies && (
                  <span>{Object.keys(template.dependencies).length} 个依赖</span>
                )}
              </div>
            </div>
          ))}
        </div>

        {selectedTemplate && (
          <div className="template-config">
            <h3>配置新项目</h3>
            <div className="form-group">
              <label>项目名称:</label>
              <input
                type="text"
                value={newProjectName}
                onChange={(e) => setNewProjectName(e.target.value)}
                placeholder="输入项目名称"
              />
            </div>
            <div className="form-group">
              <label>项目路径:</label>
              <div className="path-input-group">
                <input
                  type="text"
                  value={newProjectPath}
                  onChange={(e) => setNewProjectPath(e.target.value)}
                  placeholder="选择项目路径"
                />
                <button 
                  className="browse-button"
                  onClick={() => {
                    // 触发文件夹选择对话框
                    if (window.electronAPI) {
                      window.electronAPI.showOpenDialog({
                        properties: ['openDirectory']
                      }).then((result: any) => {
                        if (!result.canceled && result.filePaths.length > 0) {
                          setNewProjectPath(result.filePaths[0]);
                        }
                      });
                    }
                  }}
                >
                  浏览
                </button>
              </div>
            </div>
            <button 
              className="create-project-button"
              onClick={handleCreateProject}
              disabled={!newProjectName || !newProjectPath || isCreating}
            >
              {isCreating ? '创建中...' : '创建项目'}
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default ProjectTemplatesPanel;