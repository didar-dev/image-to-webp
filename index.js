const fs = require("fs");
const path = require("path");
const sharp = require("sharp");

const inputFolder = "./images";
const outputFolder = "./result";

let totalImages = 0;
let imagesProcessed = 0;
const startTime = new Date();

// Function to recursively process the folder structure
function convertImagesToWebP(folderPath) {
  fs.readdir(folderPath, (err, files) => {
    if (err) {
      console.error(`Error reading folder: ${folderPath}`, err);
      return;
    }

    files.forEach((file) => {
      const filePath = path.join(folderPath, file);
      fs.stat(filePath, (err, stats) => {
        if (err) {
          console.error(`Error retrieving file stats: ${filePath}`, err);
          return;
        }

        if (stats.isDirectory()) {
          // If it's a directory, recursively process it
          const outputSubfolder = path.join(
            outputFolder,
            path.relative(inputFolder, folderPath),
            file
          );
          fs.mkdirSync(outputSubfolder, { recursive: true });
          convertImagesToWebP(filePath);
        } else if (stats.isFile()) {
          // If it's a file, convert it to WebP
          const outputFilePath = path.join(
            outputFolder,
            path.relative(inputFolder, folderPath),
            file.replace(/\.[^/.]+$/, "") + ".webp"
          );
          sharp(filePath)
            .webp()
            .toFile(outputFilePath, (err, info) => {
              if (err) {
                console.error(
                  `Error converting image to WebP: ${filePath}`,
                  err
                );
                return;
              }
              imagesProcessed++;
              console.log(`Converted image: ${imagesProcessed}`);
              if (imagesProcessed === totalImages) {
                const endTime = new Date();
                const elapsedTime = (endTime - startTime) / 1000; // in seconds
                console.log(`\nConversion completed successfully!`);
                console.log(`Total Images Processed: ${totalImages}`);
                console.log(`Time Taken: ${elapsedTime.toFixed(2)} seconds`);
              }
            });
        }
      });
    });
  });
}

// Start the conversion process
function startConversion() {
  convertImagesToWebP(inputFolder);
}

// Count the total number of images to be processed
function countImages(folderPath) {
  fs.readdir(folderPath, (err, files) => {
    if (err) {
      console.error(`Error reading folder: ${folderPath}`, err);
      return;
    }

    files.forEach((file) => {
      const filePath = path.join(folderPath, file);
      fs.stat(filePath, (err, stats) => {
        if (err) {
          console.error(`Error retrieving file stats: ${filePath}`, err);
          return;
        }

        if (stats.isDirectory()) {
          countImages(filePath);
        } else if (stats.isFile()) {
          totalImages++;
        }
      });
    });
  });
}

// Count the total number of images before starting the conversion
countImages(inputFolder);
startConversion();
