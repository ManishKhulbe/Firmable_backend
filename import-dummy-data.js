const mongoose = require('mongoose');
require('dotenv').config({ path: './config.env' });

// Import models
const AbnRecord = require('./models/AbnRecord');
const AbnName = require('./models/AbnName');

// Dummy data based on your XML structure
const dummyData = [
  {
    abn: "12345678901",
    status: "Active",
    abnStatusFromDate: "2010-01-01",
    entityTypeCode: "COM",
    entityTypeText: "Australian Private Company",
    organisationName: "Example Pty Ltd",
    gstStatus: "Registered",
    gstFromDate: "2010-01-01",
    state: "NSW",
    postcode: "2000",
    lastUpdated: "2025-08-15",
    names: [
      {
        name: "Example Business Name",
        type: "BusinessName"
      },
      {
        name: "Example Trading Name",
        type: "TradingName"
      }
    ]
  },
  {
    abn: "98765432109",
    status: "Active",
    abnStatusFromDate: "2015-03-15",
    entityTypeCode: "IND",
    entityTypeText: "Individual/Sole Trader",
    legalName: "John Smith",
    gstStatus: "Cancelled",
    state: "VIC",
    postcode: "3000",
    lastUpdated: "2025-08-10",
    names: [
      {
        name: "Smith Consulting",
        type: "TradingName"
      },
      {
        name: "John Smith Consulting Services",
        type: "BusinessName"
      }
    ]
  },
  {
    abn: "11223344556",
    status: "Active",
    abnStatusFromDate: "2018-07-20",
    entityTypeCode: "COM",
    entityTypeText: "Australian Public Company",
    organisationName: "Tech Solutions Ltd",
    acn: "123456789",
    gstStatus: "Registered",
    gstFromDate: "2018-07-20",
    state: "QLD",
    postcode: "4000",
    lastUpdated: "2025-08-12",
    names: [
      {
        name: "Tech Solutions",
        type: "TradingName"
      },
      {
        name: "TS Digital",
        type: "BusinessName"
      },
      {
        name: "Tech Solutions Ltd",
        type: "LegalName"
      }
    ]
  },
  {
    abn: "55667788990",
    status: "Cancelled",
    abnStatusFromDate: "2020-01-10",
    entityTypeCode: "COM",
    entityTypeText: "Australian Private Company",
    organisationName: "Old Company Pty Ltd",
    gstStatus: "Cancelled",
    state: "WA",
    postcode: "6000",
    lastUpdated: "2023-12-31",
    names: [
      {
        name: "Old Company",
        type: "TradingName"
      }
    ]
  },
  {
    abn: "99887766554",
    status: "Active",
    abnStatusFromDate: "2022-05-15",
    entityTypeCode: "IND",
    entityTypeText: "Individual/Sole Trader",
    legalName: "Sarah Johnson",
    gstStatus: "Registered",
    gstFromDate: "2022-05-15",
    state: "SA",
    postcode: "5000",
    lastUpdated: "2025-08-14",
    names: [
      {
        name: "Johnson Design Studio",
        type: "TradingName"
      },
      {
        name: "SJ Creative Services",
        type: "BusinessName"
      }
    ]
  },
  {
    abn: "44332211009",
    status: "Active",
    abnStatusFromDate: "2019-11-30",
    entityTypeCode: "COM",
    entityTypeText: "Australian Private Company",
    organisationName: "Green Energy Co Pty Ltd",
    gstStatus: "Registered",
    gstFromDate: "2019-11-30",
    state: "TAS",
    postcode: "7000",
    lastUpdated: "2025-08-13",
    names: [
      {
        name: "Green Energy Solutions",
        type: "TradingName"
      },
      {
        name: "GEC Renewable",
        type: "BusinessName"
      }
    ]
  },
  {
    abn: "77665544332",
    status: "Active",
    abnStatusFromDate: "2021-09-05",
    entityTypeCode: "IND",
    entityTypeText: "Individual/Sole Trader",
    legalName: "Michael Brown",
    gstStatus: "Cancelled",
    state: "NT",
    postcode: "0800",
    lastUpdated: "2025-08-11",
    names: [
      {
        name: "Brown's Bakery",
        type: "TradingName"
      }
    ]
  },
  {
    abn: "33445566778",
    status: "Active",
    abnStatusFromDate: "2017-04-12",
    entityTypeCode: "COM",
    entityTypeText: "Australian Private Company",
    organisationName: "Digital Marketing Agency Pty Ltd",
    gstStatus: "Registered",
    gstFromDate: "2017-04-12",
    state: "ACT",
    postcode: "2600",
    lastUpdated: "2025-08-09",
    names: [
      {
        name: "DMA Digital",
        type: "TradingName"
      },
      {
        name: "Digital Marketing Pro",
        type: "BusinessName"
      },
      {
        name: "DMA Solutions",
        type: "Other"
      }
    ]
  }
];

