const { queryRef, executeQuery, validateArgsWithOptions, mutationRef, executeMutation, validateArgs } = require('firebase/data-connect');

const Category = {
  NATIONAL_ID: "NATIONAL_ID",
  DRIVING_LICENSE: "DRIVING_LICENSE",
  WALLET: "WALLET",
  KEYS: "KEYS",
  OTHER: "OTHER",
}
exports.Category = Category;

const ItemStatus = {
  ACTIVE: "ACTIVE",
  CLAIMED: "CLAIMED",
  EXPIRED: "EXPIRED",
  RESOLVED: "RESOLVED",
}
exports.ItemStatus = ItemStatus;

const ItemType = {
  FOUND: "FOUND",
  LOST: "LOST",
}
exports.ItemType = ItemType;

const Role = {
  USER: "USER",
  ADMIN: "ADMIN",
}
exports.Role = Role;

const connectorConfig = {
  connector: 'default',
  service: 'lost-it-found-it',
  location: 'us-central1'
};
exports.connectorConfig = connectorConfig;

const upsertUserRef = (dcOrVars, vars) => {
  const { dc: dcInstance, vars: inputVars} = validateArgs(connectorConfig, dcOrVars, vars, true);
  dcInstance._useGeneratedSdk();
  return mutationRef(dcInstance, 'UpsertUser', inputVars);
}
upsertUserRef.operationName = 'UpsertUser';
exports.upsertUserRef = upsertUserRef;

exports.upsertUser = function upsertUser(dcOrVars, vars) {
  const { dc: dcInstance, vars: inputVars } = validateArgs(connectorConfig, dcOrVars, vars, true);
  return executeMutation(upsertUserRef(dcInstance, inputVars));
}
;

const createFoundItemRef = (dcOrVars, vars) => {
  const { dc: dcInstance, vars: inputVars} = validateArgs(connectorConfig, dcOrVars, vars, true);
  dcInstance._useGeneratedSdk();
  return mutationRef(dcInstance, 'CreateFoundItem', inputVars);
}
createFoundItemRef.operationName = 'CreateFoundItem';
exports.createFoundItemRef = createFoundItemRef;

exports.createFoundItem = function createFoundItem(dcOrVars, vars) {
  const { dc: dcInstance, vars: inputVars } = validateArgs(connectorConfig, dcOrVars, vars, true);
  return executeMutation(createFoundItemRef(dcInstance, inputVars));
}
;

const createLostItemRef = (dcOrVars, vars) => {
  const { dc: dcInstance, vars: inputVars} = validateArgs(connectorConfig, dcOrVars, vars, true);
  dcInstance._useGeneratedSdk();
  return mutationRef(dcInstance, 'CreateLostItem', inputVars);
}
createLostItemRef.operationName = 'CreateLostItem';
exports.createLostItemRef = createLostItemRef;

exports.createLostItem = function createLostItem(dcOrVars, vars) {
  const { dc: dcInstance, vars: inputVars } = validateArgs(connectorConfig, dcOrVars, vars, true);
  return executeMutation(createLostItemRef(dcInstance, inputVars));
}
;

const updateItemStatusRef = (dcOrVars, vars) => {
  const { dc: dcInstance, vars: inputVars} = validateArgs(connectorConfig, dcOrVars, vars, true);
  dcInstance._useGeneratedSdk();
  return mutationRef(dcInstance, 'UpdateItemStatus', inputVars);
}
updateItemStatusRef.operationName = 'UpdateItemStatus';
exports.updateItemStatusRef = updateItemStatusRef;

exports.updateItemStatus = function updateItemStatus(dcOrVars, vars) {
  const { dc: dcInstance, vars: inputVars } = validateArgs(connectorConfig, dcOrVars, vars, true);
  return executeMutation(updateItemStatusRef(dcInstance, inputVars));
}
;

const createVerificationRef = (dcOrVars, vars) => {
  const { dc: dcInstance, vars: inputVars} = validateArgs(connectorConfig, dcOrVars, vars, true);
  dcInstance._useGeneratedSdk();
  return mutationRef(dcInstance, 'CreateVerification', inputVars);
}
createVerificationRef.operationName = 'CreateVerification';
exports.createVerificationRef = createVerificationRef;

exports.createVerification = function createVerification(dcOrVars, vars) {
  const { dc: dcInstance, vars: inputVars } = validateArgs(connectorConfig, dcOrVars, vars, true);
  return executeMutation(createVerificationRef(dcInstance, inputVars));
}
;

const createHandoverSessionRef = (dcOrVars, vars) => {
  const { dc: dcInstance, vars: inputVars} = validateArgs(connectorConfig, dcOrVars, vars, true);
  dcInstance._useGeneratedSdk();
  return mutationRef(dcInstance, 'CreateHandoverSession', inputVars);
}
createHandoverSessionRef.operationName = 'CreateHandoverSession';
exports.createHandoverSessionRef = createHandoverSessionRef;

exports.createHandoverSession = function createHandoverSession(dcOrVars, vars) {
  const { dc: dcInstance, vars: inputVars } = validateArgs(connectorConfig, dcOrVars, vars, true);
  return executeMutation(createHandoverSessionRef(dcInstance, inputVars));
}
;

