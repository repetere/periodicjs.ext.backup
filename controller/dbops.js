'use strict';
var async = require('async'),
	Utilities = require('periodicjs.core.utilities'),
	ControllerHelper = require('periodicjs.core.controller'),
	CoreUtilities,
	CoreController,
	appSettings,
	mongoose,
	logger,
	User, // = mongoose.model('User')
	Item, // = mongoose.model('Item')
	Asset, //  = mongoose.model('Asset')
	Contenttype, // = mongoose.model('Contenttype')
	Category, // = mongoose.model('Category')
	Tag, // = mongoose.model('Tag')
	Collection, // = mongoose.model('Collection')
	Compilation, // = mongoose.model('Collection')
	Userprivilege, // = mongoose.model('Userprivilege')
	Userrole, // = mongoose.model('Userrole')
	Usergroup, // = mongoose.model('Usergroup');
	dbOpsErrorsArray = [];

/**
 * removes all Usergroups from the database
 * @param  {object} err
 * @param  {Function} emptyUsergroupsAsyncCallback
 * @return {Function} async callback emptyUsergroupsAsyncCallback(err,results);
 */
var emptyUsergroups = function (emptyUsergroupsAsyncCallback) {
	Usergroup.remove({}).exec(function (err) {
		if (err) {
			dbOpsErrorsArray.push({
				error: err,
				errortype: 'emptyUsergroups'
			});
		}
		emptyUsergroupsAsyncCallback(null, 'removed all Usergroups');
	});
};
/**
 * removes all Userroles from the database
 * @param  {object} err
 * @param  {Function} emptyUserrolesAsyncCallback
 * @return {Function} async callback emptyUserrolesAsyncCallback(err,results);
 */
var emptyUserroles = function (emptyUserrolesAsyncCallback) {
	Userrole.remove({}).exec(function (err) {
		if (err) {
			dbOpsErrorsArray.push({
				error: err,
				errortype: 'emptyUserroles'
			});
		}
		emptyUserrolesAsyncCallback(null, 'removed all Userroles');
	});
};
/**
 * removes all Userprivileges from the database
 * @param  {object} err
 * @param  {Function} emptyUserprivilegesAsyncCallback
 * @return {Function} async callback emptyUserprivilegesAsyncCallback(err,results);
 */
var emptyUserprivileges = function (emptyUserprivilegesAsyncCallback) {
	Userprivilege.remove({}).exec(function (err) {
		if (err) {
			dbOpsErrorsArray.push({
				error: err,
				errortype: 'emptyUserprivileges'
			});
		}
		emptyUserprivilegesAsyncCallback(null, 'removed all Userprivileges');
	});
};
/**
 * removes all Collections from the database
 * @param  {object} err
 * @param  {Function} emptyCollectionsAsyncCallback
 * @return {Function} async callback emptyCollectionsAsyncCallback(err,results);
 */
var emptyCollections = function (emptyCollectionsAsyncCallback) {
	Collection.remove({}).exec(function (err) {
		if (err) {
			dbOpsErrorsArray.push({
				error: err,
				errortype: 'emptyCollections'
			});
		}
		emptyCollectionsAsyncCallback(null, 'removed all Collections');
	});
};
/**
 * removes all Compilations from the database
 * @param  {object} err
 * @param  {Function} emptyCompilationsAsyncCallback
 * @return {Function} async callback emptyCompilationsAsyncCallback(err,results);
 */
var emptyCompilations = function (emptyCompilationsAsyncCallback) {
	Compilation.remove({}).exec(function (err) {
		if (err) {
			dbOpsErrorsArray.push({
				error: err,
				errortype: 'emptyCompilations'
			});
		}
		emptyCompilationsAsyncCallback(null, 'removed all Compilations');
	});
};
/**
 * removes all Items from the database
 * @param  {object} err
 * @param  {Function} emptyItemsAsyncCallback
 * @return {Function} async callback emptyItemsAsyncCallback(err,results);
 */
var emptyItems = function (emptyItemsAsyncCallback) {
	Item.remove({}).exec(function (err) {
		if (err) {
			dbOpsErrorsArray.push({
				error: err,
				errortype: 'emptyItems'
			});
		}
		emptyItemsAsyncCallback(null, 'removed all Items');
	});
};
/**
 * removes all Categorys from the database
 * @param  {object} err
 * @param  {Function} emptyCategorysAsyncCallback
 * @return {Function} async callback emptyCategorysAsyncCallback(err,results);
 */
