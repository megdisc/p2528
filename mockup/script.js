// --- State Management ---

// App State
let currentView = 'dashboard';
let globalSettings = {
    primaryColor: '#2563eb',
    font: 'Inter'
};

// CMS Data (Mock)
let cmsArticles = [
    { id: 1, title: '2024年夏季休業のお知らせ', status: 'published', date: '2024-07-15' },
    { id: 2, title: '新サービス「Proプラン」の提供開始', status: 'published', date: '2024-06-01' },
    { id: 3, title: '採用情報：エンジニア募集中', status: 'draft', date: '-' }
];

// Builder State
let sections = [
    {
        id: '1',
        type: 'hero',
        data: {
            title: 'あなたのビジネスを加速させる',
            subtitle: 'ノーコードで美しいWebサイトを数分で構築。',
            buttonText: '無料で始める',
            imageUrl: 'https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&w=1600&q=80'
        }
    },
    {
        id: '2',
        type: 'general',
        data: {
            blocks: [
                { id: 'b1', type: 'heading', content: '主な機能' },
                { id: 'b2', type: 'text', content: '私たちのプラットフォームは、ビジネスの成長を支援するために設計されています。' },
                { id: 'b3', type: 'image', content: 'https://via.placeholder.com/800x400' }
            ]
        }
    }
];
let activeSectionId = null;
let activeBlockId = null; // For block editing

// --- DOM Elements ---

// Navigation
const navItems = document.querySelectorAll('.nav-item');
const viewContainers = document.querySelectorAll('.view-container');

// Settings
const primaryColorInput = document.getElementById('setting-primary-color');
const primaryColorValue = document.getElementById('primary-color-value');
const fontSelect = document.getElementById('setting-font');
const saveSettingsBtn = document.getElementById('save-settings-btn');

// CMS
const cmsList = document.getElementById('cms-article-list');
const addArticleBtn = document.getElementById('add-article-btn');

// Builder
const previewArea = document.getElementById('preview-area');
const editorPanel = document.getElementById('editor-panel');
const editorContent = document.getElementById('editor-content');
const activeSectionName = document.getElementById('active-section-name');
const toolItems = document.querySelectorAll('.tool-item');
const saveBtn = document.getElementById('save-btn');


// --- Initialization ---

function init() {
    setupNavigation();
    setupSettings();
    renderCMS();
    renderBuilder();
    renderBuilderEditor();
    lucide.createIcons();
}

// --- Navigation Logic ---

function setupNavigation() {
    navItems.forEach(item => {
        item.addEventListener('click', () => {
            const view = item.dataset.view;
            switchView(view);
        });
    });
}

function switchView(viewName) {
    currentView = viewName;

    // Update Sidebar
    navItems.forEach(item => {
        if (item.dataset.view === viewName) {
            item.classList.add('active');
        } else {
            item.classList.remove('active');
        }
    });

    // Update Main Content
    viewContainers.forEach(container => {
        if (container.id === `view-${viewName}`) {
            container.style.display = 'flex';
            if (viewName === 'builder') {
                // Trigger resize for layout if needed
            }
        } else {
            container.style.display = 'none';
        }
    });
}

// --- Settings Logic ---

function setupSettings() {
    primaryColorInput.addEventListener('input', (e) => {
        const color = e.target.value;
        primaryColorValue.textContent = color;
        // Live preview (optional)
        document.documentElement.style.setProperty('--primary-color', color);
    });

    saveSettingsBtn.addEventListener('click', () => {
        globalSettings.primaryColor = primaryColorInput.value;
        globalSettings.font = fontSelect.value;

        // Apply Global Styles
        document.documentElement.style.setProperty('--primary-color', globalSettings.primaryColor);
        document.body.style.fontFamily = globalSettings.font === 'serif' ? 'serif' :
            globalSettings.font === 'monospace' ? 'monospace' :
                "'Inter', sans-serif";

        alert('設定を保存しました');
    });
}

// --- CMS Logic ---

function renderCMS() {
    cmsList.innerHTML = cmsArticles.map(article => `
        <tr>
            <td>${escapeHtml(article.title)}</td>
            <td>
                <span class="status-badge ${article.status}">
                    ${article.status === 'published' ? '公開中' : '下書き'}
                </span>
            </td>
            <td>${article.date}</td>
            <td>
                <button class="btn secondary" style="padding: 0.25rem 0.5rem; font-size: 0.75rem;">編集</button>
            </td>
        </tr>
    `).join('');
}

