'use strict';
var async = require('async'),
	fs = require('fs-extra'),
	path = require('path'),
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
	Compilation, // = mongoose.model('Compilation')
	Userprivilege, // = mongoose.model('Userprivilege')
	Userrole, // = mongoose.model('Userrole')
	Usergroup; // = mongoose.model('Usergroup');

var exportSeedFilePath,
	exportSeedErrorsArray = [],
	exportSeedData = {},
	exportSeedDataArray = [],
	item_id_name_hash = {},
	collection_id_name_hash = {},
	compilation_id_name_hash = {},
	d = new Date(),
	defaultExportDir = 'content/files/dbseeds/',
	defaultExportFileName = 'dbseed' + '-' + d.getUTCFullYear() + '-' + d.getUTCMonth() + '-' + d.getUTCDate() + '-' + d.getTime() + '.json';
/**
 * exports a seed data to seeds format
 * @param  {object} options - filepath,limits-tags,collections,etc
 * @param  {object} writeSeedToDiskCallback
 * @return {Function} async callback writeSeedToDiskCallback(err,results);
 */
var writeSeedToDisk = function (writeSeedToDiskCallback) {
	logger.warn('writeSeedToDisk exportSeedFilePath', exportSeedFilePath);
	exportSeedData.data = exportSeedDataArray;
	fs.outputJson(exportSeedFilePath, exportSeedData, function (err) {
		if (err) {
			exportSeedErrorsArray.push({
				error: err,
				errortype: 'writeSeedToDisk'
			});
		}
		writeSeedToDiskCallback(null, 'file written created');
	});
};

/**
 * return seed format for a collection.items object
 * @return {object}     collection.items[{item.name,order}]
 */
var getCompilationContentEntitiesFromDoc = function (contentEntities) {
	var contentEntitiesArray = [],
		contentEntityToAdd = {};
	if (contentEntities.length > 0) {
		for (var glcefd = 0; glcefd < contentEntities.length; glcefd++) {
			contentEntityToAdd = {};
			if (contentEntities[glcefd].entity_item) {
				contentEntityToAdd.entity_item = item_id_name_hash[contentEntities[glcefd].entity_item];
			}
			if (contentEntities[glcefd].entity_collection) {
				contentEntityToAdd.entity_collection = collection_id_name_hash[contentEntities[glcefd].entity_collection];
			}
			if (contentEntities[glcefd].additionalattributes) {
				contentEntityToAdd.additionalattributes = contentEntities[glcefd].additionalattributes;
			}
			contentEntityToAdd.entitytype = contentEntities[glcefd].entitytype;
			contentEntityToAdd.order = contentEntities[glcefd].order;
			contentEntitiesArray.push(contentEntityToAdd);
		}
	}
	return contentEntitiesArray;
};

/**
 * return seed format for a collection.items object
 * @return {object}     collection.items[{item.name,order}]
 */
var getCollectionItemsFromDoc = function (collectionitems) {
	var collectionitemsArray = [],
		collectionItemToAdd = {};
	if (collectionitems.length > 0) {
		for (var gcifd = 0; gcifd < collectionitems.length; gcifd++) {
			if (collectionitems[gcifd].item) {
				collectionItemToAdd = {
					item: item_id_name_hash[collectionitems[gcifd].item],
					order: collectionitems[gcifd].order
				};
				if (collectionitems[gcifd].additionalattributes) {
					collectionItemToAdd.additionalattributes = collectionitems[gcifd].additionalattributes;
				}

				collectionitemsArray.push(collectionItemToAdd);
			}
		}
	}
	return collectionitemsArray;
};

/**
 * return seed format for a userprivileges object
 * @return {object}     userprivileges[name]
 */
var getUserprivilegesFromDoc = function (userprivileges) {
	var userprivilegesArray = [];
	if (userprivileges.length > 0) {
		for (var guprid = 0; guprid < userprivileges.length; guprid++) {
			if (userprivileges[guprid].userprivilegeid) {
				userprivilegesArray.push(userprivileges[guprid].userprivilegeid);
			}
		}
	}
	return userprivilegesArray;
};

/**
 * return seed format for a userroles object
 * @return {object}     userroles[name]
 */
var getUserrolesFromDoc = function (userroles) {
	var userrolesArray = [];
	if (userroles.length > 0) {
		for (var gurfd = 0; gurfd < userroles.length; gurfd++) {
			if (userroles[gurfd].userroleid) {
				userrolesArray.push(userroles[gurfd].userroleid);
			}
		}
	}
	return userrolesArray;
};

/**
 * return seed format for a tags object
 * @return {object}     tags[name]
 */
var getTagsFromDoc = function (tags) {
	var tagsArray = [];
	if (tags.length > 0) {
		for (var ta = 0; ta < tags.length; ta++) {
			if (tags[ta].name) {
				tagsArray.push(tags[ta].name);
			}
		}
	}
	return tagsArray;
};

