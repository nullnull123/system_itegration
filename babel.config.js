// module.exports = {
//   presets: [
//     '@vue/app',
//      ["@babel/preset-env", { "modules": false }]
//   ],
//   "plugins": [
//     [
//       "component",
//       {
//         "libraryName": "element-ui",
//         "styleLibraryName": "theme-chalk"
//       }
      
//     ]
//   ]
// }

module.exports = {
  presets: [
    '@vue/app',
    ["@babel/preset-env", { 
      "modules": false,
      "targets": { // 明确指定目标环境
        "browsers": ["> 1%", "last 2 versions", "not ie <= 8"]
      }
    }]
  ],
  plugins: [
    [
      "component",
      {
        "libraryName": "element-ui",
        "styleLibraryName": "theme-chalk"
      }
    ],
    "@babel/plugin-proposal-optional-chaining" // 新增插件
  ]
}
