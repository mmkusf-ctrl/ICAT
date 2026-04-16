const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const { spawn } = require('child_process');
const path = require('path');
require('dotenv').config();

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: '*', // Allow connections from the frontend website
    methods: ['GET', 'POST']
  }
});

// Configure RTMP Endpoint (E.g. YouTube Live Ingest URL + Stream Key)
// You MUST set this in your server's environment variables.
const RTMP_URL = process.env.RTMP_URL || 'rtmp://a.rtmp.youtube.com/live2/YOUR_STREAM_KEY';

io.on('connection', (socket) => {
  console.log(`[+] Broadcaster connected: ${socket.id}`);
  let ffmpeg = null;

  socket.on('start-stream', () => {
    console.log(`[~] Starting FFmpeg process for ${socket.id}`);

    const ffmpegParams = [
      '-i', '-',                // Read from stdin
      '-c:v', 'libx264',        // H.264 Video codec (YouTube standard)
      '-preset', 'veryfast',    // Fast encoding
      '-b:v', '4000k',          // 4000 kbps video bitrate for 1080p30
      '-maxrate', '4500k',
      '-bufsize', '8000k',
      '-pix_fmt', 'yuv420p',    // Pixel format requirement for RTMP
      '-r', '30',               // 30 FPS
      '-c:a', 'aac',            // AAC Audio codec
      '-b:a', '128k',           // 128 kbps audio
      '-ar', '44100',           // 44.1 kHz audio
      '-f', 'flv',              // FLV format wrapper for RTMP
      RTMP_URL                  // Target URL
    ];

    ffmpeg = spawn('ffmpeg', ffmpegParams);

    ffmpeg.on('close', (code, signal) => {
      console.log(`[-] FFmpeg child process closed with code ${code} and signal ${signal}`);
    });

    ffmpeg.stderr.on('data', (data) => {
      // Very verbose - uncomment for deep debugging
      // console.log(`FFmpeg STDERR: ${data.toString()}`);
    });

    ffmpeg.on('error', (e) => {
      console.error('FFmpeg Error', e);
    });
  });

  socket.on('binary-stream', (blob) => {
    // Pipe the WebM blob from the browser into FFmpeg's standard input
    if (ffmpeg && ffmpeg.stdin && ffmpeg.stdin.writable) {
      ffmpeg.stdin.write(blob);
    }
  });

  socket.on('stop-stream', () => {
    console.log(`[x] Stopping stream for ${socket.id}`);
    if (ffmpeg) {
      ffmpeg.stdin.end();
      ffmpeg.kill('SIGINT');
      ffmpeg = null;
    }
  });

  socket.on('disconnect', () => {
    console.log(`[x] Broadcaster disconnected: ${socket.id}`);
    if (ffmpeg) {
      ffmpeg.stdin.end();
      ffmpeg.kill('SIGINT');
      ffmpeg = null;
    }
  });
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`ICAT Broadcast Proxy Server listening on port ${PORT}`);
  console.log(`Targeting RTMP: ${RTMP_URL.replace(/live2\/.*/, 'live2/****')}`);
});
