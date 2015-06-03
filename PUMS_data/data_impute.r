## this script impute salesTax, wfr and gasTaxes from income
data <- read.csv("PUMS_less.csv")
summary(data$FINCP)
est.salesTax <- function(income){
	if(is.na(income)) return(NA)
	return(121.59 * (0.001 * income) ^ 0.6919 * (0.001/0.0895))
}
# function of income, Marital status, number of children
est.WFR <- function(income, HHT, NOC){
	 if(is.na(income) || is.na(HHT) || is.na(NOC)){
	 	return(NA)
	 }
	 married <- (HHT == 1)
	 if(NOC == 0){
	 	cr <- 0.0765
	 	mc <- 496
	 	por <- 0.0765
	 	bpoi <- 8110
	 }else if(NOC == 1){
	 	cr <- 0.34
	 	mc <- 3305
	 	por <- 0.1598
	 	bpoi <- 17830
	 }else if(NOC == 2){
	 	cr <- 0.4
	 	mc <- 5460
	 	por <- 0.2106
	 	bpoi <- 17830
	 }else if(NOC > 2){
	 	cr <- 0.45
	 	mc <- 13650
	 	por <- 0.2106
	 	bpoi <- 17830
	 }
	 
	 if(married){
	 	poi <- bpoi + 5430
	 }else{
	 	poi <- bpoi
	 }

	 if(mc > cr * income){
	 	beitc <- cr * income
	 }else{
	 	beitc <- mc
	 }

	 if(income > poi){
	 	poeitc <- beitc - por * (income - poi)
	 }else{
	 	poeitc <- beitc
	 }

	 if(poeitc < 0){
	 	eitc <- 0
 	 }else{
 	 	eitc <- poeitc
 	 }

 	 return(0.25 * eitc)

}
est.Gas <- function(income){
	if(is.na(income)) return(NA)
	if(income < 5000){
		gas <-  1296    
	}else if(income <= 9999){
		gas <- 1106
	}else if(income <= 14999){
		gas <- 1194
	}else if(income <= 19999){
		gas <- 1414
	}else if(income <= 29999){
		gas <- 1793
	}else if(income <= 39999){
		gas <- 2241
	}else if(income <= 49999){
		gas <-  2580
	}else if(income <= 69999){
		gas <- 3016
	}else if(income <= 79999){
		gas <-  3224
	}else if(income <= 99999){
		gas <- 3498
	}else if(income <= 119999){
		gas <- 3968
	}else if(income <= 149999){
		gas <- 4099
	}else{
		gas <- 4239
	}
	# formula on page 7 option 2
	dollar_per_gallon <- 3
	return(gas * 8.91 * 25 / 1000 / dollar_per_gallon)
}
for(i in 1:dim(data)[1]){
	data$salesTaxSavings[i] <- est.salesTax(data$FINCP[i])
	data$wfr[i] <- est.WFR(data$FINCP[i], data$HHT[i], data$NOC[i]) 	
	data$gasTaxes[i] <- est.Gas(data$FINCP[i])
}
data$salesTaxSavings <- round(data$salesTaxSavings, 2)
data$wfr <- round(data$wfr)
data$gasTaxes <- round(data$gasTaxes)
data$positive <- data$salesTaxSavings + data$wfr
write.csv(data, file = "PUMS_less_filled_richard.csv", row.names = FALSE)
