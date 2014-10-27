'use strict';

var Utilities = require('periodicjs.core.utilities'),
	ControllerHelper = require('periodicjs.core.controller'),
	fs = require('fs-extra'),
	path = require('path'),
	async = require('async'),
	Asset,
	exportSeedModule,
	importSeedModule,
	dbopsModule,
	CoreUtilities,
	CoreController,
	appSettings,
	mongoose,
	logger,
	uploadseeddir = path.resolve(process.cwd(), 'content/files/dbseeds'),
	d = new Date(),
	defaultExportFileName = 'dbemptybackup' + '-' + d.getUTCFullYear() + '-' + d.getUTCMonth() + '-' + d.getUTCDate() + '-' + d.getTime() + '.json';

/**
 * exports seeds via admin interface
 * @param  {object} req
 * @param  {object} res
 * @return {object} responds with dbseed download
 */
var export_download = function (req, res) {
	// var downloadSeedObject = CoreUtilities.removeEmptyObjectValues(req.body);

	async.series({
		exportseed: function (cb) {
			exportSeedModule.exportSeed({}, function (err, status) {
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
			var downloadfile = result.exportseed.exportSeedFilePath,
				exportFileName = path.basename(downloadfile);

			res.setHeader('Content-disposition', 'attachment; filename=' + exportFileName);
			res.setHeader('Content-type', 'application/json');
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
 * upload custom seed controller for seeds posted via admin interface
 * @param  {object} req
 * @param  {object} res
 * @return {object} responds with dbseed page
 */
var import_customseed = function (req, res) {
	var uploadSeedObject = CoreUtilities.removeEmptyObjectValues(req.body),
		seedParseError,
		customSeed;
	try {
		customSeed = JSON.parse(uploadSeedObject.customseedjson);
	}
	catch (e) {
		seedParseError = e;
	}

	console.time('Importing Custom Seed Data');
	importSeedModule.importSeed({
			jsondata: customSeed,
			insertsetting: 'upsert'
		},
		function (err, status) {
			console.timeEnd('Importing Custom Seed Data');
			if (seedParseError) {
				CoreController.handleDocumentQueryErrorResponse({
					err: seedParseError,
					res: res,
					req: req
				});
			}
			else if (err) {
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
							title: 'New Item',
						},
						data: status,
						user: req.user
					}
				});
			}
		});
};

/**
 * upload post controller for seeds uplaoded via admin interface
 * @param  {object} req
 * @param  {object} res
 * @return {object} responds with dbseed page
 */
var import_upload = function (req, res) {
	var uploadSeedObject = CoreUtilities.removeEmptyObjectValues(req.body),
		originalseeduploadpath,
		seedname,
		useExistingSeed = (uploadSeedObject.previousseed && uploadSeedObject.previousseed === 'usepreviousseed') ? true : false,
		newseedpath;

	async.series({
			setupseeddata: function (cb) {
				try {
					if (useExistingSeed) {
						seedname = path.basename(uploadSeedObject.seedpath);
						newseedpath = path.resolve(process.cwd(), 'content/files/dbseeds', seedname);
					}
					else {
						originalseeduploadpath = path.join(process.cwd(), 'public', uploadSeedObject.seedpath);
						seedname = path.basename(uploadSeedObject.seedpath);
						newseedpath = path.resolve(process.cwd(), 'content/files/dbseeds', seedname);
					}
					cb(null, 'setup seed data');
				}
				catch (e) {
					cb(e);
				}
			},
			checkdirexists: function (cb) {
				if (useExistingSeed) {
					cb(null, 'skip directory check, useExistingSeed');
				}
				else {
					fs.ensureDir(uploadseeddir, cb);
				}
			},
			moveseed: function (cb) {
				if (useExistingSeed) {
					cb(null, 'skip move directory, useExistingSeed');
				}
				else {
					fs.rename(originalseeduploadpath, newseedpath, cb);
				}
			},
			deleteOldUpload: function (cb) {
				if (useExistingSeed) {
					cb(null, 'skip delete old seed, useExistingSeed');
				}
				else {
					fs.remove(originalseeduploadpath, cb);
				}
			},
			removeAssetFromDB: function (cb) {
				if (uploadSeedObject.assetid) {
					CoreController.deleteModel({
						model: Asset,
						deleteid: uploadSeedObject.assetid,
						req: req,
						res: res,
						callback: cb
					});
				}
				else {
					cb(null, 'existing seed');
				}
			},
			wipedb: function (cb) {
				if (uploadSeedObject.wipecheckbox) {
					async.series([
						function (wipedbcallback) {
							console.time('Exporting Seed Data');
							exportSeedModule.exportSeed({
								filepath: 'content/files/dbseeds/' + defaultExportFileName,
							}, function (err, status) {
								console.timeEnd('Exporting Seed Data');
								wipedbcallback(err, status);
							});
						},
						function (emptydbcallback) {
							console.time('Empty Database Data');
							dbopsModule.emptyDB({},
								function (err, status) {
									console.timeEnd('Empty Database Data');
									emptydbcallback(err, status);
								});
						}
					], function (err, status) {
						cb(err, status);
					});
				}
				else {
					cb(null, 'do not empty db');
				}
			},
			seeddb: function (cb) {
				fs.readJson(newseedpath, function (err, seedjson) {
					if (err) {
						cb(err);
					}
					else {
						console.time('Importing Seed Data');
						importSeedModule.importSeed({
							jsondata: seedjson,
							insertsetting: 'upsert'
						}, function (err, status) {
							console.timeEnd('Importing Seed Data');
							cb(err, status);
						});
					}
				});
			}
		},
		function (err, status) {
			if (err) {
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
							title: 'New Item',
						},
						data: status,
						user: req.user
					}
				});
			}
		});
};

