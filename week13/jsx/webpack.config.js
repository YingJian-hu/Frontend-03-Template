const path = require('path')

module.exports = {
    entry: './main.js',
    module: {
        rules: [
            {
                test: /\.js$/,
                use: {
                    loader: "babel-loader",
                    options: {
                        presets: ["@babel/preset-env"],

                        //  支持加配置，修改函数名字
                        plugins: [["@babel/plugin-transform-react-jsx", {pragma: "createElement"}]]
                    }
                }
            }
        ]
    },
    mode: 'development'
}