/**
 * return seed format for a authors object
 * @return {object}     authors[name]
 */
var getAuthorsFromDoc = function (authors) {
	var authorsArray = [];
	if (authors.length > 0) {
		for (var gafd = 0; gafd < authors.length; gafd++) {
			if (authors[gafd].username) {
				authorsArray.push(authors[gafd].username);
			}
		}
	}
	return authorsArray;
};

/**
 * return seed format for a categories object
 * @return {object}     categories[name]
 */
var getCategoriesFromDoc = function (categories) {
	var categoriesArray = [];
	if (categories.length > 0) {
		for (var gcfd = 0; gcfd < categories.length; gcfd++) {
			if (categories[gcfd] && categories[gcfd].name) {
				categoriesArray.push(categories[gcfd].name);
			}
		}
	}
	return categoriesArray;
};

/**
 * return seed format for a contenttypes object
 * @return {object}     contenttypes[name]
 */
var getContenttypesFromDoc = function (contenttypes) {
	var contenttypesArray = [];
	if (contenttypes.length > 0) {
		for (var gctfd = 0; gctfd < contenttypes.length; gctfd++) {
			if (contenttypes[gctfd].name) {
				contenttypesArray.push(contenttypes[gctfd].name);
			}
		}
	}
	return contenttypesArray;
};

/**
 * return seed format for a assets object
 * @return {object}     assets[name]
 */
var getAssetsFromDoc = function (assets) {
	var assetsArray = [];
	if (assets.length > 0) {
		for (var gafd = 0; gafd < assets.length; gafd++) {
			if (assets[gafd].name) {
				assetsArray.push(assets[gafd].name);
			}
		}
	}
	return assetsArray;
};

/**
 * return seed format for a primary author object
 * @return {object}     primaryauthor.name
 */
var getPrimaryAuthorFromDoc = function (primaryauthor) {
	return (primaryauthor && primaryauthor.username) ? primaryauthor.username : '';
};

/**
 * return seed format for a primary asset object
 * @return {object}     primaryasset.name
 */
var getPrimaryAssetFromDoc = function (primaryasset) {
	return (primaryasset && primaryasset.name) ? primaryasset.name : '';
};

/**
 * return seed format for an compilation object
 * @param  {object} doc mongo document
 * @return {object}     seed object
 */
var getCompilationSeed = function (doc) {
	var returnseed = {
		datatype: 'compilation',
		datadocument: {}
	};
	returnseed.datadocument.random = doc.random;
	returnseed.datadocument.title = doc.title;
	returnseed.datadocument.name = doc.name;
	returnseed.datadocument.content = doc.content;
	returnseed.datadocument.updatedat = doc.updatedat;
	returnseed.datadocument.createdat = doc.createdat;
	returnseed.datadocument.publishat = doc.publishat;
	returnseed.datadocument.entitytype = doc.entitytype;
	returnseed.datadocument.status = doc.status;

	if (typeof doc.contenttypeattributes !== 'undefined') {
		returnseed.datadocument.contenttypeattributes = doc.contenttypeattributes;
	}
	if (doc.primaryauthor) {
		returnseed.datadocument.primaryauthor = getPrimaryAuthorFromDoc(doc.primaryauthor);
	}
	if (doc.primaryasset) {
		returnseed.datadocument.primaryasset = getPrimaryAssetFromDoc(doc.primaryasset);
	}
	if (doc.contenttypeattributes) {
		returnseed.datadocument.contenttypeattributes = doc.contenttypeattributes;
	}
	if (doc.link) {
		returnseed.datadocument.link = doc.link;
	}
	if (doc.dek) {
		returnseed.datadocument.dek = doc.dek;
	}
	if (doc.changes && doc.changes.length > 0) {
		returnseed.datadocument.changes = doc.changes;
	}
	if (doc.tags && doc.tags.length > 0) {
		returnseed.datadocument.tags = getTagsFromDoc(doc.tags);
	}
	if (doc.categories && doc.categories.length > 0) {
		returnseed.datadocument.categories = getCategoriesFromDoc(doc.categories);
	}
	if (doc.contenttypes && doc.contenttypes.length > 0) {
		returnseed.datadocument.contenttypes = getContenttypesFromDoc(doc.contenttypes);
	}
	if (doc.authors && doc.authors.length > 0) {
		returnseed.datadocument.authors = getAuthorsFromDoc(doc.authors);
	}
	if (doc.assets && doc.assets.length > 0) {
		returnseed.datadocument.assets = getAssetsFromDoc(doc.assets);
	}
	if (doc.content_entities && doc.content_entities.length > 0) {
		returnseed.datadocument.content_entities = getCompilationContentEntitiesFromDoc(doc.content_entities);
	}
	if (doc.visibility) {
		returnseed.datadocument.visibility = doc.visibility;
	}
	if (doc.visibilitypassword) {
		returnseed.datadocument.visibilitypassword = doc.visibilitypassword;
	}
	if (doc.extensionattributes) {
		returnseed.datadocument.extensionattributes = doc.extensionattributes;
	}
	if (doc.originalitem) {
		returnseed.datadocument.originalitem = doc.originalitem;
	}

	return returnseed;
};