const createEscrowTransactionRef = (dcOrVars, vars) => {
  const { dc: dcInstance, vars: inputVars} = validateArgs(connectorConfig, dcOrVars, vars, true);
  dcInstance._useGeneratedSdk();
  return mutationRef(dcInstance, 'CreateEscrowTransaction', inputVars);
}
createEscrowTransactionRef.operationName = 'CreateEscrowTransaction';
exports.createEscrowTransactionRef = createEscrowTransactionRef;

exports.createEscrowTransaction = function createEscrowTransaction(dcOrVars, vars) {
  const { dc: dcInstance, vars: inputVars } = validateArgs(connectorConfig, dcOrVars, vars, true);
  return executeMutation(createEscrowTransactionRef(dcInstance, inputVars));
}
;

const listActiveItemsRef = (dcOrVars, vars) => {
  const { dc: dcInstance, vars: inputVars} = validateArgs(connectorConfig, dcOrVars, vars);
  dcInstance._useGeneratedSdk();
  return queryRef(dcInstance, 'ListActiveItems', inputVars);
}
listActiveItemsRef.operationName = 'ListActiveItems';
exports.listActiveItemsRef = listActiveItemsRef;

exports.listActiveItems = function listActiveItems(dcOrVars, varsOrOptions, options) {
  
  const { dc: dcInstance, vars: inputVars, options: inputOpts } = validateArgsWithOptions(connectorConfig, dcOrVars, varsOrOptions, options, true, false);
  return executeQuery(listActiveItemsRef(dcInstance, inputVars), inputOpts && { fetchPolicy: inputOpts.fetchPolicy });
}
;

const searchItemsRef = (dcOrVars, vars) => {
  const { dc: dcInstance, vars: inputVars} = validateArgs(connectorConfig, dcOrVars, vars, true);
  dcInstance._useGeneratedSdk();
  return queryRef(dcInstance, 'SearchItems', inputVars);
}
searchItemsRef.operationName = 'SearchItems';
exports.searchItemsRef = searchItemsRef;

exports.searchItems = function searchItems(dcOrVars, varsOrOptions, options) {
  
  const { dc: dcInstance, vars: inputVars, options: inputOpts } = validateArgsWithOptions(connectorConfig, dcOrVars, varsOrOptions, options, true, true);
  return executeQuery(searchItemsRef(dcInstance, inputVars), inputOpts && { fetchPolicy: inputOpts.fetchPolicy });
}
;

const getItemRef = (dcOrVars, vars) => {
  const { dc: dcInstance, vars: inputVars} = validateArgs(connectorConfig, dcOrVars, vars, true);
  dcInstance._useGeneratedSdk();
  return queryRef(dcInstance, 'GetItem', inputVars);
}
getItemRef.operationName = 'GetItem';
exports.getItemRef = getItemRef;

exports.getItem = function getItem(dcOrVars, varsOrOptions, options) {
  
  const { dc: dcInstance, vars: inputVars, options: inputOpts } = validateArgsWithOptions(connectorConfig, dcOrVars, varsOrOptions, options, true, true);
  return executeQuery(getItemRef(dcInstance, inputVars), inputOpts && { fetchPolicy: inputOpts.fetchPolicy });
}
;

const getCurrentUserRef = (dcOrVars, vars) => {
  const { dc: dcInstance, vars: inputVars} = validateArgs(connectorConfig, dcOrVars, vars, true);
  dcInstance._useGeneratedSdk();
  return queryRef(dcInstance, 'GetCurrentUser', inputVars);
}
getCurrentUserRef.operationName = 'GetCurrentUser';
exports.getCurrentUserRef = getCurrentUserRef;

exports.getCurrentUser = function getCurrentUser(dcOrVars, varsOrOptions, options) {
  
  const { dc: dcInstance, vars: inputVars, options: inputOpts } = validateArgsWithOptions(connectorConfig, dcOrVars, varsOrOptions, options, true, true);
  return executeQuery(getCurrentUserRef(dcInstance, inputVars), inputOpts && { fetchPolicy: inputOpts.fetchPolicy });
}
;

const getMyFoundItemsRef = (dc) => {
  const { dc: dcInstance} = validateArgs(connectorConfig, dc, undefined);
  dcInstance._useGeneratedSdk();
  return queryRef(dcInstance, 'GetMyFoundItems');
}
getMyFoundItemsRef.operationName = 'GetMyFoundItems';
exports.getMyFoundItemsRef = getMyFoundItemsRef;

exports.getMyFoundItems = function getMyFoundItems(dcOrOptions, options) {
  
  const { dc: dcInstance, vars: inputVars, options: inputOpts } = validateArgsWithOptions(connectorConfig, dcOrOptions, options, undefined,false, false);
  return executeQuery(getMyFoundItemsRef(dcInstance, inputVars), inputOpts && { fetchPolicy: inputOpts.fetchPolicy });
}
;

const getMyLostItemsRef = (dc) => {
  const { dc: dcInstance} = validateArgs(connectorConfig, dc, undefined);
  dcInstance._useGeneratedSdk();
  return queryRef(dcInstance, 'GetMyLostItems');
}
getMyLostItemsRef.operationName = 'GetMyLostItems';
exports.getMyLostItemsRef = getMyLostItemsRef;

exports.getMyLostItems = function getMyLostItems(dcOrOptions, options) {
  
  const { dc: dcInstance, vars: inputVars, options: inputOpts } = validateArgsWithOptions(connectorConfig, dcOrOptions, options, undefined,false, false);
  return executeQuery(getMyLostItemsRef(dcInstance, inputVars), inputOpts && { fetchPolicy: inputOpts.fetchPolicy });
}
;
