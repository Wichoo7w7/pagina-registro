import { Injectable } from '@nestjs/common';
import * as fs from 'fs';
import * as path from 'path';
import Handlebars from 'handlebars';
import juice from 'juice';

interface RenderOptions {
  template: string; // base name without .hbs
  variables: Record<string, any>;
  lang?: string; // ej: 'es', 'en'
}

@Injectable()
export class TemplateService {
  private cache = new Map<string, Handlebars.TemplateDelegate>();
  private layout!: Handlebars.TemplateDelegate;
  private partialsLoaded = false;

  constructor() {
    this.registerHelpers();
  }

  private registerHelpers() {
    Handlebars.registerHelper('uppercase', (v: string) => v?.toUpperCase());
    Handlebars.registerHelper('year', () => new Date().getFullYear());
  }

  private ensureLayout(lang?: string) {
    if (this.layout !== undefined) return; // layout único de momento
    const baseDir = path.join(process.cwd(), 'src', 'notifications', 'templates');
    const layoutPath = path.join(baseDir, 'layout.hbs');
    const raw = fs.readFileSync(layoutPath, 'utf8');
    this.layout = Handlebars.compile(raw);
  }

  private ensurePartials(lang?: string) {
    if (this.partialsLoaded) return;
    const baseDir = path.join(process.cwd(), 'src', 'notifications', 'templates');
    const partialsDir = path.join(baseDir, 'partials');
    if (fs.existsSync(partialsDir)) {
      for (const file of fs.readdirSync(partialsDir)) {
        if (file.endsWith('.hbs')) {
          const name = file.replace('.hbs','');
            const raw = fs.readFileSync(path.join(partialsDir, file), 'utf8');
            Handlebars.registerPartial(name, raw);
        }
      }
    }
    this.partialsLoaded = true;
  }

  private loadTemplate(name: string, lang?: string) {
    const langCode = lang || 'es';
    const cacheKey = `${langCode}:${name}`;
    if (this.cache.has(cacheKey)) return this.cache.get(cacheKey)!;
    const baseDir = path.join(process.cwd(), 'src', 'notifications', 'templates');
    const localizedPath = path.join(baseDir, langCode, `${name}.hbs`);
    let filePath = path.join(baseDir, `${name}.hbs`); // fallback
    if (fs.existsSync(localizedPath)) {
      filePath = localizedPath;
    }
    const raw = fs.readFileSync(filePath, 'utf8');
    const compiled = Handlebars.compile(raw);
    this.cache.set(cacheKey, compiled);
    return compiled;
  }

  render(opts: RenderOptions): string {
    this.ensureLayout(opts.lang);
    this.ensurePartials(opts.lang);
    const bodyTpl = this.loadTemplate(opts.template, opts.lang);
    const bodyHtml = bodyTpl({ ...opts.variables });
    const full = this.layout({ ...opts.variables, body: bodyHtml });
    return juice(full); // inline CSS
  }
}