addArticleBtn.addEventListener('click', () => {
    const title = prompt('記事のタイトルを入力してください');
    if (title) {
        cmsArticles.unshift({
            id: Date.now(),
            title: title,
            status: 'draft',
            date: '-'
        });
        renderCMS();
    }
});

// --- Builder Logic ---

function renderBuilder() {
    // Clear preview area (except placeholder if empty)
    if (sections.length === 0) {
        previewArea.innerHTML = '<div class="preview-placeholder"><p>左のツールボックスからセクションを追加してください</p></div>';
        activeSectionId = null;
        renderBuilderEditor();
        return;
    }

    previewArea.innerHTML = '';

    sections.forEach((section, index) => {
        const sectionEl = document.createElement('div');
        sectionEl.className = `preview-section ${section.id === activeSectionId ? 'active' : ''}`;
        sectionEl.onclick = (e) => {
            e.stopPropagation();
            selectSection(section.id);
        };

        // Render content based on type
        let contentHtml = '';
        switch (section.type) {
            case 'header':
                contentHtml = `
                    <header class="comp-header">
                        <div class="logo">${escapeHtml(section.data.logoText)}</div>
                        <nav>
                            ${section.data.links.map(link => `<a href="#">${escapeHtml(link)}</a>`).join('')}
                        </nav>
                    </header>
                `;
                break;
            case 'hero':
                contentHtml = `
                    <div class="comp-hero" style="background-image: linear-gradient(rgba(255,255,255,0.9), rgba(255,255,255,0.9)), url('${section.data.imageUrl}')">
                        <h1>${escapeHtml(section.data.title)}</h1>
                        <p>${escapeHtml(section.data.subtitle)}</p>
                        <a href="#" class="cta-button">${escapeHtml(section.data.buttonText)}</a>
                    </div>
                `;
                break;
            case 'general':
                contentHtml = `<div class="comp-general">`;
                section.data.blocks.forEach(block => {
                    contentHtml += `<div class="block-item block-${block.type}">`;
                    if (block.type === 'heading') {
                        contentHtml += `<h2>${escapeHtml(block.content)}</h2>`;
                    } else if (block.type === 'text') {
                        contentHtml += `<p>${escapeHtml(block.content)}</p>`;
                    } else if (block.type === 'image') {
                        contentHtml += `<img src="${block.content}" alt="Image">`;
                    } else if (block.type === 'table') {
                        // Simple table mock
                        contentHtml += `
                            <div class="block-table">
                                <table>
                                    <thead><tr><th>項目</th><th>内容</th></tr></thead>
                                    <tbody>
                                        <tr><td>サンプル1</td><td>${escapeHtml(block.content)}</td></tr>
                                        <tr><td>サンプル2</td><td>データ</td></tr>
                                    </tbody>
                                </table>
                            </div>
                        `;
                    }
                    contentHtml += `</div>`;
                });
                contentHtml += `</div>`;
                break;
            case 'footer':
                contentHtml = `
                    <footer class="comp-footer">
                        <div class="footer-links">
                            ${section.data.links.map(link => `<a href="#">${escapeHtml(link)}</a>`).join('')}
                        </div>
                        <p>${escapeHtml(section.data.copyright)}</p>
                    </footer>
                `;
                break;
        }

        // Add controls
        const controlsHtml = `
            <div class="section-controls">
                <div class="control-btn" onclick="moveSection('${section.id}', -1); event.stopPropagation();">↑</div>
                <div class="control-btn" onclick="moveSection('${section.id}', 1); event.stopPropagation();">↓</div>
                <div class="control-btn delete" onclick="deleteSection('${section.id}'); event.stopPropagation();">🗑️</div>
            </div>
        `;

        sectionEl.innerHTML = controlsHtml + contentHtml;
        previewArea.appendChild(sectionEl);
    });
}

