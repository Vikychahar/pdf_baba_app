// This file is a boilerplate. Repeat this structure for all other conversion functions.
// e.g., for word_to_pdf.js, change output_format to 'pdf', etc.

const axios = require('axios');
const { parseMultipartForm } = require('./_parser.js'); // Use a shared parser

exports.handler = async (event) => {
    const CLOUDCONVERT_API_KEY = process.env.CLOUDCONVERT_API_KEY;
    if (!CLOUDCONVERT_API_KEY) {
        return { statusCode: 500, body: JSON.stringify({ error: 'Server is not configured.' }) };
    }

    try {
        const { files } = await parseMultipartForm(event);
        if (!files || files.length === 0) {
            return { statusCode: 400, body: JSON.stringify({ error: 'No file uploaded.' }) };
        }
        
        // --- CloudConvert API Interaction ---
        const importTaskResponse = await axios.post('https://api.cloudconvert.com/v2/import/upload', {}, {
            headers: { 'Authorization': `Bearer ${CLOUDCONVERT_API_KEY}` }
        });
        const importTask = importTaskResponse.data.data;
        
        await axios.put(importTask.result.form.url, files[0].content, { headers: { 'Content-Type': files[0].mimeType } });

        const convertTaskResponse = await axios.post('https://api.cloudconvert.com/v2/convert', {
            input: importTask.id,
            output_format: 'mkv', // CHANGE THIS FOR OTHER CONVERSIONS
        }, { headers: { 'Authorization': `Bearer ${CLOUDCONVERT_API_KEY}` } });
        
        const exportTaskResponse = await axios.post('https://api.cloudconvert.com/v2/export/url', {
            input: convertTaskResponse.data.data.id,
        }, { headers: { 'Authorization': `Bearer ${CLOUDCONVERT_API_KEY}` } });
        let exportTask = exportTaskResponse.data.data;

        while (exportTask.status !== 'finished') {
            await new Promise(resolve => setTimeout(resolve, 1000));
            const statusResponse = await axios.get(`https://api.cloudconvert.com/v2/tasks/${exportTask.id}`, { headers: { 'Authorization': `Bearer ${CLOUDCONVERT_API_KEY}` } });
            exportTask = statusResponse.data.data;
            if (exportTask.status === 'error') throw new Error(exportTask.message);
        }
        
        return {
            statusCode: 200,
            body: JSON.stringify({
                downloadUrl: exportTask.result.files[0].url,
                filename: exportTask.result.files[0].filename
            }),
        };

    } catch (error) {
        console.error('Conversion Error:', error.message);
        return { statusCode: 500, body: JSON.stringify({ error: 'Failed to process the file.' }) };
    }
};