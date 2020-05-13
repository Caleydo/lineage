# Geo-Lineage Data Preprocessing

 `CensusTractPreProcessing.R` and `CensusAndCasesSpatialJoin.R` scripts prepare census tract data for
  the map component of the Lineage visualization. 
  
  The Census Tract data itself is publicly available for download at: 
  
  https://gis.utah.gov/data/demographic/census/
  
  The scripts expect data in shapefile format.
  
  ## `CensusTractPreProcessing.R`
  This script takes the census tract shapefile, and generates topojson for the app.
  The latitude and longitude fields are checked for NA/null values. Note that the layer name provided is referenced
  within tablemanager.ts as well so it must be consistent. 
  
  ## `CensusAndCasesSpatialJoin.R`
  This script is more involved. It assigns the unique census tract ID ('GEOID10') to each of the cases according to the 
  latitude and longitude (spatial join). Note that this is not possible or necessary if the cases already have some sort
  of identifier linking back to the census tracts instead of lat and lon fields. 

### Instructions 
* Download and extract the census tract dataset
* Make any necessary changes to the argument paths and field/attribute names
* Run both scripts
    * These can be run in any order as they are not dependent on one-another
    * The location of this directory is just for ease of organization, the data will eventually reside in ../lineage_server/data
* Prepare the data using the phovea json generator
    * https://github.com/Caleydo/phovea_json_generator
    * All external data is preprocessed using this notebook and served within the index.json file
    
