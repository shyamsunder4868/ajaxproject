import fioriTools from '@sap-ux/eslint-plugin-fiori-tools';
import { createRequire } from 'module';

const require = createRequire(import.meta.url);

export default [
    ...fioriTools.configs.recommended
];
