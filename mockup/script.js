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

// --- DOM Elements ---

// Updated selector for sidebar items
const sidebarItems = document.querySelectorAll('.sidebar-item[data-view]');
const viewContainers = document.querySelectorAll('.view-container');
const primaryColorInput = document.getElementById('setting-primary-color');
const primaryColorValue = document.getElementById('primary-color-value');
const fontSelect = document.getElementById('setting-font');
const saveSettingsBtn = document.getElementById('save-settings-btn');
const cmsList = document.getElementById('cms-article-list');
const addArticleBtn = document.getElementById('add-article-btn');
const previewArea = document.getElementById('preview-area');

// Palette Elements
const blockTools = document.getElementById('block-tools');
const saveBtn = document.getElementById('save-btn');
const previewBtn = document.getElementById('preview-btn');


// --- Initialization ---

function init() {
    setupNavigation();
    setupSettings();
    renderCMS();
    renderBuilder();
    lucide.createIcons();

    // Show initial view
    switchView('dashboard');
}

// --- Navigation Logic ---

function setupNavigation() {
    sidebarItems.forEach(item => {
        item.addEventListener('click', () => {
            const view = item.dataset.view;
            if (view) switchView(view);
        });
    });
}

function switchView(viewName) {
    if (currentView === viewName && document.getElementById(`view-${viewName}`).classList.contains('active-view')) return;

    currentView = viewName;

    // Update Sidebar Active State
    sidebarItems.forEach(item => {
        if (item.dataset.view === viewName) {
            item.classList.add('active');
        } else {
            item.classList.remove('active');
        }
    });

    // Handle View Transition
    viewContainers.forEach(container => {
        if (container.id === `view-${viewName}`) {
            container.style.display = 'flex';
            // Trigger reflow to enable transition
            void container.offsetWidth;
            container.classList.add('active-view');
        } else {
            container.classList.remove('active-view');
            container.style.display = 'none';
        }
    });
}

// --- Settings Logic ---