/**
 * return seed format for an collection object
 * @param  {object} doc mongo document
 * @return {object}     seed object
 */
var getCollectionSeed = function (doc) {
	var returnseed = {
		datatype: 'collection',
		datadocument: {}
	};
	returnseed.datadocument.random = doc.random;
	returnseed.datadocument.title = doc.title;
	returnseed.datadocument.name = doc.name;
	returnseed.datadocument.content = doc.content;
	returnseed.datadocument.collectionitemonly = doc.collectionitemonly;
	returnseed.datadocument.updatedat = doc.updatedat;
	returnseed.datadocument.createdat = doc.createdat;
	returnseed.datadocument.publishat = doc.publishat;
	returnseed.datadocument.entitytype = doc.entitytype;
	returnseed.datadocument.status = doc.status;

	if (typeof doc.contenttypeattributes !== 'undefined') {
		returnseed.datadocument.contenttypeattributes = doc.contenttypeattributes;
	}
	if (typeof doc.itemauthorname !== 'undefined') {
		returnseed.datadocument.itemauthorname = doc.itemauthorname;
	}
	if (doc.primaryauthor) {
		returnseed.datadocument.primaryauthor = getPrimaryAuthorFromDoc(doc.primaryauthor);
	}
	if (doc.primaryasset) {
		returnseed.datadocument.primaryasset = getPrimaryAssetFromDoc(doc.primaryasset);
	}
	if (doc.contenttypeattributes) {
		returnseed.datadocument.contenttypeattributes = doc.contenttypeattributes;
	}
	if (doc.link) {
		returnseed.datadocument.link = doc.link;
	}
	if (doc.dek) {
		returnseed.datadocument.dek = doc.dek;
	}
	if (doc.changes && doc.changes.length > 0) {
		returnseed.datadocument.changes = doc.changes;
	}
	if (doc.tags && doc.tags.length > 0) {
		returnseed.datadocument.tags = getTagsFromDoc(doc.tags);
	}
	if (doc.categories && doc.categories.length > 0) {
		returnseed.datadocument.categories = getCategoriesFromDoc(doc.categories);
	}
	if (doc.contenttypes && doc.contenttypes.length > 0) {
		returnseed.datadocument.contenttypes = getContenttypesFromDoc(doc.contenttypes);
	}
	if (doc.authors && doc.authors.length > 0) {
		returnseed.datadocument.authors = getAuthorsFromDoc(doc.authors);
	}
	if (doc.assets && doc.assets.length > 0) {
		returnseed.datadocument.assets = getAssetsFromDoc(doc.assets);
	}
	if (doc.items && doc.items.length > 0) {
		returnseed.datadocument.items = getCollectionItemsFromDoc(doc.items);
	}
	if (doc.visibility) {
		returnseed.datadocument.visibility = doc.visibility;
	}
	if (doc.visibilitypassword) {
		returnseed.datadocument.visibilitypassword = doc.visibilitypassword;
	}
	if (doc.extensionattributes) {
		returnseed.datadocument.extensionattributes = doc.extensionattributes;
	}
	if (doc.originalitem) {
		returnseed.datadocument.originalitem = doc.originalitem;
	}

	return returnseed;
};

/**
 * return seed format for an asset object
 * @param  {object} doc mongo document
 * @return {object}     seed object
 */