function renderBuilderEditor() {
    if (!activeSectionId) {
        activeSectionName.textContent = '選択なし';
        editorContent.innerHTML = '<p class="empty-state">プレビューエリアのセクションを選択して編集します。</p>';
        return;
    }

    const section = sections.find(s => s.id === activeSectionId);
    if (!section) return;

    activeSectionName.textContent = getSectionTypeName(section.type);
    editorContent.innerHTML = '';

    // Generate fields based on type
    if (section.type === 'header') {
        createInput('ロゴテキスト', 'logoText', section.data.logoText);
        createInput('リンク1', 'links.0', section.data.links[0]);
        createInput('リンク2', 'links.1', section.data.links[1]);

    } else if (section.type === 'hero') {
        createInput('タイトル', 'title', section.data.title);
        createTextarea('サブタイトル', 'subtitle', section.data.subtitle);
        createInput('ボタンテキスト', 'buttonText', section.data.buttonText);
        createInput('背景画像URL', 'imageUrl', section.data.imageUrl);

    } else if (section.type === 'footer') {
        createInput('コピーライト', 'copyright', section.data.copyright);
        createInput('リンク1', 'links.0', section.data.links[0]);

    } else if (section.type === 'general') {
        // Block Manager UI
        const manager = document.createElement('div');
        manager.className = 'block-manager';

        // List Blocks
        section.data.blocks.forEach((block, index) => {
            const item = document.createElement('div');
            item.className = `block-list-item ${activeBlockId === block.id ? 'selected' : ''}`;
            item.innerHTML = `
                <span class="block-type-label">${getBlockTypeName(block.type)}</span>
                <span style="font-size: 0.75rem; color: #9ca3af;">#${index + 1}</span>
            `;
            item.onclick = () => {
                activeBlockId = block.id;
                renderBuilderEditor(); // Re-render to show block editor
            };
            manager.appendChild(item);
        });

        // Add Block Buttons
        const buttons = document.createElement('div');
        buttons.className = 'add-block-buttons';
        buttons.innerHTML = `
            <button class="add-block-btn" onclick="addBlock('heading')">+ 見出し</button>
            <button class="add-block-btn" onclick="addBlock('text')">+ テキスト</button>
            <button class="add-block-btn" onclick="addBlock('image')">+ 画像</button>
            <button class="add-block-btn" onclick="addBlock('table')">+ 表</button>
        `;
        manager.appendChild(buttons);

        editorContent.appendChild(document.createElement('h4')).textContent = 'ブロック管理';
        editorContent.appendChild(manager);

        // Block Editor (if selected)
        if (activeBlockId) {
            const block = section.data.blocks.find(b => b.id === activeBlockId);
            if (block) {
                editorContent.appendChild(document.createElement('hr'));
                editorContent.appendChild(document.createElement('h4')).textContent = 'ブロック編集';

                if (block.type === 'heading') {
                    createBlockInput('見出しテキスト', block.id, block.content);
                } else if (block.type === 'text') {
                    createBlockTextarea('テキスト内容', block.id, block.content);
                } else if (block.type === 'image') {
                    createBlockInput('画像URL', block.id, block.content);
                } else if (block.type === 'table') {
                    createBlockInput('セル内容 (サンプル)', block.id, block.content);
                }

                // Delete Block Button
                const delBtn = document.createElement('button');
                delBtn.className = 'btn secondary';
                delBtn.style.width = '100%';
                delBtn.style.marginTop = '1rem';
                delBtn.style.color = '#ef4444';
                delBtn.style.borderColor = '#ef4444';
                delBtn.textContent = 'このブロックを削除';
                delBtn.onclick = () => deleteBlock(block.id);
                editorContent.appendChild(delBtn);
            }
        }
    }
}

// --- Helper Functions ---

function createInput(label, key, value) {
    const group = document.createElement('div');
    group.className = 'form-group';
    group.innerHTML = `
        <label>${label}</label>
        <input type="text" class="form-control" value="${escapeHtml(value || '')}" oninput="updateSectionData('${key}', this.value)">
    `;
    editorContent.appendChild(group);
}

function createTextarea(label, key, value) {
    const group = document.createElement('div');
    group.className = 'form-group';
    group.innerHTML = `
        <label>${label}</label>
        <textarea class="form-control" oninput="updateSectionData('${key}', this.value)">${escapeHtml(value || '')}</textarea>
    `;
    editorContent.appendChild(group);
}

function createBlockInput(label, blockId, value) {
    const group = document.createElement('div');
    group.className = 'form-group';
    group.innerHTML = `
        <label>${label}</label>
        <input type="text" class="form-control" value="${escapeHtml(value || '')}" oninput="updateBlockData('${blockId}', this.value)">
    `;
    editorContent.appendChild(group);
}

