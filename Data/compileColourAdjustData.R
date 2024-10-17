# Setup

### Install packages if missing ###
# Package names
packages <- c("jsonlite","dplyr")
# Install packages not yet installed
installed_packages <- packages %in% rownames(installed.packages())
if (any(installed_packages == FALSE)) {
  install.packages(packages[!installed_packages])
}
# Packages loading
invisible(lapply(packages, library, character.only = TRUE))

# set wd - might want to remove
setwd(dirname(rstudioapi::getActiveDocumentContext()$path)) #setwd to file location
# list files
folder <- '/Users/mel29/code/Colour-Adjust Data/osfstorage-archive'
fileNames <- list.files(folder, full.names=T)
# Create list of trials data
trialsList <- vector("list", length=length(fileNames))
names(trialsList) <- gsub(".*/(.*)\\.json", "\\1", fileNames)
# Create long-form of trials data too

for(f in fileNames){ # f<-fileNames[3]
  print(f)
  # Extract all JSON
  rawData <- fromJSON(f)
  # Save to list of trial data for each participant 
  participantTrials <- rawData$trials
  trialsList[[rawData$randomID]] <- participantTrials
  # Or, long form
  participantTrials['randomID'] <- rawData$randomID
  participantTrials['trialN'] <- rownames(participantTrials)
  rownames(participantTrials) <- NULL #reset row names to avoid duplicates
  if(f==fileNames[1]){ # Create dataset of surveys in first loop
    trialsLong <- participantTrials 
  } else {
    # Bind rows without issues caused by row names
    trialsLong <- dplyr::bind_rows(trialsLong, participantTrials)
    #trialsLong <- rbind(trialsLong, participantTrials)
  }
  
  write.csv(trialsLong,'trialsLong.csv')
  
  # create surveys dataset
  survey <- data.frame(randomID = rawData$randomID, rawData$survey) # Put particiapnt survey data into a row
  if(f==fileNames[1]){ # Create dataset of surveys in first loop
    surveys <- survey 
  } else{
    ## Replace any missing vars ##
    # Vars already in dataset but missing from participant data
    missingParticipant <- setdiff(names(surveys), names(survey))
    survey[missingParticipant] <- ''
    # Vars in particpant data but missing so far
    missingMainDataset <- setdiff(names(survey), names(surveys))
    surveys[missingMainDataset] <- ''
    # Put columns in correct order
    survey <- survey[,names(surveys)]
    # Bind to main dataset
    surveys[nrow(surveys)+1,] <- survey
    #surveys <- rbind(surveys, survey)
  }
  write.csv(surveys,'surveys.csv')
}