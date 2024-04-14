require('dotenv').config();
const Sequelize = require('sequelize');
const setData = require("../data/setData");
const themeData = require("../data/themeData");

// PostgreSQL database credentials
const PGHOST = 'ep-white-cell-a5h9jm2f-pooler.us-east-2.aws.neon.tech';
const PGDATABASE = 'senecadb';
const PGUSER = 'senecadb_owner';
const PGPASSWORD = '2Ezaqpkfx1XV';


// Define Sequelize instance
let sequelize = new Sequelize(PGDATABASE, PGUSER, PGPASSWORD, {
  host: PGHOST,
  dialect: 'postgres',
  dialectOptions: {
    ssl: {
      require: true,
      rejectUnauthorized: false // This line can be removed if your PostgreSQL server has a valid SSL certificate
    }
  },
  define: {
    timestamps: false // Disable createdAt and updatedAt fields
  }
});


// Define Theme model
const Theme = sequelize.define('Theme', {
  id: { type: Sequelize.INTEGER, primaryKey: true, autoIncrement: true },
  name: Sequelize.STRING
});

// Define Set model
const Set = sequelize.define('Set', {
  set_num: { type: Sequelize.STRING, primaryKey: true },
  name: Sequelize.STRING,
  year: Sequelize.INTEGER,
  num_parts: Sequelize.INTEGER,
  theme_id: Sequelize.INTEGER,
  img_url: Sequelize.STRING
});

// Define association
Set.belongsTo(Theme, { foreignKey: 'theme_id' });

// Function to initialize database and insert existing data
async function initialize() {
  try {
    await sequelize.authenticate();
    console.log('Connection has been established successfully.');

    // Synchronize models with database and insert existing data
    await sequelize.sync().then(async () => {
      try {
        await Theme.bulkCreate(themeData);
        await Set.bulkCreate(setData);
        console.log("Data inserted successfully.");
      } catch (error) {
        console.error('Error inserting data:', error.message);
      }
    });

  } catch (error) {
    console.error('Unable to connect to the database:', error);
  }
}

// Function to get all sets
async function getAllSets() {
  try {
    const allSets = await Set.findAll();
    return allSets;
  } catch (error) {
    throw new Error('Error fetching sets: ' + error.message);
  }
}

// Function to get set by set number
async function getSetByNum(setNum) {
  try {
    const set = await Set.findOne({ where: { set_num: setNum } });
    if (set) {
      return set;
    } else {
      throw new Error('Set not found');
    }
  } catch (error) {
    throw new Error('Error fetching set: ' + error.message);
  }
}

// Function to get sets by theme
async function getSetsByTheme(theme) {
  try {
    const sets = await Set.findAll({
      where: {
        theme: {
          [Sequelize.Op.iLike]: `%${theme}%` // Case-insensitive search
        }
      }
    });
    if (sets.length > 0) {
      return sets;
    } else {
      throw new Error('No sets found for the theme');
    }
  } catch (error) {
    throw new Error('Error fetching sets: ' + error.message);
  }
}

// Initialize and export functions
initialize();

module.exports = { initialize, getAllSets, getSetByNum, getSetsByTheme };
