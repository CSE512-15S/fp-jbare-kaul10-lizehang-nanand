library(ggplot2)
library(plyr)
source("packcircle.r")
# load utility data
recs <- read.csv("Utility_data/recs2009_public.csv")
# get interesting variables
# 		state group: REPORTABLE_DOMAIN (27)
#		weight: NWEIGHT
#		gross household income: MONEYPY 
# 		number of people: NHSLDMEM
#		number of bedrooms: BEDROOMS (-2: not applicable)
#		urban or rural: UR
#       unit owned or rent: KOWNRENT 
#       heating degree days: HDD65
#       total electricity: KWH
#		total natural gas: CUFEETNG
#		total LPG/propane: GALLONLP
#       total fuel oil: GALLONFO
#		total kerosene: GALLONKER
#       total wood: BTUWOOD 
vnames.recs <- c("REPORTABLE_DOMAIN", "NWEIGHT", "MONEYPY", "NHSLDMEM", "BEDROOMS", "UR", "KOWNRENT", "HDD65", "KWH", "CUFEETNG", "GALLONLP", "GALLONFO", "GALLONKER", "BTUWOOD", "TOTALBTU")
recs.sub <- recs[, match(vnames.recs, colnames(recs))]
recs.sub <- recs.sub[which(recs.sub$REPORTABLE_DOMAIN == 27), ]
recs.sub$BEDROOMS[which(recs.sub$BEDROOMS == -2)] <- NA
# sum(recs.sub$NWEIGHT)
recs.sub <- data.frame(recs.sub)
## finish cleaning recs data, 466 sample, sum up to weight 113,616,229 population
write.csv(recs.sub, file = "Utility_data/WA-OR-AK-HI.csv", row.names = FALSE)


# levels to use for categorical data
urban.levels <- c("Urban", "Rural")
rent.levels <- c("Owned", "Rent", "Occupied without payment")
income.levels <- c("Less than $2,500", "$2,500 to $4,999", "$5,000 to $7,499",
"$7,500 to $9,999", "$10,000 to $14,999", "$15,000 to $19,999",
"$20,000 to $24,999", "$25,000 to $29,999", "$30,000 to $34,999",
"$35,000 to $39,999","$40,000 to $44,999", "$45,000 to $49,999",
"$50,000 to $54,999", "$55,000 to $59,999", "$60,000 to $64,999",
"$65,000 to $69,999", "$70,000 to $74,999", "$75,000 to $79,999",
"$80,000 to $84,999", "$85,000 to $89,999", "$90,000 to $94,999",
"$95,000 to $99,999", "$100,000 to $119,999", "$120,000 or More")
recs.sub$UR <- mapvalues(recs.sub$UR, from = c("U", "R"), to = urban.levels)
recs.sub$KOWNRENT <- mapvalues(recs.sub$KOWNRENT, from = 1:3, to = rent.levels)
recs.sub$MONEYPY <- mapvalues(recs.sub$MONEYPY, from = 1:24, to = income.levels)
recs.sub$MONEYPY <- factor(recs.sub$MONEYPY, 
							levels = income.levels)

# aggregate by only income, for electricity consumption
# calculate weighted KWH
recs.sub$wKWH <- recs.sub$KWH * recs.sub$NWEIGHT

table.income <- aggregate(wKWH ~ MONEYPY, sum, data = recs.sub)
table.income.norm <- aggregate(NWEIGHT ~ MONEYPY, sum, data = recs.sub)
table.income$wKWH <- table.income$wKWH / table.income.norm$NWEIGHT
table.income <- table.income[match(income.levels, table.income$MONEYPY), ]
boxplot(recs.sub$KWH ~ recs.sub$MONEYPY, las = 2, cex.axis = .5, outline = F, 
		main = "Electricity consumption")
lines(1:24, table.income$wKWH, col = "red", lwd = 3)
points(1:24, table.income$wKWH, col = "red")

# aggregate by only income, for total BTU
# calculate weighted KWH
recs.sub$wTOTALBTU <- recs.sub$TOTALBTU * recs.sub$NWEIGHT

table.income <- aggregate(wTOTALBTU ~ MONEYPY, sum, data = recs.sub)
table.income.norm <- aggregate(NWEIGHT ~ MONEYPY, sum, data = recs.sub)
table.income$wTOTALBTU <- table.income$wTOTALBTU / table.income.norm$NWEIGHT
table.income <- table.income[match(income.levels, table.income$MONEYPY), ]
boxplot(recs.sub$TOTALBTU ~ recs.sub$MONEYPY, las = 2, cex.axis = .5, outline = F, 
		main = "TotalBTU")
lines(1:24, table.income$wTOTALBTU, col = "red", lwd = 3)
points(1:24, table.income$wTOTALBTU, col = "red")



# aggregate into weighted average
recs.table.elec <- aggregate(wKWH ~ MONEYPY + BEDROOMS + UR + KOWNRENT, 
							 sum, data = recs.sub)
recs.table.elec <-cbind(recs.table.elec, 
					    NWEIGHT = aggregate(NWEIGHT ~ MONEYPY + BEDROOMS + UR + KOWNRENT, sum,  data = recs.sub)$NWEIGHT)
recs.table.elec$wKWH <- recs.table.elec$wKWH / recs.table.elec$NWEIGHT
recs.table.elec$income_group_level <- mapvalues(recs.table.elec$MONEYPY, 
										from = income.levels, 
										to = seq(1:length(income.levels)))
recs.table.elec <- recs.table.elec[-which(recs.table.elec$BEDROOMS == 0), ]
recs.table.elec <- recs.table.elec[-which(recs.table.elec$BEDROOMS == 13), ]

# ## test plot
# g <- ggplot(aes(x = BEDROOMS, y = MONEYPY), data = recs.table.elec)
# g <- g + geom_point(aes(color = UR, size = wKWH))
# g

## test output for D3
# get the x axis location
set.seed(1)
cx <- recs.table.elec$wKWH
# squash too large KWH
cx[cx > 3e4] <- rnorm(length(which(cx > 3e4)), mean = 3.2e4, sd = 1e2)
cx <- cx / 3e4 * 800
# pack circles
xrange <- diff(range(cx))
newcoord <- pack.circles(rfix = sqrt((recs.table.elec$NWEIGHT/1e3)), xfix = cx, 
			 max.iter=500, size=c(xrange, 160)) 

cy <- newcoord[, 2] - 80
cx <- newcoord[, 1] + min(cx)
# output file
out <- cbind(cx, cy, recs.table.elec)
write.csv(out, file = "Utility_data/electricity.csv")


# load 