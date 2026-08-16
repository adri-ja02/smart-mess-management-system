import { useEffect, useRef, useState } from "react";
import { Html5Qrcode } from "html5-qrcode";
import { scanQrCheckIn } from "../services/mealRecordService";

const SCANNER_ELEMENT_ID = "qr-scanner-region";

const QrScanner = ({ onCheckedIn }) => {
  const scannerRef = useRef(null);
  const isMountedRef = useRef(false);
  const isStartingRef = useRef(false);
  const isProcessingRef = useRef(false);

  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [isRunning, setIsRunning] = useState(false);
  const [starting, setStarting] = useState(false);

  // Remembers the last code that was successfully checked in, and when.
  // Used to silently ignore that same code if the camera keeps seeing it
  // for a moment while being moved to the next resident's QR — the
  // scanner stays running, but we don't re-hit the API or show an
  // "already checked in" error for a lingering frame of the same code.
  const lastSuccessRef = useRef({ tokenCode: null, at: 0 });
  const IGNORE_SAME_CODE_MS = 4000;

  /*
   * Create scanner when component mounts.
   */
  useEffect(() => {
    isMountedRef.current = true;

    const scanner = new Html5Qrcode(SCANNER_ELEMENT_ID);
    scannerRef.current = scanner;

    return () => {
      isMountedRef.current = false;

      const currentScanner = scannerRef.current;

      if (!currentScanner) {
        return;
      }

      /*
       * IMPORTANT:
       * Do not call clear().catch().
       * clear() is not guaranteed to return a Promise.
       */

      if (currentScanner.isScanning) {
        currentScanner
          .stop()
          .then(() => {
            try {
              currentScanner.clear();
            } catch (err) {
              // Scanner DOM is already being removed.
            }
          })
          .catch(() => {
            // Scanner may already have stopped.
            try {
              currentScanner.clear();
            } catch (err) {
              // Ignore cleanup errors.
            }
          });
      } else {
        try {
          currentScanner.clear();
        } catch (err) {
          // Ignore cleanup errors.
        }
      }

      scannerRef.current = null;
    };
  }, []);

  /*
   * Stop camera scanner manually / internally.
   * Defined above handleDecodedText so the success path can call it
   * directly instead of duplicating the stop logic.
   */
  const stopScanning = async () => {
    const scanner = scannerRef.current;

    if (!scanner) {
      return;
    }

    try {
      if (scanner.isScanning) {
        await scanner.stop();
      }
    } catch (err) {
      /*
       * Scanner may already have stopped.
       * Do not crash the React component.
       */
      console.warn("Scanner was already stopped.");
    } finally {
      if (isMountedRef.current) {
        setIsRunning(false);
      }
    }
  };

  /*
   * Handle QR code after it has been decoded.
   */
  const handleDecodedText = async (tokenCode) => {
    if (isProcessingRef.current) {
      return;
    }

    // The camera keeps running after a successful check-in so the
    // operator can move to the next resident. If it re-decodes the same
    // code while it's still drifting out of frame, ignore it quietly —
    // no API call, no error message. A different code is never ignored.
    const { tokenCode: lastCode, at: lastAt } = lastSuccessRef.current;
    if (
      tokenCode === lastCode &&
      Date.now() - lastAt < IGNORE_SAME_CODE_MS
    ) {
      return;
    }

    isProcessingRef.current = true;

    if (isMountedRef.current) {
      setMessage("");
      setError("");
    }

    try {
      const result = await scanQrCheckIn(tokenCode);

      if (isMountedRef.current) {
        setMessage(
          `Checked in: ${
            result.record?.resident?.name || "resident"
          } — ${result.record?.status || ""}`
        );
      }

      lastSuccessRef.current = { tokenCode, at: Date.now() };

      if (onCheckedIn) {
        onCheckedIn(result.record);
      }
    } catch (err) {
      if (isMountedRef.current) {
        setError(
          err.response?.data?.message ||
            "Could not check in this token"
        );
      }
    } finally {
      /*
       * Prevent the same QR code from being processed repeatedly.
       */
      setTimeout(() => {
        isProcessingRef.current = false;
      }, 1500);
    }
  };

  /*
   * Start camera scanner.
   */
  const startScanning = async () => {
    const scanner = scannerRef.current;

    if (!scanner) {
      setError("Scanner is not available.");
      return;
    }

    if (isStartingRef.current || scanner.isScanning) {
      return;
    }

    isStartingRef.current = true;

    if (isMountedRef.current) {
      setStarting(true);
      setError("");
      setMessage("");
    }

    try {
      await scanner.start(
        { facingMode: "environment" },
        {
          fps: 10,
          qrbox: 250,
        },
        (decodedText) => {
          handleDecodedText(decodedText);
        },
        () => {
          /*
           * QR decode failures happen normally while the camera
           * is searching. Ignore them.
           */
        }
      );

      if (isMountedRef.current) {
        setIsRunning(true);
      } else {
        /*
         * Component was unmounted while start() was running.
         * Safely stop the scanner if it actually started.
         */
        if (scanner.isScanning) {
          try {
            await scanner.stop();
          } catch (err) {
            // Ignore cleanup error.
          }
        }
      }
    } catch (err) {
      if (isMountedRef.current) {
        setError(
          "Could not access the camera. Check camera permissions."
        );
      }
    } finally {
      isStartingRef.current = false;

      if (isMountedRef.current) {
        setStarting(false);
      }
    }
  };

  return (
    <div className="card shadow-sm h-100">
      <div className="card-body">
        <h5 className="card-title mb-3">
          Scan Meal QR Token
        </h5>

        {message && (
          <div className="alert alert-success py-2">
            {message}
          </div>
        )}

        {error && (
          <div className="alert alert-danger py-2">
            {error}
          </div>
        )}

        <div
          id={SCANNER_ELEMENT_ID}
          className="mb-3"
          style={{ minHeight: 250 }}
        />

        <div className="d-grid">
          {isRunning ? (
            <button
              type="button"
              className="btn btn-outline-secondary"
              onClick={stopScanning}
            >
              Stop Scanner
            </button>
          ) : (
            <button
              type="button"
              className="btn btn-primary"
              onClick={startScanning}
              disabled={starting}
            >
              {starting ? "Starting..." : "Start Scanner"}
            </button>
          )}
        </div>

        <p className="text-muted small mb-0 mt-2">
          Prevents duplicate check-ins automatically
        </p>
      </div>
    </div>
  );
};

export default QrScanner;
