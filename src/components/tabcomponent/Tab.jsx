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
  const vedioRef = useRef(null);

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
  const videoRef = useRef(null);
  const [generateBarcode, setGenerateBarcode] = useState("");

  const handleChange = useCallback((e) => {
    const { name, value } = e.target;
    setBarcode((prev) => {
      return {
        ...prev,
        [name]: value,
      };
    });
  }, []);

  const handleDownload = useCallback(() => {
    const svg = document.querySelector("svg");
    const clonedSvg = svg.cloneNode(true);
    clonedSvg.setAttribute("width", "50"); // Smaller download size
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

  const handleFocused = useCallback(() => {
    setQrError(null);
  }, []);
  const handlePrint = () => {
    const svg = document.querySelector("svg");
    const clonedSvg = svg.cloneNode(true);
    clonedSvg.setAttribute("width", "50"); // Set very small width
    clonedSvg.setAttribute("height", "50"); // Set very small height

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
  const getCamera = async () => {
    const constraints = {
      audio: true,
      video: {
        facingMode: "environment",
        width: { ideal: 1280 },
        height: { ideal: 720 },
      },
    };

    navigator.mediaDevices
      .getUserMedia(constraints)
      .then((mediaStream) => {
        if (vedioRef.current) {
          vedioRef.current.srcObject = mediaStream;
          vedioRef.current.onloadedmetadata = () => {
            vedioRef.current.play();
          };
        }
      })
      .catch((err) => {
        // always check for errors at the end.
        console.error(`${err.name}: ${err.message}`);
      });
  };
  useEffect(() => {
    getCamera();
  }, []);
  setTimeout(() => {
    getCamera();
  }, 1000);
  return (
    <Tabs
      defaultValue="generator"
      className="w-full max-w-[500px] sm:w-[400px] md:w-[450px] lg:w-[500px]"
    >
      <TabsList className="grid w-full grid-cols-2">
        <TabsTrigger value="generator">QR Generator</TabsTrigger>
        <TabsTrigger value="scannner" onClick={getCamera}>
          QR Scanner
        </TabsTrigger>
      </TabsList>
      <TabsContent value="generator">
        <Card>
          <CardHeader>
            <CardTitle>Details of Assets</CardTitle>
            <CardDescription>
              Make sure to enter correction information. Click save when you're
              done.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-2">
            <div className="space-y-1">
              <Label htmlFor="assets">Asset's Unique Code</Label>
              <Input
                id="assets"
                name="assets"
                onChange={handleChange}
                onFocus={handleFocused}
              />
            </div>
            <div className="space-y-1">
              <Label htmlFor="name">Brand Name</Label>
              <Input
                id="name"
                name="name"
                onChange={handleChange}
                onFocus={handleFocused}
              />
            </div>
            <div className="space-y-1">
              <Label htmlFor="username">Mac Address</Label>
              <Input
                id="username"
                name="macAddress"
                onChange={handleChange}
                onFocus={handleFocused}
              />
            </div>
            <div className="space-y-1">
              <label
                htmlFor="branch"
                className="block text-sm font-medium text-gray-700"
              >
                Branch
              </label>
              <select
                id="branch"
                name="branch"
                onChange={handleChange}
                onFocus={handleFocused}
                className="block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 text-sm"
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

            <div className="space-y-1">
              <Label htmlFor="own">Own By</Label>
              <Input
                id="own"
                name="user"
                onChange={handleChange}
                onFocus={handleFocused}
              />
            </div>
            <div className="text-red-600 text-sm">{qrError}</div>
          </CardContent>
          <CardFooter>
            <Button onClick={generateBarcodeHandle}>Generate Barcode</Button>
          </CardFooter>
          <CardContent>
            {generateBarcode && (
              <>
                <div className="text-2xl font-bold  text-center">Barcode</div>
                <div className="flex justify-between items-center flex-col mt-5 ">
                  <div className="flex justify-center items-center flex-col mb-5">
                    <QRCode
                      size={50} // Further reduced size
                      style={{
                        height: "auto",
                        maxWidth: "25%", // Reduce display size
                        width: "25%",
                      }}
                      value={generateBarcode}
                      viewBox={`0 0 50 50`} // Match size
                    />
                  </div>
                  <div className="flex justify-end gap-2 align-center">
                    <Button size="sm" variant="outline" onClick={handlePrint}>
                      Print
                    </Button>
                    <Button size="sm" variant="link" onClick={handleDownload}>
                      Download
                    </Button>
                  </div>
                </div>
              </>
            )}
          </CardContent>
        </Card>
      </TabsContent>
      <TabsContent value="scannner">
        <Card>
          <CardHeader>
            <CardTitle>Scanner</CardTitle>
            <CardDescription>
              Please scan with this software to see information about your
              device?
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-2">
            <div className="flex flex-col items-center gap-4 p-4 w-full h-full">
              <h2 className="text-xl font-bold">QR Code Scanner</h2>
              {error ? (
                <p className="text-red-500">{error}</p>
              ) : (
                <div className="relative w-full h-full">
                  <video autoPlay playsInline ref={vedioRef}></video>
                </div>
              )}
              <p className="text-lg">Scanned Data: {qrData}</p>
            </div>
          </CardContent>
        </Card>
      </TabsContent>
    </Tabs>
  );
}