var emptyCategories = function (emptyCategorysAsyncCallback) {
	Category.remove({}).exec(function (err) {
		if (err) {
			dbOpsErrorsArray.push({
				error: err,
				errortype: 'emptyCategorys'
			});
		}
		emptyCategorysAsyncCallback(null, 'removed all Categorys');
	});
};
/**
 * removes all Tags from the database
 * @param  {object} err
 * @param  {Function} emptyTagsAsyncCallback
 * @return {Function} async callback emptyTagsAsyncCallback(err,results);
 */
var emptyTags = function (emptyTagsAsyncCallback) {
	Tag.remove({}).exec(function (err) {
		if (err) {
			dbOpsErrorsArray.push({
				error: err,
				errortype: 'emptyTags'
			});
		}
		emptyTagsAsyncCallback(null, 'removed all Tags');
	});
};
/**
 * removes all Contenttypes from the database
 * @param  {object} err
 * @param  {Function} emptyContenttypesAsyncCallback
 * @return {Function} async callback emptyContenttypesAsyncCallback(err,results);
 */
var emptyContenttypes = function (emptyContenttypesAsyncCallback) {
	Contenttype.remove({}).exec(function (err) {
		if (err) {
			dbOpsErrorsArray.push({
				error: err,
				errortype: 'emptyContenttypes'
			});
		}
		emptyContenttypesAsyncCallback(null, 'removed all Contenttypes');
	});
};
/**
 * removes all Users from the database
 * @param  {object} err
 * @param  {Function} emptyUsersAsyncCallback
 * @return {Function} async callback emptyUsersAsyncCallback(err,results);
 */
var emptyUsers = function (emptyUsersAsyncCallback) {
	User.remove({}).exec(function (err) {
		if (err) {
			dbOpsErrorsArray.push({
				error: err,
				errortype: 'emptyUsers'
			});
		}
		emptyUsersAsyncCallback(null, 'removed all Users');
	});
};
/**
 * removes all assets from the database
 * @param  {object} err
 * @param  {Function} emptyAssetsAsyncCallback
 * @return {Function} async callback emptyAssetsAsyncCallback(err,results);
 */
var emptyAssets = function (emptyAssetsAsyncCallback) {
	Asset.remove({}).exec(function (err) {
		if (err) {
			dbOpsErrorsArray.push({
				error: err,
				errortype: 'emptyAssets'
			});
		}
		emptyAssetsAsyncCallback(null, 'removed all assets');
	});
};

/**
 * empties a database
 * @param  {object} options - filepath,limits-tags,collections,etc
 * @param  {object} emptyDBCallback
 * @return {Function} async callback emptyDBCallback(err,results);
 */
var emptyDB = function (options, emptyDBCallback) {
	/*
		// try{
		// exportSeedFilePath = (typeof options.filepath ==='string') ? path.join(options.filepath) : path.resolve(process.cwd(),defaultExportDir,defaultExportFileName);
		// }
		// catch(e){		
		// 	dbOpsErrorsArray.push({
		// 		error:e,
		// 		errortype:'exportSeedFilePath'
		// 	});
		// }
	*/
	console.log('got here');
	var setupEmptyDB = function (setupEmptyDBCallback) {
		var dataforseeds = options;
		setupEmptyDBCallback(null, dataforseeds);
	};
	async.parallel([
			setupEmptyDB,
			emptyAssets,
			emptyUsers,
			emptyContenttypes,
			emptyTags,
			emptyCategories,
			emptyItems,
			emptyCollections,
			emptyCompilations,
			emptyUserprivileges,
			emptyUserroles,
			emptyUsergroups
		],
		function (err, emptydbresult) {
			emptyDBCallback(err, {
				emptydbresult: emptydbresult,
				dbOpsErrorsArray: dbOpsErrorsArray
			});
		});
};

/**
 * exportseed module
 * @module exportseed
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
var dbOpsModule = function (resources) {
	logger = resources.logger;
	mongoose = resources.mongoose;
	appSettings = resources.settings;
	CoreController = new ControllerHelper(resources);
	CoreUtilities = new Utilities(resources);
	User = mongoose.model('User');
	Item = mongoose.model('Item');
	Asset = mongoose.model('Asset');
	Contenttype = mongoose.model('Contenttype');
	Category = mongoose.model('Category');
	Tag = mongoose.model('Tag');
	Collection = mongoose.model('Collection');
	Compilation = mongoose.model('Compilation');
	Userprivilege = mongoose.model('Userprivilege');
	Userrole = mongoose.model('Userrole');
	Usergroup = mongoose.model('Usergroup');
	return {
		emptyDB: emptyDB
	};
};

module.exports = dbOpsModule;
