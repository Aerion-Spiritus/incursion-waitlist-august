#!/bin/bash
set -e

WORKING_DIR=./temporary
SDE_URL=https://developers.eveonline.com/static-data/eve-online-static-data-latest-jsonl.zip


# Clean up files from last time
if [ -d $WORKING_DIR ];
  then rm -rf $WORKING_DIR;
fi


# Download Latest SDE Archive
mkdir $WORKING_DIR
wget -O "$WORKING_DIR/latest.zip" $SDE_URL
cp setup-sqlite.js "$WORKING_DIR"

# Unzip the archive
unzip "$WORKING_DIR/latest.zip" -d "$WORKING_DIR"

# Clean dir of non-relevant files
find "$WORKING_DIR" -maxdepth 1 -type f ! -name "types.jsonl" \
  ! -name "groups.jsonl" ! -name "setup-sqlite.js" ! -name "typeDogma.jsonl" -delete

# Create the SDE sqlite DB
cd $WORKING_DIR
node "./setup-sqlite.js"
cd ..

# Move the SDE sqlite DB to the required directory
mv "$WORKING_DIR/sqlite-shrunk.sqlite" ..

# ... and clean up temp files
rm -rf $WORKING_DIR

echo "SDE Database Completed"