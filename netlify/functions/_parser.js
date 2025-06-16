const Busboy = require('busboy');

function parseMultipartForm(event) {
    return new Promise((resolve) => {
        const busboy = Busboy({
            headers: { 'content-type': event.headers['content-type'] || event.headers['Content-Type'] }
        });
        const result = { files: [], fields: {} };

        busboy.on('file', (fieldname, file, { filename, mimeType }) => {
            const chunks = [];
            file.on('data', (chunk) => chunks.push(chunk));
            file.on('end', () => {
                result.files.push({
                    fieldname,
                    filename,
                    content: Buffer.concat(chunks),
                    mimeType
                });
            });
        });
        
        busboy.on('field', (fieldname, val) => { result.fields[fieldname] = val; });
        busboy.on('finish', () => resolve(result));
        busboy.end(Buffer.from(event.body, 'base64'));
    });
}

module.exports = { parseMultipartForm };