const fs = require("fs");
const path = require("path");
const sharp = require("sharp");
const signale = require("signale");

const inputFolder = "./images";
const outputFolder = "./result";

let totalImages = 0;
let imagesProcessed = 0;
let errors = [];
const startTime = new Date();

// Function to recursively process the folder structure
function convertImagesToWebP(folderPath) {
  fs.readdir(folderPath, (err, files) => {
    if (err) {
      signale.error(`Error reading folder: ${folderPath}`, err);
      return;
    }

    files.forEach((file) => {
      const filePath = path.join(folderPath, file);
      fs.stat(filePath, (err, stats) => {
        if (err) {
          signale.error(`Error retrieving file stats: ${filePath}`, err);
          return;
        }

        if (stats.isDirectory()) {
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
              imagesProcessed++;
              updateProgress();
              if (err) {
                errors.push(
                  `Error converting image to WebP: ${filePath} \n ${err}`
                );
                return;
              }
              if (imagesProcessed === totalImages) {
                console.log();
                const endTime = new Date();
                const elapsedTime = (endTime - startTime) / 1000; // in seconds
                signale.success(
                  `Converted ${totalImages} images to WebP in ${elapsedTime} seconds.`
                );

                if (errors.length > 0) {
                  signale.warn(
                    `There were ${errors.length} errors while converting images to WebP`
                  );
                }
              }
            });
        }
      });
    });
  });
}

// Update the progress line
function updateProgress() {
  /// in the end delete this line
  const progress = Math.floor((imagesProcessed / totalImages) * 100);
  if (progress === 100) {
    process.stdout.clearLine();
    return;
  }
  process.stdout.clearLine();
  process.stdout.cursorTo(0);
  process.stdout.write(`Progress: ${progress}%`);
}

// Start the conversion process
function startConversion() {
  // clear the console

  process.stdout.write("\x1B[2J\x1B[0f");
  signale.start(`Converting images to WebP...`);
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
