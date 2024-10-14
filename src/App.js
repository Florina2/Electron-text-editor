import React, { useState, useEffect } from 'react';
const { ipcRenderer } = window.require('electron');

function App() {
  const [filePath, setFilePath] = useState('');
  const [content, setContent] = useState('');

  useEffect(() => {
    ipcRenderer.on('file-opened', (event, { filePath, content }) => {
      setFilePath(filePath);
      setContent(content);
    });

    ipcRenderer.on('file-save', (event, filePath) => {
      // Handle saving content here if needed
      if (filePath) {
        ipcRenderer.invoke('file:save', { filePath, content });
      }
    });

    return () => {
      ipcRenderer.removeAllListeners('file-opened');
      ipcRenderer.removeAllListeners('file-save');
    };
  }, [content]);

  const openFile = async () => {
    const result = await ipcRenderer.invoke('dialog:openFile');
    if (result) {
      setFilePath(result.filePath);
      setContent(result.content);
    }
  };

  const saveFile = async () => {
    if (filePath) {
      await ipcRenderer.invoke('file:save', { filePath, content });
    }
  };

  return (
    <div>
      <h1>Text Editor</h1>
      <button onClick={openFile}>Open File</button>
      <button onClick={saveFile} disabled={!filePath}>
        Save File
      </button>
      <textarea
        value={content}
        onChange={(e) => setContent(e.target.value)}
        rows="20"
        cols="80"
      />
    </div>
  );
}

export default App;
