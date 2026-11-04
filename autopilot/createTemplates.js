#!/usr/bin/env node

const TemplateManager = require('./templateManager');
const path = require('path');

async function main() {
    console.log('🚛 GoComet WhatsApp Template Creator');
    console.log('=====================================\n');

    const templateManager = new TemplateManager();

    // Check if WhatsApp config is available
    if (!templateManager.config.whatsappConfig.apiKey || !templateManager.config.whatsappConfig.senderNumber) {
        console.error('❌ ERROR: WhatsApp configuration missing!');
        console.log('Please configure your DoubleTick API key and sender number in the settings first.');
        console.log('1. Go to Settings → Notifications');
        console.log('2. Enter your DoubleTick API key');
        console.log('3. Enter your WhatsApp Business number');
        console.log('4. Save settings\n');
        process.exit(1);
    }

    console.log('✅ WhatsApp configuration found');
    console.log(`📱 Sender Number: ${templateManager.config.whatsappConfig.senderNumber}`);
    console.log(`🔑 API Key: ${templateManager.config.whatsappConfig.apiKey.substring(0, 20)}...\n`);

    // Show predefined templates
    const freightTemplates = templateManager.getFreightBiddingTemplates();
    console.log('📋 Templates to be created:');
    console.log('==========================');
    
    Object.entries(freightTemplates).forEach(([name, template], index) => {
        console.log(`${index + 1}. ${name}`);
        console.log(`   Description: ${template.description}`);
        console.log(`   Category: ${template.category}`);
        console.log(`   Body Preview: ${template.components.body.text.substring(0, 80)}...`);
        console.log('');
    });

    // Validate all templates before creation
    console.log('🔍 Validating templates...');
    let allValid = true;
    
    for (const [name, template] of Object.entries(freightTemplates)) {
        const validation = templateManager.validateTemplate(template);
        if (!validation.isValid) {
            console.error(`❌ ${name}: ${validation.errors.join(', ')}`);
            allValid = false;
        } else {
            console.log(`✅ ${name}: Valid`);
        }
    }

    if (!allValid) {
        console.error('\n❌ Some templates have validation errors. Please fix them first.');
        process.exit(1);
    }

    console.log('\n🚀 Starting template creation...');
    console.log('This may take a few minutes due to API rate limits.\n');

    try {
        const results = await templateManager.createAllFreightTemplates();
        
        console.log('\n📊 TEMPLATE CREATION RESULTS');
        console.log('============================');
        
        let successCount = 0;
        let failureCount = 0;

        results.forEach((result, index) => {
            const status = result.success ? '✅ SUCCESS' : '❌ FAILED';
            console.log(`${index + 1}. ${result.templateName}: ${status}`);
            
            if (result.success) {
                successCount++;
                console.log(`   Status: ${result.status}`);
            } else {
                failureCount++;
                console.log(`   Error: ${result.error}`);
            }
            console.log('');
        });

        console.log(`📈 Summary: ${successCount} successful, ${failureCount} failed\n`);

        if (successCount > 0) {
            console.log('🎉 Templates created successfully!');
            console.log('📋 Next Steps:');
            console.log('1. Templates are now submitted to WhatsApp for approval');
            console.log('2. Approval typically takes 24-48 hours');
            console.log('3. You will receive approval notifications from WhatsApp');
            console.log('4. Once approved, update the template names in your settings');
            console.log('5. Enable WhatsApp notifications to start using them\n');

            // Generate and display report
            const report = templateManager.generateReport();
            console.log('📄 Template Status Report:');
            console.log(`   Total Templates: ${report.totalTemplates}`);
            console.log(`   Pending Approval: ${report.pendingApproval}`);
            console.log(`   Approved: ${report.approved}`);
            console.log(`   Rejected: ${report.rejected}\n`);

            console.log('💾 Template information saved to: whatsapp_templates.json');
        }

    } catch (error) {
        console.error('❌ Unexpected error during template creation:', error);
        process.exit(1);
    }
}

// Handle command line arguments
const args = process.argv.slice(2);

if (args.includes('--help') || args.includes('-h')) {
    console.log('🚛 GoComet WhatsApp Template Creator');
    console.log('Usage: node createTemplates.js [options]');
    console.log('');
    console.log('Options:');
    console.log('  --help, -h     Show this help message');
    console.log('  --status, -s   Show current template status');
    console.log('');
    console.log('This script creates WhatsApp message templates for:');
    console.log('- New freight bid notifications');
    console.log('- Bid won notifications');
    console.log('- Bid lost notifications');  
    console.log('- Urgent bid reminders');
    process.exit(0);
}

if (args.includes('--status') || args.includes('-s')) {
    const templateManager = new TemplateManager();
    const report = templateManager.generateReport();
    
    console.log('📊 Current Template Status');
    console.log('=========================');
    console.log(`Total Templates: ${report.totalTemplates}`);
    console.log(`Pending Approval: ${report.pendingApproval}`);
    console.log(`Approved: ${report.approved}`);
    console.log(`Rejected: ${report.rejected}\n`);
    
    if (report.templates.length > 0) {
        console.log('Template Details:');
        report.templates.forEach((template, index) => {
            console.log(`${index + 1}. ${template.name}`);
            console.log(`   Status: ${template.status}`);
            console.log(`   Created: ${new Date(template.createdAt).toLocaleString()}`);
            console.log(`   Description: ${template.description}`);
            console.log('');
        });
    } else {
        console.log('No templates created yet. Run without --status to create them.');
    }
    
    process.exit(0);
}

// Run main function
main().catch(error => {
    console.error('❌ Fatal error:', error);
    process.exit(1);
});