# Geo-Lineage Data Preprocessing

 `CensusTractPreProcessing.R` and `CensusAndCasesSpatialJoin.R` scripts prepare census tract data for
  the map component of the Lineage visualization. 
  
  The Census Tract data itself is publicly available for download at: 
  
  https://gis.utah.gov/data/demographic/census/
  
  The scripts expect data in shapefile format.
  
  ## `CensusTractPreProcessing.R`
  This script takes the census tract shapefile, and generates topojson for the app
  The latitude and longitude fields are checked for NA/null values. 
  
  ## `CensusAndCasesSpatialJoin.R`
  This script is more involved. It assigned the unique census tract ID (GEOID10) to each of the cases according to their 
  provided latitude and longitude. This is a spatial join. 
