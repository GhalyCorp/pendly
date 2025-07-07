import { initializeApp } from "firebase-admin/app";
import { onDocumentCreated } from "firebase-functions/v2/firestore";
import sgMail from "@sendgrid/mail";
import { getFirestore } from "firebase-admin/firestore";
import { defineSecret } from "firebase-functions/params";
import QRCode from "qrcode";

initializeApp();

const sendgridApiKey = defineSecret("SENDGRID_API_KEY");

// Function to determine which reward tier the donor qualifies for
function getRewardTier(donationAmount: number, rewardTiers: any[]): any | null {
  if (!rewardTiers || rewardTiers.length === 0) {
    return null;
  }

  // Sort reward tiers by minimum amount (highest first) to find the highest tier they qualify for
  const sortedTiers = [...rewardTiers].sort((a, b) => b.minAmount - a.minAmount);
  
  // Find the highest tier they qualify for
  for (const tier of sortedTiers) {
    if (donationAmount >= tier.minAmount) {
      return tier;
    }
  }
  
  return null;
}

// ONE SINGLE FUNCTION - NO DUPLICATES
export const sendRewardEmail = onDocumentCreated(
  {
    document: "businesses/{businessId}/donations/{donationId}",
    region: "us-central1",
    secrets: [sendgridApiKey],
  },
  async (event) => {
    const snap = event.data;
    if (!snap) return;
    
    const donation = snap.data();
    const { email, amount, name } = donation;
    const businessId = event.params.businessId;
    
    if (!amount || !businessId || !email) {
      console.log("Missing required fields");
      return;
    }

    try {
      // Set up SendGrid
      const apiKey = sendgridApiKey.value();
      console.log("API Key length:", apiKey ? apiKey.length : 0);
      console.log("API Key starts with SG.:", apiKey ? apiKey.startsWith('SG.') : false);
      console.log("API Key first 10 chars:", apiKey ? apiKey.substring(0, 10) : 'none');
      
      if (!apiKey || !apiKey.startsWith('SG.')) {
        console.log("SendGrid not configured - API key invalid");
        return;
      }
      
      // Clean the API key to remove any whitespace or hidden characters
      const cleanApiKey = apiKey.trim();
      console.log("Clean API Key length:", cleanApiKey.length);
      
      sgMail.setApiKey(cleanApiKey);

      // Get business info
      const db = getFirestore();
      const businessSnap = await db.collection("businesses").doc(businessId).get();
      
      if (!businessSnap.exists) {
        console.log("Business not found");
        return;
      }
      
      const business = businessSnap.data();
      const businessName = business?.businessName || business?.name || "a business";
      const businessEmail = business?.email;
      const campaignTitle = business?.campaignTitle || business?.description || "a business";
      const rewardTiers = business?.rewardTiers || [];
      const rewardTier = getRewardTier(amount, rewardTiers);
      const rewardTitle = rewardTier ? rewardTier.coupon : "Thank You Reward";

      // IDEMPOTENCY CHECK - Use donationId as reward ID to prevent duplicates
      const rewardRef = db.collection('rewards').doc(event.params.donationId);
      const rewardSnap = await rewardRef.get();

      if (rewardSnap.exists) {
        console.log("Reward already exists for donation", event.params.donationId, "- skipping duplicate email.");
        return;
      }

      // Create reward record with donationId as the reward ID
      const rewardData = {
        businessId,
        businessName,
        campaignTitle,
        donorName: name || 'Anonymous',
        donorEmail: email,
        donationAmount: amount,
        rewardTitle,
        rewardDescription: `Reward for $${(amount / 100).toFixed(2)} donation`,
        used: false,
        createdAt: new Date(),
      };
      
      await rewardRef.set(rewardData);
      const rewardId = rewardRef.id;
      
      // Generate QR code as data URL
      const redeemUrl = `https://pendly.org/redeem?id=${rewardId}`;
      const qrCodeDataUrl = await QRCode.toDataURL(redeemUrl, {
        width: 200,
        margin: 2,
        color: { dark: '#000000', light: '#ffffff' },
        errorCorrectionLevel: 'M',
      });

      // EMAIL 1: Send to donor
      const donorEmailContent = `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <title>Your Reward from Pendly</title>
          <style>
            body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 0; background: #f8fafc; }
            .container { max-width: 600px; margin: 0 auto; background: white; border-radius: 18px; box-shadow: 0 4px 16px rgba(0,0,0,0.07); overflow: hidden; }
            .header { background: #2563eb; color: white; padding: 40px 30px; text-align: center; border-radius: 18px 18px 0 0; }
            .header h1 { margin: 0; font-size: 32px; font-weight: 700; }
            .header p { margin: 10px 0 0 0; font-size: 18px; opacity: 0.9; }
            .content { padding: 40px 30px; }
            .reward-box { background: #f0f6ff; border: 2px solid #2563eb22; border-radius: 14px; padding: 30px; margin: 30px 0; text-align: center; }
            .reward-title { font-size: 24px; font-weight: 700; color: #2563eb; margin: 0 0 10px 0; }
            .reward-desc { font-size: 16px; color: #2563eb; margin: 0; }
            .qr-section { text-align: center; margin: 40px 0; }
            .qr-code { display: inline-block; padding: 25px; background: white; border: 2px solid #e5e7eb; border-radius: 14px; box-shadow: 0 4px 20px rgba(0,0,0,0.08); }
            .qr-code img { border-radius: 8px; }
            .qr-text { font-weight: 600; color: #2563eb; margin-bottom: 20px; font-size: 18px; }
            .qr-note { color: #6b7280; font-size: 14px; margin-top: 15px; }
            .details-box { background: #f8fafc; border-left: 4px solid #2563eb; padding: 25px; margin: 30px 0; border-radius: 0 10px 10px 0; }
            .details-title { color: #2563eb; font-weight: 700; margin: 0 0 15px 0; font-size: 18px; }
            .detail-row { margin: 8px 0; }
            .detail-label { font-weight: 600; color: #374151; }
            .detail-value { color: #2563eb; }
            .footer { text-align: center; padding: 30px; color: #6b7280; font-size: 14px; background: #f8fafc; border-top: 1px solid #e5e7eb; border-radius: 0 0 18px 18px; }
            .thank-you { text-align: center; margin: 30px 0; color: #2563eb; font-size: 16px; }
            .important { background: #f0f6ff; color: #2563eb; border-radius: 10px; padding: 18px; margin: 30px 0 10px 0; font-size: 15px; font-weight: 600; text-align: center; border: 1.5px solid #2563eb33; }
            .meta { color: #6b7280; font-size: 13px; margin-top: 18px; text-align: center; }
            .meta strong { color: #2563eb; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>🎁 Your Reward</h1>
              <p>Thank you for your donation!</p>
            </div>
            
            <div class="content">
              <p style="font-size: 18px; margin-bottom: 20px;">Hi ${name || "there"},</p>
              <p style="font-size: 16px; margin-bottom: 30px;">Thank you for your donation of <strong style="color: #2563eb;">$${(amount / 100).toFixed(2)}</strong> to <strong style="color: #2563eb;">${businessName}</strong>!</p>
              
              <div class="reward-box">
                <div class="reward-title">🎉 You've Earned a Reward!</div>
                <div class="reward-desc">${rewardTitle}</div>
                ${rewardTier ? `<div style="margin-top: 10px; font-size: 14px; color: #2563eb;">Minimum donation: $${(rewardTier.minAmount / 100).toFixed(2)}+</div>` : ''}
              </div>
              
              <div class="qr-section">
                <div class="qr-text">Show this QR code to redeem your reward:</div>
                <div class="qr-code">
                  <img src="${qrCodeDataUrl}" alt="QR Code" width="200" height="200" />
                </div>
                <div class="qr-note">This QR code is unique to your reward and cannot be reused.</div>
                <div style="margin-top: 15px;">
                  <a href="${redeemUrl}" style="color: #2563eb; text-decoration: none; font-weight: 600;">Click here to redeem online</a>
                </div>
              </div>
              
              <div class="details-box">
                <div class="details-title">📋 Donation Details</div>
                <div class="detail-row">
                  <span class="detail-label">Amount:</span>
                  <span class="detail-value"> $${(amount / 100).toFixed(2)}</span>
                </div>
                <div class="detail-row">
                  <span class="detail-label">Date:</span>
                  <span class="detail-value"> ${new Date().toLocaleDateString()}</span>
                </div>
                <div class="detail-row">
                  <span class="detail-label">Campaign:</span>
                  <span class="detail-value"> ${campaignTitle}</span>
                </div>
              </div>
              
              <div class="important">
                Important: This QR code can only be used once. Once scanned by the business, it will be marked as redeemed.
              </div>
              <div class="thank-you">
                Thank you again for supporting local businesses through Pendly!<br><br>
                Best regards,<br>
                The Pendly Team
              </div>
              <div class="meta">
                This email was sent from Pendly - Supporting local businesses and communities.<br>
                Need help? Contact us at <a href="mailto:adamghaly@pendly.org" style="color:#2563eb;">adamghaly@pendly.org</a><br>
                <strong>Reward ID:</strong> ${rewardId}
              </div>
            </div>
            <div class="footer"></div>
          </div>
        </body>
        </html>
      `;

      await sgMail.send({
        to: email,
        from: "rewards@pendly.org",
        subject: `🎁 Your Reward from Pendly - ${businessName}`,
        html: donorEmailContent,
      });
      
      console.log("EMAIL 1 SENT TO DONOR:", email);

      // EMAIL 2: Send to business owner (if they have an email)
      if (businessEmail) {
        const businessEmailContent = `
          <!DOCTYPE html>
          <html>
          <head>
            <meta charset="utf-8">
            <title>New Donation Received</title>
            <style>
              body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 0; background: #f8fafc; }
              .container { max-width: 600px; margin: 0 auto; background: white; border-radius: 18px; box-shadow: 0 4px 16px rgba(0,0,0,0.07); overflow: hidden; }
              .header { background: #10b981; color: white; padding: 40px 30px; text-align: center; border-radius: 18px 18px 0 0; }
              .header h1 { margin: 0; font-size: 32px; font-weight: 700; }
              .header p { margin: 10px 0 0 0; font-size: 18px; opacity: 0.9; }
              .content { padding: 40px 30px; }
              .amount-box { background: #f8fafc; border: 2px solid #10b98122; border-radius: 14px; padding: 30px; margin: 30px 0; text-align: center; }
              .amount-title { font-size: 24px; font-weight: 700; color: #10b981; margin: 0 0 10px 0; }
              .amount-value { font-size: 32px; font-weight: 700; color: #10b981; margin: 0; }
              .details-box { background: #f8fafc; border-left: 4px solid #10b981; padding: 25px; margin: 30px 0; border-radius: 0 10px 10px 0; }
              .details-title { color: #10b981; font-weight: 700; margin: 0 0 15px 0; font-size: 18px; }
              .detail-row { margin: 8px 0; }
              .detail-label { font-weight: 600; color: #374151; }
              .detail-value { color: #10b981; }
              .footer { text-align: center; padding: 30px; color: #6b7280; font-size: 14px; background: #f8fafc; border-top: 1px solid #e5e7eb; border-radius: 0 0 18px 18px; }
              .thank-you { text-align: center; margin: 30px 0; color: #10b981; font-size: 16px; }
            </style>
          </head>
          <body>
            <div class="container">
              <div class="header">
                <h1>💰 New Donation!</h1>
                <p>You just received $${(amount / 100).toFixed(2)}</p>
              </div>
              
              <div class="content">
                <div class="amount-box">
                  <div class="amount-title">🎉 Donation Received!</div>
                  <div class="amount-value">$${(amount / 100).toFixed(2)}</div>
                  <div style="margin-top: 10px; font-size: 14px; color: #6b7280;">Total donation received</div>
                </div>
                
                <div class="details-box">
                  <div class="details-title">📋 Donor Details</div>
                  <div class="detail-row">
                    <span class="detail-label">Name:</span>
                    <span class="detail-value"> ${name || 'Anonymous'}</span>
                  </div>
                  <div class="detail-row">
                    <span class="detail-label">Email:</span>
                    <span class="detail-value"> ${email}</span>
                  </div>
                  <div class="detail-row">
                    <span class="detail-label">Amount:</span>
                    <span class="detail-value"> $${(amount / 100).toFixed(2)}</span>
                  </div>
                  <div class="detail-row">
                    <span class="detail-label">Campaign:</span>
                    <span class="detail-value"> ${campaignTitle}</span>
                  </div>
                </div>
                
                <div class="thank-you">
                  Thank you for using Pendly to connect with your community!
                </div>
              </div>
              <div class="footer">
                <p>This email was sent from Pendly - Supporting local businesses and communities.</p>
              </div>
            </div>
          </body>
          </html>
        `;

        await sgMail.send({
          to: businessEmail,
          from: "rewards@pendly.org",
          subject: `New Donation Received - $${(amount / 100).toFixed(2)}`,
          html: businessEmailContent,
        });
        
        console.log("EMAIL 2 SENT TO BUSINESS:", businessEmail);
      }
      
      console.log("EXACTLY 2 EMAILS SENT - NO MORE, NO LESS");
      
    } catch (error) {
      console.error("Error sending email:", error);
    }
  }
);
