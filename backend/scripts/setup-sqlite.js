import { DatabaseSync } from 'node:sqlite';
import fs from 'node:fs';
import { createInterface } from 'node:readline';

const db = new DatabaseSync('sqlite-shrunk.sqlite');

// Create Schema
db.exec(`
  CREATE TABLE IF NOT EXISTS invTypes (
    typeID INTEGER PRIMARY KEY,
    typeName TEXT NOT NULL,
    groupID INTEGER NOT NULL,
    published INTEGER NOT NULL
  );

    CREATE INDEX invTypes_name ON invTypes (typeName);
    CREATE INDEX invTypes_typeID ON invTypes (typeID);
`);

db.exec(`
  CREATE TABLE IF NOT EXISTS invGroups (
    groupID INTEGER PRIMARY KEY,
    categoryID INTEGER NOT NULL
  );

    CREATE INDEX invGroups_groupID ON invGroups (groupID);
`);

db.exec(`
  CREATE TABLE IF NOT EXISTS invMetaTypes (
    typeID INTEGER NOT NULL,
    parentTypeID INTEGER,
    metaGroupID INTEGER
  );

    CREATE INDEX invMetaTypes_typeID ON invMetaTypes (typeID);
    CREATE INDEX invMetaTypes_parentTypeID ON invMetaTypes (parentTypeID);
`);

db.exec(`
  CREATE TABLE IF NOT EXISTS dgmTypeAttributes (
    typeID INTEGER NOT NULL,
    attributeID INTEGER NOT NULL,
    valueInt INTEGER,
    valueFloat REAL,
    PRIMARY KEY (typeID, attributeID)
  );

  CREATE INDEX dgmTypeAttributes_typeID ON dgmTypeAttributes (typeID);
`);

db.exec(`
  CREATE TABLE IF NOT EXISTS dgmTypeEffects (
    typeID INTEGER NOT NULL,
    effectID INTEGER NOT NULL,
    PRIMARY KEY (typeID, effectID)
  );

  CREATE INDEX dgmTypeEffects_typeID ON dgmTypeEffects (typeID);
`);

// Populate tables
function ProcessTypes() { 
    const rl = createInterface({
        input: fs.createReadStream('./types.jsonl'),
        crlfDelay: Infinity,
    });

    rl.on('line', (data) => {

        console.log(data);
        if (!data) return;

        const lineData = JSON.parse(data);
        const query =  `INSERT INTO invTypes (typeID, typeName, groupID, published) VALUES (?, ?, ?, ?)`
        const metaQuery = "INSERT OR IGNORE INTO invMetaTypes (typeID, parentTypeID, metaGroupID) VALUES (?, ?, ?)"

        if (!lineData.published || !lineData._key ) return;
        
        

        if (lineData.variationParentTypeID && lineData.metaGroupID) {
            const params = {
                typeId: lineData._key,
                groupId: lineData.metaGroupID,
                parentTypeId: lineData.variationParentTypeID
            }

             ExecuteStatement(metaQuery, params);
        }

        if (lineData.groupID && lineData.name.en) {
              const params = {
                typeId: lineData._key,
                typeName: lineData.name.en,
                groupId: lineData.groupID,
                published: lineData.published ? 1 : 0
            };

            ExecuteStatement(query, params);
        }
    });
}

function ProcessGroups() { 

    const rl = createInterface({
        input: fs.createReadStream('./groups.jsonl'),
        crlfDelay: Infinity,
    });

    rl.on('line', (data) => {
        if (!data) return;

        const jsonData = JSON.parse(data);
        const query =  `INSERT INTO invGroups (groupID, categoryID) VALUES (?, ?)`;
        if (!jsonData._key || !jsonData.categoryID)  return;

        const params = {
            groupId: jsonData._key,
            categoryId: jsonData.categoryID,
        };
        ExecuteStatement(query, params)
    });
}

function ProcessDogma() {
       const rl = createInterface({
        input: fs.createReadStream('./typeDogma.jsonl'),
        crlfDelay: Infinity,
    });

    rl.on('line', (data) => {
        const jsonData = JSON.parse(data);

        const attributeQuery = "INSERT INTO dgmTypeAttributes (typeID, attributeID, valueInt, valueFloat) VALUES (?, ?, ?, ?)"
        const typeEffectQuery = "INSERT INTO dgmTypeEffects (typeID, effectID) VALUES (?, ?)"
    
        const attributes = jsonData['dogmaAttributes']
        const effects = jsonData['dogmaEffects']
        
        effects?.forEach(effect => {
            const filter  = [11, 12, 13, 2663];

            const typeEffectsData = {
                typeId: jsonData._key,
                effectId: effect.effectID
            }

            if (filter.some((val) => val == typeEffectsData.effectId )) {

                if (!typeEffectsData.effectId || typeEffectsData.typeId) return;

                ExecuteStatement(typeEffectQuery, typeEffectsData);
            }
        });

        attributes?.forEach((attribute) => {
            const filter = [
                275,  // skill training multiplier
                633,  // meta level
                984, 985, 986, 987,  // resists
                182, 183, 184, 1285, 1289, 1290,  // skill req
                277, 278, 279, 1286, 1287, 1288,  // skill req level
            ];

            let attributeData = {
                typeId: jsonData._key,
                attributeId: attribute.attributeID,
                valueInt: null,
                valueFloat: null
            }

            if (filter.some((val) => val == attribute.attributeId )) {

                if(Number.isInteger(attribute.value)){
                    attributeData.valueInt = attribute.value;
                } 
                else if(Number.parseFloat(attribute.value)) {
                    attributeData.valueFloat = attribute.value;
                }

                if (!attributeData.typeId || !attributeData.attributeId || (!attributeData.valueFloat && !attributeData.valueInt)) return;
                ExecuteStatement(attributeQuery, attributeData);
            }
        });
    });
}

function ExecuteStatement(query, params) {
    db.prepare(query).all(...Object.values(params));
}

// console.log('Processing Groups');
// ProcessGroups();

console.log('Processing Types');
ProcessTypes();

// console.log('Processing Dogma');
// ProcessDogma();

process.exit(0);
