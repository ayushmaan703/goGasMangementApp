import { BACKEND_URL_DEMO } from '@env';
import { BACKEND_URL_LIVE } from '@env';
import { DEV_ENV } from '@env';

let baseUrl;
// console.log(DEV_ENV);

if (DEV_ENV == 'dev') baseUrl = BACKEND_URL_DEMO;
else baseUrl = BACKEND_URL_LIVE;

// console.log(baseUrl);

const GST_SLAB = Object.freeze([{ GSTNo: 5 }, { GSTNo: 18 }]);

export { baseUrl, GST_SLAB };

// export default baseUrl = 'http://103.175.22.11:8911/STKAPIdata.asmx';;
