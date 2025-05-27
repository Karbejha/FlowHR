"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const mongoose_1 = __importDefault(require("mongoose"));
const config_1 = require("./config/config");
const auth_1 = __importDefault(require("./routes/auth"));
const leave_1 = __importDefault(require("./routes/leave"));
const attendance_1 = __importDefault(require("./routes/attendance"));
const users_1 = __importDefault(require("./routes/users"));
const app = (0, express_1.default)();
// Middleware
app.use((0, cors_1.default)());
app.use(express_1.default.json());
// Routes
app.use('/api/auth', auth_1.default);
app.use('/api/leave', leave_1.default);
app.use('/api/attendance', attendance_1.default);
app.use('/api/users', users_1.default);
// Connect to MongoDB
mongoose_1.default.connect(config_1.config.mongoUri)
    .then(() => console.log('Connected to MongoDB'))
    .catch((err) => console.error('MongoDB connection error:', err));
// Basic health check route
app.get('/health', (req, res) => {
    res.json({ status: 'ok' });
});
// Start server
app.listen(config_1.config.port, () => {
    console.log(`Server is running on port ${config_1.config.port}`);
});
