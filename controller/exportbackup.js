'use strict';
const async = require('async');
const Promisie = require('promisie');
const fs = Promisie.promisifyAll(require('fs-extra'));
const path = require('path');
const archiver = require('archiver');
const D = new Date();
const	defaultBackupZipFilename = `periodicbackup-${ D.getUTCFullYear() }-${ D.getUTCMonth() }-${ D.getUTCDate() }-${ D.getTime() }`;
const	defaultOutputDirpath = path.join(__dirname, '../../../content/files/backups/');
const	defaultBackupDir = path.join(defaultOutputDirpath, '/.tempbackup');
const filterRegexFunction = function (file) {
	let returnValTest = file.match(/^(?!^(?:(?:(?!(?:\/|^)\.).)*?\/node_modules\/(?:(?!(?:\/|^)\.).)*?)$).*$/) && file.match(/^(?!^(?:(?:(?!(?:\/|^)\.).)*?\/content\/files\/backups\/(?:(?!(?:\/|^)\.).)*?)$).*$/);
	return Boolean(returnValTest == true);
};

var seedController;
var CoreUtilities;
var CoreController;
var appSettings;
var mongoose;
var exportBackupOptions;
var logger;
var	defaultBackupZipFilepath;
var	backupdatabase = true;

/**
 * remove backup directory and leave zip
 * @param  {Function} asyncCallBack
 * @return {Function} async callback asyncCallBack(err,results);
 */
var removebackupDirectory = function (cb) {
	let filepath = path.join(defaultBackupDir, defaultBackupZipFilename);
	if (typeof cb === 'function') fs.remove(filepath, cb);
	else return fs.removeAsync(filepath);
};

/**
 * outputs json file of backup options and status, and periodic version
 * @param  {Function} asyncCallBack
 * @return {Function} async callback asyncCallBack(err,results);
 */
var createBackupStatusfile = function (cb) {
	let backupstatus = {};
	let backupstatusfile = path.join(defaultBackupDir, defaultBackupZipFilename, 'backup.json');
	return fs.readJsonAsync(path.join(__dirname, '../../../package.json'))
		.then(packagedata => {
			backupstatus.backupinfo = {
				backuppackagejson: !exportBackupOptions.skipPackageJson,
				backupdatabase: !exportBackupOptions.skipDatabaseBackup,
				backupconfigcontent: !exportBackupOptions.skipBackupContentDir,
				backuppublicdir: !exportBackupOptions.skipBackupPublicDir
			};
			if (!exportBackupOptions.skipPackageJson) backupstatus.packageJSON = packagedata;
			return fs.outputJsonAsync(backupstatusfile, backupstatus, { spaces: 2 });
		})
		.then(() => {
			if (typeof cb === 'function') cb();
		}, e => {
			if (typeof cb === 'function') cb(e);
			else return Promisie.reject(e);
		});
};

/**
 * outputs a db seed
 * @param  {Function} asyncCallBack
 * @return {Function} async callback asyncCallBack(err,results);
 */
var createDBSeed = function (cb) {
	exportBackupOptions.filepath = path.join(defaultBackupDir, defaultBackupZipFilename, 'backupseed.json');
	if(exportBackupOptions.skipDatabaseBackup){
		if (typeof cb === 'function') cb(null, 'skipping database');
		else return Promisie.resolve('skipping database');
	}
	else return seedController.exportSeed(exportBackupOptions, cb);
};

/**
 * creates zip archieve of backup directory
 * @param  {Function} asyncCallBack
 * @return {Function} async callback asyncCallBack(err,results);
 */
var createZipArchiveOfBackupDirectory = function (cb) {
	//https://github.com/ctalkington/node-archiver/blob/master/examples/pack-zip.js
	return fs.ensureDirAsync(defaultOutputDirpath)
		.then(() => {
			let output = fs.createWriteStream(path.join(defaultOutputDirpath, defaultBackupZipFilename + '.zip'));
			let archive = archiver('zip');
			archive.pipe(output);
			archive.bulk([{
				expand: true,
				cwd: path.join(defaultBackupDir, defaultBackupZipFilename),
				src: ['**'],
				dest: defaultBackupZipFilename
			}]).finalize();
			return new Promisie((resolve, reject) => {
				output.on('finish', () => {
					logger.silly('asyncadmin - archiver has been finalized and the output file descriptor has closed.');
					resolve(archive);
				})
					.on('error', reject);
				archive.on('error', reject);
			});
		})
		.then(archive => {
			if (typeof cb === 'function') cb(null, `${ archive.pointer() } total bytes`);
			else return Promisie.resolve(`${ archive.pointer() } total bytes`);
		})
		.catch(e => {
			if (typeof cb === 'function') cb(e);
			else return Promisie.reject(e);
		});
};

