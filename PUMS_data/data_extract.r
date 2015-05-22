data <- read.csv("ss13hwa.csv")
# FINCP   : household income (bbbbbbbb: NA, negative means household loss)  
# NOC     : 
# HHT     : family type (b: NA, 1: Married couple, 2: Male no wife, 3: Female no husband, 4: male living alone, 
#			 5: Male not living alone, 6: female living alone, 7: female not living alone)
# PUMA10  : location
# WGTP    : housing weight 
# NP      : number of person records in household 
# BDSP    : number od bedrooms (bb:NA)
# ELEP    : monthly electricity cost (bbb: NA, 001: included in rent, 002: no charge)
# FULP    : yearly fuel cost (bbbb: NA, 0001: included in rent, 0002: no charge)
# GASP    : monthly gas cost (bbb: NA, 001: in rent, 002: in electricity cost, 003: no charge)
# TEN     : tenure (b: NA, 1: owned with mortgage, 2: owned free, 3: rent, 4: occupied without payment)
# VEH     : number of vehicles (b: NA)
 
var <- c("FINCP", "NOC", "HHT", "PUMA10", "WGTP", "NP", "BDSP", "ELEP", "FULP", "GASP", "TEN", "VEH")
index <- match(var, colnames(data))
data.sub <- data[, index]
write.csv(data.sub, file = "PUMS_less.csv", row.names = FALSE)

