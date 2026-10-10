
import { useEffect, useState } from "react";
import { Html5QrcodeScanner } from "html5-qrcode";

export default function ScanQR() {
  const [message, setMessage] = useState(
    "Allow camera access to scan a product QR code."
  );

  useEffect(() => {
    const scanner = new Html5QrcodeScanner(
      "qr-reader",
      {
        fps: 10,
        qrbox: { width: 220, height: 220 },
        rememberLastUsedCamera: true,
      },
      false
    );

    scanner.render(
      (decodedText) => {
        setMessage("QR code scanned successfully!");

        try {
          const url = new URL(decodedText);

          // Only allow URLs belonging to this running website.
          if (url.origin !== window.location.origin) {
            setMessage("This QR code does not belong to this website.");
            return;
          }

          if (!/^\/verify\/\d+$/.test(url.pathname)) {
            setMessage("This QR code is not a valid product verification link.");
            return;
          }

          scanner.clear().catch(() => {});
          window.location.assign(url.pathname);
        } catch {
          setMessage("Invalid QR code. Please scan a product verification QR code.");
        }
      },
      () => {
        // Ignore repeated camera scan failures while searching for a QR code.
      }
    );

    return () => {
      scanner.clear().catch(() => {});
    };
  }, []);

  return (
    <section className="card">
      <h2>Scan Product QR Code</h2>
      <p>{message}</p>
      <div id="qr-reader" style={{ width: "100%" }} />
    </section>
  );
}
