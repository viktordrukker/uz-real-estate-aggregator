#!/usr/bin/env node

import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';
// Removed Blob import, rely on Buffer from fs.readFile

// --- Configuration ---
const STRAPI_URL = 'http://localhost:1337';
const STRAPI_API_TOKEN = '4ae17b951a230d1e0e7f1ac023a2191c4f173f5d4d7d1df3c01e2ae8abd1535909c3336804b369f76f0760c410d8f2aa6015472b9bca35f4bee7fc83a735aff5c87504406185ca0c630600581c09320f7f5cd3b0ac8f76d28175148e138412357e4e6deb70df2d25769b5a7fe9063eaef7605b3a7e782bf3497f115970cb3f21';
const JSON_HEADERS = {
  'Authorization': `Bearer ${STRAPI_API_TOKEN}`,
  'Content-Type': 'application/json',
};
const FORM_HEADERS = {
  'Authorization': `Bearer ${STRAPI_API_TOKEN}`,
};
const WAIT_TIME_SECONDS = 60;

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const DATA_DIR = path.join(__dirname, '../data/seed');
const MOCK_IMAGE_DIR = path.join(__dirname, '../public/mock-images');

// --- Helper Functions ---

async function makeApiCall(endpoint, method = 'GET', body = null) {
  const url = `${STRAPI_URL}/api${endpoint}`;
  const isFormData = body instanceof FormData;
  const headers = isFormData ? FORM_HEADERS : JSON_HEADERS;
  const options = {
    method,
    headers: headers,
    body: isFormData ? body : (body ? JSON.stringify(body) : null),
  };
  // console.log(`[API Call] ${method} ${url} with body type: ${isFormData ? 'FormData' : (body ? 'JSON' : 'None')}`); // Debug log

  try {
    const response = await fetch(url, options);
    if (!response.ok) {
      const errorBody = await response.text();
      console.error(`\n[API Error] (${response.status} ${response.statusText}) on ${method} ${endpoint}:`);
      console.error(`Response Body: ${errorBody}`);
      throw new Error(`API call failed: ${response.statusText}`);
    }
    if (response.status === 204 || response.headers.get('content-length') === '0') {
        return null;
    }
    const responseData = await response.json();
    // console.log(`[API Success] ${method} ${endpoint} Response:`, JSON.stringify(responseData).substring(0, 100) + '...'); // Debug log success
    return responseData;
  } catch (error) {
    console.error(`\n[Fetch Error] Failed to fetch ${url}: ${error.message}`);
    if (error.cause && error.cause.code === 'ECONNREFUSED') {
        console.error('Hint: Is the Strapi server running at', STRAPI_URL, '?');
    }
    throw error;
  }
}

async function loadJsonData(filename) {
  const filePath = path.join(DATA_DIR, filename);
  try {
    const data = await fs.readFile(filePath, 'utf-8');
    return JSON.parse(data);
  } catch (error) {
    console.error(`Error reading or parsing ${filePath}: ${error.message}`);
    throw error;
  }
}

// Updated clearContentType function with sequential deletion
async function clearContentType(apiPath) {
    console.log(`Clearing ${apiPath}...`);
    let deletedCount = 0;
    let failedCount = 0;
    try {
        const response = await makeApiCall(apiPath + '?pagination[limit]=-1&fields[0]=id'); // Fetch all IDs
        if (response && response.data && response.data.length > 0) {
            console.log(` Found ${response.data.length} entries to delete...`);
            // Delete sequentially
            for (const item of response.data) {
                try {
                    await makeApiCall(`${apiPath}/${item.id}`, 'DELETE');
                    process.stdout.write('.'); // Progress indicator
                    deletedCount++;
                } catch (deleteError) {
                    console.error(`\nError deleting item ${item.id} from ${apiPath}: ${deleteError.message}`);
                    failedCount++;
                    // Continue trying to delete others
                }
                 await new Promise(resolve => setTimeout(resolve, 50)); // Small delay between deletes
            }
            console.log(`\nFinished clearing ${apiPath}. Deleted: ${deletedCount}, Failed: ${failedCount}.`);
        } else {
            console.log(`No entries found in ${apiPath} to clear.`);
        }
    } catch (error) {
        console.error(`\nError fetching IDs for clearing ${apiPath}: ${error.message}`);
        // Don't re-throw, allow seeding to attempt anyway if fetching IDs failed
    }
}


