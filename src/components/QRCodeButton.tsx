"use client";

import { useState } from "react";
import QRCode from "react-qr-code";

interface QRCodeButtonProps {
  url: string;
}

export default function QRCodeButton({ url }: QRCodeButtonProps) {
  const [showQR, setShowQR] = useState(false);

  return (
    <div className="text-center my-4">
      <button
        onClick={() => setShowQR(!showQR)}
        className="bg-blue-600 text-white px-4 py-2 rounded"
      >
        {showQR ? "Hide QR Code" : "Show QR Code"}
      </button>

      {showQR && (
        <div className="mt-4 p-4 bg-white rounded shadow inline-block">
          <QRCode value={url} size={200} />
          <p className="mt-2 text-sm text-gray-600">Scan to donate</p>
        </div>
      )}
    </div>
  );
}
