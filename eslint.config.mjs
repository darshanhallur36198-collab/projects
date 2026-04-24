import securityRules from '@firebase/eslint-plugin-security-rules';

export default [
  {
    files: ['*.rules'],
    languageOptions: {
      parser: securityRules.parsers.firestore,
    },
    plugins: {
      '@firebase/security-rules': securityRules,
    },
    rules: {
      ...securityRules.configs['flat/recommended'].rules,
    },
  },
];
