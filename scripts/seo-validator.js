#!/usr/bin/env node

/**
 * SEO Validation Script for FlowHR
 * Run this script to validate all SEO implementations
 */

const https = require('https');
const fs = require('fs');
const path = require('path');

const SITE_URL = 'https://flow-hr-seven.vercel.app';

class SEOValidator {
  constructor() {
    this.results = {
      technical: {},
      content: {},
      performance: {},
      errors: [],
      warnings: [],
      recommendations: []
    };
  }

  async validateAll() {
    await this.checkTechnicalSEO();
    await this.checkContentSEO();
    await this.checkFiles();
    
    this.generateReport();
  }

  async checkTechnicalSEO() {
    // Check robots.txt
    try {
      const robotsContent = await this.fetchUrl(`${SITE_URL}/robots.txt`);
      this.results.technical.robotsTxt = robotsContent.includes('Sitemap:');
    } catch (error) {
      this.results.errors.push('robots.txt not accessible');
    }

    // Check sitemap.xml
    try {
      const sitemapContent = await this.fetchUrl(`${SITE_URL}/sitemap.xml`);
      this.results.technical.sitemapXml = sitemapContent.includes('<urlset');
    } catch (error) {
      this.results.errors.push('sitemap.xml not accessible');
    }

    // Check manifest.json
    try {
      const manifestContent = await this.fetchUrl(`${SITE_URL}/manifest.json`);
      const manifest = JSON.parse(manifestContent);
      this.results.technical.manifest = manifest.name && manifest.description;
    } catch (error) {
      this.results.errors.push('manifest.json not accessible or invalid');
    }

    // Check security.txt
    try {
      const securityContent = await this.fetchUrl(`${SITE_URL}/.well-known/security.txt`);
      this.results.technical.securityTxt = securityContent.includes('Contact:');
    } catch (error) {
      this.results.warnings.push('security.txt not found (recommended for enterprise sites)');
    }
  }

  async checkContentSEO() {    
    try {
      const homepageContent = await this.fetchUrl(SITE_URL);
      
      // Check title tag
      const titleMatch = homepageContent.match(/<title[^>]*>([^<]+)<\/title>/i);
      this.results.content.title = titleMatch ? titleMatch[1] : null;      
      // Check meta description
      const descMatch = homepageContent.match(/<meta[^>]*name=["\']description["\'][^>]*content=["\']([^"']+)["\'][^>]*>/i);
      this.results.content.description = descMatch ? descMatch[1] : null;      
      // Check Open Graph tags
      const ogTitleMatch = homepageContent.match(/<meta[^>]*property=["\']og:title["\'][^>]*content=["\']([^"']+)["\'][^>]*>/i);
      this.results.content.ogTitle = ogTitleMatch ? ogTitleMatch[1] : null;      
      // Check structured data
      const structuredDataMatch = homepageContent.match(/<script[^>]*type=["\']application\/ld\+json["\'][^>]*>([^<]+)<\/script>/i);
      this.results.content.structuredData = !!structuredDataMatch;      
    } catch (error) {
      this.results.errors.push('Unable to fetch homepage for content analysis');
    }
  }

  checkFiles() {    
    const filesToCheck = [
      'client/public/robots.txt',
      'client/src/app/sitemap.ts',
      'client/public/manifest.json',
      'client/src/utils/seo.ts',
      'client/src/components/seo/StructuredData.tsx'
    ];

    filesToCheck.forEach(file => {
      const fullPath = path.join(process.cwd(), file);
      const exists = fs.existsSync(fullPath);
    });
  }

  async fetchUrl(url) {
    return new Promise((resolve, reject) => {
      https.get(url, (res) => {
        let data = '';
        res.on('data', (chunk) => data += chunk);
        res.on('end', () => resolve(data));
      }).on('error', reject);
    });
  }

  generateReport() {
    const totalChecks = Object.keys(this.results.technical).length + Object.keys(this.results.content).length;
    const passedChecks = Object.values({...this.results.technical, ...this.results.content}).filter(Boolean).length;
    const score = Math.round((passedChecks / totalChecks) * 100);    
    if (this.results.errors.length > 0) {
      this.results.errors.forEach(error => console.log(`   - ${error}`));
    }
    if (this.results.warnings.length > 0) {
      this.results.warnings.forEach(warning => console.log(`   - ${warning}`));
      console.log('');
    }    
    if (score < 80) {
    }
    if (!this.results.content.description || this.results.content.description.length < 120) {
    }
    if (!this.results.content.structuredData) {
    }
  }
}

// Run validation if called directly
if (require.main === module) {
  const validator = new SEOValidator();
  validator.validateAll().catch(console.error);
}

module.exports = SEOValidator;
