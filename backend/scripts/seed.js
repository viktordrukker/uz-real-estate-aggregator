// scripts/seed.js
const Strapi = require('@strapi/strapi');

async function seedData() {
  // Bootstrap Strapi
  // Note: This requires the script to be run in an environment where Strapi can initialize
  // It might be better to run this via `strapi exec scripts/seed.js` if possible,
  // but for now, we'll try bootstrapping directly.
  const strapi = await Strapi().load();

  console.log('Strapi bootstrapped...');

  const entityService = strapi.entityService;

  try {
    console.log('Deleting existing data...');
    // Optional: Delete existing data first (be careful!)
    // This requires finding existing entries and deleting them one by one or using raw queries
    // For simplicity, we assume a clean DB or manual cleanup for now.
    // Example (use with caution):
    // const properties = await entityService.findMany('api::property.property', { limit: -1 });
    // for (const prop of properties) { await entityService.delete('api::property.property', prop.id); }
    // Repeat for category, location, amenity...

    console.log('Creating Categories...');
    const catApartment = await entityService.create('api::category.category', { data: { name: 'Apartment', publishedAt: new Date() } });
    const catHouse = await entityService.create('api::category.category', { data: { name: 'House', publishedAt: new Date() } });
    const catLand = await entityService.create('api::category.category', { data: { name: 'Land', publishedAt: new Date() } });
    console.log('Categories created:', catApartment.id, catHouse.id, catLand.id);

    console.log('Creating Locations...');
    const locTashkent = await entityService.create('api::location.location', { data: { name: 'Tashkent', publishedAt: new Date() } });
    const locSamarkand = await entityService.create('api::location.location', { data: { name: 'Samarkand', publishedAt: new Date() } });
    const locBukhara = await entityService.create('api::location.location', { data: { name: 'Bukhara', publishedAt: new Date() } });
    console.log('Locations created:', locTashkent.id, locSamarkand.id, locBukhara.id);

    console.log('Creating Amenities...');
    const amParking = await entityService.create('api::amenity.amenity', { data: { name: 'Parking', publishedAt: new Date() } });
    const amBalcony = await entityService.create('api::amenity.amenity', { data: { name: 'Balcony', publishedAt: new Date() } });
    const amFurnished = await entityService.create('api::amenity.amenity', { data: { name: 'Furnished', publishedAt: new Date() } });
    const amPool = await entityService.create('api::amenity.amenity', { data: { name: 'Swimming Pool', publishedAt: new Date() } });
    console.log('Amenities created:', amParking.id, amBalcony.id, amFurnished.id, amPool.id);

    console.log('Creating Properties...');
    await entityService.create('api::property.property', {
      data: {
        title: 'Modern Apartment Downtown Tashkent',
        description: 'A beautiful and modern apartment located in the heart of Tashkent. Close to shops and restaurants.',
        price: 75000,
        area: 80,
        rooms: 3,
        floor: 5,
        address: '123 Amir Temur Avenue, Tashkent',
        listingType: 'Buy',
        status: 'Available',
        coordinates: { latitude: 41.3111, longitude: 69.2797 },
        category: catApartment.id,
        location: locTashkent.id,
        amenities: [amParking.id, amBalcony.id, amFurnished.id],
        publishedAt: new Date(),
      },
    });

    await entityService.create('api::property.property', {
      data: {
        title: 'Charming House near Registan',
        description: 'Lovely traditional house with a courtyard, walking distance to Registan Square.',
        price: 150000,
        area: 120,
        rooms: 4,
        address: '456 Registan St, Samarkand',
        listingType: 'Buy',
        status: 'Available',
        coordinates: { latitude: 39.6548, longitude: 66.9758 },
        category: catHouse.id,
        location: locSamarkand.id,
        amenities: [amParking.id, amFurnished.id],
        publishedAt: new Date(),
      },
    });

     await entityService.create('api::property.property', {
      data: {
        title: 'Studio Apartment for Rent',
        description: 'Compact and affordable studio apartment in a convenient location.',
        price: 300, // Assuming monthly rent
        area: 40,
        rooms: 1,
        floor: 2,
        address: '789 Navoi St, Tashkent',
        listingType: 'Rent',
        status: 'Available',
        coordinates: { latitude: 41.3150, longitude: 69.2650 },
        category: catApartment.id,
        location: locTashkent.id,
        amenities: [amBalcony.id],
        publishedAt: new Date(),
      },
    });

    await entityService.create('api::property.property', {
      data: {
        title: 'Land Plot Outside Bukhara',
        description: 'Large plot of land suitable for building a house or for agricultural use.',
        price: 25000,
        area: 1000, // Area in sqm
        listingType: 'Buy',
        status: 'Available',
        coordinates: { latitude: 39.7747, longitude: 64.4286 }, // Bukhara coords
        category: catLand.id,
        location: locBukhara.id,
        publishedAt: new Date(),
      },
    });

    console.log('Properties created successfully!');

  } catch (error) {
    console.error('Error seeding data:', error);
  } finally {
    // Ensure Strapi instance is destroyed
    await strapi.destroy();
  }
}

seedData();
