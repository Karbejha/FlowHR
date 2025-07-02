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
    console.log('🔍 Starting SEO validation for FlowHR...\n');
    
    await this.checkTechnicalSEO();
    await this.checkContentSEO();
    await this.checkFiles();
    
    this.generateReport();
  }

  async checkTechnicalSEO() {
    console.log('📋 Checking Technical SEO...');
    
    // Check robots.txt
    try {
      const robotsContent = await this.fetchUrl(`${SITE_URL}/robots.txt`);
      this.results.technical.robotsTxt = robotsContent.includes('Sitemap:');
      console.log(`✅ robots.txt: ${this.results.technical.robotsTxt ? 'Found' : 'Missing'}`);
    } catch (error) {
      this.results.errors.push('robots.txt not accessible');
      console.log('❌ robots.txt: Not found');
    }

    // Check sitemap.xml
    try {
      const sitemapContent = await this.fetchUrl(`${SITE_URL}/sitemap.xml`);
      this.results.technical.sitemapXml = sitemapContent.includes('<urlset');
      console.log(`✅ sitemap.xml: ${this.results.technical.sitemapXml ? 'Found' : 'Missing'}`);
    } catch (error) {
      this.results.errors.push('sitemap.xml not accessible');
      console.log('❌ sitemap.xml: Not found');
    }

    // Check manifest.json
    try {
      const manifestContent = await this.fetchUrl(`${SITE_URL}/manifest.json`);
      const manifest = JSON.parse(manifestContent);
      this.results.technical.manifest = manifest.name && manifest.description;
      console.log(`✅ manifest.json: ${this.results.technical.manifest ? 'Valid' : 'Invalid'}`);
    } catch (error) {
      this.results.errors.push('manifest.json not accessible or invalid');
      console.log('❌ manifest.json: Not found or invalid');
    }

    // Check security.txt
    try {
      const securityContent = await this.fetchUrl(`${SITE_URL}/.well-known/security.txt`);
      this.results.technical.securityTxt = securityContent.includes('Contact:');
      console.log(`✅ security.txt: ${this.results.technical.securityTxt ? 'Found' : 'Missing'}`);
    } catch (error) {
      this.results.warnings.push('security.txt not found (recommended for enterprise sites)');
      console.log('⚠️  security.txt: Not found (optional)');
    }
  }

  async checkContentSEO() {
    console.log('\n📝 Checking Content SEO...');
    
    try {
      const homepageContent = await this.fetchUrl(SITE_URL);
      
      // Check title tag
      const titleMatch = homepageContent.match(/<title[^>]*>([^<]+)<\/title>/i);
      this.results.content.title = titleMatch ? titleMatch[1] : null;
      console.log(`✅ Title: ${this.results.content.title || 'Missing'}`);
      
      // Check meta description
      const descMatch = homepageContent.match(/<meta[^>]*name=["\']description["\'][^>]*content=["\']([^"']+)["\'][^>]*>/i);
      this.results.content.description = descMatch ? descMatch[1] : null;
      console.log(`✅ Description: ${this.results.content.description ? 'Found' : 'Missing'}`);
      
      // Check Open Graph tags
      const ogTitleMatch = homepageContent.match(/<meta[^>]*property=["\']og:title["\'][^>]*content=["\']([^"']+)["\'][^>]*>/i);
      this.results.content.ogTitle = ogTitleMatch ? ogTitleMatch[1] : null;
      console.log(`✅ OG Title: ${this.results.content.ogTitle ? 'Found' : 'Missing'}`);
      
      // Check structured data
      const structuredDataMatch = homepageContent.match(/<script[^>]*type=["\']application\/ld\+json["\'][^>]*>([^<]+)<\/script>/i);
      this.results.content.structuredData = !!structuredDataMatch;
      console.log(`✅ Structured Data: ${this.results.content.structuredData ? 'Found' : 'Missing'}`);
      
    } catch (error) {
      this.results.errors.push('Unable to fetch homepage for content analysis');
      console.log('❌ Homepage: Not accessible');
    }
  }

  checkFiles() {
    console.log('\n📁 Checking Local SEO Files...');
    
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
      console.log(`${exists ? '✅' : '❌'} ${file}: ${exists ? 'Found' : 'Missing'}`);
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
    console.log('\n📊 SEO Validation Report');
    console.log('========================\n');
    
    const totalChecks = Object.keys(this.results.technical).length + Object.keys(this.results.content).length;
    const passedChecks = Object.values({...this.results.technical, ...this.results.content}).filter(Boolean).length;
    const score = Math.round((passedChecks / totalChecks) * 100);
    
    console.log(`🎯 SEO Score: ${score}%\n`);
    
    if (this.results.errors.length > 0) {
      console.log('❌ Errors:');
      this.results.errors.forEach(error => console.log(`   - ${error}`));
      console.log('');
    }
    
    if (this.results.warnings.length > 0) {
      console.log('⚠️  Warnings:');
      this.results.warnings.forEach(warning => console.log(`   - ${warning}`));
      console.log('');
    }
    
    console.log('📋 Recommendations:');
    
    if (score < 80) {
      console.log('   - Fix critical SEO issues before deployment');
    }
    
    if (!this.results.content.description || this.results.content.description.length < 120) {
      console.log('   - Optimize meta descriptions (120-160 characters)');
    }
    
    if (!this.results.content.structuredData) {
      console.log('   - Add structured data for better search visibility');
    }
    
    console.log('   - Submit sitemap to Google Search Console');
    console.log('   - Set up Google Analytics');
    console.log('   - Monitor Core Web Vitals');
    console.log('   - Create quality backlinks from HR industry sites');
    
    console.log('\n✨ SEO validation complete!');
  }
}

// Run validation if called directly
if (require.main === module) {
  const validator = new SEOValidator();
  validator.validateAll().catch(console.error);
}

module.exports = SEOValidator;
