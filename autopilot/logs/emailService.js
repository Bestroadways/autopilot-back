const nodemailer = require('nodemailer');
const fs = require('fs');
const path = require('path');
const cron = require('node-cron');

class EmailService {
    constructor() {
        this.transporter = null;
        this.config = null;
        this.loadConfig();
        this.setupTransporter();
        this.scheduleTask = null;
    }

    loadConfig() {
        try {
            const configPath = path.join(__dirname, 'web_config.json');
            const configData = fs.readFileSync(configPath, 'utf8');
            this.config = JSON.parse(configData);
        } catch (error) {
            console.error('[EMAIL SERVICE] Error loading config:', error);
            this.config = {
                emailConfig: {
                    senderEmail: 'suyashh.gupta@gmail.com',
                    senderPassword: 'cghezniyeyybbqxb',
                    recipientEmail: 'sg@bestroadways.com',
                    dailyReportTime: '21:00',
                    enableDailyReports: true
                }
            };
        }
    }

    setupTransporter() {
        if (!this.config?.emailConfig) return;

        this.transporter = nodemailer.createTransport({
            service: 'gmail',
            auth: {
                user: this.config.emailConfig.senderEmail,
                pass: this.config.emailConfig.senderPassword
            }
        });

        this.transporter.verify((error, success) => {
            if (error) {
                console.error('[EMAIL SERVICE] Transporter verification failed:', error);
            } else {
                console.log('[EMAIL SERVICE] Email transporter ready');
            }
        });
    }

    updateConfig(newEmailConfig) {
        try {
            this.config.emailConfig = { ...this.config.emailConfig, ...newEmailConfig };
            
            const configPath = path.join(__dirname, 'web_config.json');
            fs.writeFileSync(configPath, JSON.stringify(this.config, null, 2));
            
            this.setupTransporter();
            this.setupDailySchedule();
            
            return { success: true, message: 'Email configuration updated successfully' };
        } catch (error) {
            console.error('[EMAIL SERVICE] Error updating config:', error);
            return { success: false, message: 'Failed to update email configuration' };
        }
    }

    async sendDailyReport(reportData, excelBuffer) {
        if (!this.transporter || !this.config?.emailConfig) {
            throw new Error('Email service not configured');
        }

        const { recipientEmail, senderEmail } = this.config.emailConfig;
        const currentDate = new Date().toLocaleDateString('en-IN', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric'
        });

        const emailHTML = this.generateReportHTML(reportData, currentDate);

        const mailOptions = {
            from: `"GoComet Bidder System" <${senderEmail}>`,
            to: recipientEmail,
            subject: `Daily Bidding Report - ${currentDate}`,
            html: emailHTML,
            attachments: [
                {
                    filename: `Daily_Bidding_Report_${currentDate.replace(/\//g, '-')}.xlsx`,
                    content: excelBuffer,
                    contentType: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
                }
            ]
        };

