# WhatsApp Template Creation Guide

## Overview
This guide explains how to create WhatsApp message templates for the GoComet Bidder system using the integrated template management system.

## Quick Start

### 1. Configure WhatsApp Settings
Before creating templates, ensure your WhatsApp integration is configured:
1. Go to **Settings → Notifications**
2. Enter your **DoubleTick API Key**
3. Enter your **WhatsApp Business Number**
4. **Save Settings**

### 2. Create Templates via Web Interface
1. Go to **Settings → Notifications** 
2. Scroll to **WhatsApp Templates** section
3. Click **"Create All Templates"**
4. Wait for completion (may take 2-3 minutes)
5. Check status in the template list

### 3. Create Templates via Command Line
```bash
# Navigate to project directory
cd gocomet_bidder

# Create all templates
node createTemplates.js

# Check template status
node createTemplates.js --status

# Show help
node createTemplates.js --help
```

## Template Details

The system creates 4 specialized templates for freight bidding:

### 1. `freight_bid_new`
- **Purpose**: Notify about new freight bids
- **Message**: "🚛 New freight bid available for {{1}}.\n\nRoute: {{2}} to {{3}}\nCargo: {{4}}\nDeadline: {{5}}\n\nSubmit your rate: {{6}}"
- **Variables**: Enquiry ID, Origin, Destination, Cargo, Deadline, Public Link

### 2. `freight_bid_won`
- **Purpose**: Congratulate on winning bids
- **Message**: "🎉 Congratulations! You have WON the bid for {{1}}.\n\nRoute: {{2}} to {{3}}\nYour Rate: ₹{{4}}\nFinal Rank: {{5}}\nTotal Submissions: {{6}}"
- **Variables**: Enquiry ID, Origin, Destination, Rate, Rank, Submissions

### 3. `freight_bid_lost`
- **Purpose**: Notify about lost bids
- **Message**: "Bid closed for {{1}}.\n\nRoute: {{2}} to {{3}}\nYour Rate: ₹{{4}}\nFinal Rank: {{5}}\nTotal Submissions: {{6}}\n\nBetter luck next time!"
- **Variables**: Enquiry ID, Origin, Destination, Rate, Rank, Submissions

### 4. `freight_urgent`
- **Purpose**: Send urgent reminders for closing bids
- **Message**: "⚡ URGENT: Bid closing soon for {{1}}!\n\nRoute: {{2}} to {{3}}\nTime Remaining: {{4}}\n\nSubmit your rate NOW: {{5}}"
- **Variables**: Enquiry ID, Origin, Destination, Time Remaining, Public Link

## Template Approval Process

### WhatsApp's Review Process
1. **Submission**: Templates are automatically submitted to WhatsApp
2. **Review Time**: 24-48 hours (typically)
3. **Approval**: WhatsApp approves/rejects based on their policies
4. **Notification**: You'll receive approval status via email/WhatsApp

### Template Status Tracking
- **Pending Approval**: 🟡 Submitted, waiting for WhatsApp review
- **Approved**: ✅ Ready to use for messaging
- **Rejected**: ❌ Needs modification and resubmission

## Using Approved Templates

### 1. Update Template Configuration
Once templates are approved:
1. Go to **Settings → Notifications**
2. Update **Template Name** field with approved template name
3. **Save Settings**

### 2. Enable WhatsApp Notifications
1. Toggle **"Enable WhatsApp Notifications"**
2. Templates will be used automatically for:
   - New bid notifications
   - Bid result notifications (win/loss)

## API Integration

### Template Management Endpoints
```javascript
// Get all templates
GET /api/templates

// Get template report
GET /api/templates/report

// Create all freight templates
POST /api/templates/create-all

// Update template status
POST /api/templates/{templateName}/status

// Get predefined templates
GET /api/templates/predefined
```

### Template Manager Class
```javascript
const TemplateManager = require('./templateManager');
const templateManager = new TemplateManager();

// Create all templates
const results = await templateManager.createAllFreightTemplates();

// Get template status
const report = templateManager.generateReport();

// Update status manually
templateManager.updateTemplateStatus('freight_bid_new', 'approved');
```

## Troubleshooting

### Common Issues

#### 1. "WhatsApp configuration missing"
- **Solution**: Configure API key and sender number in settings first

#### 2. "Template creation failed"
- **Solution**: Check DoubleTick API key validity and account status

#### 3. "Template rejected by WhatsApp"
- **Solution**: Review WhatsApp Business Policy and modify template content

#### 4. "API rate limiting"
- **Solution**: System automatically adds delays, wait for completion

### Template Validation
Templates are validated for:
- ✅ Name length (1-512 characters)
- ✅ Body text length (max 1024 characters)
- ✅ Header text length (max 60 characters)
- ✅ Footer text length (max 60 characters)
- ✅ Category (UTILITY/MARKETING)
- ✅ Required components

## Best Practices

### Template Design
1. **Keep messages concise** - WhatsApp users prefer short messages
2. **Use clear placeholders** - {{1}}, {{2}}, etc. for dynamic content
3. **Add value** - Every message should provide useful information
4. **Follow WhatsApp policies** - No promotional content in UTILITY templates

### Approval Tips
1. **Use UTILITY category** - For business notifications
2. **Avoid marketing language** - Focus on functional communication
3. **Include clear purpose** - Make the business need obvious
4. **Test thoroughly** - Ensure placeholders work correctly

## File Structure
```
gocomet_bidder/
├── templateManager.js          # Template management class
├── createTemplates.js          # CLI template creation script
├── whatsapp_templates.json     # Template storage (auto-generated)
├── server.js                   # API endpoints for templates
└── public/
    ├── settings.html           # Template management UI
    ├── settings.js             # Template management functions
    └── styles.css              # Template UI styling
```

## Next Steps

1. **Create Templates**: Use web interface or CLI to create templates
2. **Wait for Approval**: Monitor approval status (24-48 hours)
3. **Configure System**: Update template names in settings
4. **Enable Notifications**: Turn on WhatsApp notifications
5. **Test Integration**: Send test messages to verify functionality

For support with template creation or approval issues, refer to DoubleTick documentation or contact their support team.