/**
 * uploads seeds via admin interface
 * @param  {object} req
 * @param  {object} res
 * @return {object} responds with dbseed page
 */
var index = function (req, res) {
	async.waterfall([
		function (cb) {
			CoreController.getPluginViewDefaultTemplate({
					viewname: 'p-admin/dbseed/index',
					themefileext: appSettings.templatefileextension,
					extname: 'periodicjs.ext.dbseed'
				},
				function (err, templatepath) {
					cb(err, templatepath);
				});
		},
		function (templatepath, cb) {
			fs.readdir(path.join(process.cwd(), 'content/files/dbseeds'), function (err, files) {
				cb(err, {
					templatepath: templatepath,
					existingseeds: files
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
					title: 'DBSeed Import/Export',
					headerjs: ['/extensions/periodicjs.ext.dbseed/js/dbseed.min.js'],
					extensions: CoreUtilities.getAdminMenu()
				},
				periodic: {
					version: appSettings.version
				},
				existingseeds: result.existingseeds,
				user: req.user
			}
		});
	});

};

/**
 * dbseed controller
 * @module dbseedController
 * @{@link https://github.com/typesettin/periodicjs.ext.dbseed}
 * @author Yaw Joseph Etse
 * @copyright Copyright (c) 2014 Typesettin. All rights reserved.
 * @license MIT
 * @requires module:async
 * @requires module:periodicjs.core.utilities
 * @requires module:periodicjs.core.controller
 * @param  {object} resources variable injection from current periodic instance with references to the active logger and mongo session
 * @return {object}           dbseed
 */
var controller = function (resources) {
	logger = resources.logger;
	mongoose = resources.mongoose;
	appSettings = resources.settings;
	CoreController = new ControllerHelper(resources);
	CoreUtilities = new Utilities(resources);
	exportSeedModule = require('./exportseed')(resources);
	importSeedModule = require('./importseed')(resources);
	dbopsModule = require('./dbops')(resources);
	Asset = mongoose.model('Asset');
	//async ensure export directory
	fs.ensureDir(uploadseeddir, function (err) {
		if (err) {
			logger.error(err);
		}
	});

	return {
		index: index,
		import_upload: import_upload,
		export_download: export_download,
		import_customseed: import_customseed,
		seedDocuments: importSeedModule.seedDocuments,
		importSeed: importSeedModule.importSeed,
		exportSeed: exportSeedModule.exportSeed,
		emptyDB: dbopsModule.emptyDB,
		isValidSeedJSONSync: importSeedModule.isValidSeedJSONSync
	};
};

module.exports = controller;
