"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const auth_1 = require("../middleware/auth");
const User_1 = require("../models/User");
const attendanceController_1 = require("../controllers/attendanceController");
const router = express_1.default.Router();
const asyncMiddleware = (fn) => (req, res, next) => Promise.resolve(fn(req, res, next)).catch(next);
// Employee routes
router.post('/clock-in', auth_1.authenticate, asyncMiddleware(attendanceController_1.clockIn));
router.post('/clock-out', auth_1.authenticate, asyncMiddleware(attendanceController_1.clockOut));
router.get('/my-records', auth_1.authenticate, asyncMiddleware(attendanceController_1.getMyAttendance));
// Manager/Admin routes
router.get('/team', auth_1.authenticate, (0, auth_1.authorize)(User_1.UserRole.MANAGER, User_1.UserRole.ADMIN), asyncMiddleware(attendanceController_1.getTeamAttendance));
router.patch('/:attendanceId', auth_1.authenticate, (0, auth_1.authorize)(User_1.UserRole.MANAGER, User_1.UserRole.ADMIN), asyncMiddleware(attendanceController_1.updateAttendance));
exports.default = router;
