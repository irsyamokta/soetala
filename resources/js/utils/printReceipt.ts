import qz from "qz-tray";

export async function printReceipt({ buyer_name, items, total_price, type, ticket_details }: any) {
    if (!buyer_name || !items || !total_price) return;

    try {
        if (!qz.websocket.isActive()) {
            await qz.websocket.connect()
                .then(() => console.log("Connected to QZ Tray"))
                .catch(err => console.error("QZ Tray connection error", err));
        }

        const printer = await qz.printers.find("POS58");
        const config = qz.configs.create(printer as any);

        const printData: any[] = [];

        console.log("Printer:", printer);
        console.log("Config:", config);
        console.log("Data:", printData);

        printData.push({ type: "raw", data: "\x1B\x40" });
        printData.push({ type: "raw", data: "\x1B\x61\x01" });

        printData.push({ type: "raw", data: "\x1B!\x30" });
        printData.push({ type: "raw", data: "SOETALA\n\n" });

        printData.push({ type: "raw", data: "\x1B!\x00" });
        printData.push({ type: "raw", data: `${new Date().toLocaleString()}\n` });
        printData.push({ type: "raw", data: "\x1B\x61\x00" });

        printData.push({ type: "raw", data: "\n" });
        printData.push({ type: "raw", data: "Pembeli : " + buyer_name + "\n" });
        printData.push({ type: "raw", data: "----------------------------\n" });

        items.forEach((item: any) => {
            printData.push({
                type: "raw",
                data: `${item.product_name || item.category_name} x${item.quantity} = Rp${item.price * item.quantity}\n`,
            });
        });

        printData.push({ type: "raw", data: "----------------------------\n" });
        printData.push({ type: "raw", data: "Total : Rp" + total_price + "\n" });
        printData.push({ type: "raw", data: "\n" });

        if (type === "ticket" || type === "mixed") {
            ticket_details.forEach((detail: any) => {
                const qrData = detail.qr_code;

                const qrSize = 8;
                const errorCorrection = 49;

                const dataLength = qrData.length;
                const pL = (dataLength + 3) % 256;
                const pH = Math.floor((dataLength + 3) / 256);

                printData.push({ type: "raw", data: "\n" });
                printData.push({ type: "raw", data: "\x1B\x61\x01" });

                printData.push({ type: "raw", data: "\x1D\x28\x6B\x03\x00\x31\x41\x32" });
                printData.push({ type: "raw", data: `\x1D\x28\x6B\x03\x00\x31\x43${String.fromCharCode(qrSize)}` });
                printData.push({ type: "raw", data: `\x1D\x28\x6B\x03\x00\x31\x45${String.fromCharCode(errorCorrection)}` });
                printData.push({
                    type: "raw",
                    data: `\x1D\x28\x6B${String.fromCharCode(pL)}${String.fromCharCode(pH)}\x31\x50\x30${qrData}`,
                });
                printData.push({ type: "raw", data: "\x1D\x28\x6B\x03\x00\x31\x51\x30\n" });

                printData.push({ type: "raw", data: "----------------------------\n" });
            });
        }

        printData.push({ type: "raw", data: "\x1B\x61\x01" });
        printData.push({ type: "raw", data: "Terima kasih telah berkunjung\n\n" });
        printData.push({ type: "raw", data: "\n\n\n" });
        printData.push({ type: "raw", data: "\x1B\x69" });

        await qz.print(config, printData);
    } catch (err) {
        console.error(err);
        throw err;
    }
}