async function connectDB() {
  try {
    const conn = await mongoose.connect(process.env.MONGODB_URI, {
      dbName: process.env.DB_NAME || "firmable",
    });
    console.log(`MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error('Database connection error:', error);
    process.exit(1);
  }
}

async function importData() {
  try {
    console.log('Starting data import...');
    
    // Clear existing data
    console.log('Clearing existing data...');
    await AbnRecord.deleteMany({});
    await AbnName.deleteMany({});
    console.log('Existing data cleared.');
    
    // Import ABN records and names
    for (const recordData of dummyData) {
      const { names, ...recordFields } = recordData;
      
      // Create ABN record
      const abnRecord = new AbnRecord(recordFields);
      await abnRecord.save();
      console.log(`Created ABN record: ${recordFields.abn} - ${recordFields.organisationName || recordFields.legalName}`);
      
      // Create associated names
      for (const nameData of names) {
        const abnName = new AbnName({
          abn: recordFields.abn,
          name: nameData.name,
          type: nameData.type
        });
        await abnName.save();
        console.log(`  Created name: ${nameData.name} (${nameData.type})`);
      }
    }
    
    console.log('\n✅ Data import completed successfully!');
    console.log(`📊 Imported ${dummyData.length} ABN records`);
    
    // Count total names
    const totalNames = await AbnName.countDocuments();
    console.log(`📊 Imported ${totalNames} ABN names`);
    
    // Show some statistics
    const stats = await AbnRecord.aggregate([
      {
        $group: {
          _id: null,
          totalRecords: { $sum: 1 },
          activeRecords: {
            $sum: { $cond: [{ $eq: ['$status', 'Active'] }, 1, 0] }
          },
          cancelledRecords: {
            $sum: { $cond: [{ $eq: ['$status', 'Cancelled'] }, 1, 0] }
          },
          gstRegistered: {
            $sum: { $cond: [{ $eq: ['$gstStatus', 'Registered'] }, 1, 0] }
          }
        }
      }
    ]);
    
    if (stats.length > 0) {
      console.log('\n📈 Database Statistics:');
      console.log(`   Total Records: ${stats[0].totalRecords}`);
      console.log(`   Active Records: ${stats[0].activeRecords}`);
      console.log(`   Cancelled Records: ${stats[0].cancelledRecords}`);
      console.log(`   GST Registered: ${stats[0].gstRegistered}`);
    }
    
    const nameTypeStats = await AbnName.aggregate([
      {
        $group: {
          _id: '$type',
          count: { $sum: 1 }
        }
      },
      { $sort: { count: -1 } }
    ]);
    
    console.log('\n📊 Name Types:');
    nameTypeStats.forEach(stat => {
      console.log(`   ${stat._id}: ${stat.count}`);
    });
    
  } catch (error) {
    console.error('Error importing data:', error);
  } finally {
    mongoose.connection.close();
    console.log('\n🔌 Database connection closed.');
  }
}

async function main() {
  await connectDB();
  await importData();
}

main().catch(console.error);
