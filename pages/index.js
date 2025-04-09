
import { useState, useEffect } from 'react';

export default function Home() {
  const [files, setFiles] = useState([]);
  const [links, setLinks] = useState([]);
  const [loading, setLoading] = useState(false);
  const [dashboardFiles, setDashboardFiles] = useState([]);

  useEffect(() => {
    fetch('/api/list')
      .then(res => res.json())
      .then(data => setDashboardFiles(data.files || []));
  }, []);

  const uploadFiles = async () => {
    if (!files.length) return;
    setLoading(true);
    const formData = new FormData();
    for (let file of files) {
      formData.append('files', file);
    }
    const res = await fetch('/api/upload', {
      method: 'POST',
      body: formData,
    });
    const data = await res.json();
    setLinks(data.links);
    setLoading(false);
    setDashboardFiles([...data.stored, ...dashboardFiles]);
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100 p-6">
      <h1 className="text-3xl font-bold mb-4">Mini Telegram Drive</h1>
      <input
        type="file"
        multiple
        onChange={(e) => setFiles([...e.target.files])}
        className="mb-4"
      />
      <button
        onClick={uploadFiles}
        className="bg-blue-500 text-white px-4 py-2 rounded"
        disabled={loading}
      >
        {loading ? 'Uploading...' : 'Upload Files'}
      </button>

      {links.length > 0 && (
        <div className="mt-4">
          <p className="text-green-600">Uploaded:</p>
          <ul className="mt-2 space-y-1">
            {links.map((link, idx) => (
              <li key={idx}>
                <a href={link} target="_blank" rel="noopener noreferrer" className="text-blue-600 underline">
                  File {idx + 1} Link
                </a>
              </li>
            ))}
          </ul>
        </div>
      )}

      <div className="mt-10 w-full max-w-xl">
        <h2 className="text-xl font-semibold mb-2">Dashboard</h2>
        <ul className="bg-white p-4 rounded shadow">
          {dashboardFiles.length > 0 ? (
            dashboardFiles.map((file, i) => (
              <li key={i} className="border-b py-2">
                <a href={file.url} target="_blank" rel="noopener noreferrer" className="text-blue-600">
                  {file.name}
                </a>
              </li>
            ))
          ) : (
            <p>No files uploaded yet.</p>
          )}
        </ul>
      </div>
    </div>
  );
            }
