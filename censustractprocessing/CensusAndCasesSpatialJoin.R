
# This script does a spatial join of the censust tract TRACTCE10 and gEOID fields
# in the census data to the provided lat and lon in the families dataset.
# (Adds census data like the GEOID field to the case points)

# rm(list = ls())
options(digits = 10)
require(sp)
library(geojsonio)
# WGS84
wgs84 <- CRS("+init=epsg:4326 +proj=longlat +datum=WGS84 +no_defs +ellps=WGS84 +towgs84=0,0,0 ")
# read census tracts
census2010 <- geojson_read("./CensusTracts2010_shp/CensusTracts2010/CensusTracts2010.shp",  what = "sp")
# project to wgs84
census2010<-spTransform(census2010, wgs84)
# Process 'All Families' first
anon_d = read.csv(file = "./lineagedata/AllFamiliesAttributesAnon.csv", sep=",", header = TRUE, stringsAsFactors = FALSE)
# process rows with vs without lat and lon values (so not break spatial join)
anon_geo = anon_d[which(anon_d$longitude != 0 | anon_d$latitude != 0),]
anon_na = anon_d[which(is.na(anon_d$longitude) | is.na(anon_d$latitude)),]
# ap = SpatialPoints(anon_geo[c("longitude", "latitude")])
anon_sp = SpatialPointsDataFrame(coords = anon_geo[c("longitude", "latitude")], data = anon_geo, proj4string = wgs84)
# This is the spatial join
aa <- over(anon_sp, census2010)
anon_sp$GEOID10<- aa$GEOID10
anon_na$GEOID10<- NA
anon_sp$TRACTCE10<- aa$TRACTCE10
anon_na$TRACTCE10<- NA
anon_reg <- as.data.frame(anon_sp@data)
# bind records with lat lon, to those without
anon_all_final<- rbind(anon_reg, anon_na)
write.csv(anon_all_final, "AllFamiliesAttrAnon_Tract.csv", row.names = FALSE)

#################################################################################################################
# Now 10 family dataset
anon_10 = read.csv(file = "~/Projects/cartolineage/ut/lineagedata/TenFamiliesAttrAnon.csv"
                   , sep=",", header = TRUE, stringsAsFactors = FALSE)
anon_geo_10 = anon_10[which(anon_10$longitude != 0 | anon_10$latitude != 0),]
anon_na_10 = anon_10[which(is.na(anon_10$longitude) | is.na(anon_10$latitude)),]
# ap = SpatialPoints(anon_geo[c("longitude", "latitude")])
anon_sp_10 = SpatialPointsDataFrame(coords = anon_geo_10[c("longitude", "latitude")], data = anon_geo_10, proj4string = wgs84)

tractdata <- over(anon_sp_10, census2010)

anon_sp_10$GEOID10<- tractdata$GEOID10
anon_na_10$GEOID10 <- NA
anon_sp_10$TRACTCE10<- tractdata$TRACTCE10
anon_na_10$TRACTCE10 <- NA

anon_reg_10 <- as.data.frame(anon_sp_10@data)
anon_10_final<- rbind(anon_reg_10, anon_na_10)

write.csv(anon_10_final, "TenFamiliesAttrAnon_Tract.csv", row.names = FALSE)

