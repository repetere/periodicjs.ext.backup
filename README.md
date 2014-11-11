# periodicjs.ext.backup

Backup your current instance of periodic to a zip archieve containing your configurations, content, themes, and database.

 [API Documentation](https://github.com/typesettin/periodicjs.ext.backup/blob/master/doc/api.md)

## Installation

```
$ npm install periodicjs.ext.backup
```

## Usage

### export periodic backup (content, themes, config, files & database) to a zip file from the cli

```
$ node index.js --cli --extension backup --task backup [--filename optionalbackupzipname --outputpath optionaloutputdirectory]
```

### restore periodic from a backup zip file backup from the cli

```
$ node index.js --cli --extension backup --task restore --file /path/to/backupzipfile.zip
```

If no file path is specified, the default file path is `content/files/backups/backups/dbemptybackup-[year]-[month]-[day]-[timestamp].zip`

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