var getItemSeed = function (doc) {
	var returnseed = {
		datatype: 'item',
		datadocument: {}
	};
	returnseed.datadocument.random = doc.random;
	returnseed.datadocument.title = doc.title;
	returnseed.datadocument.name = doc.name;
	returnseed.datadocument.content = doc.content;
	returnseed.datadocument.collectionitemonly = doc.collectionitemonly;
	returnseed.datadocument.updatedat = doc.updatedat;
	returnseed.datadocument.createdat = doc.createdat;
	returnseed.datadocument.publishat = doc.publishat;
	returnseed.datadocument.entitytype = doc.entitytype;
	returnseed.datadocument.status = doc.status;

	if (typeof doc.contenttypeattributes !== 'undefined') {
		returnseed.datadocument.contenttypeattributes = doc.contenttypeattributes;
	}
	if (typeof doc.itemauthorname !== 'undefined') {
		returnseed.datadocument.itemauthorname = doc.itemauthorname;
	}
	if (doc.primaryauthor) {
		returnseed.datadocument.primaryauthor = getPrimaryAuthorFromDoc(doc.primaryauthor);
	}
	if (doc.primaryasset) {
		returnseed.datadocument.primaryasset = getPrimaryAssetFromDoc(doc.primaryasset);
	}
	if (doc.contenttypeattributes) {
		returnseed.datadocument.contenttypeattributes = doc.contenttypeattributes;
	}
	if (doc.link) {
		returnseed.datadocument.link = doc.link;
	}
	if (doc.changes && doc.changes.length > 0) {
		returnseed.datadocument.changes = doc.changes;
	}
	if (doc.tags && doc.tags.length > 0) {
		returnseed.datadocument.tags = getTagsFromDoc(doc.tags);
	}
	if (doc.categories && doc.categories.length > 0) {
		returnseed.datadocument.categories = getCategoriesFromDoc(doc.categories);
	}
	if (doc.contenttypes && doc.contenttypes.length > 0) {
		returnseed.datadocument.contenttypes = getContenttypesFromDoc(doc.contenttypes);
	}
	if (doc.authors && doc.authors.length > 0) {
		returnseed.datadocument.authors = getAuthorsFromDoc(doc.authors);
	}
	if (doc.assets && doc.assets.length > 0) {
		returnseed.datadocument.assets = getAssetsFromDoc(doc.assets);
	}
	if (doc.visibility) {
		returnseed.datadocument.visibility = doc.visibility;
	}
	if (doc.visibilitypassword) {
		returnseed.datadocument.visibilitypassword = doc.visibilitypassword;
	}
	if (doc.extensionattributes) {
		returnseed.datadocument.extensionattributes = doc.extensionattributes;
	}
	if (doc.originalitem) {
		returnseed.datadocument.originalitem = doc.originalitem;
	}

	return returnseed;
};

/**
 * return seed format for an category object
 * @param  {object} doc mongo document
 * @return {object}     seed object
 */
var getCategorySeed = function (doc) {
	var returnseed = {
		datatype: 'category',
		datadocument: {}
	};
	returnseed.datadocument.title = doc.title;
	returnseed.datadocument.name = doc.name;
	if (doc.content) {
		returnseed.datadocument.content = getPrimaryAuthorFromDoc(doc.content);
	}
	if (doc.dek) {
		returnseed.datadocument.dek = getPrimaryAuthorFromDoc(doc.dek);
	}
	if (doc.author) {
		returnseed.datadocument.author = getPrimaryAuthorFromDoc(doc.author);
	}
	if (doc.primaryasset) {
		returnseed.datadocument.primaryasset = getPrimaryAssetFromDoc(doc.primaryasset);
	}
	if (doc.parent && doc.parent.length > 0) {
		returnseed.datadocument.parent = getCategoriesFromDoc(doc.parent);
	}
	if (doc.contenttypes && doc.contenttypes.length > 0) {
		returnseed.datadocument.contenttypes = getContenttypesFromDoc(doc.contenttypes);
	}
	if (doc.attributes) {
		returnseed.datadocument.attributes = doc.attributes;
	}
	if (doc.contenttypeattributes) {
		returnseed.datadocument.contenttypeattributes = doc.contenttypeattributes;
	}
	if (doc.extensionattributes) {
		returnseed.datadocument.extensionattributes = doc.extensionattributes;
	}

	return returnseed;
};

/**
 * return seed format for an tag object
 * @param  {object} doc mongo document
 * @return {object}     seed object
 */
var getTagSeed = function (doc) {
	var returnseed = {
		datatype: 'tag',
		datadocument: {}
	};
	returnseed.datadocument.title = doc.title;
	returnseed.datadocument.name = doc.name;
	if (doc.content) {
		returnseed.datadocument.content = getPrimaryAuthorFromDoc(doc.content);
	}
	if (doc.dek) {
		returnseed.datadocument.dek = getPrimaryAuthorFromDoc(doc.dek);
	}
	if (doc.author) {
		returnseed.datadocument.author = getPrimaryAuthorFromDoc(doc.author);
	}
	if (doc.primaryasset) {
		returnseed.datadocument.primaryasset = getPrimaryAssetFromDoc(doc.primaryasset);
	}
	if (doc.parent && doc.parent.length > 0) {
		returnseed.datadocument.parent = getTagsFromDoc(doc.parent);
	}
	if (doc.contenttypes && doc.contenttypes.length > 0) {
		returnseed.datadocument.contenttypes = getContenttypesFromDoc(doc.contenttypes);
	}
	if (doc.attributes) {
		returnseed.datadocument.attributes = doc.attributes;
	}
	if (doc.contenttypeattributes) {
		returnseed.datadocument.contenttypeattributes = doc.contenttypeattributes;
	}
	if (doc.extensionattributes) {
		returnseed.datadocument.extensionattributes = doc.extensionattributes;
	}

	return returnseed;
};


/**
 * return seed format for an usergroup object
 * @param  {object} doc mongo document
 * @return {object}     seed object
 */
