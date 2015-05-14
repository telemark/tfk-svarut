'use strict';

var S = require('string');
var ws = require('ws.js');
var Http = ws.Http;
var Mtom = ws.Mtom;
var config = require('./config');
var path = require('path');
var validateOptions = require('./lib/validateOptions');

var options;

function setMottaker() {
  var mottaker = '<navn>' +
    options.mottaker.navn +
    '</navn>' +
    '<adresse1>' +
    options.mottaker.adresse1 +
    '</adresse1>' +
    '<postnr>' +
    options.mottaker.postnr +
    '</postnr>' +
    '<poststed>' +
    options.mottaker.poststed +
    '</poststed>' +
    '<fodselsnr>' +
    options.mottaker.fodselsnr +
    '</fodselsnr>';
  return mottaker;
}

function setDokumenter() {
  var dokumenter = '';
  options.dokumenter.forEach(function(dokument) {
    dokumenter += '<dokumenter>' +
      '<data>' +
      '</data>' +
      '<filnavn>' +
      path.basename(dokument.filsti) +
      '</filnavn>' +
      '<mimetype>' +
      dokument.mimetype +
      '</mimetype>' +
      '</dokumenter>';
  });
  return dokumenter;
}

function setBasicAuth () {
  var auth = 'Basic ' +
    new Buffer(config.svarut.username +
        ':' +
        config.svarut.password).toString('base64');
  return auth;
}

function buildXmlReq() {
  var xml = '<soap:Envelope xmlns:soap="http://schemas.xmlsoap.org/soap/envelope/">' +
    '<soap:Body>' +
    '<ns2:sendForsendelse xmlns:ns2="http://www.ks.no/svarut/services">' +
    '<forsendelse>' +
    '<avgivendeSystem>' +
    config.system.avgivendeSystem +
    '</avgivendeSystem>' +
    '<konteringskode>' +
    config.system.konteringskode +
    '</konteringskode>' +
    setDokumenter() +
    '<krevNiva4Innlogging>' +
    config.system.krevNiva4Innlogging +
    '</krevNiva4Innlogging>' +
    '<kryptert>' +
    config.system.kryptert  +
    '</kryptert>' +
    '<kunDigitalLevering>' +
    config.system.kunDigitalLevering +
    '</kunDigitalLevering>' +
    '<mottaker xsi:type="ns2:privatPerson"' +
    'xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance">' +
    setMottaker() +
    '</mottaker>' +
    '<printkonfigurasjon>' +
    '<brevtype>' +
    config.system.brevtype +
    '</brevtype>' +
    '<fargePrint>' +
    config.system.fargePrint +
    '</fargePrint>' +
    '<tosidig>' +
    config.system.tosidig +
    '</tosidig>' +
    '</printkonfigurasjon>' +
    '<tittel>' +
    options.tittel +
    '</tittel>' +
    '</forsendelse>' +
    '</ns2:sendForsendelse>' +
    '</soap:Body>' +
    '</soap:Envelope>';
  return xml;
}

function buildRequest() {
  var ctx = {
    request: buildXmlReq(),
    url: config.svarut.url,
    action: config.svarut.action,
    contentType: 'application/soap+xml',
    auth: setBasicAuth()
  };
  return ctx;
}

function addFiles(ctx) {
  var i = 0;
  var xpath = '';

  options.dokumenter.forEach(function(dokument) {
    i++;
    xpath = '//data[' + i + ']';
    ws.addAttachment(ctx, 'request', xpath, dokument.filsti, dokument.mimetype);
  });
}

function send(ctx, callback) {
  var handlers = [
    new Mtom(),
    new Http()
  ];
  
  ws.send(handlers, ctx, function(page) {
    if (!page.response) {
      return callback('Error: Could not get response', null);
    }
    return callback(null, page);
  });
}

function checkResponse(response, callback) {
  var id = S(response).between('<return>', '</return>').s;
  if (!id) {
    callback('id not found in response' + response, null);
  }
  callback(null, id);
}

// Constructor
function SvarUt(opts, callback) {

  options = opts;
  validateOptions(options, function(err) {
    if (err) {
      callback(err, null);
    }
  });

  this.ctx = buildRequest();

  addFiles(this.ctx);
  send(this.ctx, function(err, page) {
    checkResponse(page.response, function(err, id) {
      if (err) {
        return callback(err, null);
      }
      return callback(null, id);
    });
  });
}

// export the class
module.exports = SvarUt;