        try {
            const info = await this.transporter.sendMail(mailOptions);
            console.log('[EMAIL SERVICE] Daily report sent successfully:', info.messageId);
            return { success: true, messageId: info.messageId };
        } catch (error) {
            console.error('[EMAIL SERVICE] Error sending daily report:', error);
            throw error;
        }
    }

    generateReportHTML(reportData, date) {
        const { stats, bids } = reportData;
        
        return `
        <!DOCTYPE html>
        <html>
        <head>
            <meta charset="UTF-8">
            <style>
                body { font-family: Arial, sans-serif; margin: 0; padding: 20px; background-color: #f5f5f5; }
                .container { max-width: 800px; margin: 0 auto; background: white; border-radius: 8px; box-shadow: 0 2px 10px rgba(0,0,0,0.1); }
                .header { background: linear-gradient(135deg, #4CAF50, #45a049); color: white; padding: 20px; border-radius: 8px 8px 0 0; text-align: center; }
                .content { padding: 20px; }
                .stats-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(150px, 1fr)); gap: 15px; margin: 20px 0; }
                .stat-card { background: #f8f9fa; border-left: 4px solid #4CAF50; padding: 15px; border-radius: 4px; }
                .stat-number { font-size: 24px; font-weight: bold; color: #333; }
                .stat-label { color: #666; font-size: 14px; margin-top: 5px; }
                .table-container { margin: 20px 0; overflow-x: auto; }
                table { width: 100%; border-collapse: collapse; background: white; }
                th, td { padding: 10px; text-align: left; border-bottom: 1px solid #ddd; }
                th { background: #f8f9fa; font-weight: bold; color: #333; }
                .status-won { color: #4CAF50; font-weight: bold; }
                .status-lost { color: #f44336; font-weight: bold; }
                .status-closed { color: #ff9800; font-weight: bold; }
                .footer { background: #f8f9fa; padding: 15px 20px; border-radius: 0 0 8px 8px; text-align: center; color: #666; font-size: 12px; }
                .highlight { background: linear-gradient(135deg, #e3f2fd, #bbdefb); padding: 15px; border-radius: 6px; margin: 15px 0; }
            </style>
        </head>
        <body>
            <div class="container">
                <div class="header">
                    <h1>🎯 Daily Bidding Report</h1>
                    <h2>${date}</h2>
                    <p>GoComet Bidder System - Automated Daily Summary</p>
                </div>
                
                <div class="content">
                    <div class="highlight">
                        <h3>📊 Performance Summary</h3>
                        <p>Here's your comprehensive daily bidding performance report with detailed statistics and bid outcomes.</p>
                    </div>
                    
                    <div class="stats-grid">
                        <div class="stat-card">
                            <div class="stat-number" style="color: #4CAF50;">${stats.wonCount}</div>
                            <div class="stat-label">Bids Won</div>
                        </div>
                        <div class="stat-card">
                            <div class="stat-number" style="color: #f44336;">${stats.lostCount}</div>
                            <div class="stat-label">Bids Lost</div>
                        </div>
                        <div class="stat-card">
                            <div class="stat-number" style="color: #ff9800;">${stats.closedCount}</div>
                            <div class="stat-label">Closed/No Quote</div>
                        </div>
                        <div class="stat-card">
                            <div class="stat-number" style="color: #2196F3;">${stats.participationRate}</div>
                            <div class="stat-label">Participation Rate</div>
                        </div>
                    </div>
                    
                    ${bids.length > 0 ? `
                    <h3>📋 Detailed Bid Results</h3>
                    <div class="table-container">
                        <table>
                            <thead>
                                <tr>
                                    <th>Enquiry</th>
                                    <th>Route</th>
                                    <th>Cargo</th>
                                    <th>Closed At</th>
                                    <th>Status</th>
                                    <th>Rank</th>
                                    <th>Quotes Sent</th>
                                    <th>Company</th>
                                </tr>
                            </thead>
                            <tbody>
                                ${bids.map(bid => `
                                <tr>
                                    <td><strong>${bid.enquiry_id || 'N/A'}</strong></td>
                                    <td>${bid.route || 'N/A'}</td>
                                    <td>${bid.cargo || 'N/A'}</td>
                                    <td>${bid.closed_at || 'N/A'}</td>
                                    <td class="status-${bid.status_class || 'closed'}">${bid.status || 'N/A'}</td>
                                    <td><strong>${bid.rank || 'N/A'}</strong></td>
                                    <td>${bid.quotes_sent || 'N/A'}</td>
                                    <td>${bid.company || 'N/A'}</td>
                                </tr>
                                `).join('')}
                            </tbody>
                        </table>
                    </div>
                    ` : '<p>No bids found for this date.</p>'}
                    
                    <div class="highlight">
                        <h3>📎 Excel Report Attached</h3>
                        <p>A detailed Excel spreadsheet with all bid data is attached to this email for further analysis and record keeping.</p>
                    </div>
                </div>
                
                <div class="footer">
                    <p>This report was automatically generated by GoComet Bidder System</p>
                    <p>Report generated on ${new Date().toLocaleString('en-IN')} | Created by Saksham Solanki</p>
                </div>
            </div>
        </body>
        </html>
        `;
    }

    setupDailySchedule() {
        if (this.scheduleTask) {
            this.scheduleTask.stop();
        }

        if (!this.config?.emailConfig?.enableDailyReports) {
            console.log('[EMAIL SERVICE] Daily reports disabled');
            return;
        }

        const reportTime = this.config.emailConfig.dailyReportTime || '21:00';
        const [hour, minute] = reportTime.split(':');
        const cronPattern = `${minute} ${hour} * * *`;

        this.scheduleTask = cron.schedule(cronPattern, async () => {
            console.log('[EMAIL SERVICE] Executing daily report task...');
            try {
                await this.generateAndSendDailyReport();
            } catch (error) {
                console.error('[EMAIL SERVICE] Daily report task failed:', error);
            }
        });

        console.log(`[EMAIL SERVICE] Daily report scheduled for ${reportTime} (${cronPattern})`);
    }

    async generateAndSendDailyReport() {
        try {
            const reportData = await this.getDailyReportData();
            const excelBuffer = await this.generateExcelReport(reportData.bids);
            
            await this.sendDailyReport(reportData, excelBuffer);
            console.log('[EMAIL SERVICE] Daily report sent successfully');
        } catch (error) {
            console.error('[EMAIL SERVICE] Failed to generate and send daily report:', error);
            throw error;
        }
    }

    async getDailyReportData() {
        const today = new Date().toISOString().split('T')[0];
        
        try {
            const axios = require('axios');
            const port = process.env.PORT || 3000;
            const response = await axios.get(`http://localhost:${port}/api/closed-bids?date=${today}`);
            return response.data;
        } catch (error) {
            console.error('[EMAIL SERVICE] Error fetching daily report data:', error);
            return { stats: { wonCount: 0, lostCount: 0, closedCount: 0, participationRate: '0%' }, bids: [] };
        }
    }

    async generateExcelReport(bids) {
        const XLSX = require('xlsx');
        
        const worksheetData = bids.map(bid => ({
            'Enquiry ID': bid.enquiry_id || 'N/A',
            'Route': bid.route || 'N/A',
            'Cargo': bid.cargo || 'N/A',
            'Closed At': bid.closed_at || 'N/A',
            'Status': bid.status || 'N/A',
            'Rank': bid.rank || 'N/A',
            'Quotes Sent': bid.quotes_sent || 'N/A',
            'Company': bid.company || 'N/A'
        }));

        const worksheet = XLSX.utils.json_to_sheet(worksheetData);
        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, 'Daily Report');

        return XLSX.write(workbook, { type: 'buffer', bookType: 'xlsx' });
    }

    getConfig() {
        return this.config?.emailConfig || {};
    }

    start() {
        this.setupDailySchedule();
        console.log('[EMAIL SERVICE] Service started');
    }

    stop() {
        if (this.scheduleTask) {
            this.scheduleTask.stop();
            console.log('[EMAIL SERVICE] Daily schedule stopped');
        }
    }
}

module.exports = EmailService;