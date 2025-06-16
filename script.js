document.addEventListener('DOMContentLoaded', () => {

    function setupCommonListeners() {
        const dmToggle = document.getElementById('dark-mode-toggle');
        const mobMenuBtn = document.getElementById('mobile-menu-btn');
        if (dmToggle) dmToggle.addEventListener('click', toggleDarkMode);
        if (mobMenuBtn) mobMenuBtn.addEventListener('click', () => {
            document.getElementById('mobile-menu').classList.toggle('hidden');
        });
        setupDarkMode();
    }
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
        localStorage.setItem('darkMode', document.documentElement.classList.contains('dark'));
        setupDarkMode();
    }
    
    // Run common setup on all pages
    setupCommonListeners();

    // Exit if we are not on a page with the tools container
    const toolsContainer = document.getElementById('tools-container');
    if (!toolsContainer) return;

    // --- MAIN APP LOGIC (for index.html) ---
    const searchBar = document.getElementById('search-bar');
    const toolModal = document.getElementById('tool-modal');
    const modalContent = document.getElementById('modal-content');
    const modalCloseBtn = document.getElementById('modal-close-btn');
    const modalTitle = document.getElementById('modal-title');
    const modalIcon = document.getElementById('modal-icon');
    const modalBody = document.getElementById('modal-body');
    
    const { PDFDocument, rgb, degrees, StandardFonts } = PDFLib;
    
    let uploadedFiles = [];
    let currentToolId = null;

    const tools = [
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
        { id: 'image-compressor', name: 'Image Compressor', desc: 'Compress JPG, PNG, WEBP.', category: 'image', icon: 'fa-solid fa-compress' },
        { id: 'image-converter', name: 'Image Converter', desc: 'Convert images to various formats.', category: 'image', icon: 'fa-solid fa-sync-alt' },
        { id: 'image-resizer', name: 'Image Resizer', desc: 'Resize images by dimensions.', category: 'image', icon: 'fa-solid fa-expand-arrows-alt' },
        { id: 'emi-calculator', name: 'EMI Calculator', desc: 'Calculate Equated Monthly Installment.', category: 'financial', icon: 'fa-solid fa-indian-rupee-sign' },
        { id: 'gst-calculator', name: 'GST Calculator', desc: 'Calculate Goods and Services Tax.', category: 'financial', icon: 'fa-solid fa-percent' },
        { id: 'expense-tracker', name: 'Expense Tracker', desc: 'Track your daily expenses.', category: 'financial', icon: 'fa-solid fa-wallet' },
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
    const toolCategories = [ { key: 'pdf', title: 'PDF Tools' }, { key: 'image', title: 'Image Tools' }, { key: 'financial', title: 'Financial & Personal Finance Tools' }, { key: 'utility', title: 'Web & Utility Tools' }];
    const nonFileTools = ['emi-calculator', 'gst-calculator', 'expense-tracker', 'qr-code-generator', 'password-generator', 'word-counter', 'age-calculator', 'bmi-calculator', 'calorie-calculator', 'color-picker', 'unit-converter', 'json-formatter', 'text-to-speech', 'speech-to-text'];

    // --- ALL FUNCTIONS FOR MAIN PAGE ---
    function initMainPage() {
        searchBar.addEventListener('input', (e) => filterTools(e.target.value));
        modalCloseBtn.addEventListener('click', closeModal);
        toolModal.addEventListener('click', (e) => { if (e.target === toolModal) closeModal(); });
        renderTools();
    }
    
    // ... all other functions (renderTools, filterTools, showToolModal, closeModal, etc.) from previous `script.js` ...
    // --- THIS IS THE COMPLETE, CORRECTED SCRIPT LOGIC ---
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
                card.className = 'tool-card bg-light-card dark:bg-dark-card p-5 rounded-xl border border-border-light dark:border-border-dark cursor-pointer flex flex-col items-start text-left shadow-sm hover:shadow-lg transition-all duration-200';
                card.dataset.id = tool.id;
                card.dataset.name = (tool.name + " " + tool.desc).toLowerCase();
                card.innerHTML = `<div class="w-12 h-12 bg-primary bg-opacity-10 text-primary rounded-lg flex-shrink-0 flex items-center justify-center mb-4"><i class="${tool.icon} text-xl"></i></div><h3 class="font-bold text-md text-light-text dark:text-dark-text">${tool.name}</h3><p class="text-sm text-light-text-secondary dark:text-dark-text-secondary mt-1 flex-grow">${tool.desc}</p>`;
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
    function showToolModal(toolId) {
        const tool = tools.find(t => t.id === toolId);
        if (!tool) return;
        currentToolId = toolId;
        uploadedFiles = [];
        modalTitle.textContent = tool.name;
        modalIcon.className = `${tool.icon} text-xl`;
        if (nonFileTools.includes(toolId)) { renderConfigureWorkspace(); } else { renderInitialWorkspace(tool); }
        toolModal.classList.remove('opacity-0', 'pointer-events-none');
        modalContent.classList.remove('scale-95');
    }
    function closeModal() {
        toolModal.classList.add('opacity-0', 'pointer-events-none');
        modalContent.classList.add('scale-95');
        modalBody.innerHTML = '';
        currentToolId = null;
    }
    function renderInitialWorkspace(tool) {
        const accepts = { 'word-to-pdf': '.doc,.docx,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'jpg-to-pdf': 'image/jpeg', 'image-compressor': 'image/*', 'image-converter': 'image/*', 'image-resizer': 'image/*', };
        const isMultiple = ['merge-pdf', 'jpg-to-pdf'].includes(tool.id);
        modalBody.innerHTML = `<div id="initial-drop-zone" class="w-full h-full flex flex-col items-center justify-center text-center p-8 rounded-2xl"><input type="file" id="file-input" class="hidden" accept="${accepts[tool.id] || 'application/pdf'}" ${isMultiple ? 'multiple' : ''}><div class="cursor-pointer" onclick="document.getElementById('file-input').click()"><i class="fas fa-file-upload text-6xl text-primary mb-6"></i><h3 class="text-2xl font-bold mb-2">Drop files here</h3><p class="text-light-text-secondary mb-6">or</p><button class="pointer-events-none">Choose Files</button></div></div>`;
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
        if (nonFileTools.includes(currentToolId)) {
            const uiMap = {
                'emi-calculator': `<div class="p-2 space-y-4"><h4 class="font-bold">Loan Details</h4><div><label class="font-medium">Loan Amount (₹)</label><input type="number" id="emi-p" class="tool-input mt-1" value="1000000"></div><div><label class="font-medium">Annual Interest Rate (%)</label><input type="number" id="emi-r" class="tool-input mt-1" value="8.5"></div><div><label class="font-medium">Loan Tenure (Years)</label><input type="number" id="emi-n" class="tool-input mt-1" value="20"></div><div id="emi-result" class="text-center p-4 mt-4 bg-light-bg rounded-lg text-lg"></div></div>`,
                'gst-calculator': `<div class="p-2 space-y-4"><h4 class="font-bold">Billing Details</h4><div><label class="font-medium">Initial Amount</label><input type="number" id="gst-amount" class="tool-input mt-1" value="1000"></div><div><label class="font-medium">GST Rate (%)</label><select id="gst-rate" class="tool-input mt-1"><option>18</option><option>5</option><option>12</option><option>28</option></select></div><div id="gst-result" class="text-center p-4 mt-4 bg-light-bg rounded-lg text-lg"></div></div>`,
                'calorie-calculator': `<div class="p-2 space-y-3"><div><label class="font-medium">Age</label><input type="number" id="cal-age" class="tool-input mt-1" value="30"></div><div class="grid grid-cols-2 gap-4"><div><label class="font-medium">Weight (kg)</label><input type="number" id="cal-weight" class="tool-input mt-1" value="70"></div><div><label class="font-medium">Height (cm)</label><input type="number" id="cal-height" class="tool-input mt-1" value="175"></div></div><div><label class="font-medium">Gender</label><select id="cal-gender" class="tool-input mt-1"><option value="male">Male</option><option value="female">Female</option></select></div><div><label class="font-medium">Activity Level</label><select id="cal-activity" class="tool-input mt-1"><option value="1.2">Sedentary (office job)</option><option value="1.375">Lightly Active (1-3 days/wk)</option><option value="1.55">Moderately Active (3-5 days/wk)</option><option value="1.725">Very Active (6-7 days/wk)</option><option value="1.9">Extra Active (physical job)</option></select></div><div id="calorie-result" class="text-center p-4 mt-4 bg-light-bg rounded-lg text-lg"></div></div>`,
                'expense-tracker': `<div class="flex flex-col h-full"><div class="mb-4 flex gap-2"><input type="text" id="exp-desc" placeholder="Expense description" class="tool-input flex-grow"><input type="number" id="exp-amount" placeholder="Amount" class="tool-input w-28"><button id="add-exp-btn" class="bg-primary text-white px-4 rounded-md hover:bg-primary-dark"><i class="fas fa-plus"></i></button></div><div id="exp-list" class="flex-grow overflow-y-auto border-t border-b py-2"></div><div id="exp-total" class="text-right font-bold text-xl p-4">Total: ₹0.00</div></div>`,
                'word-counter': `<textarea id="word-input" placeholder="Paste your text here..." class="tool-input w-full h-full p-2"></textarea>`,
                'qr-code-generator': `<div id="qrcode-output" class="flex justify-center items-center h-full p-4 bg-white rounded-lg"></div>`
            };
            container.innerHTML = uiMap[currentToolId] || '';
            if (currentToolId === 'expense-tracker') setupExpenseTracker();
        } else {
            const list = document.createElement('div');
            list.className = 'space-y-3';
            uploadedFiles.forEach((file, index) => {
                const item = document.createElement('div');
                item.className = 'file-preview-item p-3 rounded-lg flex items-center justify-between';
                item.innerHTML = `<div class="flex items-center gap-3 overflow-hidden"><i class="fas fa-file-alt text-xl text-primary"></i><span class="truncate" title="${file.name}">${file.name}</span><span class="text-sm text-light-text-secondary flex-shrink-0">${(file.size / 1024 / 1024).toFixed(2)} MB</span></div><button data-index="${index}" class="remove-file-btn text-lg text-red-500 w-8 h-8 rounded-full hover:bg-red-100 dark:hover:bg-red-900/50">&times;</button>`;
                list.appendChild(item);
            });
            container.appendChild(list);
            container.querySelectorAll('.remove-file-btn').forEach(btn => btn.onclick = (e) => {
                uploadedFiles.splice(parseInt(e.currentTarget.dataset.index), 1);
                if (uploadedFiles.length === 0) renderInitialWorkspace(tools.find(t=>t.id===currentToolId)); else renderMainContentArea();
            });
        }
    }
    function renderToolOptions() {
        const container = document.getElementById('tool-options-container');
        const tool = tools.find(t => t.id === currentToolId);
        let optionsHTML = `<h3 class="text-lg font-bold font-heading mb-4">${tool.name}</h3>`;
        const optionsMap = {
            'split-pdf': `<div><label class="font-medium">Page ranges</label><input id="page-ranges" type="text" placeholder="e.g., 1-3, 5" class="tool-input mt-1"></div>`,
            'compress-pdf': `<div><label class="font-medium">Quality</label><select id="pdf-quality" class="tool-input mt-1"><option value="low">Basic Compression</option><option value="high">Strong Compression</option></select></div>`,
            'image-compressor': `<div><label class="font-medium">Quality (<span id="img-quality-val">75</span>%)</label><input type="range" id="img-quality" min="10" max="95" value="75" class="w-full" oninput="document.getElementById('img-quality-val').textContent=this.value"></div>`,
            'image-converter': `<div><label class="font-medium">Convert to</label><select id="img-format" class="tool-input mt-1"><option value="png">PNG</option><option value="jpeg">JPEG</option><option value="webp">WEBP</option></select></div>`,
            'image-resizer': `<div class="space-y-2"><label class="font-medium">Dimensions</label><div class="flex gap-2"><input type="number" id="img-width" placeholder="Width" class="tool-input"><input type="number" id="img-height" placeholder="Height" class="tool-input"></div><div><input type="checkbox" id="aspect-lock" checked><label for="aspect-lock" class="ml-2">Lock aspect ratio</label></div></div>`,
            'add-watermark': `<div><label class="font-medium">Watermark Text</label><input id="watermark-text" type="text" placeholder="Your Text" class="tool-input mt-1"></div>`,
            'word-counter': `<div id="word-count-results" class="text-center p-4 bg-light-bg rounded-lg">Count results appear here.</div>`,
            'qr-code-generator': `<div><label class="font-medium">Text or URL</label><textarea id="qr-text" class="tool-input w-full mt-1" rows="4"></textarea></div>`
        };
        optionsHTML += optionsMap[currentToolId] || '';
        const actionText = nonFileTools.includes(tool.id) ? (tool.id.includes('calculator') ? 'Calculate' : 'Generate') : tool.name;
        optionsHTML += `<div class="mt-auto pt-4"><button id="tool-action-btn" class="w-full bg-primary text-white font-bold py-3 rounded-lg hover:bg-primary-dark transition-colors">${actionText}</button></div>`;
        container.innerHTML = optionsHTML;
        document.getElementById('tool-action-btn').onclick = processRequest;
        if(tool.id === 'word-counter') document.getElementById('word-input').addEventListener('input', processRequest);
    }
    async function processRequest() {
        const tool = tools.find(t => t.id === currentToolId);
        // --- Calculator Handlers ---
        if(currentToolId === 'emi-calculator'){
            const p = parseFloat(document.getElementById('emi-p').value) || 0;
            const r = (parseFloat(document.getElementById('emi-r').value) || 0) / 12 / 100;
            const n = (parseFloat(document.getElementById('emi-n').value) || 0) * 12;
            const emi = p * r * Math.pow(1 + r, n) / (Math.pow(1 + r, n) - 1);
            document.getElementById('emi-result').innerHTML = `<p class="text-light-text-secondary">Your Monthly EMI</p><p class="text-3xl font-bold text-primary">₹${emi.toFixed(2)}</p>`;
            return;
        }
        if(currentToolId === 'gst-calculator'){
            const amount = parseFloat(document.getElementById('gst-amount').value) || 0;
            const rate = parseFloat(document.getElementById('gst-rate').value) || 0;
            const gstAmount = amount * (rate / 100);
            const total = amount + gstAmount;
            document.getElementById('gst-result').innerHTML = `<p class="text-light-text-secondary">Total Amount (incl. GST)</p><p class="text-3xl font-bold text-primary">₹${total.toFixed(2)}</p><p class="text-sm">GST Amount: ₹${gstAmount.toFixed(2)}</p>`;
            return;
        }
        if(currentToolId === 'calorie-calculator'){
            const age = parseInt(document.getElementById('cal-age').value);
            const weight = parseFloat(document.getElementById('cal-weight').value);
            const height = parseFloat(document.getElementById('cal-height').value);
            const gender = document.getElementById('cal-gender').value;
            const activity = parseFloat(document.getElementById('cal-activity').value);
            let bmr = (10 * weight) + (6.25 * height) - (5 * age);
            bmr += (gender === 'male' ? 5 : -161);
            const calories = bmr * activity;
            document.getElementById('calorie-result').innerHTML = `<p class="text-light-text-secondary">Daily Calorie Needs</p><p class="text-3xl font-bold text-primary">${Math.round(calories)} kcal</p>`;
            return;
        }
        if(currentToolId === 'word-counter'){
            const text = document.getElementById('word-input').value;
            const words = text.match(/\b\S+\b/g) || [];
            document.getElementById('word-count-results').innerHTML = `<div class="text-center"><div class="font-bold text-xl">${words.length}</div><div>Words</div></div><div class="text-center"><div class="font-bold text-xl">${text.length}</div><div>Characters</div></div>`;
            return;
        }
        showProcessingState(`Processing: ${tool.name}`);
        try {
            // --- Client-side File Handlers ---
            if (currentToolId === 'merge-pdf') {
                const mergedPdf = await PDFDocument.create();
                for (const file of uploadedFiles) {
                    const pdf = await PDFDocument.load(await file.arrayBuffer());
                    const copiedPages = await mergedPdf.copyPages(pdf, pdf.getPageIndices());
                    copiedPages.forEach(page => mergedPdf.addPage(page));
                }
                const bytes = await mergedPdf.save();
                showFinishedState(new Blob([bytes], { type: 'application/pdf' }), 'merged.pdf');
            } else if (currentToolId === 'image-compressor') {
                const quality = parseInt(document.getElementById('img-quality').value) / 100;
                const file = uploadedFiles[0];
                const imageBitmap = await createImageBitmap(file);
                const canvas = document.createElement('canvas');
                canvas.width = imageBitmap.width; canvas.height = imageBitmap.height;
                const ctx = canvas.getContext('2d');
                ctx.drawImage(imageBitmap, 0, 0);
                canvas.toBlob(blob => showFinishedState(blob, `compressed_${file.name}`), 'image/jpeg', quality);
            }
            // --- Server-side Handlers ---
            else if (tool.server) {
                const formData = new FormData();
                formData.append('file', uploadedFiles[0]);
                const response = await fetch(`/.netlify/functions/${tool.id.replace(/-/g, '_')}`, { method: 'POST', body: formData });
                if (!response.ok) { const err = await response.json(); throw new Error(err.error || 'Server error'); }
                const result = await response.json();
                const fileResponse = await fetch(result.downloadUrl);
                const blob = await fileResponse.blob();
                showFinishedState(blob, result.filename);
            } else {
                throw new Error("This tool is not yet fully implemented.");
            }
        } catch (error) {
            showErrorState(error.message);
        }
    }
    function showProcessingState(message) { modalBody.innerHTML = `<div class="flex flex-col items-center justify-center text-center h-full"><div class="animate-spin rounded-full h-16 w-16 border-b-4 border-primary mb-6"></div><h3 class="text-2xl font-bold">${message}</h3><p class="text-light-text-secondary">Please wait, this may take a moment...</p></div>`; }
    function showFinishedState(blob, filename) {
        const url = URL.createObjectURL(blob);
        modalBody.innerHTML = `<div class="flex flex-col items-center justify-center text-center h-full"><i class="fas fa-check-circle text-6xl text-success mb-6"></i><h3 class="text-2xl font-bold">Processing Complete!</h3><p class="text-light-text-secondary mb-8">Your file is ready for download.</p><a href="${url}" download="${filename}" class="inline-block bg-success text-white font-bold py-4 px-10 rounded-lg text-lg mb-4">Download ${filename}</a><button id="start-over-btn" class="text-primary hover:underline">Start Over</button></div>`;
        document.getElementById('start-over-btn').onclick = () => { uploadedFiles = []; renderInitialWorkspace(tools.find(t => t.id === currentToolId)); };
    }
    function showErrorState(message) {
        modalBody.innerHTML = `<div class="text-center"><p class="text-red-500 mb-4">An error occurred: ${message}</p><button id="start-over-btn" class="text-primary hover:underline">Try again</button></div>`;
        document.getElementById('start-over-btn').onclick = () => { uploadedFiles = []; renderInitialWorkspace(tools.find(t => t.id === currentToolId)); };
    }
    function setupExpenseTracker() {
        const descInput = document.getElementById('exp-desc');
        const amountInput = document.getElementById('exp-amount');
        const addBtn = document.getElementById('add-exp-btn');
        const listEl = document.getElementById('exp-list');
        const totalEl = document.getElementById('exp-total');
        let expenses = JSON.parse(localStorage.getItem('expenses')) || [];
        const renderExpenses = () => {
            listEl.innerHTML = '';
            let total = 0;
            expenses.forEach((exp, index) => {
                const item = document.createElement('div');
                item.className = 'flex justify-between items-center p-2 border-b';
                item.innerHTML = `<span>${exp.desc}</span><span class="font-medium">₹${exp.amount.toFixed(2)} <button data-index="${index}" class="text-red-500 ml-2 remove-exp">&times;</button></span>`;
                listEl.appendChild(item);
                total += exp.amount;
            });
            totalEl.textContent = `Total: ₹${total.toFixed(2)}`;
            localStorage.setItem('expenses', JSON.stringify(expenses));
        };
        addBtn.onclick = () => {
            const desc = descInput.value;
            const amount = parseFloat(amountInput.value);
            if(desc && amount > 0){
                expenses.push({desc, amount});
                descInput.value = '';
                amountInput.value = '';
                renderExpenses();
            }
        };
        listEl.onclick = (e) => {
            if(e.target.classList.contains('remove-exp')){
                expenses.splice(parseInt(e.target.dataset.index), 1);
                renderExpenses();
            }
        };
        renderExpenses();
    }
    
    // --- STARTUP ---
    initMainPage();
});
