
import formidable from 'formidable';
import fs from 'fs';
import FormData from 'form-data';
import path from 'path';

export const config = {
  api: {
    bodyParser: false,
  },
};

const botToken = 'YOUR_TELEGRAM_BOT_TOKEN';
const chatId = 'YOUR_LOG_CHANNEL_ID';
const STORAGE_PATH = path.resolve('./public/files.json');

function loadStorage() {
  try {
    const data = fs.readFileSync(STORAGE_PATH);
    return JSON.parse(data);
  } catch {
    return [];
  }
}

function saveStorage(files) {
  fs.writeFileSync(STORAGE_PATH, JSON.stringify(files, null, 2));
}

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const form = new formidable.IncomingForm({ multiples: true, maxFileSize: 2 * 1024 * 1024 * 1024 }); // 2 GB limit

  form.parse(req, async (err, fields, files) => {
    if (err) return res.status(500).json({ error: 'Form parse error' });

    const fileArray = Array.isArray(files.files) ? files.files : [files.files];
    const links = [];
    const stored = [];

    for (const file of fileArray) {
      try {
        const fileStream = fs.createReadStream(file.filepath);
        const formData = new FormData();
        formData.append('chat_id', chatId);
        formData.append('document', fileStream, file.originalFilename);

        const tgRes = await fetch(`https://api.telegram.org/bot${botToken}/sendDocument`, {
          method: 'POST',
          body: formData,
        });

        const json = await tgRes.json();
        if (!json.ok) {
          console.error('Telegram upload failed:', json);
          continue;
        }

        const fileId = json.result.document.file_id;
        const getLink = await fetch(`https://api.telegram.org/bot${botToken}/getFile?file_id=${fileId}`);
        const fileJson = await getLink.json();
        const filePath = fileJson.result.file_path;
        const link = `https://api.telegram.org/file/bot${botToken}/${filePath}`;
        links.push(link);

        const fileEntry = { name: file.originalFilename, url: link };
        stored.push(fileEntry);
      } catch (e) {
        console.error('Upload error:', e);
      }
    }

    const current = loadStorage();
    saveStorage([...stored, ...current]);

    res.status(200).json({ links, stored });
  });
}