async function uploadImage(filePath) {
    console.log(` Attempting to upload: ${filePath}`);
    try {
        const fileBuffer = await fs.readFile(filePath);
        const fileName = path.basename(filePath);

        const formData = new FormData();
        // Append buffer directly, providing filename
        formData.append('files', new Blob([fileBuffer]), fileName);

        console.log(` Sending upload request for ${fileName}...`);
        const response = await makeApiCall('/upload', 'POST', formData);

        if (response && Array.isArray(response) && response.length > 0 && response[0].id) {
            console.log(` -> Uploaded ${fileName} (ID: ${response[0].id})`);
            return response[0].id;
        } else {
            console.warn(`\nWarning: Upload response for ${fileName} was unexpected:`, response);
            return null;
        }
    } catch (error) {
        console.error(`\n[Upload Error] Failed for ${filePath}: ${error.message}`);
        return null;
    }
}

// --- Seeding Functions ---

async function seedSimpleContentType(name, apiPath, dataFile) {
  console.log(`Seeding ${name}...`);
  const items = await loadJsonData(dataFile);
  const created = [];
  for (const item of items) {
    try {
      // console.log(` Creating ${name}: ${item.name}`); // More verbose log
      const result = await makeApiCall(apiPath, 'POST', { data: item });
      created.push(result.data);
      process.stdout.write('+');
    } catch (error) {
        // Error already logged in makeApiCall
    }
  }
  console.log(`\nSeeded ${created.length} ${name}.`);
  return created;
}

function generateRandomPropertyData(index, categories, locations, amenities) {
    const listingTypes = ['Buy', 'Rent'];
    const statuses = ['Available', 'Sold', 'Rented'];
    const titles = ['Luxury Villa', 'Modern Apartment', 'Cozy Studio', 'Spacious House', 'Downtown Loft', 'Suburban Home', 'Riverside Condo', 'Penthouse Suite', 'Historic Building', 'Commercial Space'];
    const descriptions = [
        'Stunning property with amazing views.', 'Recently renovated, close to amenities.',
        'Perfect for families or professionals.', 'Great investment opportunity.',
        'Quiet neighborhood, excellent condition.', 'Includes modern appliances and finishes.',
        'Bright and airy living spaces.',
    ];

    const randomCategory = categories[Math.floor(Math.random() * categories.length)];
    const randomLocation = locations[Math.floor(Math.random() * locations.length)];
    const numAmenities = Math.floor(Math.random() * (amenities.length + 1));
    const randomAmenities = [...amenities].sort(() => 0.5 - Math.random()).slice(0, numAmenities);

    return {
        title: `${titles[Math.floor(Math.random() * titles.length)]} #${index + 1} in ${randomLocation.name}`,
        description: descriptions[Math.floor(Math.random() * descriptions.length)],
        price: Math.floor(Math.random() * 950000) + 50000,
        area: Math.floor(Math.random() * 450) + 50,
        rooms: Math.floor(Math.random() * 5) + 1,
        floor: Math.floor(Math.random() * 20) + 1,
        address: `${Math.floor(Math.random() * 100) + 1} Example St, ${randomLocation.name}`,
        listingType: listingTypes[Math.floor(Math.random() * listingTypes.length)],
        listingStatus: statuses[Math.floor(Math.random() * statuses.length)],
        coordinates: {
            latitude: 41.2995 + (Math.random() - 0.5) * 0.2,
            longitude: 69.2401 + (Math.random() - 0.5) * 0.2,
        },
        category: randomCategory.id,
        location: randomLocation.id,
        amenities: randomAmenities.map(a => a.id),
    };
}


