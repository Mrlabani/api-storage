
import formidable from 'formidable';
import fs from 'fs';
import FormData from 'form-data';

const STORAGE_FILE = './public/files.json';

export const config = {
  api: {
    bodyParser: false,
  },
};

function loadStorage() {
  try {
    const data = fs.readFileSync(STORAGE_FILE);
    return JSON.parse(data);
  } catch {
    return [];
  }
}

function saveStorage(files) {
  fs.writeFileSync(STORAGE_FILE, JSON.stringify(files, null, 2));
}

export default async function handler(req, res) {
  const botToken = '7092828350:AAEDO4OckWxzCeoZptBId3fo4le4CX_6yoE';
  const chatId = '-1002428562251';

  const form = new formidable.IncomingForm({ multiples: true });
  form.parse(req, async (err, fields, files) => {
    if (err) return res.status(500).json({ error: 'Form parse error' });

    const fileArray = Array.isArray(files.files) ? files.files : [files.files];
    const links = [];
    const stored = [];

    for (const file of fileArray) {
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
        return res.status(500).json({ error: 'Telegram upload failed' });
      }

      const fileId = json.result.document.file_id;
      const getLink = await fetch(`https://api.telegram.org/bot${botToken}/getFile?file_id=${fileId}`);
      const fileJson = await getLink.json();
      const filePath = fileJson.result.file_path;
      const link = `https://api.telegram.org/file/bot${botToken}/${filePath}`;
      links.push(link);

      const fileEntry = { name: file.originalFilename, url: link };
      stored.push(fileEntry);
    }

    const current = loadStorage();
    saveStorage([...stored, ...current]);

    res.status(200).json({ links, stored });
  });
}
