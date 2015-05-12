'use strict'

var S = require('string')
var ws = require('ws.js')
  , Http = ws.Http
  , Mtom = ws.Mtom
var config = require('./config')

var options;

function setMottaker() {
  var mottaker = '<navn>' + options.mottaker.navn + '</navn>' +
                 '<adresse1>' + options.mottaker.adresse1 + '</adresse1>' +
                 '<postnr>' + options.mottaker.postnr + '</postnr>' +
                 '<poststed>' + options.mottaker.poststed + '</poststed>' +
                 '<fodselsnr>' + options.mottaker.fodselsnr + '</fodselsnr>'
  return mottaker
}

function setDokumenter() {
  var dokumenter = ''
  options.dokumenter.forEach(function(dokument){
    dokumenter += '<dokumenter>' +
                  '<data></data>' +
                  '<filnavn>' + dokument.filnavn + '</filnavn>' +
                  '<mimetype>' + dokument.mimetype + '</mimetype>' +
                  '</dokumenter>'
  });
  return dokumenter
}

function basicAuth () {
  var auth = 'Basic ' + new Buffer(config.svarut.username + ':' + config.svarut.password).toString('base64');
  return auth
}

function buildXml() {
  var xml = '<soap:Envelope xmlns:soap="http://schemas.xmlsoap.org/soap/envelope/">' +
                    '<soap:Body>' +
                      '<ns2:sendForsendelse xmlns:ns2="http://www.ks.no/svarut/services">' +
                        '<forsendelse>' +
                          '<avgivendeSystem>' + config.system.avgivendeSystem + '</avgivendeSystem>' +
                          '<konteringskode>' + config.system.konteringskode + '</konteringskode>' +
                          setDokumenter() +
                          '<krevNiva4Innlogging>' + config.system.krevNiva4Innlogging + '</krevNiva4Innlogging>' +
                          '<kryptert>' + config.system.kryptert  +  '</kryptert>' +
                          '<kunDigitalLevering>' + config.system.kunDigitalLevering + '</kunDigitalLevering>' +
                          '<mottaker xsi:type="ns2:privatPerson" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance">' +
                          setMottaker() +
                          '</mottaker>' +
                          '<printkonfigurasjon>' +
                            '<brevtype>' + config.system.brevtype + '</brevtype>' +
                            '<fargePrint>' + config.system.fargePrint + '</fargePrint>' +
                            '<tosidig>' + config.system.tosidig + '</tosidig>' +
                          '</printkonfigurasjon>' +
                          '<tittel>' + options.tittel + '</tittel>' +
                        '</forsendelse>' +
                      '</ns2:sendForsendelse>' +
                    '</soap:Body>' +
              '</soap:Envelope>'
  return xml
}

function buildRequest() {
  var ctx = { request: buildXml()
            , url: config.svarut.url
            , action: config.svarut.action
            , contentType: "application/soap+xml"
            , auth: basicAuth()
           }
  return ctx
}

function addFiles(ctx) {
    var i = 0, xpath = ''
    options.dokumenter.forEach(function(dokument){
      i++;
      xpath = '//data[' + i + ']'
      ws.addAttachment(ctx, "request", xpath, dokument.filsti, dokument.mimetype)
    });
}

function send(ctx, callback) {
  var handlers = [ new Mtom() //Mtom must be after everything except http
                 , new Http()
                 ]
  ws.send(handlers, ctx, function(page) {
    return callback(page)
  });
}

// Constructor
function SvarUt(opts, callback) {

  options = opts;
  var id = ''

  this.ctx = buildRequest()

  addFiles(this.ctx)

  send(this.ctx, function(page) {
    if (!page || !page.response) {
      return callback('Error: Something wrong happend', null)
    } else {
      id = S(page.response).between('<return>', '</return>').s;
      return callback(null, id)
    }
  });
}

// export the class
module.exports = SvarUt;