var getUsergroupSeed = function (doc) {
	var returnseed = {
		datatype: 'usergroup',
		datadocument: {}
	};
	returnseed.datadocument.usergroupid = doc.usergroupid;
	returnseed.datadocument.title = doc.title;
	returnseed.datadocument.name = doc.name;
	if (doc.author) {
		returnseed.datadocument.author = getPrimaryAuthorFromDoc(doc.author);
	}
	if (doc.description) {
		returnseed.datadocument.description = doc.description;
	}
	if (doc.extensionattributes) {
		returnseed.datadocument.extensionattributes = doc.extensionattributes;
	}
	if (doc.roles && doc.roles.length > 0) {
		returnseed.datadocument.roles = getUserrolesFromDoc(doc.roles);
	}

	return returnseed;
};

/**
 * return seed format for an userrole object
 * @param  {object} doc mongo document
 * @return {object}     seed object
 */
var getUserroleSeed = function (doc) {
	var returnseed = {
		datatype: 'userrole',
		datadocument: {}
	};
	returnseed.datadocument.userroleid = doc.userroleid;
	returnseed.datadocument.title = doc.title;
	returnseed.datadocument.name = doc.name;
	if (doc.author) {
		returnseed.datadocument.author = getPrimaryAuthorFromDoc(doc.author);
	}
	if (doc.description) {
		returnseed.datadocument.description = doc.description;
	}
	if (doc.extensionattributes) {
		returnseed.datadocument.extensionattributes = doc.extensionattributes;
	}
	if (doc.privileges && doc.privileges.length > 0) {
		returnseed.datadocument.privileges = getUserprivilegesFromDoc(doc.privileges);
	}

	return returnseed;
};


/**
 * return seed format for an userprivilege object
 * @param  {object} doc mongo document
 * @return {object}     seed object
 */
var getUserprivilegeSeed = function (doc) {
	var returnseed = {
		datatype: 'userprivilege',
		datadocument: {}
	};
	returnseed.datadocument.userprivilegeid = doc.userprivilegeid;
	returnseed.datadocument.title = doc.title;
	returnseed.datadocument.name = doc.name;
	if (doc.author) {
		returnseed.datadocument.author = getPrimaryAuthorFromDoc(doc.author);
	}
	if (doc.description) {
		returnseed.datadocument.description = doc.description;
	}
	if (doc.extensionattributes) {
		returnseed.datadocument.extensionattributes = doc.extensionattributes;
	}

	return returnseed;
};

/**
 * return seed format for an contenttype object
 * @param  {object} doc mongo document
 * @return {object}     seed object
 */
var getContenttypeSeed = function (doc) {
	var returnseed = {
		datatype: 'contenttype',
		datadocument: {}
	};
	returnseed.datadocument.title = doc.title;
	returnseed.datadocument.name = doc.name;
	if (doc.author) {
		returnseed.datadocument.author = getPrimaryAuthorFromDoc(doc.author);
	}
	if (doc.attributes && doc.attributes.length > 0) {
		returnseed.datadocument.attributes = doc.attributes;
	}
	if (doc.extensionattributes) {
		returnseed.datadocument.extensionattributes = doc.extensionattributes;
	}

	return returnseed;
};

/**
 * return seed format for an user object
 * @param  {object} doc mongo document
 * @return {object}     seed object
 */
var getUserSeed = function (doc) {
	var returnseed = {
		datatype: 'user',
		datadocument: {}
	};
	returnseed.datadocument.email = doc.email;
	if (doc.firstname) {
		returnseed.datadocument.firstname = doc.firstname;
	}
	if (doc.lastname) {
		returnseed.datadocument.lastname = doc.lastname;
	}
	if (doc.username) {
		returnseed.datadocument.username = doc.username;
	}
	if (doc.password) {
		returnseed.datadocument.password = doc.password;
	}
	if (doc.url) {
		returnseed.datadocument.url = doc.url;
	}
	if (doc.birthday) {
		returnseed.datadocument.birthday = doc.birthday;
	}
	if (doc.userid) {
		returnseed.datadocument.userid = doc.userid;
	}
	if (doc.accesstoken) {
		returnseed.datadocument.accesstoken = doc.accesstoken;
	}
	if (doc.description) {
		returnseed.datadocument.description = doc.description;
	}
	returnseed.datadocument.activated = doc.activated;
	if (doc.location) {
		returnseed.datadocument.location = doc.location;
	}
	returnseed.datadocument.updatedat = doc.updatedat;
	returnseed.datadocument.createdat = doc.createdat;
	returnseed.datadocument.accounttype = doc.accounttype;
	returnseed.datadocument.gender = doc.gender;
	if (doc.primaryasset) {
		returnseed.datadocument.primaryasset = getPrimaryAssetFromDoc(doc.primaryasset);
	}
	if (doc.coverimage) {
		returnseed.datadocument.coverimage = getPrimaryAssetFromDoc(doc.coverimage);
	}
	if (doc.assets && doc.assets.length > 0) {
		returnseed.datadocument.assets = getAssetsFromDoc(doc.assets);
	}
	if (doc.coverimages && doc.coverimages.length > 0) {
		returnseed.datadocument.coverimages = getAssetsFromDoc(doc.coverimages);
	}
	if (doc.userroles && doc.userroles.length > 0) {
		returnseed.datadocument.userroles = getUserrolesFromDoc(doc.userroles);
	}
	if (doc.apikey) {
		returnseed.datadocument.apikey = doc.apikey;
	}
	if (doc.attributes) {
		returnseed.datadocument.attributes = doc.attributes;
	}
	if (doc.extensionattributes) {
		returnseed.datadocument.extensionattributes = doc.extensionattributes;
	}
	if (doc.random) {
		returnseed.datadocument.random = doc.random;
	}

	return returnseed;
};

