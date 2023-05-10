wget -qO- https://api.github.com/repos/gefyrahq/gefyra-ext/releases/tags/$1 | grep browser_download_url | grep windows |cut -d '"' -f 4 | wget -i -


# Extract file names from zip archive and convert to JSON format
file_list=$(unzip -l ./gefyra-$1-windows-x86_64.zip | awk 'NR>3 && $1 !~ /-/ && $NF !~ /\/$/ && $NF !~ /^files$/{gsub(/\\/,"\\\\",$NF); gsub(/"/,"\\\"",$NF); gsub(/^dist\//,"/windows/",$NF); print "{\"path\": \"" $NF "\"},"}' | sed '$s/,$//' | tr -d '\n')

# Update metadata.json with the new file list
jq --argjson list "[$file_list]" '.host.binaries[0].windows = $list' metadata.json > metadata.tmp && mv metadata.tmp metadata.json
