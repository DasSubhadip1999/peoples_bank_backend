const pdfMake = require("pdfmake");
const path = require("path");

const generatePdf = async (data, password, accountNumber) => {
  const documentDefinition = {
    content: [
      { text: "Array of Objects to PDF", style: "header" },
      { text: "\n" },
      {
        table: {
          headerRows: 1,
          widths: ["auto", "auto", "auto"],
          body: [
            ["Name", "Age", "City"],
            ...data.map((item) => [item.name, item.age, item.city]),
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

  const pdf = pdfMake.createPdf(documentDefinition);

  try {
    await pdf.writeAsync(outputPath);
    console.log("PDF created successfully!");
  } catch (err) {
    return err;
  }
};

module.exports = generatePdf;

// Your array of objects
// const data = [
//   { name: "John Doe", age: 30, city: "New York" },
//   { name: "Jane Smith", age: 25, city: "San Francisco" },
//   // Add more objects as needed
// ];
