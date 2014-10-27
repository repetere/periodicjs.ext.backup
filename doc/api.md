#Index

**Modules**

* [periodicjs.ext.dbseed](#periodicjs.ext.module_dbseed)
* [dbseedController](#module_dbseedController)

**Functions**

* [seedUserGroupRolePrivilegeData(options)](#seedUserGroupRolePrivilegeData)
* [seedItemData(options)](#seedItemData)
* [seedCollectionData(options)](#seedCollectionData)
* [seedUserData(options)](#seedUserData)
* [seedAssetData(options)](#seedAssetData)
* [seedContenttypeData(options)](#seedContenttypeData)
* [seedCategoryData(options)](#seedCategoryData)
* [seedTagData(options)](#seedTagData)
* [returnSeedDocumentObjectError(options)](#returnSeedDocumentObjectError)
* [setSeedDataUsergroup(options)](#setSeedDataUsergroup)
* [setSeedDataUserole(options)](#setSeedDataUserole)
* [setSeedDataUserprivilege(options)](#setSeedDataUserprivilege)
* [setSeedDataAsset(options)](#setSeedDataAsset)
* [setSeedDataUser(options)](#setSeedDataUser)
* [setSeedDataContentype(options)](#setSeedDataContentype)
* [setSeedDataCategory(options)](#setSeedDataCategory)
* [setSeedDataTag(options)](#setSeedDataTag)
* [setSeedDataItem(options)](#setSeedDataItem)
* [setSeedDataCollection(options)](#setSeedDataCollection)
* [setSeedObjectArrays(options, callback)](#setSeedObjectArrays)
* [getCollectionIdsFromCollectionArray(getCollectionIdsFromCollectionArrayAsyncCallBack)](#getCollectionIdsFromCollectionArray)
* [getItemIdsFromItemArray(getItemIdsFromItemArrayAsyncCallBack)](#getItemIdsFromItemArray)
* [getTagIdsFromTagArray(getTagIdsFromTagArrayAsyncCallBack)](#getTagIdsFromTagArray)
* [getCategoryIdsFromCategoryArray(getCategoryIdsFromCategoryArrayAsyncCallBack)](#getCategoryIdsFromCategoryArray)
* [getContenttypeIdsFromContenttypeArray(getContenttypeIdsFromContenttypeArrayAsyncCallBack)](#getContenttypeIdsFromContenttypeArray)
* [getTaxonomyIdsFromTaxonomiesArrays(getTaxonomyIdsFromTaxonomiesArraysAsyncCallBack)](#getTaxonomyIdsFromTaxonomiesArrays)
* [getUsersIdsFromUserNameArray(getUsersIdsFromUserNameArrayAsyncCallBack)](#getUsersIdsFromUserNameArray)
* [getAssetIdsFromAssetNameArray(asyncCallBack)](#getAssetIdsFromAssetNameArray)
* [insertContentIntoDatabase(insertContentIntoDatabaseAsyncCallBack)](#insertContentIntoDatabase)
* [insertAssetsIntoDatabase(asyncCallBack)](#insertAssetsIntoDatabase)
* [getUsergroupsIdsFromUsergroupsIdArray(getUsergroupsIdsFromUsergroupsIdArrayasyncCallBack)](#getUsergroupsIdsFromUsergroupsIdArray)
* [getUserroleIdsFromUserroleIdArray(asyncCallBack)](#getUserroleIdsFromUserroleIdArray)
* [getUserprivilegeIdsFromUserPrivilegeIdArray(asyncCallBack)](#getUserprivilegeIdsFromUserPrivilegeIdArray)
* [insertUACIntoDatabase(asyncCallBack)](#insertUACIntoDatabase)
* [insertDataIntoDatabase(seedObjectsArrayStatus, insertDataIntoDatabaseCallback)](#insertDataIntoDatabase)
* [isValidSeedJSONSync(options)](#isValidSeedJSONSync)
* [importSeed(options, callback)](#importSeed)
* [index(req, res)](#index)

**Members**

* [UsersObj](#UsersObj)
 
<a name="periodicjs.ext.module_dbseed"></a>
#periodicjs.ext.dbseed
An extension to import json seeds into periodic mongodb.

**Params**

- periodic `object` - variable injection of resources from current periodic instance  

**Author**: Yaw Joseph Etse  
**License**: MIT  
**Copyright**: Copyright (c) 2014 Typesettin. All rights reserved.  
<a name="module_dbseedController"></a>
#dbseedController
dbseed controller

**Params**

- resources `object` - variable injection from current periodic instance with references to the active logger and mongo session  

**Returns**: `object` - dbseed  
**Author**: Yaw Joseph Etse  
**License**: MIT  
**Copyright**: Copyright (c) 2014 Typesettin. All rights reserved.  
<a name="seedUserGroupRolePrivilegeData"></a>
#seedUserGroupRolePrivilegeData(options)
create seed {Userprivilege|Userrole|Usergroup} Object

**Params**

- options `object` - seeddocument  

**Returns**: `object` - {doc-{Userprivilege|Userrole|Usergroup},docs_namehash - {Userprivilege|Userrole|Usergroup}.name,err}  
<a name="seedItemData"></a>
#seedItemData(options)
create seed Item Object

**Params**

- options `object` - seeddocument  

**Returns**: `object` - {doc-Item,docs_namehash - Item.name,err}  
<a name="seedCollectionData"></a>
#seedCollectionData(options)
create seed Collection Object

**Params**

- options `object` - seeddocument  

**Returns**: `object` - {doc-Collection,docs_namehash - Collection.name,err}  
<a name="seedUserData"></a>
#seedUserData(options)
create seed User Object

**Params**

- options `object` - seeddocument  

**Returns**: `object` - {doc-User,docs_namehash - User.name,err}  
<a name="seedAssetData"></a>
#seedAssetData(options)
create seed Asset Object

**Params**

- options `object` - seeddocument  

**Returns**: `object` - {doc-Asset,docs_namehash - Asset.name,err}  
<a name="seedContenttypeData"></a>
#seedContenttypeData(options)
create seed Contenttype Object

**Params**

- options `object` - seeddocument  

**Returns**: `object` - {doc-Contenttype,docs_namehash - Contenttype.name,err}  
<a name="seedCategoryData"></a>
#seedCategoryData(options)
create seed Category Object

**Params**

- options `object` - seeddocument  

**Returns**: `object` - {doc-category,docs_namehash - category.name,err}  
<a name="seedTagData"></a>
#seedTagData(options)
create seed Tag Object

**Params**

- options `object` - seeddocument  

**Returns**: `object` - {doc-tag,docs_namehash - tag.name,err}  
<a name="returnSeedDocumentObjectError"></a>
#returnSeedDocumentObjectError(options)
returns object that has error information

**Params**

- options `object` - index,document,errormsg  

**Returns**: `object` - error object{docuemntindex,seed,error};  
<a name="setSeedDataUsergroup"></a>
#setSeedDataUsergroup(options)
set seed data object for looking up and inserting usergroups

**Params**

- options `type` - index,seedobject  

<a name="setSeedDataUserole"></a>
#setSeedDataUserole(options)
set seed data object for looking up and inserting userroless

**Params**

- options `type` - index,seedobject  

<a name="setSeedDataUserprivilege"></a>
#setSeedDataUserprivilege(options)
set seed data object for looking up and inserting userprivileges

**Params**

- options `type` - index,seedobject  

<a name="setSeedDataAsset"></a>
#setSeedDataAsset(options)
set seed data object for looking up and inserting assets

**Params**

- options `type` - index,seedobject  

<a name="setSeedDataUser"></a>
#setSeedDataUser(options)
set seed data object for looking up and inserting users

**Params**

- options `type` - index,seedobject  

<a name="setSeedDataContentype"></a>
#setSeedDataContentype(options)
set seed data object for looking up and inserting contentypes

**Params**

- options `type` - index,seedobject  

<a name="setSeedDataCategory"></a>
#setSeedDataCategory(options)
set seed data object for looking up and inserting categories

**Params**

- options `type` - index,seedobject  

<a name="setSeedDataTag"></a>
#setSeedDataTag(options)
set seed data object for looking up and inserting tags

**Params**

- options `type` - index,seedobject  

<a name="setSeedDataItem"></a>
#setSeedDataItem(options)
set seed data object for looking up and inserting items

**Params**

- options `type` - index,seedobject  

<a name="setSeedDataCollection"></a>
#setSeedDataCollection(options)
set seed data object for looking up and inserting collections

**Params**

- options `type` - index,seedobject  

<a name="setSeedObjectArrays"></a>
#setSeedObjectArrays(options, callback)
iterates through seed documents and set up arrays for inserting into database and creates name hashes to look up the values later

**Params**

- options `object` - documents,jsondata  
- callback `object`  

**Returns**: `function` - async callback (err,results);  
<a name="getCollectionIdsFromCollectionArray"></a>
#getCollectionIdsFromCollectionArray(getCollectionIdsFromCollectionArrayAsyncCallBack)
insert collections into database, update Collections_namehash array, also update author in collection

**Params**

- getCollectionIdsFromCollectionArrayAsyncCallBack `function`  

**Returns**: `function` - async callback getCollectionIdsFromCollectionArrayAsyncCallBack(err,results);  
<a name="getItemIdsFromItemArray"></a>
#getItemIdsFromItemArray(getItemIdsFromItemArrayAsyncCallBack)
insert items into database, update Items_namehash array, also update author in item

**Params**

- getItemIdsFromItemArrayAsyncCallBack `function`  

**Returns**: `function` - async callback getItemIdsFromItemArrayAsyncCallBack(err,results);  
<a name="getTagIdsFromTagArray"></a>
#getTagIdsFromTagArray(getTagIdsFromTagArrayAsyncCallBack)
insert tags into database, update Tags_namehash array, also update author in tag

**Params**

- getTagIdsFromTagArrayAsyncCallBack `function`  

**Returns**: `function` - async callback getTagIdsFromTagArrayAsyncCallBack(err,results);  
<a name="getCategoryIdsFromCategoryArray"></a>
#getCategoryIdsFromCategoryArray(getCategoryIdsFromCategoryArrayAsyncCallBack)
insert categories into database, update Categories_namehash array, also update author in category

**Params**

- getCategoryIdsFromCategoryArrayAsyncCallBack `function`  

**Returns**: `function` - async callback getCategoryIdsFromCategoryArrayAsyncCallBack(err,results);  
<a name="getContenttypeIdsFromContenttypeArray"></a>
#getContenttypeIdsFromContenttypeArray(getContenttypeIdsFromContenttypeArrayAsyncCallBack)
insert contentypes into database, update Contenttypes_namehash array, also update author in contenttype

**Params**

- getContenttypeIdsFromContenttypeArrayAsyncCallBack `function`  

**Returns**: `function` - async callback getContenttypeIdsFromContenttypeArrayAsyncCallBack(err,results);  
<a name="getTaxonomyIdsFromTaxonomiesArrays"></a>
#getTaxonomyIdsFromTaxonomiesArrays(getTaxonomyIdsFromTaxonomiesArraysAsyncCallBack)
insert tags,categories,contentypes into database, update hash arrays

**Params**

- getTaxonomyIdsFromTaxonomiesArraysAsyncCallBack `function`  

**Returns**: `function` - async callback getTaxonomyIdsFromTaxonomiesArraysAsyncCallBack(err,results);  
<a name="getUsersIdsFromUserNameArray"></a>
#getUsersIdsFromUserNameArray(getUsersIdsFromUserNameArrayAsyncCallBack)
insert users into the database, then put users with hashes in Users_namehash, put the authors in the

**Params**

- getUsersIdsFromUserNameArrayAsyncCallBack `function`  

**Returns**: `function` - async callback getUsersIdsFromUserNameArrayAsyncCallBack(err,results);  
<a name="getAssetIdsFromAssetNameArray"></a>
#getAssetIdsFromAssetNameArray(asyncCallBack)
insert asset items into the database, if there are assets, put the authors in the

**Params**

- asyncCallBack `function`  

**Returns**: `function` - async callback asyncCallBack(err,results);  
<a name="insertContentIntoDatabase"></a>
#insertContentIntoDatabase(insertContentIntoDatabaseAsyncCallBack)
insert uac items into the database
Assets
     |
     -> Users
         |
         -> Contenttypes
         -> Categories
         -> Tags
             |
             -> Items
                 |
                 ->Collections

**Params**

- insertContentIntoDatabaseAsyncCallBack `function`  

**Returns**: `function` - async callback insertContentIntoDatabaseAsyncCallBack(err,results);  
<a name="insertAssetsIntoDatabase"></a>
#insertAssetsIntoDatabase(asyncCallBack)
insert asset items into the database, if there are assets, put the authors in the

**Params**

- asyncCallBack `function`  

**Returns**: `function` - async callback asyncCallBack(err,results);  
<a name="getUsergroupsIdsFromUsergroupsIdArray"></a>
#getUsergroupsIdsFromUsergroupsIdArray(getUsergroupsIdsFromUsergroupsIdArrayasyncCallBack)
create user groups and add roles from Userroles_namehash

**Params**

- getUsergroupsIdsFromUsergroupsIdArrayasyncCallBack `function`  

**Returns**: `function` - async callback getUsergroupsIdsFromUsergroupsIdArrayasyncCallBack(err,results);  
<a name="getUserroleIdsFromUserroleIdArray"></a>
#getUserroleIdsFromUserroleIdArray(asyncCallBack)
create user roles and add privileges from Userprivileges_namehash

**Params**

- asyncCallBack `function`  

**Returns**: `function` - async callback asyncCallBack(err,results);  
<a name="getUserprivilegeIdsFromUserPrivilegeIdArray"></a>
#getUserprivilegeIdsFromUserPrivilegeIdArray(asyncCallBack)
insert user privileges into database and add new privileges into the Userprivileges_namehash { userprivilegeid : _id }

**Params**

- asyncCallBack `function`  

**Returns**: `function` - async callback asyncCallBack(err,results);  
<a name="insertUACIntoDatabase"></a>
#insertUACIntoDatabase(asyncCallBack)
insert uac items into the database
privileges
      |
      -> roles
          |
          -> groups

**Params**

- asyncCallBack `function`  

**Returns**: `function` - async callback asyncCallBack(err,results);  
<a name="insertDataIntoDatabase"></a>
#insertDataIntoDatabase(seedObjectsArrayStatus, insertDataIntoDatabaseCallback)
insert content and uac items into the database

**Params**

- seedObjectsArrayStatus `object` - async result of seedObjectArray Function  
- insertDataIntoDatabaseCallback `object`  

**Returns**: `function` - async callback insertDataIntoDatabaseCallback(err,results);  
<a name="isValidSeedJSONSync"></a>
#isValidSeedJSONSync(options)
checks for valid seed json document

**Params**

- options `object` - jsondata  

**Returns**: `object` - errors;  
<a name="importSeed"></a>
#importSeed(options, callback)
imports seed data into the database

**Params**

- options `object` - upsert,jsondata  
- callback `object`  

**Returns**: `function` - async callback (err,results);  
<a name="index"></a>
#index(req, res)
uploads seeds via admin interface

**Params**

- req `object`  
- res `object`  

**Returns**: `object` - responds with dbseed page  
<a name="UsersObj"></a>
#UsersObj
User - Mongoose Model 'User'
UserObj - Seed Object for a 'User'
Users - Array Of User Object Seeds Documents from Seed File
Users_namehash - hash of {name:id} to look up Users by name and insert the object id into the document for population
Users_namehash_array - Array of username (or document names), to query mongoose to associate objectIds with later

