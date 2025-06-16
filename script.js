document.addEventListener('DOMContentLoaded', () => {

    // --- GLOBAL ELEMENTS & STATE ---
    const darkModeToggle = document.getElementById('dark-mode-toggle');
    const mobileMenuBtn = document.getElementById('mobile-menu-btn');
    const mobileMenu = document.getElementById('mobile-menu');
    const searchBar = document.getElementById('search-bar');
    const toolsContainer = document.getElementById('tools-container');
    const toolModal = document.getElementById('tool-modal');

    if (!toolsContainer) { // Exit if we're not on the main page
        setupCommonListeners();
        return;
    }
    
    // --- MODAL ELEMENTS ---
    const modalContent = document.getElementById('modal-content');
    const modalCloseBtn = document.getElementById('modal-close-btn');
    const modalTitle = document.getElementById('modal-title');
    const modalIcon = document.getElementById('modal-icon');
    const modalBody = document.getElementById('modal-body');
    
    // --- LIBRARIES ---
    const { PDFDocument, rgb, degrees, StandardFonts } = PDFLib;
    
    // --- APP STATE ---
    let uploadedFiles = [];
    let currentToolId = null;

    // --- DATA (WITH NEW TOOLS) ---
    const tools = [
        // PDF Tools
        { id: 'merge-pdf', name: 'Merge PDF', desc: 'Combine PDFs into one document.', category: 'pdf', icon: 'fa-solid fa-object-ungroup' },
        { id: 'split-pdf', name: 'Split PDF', desc: 'Extract pages from a PDF.', category: 'pdf', icon: 'fa-solid fa-scissors' },
        { id: 'compress-pdf', name: 'Compress PDF', desc: 'Reduce PDF file size.', category: 'pdf', icon: 'fa-solid fa-file-zipper' },
        { id: 'pdf-to-word', name: 'PDF to Word', desc: 'Convert PDF to editable Word.', category: 'pdf', icon: 'fa-solid fa-file-word', server: true },
        { id: 'word-to-pdf', name: 'Word to PDF', desc: 'Convert Word to PDF.', category: 'pdf', icon: 'fa-solid fa-file-pdf', server: true },
        { id: 'pdf-to-ppt', name: 'PDF to PowerPoint', desc: 'Convert PDF to PowerPoint.', category: 'pdf', icon: 'fa-solid fa-file-powerpoint', server: true },
        { id: 'ppt-to-pdf', name: 'PowerPoint to PDF', desc: 'Convert PowerPoint to PDF.', category: 'pdf', icon: 'fa-solid fa-file-pdf', server: true },
        { id: 'pdf-to-excel', name: 'PDF to Excel', desc: 'Convert PDF to Excel.', category: 'pdf', icon: 'fa-solid fa-file-excel', server: true },
        { id: 'excel-to-pdf', name: 'Excel to PDF', desc: 'Convert Excel to PDF.', category: 'pdf', icon: 'fa-solid fa-file-pdf', server: true },
        { id: 'edit-pdf', name: 'Edit PDF', desc: 'Add text, shapes, and images.', category: 'pdf', icon: 'fa-solid fa-pen-to-square' },
        { id: 'pdf-to-jpg', name: 'PDF to JPG', desc: 'Convert PDF pages to JPGs.', category: 'pdf', icon: 'fa-solid fa-file-image' },
        { id: 'jpg-to-pdf', name: 'JPG to PDF', desc: 'Convert JPG images to PDF.', category: 'pdf', icon: 'fa-solid fa-image' },
        { id: 'add-page-numbers', name: 'Add Page Numbers', desc: 'Insert page numbers in a PDF.', category: 'pdf', icon: 'fa-solid fa-list-ol' },
        { id: 'add-watermark', name: 'Watermark', desc: 'Add text or image watermark.', category: 'pdf', icon: 'fa-solid fa-stamp' },
        { id: 'rotate-pdf', name: 'Rotate PDF', desc: 'Rotate all or specific pages.', category: 'pdf', icon: 'fa-solid fa-rotate' },
        { id: 'unlock-pdf', name: 'Unlock PDF', desc: 'Remove PDF password protection.', category: 'pdf', icon: 'fa-solid fa-lock-open' },
        { id: 'protect-pdf', name: 'Protect PDF', desc: 'Add a password to a PDF.', category: 'pdf', icon: 'fa-solid fa-lock' },
        { id: 'organize-pdf', name: 'Organize PDF', desc: 'Reorder or delete PDF pages.', category: 'pdf', icon: 'fa-solid fa-layer-group' },
        // Image Tools
        { id: 'image-compressor', name: 'Image Compressor', desc: 'Compress JPG, PNG, WEBP.', category: 'image', icon: 'fa-solid fa-compress' },
        { id: 'image-converter', name: 'Image Converter', desc: 'Convert images to various formats.', category: 'image', icon: 'fa-solid fa-sync-alt' },
        { id: 'image-resizer', name: 'Image Resizer', desc: 'Resize images by dimensions.', category: 'image', icon: 'fa-solid fa-expand-arrows-alt' },
        // Financial Calculators
        { id: 'emi-calculator', name: 'EMI Calculator', desc: 'Calculate Equated Monthly Installment.', category: 'financial', icon: 'fa-solid fa-indian-rupee-sign' },
        { id: 'gst-calculator', name: 'GST Calculator', desc: 'Calculate Goods and Services Tax.', category: 'financial', icon: 'fa-solid fa-percent' },
        { id: 'expense-tracker', name: 'Expense Tracker', desc: 'Track your daily expenses.', category: 'financial', icon: 'fa-solid fa-wallet' },
        // Utility & Web Tools
        { id: 'qr-code-generator', name: 'QR Code Generator', desc: 'Create a custom QR code.', category: 'utility', icon: 'fa-solid fa-qrcode' },
        { id: 'password-generator', name: 'Password Generator', desc: 'Generate a secure password.', category: 'utility', icon: 'fa-solid fa-key' },
        { id: 'word-counter', name: 'Word Counter', desc: 'Count words and characters.', category: 'utility', icon: 'fa-solid fa-file-word' },
        { id: 'age-calculator', name: 'Age Calculator', desc: 'Calculate your age precisely.', category: 'utility', icon: 'fa-solid fa-birthday-cake' },
        { id: 'bmi-calculator', name: 'BMI Calculator', desc: 'Calculate Body Mass Index.', category: 'utility', icon: 'fa-solid fa-calculator' },
        { id: 'calorie-calculator', name: 'Calorie Calculator', desc: 'Estimate your daily calorie needs.', category: 'utility', icon: 'fa-solid fa-fire-flame-curved' },
        { id: 'color-picker', name: 'Color Picker', desc: 'Get HEX & RGB color codes.', category: 'utility', icon: 'fa-solid fa-palette' },
        { id: 'unit-converter', name: 'Unit Converter', desc: 'Convert various units of measure.', category: 'utility', icon: 'fa-solid fa-balance-scale' },
        { id: 'json-formatter', name: 'JSON Formatter', desc: 'Validate & format JSON.', category: 'utility', icon: 'fa-solid fa-code' },
        { id: 'text-to-speech', name: 'Text to Speech', desc: 'Convert text into voice.', category: 'utility', icon: 'fa-solid fa-volume-up' },
        { id: 'speech-to-text', name: 'Speech to Text', desc: 'Transcribe your speech to text.', category: 'utility', icon: 'fa-solid fa-microphone' },
        { id: 'audio-converter', name: 'Audio Converter', desc: 'Convert audio file formats.', category: 'utility', icon: 'fa-solid fa-file-audio', server: true },
        { id: 'video-compressor', name: 'Video Compressor', desc: 'Reduce video file size.', category: 'utility', icon: 'fa-solid fa-file-video', server: true },
    ];
    const toolCategories = [
        { key: 'pdf', title: 'PDF Tools' },
        { key: 'image', title: 'Image Tools' },
        { key: 'financial', title: 'Financial & Personal Finance Tools' },
        { key: 'utility', title: 'Web & Utility Tools' }
    ];

    const nonFileTools = ['emi-calculator', 'gst-calculator', 'expense-tracker', 'qr-code-generator', 'password-generator', 'word-counter', 'age-calculator', 'bmi-calculator', 'calorie-calculator', 'color-picker', 'unit-converter', 'json-formatter', 'text-to-speech', 'speech-to-text'];

    // --- INITIALIZATION ---
    function init() {
        setupCommonListeners();
        renderTools();
        setupModalListeners();
    }

    // --- SETUP LISTENERS ---
    function setupCommonListeners() {
        const dmToggle = document.getElementById('dark-mode-toggle');
        const mobMenuBtn = document.getElementById('mobile-menu-btn');
        if (dmToggle) dmToggle.addEventListener('click', toggleDarkMode);
        if (mobMenuBtn) mobMenuBtn.addEventListener('click', () => {
            document.getElementById('mobile-menu').classList.toggle('hidden');
        });
        setupDarkMode();
    }
    
    function setupModalListeners(){
        searchBar.addEventListener('input', (e) => filterTools(e.target.value));
        modalCloseBtn.addEventListener('click', closeModal);
        toolModal.addEventListener('click', (e) => { if (e.target === toolModal) closeModal(); });
    }

    // --- DARK MODE LOGIC ---
    function setupDarkMode() {
        const dmToggle = document.getElementById('dark-mode-toggle');
        if (localStorage.getItem('darkMode') === 'true') {
            document.documentElement.classList.add('dark');
            if (dmToggle) dmToggle.innerHTML = '<i class="fas fa-sun"></i>';
        } else {
            document.documentElement.classList.remove('dark');
            if (dmToggle) dmToggle.innerHTML = '<i class="fas fa-moon"></i>';
        }
    }
    function toggleDarkMode() {
        document.documentElement.classList.toggle('dark');
        const isDarkMode = document.documentElement.classList.contains('dark');
        localStorage.setItem('darkMode', isDarkMode);
        setupDarkMode();
    }

    // --- RENDER & FILTER TOOLS ---
    function renderTools() {
        toolsContainer.innerHTML = '';
        toolCategories.forEach(category => {
            const section = document.createElement('section');
            const categoryTools = tools.filter(t => t.category === category.key);
            if (categoryTools.length === 0) return;

            section.innerHTML = `<h2 class="text-2xl font-bold font-heading mb-6">${category.title}</h2>`;
            const grid = document.createElement('div');
            grid.className = 'grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5';

            categoryTools.forEach(tool => {
                const card = document.createElement('div');
                card.className = 'tool-card bg-light-card dark:bg-dark-card p-5 rounded-xl border border-border-light dark:border-border-dark cursor-pointer flex flex-col items-start text-left shadow-sm hover:shadow-lg';
                card.dataset.id = tool.id;
                card.dataset.name = (tool.name + " " + tool.desc).toLowerCase();
                card.innerHTML = `
                    <div class="w-12 h-12 bg-primary bg-opacity-10 text-primary rounded-lg flex-shrink-0 flex items-center justify-center mb-4">
                        <i class="${tool.icon} text-xl"></i>
                    </div>
                    <h3 class="font-bold text-md text-light-text dark:text-dark-text">${tool.name}</h3>
                    <p class="text-sm text-light-text-secondary dark:text-dark-text-secondary mt-1 flex-grow">${tool.desc}</p>
                `;
                card.addEventListener('click', () => showToolModal(tool.id));
                grid.appendChild(card);
            });
            section.appendChild(grid);
            toolsContainer.appendChild(section);
        });
    }

    function filterTools(searchTerm) {
        const term = searchTerm.toLowerCase();
        document.querySelectorAll('.tool-card').forEach(card => {
            card.style.display = card.dataset.name.includes(term) ? 'flex' : 'none';
        });
    }

    // --- MODAL WORKSPACE HANDLING ---
    function showToolModal(toolId) {
        const tool = tools.find(t => t.id === toolId);
        if (!tool) return;
        
        currentToolId = toolId;
        uploadedFiles = [];
        
        modalTitle.textContent = tool.name;
        modalIcon.className = `${tool.icon} text-xl`;
        
        if (nonFileTools.includes(toolId)) {
            renderConfigureWorkspace();
        } else {
            renderInitialWorkspace(tool);
        }

        toolModal.classList.remove('opacity-0', 'pointer-events-none');
        modalContent.classList.remove('scale-95');
    }

    function closeModal() {
        toolModal.classList.add('opacity-0', 'pointer-events-none');
        modalContent.classList.add('scale-95');
        modalBody.innerHTML = '';
        currentToolId = null;
    }
    
    // --- WORKSPACE RENDERING LOGIC (The Core Fix) ---
    
    function renderInitialWorkspace(tool) {
        const accepts = {
            'word-to-pdf': '.doc,.docx,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document',
            'jpg-to-pdf': 'image/jpeg', 'image-compressor': 'image/*', 'image-converter': 'image/*', 'image-resizer': 'image/*',
        };
        const defaultAccept = 'application/pdf';
        const isMultiple = ['merge-pdf', 'jpg-to-pdf'].includes(tool.id);
        
        modalBody.innerHTML = `<div id="initial-drop-zone" class="w-full h-full flex flex-col items-center justify-center text-center p-8 rounded-2xl"><input type="file" id="file-input" class="hidden" accept="${accepts[tool.id] || defaultAccept}" ${isMultiple ? 'multiple' : ''}><div class="cursor-pointer" onclick="document.getElementById('file-input').click()"><i class="fas fa-file-upload text-6xl text-primary mb-6"></i><h3 class="text-2xl font-bold mb-2">Drop files here</h3><p class="text-light-text-secondary mb-6">or</p><button class="pointer-events-none">Choose Files</button></div></div>`;

        const dropZone = document.getElementById('initial-drop-zone');
        const fileInput = document.getElementById('file-input');
        
        dropZone.ondragover = (e) => { e.preventDefault(); dropZone.classList.add('dragover'); };
        dropZone.ondragleave = () => dropZone.classList.remove('dragover');
        dropZone.ondrop = (e) => { e.preventDefault(); dropZone.classList.remove('dragover'); handleFiles(e.dataTransfer.files); };
        fileInput.onchange = (e) => handleFiles(e.target.files);
    }
    
    function handleFiles(files) {
        uploadedFiles = [...files];
        renderConfigureWorkspace();
    }

    function renderConfigureWorkspace() {
        modalBody.innerHTML = `<div class="w-full h-full flex flex-col md:flex-row gap-6"><div id="main-content-area" class="flex-grow overflow-y-auto p-4 bg-light-card dark:bg-dark-card rounded-lg border border-border-light dark:border-border-dark"></div><div id="tool-options-container" class="flex-shrink-0 w-full md:w-72 p-4 flex flex-col"></div></div>`;
        renderMainContentArea();
        renderToolOptions();
    }
    
    function renderMainContentArea() {
        const container = document.getElementById('main-content-area');
        const toolUI = getToolMainUI(currentToolId);
        container.innerHTML = toolUI;
        // Post-render setup for interactive tools
        if (currentToolId === 'expense-tracker') setupExpenseTracker();
    }

    function renderToolOptions() {
        const container = document.getElementById('tool-options-container');
        const tool = tools.find(t => t.id === currentToolId);
        let optionsHTML = `<h3 class="text-lg font-bold font-heading mb-4">${tool.name}</h3>`;
        optionsHTML += getToolOptionsUI(currentToolId);
        
        const actionText = nonFileTools.includes(tool.id) ? (tool.id.includes('calculator') ? 'Calculate' : 'Generate') : tool.name;
        optionsHTML += `<div class="mt-auto pt-4"><button id="tool-action-btn" class="w-full bg-primary text-white font-bold py-3 rounded-lg hover:bg-primary-dark transition-colors">${actionText}</button></div>`;
        container.innerHTML = optionsHTML;
        
        document.getElementById('tool-action-btn').onclick = processRequest;
    }

    function getToolMainUI(toolId) {
        if (nonFileTools.includes(toolId)) {
            const uiMap = {
                'emi-calculator': `<div class="space-y-4"><h4 class="font-bold">Loan Details</h4><div><label>Loan Amount (₹)</label><input type="number" id="emi-p" class="w-full p-2 mt-1 rounded border"></div><div><label>Annual Interest Rate (%)</label><input type="number" id="emi-r" class="w-full p-2 mt-1 rounded border"></div><div><label>Loan Tenure (Years)</label><input type="number" id="emi-n" class="w-full p-2 mt-1 rounded border"></div><div id="emi-result" class="text-center p-4 mt-4 bg-light-bg rounded-lg"></div></div>`,
                'gst-calculator': `<div class="space-y-4"><h4 class="font-bold">Billing Details</h4><div><label>Initial Amount</label><input type="number" id="gst-amount" class="w-full p-2 mt-1 rounded border"></div><div><label>GST Rate (%)</label><select id="gst-rate" class="w-full p-2 mt-1 rounded border"><option>18</option><option>5</option><option>12</option><option>28</option></select></div><div id="gst-result" class="text-center p-4 mt-4 bg-light-bg rounded-lg"></div></div>`,
                'calorie-calculator': `<div class="space-y-3"><div><label>Age</label><input type="number" id="cal-age" class="w-full p-2 mt-1 rounded border"></div><div class="grid grid-cols-2 gap-4"><div><label>Weight (kg)</label><input type="number" id="cal-weight" class="w-full p-2 mt-1 rounded border"></div><div><label>Height (cm)</label><input type="number" id="cal-height" class="w-full p-2 mt-1 rounded border"></div></div><div><label>Gender</label><select id="cal-gender" class="w-full p-2 mt-1 rounded border"><option value="male">Male</option><option value="female">Female</option></select></div><div><label>Activity Level</label><select id="cal-activity" class="w-full p-2 mt-1 rounded border"><option value="1.2">Sedentary</option><option value="1.375">Lightly Active</option><option value="1.55">Moderately Active</option><option value="1.725">Very Active</option></select></div><div id="calorie-result" class="text-center p-4 mt-4 bg-light-bg rounded-lg"></div></div>`,
                'expense-tracker': `<div class="flex flex-col h-full"><div class="mb-4 flex gap-2"><input type="text" id="exp-desc" placeholder="Expense description" class="flex-grow p-2 rounded border"><input type="number" id="exp-amount" placeholder="Amount" class="w-28 p-2 rounded border"><button id="add-exp-btn" class="bg-primary text-white px-4 rounded"><i class="fas fa-plus"></i></button></div><div id="exp-list" class="flex-grow overflow-y-auto border-t border-b py-2"></div><div id="exp-total" class="text-right font-bold text-xl p-4">Total: ₹0.00</div></div>`,
                'word-counter': `<textarea id="word-input" placeholder="Paste your text here..." class="w-full h-full p-2 rounded border"></textarea>`,
                'qr-code-generator': `<div id="qrcode-output" class="flex justify-center items-center h-full p-4 bg-white rounded-lg"></div>`
            };
            return uiMap[toolId] || `<p>UI for ${toolId} not found.</p>`;
        } else {
             // UI for file-based tools
            return `<div class="space-y-3">${uploadedFiles.map((file, index) => `<div class="file-preview-item p-3 rounded-lg flex items-center justify-between">...</div>`).join('')}</div>`;
        }
    }

    function getToolOptionsUI(toolId) {
        const optionsMap = {
            'split-pdf': `<div><label>Page ranges</label><input id="page-ranges" type="text" placeholder="e.g., 1-3, 5" class="w-full mt-1 p-2 rounded border"></div>`,
            'compress-pdf': `<div><label>Quality</label><select id="pdf-quality" class="w-full mt-1 p-2 rounded border"><option value="low">Basic Compression</option><option value="high">Strong Compression</option></select></div>`,
            'image-compressor': `<div><label>Quality (<span id="img-quality-val">75</span>%)</label><input type="range" id="img-quality" min="10" max="95" value="75" class="w-full"></div>`,
            'image-converter': `<div><label>Convert to</label><select id="img-format" class="w-full mt-1 p-2 rounded border"><option value="png">PNG</option><option value="jpeg">JPEG</option><option value="webp">WEBP</option></select></div>`,
            'image-resizer': `<div class="space-y-2"><label>Dimensions</label><div class="flex gap-2"><input type="number" id="img-width" placeholder="Width" class="w-full p-2 rounded border"><input type="number" id="img-height" placeholder="Height" class="w-full p-2 rounded border"></div><div><input type="checkbox" id="aspect-lock" checked><label for="aspect-lock"> Lock aspect ratio</label></div></div>`,
            'word-counter': `<div id="word-count-results" class="text-center p-4 bg-light-bg rounded-lg">Count results appear here.</div>`,
            'qr-code-generator': `<div><label>Text or URL</label><textarea id="qr-text" class="w-full mt-1 p-2 rounded border" rows="3"></textarea></div>`
        };
        return optionsMap[toolId] || '';
    }
    
    // ... Other functions like showProcessingState, showFinishedState ...
    function showProcessingState(message) { /* ... same as before ... */ }
    function showFinishedState(downloadUrl, filename) { /* ... same as before ... */ }

    // --- PROCESSING LOGIC ---
    async function processRequest() {
        // ... This function now routes to the correct handler based on toolId ...
        // For calculators:
        if(currentToolId === 'emi-calculator'){
            const p = parseFloat(document.getElementById('emi-p').value);
            // ... get r, n, calculate, display in #emi-result
        }
        // For file tools:
        else if (currentToolId === 'merge-pdf') {
            showProcessingState('Merging PDFs...');
            // ... merge logic ...
            showFinishedState(url, 'merged.pdf');
        }
        // For server tools
        else if(tools.find(t=>t.id === currentToolId).server){
            showProcessingState('Uploading to server...');
            // ... fetch logic ...
        }
    }
    
    function setupExpenseTracker() { /* ... Logic to handle localStorage for expense tracker ... */ }

    // --- STARTUP ---
    init();
});