function createBlockTextarea(label, blockId, value) {
    const group = document.createElement('div');
    group.className = 'form-group';
    group.innerHTML = `
        <label>${label}</label>
        <textarea class="form-control" oninput="updateBlockData('${blockId}', this.value)">${escapeHtml(value || '')}</textarea>
    `;
    editorContent.appendChild(group);
}

function getSectionTypeName(type) {
    const map = {
        header: 'ヘッダー',
        hero: 'ヒーロー',
        general: '汎用セクション',
        footer: 'フッター'
    };
    return map[type] || type;
}

function getBlockTypeName(type) {
    const map = { heading: '見出し', text: 'テキスト', image: '画像', table: '表' };
    return map[type] || type;
}

function escapeHtml(text) {
    if (typeof text !== 'string') return text;
    return text
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
}

// --- Actions ---

function addSection(type) {
    const newId = Date.now().toString();
    let data = {};

    if (type === 'header') {
        data = { logoText: 'My Site', links: ['ホーム', '機能', 'お問い合わせ'] };
    } else if (type === 'hero') {
        data = { title: '新しいヒーロー', subtitle: 'ここにサブタイトルが入ります', buttonText: 'ボタン', imageUrl: '' };
    } else if (type === 'general') {
        data = { blocks: [{ id: Date.now() + 'b', type: 'heading', content: '新しいセクション' }] };
    } else if (type === 'footer') {
        data = { copyright: '© 2024 My Company', links: ['利用規約', 'プライバシーポリシー'] };
    }

    sections.push({ id: newId, type, data });
    selectSection(newId);
    setTimeout(() => {
        previewArea.scrollTop = previewArea.scrollHeight;
    }, 10);
}

function selectSection(id) {
    activeSectionId = id;
    activeBlockId = null; // Reset block selection
    renderBuilder();
    renderBuilderEditor();
}

function updateSectionData(key, value) {
    const section = sections.find(s => s.id === activeSectionId);
    if (!section) return;

    if (key.includes('.')) {
        const parts = key.split('.');
        const arrayName = parts[0];
        const index = parseInt(parts[1]);
        section.data[arrayName][index] = value;
    } else {
        section.data[key] = value;
    }

    updatePreviewOnly();
}

// Block Actions
function addBlock(type) {
    const section = sections.find(s => s.id === activeSectionId);
    if (!section || section.type !== 'general') return;

    const newBlock = {
        id: Date.now().toString(),
        type: type,
        content: type === 'image' ? 'https://via.placeholder.com/400' :
            type === 'heading' ? '新しい見出し' :
                type === 'table' ? 'テーブルデータ' : '新しいテキスト'
    };

    section.data.blocks.push(newBlock);
    activeBlockId = newBlock.id;
    renderBuilder();
    renderBuilderEditor();
}

function updateBlockData(blockId, value) {
    const section = sections.find(s => s.id === activeSectionId);
    if (!section) return;

    const block = section.data.blocks.find(b => b.id === blockId);
    if (block) {
        block.content = value;
        updatePreviewOnly();
    }
}

function deleteBlock(blockId) {
    const section = sections.find(s => s.id === activeSectionId);
    if (!section) return;

    section.data.blocks = section.data.blocks.filter(b => b.id !== blockId);
    activeBlockId = null;
    renderBuilder();
    renderBuilderEditor();
}

function updatePreviewOnly() {
    const currentScroll = previewArea.scrollTop;
    renderBuilder();
    previewArea.scrollTop = currentScroll;
}

function deleteSection(id) {
    if (!confirm('このセクションを削除しますか？')) return;
    sections = sections.filter(s => s.id !== id);
    if (activeSectionId === id) {
        activeSectionId = null;
        renderBuilderEditor();
    }
    renderBuilder();
}

function moveSection(id, direction) {
    const index = sections.findIndex(s => s.id === id);
    if (index === -1) return;

    const newIndex = index + direction;
    if (newIndex < 0 || newIndex >= sections.length) return;

    const temp = sections[index];
    sections[index] = sections[newIndex];
    sections[newIndex] = temp;

    renderBuilder();
}

// --- Event Listeners ---

toolItems.forEach(item => {
    item.addEventListener('click', () => {
        addSection(item.dataset.type);
    });
});

saveBtn.addEventListener('click', () => {
    console.log('Saved JSON:', JSON.stringify(sections, null, 2));
    alert('保存しました（コンソールにJSONを出力）');
});

// Start App
init();
