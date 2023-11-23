const path = require("path");
const PdfPrinter = require("pdfmake");

const generatePdf = async (data, password, accountNumber) => {
  const header = Object.keys(data);
  const body = data.map((item) => {
    let child = [];
    header.forEach((head) => child.push(item[head]));
    return child;
  });

  const fonts = {
    Roboto: {
      normal: path.join(__dirname, "../assets/fonts/DejaVuSans.ttf"),
      bold: path.join(__dirname, "../assets/fonts/DejaVuSans-Bold.ttf"),
      italics: path.join(__dirname, "../assets/fonts/DejaVuSans.ttf"),
      bolditalics: path.join(__dirname, "../assets/fonts/DejaVuSans.ttf"),
    },
  };

  const pdfPrinter = new PdfPrinter(fonts);

  const documentDefinition = {
    content: [
      { text: "Statement", style: "header" },
      { text: "\n" },
      {
        table: {
          headerRows: 1,
          widths: ["auto", "auto", "auto"],
          body: [
            header,
            ...body,
            //...data.map((item) => [item.name, item.age, item.city]),
          ],
        },
      },
    ],
    styles: {
      header: {
        fontSize: 18,
        bold: true,
        alignment: "center",
        margin: [0, 0, 0, 10],
      },
    },
    ownerPassword: password,
  };

  const outputPath = path.join(__dirname, "statements", `${accountNumber}.pdf`);

  const pdf = pdfPrinter.createPdfKitDocument(documentDefinition);

  pdf.pipe(fs.createWriteStream(outputPath));
  pdf.end();

  return outputPath;
};

module.exports = generatePdf;

const data = [
  { name: "John Doe", age: 30, city: "New York" },
  { name: "Jane Smith", age: 25, city: "San Francisco" },
  // Add more objects as needed
];
