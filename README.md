# elasticsearch-export
elasticsearch-export exports elasticsearch datas into JSON files

## Installation

$> npm install -g elasticsearch-export

$> elasticsearch-export

## Launch elasticsearch-export

	$> elasticsearch-export --help
	Usage: node elasticsearch-export.js

	  -i, --index=ARG     index to export (default to all)
	  -t, --type=ARG      type to export
	  -q, --query=ARG     export by a query
	  -e, --elsQuery=ARG  export by a elasticsearch query
	  -o, --output=ARG    name of file where the JSON will be extract
	  -s, --size=ARG      get this number of entities
	  -f, --from=ARG      get entities from this number
	      --jsonELS       get the json with the _source
	  -P, --port=ARG      port to connect to
	  -H, --host=ARG      server to connect to
	  -h, --help          display this help
	  -v, --version       show version



## How to use the elasticsearch-export
    
    $> elasticsearch-export --output export.json --index test --type test

    You can use the --jsonELS option if you want to get only the _source on every
    document on your elasticsearch
  
## Notes

For import data to elasticsearch you can use the elasticsearch-import tool.

More information on : https://github.com/boubaks/elasticsearch-import