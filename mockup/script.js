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

// Builder State (Existing)
let sections = [
    {
        id: '1',
        type: 'hero',
        data: {
            title: 'あなたのビジネスを加速させる',
            subtitle: 'ノーコードで美しいWebサイトを数分で構築。エンジニアリングの知識は必要ありません。',
            buttonText: '無料で始める',
            imageUrl: 'https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&w=1600&q=80'
        }
    },
    {
        id: '2',
        type: 'features',
        data: {
            title: '主な機能',
            items: [
                { icon: '🚀', title: '爆速構築', text: 'ドラッグ＆ドロップで直感的に操作できます。' },
                { icon: '🎨', title: '美しいデザイン', text: 'プロが作成したテンプレートを使用。' },
                { icon: '📱', title: 'レスポンシブ', text: 'スマホ・タブレットに自動対応。' }
            ]
        }
    }
];
let activeSectionId = null;

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
            container.style.display = 'flex'; // or block depending on layout, flex for builder
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

// --- Builder Logic (Refactored) ---

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
            case 'hero':
                contentHtml = `
                    <div class="comp-hero" style="background-image: linear-gradient(rgba(255,255,255,0.9), rgba(255,255,255,0.9)), url('${section.data.imageUrl}')">
                        <h1>${escapeHtml(section.data.title)}</h1>
                        <p>${escapeHtml(section.data.subtitle)}</p>
                        <a href="#" class="cta-button">${escapeHtml(section.data.buttonText)}</a>
                    </div>
                `;
                break;
            case 'features':
                contentHtml = `
                    <div class="comp-features">
                        <h2>${escapeHtml(section.data.title)}</h2>
                        <div class="features-grid">
                            ${section.data.items.map(item => `
                                <div class="feature-item">
                                    <span class="feature-icon">${item.icon}</span>
                                    <h3>${escapeHtml(item.title)}</h3>
                                    <p>${escapeHtml(item.text)}</p>
                                </div>
                            `).join('')}
                        </div>
                    </div>
                `;
                break;
            case 'text':
                contentHtml = `
                    <div class="comp-text">
                        ${section.data.content}
                    </div>
                `;
                break;
            case 'form':
                contentHtml = `
                    <div class="comp-form">
                        <div class="form-wrapper">
                            <h2>${escapeHtml(section.data.title)}</h2>
                            <div class="dummy-input">お名前</div>
                            <div class="dummy-input">メールアドレス</div>
                            <button class="dummy-submit">${escapeHtml(section.data.buttonText)}</button>
                        </div>
                    </div>
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
    if (section.type === 'hero') {
        createInput('タイトル', 'title', section.data.title);
        createTextarea('サブタイトル', 'subtitle', section.data.subtitle);
        createInput('ボタンテキスト', 'buttonText', section.data.buttonText);
        createInput('背景画像URL', 'imageUrl', section.data.imageUrl);
    } else if (section.type === 'features') {
        createInput('セクションタイトル', 'title', section.data.title);
        // Simplified editing for features items
        const item = section.data.items[0];
        editorContent.appendChild(document.createElement('hr'));
        const note = document.createElement('p');
        note.style.fontSize = '0.75rem';
        note.style.color = '#6b7280';
        note.style.marginBottom = '1rem';
        note.textContent = '※MVP版では最初のアイテムのみ編集可能です';
        editorContent.appendChild(note);

        createInput('アイコン (絵文字)', 'items.0.icon', item.icon);
        createInput('見出し', 'items.0.title', item.title);
        createTextarea('説明文', 'items.0.text', item.text);

    } else if (section.type === 'text') {
        createTextarea('本文 (HTML可)', 'content', section.data.content);
    } else if (section.type === 'form') {
        createInput('フォームタイトル', 'title', section.data.title);
        createInput('送信ボタンテキスト', 'buttonText', section.data.buttonText);
    }
}

// --- Helper Functions (Builder) ---

function createInput(label, key, value) {
    const group = document.createElement('div');
    group.className = 'form-group';
    group.innerHTML = `
        <label>${label}</label>
        <input type="text" class="form-control" value="${escapeHtml(value)}" oninput="updateSectionData('${key}', this.value)">
    `;
    editorContent.appendChild(group);
}

function createTextarea(label, key, value) {
    const group = document.createElement('div');
    group.className = 'form-group';
    group.innerHTML = `
        <label>${label}</label>
        <textarea class="form-control" oninput="updateSectionData('${key}', this.value)">${escapeHtml(value)}</textarea>
    `;
    editorContent.appendChild(group);
}

function getSectionTypeName(type) {
    const map = { hero: 'ヒーロー', features: '特徴リスト', text: 'テキスト', form: 'フォーム' };
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

function addSection(type) {
    const newId = Date.now().toString();
    let data = {};

    if (type === 'hero') {
        data = { title: '新しいヒーロー', subtitle: 'ここにサブタイトルが入ります', buttonText: 'ボタン', imageUrl: '' };
    } else if (type === 'features') {
        data = { title: '特徴', items: [{ icon: '★', title: '特徴1', text: '説明文' }] };
    } else if (type === 'text') {
        data = { content: '<p>ここにテキストを入力してください。</p>' };
    } else if (type === 'form') {
        data = { title: 'お問い合わせ', buttonText: '送信する' };
    }

    sections.push({ id: newId, type, data });
    selectSection(newId);
    setTimeout(() => {
        previewArea.scrollTop = previewArea.scrollHeight;
    }, 10);
}

function selectSection(id) {
    activeSectionId = id;
    renderBuilder();
    renderBuilderEditor();
}

function updateSectionData(key, value) {
    const section = sections.find(s => s.id === activeSectionId);
    if (!section) return;

    if (key.includes('.')) {
        const parts = key.split('.');
        if (parts[0] === 'items') {
            const index = parseInt(parts[1]);
            const prop = parts[2];
            section.data.items[index][prop] = value;
        }
    } else {
        section.data[key] = value;
    }

    updatePreviewOnly();
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

// --- Event Listeners (Builder) ---

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
