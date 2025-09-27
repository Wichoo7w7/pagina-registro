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
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
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
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.TemplateService = void 0;
const common_1 = require("@nestjs/common");
const fs = __importStar(require("fs"));
const path = __importStar(require("path"));
const handlebars_1 = __importDefault(require("handlebars"));
const juice_1 = __importDefault(require("juice"));
let TemplateService = class TemplateService {
    constructor() {
        this.cache = new Map();
        this.partialsLoaded = false;
        this.registerHelpers();
    }
    registerHelpers() {
        handlebars_1.default.registerHelper('uppercase', (v) => v?.toUpperCase());
        handlebars_1.default.registerHelper('year', () => new Date().getFullYear());
    }
    ensureLayout(lang) {
        if (this.layout !== undefined)
            return; // layout único de momento
        const baseDir = path.join(process.cwd(), 'src', 'notifications', 'templates');
        const layoutPath = path.join(baseDir, 'layout.hbs');
        const raw = fs.readFileSync(layoutPath, 'utf8');
        this.layout = handlebars_1.default.compile(raw);
    }
    ensurePartials(lang) {
        if (this.partialsLoaded)
            return;
        const baseDir = path.join(process.cwd(), 'src', 'notifications', 'templates');
        const partialsDir = path.join(baseDir, 'partials');
        if (fs.existsSync(partialsDir)) {
            for (const file of fs.readdirSync(partialsDir)) {
                if (file.endsWith('.hbs')) {
                    const name = file.replace('.hbs', '');
                    const raw = fs.readFileSync(path.join(partialsDir, file), 'utf8');
                    handlebars_1.default.registerPartial(name, raw);
                }
            }
        }
        this.partialsLoaded = true;
    }
    loadTemplate(name, lang) {
        const langCode = lang || 'es';
        const cacheKey = `${langCode}:${name}`;
        if (this.cache.has(cacheKey))
            return this.cache.get(cacheKey);
        const baseDir = path.join(process.cwd(), 'src', 'notifications', 'templates');
        const localizedPath = path.join(baseDir, langCode, `${name}.hbs`);
        let filePath = path.join(baseDir, `${name}.hbs`); // fallback
        if (fs.existsSync(localizedPath)) {
            filePath = localizedPath;
        }
        const raw = fs.readFileSync(filePath, 'utf8');
        const compiled = handlebars_1.default.compile(raw);
        this.cache.set(cacheKey, compiled);
        return compiled;
    }
    render(opts) {
        this.ensureLayout(opts.lang);
        this.ensurePartials(opts.lang);
        const bodyTpl = this.loadTemplate(opts.template, opts.lang);
        const bodyHtml = bodyTpl({ ...opts.variables });
        const full = this.layout({ ...opts.variables, body: bodyHtml });
        return (0, juice_1.default)(full); // inline CSS
    }
};
exports.TemplateService = TemplateService;
exports.TemplateService = TemplateService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [])
], TemplateService);
