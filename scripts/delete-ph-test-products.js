require('dotenv').config();
const { MongoClient } = require('mongodb');

const MONGODB_URI = process.env.MONGODB_URI;

async function deleteTestProducts() {
  const client = new MongoClient(MONGODB_URI);
  
  try {
    await client.connect();
    console.log('✅ Connected to MongoDB\n');
    
    const db = client.db();
    const collection = db.collection('product_hunt_daily');
    
    // Find documents with test products
    const docs = await collection.find({
      'products.projectId': { $in: ['manual_1', 'manual_2'] }
    }).toArray();
    
    console.log(`Found ${docs.length} documents with test products\n`);
    
    if (docs.length === 0) {
      console.log('No test products found');
      return;
    }
    
    // Remove test products from arrays
    const result = await collection.updateMany(
      {},
      {
        $pull: {
          products: {
            projectId: { $in: ['manual_1', 'manual_2'] }
          }
        }
      }
    );
    
    console.log(`✅ Updated ${result.modifiedCount} documents`);
    console.log('✅ Deleted test and test2 products from Product Hunt data');
    
  } catch (error) {
    console.error('Error:', error.message);
  } finally {
    await client.close();
  }
}

deleteTestProducts();
