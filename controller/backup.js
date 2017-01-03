'use strict';
const Promisie = require('promisie');
const fs = Promisie.promisifyAll(require('fs-extra'));
const moment = require('moment');
const CronJob = require('cron').CronJob;
const prettyCron = require('prettycron');
const cronParser = require('cron-parser');
const usecroncheckfile = path.join(__dirname, '../../../content/files/croncheck.json');
const uploadbackupdir = path.join(__dirname, '../../../content/files/backups');

var backupconfig;
var Asset;
var exportBackupModule;
var restoreBackupModule;
var CoreUtilities;
var CoreController;
var appSettings;
var mongoose;
var logger;
var installedCloudUploads;
var cloudUploadFunction;
var createAssetFunction;

var uploaded_backup_file = function (req, res) {
	res.send({
		result: 'success',
		data: req.controllerData
	});
};

var set_backup_upload_dir = function (req, res, next) {
	req.localuploadpath = uploadbackupdir;
	next();
};

/**
 * exports backups via admin interface
 * @param  {object} req
 * @param  {object} res
 * @return {object} responds with backup download
 */
var download_backup = function (req, res) {
	let downloadBackupOptions = CoreUtilities.removeEmptyObjectValues(req.body);
	let downloadFile;
	let exportFileName;
	exportBackupModule.exportBackup(downloadBackupOptions)
		.then(result => {
			logger.silly('download_backup result', result);
			downloadFile = path.join(__dirname, '../../../content/files/backups', result.defaultBackupZipFilename);
			exportFileName = path.basename(downloadfile);
			res.setHeader('Content-disposition', `attachment; filename=${ exportFileName }`);
			res.setHeader('Content-type', 'application/octet-stream');
			return Promisie.promisify(res.download, res)(downloadFile, exportFileName);
		}, e => {
			CoreController.handleDocumentQueryErrorResponse({
				err: e,
				res: res,
				req: req
			});
			return false;
		})
		.then(result => {
			if (result !== false) return fs.removeAsync(downloadFile)
		})
		.catch(logger.error.bind(logger));
};

var setup_backup_options = function (options) {
	try {
		if (options.useExistingBackup) {
			options.backupname = path.basename(options.backuppath);
			options.newbackuppath = path.join(__dirname, '../../../content/files/backups', backupname);
		}
		else {
			options.originalbackupuploadpath = path.join(process.cwd(), 'public', options.backuppath);
			options.backupname = path.basename(options.backuppath);
			options.newbackuppath = path.join(__dirname, '../../../content/files/backups', backupname);
			let fixedbackupname = options.backupname.replace(/([^-]+-)(.+)/, '$2');
			options.fixedbackuppath = path.join(__dirname, '../../../content/files/backups', fixedbackupname);
		}
		return Promisie.resolve(options);
	}
	catch (e) {
		return Promisie.reject(e);
	}
};

var checkExistingBackupStatus = function (fn, argv) {
	return function (options) {
		if (options.useExistingBackup) return Promisie.resolve(options);
		else {
			return fn(argv)
				.then(() => options)
				.catch(e => Promisie.reject(e));
		}
	};
};

/**
 * upload post controller for backups uplaoded via admin interface
 * @param  {object} req
 * @param  {object} res
 * @return {object} responds with backup page
 */
var restore_backup = function (req, res) {
	let uploadBackupObject = CoreUtilities.removeEmptyObjectValues(req.body);
	let useExistingBackup = (uploadBackupObject.previousbackup && uploadBackupObject.previousbackup === 'usepreviousbackup');
	let processOptions = Object.assign({}, uploadBackupObject, {
		useExistingBackup,
		originalbackupuploadpath: null,
		backupname: null,
		fixedbackuppath: null,
		newbackuppath: null
	});
	Promisie.series([
		setup_backup_options.bind(null, processOptions),
		checkExistingBackupStatus(fs.ensureDirAsync, uploadbackupdir),
		checkExistingBackupStatus(function (options) {
			return fs.renameAsync(options.originalbackupuploadpath, options.fixedbackuppath);
		}),
		checkExistingBackupStatus(function (options) {
			return fs.removeAsync(options.originalbackupuploadpath);
		}),
		function restorebackup (options) {
			let filetouse = (options.useExistingBackup) ? options.newbackuppath : options.fixedbackuppath;
			return restoreBackupModule.restoreBackup(Object.assign({}, options, { file: filetouse }));
		}
	])
		.then(result => {
			CoreController.handleDocumentQueryRender({
				res: res,
				req: req,
				renderView: 'home/index',
				responseData: {
					pagedata: {
						title: 'Restore back up',
					},
					data: result,
					user: req.user
				}
			});
		}, e => {
			logger.error('err', e);
			CoreController.handleDocumentQueryErrorResponse({
				err: e,
				res: res,
				req: req
			});
		});
};

