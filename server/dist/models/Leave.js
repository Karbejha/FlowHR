"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.Leave = exports.LeaveType = exports.LeaveStatus = void 0;
const mongoose_1 = __importStar(require("mongoose"));
const User_1 = require("./User");
var LeaveStatus;
(function (LeaveStatus) {
    LeaveStatus["PENDING"] = "pending";
    LeaveStatus["APPROVED"] = "approved";
    LeaveStatus["REJECTED"] = "rejected";
    LeaveStatus["CANCELLED"] = "cancelled";
})(LeaveStatus || (exports.LeaveStatus = LeaveStatus = {}));
var LeaveType;
(function (LeaveType) {
    LeaveType["ANNUAL"] = "annual";
    LeaveType["SICK"] = "sick";
    LeaveType["CASUAL"] = "casual";
})(LeaveType || (exports.LeaveType = LeaveType = {}));
const leaveSchema = new mongoose_1.Schema({
    employee: {
        type: mongoose_1.default.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
    leaveType: {
        type: String,
        enum: Object.values(LeaveType),
        required: true,
    },
    startDate: {
        type: Date,
        required: true,
    },
    endDate: {
        type: Date,
        required: true,
    },
    reason: {
        type: String,
        required: true,
    },
    status: {
        type: String,
        enum: Object.values(LeaveStatus),
        default: LeaveStatus.PENDING,
    },
    totalDays: {
        type: Number,
        required: true,
    },
    approvedBy: {
        type: mongoose_1.default.Schema.Types.ObjectId,
        ref: 'User',
    },
    approvalDate: Date,
    approvalNotes: String,
}, {
    timestamps: true,
});
leaveSchema.methods.calculateTotalDays = function () {
    const start = new Date(this.startDate);
    const end = new Date(this.endDate);
    const diffTime = Math.abs(end.getTime() - start.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
    this.totalDays = diffDays;
    return diffDays;
};
leaveSchema.methods.validateLeaveBalance = async function () {
    const user = await User_1.User.findById(this.employee);
    if (!(user === null || user === void 0 ? void 0 : user.leaveBalance))
        return false;
    const balanceType = this.leaveType.toLowerCase();
    return user.leaveBalance[balanceType] >= this.totalDays;
};
leaveSchema.pre('save', async function (next) {
    const leave = this;
    if (leave.isNew || leave.isModified('startDate') || leave.isModified('endDate')) {
        leave.calculateTotalDays();
    }
    if (leave.isNew || leave.isModified('status')) {
        if (leave.status === LeaveStatus.APPROVED) {
            const hasBalance = await leave.validateLeaveBalance();
            if (!hasBalance) {
                throw new Error('Insufficient leave balance');
            }
        }
    }
    next();
});
exports.Leave = mongoose_1.default.model('Leave', leaveSchema);
