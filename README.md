# periodicjs.ext.backup

Backup your current instance of periodic to a zip archieve containing your configurations, content, themes, and database.

 [API Documentation](https://github.com/typesettin/periodicjs.ext.backup/blob/master/doc/api.md)

## Installation

```
$ npm install periodicjs.ext.backup
```

## Usage

### import database (upsert/update) with custom file backup from cli

```
$ node index.js --cli --extension backup --task backup [--filename optionalbackupzipname --outputpath optionaloutputdirectory]
```

### export database to backup file backup from cli

```
$ node index.js --cli --extension backup --task export --file /path/to/file.json
```

If no file path is specified, the default file path is `content/files/backups/backups/backup-[year]-[month]-[day]-[timestamp].json`

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
* example backup: clear && node index.js --cli --extension backup --task backup --filename mybackup --outputpath ~/Downloads/myperiodicbackup