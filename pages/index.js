import { useState } from 'react';

export default function Home() {
  const [progress, setProgress] = useState(0);
  const [resultUrl, setResultUrl] = useState(null);

  const handleUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const formData = new FormData();
    formData.append('video', file);

    try {
      const xhr = new XMLHttpRequest();
      xhr.open('POST', '/api/compress');
      
      xhr.upload.onprogress = (e) => {
        if (e.lengthComputable) {
          setProgress(Math.round((e.loaded / e.total) * 100));
        }
      };

      xhr.responseType = 'blob';
      
      xhr.onload = () => {
        if (xhr.status === 200) {
          const blob = xhr.response;
          const url = URL.createObjectURL(blob);
          setResultUrl(url);
          setProgress(0);
        }
      };

      xhr.send(formData);

    } catch (error) {
      console.error('Upload error:', error);
      alert('Error processing video!');
    }
  };

  return (
    <div style={{ maxWidth: '600px', margin: '2rem auto', padding: '1rem' }}>
      <h1>Nokia 6680 Video Compressor</h1>
      
      <label style={{
        display: 'block',
        padding: '1rem',
        border: '2px dashed #666',
        borderRadius: '5px',
        cursor: 'pointer',
        textAlign: 'center',
        margin: '2rem 0'
      }}>
        <input 
          type="file" 
          accept="video/*" 
          onChange={handleUpload}
          style={{ display: 'none' }}
        />
        📱 Upload Video
      </label>

      {progress > 0 && (
        <div style={{ margin: '1rem 0' }}>
          <progress value={progress} max="100" style={{ width: '100%' }} />
          <p>Processing: {progress}%</p>
        </div>
      )}

      {resultUrl && (
        <div>
          <h2>Result:</h2>
          <video 
            controls 
            style={{ 
              width: '100%',
              border: '2px solid #333',
              borderRadius: '5px',
              marginTop: '1rem'
            }}
          >
            <source src={resultUrl} type="video/mp4" />
          </video>
          <button
            style={{ marginTop: '1rem' }}
            onClick={() => {
              const a = document.createElement('a');
              a.href = resultUrl;
              a.download = `nokia_video.mp4`;
              document.body.appendChild(a);
              a.click();
              document.body.removeChild(a);
            }}
          >
            ⬇️ Download
          </button>
        </div>
      )}
    </div>
  );
}