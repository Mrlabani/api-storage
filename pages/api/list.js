
import fs from 'fs';

export default function handler(req, res) {
  try {
    const data = fs.readFileSync('./public/files.json');
    const files = JSON.parse(data);
    res.status(200).json({ files });
  } catch (err) {
    res.status(200).json({ files: [] });
  }
}
