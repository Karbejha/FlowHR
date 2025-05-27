"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const auth_1 = require("../middleware/auth");
const User_1 = require("../models/User");
const leaveController_1 = require("../controllers/leaveController");
const router = express_1.default.Router();
// Convert async handler to express middleware
const asyncMiddleware = (fn) => (req, res, next) => Promise.resolve(fn(req, res, next)).catch(next);
// Employee routes
router.get('/balance', auth_1.authenticate, asyncMiddleware(leaveController_1.getLeaveBalance));
router.post('/request', auth_1.authenticate, asyncMiddleware(leaveController_1.submitLeaveRequest));
router.get('/my-requests', auth_1.authenticate, asyncMiddleware(leaveController_1.getMyLeaveRequests));
router.post('/:leaveId/cancel', auth_1.authenticate, asyncMiddleware(leaveController_1.cancelLeaveRequest));
// Manager/Admin routes
router.get('/pending', auth_1.authenticate, (0, auth_1.authorize)(User_1.UserRole.MANAGER, User_1.UserRole.ADMIN), asyncMiddleware(leaveController_1.getPendingLeaveRequests));
router.post('/:leaveId/status', auth_1.authenticate, (0, auth_1.authorize)(User_1.UserRole.MANAGER, User_1.UserRole.ADMIN), asyncMiddleware(leaveController_1.updateLeaveStatus));
exports.default = router;
