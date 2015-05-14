# tfk-svarut
SvarUt for digitale skjemaer.

## Installation
```
$ git clone git@github.com:telemark/tfk-svarut.git
```

## Setup
```
$ npm run setup
```

## Test
```
$ npm test
```

## Build
```
$ npm run build
```

## Usage

```
$ npm install
```

## Example

```javascript
'use strict';

var svarUt = require('./index.js');
var options = {
  mottaker:{
    navn : 'Terje Tverrtryne',
    adresse1 : 'Skogsveien 32',
    postnr: '3710',
    poststed: 'Skien',
    fodselsnr: '10097433611'
  },
  tittel: 'Vedtak om fri skoleskyss',
  dokumenter : [
  {
    filsti: 'data/skoleskyss_kvittering.pdf',
    mimetype: 'application/pdf'
  },
  {
    filsti: 'data/skoleskyss_positivt_vedtak.pdf',
    mimetype: 'application/pdf'
  }
  ]
};

var res = new svarUt(options, function(err, id) {
  if (err) {
    console.log(err);
  } else {
    console.log(id);
  }
});
```
