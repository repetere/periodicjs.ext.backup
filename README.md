# periodicjs.ext.dbseed

An extension to import/export json seeds into periodic mongodb, the seed format is a mirror of the model definition except objectID reference are placed with the document name, and dbseed looks up those name references and inserts the correct object id.

 [API Documentation](https://github.com/typesettin/periodicjs.ext.dbseed/blob/master/doc/api.md)

## Installation

```
$ npm install periodicjs.ext.dbseed
```

## Usage

### import database (upsert/update) with custom file seed from cli

```
$ node index.js --cli --extension dbseed --task import --file /path/to/file.json
```

### export database to seed file seed from cli

```
$ node index.js --cli --extension dbseed --task export --file /path/to/file.json
```

If no file path is specified, the default file path is `content/files/backups/seeds/dbseed-[year]-[month]-[day]-[timestamp].json`

### import sample from cli

```
$ node index.js --cli --extension dbseed --task sampledata
```

### empty the database (WARNING THIS AWALYS EXPORTS A BACK UP) sample from cli

```
$ node index.js --cli --extension dbseed --task empty --confirm
```
TThe file path is `content/files/backups/dbemptybackup-[year]-[month]-[day]-[timestamp].json`

##Development
*Make sure you have grunt installed*
```
$ npm install -g grunt-cli
```

Then run grunt watch
```
$ grunt watch
```
For generating documentation
```
$ grunt doc
$ jsdoc2md controller/**/*.js index.js install.js uninstall.js > doc/api.md
```
##Notes
* Check out https://github.com/typesettin/periodicjs for the full Periodic Documentation