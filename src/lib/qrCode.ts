import QRCode from 'qrcode';

export const generateRewardQRCode = async (rewardId: string): Promise<string> => {
  try {
    const redeemUrl = `${process.env.NEXT_PUBLIC_BASE_URL || 'https://pendly.org'}/redeem?id=${rewardId}`;
    console.log('Generating QR code for URL:', redeemUrl);
    
    const qrCodeDataUrl = await QRCode.toDataURL(redeemUrl, {
      width: 200, // Smaller size for better email compatibility
      margin: 1, // Smaller margin
      color: {
        dark: '#000000', // Pure black for better contrast
        light: '#ffffff' // Pure white background
      },
      errorCorrectionLevel: 'M' // Medium error correction for better reliability
    });
    
    console.log('QR code generated successfully, data URL length:', qrCodeDataUrl.length);
    return qrCodeDataUrl;
  } catch (error) {
    console.error('Error generating QR code:', error);
    throw error;
  }
};

export const generateRewardQRCodeSVG = async (rewardId: string): Promise<string> => {
  try {
    const redeemUrl = `${process.env.NEXT_PUBLIC_BASE_URL || 'https://pendly.org'}/redeem?id=${rewardId}`;
    const qrCodeSVG = await QRCode.toString(redeemUrl, {
      type: 'svg',
      width: 300,
      margin: 2,
      color: {
        dark: '#1e40af', // blue-800
        light: '#ffffff'
      }
    });
    return qrCodeSVG;
  } catch (error) {
    console.error('Error generating QR code SVG:', error);
    throw error;
  }
}; 