/**
 * create the back up directory, if there are assets, put the authors in the
 * @param  {Function} asyncCallBack
 * @return {Function} async callback asyncCallBack(err,results);
 */
var createBackupDirectory = function (cb) {
	let contentDir = path.join(__dirname, '../../../content/');
	let publicDir = path.join(__dirname, '../../../public/');
	let backupContentDir = path.join(defaultBackupDir, defaultBackupZipFilename, 'content');
	let backupPublicDir = path.join(defaultBackupDir, defaultBackupZipFilename, 'public');
	return Promisie.series([
		fs.ensureDirAsync.bind(fs, defaultBackupDir),
		function () {
			if (!exportBackupOptions.skipBackupContentDir) return fs.copyAsync(contentDir, backupContentDir, filterRegexFunction);
			else return Promisie.resolve('skipping content dir backup');
		},
		function () {
			if (!exportBackupOptions.skipBackupContentDir) return fs.copyAsync(publicDir, backupPublicDir, filterRegexFunction);
			else return Promisie.resolve('skipping public dir backup');
		}
	])
		.then(result => {
			if (typeof cb === 'function') cb(null, result);
			else return Promisie.resolve(result);
		})
		.catch(e => {
			if (typeof cb === 'function') cb(e);
			else return Promisie.reject(e);
		});
};

/**
 * exports a database backup to disk
 * @param  {object} options - filepath,limits-tags,collections,etc
 * @param  {object} exportBackupCallback
 * @return {Function} async callback exportBackupCallback(err,results);
 */
var exportBackup = function (options, cb) {
	try {
		defaultBackupZipFilename = (typeof options.filename === 'string') ? options.filename : defaultBackupZipFilename;
		defaultBackupZipFilepath = (typeof options.filepath === 'string') ? path.resolve(options.filepath) : path.join(defaultBackupDir, defaultBackupZipFilename);
		defaultOutputDirpath = (typeof options.outputpath === 'string') ? path.resolve(options.outputpath) : path.resolve(defaultOutputDirpath);
	}
	catch (e) {
		if (typeof cb === 'function') cb(e);
		else return Promisie.reject(e);
	}
	exportBackupOptions = options;
	let results = [];
	let invokeAndSetResult = function (fn) {
		return function () {
			return fn()
				.then(result => {
					results.push(result);
					return result;
				}, e => Promisie.reject(e));
		};
	};
	return Promisie.series([
		invokeAndSetResult(createBackupDirectory),
		invokeAndSetResult(createDBSeed),
		invokeAndSetResult(createBackupStatusfile),
		invokeAndSetResult(createZipArchiveOfBackupDirectory),
		invokeAndSetResult(removebackupDirectory)
	])
		.then(exportResult => {
			let result = {
				createBackupDirectory: exportResult[0],
				createDBSeed: exportResult[1],
				createBackupStatusfile: exportResult[2],
				createZipArchieveOfBackupDirectory: exportResult[3],
				removebackupDirectory: exportResult[4],
				defaultBackupZipFilepath: defaultBackupZipFilepath,
				defaultBackupZipFilename: defaultBackupZipFilename + '.zip'
			};
			if (typeof cb === 'function') cb(null, result);
			else return Promisie.resolve(result);
		})
		.catch(e => {
			if (typeof cb === 'function') cb(e);
			else return Promisie.reject(e);
		});
};

/**
 * exportbackup module
 * @module exportbackup
 * @{@link https://github.com/typesettin/periodicjs.ext.backup}
 * @author Yaw Joseph Etse
 * @copyright Copyright (c) 2014 Typesettin. All rights reserved.
 * @license MIT
 * @requires module:async
 * @requires module:periodicjs.core.utilities
 * @requires module:periodicjs.core.controller
 * @param  {object} resources variable injection from current periodic instance with references to the active logger and mongo session
 * @return {object}           backup
 */
var exportBackupModule = function (resources) {
	logger = resources.logger;
	mongoose = resources.mongoose;
	appSettings = resources.settings;
	CoreController = resources.core.controller;
	CoreUtilities = resources.core.utilities;
	seedController = resources.app.controller.extension.dbseed.seed;
	return {
		exportBackup: exportBackup
	};
};

module.exports = exportBackupModule;
