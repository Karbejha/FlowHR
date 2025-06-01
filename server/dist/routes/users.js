"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const auth_1 = require("../middleware/auth");
const User_1 = require("../models/User");
const userController_1 = require("../controllers/userController");
const router = express_1.default.Router();
router.get('/employees', auth_1.authenticate, (0, auth_1.authorize)(User_1.UserRole.ADMIN, User_1.UserRole.MANAGER), userController_1.getEmployees);
router.get('/managers', auth_1.authenticate, (0, auth_1.authorize)(User_1.UserRole.ADMIN, User_1.UserRole.MANAGER), userController_1.getManagers);
router.patch('/:userId/status', auth_1.authenticate, (0, auth_1.authorize)(User_1.UserRole.ADMIN), userController_1.updateEmployeeStatus);
router.post('/create', auth_1.authenticate, (0, auth_1.authorize)(User_1.UserRole.ADMIN, User_1.UserRole.MANAGER), userController_1.createUser);
router.put('/update/:id', auth_1.authenticate, (0, auth_1.authorize)(User_1.UserRole.ADMIN), userController_1.updateUser);
router.delete('/:id', auth_1.authenticate, (0, auth_1.authorize)(User_1.UserRole.ADMIN), userController_1.deleteUser);
router.put('/profile', auth_1.authenticate, userController_1.updateProfile);
router.put('/change-password', auth_1.authenticate, userController_1.changePassword);
exports.default = router;
