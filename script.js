document.addEventListener('DOMContentLoaded', () => {

    // --- CORE UI ELEMENTS ---
    const darkModeToggle = document.getElementById('dark-mode-toggle');
    const searchBar = document.getElementById('search-bar');
    const toolsContainer = document.getElementById('tools-container');

    // --- MODAL ELEMENTS ---
    const toolModal = document.getElementById('tool-modal');
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

    // --- DATA ---
    const tools = [
        { id: 'merge-pdf', name: 'Merge PDF', desc: 'Combine multiple PDFs into one.', category: 'pdf', icon: 'fa-solid fa-object-ungroup' },
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
        { id: 'add-page-numbers', name: 'Add Page Numbers', desc: 'Add page numbers to a PDF.', category: 'pdf', icon: 'fa-solid fa-list-ol' },
        { id: 'add-watermark', name: 'Watermark', desc: 'Add a text or image watermark.', category: 'pdf', icon: 'fa-solid fa-stamp' },
        { id: 'rotate-pdf', name: 'Rotate PDF', desc: 'Rotate all or specific pages.', category: 'pdf', icon: 'fa-solid fa-rotate' },
        { id: 'unlock-pdf', name: 'Unlock PDF', desc: 'Remove PDF password.', category: 'pdf', icon: 'fa-solid fa-lock-open' },
        { id: 'protect-pdf', name: 'Protect PDF', desc: 'Add password to a PDF.', category: 'pdf', icon: 'fa-solid fa-lock' },
        { id: 'organize-pdf', name: 'Organize PDF', desc: 'Reorder, merge, or delete pages.', category: 'pdf', icon: 'fa-solid fa-layer-group' },
        // Image Tools
        { id: 'image-compressor', name: 'Image Compressor', desc: 'Compress JPG, PNG, WEBP.', category: 'image', icon: 'fa-solid fa-compress' },
        { id: 'image-converter', name: 'Image Converter', desc: 'Convert images online.', category: 'image', icon: 'fa-solid fa-sync-alt' },
        { id: 'image-resizer', name: 'Image Resizer', desc: 'Resize images by dimensions.', category: 'image', icon: 'fa-solid fa-expand-arrows-alt' },
        // Utility Tools
        { id: 'qr-code-generator', name: 'QR Code Generator', desc: 'Create a custom QR code.', category: 'utility', icon: 'fa-solid fa-qrcode' },
        { id: 'password-generator', name: 'Password Generator', desc: 'Generate a secure password.', category: 'utility', icon: 'fa-solid fa-key' },
        { id: 'word-counter', name: 'Word Counter', desc: 'Count words and characters.', category: 'utility', icon: 'fa-solid fa-file-word' },
        { id: 'age-calculator', name: 'Age Calculator', desc: 'Calculate your age.', category: 'utility', icon: 'fa-solid fa-birthday-cake' },
        { id: 'bmi-calculator', name: 'BMI Calculator', desc: 'Calculate Body Mass Index.', category: 'utility', icon: 'fa-solid fa-calculator' },
        { id: 'color-picker', name: 'Color Picker', desc: 'Get HEX & RGB color codes.', category: 'utility', icon: 'fa-solid fa-palette' },
        { id: 'unit-converter', name: 'Unit Converter', desc: 'Convert measurement units.', category: 'utility', icon: 'fa-solid fa-balance-scale' },
        { id: 'json-formatter', name: 'JSON Formatter', desc: 'Validate & format JSON.', category: 'utility', icon: 'fa-solid fa-code' },
        { id: 'text-to-speech', name: 'Text to Speech', desc: 'Convert text to voice.', category: 'utility', icon: 'fa-solid fa-volume-up' },
        { id: 'speech-to-text', name: 'Speech to Text', desc: 'Transcribe speech to text.', category: 'utility', icon: 'fa-solid fa-microphone' },
        { id: 'audio-converter', name: 'Audio Converter', desc: 'Convert audio file formats.', category: 'utility', icon: 'fa-solid fa-file-audio', server: true },
        { id: 'video-compressor', name: 'Video Compressor', desc: 'Reduce video file size.', category: 'utility', icon: 'fa-solid fa-file-video', server: true },
    ];
    const toolCategories = [
        { key: 'pdf', title: 'PDF Tools' },
        { key: 'image', title: 'Image Tools' },
        { key: 'utility', title: 'Web & Utility Tools' }
    ];

    // --- INITIALIZATION ---
    function init() {
        setupDarkMode();
        setupEventListeners();
        renderTools();
    }

    // --- DARK MODE LOGIC ---
    function setupDarkMode() {
        const isDarkMode = localStorage.getItem('darkMode') === 'true';
        if (isDarkMode) {
            document.documentElement.classList.add('dark');
            darkModeToggle.innerHTML = '<i class="fas fa-sun"></i>';
        }
    }
    function toggleDarkMode() {
        document.documentElement.classList.toggle('dark');
        const isDarkMode = document.documentElement.classList.contains('dark');
        localStorage.setItem('darkMode', isDarkMode);
        darkModeToggle.innerHTML = isDarkMode ? '<i class="fas fa-sun"></i>' : '<i class="fas fa-moon"></i>';
    }

    // --- EVENT LISTENERS ---
    function setupEventListeners() {
        darkModeToggle.addEventListener('click', toggleDarkMode);
        searchBar.addEventListener('input', (e) => filterTools(e.target.value));
        modalCloseBtn.addEventListener('click', closeModal);
        toolModal.addEventListener('click', (e) => {
            if (e.target === toolModal) closeModal();
        });
    }

    // --- TOOL RENDERING & FILTERING ---
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
                card.className = 'tool-card bg-light-card dark:bg-dark-card p-5 rounded-xl border border-border-light dark:border-border-dark cursor-pointer flex items-center gap-4';
                card.dataset.id = tool.id;
                card.dataset.name = tool.name.toLowerCase();
                card.innerHTML = `
                    <div class="w-12 h-12 bg-primary/10 text-primary rounded-full flex-shrink-0 flex items-center justify-center">
                        <i class="${tool.icon} text-xl"></i>
                    </div>
                    <div>
                        <h3 class="font-bold text-md text-light-text dark:text-dark-text">${tool.name}</h3>
                        <p class="text-sm text-light-text-secondary dark:text-dark-text-secondary">${tool.desc}</p>
                    </div>
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
            const name = card.dataset.name;
            card.style.display = name.includes(term) ? 'flex' : 'none';
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
        
        renderInitialWorkspace(tool);

        toolModal.classList.remove('opacity-0', 'pointer-events-none');
        modalContent.classList.remove('scale-95');
    }

    function closeModal() {
        toolModal.classList.add('opacity-0', 'pointer-events-none');
        modalContent.classList.add('scale-95');
        // Clear content to free up memory
        modalBody.innerHTML = '';
        currentToolId = null;
    }

    function renderInitialWorkspace(tool) {
        // Handle non-file-based tools first
        if (['qr-code-generator', 'password-generator', 'word-counter', 'age-calculator', 'bmi-calculator', 'color-picker', 'unit-converter', 'json-formatter', 'text-to-speech', 'speech-to-text'].includes(tool.id)) {
            renderConfigureWorkspace();
            return;
        }

        // Define tool-specific properties for file-based tools
        const accepts = {
            'word-to-pdf': '.doc,.docx,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document',
            'ppt-to-pdf': '.ppt,.pptx,application/vnd.ms-powerpoint,application/vnd.openxmlformats-officedocument.presentationml.presentation',
            'excel-to-pdf': '.xls,.xlsx,application/vnd.ms-excel,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
            'jpg-to-pdf': 'image/jpeg',
            'image-compressor': 'image/*',
            'image-converter': 'image/*',
            'image-resizer': 'image/*',
            'audio-converter': 'audio/*',
            'video-compressor': 'video/*'
        };
        const defaultAccept = 'application/pdf';
        const isMultiple = ['merge-pdf', 'jpg-to-pdf'].includes(tool.id);
        
        modalBody.innerHTML = `
            <div id="initial-drop-zone" class="flex flex-col items-center justify-center text-center p-8 rounded-2xl w-full h-full">
                <input type="file" id="file-input" class="hidden" accept="${accepts[tool.id] || defaultAccept}" ${isMultiple ? 'multiple' : ''}>
                <div class="cursor-pointer" onclick="document.getElementById('file-input').click()">
                    <i class="fas fa-file-upload text-6xl text-primary mb-6"></i>
                    <h3 class="text-2xl font-bold mb-2">Drop files here</h3>
                    <p class="text-light-text-secondary dark:text-dark-text-secondary mb-6">or</p>
                    <button id="choose-file-btn" class="pointer-events-none">Choose Files</button>
                </div>
            </div>
        `;

        const dropZone = document.getElementById('initial-drop-zone');
        const fileInput = document.getElementById('file-input');
        
        dropZone.ondragover = (e) => { e.preventDefault(); dropZone.classList.add('dragover'); };
        dropZone.ondragleave = () => dropZone.classList.remove('dragover');
        dropZone.ondrop = (e) => {
            e.preventDefault();
            dropZone.classList.remove('dragover');
            handleFiles(e.dataTransfer.files);
        };
        fileInput.onchange = (e) => handleFiles(e.target.files);
    }
    
    function handleFiles(files) {
        const isMultiple = ['merge-pdf', 'jpg-to-pdf'].includes(currentToolId);
        if (!isMultiple) {
            uploadedFiles = [files[0]];
        } else {
            [...files].forEach(file => uploadedFiles.push(file));
        }
        renderConfigureWorkspace();
    }
    
    // --- WORKSPACE STATES ---
    function renderConfigureWorkspace() {
        modalBody.innerHTML = `
            <div class="w-full h-full flex flex-col md:flex-row gap-6">
                <div id="file-previews-container" class="flex-grow overflow-y-auto p-4 bg-light-card dark:bg-dark-card rounded-lg border border-border-light dark:border-border-dark">
                    <!-- File previews / tool UI will be rendered here -->
                </div>
                <div id="tool-options-container" class="flex-shrink-0 w-full md:w-72 p-4 flex flex-col">
                    <!-- Tool-specific options go here -->
                </div>
            </div>
        `;
        renderFilePreviews();
        renderToolOptions();
    }
    
    function renderFilePreviews() {
        const container = document.getElementById('file-previews-container');
        container.innerHTML = '';
        
        // Handle non-file tools
        const nonFileToolUIs = {
            'qr-code-generator': `<textarea id="qr-text" placeholder="Enter text or URL" class="w-full p-2 rounded border dark:bg-dark-bg dark:border-gray-600" rows="4"></textarea><div id="qrcode-output" class="mt-4 flex justify-center p-4 bg-white rounded-lg"></div>`,
            'password-generator': `<div class="relative mb-4"><input id="password-output" type="text" readonly class="w-full p-3 pr-12 rounded bg-light-bg dark:bg-dark-bg font-mono text-lg"><button id="copy-btn" class="absolute right-2 top-1/2 -translate-y-1/2 text-xl text-light-text-secondary"><i class="far fa-copy"></i></button></div><div><label>Length: <span id="length-val">16</span></label><input type="range" id="length-slider" min="8" max="64" value="16" class="w-full"></div><div class="grid grid-cols-2 gap-4 mt-4"><label><input type="checkbox" id="p-uppercase" checked> Uppercase</label><label><input type="checkbox" id="p-lowercase" checked> Lowercase</label><label><input type="checkbox" id="p-numbers" checked> Numbers</label><label><input type="checkbox" id="p-symbols" checked> Symbols</label></div>`,
            'word-counter': `<textarea id="word-input" placeholder="Paste your text here..." class="w-full p-2 rounded border dark:bg-dark-bg dark:border-gray-600" rows="12"></textarea><div id="word-count-results" class="mt-4 grid grid-cols-2 md:grid-cols-4 gap-4 text-center"></div>`,
            // Add other non-file tool UIs here
        };
        if(nonFileToolUIs[currentToolId]) {
            container.innerHTML = nonFileToolUIs[currentToolId];
            return;
        }

        if (uploadedFiles.length === 0) {
            container.innerHTML = '<p class="text-center text-light-text-secondary">Please add files to begin.</p>';
            return;
        }

        const list = document.createElement('div');
        list.className = 'space-y-3';
        uploadedFiles.forEach((file, index) => {
            const item = document.createElement('div');
            item.className = 'file-preview-item p-3 rounded-lg flex items-center justify-between';
            item.innerHTML = `
                <div class="flex items-center gap-3 overflow-hidden">
                    <i class="fas fa-file text-xl text-primary"></i>
                    <span class="truncate" title="${file.name}">${file.name}</span>
                    <span class="text-sm text-light-text-secondary flex-shrink-0">${(file.size / 1024 / 1024).toFixed(2)} MB</span>
                </div>
                <button data-index="${index}" class="remove-file-btn text-lg text-red-500 w-8 h-8 rounded-full hover:bg-red-100 dark:hover:bg-red-900/50">×</button>
            `;
            list.appendChild(item);
        });
        container.appendChild(list);

        document.querySelectorAll('.remove-file-btn').forEach(btn => {
            btn.onclick = (e) => {
                const indexToRemove = parseInt(e.currentTarget.dataset.index, 10);
                uploadedFiles.splice(indexToRemove, 1);
                if (uploadedFiles.length === 0) {
                    const tool = tools.find(t => t.id === currentToolId);
                    renderInitialWorkspace(tool);
                } else {
                    renderConfigureWorkspace();
                }
            };
        });
    }
    
    function renderToolOptions() {
        const container = document.getElementById('tool-options-container');
        let optionsHTML = '';
        const tool = tools.find(t => t.id === currentToolId);

        // Tool-specific options
        const toolOptionsHTML = {
            'split-pdf': `<div><label class="font-bold">Split options</label><input id="page-ranges" type="text" placeholder="e.g., 1-3, 5, 8-10" class="w-full mt-2 p-2 rounded border dark:bg-dark-bg dark:border-gray-600"></div>`,
            'compress-pdf': `<div><label class="font-bold">Compression Level</label><select id="compress-level" class="w-full mt-2 p-2 rounded border dark:bg-dark-bg dark:border-gray-600"><option value="low">Recommended</option><option value="high">High Compression</option></select></div>`,
            'rotate-pdf': `<div><label class="font-bold">Rotate Angle</label><select id="rotation-angle" class="w-full mt-2 p-2 rounded border dark:bg-dark-bg dark:border-gray-600"><option value="90">90° clockwise</option><option value="180">180°</option><option value="270">270° clockwise</option></select></div>`,
            'add-watermark': `<div><label class="font-bold">Watermark Text</label><input id="watermark-text" type="text" placeholder="Your Text" class="w-full mt-2 p-2 rounded border dark:bg-dark-bg dark:border-gray-600"></div>`
        };

        optionsHTML += `<h3 class="text-lg font-bold font-heading mb-4">${tool.name}</h3>`;
        if (toolOptionsHTML[currentToolId]) {
            optionsHTML += toolOptionsHTML[currentToolId];
        }

        // Action Button
        const hasFiles = uploadedFiles.length > 0;
        const nonFileTools = ['qr-code-generator', 'password-generator', 'word-counter', 'age-calculator', 'bmi-calculator', 'color-picker', 'unit-converter', 'json-formatter', 'text-to-speech', 'speech-to-text'];
        const showButton = hasFiles || nonFileTools.includes(currentToolId);

        if (showButton) {
            const actionText = nonFileTools.includes(tool.id) ? 'Generate' : tool.name;
            optionsHTML += `<div class="mt-auto pt-4"><button id="tool-action-btn" class="w-full bg-primary text-white font-bold rounded-lg hover:bg-primary-dark transition-colors disabled:opacity-50 disabled:cursor-not-allowed" ${!hasFiles && !nonFileTools.includes(tool.id) ? 'disabled' : ''}>${actionText}</button></div>`;
        }

        container.innerHTML = optionsHTML;
        
        if (showButton) {
            document.getElementById('tool-action-btn').onclick = processFiles;
        }

        // Setup for instant-feedback tools
        if (tool.id === 'password-generator') {
            const updatePass = () => document.getElementById('tool-action-btn').click();
            document.getElementById('length-slider').oninput = updatePass;
            document.querySelectorAll('input[type="checkbox"]').forEach(el => el.onchange = updatePass);
            updatePass(); // Initial generation
        }
        if (tool.id === 'word-counter') {
            document.getElementById('word-input').oninput = () => {
                const text = document.getElementById('word-input').value;
                const resultsDiv = document.getElementById('word-count-results');
                const words = text.match(/\b\S+\b/g) || [];
                resultsDiv.innerHTML = `<div class="text-center"><div class="font-bold text-xl">${words.length}</div><div>Words</div></div><div class="text-center"><div class="font-bold text-xl">${text.length}</div><div>Characters</div></div>`;
            };
        }
    }

    function showProcessingState(message) {
        modalBody.innerHTML = `
            <div class="flex flex-col items-center justify-center text-center h-full">
                <div class="animate-spin rounded-full h-16 w-16 border-b-4 border-primary mb-6"></div>
                <h3 class="text-2xl font-bold">${message}</h3>
                <p class="text-light-text-secondary">Please wait, this may take a moment...</p>
            </div>
        `;
    }

    function showFinishedState(downloadUrl, filename) {
        modalBody.innerHTML = `
             <div class="flex flex-col items-center justify-center text-center h-full">
                <i class="fas fa-check-circle text-6xl text-success mb-6"></i>
                <h3 class="text-2xl font-bold">Processing Complete!</h3>
                <p class="text-light-text-secondary mb-8">Your file is ready for download.</p>
                <a href="${downloadUrl}" download="${filename}" class="inline-block bg-success text-white font-bold py-4 px-10 rounded-lg text-lg mb-4">Download ${filename}</a>
                <button id="start-over-btn" class="text-primary hover:underline">Start Over</button>
            </div>
        `;
        document.getElementById('start-over-btn').onclick = () => {
            const tool = tools.find(t => t.id === currentToolId);
            uploadedFiles = [];
            renderInitialWorkspace(tool);
        };
    }
    
    // --- FILE PROCESSING LOGIC ---
    async function processFiles() {
        const tool = tools.find(t => t.id === currentToolId);

        // Handle instant tools without a "processing" state
        if (tool.id === 'password-generator') {
            const length = document.getElementById('length-slider').value;
            document.getElementById('length-val').textContent = length;
            const charset = (document.getElementById('p-uppercase').checked ? 'ABCDEFGHIJKLMNOPQRSTUVWXYZ' : '') +
                          (document.getElementById('p-lowercase').checked ? 'abcdefghijklmnopqrstuvwxyz' : '') +
                          (document.getElementById('p-numbers').checked ? '0123456789' : '') +
                          (document.getElementById('p-symbols').checked ? '!@#$%^&*()' : '');
            let password = '';
            for (let i = 0; i < length; i++) password += charset.charAt(Math.floor(Math.random() * charset.length));
            document.getElementById('password-output').value = password;
            document.getElementById('copy-btn').onclick = () => navigator.clipboard.writeText(password);
            return;
        }
        if (tool.id === 'qr-code-generator') {
            const text = document.getElementById('qr-text').value;
            const outputDiv = document.getElementById('qrcode-output');
            outputDiv.innerHTML = '';
            new QRCode(outputDiv, { text: text, width: 200, height: 200 });
            return;
        }

        showProcessingState(`Processing: ${tool.name}`);
        
        try {
            // Client-side tools
            if (tool.id === 'merge-pdf') {
                const mergedPdf = await PDFDocument.create();
                for (const file of uploadedFiles) {
                    const pdf = await PDFDocument.load(await file.arrayBuffer());
                    const copiedPages = await mergedPdf.copyPages(pdf, pdf.getPageIndices());
                    copiedPages.forEach(page => mergedPdf.addPage(page));
                }
                const bytes = await mergedPdf.save();
                const blob = new Blob([bytes], { type: 'application/pdf' });
                const url = URL.createObjectURL(blob);
                showFinishedState(url, 'merged.pdf');
            } 
            // Add other client-side tool logic here in else-if blocks
            else if (tool.server) {
                const formData = new FormData();
                formData.append('file', uploadedFiles[0]);
                // Add more form data if needed (e.g., from options)
                
                const response = await fetch(`/.netlify/functions/${tool.id.replace(/-/g, '_')}`, {
                    method: 'POST',
                    body: formData,
                });

                if (!response.ok) {
                    const err = await response.json();
                    throw new Error(err.error || 'Server processing failed.');
                }
                
                const result = await response.json();
                showFinishedState(result.downloadUrl, result.filename);
            }
        } catch (error) {
            console.error(error);
            modalBody.innerHTML = `<div class="text-center"><p class="text-red-500 mb-4">An error occurred: ${error.message}.</p><button id="start-over-btn" class="text-primary hover:underline">Try again</button></div>`;
            document.getElementById('start-over-btn').onclick = () => {
                const tool = tools.find(t => t.id === currentToolId);
                uploadedFiles = [];
                renderInitialWorkspace(tool);
            };
        }
    }

    // --- START THE APP ---
    init();
});