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
import { useCallback, useEffect, useState } from "react";
import Barcode from "react-barcode";

export function Tab() {
  const [barcode, setBarcode] = useState({
    name: "",
    macAddress: "",
  });

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
    const serializer = new XMLSerializer();
    const source = serializer.serializeToString(svg);
    const blob = new Blob([source], { type: "image/svg+xml" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "barcode.svg";
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  }, []);

  const generateBarcodeHandle = useCallback(
    (e) => {
      e.preventDefault();

      setGenerateBarcode(`${barcode.name}-${barcode.macAddress}`);
    },
    [barcode]
  );

  const handlePrint = () => {
    const svg = document.querySelector("svg");
    const printWindow = window.open("", "_blank");
    printWindow.document.write(
      "<html><head><title>Print Barcode</title></head><body>"
    );
    printWindow.document.write(svg.outerHTML);
    printWindow.document.write("</body></html>");
    printWindow.document.close();
    printWindow.print();
  };

  return (
    <Tabs defaultValue="generator" className="w-[500px]">
      <TabsList className="grid w-full grid-cols-2">
        <TabsTrigger value="generator">Barcode Generator</TabsTrigger>
        <TabsTrigger value="scannner">Barcode Scanner</TabsTrigger>
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
          </CardContent>
          <CardFooter>
            <Button onClick={generateBarcodeHandle}>Generate Barcode</Button>
          </CardFooter>
          <CardContent>
            {generateBarcode && (
              <>
                <div className="text-2xl font-bold  text-center">Barcode</div>
                <div className="flex justify-between items-center flex-col mt-5">
                  <div className="flex justify-start">
                    <Barcode value={generateBarcode} format="CODE128" />,
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
          <CardContent className="space-y-2">hellow</CardContent>
        </Card>
      </TabsContent>
    </Tabs>
  );
}
