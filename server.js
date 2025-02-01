
    const express = require('express');
    const mongoose = require('mongoose');
    const jwt = require('jsonwebtoken');
    const bcrypt = require('bcryptjs');
    const cors = require('cors');
    const app = express();
    
    app.use(express.json());
    app.use(cors());
    
    const secretKey = 'your-secret-key';
    const mongoURI = 'your-mongo-db-connection-string';
    
    mongoose.connect(mongoURI, { useNewUrlParser: true, useUnifiedTopology: true })
      .then(() => console.log('MongoDB connected...'))
      .catch(err => console.log('MongoDB connection error:', err));
    
    const User = require('./models/User');
    const Device = require('./models/Device');
    
    // Middleware to verify JWT
    const authenticateToken = (req, res, next) => {
        const token = req.header('Authorization')?.replace('Bearer ', '');
        
        if (!token) return res.status(403).send('Access denied. No token provided.');
    
        try {
            const decoded = jwt.verify(token, secretKey);
            req.user = decoded;
            next();
        } catch (err) {
            return res.status(400).send('Invalid token.');
        }
    };
    
    app.post('/signup', async (req, res) => {
        const { username, password } = req.body;
        const existingUser = await User.findOne({ username });
        if (existingUser) {
            return res.status(400).send('User already exists');
        }
        const newUser = new User({ username, password });
        await newUser.save();
        res.status(201).send('User created');
    });
    
    app.post('/login', async (req, res) => {
        const { username, password } = req.body;
        const user = await User.findOne({ username });
        if (!user) {
            return res.status(400).send('Invalid credentials');
        }
        const isMatch = await user.comparePassword(password);
        if (!isMatch) {
            return res.status(400).send('Invalid credentials');
        }
        const token = jwt.sign({ userId: user._id }, secretKey, { expiresIn: '1h' });
        res.status(200).json({ token });
    });
    
    app.post('/devices', authenticateToken, async (req, res) => {
        const { name } = req.body;
        const newDevice = new Device({ name, user: req.user.userId });
        await newDevice.save();
        res.status(201).json(newDevice);
    });
    
    app.get('/devices', authenticateToken, async (req, res) => {
        const devices = await Device.find({ user: req.user.userId });
        res.status(200).json(devices);
    });
    
    app.delete('/devices/:id', authenticateToken, async (req, res) => {
        const { id } = req.params;
        await Device.findByIdAndDelete(id);
        res.status(200).send('Device removed');
    });
    
    const port = 3000;
    app.listen(port, () => console.log(`Server running on http://localhost:${port}`));
    