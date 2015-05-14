'use strict'

var config = {
  svarut: {
    url: 'https://username:password@test.svarut.ks.no/tjenester/forsendelseservice/ForsendelsesServiceV4',
    action: 'http://www.ks.no/svarut/services/ForsendelsesServiceV4/sendForsendelse'
  },
  system: {
    avgivendeSystem: 'Skoleskyss',
    krevNiva4Innlogging: 'false',
    kryptert: 'false',
    kunDigitalLevering: 'false',
    brevtype: 'BPOST',
    konteringskode: '1161',
    fargePrint: 'true',
    tosidig: 'false'
  }
}
module.exports = config;