/**
 * return seed format for an asset object
 * @param  {object} doc mongo document
 * @return {object}     seed object
 */
var getAssetSeed = function (doc) {
	var returnseed = {
		datatype: 'asset',
		datadocument: {}
	};
	returnseed.datadocument.random = doc.random;
	if (doc.title) {
		returnseed.datadocument.title = doc.title;
	}
	returnseed.datadocument.name = doc.name;
	returnseed.datadocument.status = doc.status;
	if (doc.updatedat) {
		returnseed.datadocument.updatedat = doc.updatedat;
	}
	returnseed.datadocument.createdat = doc.createdat;
	if (doc.author) {
		returnseed.datadocument.author = getPrimaryAuthorFromDoc(doc.author);
	}
	returnseed.datadocument.entitytype = doc.entitytype;
	if (doc.userid) {
		returnseed.datadocument.userid = getPrimaryAuthorFromDoc(doc.userid);
	}
	if (doc.username) {
		returnseed.datadocument.username = getPrimaryAuthorFromDoc(doc.username);
	}
	returnseed.datadocument.assettype = doc.assettype;
	if (doc.contenttypes && doc.contenttypes.length > 0) {
		returnseed.datadocument.contenttypes = getContenttypesFromDoc(doc.contenttypes);
	}
	returnseed.datadocument.fileurl = doc.fileurl;
	returnseed.datadocument.locationtype = doc.locationtype;
	if (doc.description) {
		returnseed.datadocument.description = doc.description;
	}
	if (doc.content) {
		returnseed.datadocument.content = doc.content;
	}
	if (doc.filedata) {
		returnseed.datadocument.filedata = doc.filedata;
	}
	if (doc.attributes) {
		returnseed.datadocument.attributes = doc.attributes;
	}
	if (doc.contenttypeattributes) {
		returnseed.datadocument.contenttypeattributes = doc.contenttypeattributes;
	}
	if (doc.extensionattributes) {
		returnseed.datadocument.extensionattributes = doc.extensionattributes;
	}

	return returnseed;
};

/**
 * create compilation seeds from the database, if there are compilations
 * @param  {object} err
 * @param  {Function} createCompilationSeedsAsyncCallback
 * @return {Function} async callback createCompilationSeedsAsyncCallback(err,results);
 */
var createCompilationSeeds = function (createCompilationSeedsAsyncCallback) {
	Compilation.find({}).select('-_id -__v').populate('tags categories assets primaryasset authors contenttypes content_entities primaryauthor').exec(function (err, Compilations) {
		if (err) {
			exportSeedErrorsArray.push({
				error: err,
				errortype: 'createCompilationSeeds'
			});
		}
		if (Compilations) {
			for (var i in Compilations) {
				var compilationdoc = Compilations[i];
				compilation_id_name_hash[Compilations[i]._id] = Compilations[i].name;
				exportSeedDataArray.push(getCompilationSeed(compilationdoc));
			}
		}
		createCompilationSeedsAsyncCallback(null, 'created compilation seeds');
	});
};

/**
 * create collection seeds from the database, if there are collections
 * @param  {object} err
 * @param  {Function} createCollectionSeedsAsyncCallback
 * @return {Function} async callback createCollectionSeedsAsyncCallback(err,results);
 */
var createCollectionSeeds = function (createCollectionSeedsAsyncCallback) {
	Collection.find({}).select('-__v').populate('tags categories assets primaryasset authors contenttypes items primaryauthor').exec(function (err, Collections) {
		if (err) {
			exportSeedErrorsArray.push({
				error: err,
				errortype: 'createCollectionSeeds'
			});
		}
		if (Collections) {
			for (var i in Collections) {
				var collectiondoc = Collections[i];
				collection_id_name_hash[Collections[i]._id] = Collections[i].name;
				exportSeedDataArray.push(getCollectionSeed(collectiondoc));
			}
		}
		createCollectionSeedsAsyncCallback(null, 'created collection seeds');
	});
};

