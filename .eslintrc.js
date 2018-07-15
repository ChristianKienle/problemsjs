module.exports = {
    "globals": {
        "test": false,
        "expect": false
    },
    "root": true,
    "parser": "babel-eslint",
    "plugins": [
      "json",
      "flowtype"
    ],
    "parserOptions": {
        "ecmaVersion": 2017
    },
    "env": {
        "es6": true,
        "node": true
    },
    "extends": "eslint:recommended",
    "rules": {
      "comma-dangle": ["error", "always-multiline"],
      "indent": [
            "error",
            2
        ],
        "linebreak-style": [
            "error",
            "unix"
        ],
        "quotes": [
            "error",
            "single"
        ],
        "semi": [
            "error",
            "always"
        ]
    }
};