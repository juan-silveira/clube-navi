/**
 * WhatsApp Controller
 * Handles WhatsApp message sending
 */

const { masterPrisma } = require('../database');
const { getClubClient } = require('../database');
const axios = require('axios');

class WhatsAppController {
  /**
   * Send WhatsApp message
   * @route POST /api/super-admin/whatsapp/send
   */
  async send(req, res) {
    try {
      const {
        clubId,
        message,
        phoneNumbers,
        sendToAll = false
      } = req.body;

      if (!message) {
        return res.status(400).json({
          success: false,
          message: 'Message is required'
        });
      }

      if (!clubId) {
        return res.status(400).json({
          success: false,
          message: 'Club ID is required'
        });
      }

      // Get club database
      const club = await masterPrisma.club.findUnique({
        where: { id: clubId }
      });

      if (!club) {
        return res.status(404).json({
          success: false,
          message: 'Club not found'
        });
      }

      const clubPrisma = await getClubClient(club.databaseUrl);

      // Get target users
      let users = [];
      if (sendToAll) {
        users = await clubPrisma.user.findMany({
          where: {
            isActive: true,
            phone: { not: null }
          },
          select: { id: true, name: true, phone: true }
        });
      } else if (phoneNumbers && phoneNumbers.length > 0) {
        users = phoneNumbers.map(phone => ({ phone }));
      }

      // Send messages via WhatsApp webhook
      const results = [];
      for (const user of users) {
        if (user.phone) {
          try {
            await axios.post('https://webhook.n8n.net.br/webhook/envios-coinage', {
              user: club.companyName || 'Sistema',
              dest: user.phone,
              text: message
            });
            results.push({ phone: user.phone, success: true });
          } catch (error) {
            console.error(`Error sending to ${user.phone}:`, error.message);
            results.push({ phone: user.phone, success: false, error: error.message });
          }
        }
      }

      const successCount = results.filter(r => r.success).length;

      res.json({
        success: true,
        message: `WhatsApp messages sent: ${successCount}/${results.length}`,
        data: {
          total: results.length,
          success: successCount,
          failed: results.length - successCount,
          results
        }
      });

    } catch (error) {
      console.error('❌ [WhatsApp] Send error:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  }

  /**
   * Get WhatsApp message history
   * @route GET /api/super-admin/whatsapp/history
   */
  async getHistory(req, res) {
    try {
      const {
        page = 1,
        limit = 20,
        clubId
      } = req.query;

      // TODO: Implement message history from database
      res.json({
        success: true,
        data: {
          messages: [],
          pagination: {
            page: parseInt(page),
            limit: parseInt(limit),
            total: 0,
            totalPages: 0
          }
        }
      });

    } catch (error) {
      console.error('❌ [WhatsApp] History error:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  }
}

module.exports = new WhatsAppController();
