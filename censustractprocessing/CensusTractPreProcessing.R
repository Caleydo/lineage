# Convets .shp file of Census Tracts to .json maintaining attributes
# options(digits = 10)
# require(rgeos)
require(sf)
require(sp)
# require(dplyr)
# library(tmap)
require(geojsonio)

geojsonio::to

# Census 2010 has populations for 2001-2010
census2010 <- geojson_read("/home/jmax/Projects/cartolineage/ut/CensusTracts2010_shp/CensusTracts2010/CensusTracts2010.shp",  what = "sp")
census2010<-spTransform(census2010, CRS("+init=epsg:4326 +proj=longlat +datum=WGS84 +no_defs +ellps=WGS84 +towgs84=0,0,0 "))
# Line below removees tracks with pop of zero
# census2010<- census2010[which(census2010@data$POP100>0),]

# Convert lat lon to numeric
cfact = sapply(census2010@data, is.factor)
census2010@data[cfact] <- lapply(census2010@data[cfact], as.character)
census2010@data$INTPTLAT10<- as.numeric(census2010@data$INTPTLAT10)
census2010@data$INTPTLON10<- as.numeric(census2010@data$INTPTLON10)

# write json (topojson)
# geojsonio::geojson_write(input = census2010, overwrite=TRUE, file="utah_tracts")
geojsonio::topojson_write(input = census2010, overwrite=TRUE, file="utah_tracts_topo.json", object_name='tracts')

# some plots and duplicate checks:
# plot(census2010[which(duplicated(census2010@data$TRACTCE10)),])
# plot(census2010[which(census2010@data$POP100==0),], add=TRUE, col='red')
# anyDuplicated(census2010@data$GEOID10)


