import fs from "fs";
import path from "path";
import { storage } from "../server/storage";

/**
 * Script to import gallery images from client/public/assets into the gallery database
 * Images are organized by category in subdirectories
 */
async function importGalleryAssets() {
  const assetsDir = path.join(process.cwd(), "client", "public", "assets");
  
  if (!fs.existsSync(assetsDir)) {
    console.error(`Assets directory not found: ${assetsDir}`);
    process.exit(1);
  }

  const categories = fs.readdirSync(assetsDir, { withFileTypes: true })
    .filter(dirent => dirent.isDirectory())
    .map(dirent => dirent.name);

  console.log(`Found categories: ${categories.join(", ")}`);

  let importedCount = 0;

  for (const category of categories) {
    const categoryDir = path.join(assetsDir, category);
    const files = fs.readdirSync(categoryDir)
      .filter(file => /\.(jpeg|jpg|png|gif|webp)$/i.test(file));

    console.log(`\nProcessing ${category}: ${files.length} images`);

    for (const file of files) {
      const imagePath = `/assets/${category}/${file}`;
      const title = file.replace(/\.[^/.]+$/, "").replace(/_/g, " ").replace(/IMG-/g, "");
      
      try {
        // Check if item already exists (by title and category)
        const existingItems = await storage.getGalleryItems();
        const exists = existingItems.some(
          item => item.imageUrl === imagePath && item.category === category
        );

        if (exists) {
          console.log(`  ✓ Skipping ${file} (already exists)`);
          continue;
        }

        // Clean up title: remove IMG prefix, replace underscores with spaces, capitalize
        let cleanTitle = file
          .replace(/\.[^/.]+$/, "") // Remove extension
          .replace(/^IMG[-_]?/i, "") // Remove IMG prefix
          .replace(/_/g, " ") // Replace underscores with spaces
          .split(/(?=[A-Z])/) // Split on capital letters
          .join(" ")
          .toLowerCase()
          .split(" ")
          .map(word => word.charAt(0).toUpperCase() + word.slice(1))
          .join(" ");

        // Use category name as title if title is empty or too short
        if (cleanTitle.length < 3) {
          cleanTitle = `${category} Project`;
        } else {
          cleanTitle = `${category} - ${cleanTitle}`;
        }

        await storage.createGalleryItem({
          title: cleanTitle,
          category: category,
          description: null,
          imageUrl: imagePath,
        });

        console.log(`  ✓ Imported: ${file}`);
        importedCount++;
      } catch (error) {
        console.error(`  ✗ Error importing ${file}:`, error);
      }
    }
  }

  console.log(`\n✅ Import complete! Imported ${importedCount} images.`);
}

importGalleryAssets()
  .then(() => {
    console.log("\nDone!");
    process.exit(0);
  })
  .catch((error) => {
    console.error("Error:", error);
    process.exit(1);
  });

