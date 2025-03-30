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
  const [barcode, setBarcode] = useState({
    name: "",
    macAddress: "",
    branch: "",
    user: "",
  });

  const [qrData, setQrData] = useState("No result");
  const [error, setError] = useState(null);
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

      setGenerateBarcode(
        `${barcode.name}_${barcode.macAddress}_${barcode.branch}_${barcode.user}`
      );
    },
    [barcode]
  );

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

  useEffect(() => {
    const requestCameraAccess = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: true,
        });
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
        }
        const scanner = new QrScanner(
          videoRef.current,
          (result) => setQrData(result.data),
          {
            onDecodeError: (err) => console.log(err),
          }
        );
        scanner.start();
        return () => scanner.stop();
      } catch (err) {
        setError("Camera access denied or unavailable");
        console.error("Camera Error:", err);
      }
    };

    requestCameraAccess();
  }, []);
  return (
    <Tabs
      defaultValue="generator"
      className="w-full max-w-[500px] sm:w-[400px] md:w-[450px] lg:w-[500px]"
    >
      <TabsList className="grid w-full grid-cols-2">
        <TabsTrigger value="generator">QR Generator</TabsTrigger>
        <TabsTrigger value="scannner">QR Scanner</TabsTrigger>
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
              <Label htmlFor="name">Product Name</Label>
              <Input id="name" name="name" onChange={handleChange} />
            </div>
            <div className="space-y-1">
              <Label htmlFor="username">Mac Address</Label>
              <Input id="username" name="macAddress" onChange={handleChange} />
            </div>
            <div className="space-y-1">
              <Label htmlFor="branch">Branch</Label>
              <Input id="branch" name="branch" onChange={handleChange} />
            </div>
            <div className="space-y-1">
              <Label htmlFor="own">Own By</Label>
              <Input id="own" name="user" onChange={handleChange} />
            </div>
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
            <div className="flex flex-col items-center gap-4 p-4">
              <h2 className="text-xl font-bold">QR Code Scanner</h2>
              {error ? (
                <p className="text-red-500">{error}</p>
              ) : (
                <video
                  ref={videoRef}
                  className="w-64 h-64 border rounded-lg shadow-md"
                  autoPlay
                />
              )}
              <p className="text-lg">Scanned Data: {qrData}</p>
            </div>
          </CardContent>
        </Card>
      </TabsContent>
    </Tabs>
  );
}