var handle_index = function (req, res, data) {
	let cron_interval = cronParser.parseExpression(backupconfig.cloud_backup_cron);
	let responseData = {
		pagedata: {
			title: 'Backup & Restore',
			headerjs: ['/extensions/periodicjs.ext.backup/js/backup.min.js'],
			extensions: CoreUtilities.getAdminMenu()
		},
		periodic: {
			version: appSettings.version
		},
		existingbackups: data.existingbackups,
		cloudbackupcron_interval : cron_interval,
		cloudbackupcron_prettycron : prettyCron.toString(backupconfig.cloud_backup_cron),
		cloudbackupcron_next : new moment(cron_interval.next()).format('dddd, MMMM Do YYYY, h:mm:ss a'),
		installedCloudUploads: installedCloudUploads,
		user: req.user
	};
	return CoreController._utility_responder.render(responseData, {
		viewname: path.join(path.dirname(data.templatepath), path.basename(data.templatepath, path.extname(data.templatepath))),
		fileext: path.extname(data.templatepath),
		skip_response: true
	})
		.then(result => [req, res, { responder_override: result }])
		.catch(e => Promisie.reject(e));
};

/**
 * uploads backups via admin interface
 * @param  {object} req
 * @param  {object} res
 * @return {object} responds with backup page
 */
var index = function (req, res) {
	Promisie.series([
		fs.ensureDirAsync.bind(fs, path.join(__dirname, '../../../content/files/backups')),
		CoreController._utility_responder.render.bind(CoreController, {
			viewname: 'p-admin/backup/index',
			fileext: appSettings.templatefileextension,
			extname: 'periodicjs.ext.backup',
			resolve_filepath: true
		}),
		function (templatepath) {
			return fs.readdirAsync(path.join(__dirname, '../../../content/files/backups'))
				.then(filenames => {
					let backupzipfiles = filenames.filter(name => path.extname(name) === '.zip');
					return {
						templatepath,
						existingbackups: backupzipfiles
					};
				}, e => Promisie.reject(e));
		}
	])
		.then(handle_index.bind(null, req, res))
		.spread(CoreController.meta.respond)
		.catch(logger.error.bind(logger));
};

var runExportBackup = function () {
	if (backupconfig && backupconfig.cloud_backup_options && backupconfig.cloud_backup_options.filename) {
		backupconfig.cloud_backup_options.filename = `${ backupconfig.cloud_backup_options.filename }_${ moment().format('YYYY-MM-DD_HH-mm-ss') }`;
	}
	return exportBackupModule.exportBackup(backupconfig.cloud_backup_options)
		.then(result => {
			let filepath = path.join(__dirname, '../../../content/files/backups', result.defaultBackupZipFilename);
			return fs.statAsync(filepath)
				.then(stats => {
					return [result, stats, filepath];
				}, e => Promisie.reject(e));
		})
		.spread((result, stats, backupPath) => {
			let backupZipFileObject = {
				path: backupPath,
				size: stats.size,
				mimetype: 'application/zip',
				fieldname: 'cloud_backup',
				name: path.basename(backupPath)
			};
			return {
				backupZipFileObject,
				status: {
					export_result: result
				}
			};
		})
		.catch(e => Promisie.reject(e));
};

var cron_automate_cloud_backup = function () {
	Promisie.series([
		runExportBackup,
		function (result) {
			return Promisie.promisify(cloudUploadFunction)(result.backupZipFileObject)
				.then(uploaded => {
					result.status.uploaded_cloud_file_result = uploaded;
					return result;
				}, e => Promisie.reject(e));
		},
		function (result) {
			return Promisie.promisify(createAssetFunction)({ file: result.status.uploaded_cloud_file_result })
				.then(created => {
					result.status.asset_result = created;
					return result;
				}, e => Promisie.reject(e));
		},
		function (result) {
			return fs.removeAsync(result.backupZipFileObject.path)
				.then(removed => {
					result.status.remove_result = removed;
					return result;
				}, e => Promisie.reject(e));
		}
	])
		.then(logger.silly.bind(logger, 'asyncadmin - cron_automate_cloud_backup result'))
		.catch(logger.error.bind(logger, 'asyncadmin - cron_automate_cloud_backup err'));
};

var useCronTasks = function () {
	fs.readJsonAsync(usecroncheckfile)
		.then(result => {
			logger.silly('using cron for origination', result);
			var automate_cloud_backup = new CronJob({
				cronTime: backupconfig.cloud_backup_cron,
				onTick: cron_automate_cloud_backup,
				onComplete: function () {}
			});
			automate_cloud_backup.start();
		}, logger.silly.bind(logger, 'do not use cron for origination'))
};

/**
 * backup controller
 * @module backupController
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
var controller = function (resources) {
	logger = resources.logger;
	mongoose = resources.mongoose;
	appSettings = resources.settings;
	CoreController = resources.core.controller;
	CoreUtilities = resources.core.utilities;
	Asset = mongoose.model('Asset');
	installedCloudUploads = typeof resources.app.controller.extension.cloudupload !=='undefined';
	backupconfig = resources.app.controller.extension.backup.config;
	exportBackupModule = resources.app.controller.extension.backup.exportbackup;
	restoreBackupModule = resources.app.controller.extension.backup.restorebackup;
	cloudUploadFunction = resources.app.controller.extension.cloudupload.cloudupload.uploadFileIterator;
	createAssetFunction = resources.app.controller.native.asset.create_asset;
	useCronTasks();
	return {
		index: index,
		restore_backup: restore_backup,
		download_backup: download_backup,
		restoreBackup: restoreBackupModule.restoreBackup,
		exportBackup: exportBackupModule.exportBackup,
		isValidBackupJSONSync: restoreBackupModule.isValidBackupJSONSync,
		uploaded_backup_file: uploaded_backup_file,
		set_backup_upload_dir: set_backup_upload_dir
	};
};

module.exports = controller;