/**
 * create item seeds from the database, if there are assets
 * @param  {object} err
 * @param  {Function} createItemSeedsAsyncCallback
 * @return {Function} async callback createItemSeedsAsyncCallback(err,results);
 */
var createItemSeeds = function (createItemSeedsAsyncCallback) {
	Item.find({}).select('-__v').populate('tags categories assets primaryasset authors contenttypes primaryauthor').exec(function (err, Items) {
		if (err) {
			exportSeedErrorsArray.push({
				error: err,
				errortype: 'createItemSeeds'
			});
		}
		if (Items) {
			for (var i in Items) {
				var itemdoc = Items[i];
				item_id_name_hash[Items[i]._id] = Items[i].name;
				exportSeedDataArray.push(getItemSeed(itemdoc));
			}
		}
		createItemSeedsAsyncCallback(null, 'created item seeds');
	});
};

/**
 * create category seeds from the database, if there are categories
 * @param  {object} err
 * @param  {Function} createCategorySeedsAsyncCallback
 * @return {Function} async callback createCategorySeedsAsyncCallback(err,results);
 */
var createCategorySeeds = function (createCategorySeedsAsyncCallback) {
	Category.find({}).select('-_id -__v').populate('author primary asset parent contenttypes').exec(function (err, Categorys) {
		if (err) {
			exportSeedErrorsArray.push({
				error: err,
				errortype: 'createCategorySeeds'
			});
		}
		if (Categorys) {
			for (var i in Categorys) {
				var categorydoc = Categorys[i];
				exportSeedDataArray.push(getCategorySeed(categorydoc));
			}
		}
		createCategorySeedsAsyncCallback(null, 'created category seeds');
	});
};

/**
 * create tag seeds from the database, if there are assets
 * @param  {object} err
 * @param  {Function} createTagSeedsAsyncCallback
 * @return {Function} async callback createTagSeedsAsyncCallback(err,results);
 */
var createTagSeeds = function (createTagSeedsAsyncCallback) {
	Tag.find({}).select('-_id -__v').populate('author primary asset parent contenttypes').exec(function (err, Tags) {
		if (err) {
			exportSeedErrorsArray.push({
				error: err,
				errortype: 'createTagSeeds'
			});
		}
		if (Tags) {
			for (var i in Tags) {
				var tagdoc = Tags[i];
				exportSeedDataArray.push(getTagSeed(tagdoc));
			}
		}
		createTagSeedsAsyncCallback(null, 'created tag seeds');
	});
};

/**
 * create usergroup seeds from the database, if there are assets
 * @param  {object} err
 * @param  {Function} createUsergroupSeedsAsyncCallback
 * @return {Function} async callback createUsergroupSeedsAsyncCallback(err,results);
 */
var createUsergroupSeeds = function (createUsergroupSeedsAsyncCallback) {
	Usergroup.find({}).select('-_id -__v').populate('author roles').exec(function (err, Usergroups) {
		if (err) {
			exportSeedErrorsArray.push({
				error: err,
				errortype: 'createUsergroupSeeds'
			});
		}
		if (Usergroups) {
			for (var i in Usergroups) {
				var usergroupdoc = Usergroups[i];
				exportSeedDataArray.push(getUsergroupSeed(usergroupdoc));
			}
		}
		createUsergroupSeedsAsyncCallback(null, 'created usergroup seeds');
	});
};

/**
 * create userrole seeds from the database, if there are assets
 * @param  {object} err
 * @param  {Function} createUserroleSeedsAsyncCallback
 * @return {Function} async callback createUserroleSeedsAsyncCallback(err,results);
 */
var createUserroleSeeds = function (createUserroleSeedsAsyncCallback) {
	Userrole.find({}).select('-_id -__v').populate('author privileges').exec(function (err, Userroles) {
		if (err) {
			exportSeedErrorsArray.push({
				error: err,
				errortype: 'createUserroleSeeds'
			});
		}
		if (Userroles) {
			for (var i in Userroles) {
				var userroledoc = Userroles[i];
				exportSeedDataArray.push(getUserroleSeed(userroledoc));
			}
		}
		createUserroleSeedsAsyncCallback(null, 'created userrole seeds');
	});
};

/**
 * create userprivilege seeds from the database, if there are assets
 * @param  {object} err
 * @param  {Function} createUserprivilegeSeedsAsyncCallback
 * @return {Function} async callback createUserprivilegeSeedsAsyncCallback(err,results);
 */
var createUserprivilegeSeeds = function (createUserprivilegeSeedsAsyncCallback) {
	Userprivilege.find({}).select('-_id -__v').populate('author').exec(function (err, Userprivileges) {
		if (err) {
			exportSeedErrorsArray.push({
				error: err,
				errortype: 'createUserprivilegeSeeds'
			});
		}
		if (Userprivileges) {
			for (var i in Userprivileges) {
				var userprivilegedoc = Userprivileges[i];
				exportSeedDataArray.push(getUserprivilegeSeed(userprivilegedoc));
			}
		}
		createUserprivilegeSeedsAsyncCallback(null, 'created userprivilege seeds');
	});
};