function setupSettings() {
    primaryColorInput.addEventListener('input', (e) => {
        const color = e.target.value;
        primaryColorValue.textContent = color;
        document.documentElement.style.setProperty('--primary-color', color);
    });

    saveSettingsBtn.addEventListener('click', () => {
        globalSettings.primaryColor = primaryColorInput.value;
        globalSettings.font = fontSelect.value;
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

// --- Builder Logic (Inline Editing) ---

function renderBuilder() {
    // Clear content but keep palette (palette is fixed outside preview-area inner content flow, but inside the container)
    // Actually, palette is inside preview-area in HTML, so we should preserve it or re-append it.
    // Better to clear only sections.

    // Let's clear everything and re-append palette if it was there, or just assume palette is fixed overlay.
    // In current HTML structure, palette is inside preview-area.
    const palette = document.getElementById('editor-palette');
    previewArea.innerHTML = '';
    if (palette) previewArea.appendChild(palette);

    if (sections.length === 0) {
        const placeholder = document.createElement('div');
        placeholder.className = 'preview-placeholder';
        placeholder.innerHTML = '<p>下のパレットからセクションを追加してください</p>';
        previewArea.appendChild(placeholder);
    }

    sections.forEach((section, index) => {
        const sectionEl = document.createElement('div');
        sectionEl.className = `preview-section ${section.id === activeSectionId ? 'active' : ''}`;
        sectionEl.onclick = (e) => {
            e.stopPropagation();
            activeSectionId = section.id;
            renderBuilder(); // Re-render to show controls and update palette state
        };

        // Render content based on type
        let contentHtml = '';
        switch (section.type) {
            case 'header':
                contentHtml = `
                    <header class="comp-header">
                        <div class="logo" contenteditable="true" onblur="updateSectionData('${section.id}', 'logoText', this.innerText)">${escapeHtml(section.data.logoText)}</div>
                        <nav>
                            ${section.data.links.map((link, i) => `<a href="#" contenteditable="true" onblur="updateSectionData('${section.id}', 'links.${i}', this.innerText)">${escapeHtml(link)}</a>`).join('')}
                        </nav>
                    </header>
                `;
                break;
            case 'hero':
                contentHtml = `
                    <div class="comp-hero" style="background-image: linear-gradient(rgba(255,255,255,0.9), rgba(255,255,255,0.9)), url('${section.data.imageUrl}')">
                        <h1 contenteditable="true" onblur="updateSectionData('${section.id}', 'title', this.innerText)">${escapeHtml(section.data.title)}</h1>
                        <p contenteditable="true" onblur="updateSectionData('${section.id}', 'subtitle', this.innerText)">${escapeHtml(section.data.subtitle)}</p>
                        <a href="#" class="cta-button" contenteditable="true" onblur="updateSectionData('${section.id}', 'buttonText', this.innerText)">${escapeHtml(section.data.buttonText)}</a>
                        <div style="margin-top: 1rem;">
                            <button class="btn secondary" onclick="updateImage('${section.id}', 'imageUrl'); event.stopPropagation();" style="font-size: 0.75rem;">背景画像を変更</button>
                        </div>
                    </div>
                `;
                break;
            case 'general':
                contentHtml = `<div class="comp-general">`;
                section.data.blocks.forEach(block => {
                    contentHtml += `<div class="block-item block-${block.type}">`;

                    // Block Controls
                    contentHtml += `
                        <div class="block-controls">
                            <div class="block-control-btn" onclick="moveBlock('${section.id}', '${block.id}', -1); event.stopPropagation();">↑</div>
                            <div class="block-control-btn" onclick="moveBlock('${section.id}', '${block.id}', 1); event.stopPropagation();">↓</div>
                            <div class="block-control-btn" onclick="deleteBlock('${section.id}', '${block.id}'); event.stopPropagation();" style="color: #ef4444;">🗑️</div>
                        </div>
                    `;

                    if (block.type === 'heading') {
                        contentHtml += `<h2 contenteditable="true" onblur="updateBlockData('${section.id}', '${block.id}', this.innerText)">${escapeHtml(block.content)}</h2>`;
                    } else if (block.type === 'text') {
                        contentHtml += `<p contenteditable="true" onblur="updateBlockData('${section.id}', '${block.id}', this.innerText)">${escapeHtml(block.content)}</p>`;
                    } else if (block.type === 'image') {
                        contentHtml += `<img src="${block.content}" alt="Image" class="editable-image" onclick="updateBlockData('${section.id}', '${block.id}', null, true); event.stopPropagation();">`;
                    } else if (block.type === 'table') {
                        contentHtml += `
                            <div class="block-table">
                                <table>
                                    <thead><tr><th>項目</th><th>内容</th></tr></thead>
                                    <tbody>
                                        <tr><td>サンプル</td><td contenteditable="true" onblur="updateBlockData('${section.id}', '${block.id}', this.innerText)">${escapeHtml(block.content)}</td></tr>
                                    </tbody>
                                </table>
                            </div>
                        `;
                    }
                    contentHtml += `</div>`;
                });

                // No inline add block buttons anymore
                contentHtml += `</div>`;
                break;
            case 'footer':
                contentHtml = `
                    <footer class="comp-footer">
                        <div class="footer-links">
                            ${section.data.links.map((link, i) => `<a href="#" contenteditable="true" onblur="updateSectionData('${section.id}', 'links.${i}', this.innerText)">${escapeHtml(link)}</a>`).join('')}
                        </div>
                        <p contenteditable="true" onblur="updateSectionData('${section.id}', 'copyright', this.innerText)">${escapeHtml(section.data.copyright)}</p>
                    </footer>
                `;
                break;
        }

        // Section Controls
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

    // Update Palette State
    updatePaletteState();

    // Re-initialize icons after render
    lucide.createIcons();
}

function updatePaletteState() {
    const blockTools = document.getElementById('block-tools');
    if (!blockTools) return;

    const activeSection = sections.find(s => s.id === activeSectionId);
    if (activeSection && activeSection.type === 'general') {
        blockTools.style.display = 'flex';
    } else {
        blockTools.style.display = 'none';
    }
}

// --- Helper Functions ---

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
    activeSectionId = newId;
    renderBuilder();
    setTimeout(() => {
        previewArea.scrollTop = previewArea.scrollHeight;
    }, 10);
}

function updateSectionData(sectionId, key, value) {
    const section = sections.find(s => s.id === sectionId);
    if (!section) return;

    if (key.includes('.')) {
        const parts = key.split('.');
        const arrayName = parts[0];
        const index = parseInt(parts[1]);
        section.data[arrayName][index] = value;
    } else {
        section.data[key] = value;
    }
}

function updateImage(sectionId, key) {
    const url = prompt('新しい画像URLを入力してください:');
    if (url) {
        updateSectionData(sectionId, key, url);
        renderBuilder(); // Re-render to show new image
    }
}

// Block Actions
function addBlockToActive(type) {
    if (!activeSectionId) {
        alert('セクションを選択してください');
        return;
    }
    const section = sections.find(s => s.id === activeSectionId);
    if (!section || section.type !== 'general') {
        alert('このセクションにはブロックを追加できません');
        return;
    }

    const newBlock = {
        id: Date.now().toString(),
        type: type,
        content: type === 'image' ? 'https://via.placeholder.com/400' :
            type === 'heading' ? '新しい見出し' :
                type === 'table' ? 'テーブルデータ' : '新しいテキスト'
    };

    section.data.blocks.push(newBlock);
    renderBuilder();
}

function updateBlockData(sectionId, blockId, value, isImage = false) {
    const section = sections.find(s => s.id === sectionId);
    if (!section) return;

    const block = section.data.blocks.find(b => b.id === blockId);
    if (block) {
        if (isImage) {
            const url = prompt('新しい画像URLを入力してください:', block.content);
            if (url) {
                block.content = url;
                renderBuilder();
            }
        } else {
            block.content = value;
        }
    }
}

function deleteBlock(sectionId, blockId) {
    if (!confirm('このブロックを削除しますか？')) return;
    const section = sections.find(s => s.id === sectionId);
    if (!section) return;

    section.data.blocks = section.data.blocks.filter(b => b.id !== blockId);
    renderBuilder();
}

function moveBlock(sectionId, blockId, direction) {
    const section = sections.find(s => s.id === sectionId);
    if (!section) return;

    const index = section.data.blocks.findIndex(b => b.id === blockId);
    if (index === -1) return;

    const newIndex = index + direction;
    if (newIndex < 0 || newIndex >= section.data.blocks.length) return;

    const temp = section.data.blocks[index];
    section.data.blocks[index] = section.data.blocks[newIndex];
    section.data.blocks[newIndex] = temp;

    renderBuilder();
}

function deleteSection(id) {
    if (!confirm('このセクションを削除しますか？')) return;
    sections = sections.filter(s => s.id !== id);
    if (activeSectionId === id) activeSectionId = null;
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

saveBtn.addEventListener('click', () => {
    console.log('Saved JSON:', JSON.stringify(sections, null, 2));
    alert('保存しました（コンソールにJSONを出力）');
});

// Start App
init();
