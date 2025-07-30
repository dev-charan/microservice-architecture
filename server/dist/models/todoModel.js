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
exports.Stauts = exports.COLLETION_NAME = exports.DOCUMENT_NAME = void 0;
const mongoose_1 = __importStar(require("mongoose"));
exports.DOCUMENT_NAME = "Todo";
exports.COLLETION_NAME = "todos";
var Stauts;
(function (Stauts) {
    Stauts["NOT_STARTED"] = "NOT_STARTED";
    Stauts["IN_PROGRESS"] = "IN_PROGRESS";
    Stauts["DONE"] = "DONE";
})(Stauts || (exports.Stauts = Stauts = {}));
const todoModel = new mongoose_1.Schema({
    user: {
        type: mongoose_1.Schema.Types.ObjectId,
        required: true,
        ref: "User",
    },
    title: {
        type: String,
        required: true,
    },
    description: {
        type: String,
        required: true,
    },
    status: {
        type: String,
        required: true,
        default: Stauts.NOT_STARTED,
        enum: Object.values(Stauts),
    },
}, {
    timestamps: true,
});
const Todo = mongoose_1.default.model(exports.DOCUMENT_NAME, todoModel, exports.COLLETION_NAME);
exports.default = Todo;
