'use strict';

var fs = require('fs-extra'),
	path = require('path'),
	async = require('async'),
	Asset,
	exportBackupModule,
	restoreBackupModule,
	CoreUtilities,
	CoreController,
	appSettings,
	mongoose,
	logger,
	uploadbackupdir = path.resolve(process.cwd(), 'content/files/backups');

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
	var downloadBackupOptions = CoreUtilities.removeEmptyObjectValues(req.body);
	async.series({
		exportbackup: function (cb) {
			exportBackupModule.exportBackup(downloadBackupOptions, function (err, status) {
				cb(err, status);
			});
		}
	}, function (err, result) {
		if (err) {
			CoreController.handleDocumentQueryErrorResponse({
				err: err,
				res: res,
				req: req
			});
		}
		else {
			var downloadfile = path.join(process.cwd(), 'content/files/backups', result.exportbackup.defaultBackupZipFilename),
				exportFileName = path.basename(downloadfile);

			res.setHeader('Content-disposition', 'attachment; filename=' + exportFileName);
			res.setHeader('Content-type', 'application/octet-stream');
			// res.setHeader('Content-length', downloadfileObj.length);

			// var filestream = fs.createReadStream(downloadfile);
			// filestream.pipe(res);
			// var file = __dirname + '/upload-folder/dramaticpenguin.MOV';
			res.download(downloadfile, exportFileName, function (err) {
				if (err) {
					logger.error(err);
				}
				else {
					fs.remove(downloadfile, function (err) {
						if (err) {
							logger.error(err);
						}
					});
				}
			}); // Set disposition and send it.
		}
	});
};

/**
 * upload post controller for backups uplaoded via admin interface
 * @param  {object} req
 * @param  {object} res
 * @return {object} responds with backup page
 */
var restore_backup = function (req, res) {
	var uploadBackupObject = CoreUtilities.removeEmptyObjectValues(req.body),
		originalbackupuploadpath,
		backupname,
		fixedbackuppath,
		useExistingBackup = (uploadBackupObject.previousbackup && uploadBackupObject.previousbackup === 'usepreviousbackup') ? true : false,
		newbackuppath;

	async.series({
			setupbackupdata: function (cb) {
				try {

					if (useExistingBackup) {
						backupname = path.basename(uploadBackupObject.backuppath);
						newbackuppath = path.resolve(process.cwd(), 'content/files/backups', backupname);
					}
					else {
						originalbackupuploadpath = path.join(process.cwd(), 'public', uploadBackupObject.backuppath);
						backupname = path.basename(uploadBackupObject.backuppath);
						newbackuppath = path.resolve(process.cwd(), 'content/files/backups', backupname);

						var backupnamearray = backupname.split('-'),
							fixedbackupname;
						backupnamearray.shift();
						fixedbackupname = backupnamearray.join('-');
						fixedbackuppath = path.resolve(process.cwd(), 'content/files/backups', fixedbackupname);
					}
					cb(null, 'setup backup data');
				}
				catch (e) {
					cb(e);
				}
			},
			checkdirexists: function (cb) {
				if (useExistingBackup) {
					cb(null, 'skip directory check, useExistingBackup');
				}
				else {
					fs.ensureDir(uploadbackupdir, cb);
				}
			},
			movebackup: function (cb) {
				if (useExistingBackup) {
					cb(null, 'skip move directory, useExistingBackup');
				}
				else {
					fs.rename(originalbackupuploadpath, fixedbackuppath, cb);
				}
			},
			deleteOldUpload: function (cb) {
				if (useExistingBackup) {
					cb(null, 'skip delete old backup, useExistingBackup');
				}
				else {
					fs.remove(originalbackupuploadpath, cb);
				}
			},
			restorebackup: function (cb) {
				if (useExistingBackup) {
					restoreBackupModule.restoreBackup({
						file: newbackuppath,
						removebackup: false
					}, cb);
				}
				else {
					restoreBackupModule.restoreBackup({
						file: fixedbackuppath,
						removebackup: false
					}, cb);
				}
			},
			removeAssetFromDB: function (cb) {
				console.log('uploadBackupObject.removeBackupAsset', uploadBackupObject.removeBackupAsset);
				if (uploadBackupObject.backupassetid && useExistingBackup && uploadBackupObject.removeBackupAsset) {
					Asset.remove({
						fileurl: new RegExp(uploadBackupObject.backupassetid, 'gi')
					}, cb);
				}
				else {
					cb(null, 'skip removing asset from DB');
				}
			},
			removeUploadFile: function (cb) {
				if (uploadBackupObject.removeBackupAsset) {
					var backuparchivepath = path.join(process.cwd(), 'content/files/backups', uploadBackupObject.backuppath);
					console.log('backuparchivepath', backuparchivepath);
					fs.remove(backuparchivepath, cb);
				}
				else {
					cb(null, 'skip deleting backup files');
				}
			}
		},
		function (err, status) {
			if (err) {
				logger.error('err', err);
				CoreController.handleDocumentQueryErrorResponse({
					err: err,
					res: res,
					req: req
				});
			}
			else {
				CoreController.handleDocumentQueryRender({
					res: res,
					req: req,
					renderView: 'home/index',
					responseData: {
						pagedata: {
							title: 'Restore back up',
						},
						data: status,
						user: req.user
					}
				});
			}
		});
};

/**
 * uploads backups via admin interface
 * @param  {object} req
 * @param  {object} res
 * @return {object} responds with backup page
 */
var index = function (req, res) {
	async.waterfall([
		function (cb) {
			fs.ensureDir(path.join(process.cwd(), 'content/files/backups'), function (err) {
				cb(err);
			});
		},
		function (cb) {
			CoreController.getPluginViewDefaultTemplate({
					viewname: 'p-admin/backup/index',
					themefileext: appSettings.templatefileextension,
					extname: 'periodicjs.ext.backup'
				},
				function (err, templatepath) {
					cb(err, templatepath);
				});
		},
		function (templatepath, cb) {
			fs.readdir(path.join(process.cwd(), 'content/files/backups'), function (err, files) {
				var backupzipfiles = [];
				if (files && files.length > 0) {
					for (var bufi = 0; bufi < files.length; bufi++) {
						if (files[bufi].match(/.zip/gi)) {
							backupzipfiles.push(files[bufi]);
						}
					}
				}
				cb(err, {
					templatepath: templatepath,
					existingbackups: backupzipfiles
				});
			});
		}
	], function (err, result) {
		CoreController.handleDocumentQueryRender({
			res: res,
			req: req,
			err: err,
			renderView: result.templatepath,
			responseData: {
				pagedata: {
					title: 'Backup & Restore',
					headerjs: ['/extensions/periodicjs.ext.backup/js/backup.min.js'],
					extensions: CoreUtilities.getAdminMenu()
				},
				periodic: {
					version: appSettings.version
				},
				existingbackups: result.existingbackups,
				user: req.user
			}
		});
	});

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
	//console.log('resources.app.controller.extension.dbseed',resources.app.controller.extension.dbseed);

	exportBackupModule = resources.app.controller.extension.backup.exportbackup;
	restoreBackupModule = resources.app.controller.extension.backup.restorebackup;

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
