const express = require('express');
const cors = require('cors');
const path = require('path');
require('dotenv').config();

const { testConnection } = require('./config/db');
const apiRoutes = require('./routes/api');

const app = express();
const PORT = process.env.PORT || 3000;

// Middlewares
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Sajikan berkas statis Frontend (HTML, CSS, JS) dari folder public/
app.use(express.static(path.join(__dirname, '../public')));

// Routing API
app.use('/api', apiRoutes);

// Fallback jika membuka root atau route frontend
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, '../public/index.html'));
});

// Jalankan Server
app.listen(PORT, async () => {
  console.log(`====================================================`);
  console.log(`🚀 [Server] Web E-Commerce berjalan di: http://localhost:${PORT}`);
  console.log(`🎨 [Frontend] Frontend files di: /public (Rifqi & Haqqi)`);
  console.log(`🔌 [API] REST API endpoint aktif di: http://localhost:${PORT}/api`);
  console.log(`====================================================`);
  await testConnection();
});
