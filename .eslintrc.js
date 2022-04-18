const sortGroups = {
  groups: [
    ["^react", "^react-dom", "^semantic-ui-react", "^@?\\w"],
    // Internal packages
    ["^(apollo|backend|components|config|ducks|graphql|images|Layout|pages|sagas|styles|utils)(/.*|$)"],
    // Side effect imports
    ["^\\u0000"],
    // Parent imports
    ["^\\.\\.(?!/?$)", "^\\.\\./?$"],
    // Other relative imports
    ["^\\./(?=.*/)(?!/?$)", "^\\.(?!/?$)", "^\\./?$"],
    // Style imports.
    ["^.+\\.s?css$", "^.+\\.scss$"]
  ]
};

module.exports = {
  env: {
    browser: true,
    node: true,
    es6: true
  },
  extends: [
    "eslint:recommended",
    "plugin:import/errors",
    "plugin:import/warnings",
    "plugin:react/recommended",
    "plugin:react-hooks/recommended",
    "prettier"
  ],
  parserOptions: {
    ecmaFeatures: {
      jsx: true
    },
    ecmaVersion: "latest",
    sourceType: "module"
  },
  plugins: ["import", "react", "react-hooks", "simple-import-sort"],
  settings: {
    react: {
      version: "detect"
    },
    "import/resolver": {
      node: {
        extensions: [".js", ".jsx"],
        paths: ["src"]
      }
    }
  },
  rules: {
    "comma-spacing": ["warn", { before: false, after: true }],
    curly: ["warn", "all"],
    eqeqeq: "error",
    "func-call-spacing": ["warn", "never"],
    "key-spacing": ["warn", { beforeColon: false }],
    "no-alert": process.env.NODE_ENV === "production" ? "off" : "warn",
    "no-console": process.env.NODE_ENV === "production" ? "off" : "warn",
    "no-debugger": process.env.NODE_ENV === "production" ? "off" : "warn",
    "no-eval": "error",
    "no-multi-spaces": "warn",
    "no-shadow": "warn",
    "no-unused-expressions": "warn",
    "no-unused-vars": "warn",
    "no-var": "error",
    "prefer-const": "warn",
    "prefer-template": "warn",
    semi: ["error", "always"],
    "sort-imports": "off",
    "import/named": "off",
    "import/newline-after-import": "warn",
    "import/no-named-as-default": "off",
    "import/no-named-as-default-member": "off",
    "import/order": "off",
    "react/jsx-fragments": "error",
    "react/no-danger": "warn",
    "react-hooks/rules-of-hooks": "error",
    "react-hooks/exhaustive-deps": "warn",
    "simple-import-sort/imports": ["warn", sortGroups]
  }
};
