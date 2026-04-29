import express from 'express';

const router = express.Router();

/**
 * @POST /api/contact
 * Submit a contact form message
 * Body: { name, email, message }
 */
router.post('/', async (req, res) => {
  try {
    const { name, email, message } = req.body;

    if (!name || !email || !message) {
      return res.status(400).json({
        success: false,
        message: 'Name, email, and message are required'
      });
    }

    // In a real app, save to database or send email
    // For now, we'll just log and return success
    console.log('[CONTACT] New message:', { name, email, message, timestamp: new Date().toISOString() });

    // You could add email sending here using a service like SendGrid, Nodemailer, etc.
    // Example: await sendContactEmail({ name, email, message });

    res.status(200).json({
      success: true,
      message: 'Thank you for your message! We\'ll get back to you soon.',
      data: {
        name,
        email,
        timestamp: new Date().toISOString()
      }
    });
  } catch (error) {
    console.error('[CONTACT] Error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to process contact request'
    });
  }
});

export default router;