async function seedPropertiesWithGeneratedData(count, categories, locations, amenities) {
    console.log(`Generating and seeding ${count} properties...`);

    let availableImageFolders = [];
    try {
        const entries = await fs.readdir(MOCK_IMAGE_DIR, { withFileTypes: true });
        availableImageFolders = entries
            .filter(dirent => dirent.isDirectory() && dirent.name.startsWith('property_'))
            .map(dirent => dirent.name);
        console.log(` Found ${availableImageFolders.length} image folders to reuse.`);
    } catch (error) {
        console.warn(`\nWarning: Could not list image directories in ${MOCK_IMAGE_DIR}: ${error.message}`);
    }

    if (availableImageFolders.length === 0) {
        console.warn("\nWarning: No 'property_X' image folders found. Properties will be created without images.");
    }

    let createdCount = 0;
    for (let i = 0; i < count; i++) {
        console.log(`\nProcessing property ${i + 1}/${count}...`);
        const propData = generateRandomPropertyData(i, categories, locations, amenities);
        let uploadedImageIds = [];

        try {
            if (availableImageFolders.length > 0) {
                const randomFolder = availableImageFolders[Math.floor(Math.random() * availableImageFolders.length)];
                const imageFolderPath = path.join(MOCK_IMAGE_DIR, randomFolder);
                console.log(` Using images from ${randomFolder}`);
                try {
                    const imageFiles = await fs.readdir(imageFolderPath);
                    const imageFilePaths = imageFiles
                        .filter(f => /\.(jpg|jpeg|png|gif)$/i.test(f))
                        .map(fileName => path.join(imageFolderPath, fileName));

                    // Upload images sequentially to avoid overwhelming the server
                    for (const filePath of imageFilePaths) {
                        const imageId = await uploadImage(filePath);
                        if (imageId) {
                            uploadedImageIds.push(imageId);
                        }
                        await new Promise(resolve => setTimeout(resolve, 100)); // Small delay between uploads
                    }
                } catch (dirError) {
                     console.warn(` Warning: Could not read image directory ${imageFolderPath}: ${dirError.message}`);
                }
            }

            const payload = { ...propData, images: uploadedImageIds };
            console.log(` Creating property: ${payload.title} with ${uploadedImageIds.length} images...`);
            await makeApiCall('/properties', 'POST', { data: payload });
            createdCount++;
            process.stdout.write('*');
        } catch (error) {
             // Error already logged in makeApiCall
             console.error(` -> Failed to create property "${propData.title}"`);
        }
         await new Promise(resolve => setTimeout(resolve, 200)); // Delay between creating properties
    }
    console.log(`\nSeeded ${createdCount} properties.`);
}


// --- Main Execution ---

async function main() {
  console.log('Starting Strapi seed process...');

  try {
    console.warn(`Clearing existing data in ${WAIT_TIME_SECONDS} seconds... Press Ctrl+C to cancel.`);
    await new Promise(resolve => setTimeout(resolve, WAIT_TIME_SECONDS * 1000));

    await clearContentType('/properties');
    await clearContentType('/amenities');
    await clearContentType('/locations');
    await clearContentType('/categories');
    try {
        const testCat = await makeApiCall('/categories?filters[name][$eq]=APITestCategory&fields[0]=id');
        if (testCat && testCat.data && testCat.data.length > 0) {
            await makeApiCall(`/categories/${testCat.data[0].id}`, 'DELETE');
            console.log("Cleared test category 'APITestCategory'.");
        }
    } catch (e) { /* Ignore */ }
    console.log("--------------------");

    const categories = await seedSimpleContentType('categories', '/categories', 'categories.json');
    const locations = await seedSimpleContentType('locations', '/locations', 'locations.json');
    const amenities = await seedSimpleContentType('amenities', '/amenities', 'amenities.json');

    if (categories.length === 0 || locations.length === 0 || amenities.length === 0) {
        console.error("\nError: Cannot seed properties because base data failed to seed.");
        process.exit(1);
    }

    await seedPropertiesWithGeneratedData(40, categories, locations, amenities);

    console.log('\nSeed process completed successfully!');

  } catch (error) {
    console.error('\nSeed process failed overall:', error.message);
    process.exit(1);
  }
}

main();