/**
 * create contenttype seeds from the database, if there are assets
 * @param  {object} err
 * @param  {Function} createContenttypeSeedsAsyncCallback
 * @return {Function} async callback createContenttypeSeedsAsyncCallback(err,results);
 */
var createContenttypeSeeds = function (createContenttypeSeedsAsyncCallback) {
	Contenttype.find({}).select('-_id -__v').populate('author').exec(function (err, Contenttypes) {
		if (err) {
			exportSeedErrorsArray.push({
				error: err,
				errortype: 'createContenttypeSeeds'
			});
		}
		if (Contenttypes) {
			for (var i in Contenttypes) {
				var contenttypedoc = Contenttypes[i];
				exportSeedDataArray.push(getContenttypeSeed(contenttypedoc));
			}
		}
		createContenttypeSeedsAsyncCallback(null, 'created contenttype seeds');
	});
};

/**
 * create asset seeds from the database, if there are assets
 * @param  {object} err
 * @param  {Function} createAssetSeedsAsyncCallback
 * @return {Function} async callback createAssetSeedsAsyncCallback(err,results);
 */
var createAssetSeeds = function (createAssetSeedsAsyncCallback) {
	Asset.find({}).select('-_id -__v').populate('author contenttypes').exec(function (err, Assets) {
		if (err) {
			exportSeedErrorsArray.push({
				error: err,
				errortype: 'createAssetSeeds'
			});
		}
		if (Assets) {
			for (var a in Assets) {
				var assetdoc = Assets[a];
				exportSeedDataArray.push(getAssetSeed(assetdoc));
			}
		}
		createAssetSeedsAsyncCallback(null, 'created asset seeds');
	});
};

/**
 * create user seeds from the database, if there are users
 * @param  {object} err
 * @param  {Function} createUserSeedsAsyncCallback
 * @return {Function} async callback createUserSeedsAsyncCallback(err,results);
 */
var createUserSeeds = function (createUserSeedsAsyncCallback) {
	User.find({}).select('-_id -__v').populate('assets primaryasset coverimages coverimage userroles').exec(function (err, Users) {
		if (err) {
			exportSeedErrorsArray.push({
				error: err,
				errortype: 'createUserSeeds'
			});
		}
		if (Users) {
			for (var a in Users) {
				var userdoc = Users[a];
				exportSeedDataArray.push(getUserSeed(userdoc));
			}
		}
		createUserSeedsAsyncCallback(null, 'created user seeds');
	});
};

/**
 * exports a models to seeds format
 * @param  {object} options - filepath,limits-tags,collections,etc
 * @param  {object} createSeedsCallback
 * @return {Function} async callback createSeedsCallback(err,results);
 */
var createSeeds = function (seedoptions, createSeedsCallback) {
	exportSeedData = {
		data: seedoptions
	};

	async.series([
			createUserprivilegeSeeds,
			createUserroleSeeds,
			createUsergroupSeeds,
			createAssetSeeds,
			createUserSeeds,
			createContenttypeSeeds,
			createTagSeeds,
			createCategorySeeds,
			createItemSeeds,
			createCollectionSeeds,
			createCompilationSeeds
		],
		function (err) {
			createSeedsCallback(err);
		});
};

/**
 * exports a database seed to disk
 * @param  {object} options - filepath,limits-tags,collections,etc
 * @param  {object} exportSeedCallback
 * @return {Function} async callback exportSeedCallback(err,results);
 */
var exportSeed = function (options, exportSeedCallback) {
	try {
		exportSeedFilePath = (typeof options.filepath === 'string') ? path.join(options.filepath) : path.resolve(process.cwd(), defaultExportDir, defaultExportFileName);
	}
	catch (e) {
		exportSeedErrorsArray.push({
			error: e,
			errortype: 'exportSeedFilePath'
		});
	}

	var setupSeedExport = function (setupSeedExportCallback) {
		var dataforseeds = options;
		setupSeedExportCallback(null, dataforseeds);
	};
	async.waterfall([
			setupSeedExport,
			createSeeds,
			writeSeedToDisk
		],
		function (err, exportseedresult) {
			exportSeedCallback(err, {
				exportseedresult: exportseedresult,
				exportSeedFilePath: exportSeedFilePath,
				numOfSeeds: exportSeedDataArray.length,
				exportSeedErrorsArray: exportSeedErrorsArray
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
var exportSeedModule = function (resources) {
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
		exportSeed: exportSeed,
		createSeeds: createSeeds,
		writeSeedToDisk: writeSeedToDisk
	};
};

module.exports = exportSeedModule;
