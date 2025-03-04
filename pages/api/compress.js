import { exec } from 'child_process';
import { promisify } from 'util';
import fs from 'fs';
import path from 'path';
import busboy from 'busboy';
import { createNokiaEffect } from '../../utils/ffmpeg';

const execAsync = promisify(exec);
const uploadDir = path.join(process.cwd(), 'tmp');

// Buat direktori tmp jika belum ada
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

export const config = {
  api: {
    bodyParser: false,
  },
};

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end();

  const bb = busboy({ headers: req.headers });
  let fileName = '';
  let fileWriteFinished = false;

  // Handle file upload dengan promise
  const fileUploadPromise = new Promise((resolve, reject) => {
    bb.on('file', (name, file, info) => {
      fileName = `${Date.now()}_${info.filename}`;
      const saveTo = path.join(uploadDir, fileName);
      
      const ws = fs.createWriteStream(saveTo);
      file.pipe(ws);
      
      ws.on('finish', () => {
        fileWriteFinished = true;
        resolve();
      });
      
      ws.on('error', (err) => {
        console.error('File write error:', err);
        reject(err);
      });
    });

    bb.on('error', (err) => {
      console.error('Busboy error:', err);
      reject(err);
    });
  });

  try {
    req.pipe(bb);
    await fileUploadPromise;

    // Pastikan file benar-benar ada
    const inputPath = path.join(uploadDir, fileName);
    const outputPath = path.join(uploadDir, `compressed_${fileName}`);
    
    if (!fs.existsSync(inputPath)) {
      throw new Error('Input file not found after upload');
    }

    await createNokiaEffect(inputPath, outputPath);

    // Beri delay kecil untuk memastikan file output tertulis
    await new Promise(resolve => setTimeout(resolve, 500));

    res.setHeader('Content-Type', 'video/mp4');
    res.setHeader('Content-Disposition', `attachment; filename="nokia_${fileName}"`);
    const stream = fs.createReadStream(outputPath);
    stream.pipe(res);

    // Cleanup dengan timeout tambahan
    stream.on('end', () => {
      setTimeout(() => {
        [inputPath, outputPath].forEach(p => {
          if (fs.existsSync(p)) fs.unlinkSync(p);
        });
      }, 5000);
    });

  } catch (error) {
    console.error('Full error:', error);
    res.status(500).json({ 
      error: 'Compression failed',
      details: error.message 
    });
    
    // Cleanup jika error
    if (fileName) {
      const inputPath = path.join(uploadDir, fileName);
      if (fs.existsSync(inputPath)) fs.unlinkSync(inputPath);
    }
  }
}