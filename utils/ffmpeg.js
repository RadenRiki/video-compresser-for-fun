import ffmpeg from 'fluent-ffmpeg';

// Gunakan FFmpeg dari sistem (path Homebrew Mac)
ffmpeg.setFfmpegPath('/opt/homebrew/bin/ffmpeg');
ffmpeg.setFfprobePath('/opt/homebrew/bin/ffprobe');

export const createNokiaEffect = (inputPath, outputPath) => {
  return new Promise((resolve, reject) => {
    ffmpeg(inputPath)
      .videoFilters([
        'scale=176:144:force_original_aspect_ratio=decrease',
        'pad=176:144:(ow-iw)/2:(oh-ih)/2',
        'setsar=1',
        'noise=alls=20:allf=t+u',
        // "drawtext=text='%{pts\\:localtime}':fontcolor=white:fontsize=12:box=1:boxcolor=black@0.5:x=5:y=5"
      ])
      .fps(15)
      .videoBitrate('96k')
      .audioBitrate('32k')
      .audioChannels(1)
      .audioFrequency(8000)
      .outputOptions([
        '-c:v libx264',
        '-preset ultrafast',
        '-maxrate 96k',
        '-minrate 64k',
        '-bufsize 128k',
        '-f mp4'
      ])
      .on('stderr', (stderrLine) => {
        console.log('FFmpeg Output:', stderrLine);
      })
      .on('end', resolve)
      .on('error', (err) => {
        console.error('FFmpeg Execution Error:', err);
        reject(err);
      })
      .save(outputPath);
  });
};