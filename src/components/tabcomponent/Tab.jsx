import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useCallback, useState, useRef, useEffect } from "react";
import QRCode from "react-qr-code";
import QrScanner from "qr-scanner";

export function Tab() {
  const videoRef = useRef(null);
  const qrScannerRef = useRef(null);

  const [barcode, setBarcode] = useState({
    assets: "",
    name: "",
    macAddress: "",
    branch: "",
    user: "",
  });

  const macRegex =
    /\b([0-9A-Fa-f]{2}[:-]){5}([0-9A-Fa-f]{2})\b|\b([0-9A-Fa-f]{4}\.){2}([0-9A-Fa-f]{4})\b/;

  const [qrData, setQrData] = useState("No result");
  const [error, setError] = useState(null);
  const [qrError, setQrError] = useState(null);
  const [generateBarcode, setGenerateBarcode] = useState("");

  const handleChange = useCallback((e) => {
    const { name, value } = e.target;
    setBarcode((prev) => ({ ...prev, [name]: value }));
  }, []);

  const handleFocused = useCallback(() => {
    setQrError(null);
  }, []);

  const handleDownload = useCallback(() => {
    const svg = document.querySelector("svg");
    const clonedSvg = svg.cloneNode(true);
    clonedSvg.setAttribute("width", "50");
    clonedSvg.setAttribute("height", "50");

    const serializer = new XMLSerializer();
    const source = serializer.serializeToString(clonedSvg);
    const blob = new Blob([source], { type: "image/svg+xml" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "barcode-small.svg";
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  }, []);

  const handlePrint = () => {
    const svg = document.querySelector("svg");
    const clonedSvg = svg.cloneNode(true);
    clonedSvg.setAttribute("width", "50");
    clonedSvg.setAttribute("height", "50");

    const printWindow = window.open("", "_blank");
    printWindow.document.write(
      `<html><head><title>Print Barcode</title></head>
       <body style="text-align: center;">
         ${clonedSvg.outerHTML}
       </body></html>`
    );
    printWindow.document.close();
    printWindow.print();
  };

  const generateBarcodeHandle = useCallback(
    (e) => {
      e.preventDefault();
      if (
        !barcode.assets ||
        !barcode.name ||
        !barcode.macAddress ||
        !barcode.branch ||
        !barcode.user
      ) {
        setQrError("Please fill in all fields.");
        return;
      }

      if (!macRegex.test(barcode.macAddress)) {
        setQrError("Invalid MAC address format.");
        return;
      }

      setGenerateBarcode(
        `${barcode.assets}_${barcode.name}_${barcode.macAddress}_${barcode.branch}_${barcode.user}`
      );
    },
    [barcode]
  );

  const getCamera = async () => {
    const constraints = {
      video: {
        facingMode: "environment",
        width: { ideal: 1280 },
        height: { ideal: 420 },
      },
    };

    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia(
        constraints
      );
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
        videoRef.current.onloadedmetadata = () => {
          videoRef.current.play();
        };
      }
    } catch (err) {
      console.error(err.name + ": " + err.message);
      setError(err.message || "Camera access error");
    }
  };

  const startScanner = async () => {
    try {
      if (videoRef.current) {
        qrScannerRef.current = new QrScanner(
          videoRef.current,
          (result) => {
            console.log("Scanned result:", result.data);
            setQrData(result.data);
          },
          { returnDetailedScanResult: true }
        );
        await qrScannerRef.current.start();
      }
    } catch (err) {
      setError(err.message || "Error starting the scanner");
    }
  };

  useEffect(() => {
    getCamera();
    startScanner();

    return () => {
      if (qrScannerRef.current) {
        qrScannerRef.current.stop();
        qrScannerRef.current.destroy();
      }
    };
  }, []);

  return (
    <Tabs defaultValue="generator" className="w-full max-w-[500px]">
      <TabsList className="grid w-full grid-cols-2">
        <TabsTrigger value="generator">QR Generator</TabsTrigger>
        <TabsTrigger value="scannner" onClick={getCamera}>
          QR Scanner
        </TabsTrigger>
      </TabsList>

      {/* QR Generator */}
      <TabsContent value="generator">
        <Card>
          <CardHeader>
            <CardTitle>Details of Assets</CardTitle>
            <CardDescription>Enter info and click Generate.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-2">
            {["assets", "name", "macAddress", "user"].map((field) => (
              <div key={field} className="space-y-1">
                <Label htmlFor={field}>{field}</Label>
                <Input
                  id={field}
                  name={field}
                  onChange={handleChange}
                  onFocus={handleFocused}
                />
              </div>
            ))}
            <div className="space-y-1">
              <Label htmlFor="branch">Branch</Label>
              <select
                id="branch"
                name="branch"
                onChange={handleChange}
                onFocus={handleFocused}
                className="block w-full px-3 py-2 bg-white border border-gray-300 rounded-md"
              >
                <option value="">Select a branch</option>
                <option value="Head Office">Head Office</option>
                <option value="Diktel">Diktel</option>
                <option value="Halesi">Halesi</option>
                <option value="Baksila">Baksila</option>
                <option value="Aiselukharka">Aiselukharka</option>
                <option value="Simpani">Simpani</option>
                <option value="Chisapani">Chisapani</option>
              </select>
            </div>
            <div className="text-red-600 text-sm">{qrError}</div>
          </CardContent>
          <CardFooter>
            <Button onClick={generateBarcodeHandle}>Generate Barcode</Button>
          </CardFooter>
          {generateBarcode && (
            <CardContent>
              <div className="text-2xl font-bold text-center">Barcode</div>
              <div className="flex flex-col items-center mt-4">
                <QRCode
                  size={50}
                  style={{ height: "auto", maxWidth: "25%", width: "25%" }}
                  value={generateBarcode}
                  viewBox="0 0 50 50"
                />
                <div className="mt-4 flex gap-2">
                  <Button size="sm" variant="outline" onClick={handlePrint}>
                    Print
                  </Button>
                  <Button size="sm" variant="link" onClick={handleDownload}>
                    Download
                  </Button>
                </div>
              </div>
            </CardContent>
          )}
        </Card>
      </TabsContent>

      {/* QR Scanner */}
      <TabsContent value="scannner">
        <Card>
          <CardHeader>
            <CardTitle>Scanner</CardTitle>
            <CardDescription>
              Scan QR to view the asset information.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col items-center gap-4 p-4 w-full">
              <h2 className="text-xl font-bold">QR Code Scanner</h2>
              {error ? (
                <p className="text-red-500">{error}</p>
              ) : (
                <video autoPlay playsInline ref={videoRef} />
              )}
              <p className="text-lg">Scanned Data: {qrData}</p>
            </div>
          </CardContent>
        </Card>
      </TabsContent>
    </Tabs>
  );
}
