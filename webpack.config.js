import path from 'path';
import webpack from 'webpack';
import HtmlWebpackPlugin from 'html-webpack-plugin';
import dotenv from 'dotenv';
import CopyWebpackPlugin from 'copy-webpack-plugin';

dotenv.config();

const commonModule = {
    rules: [
        {
            test: /\.(js|jsx)$/,
            exclude: /node_modules/,
            use: {
                loader: 'babel-loader',
                options: {
                    presets: [
                        '@babel/preset-env',
                        ['@babel/preset-react', { runtime: 'automatic' }]
                    ]
                }
            },
            resolve: {
                fullySpecified: false,
            }
        },
        {
            test: /\.css$/,
            use: ['style-loader', 'css-loader']
        }
    ]
};

const resolve = {
    extensions: ['.js', '.jsx']
};

const envKeys = Object.keys(process.env)
    .filter((key) => key.startsWith('REACT_APP_'))
    .reduce((acc, key) => {
        acc[`process.env.${key}`] = JSON.stringify(process.env[key]);
        return acc;
    }, {});

const serverConfig = {
    target: 'node',
    mode: 'development',
    entry: './src/server.jsx',
    devtool: 'source-map',
    output: {
        path: path.resolve('dist'),
        filename: 'server.cjs'
    },
    module: commonModule,
    plugins: [
        new webpack.EnvironmentPlugin({
            PORT: 3006
        }),
        new webpack.DefinePlugin(envKeys),
        new CopyWebpackPlugin({
            patterns: [
                {
                    from: path.resolve('public', 'assests'),
                    to: 'assests'
                }
            ]
        }),
    ],
    resolve
};

const clientConfig = {
    target: 'web',
    mode: 'development',
    entry: './src/client/index.jsx',
    devtool: 'source-map',
    output: {
        path: path.resolve('dist'),
        publicPath: '/static',
        filename: 'client.js'
    },
    module: commonModule,
    plugins: [
        new HtmlWebpackPlugin({
            template: path.resolve('src', 'client', 'index.html')
        }),
        new webpack.DefinePlugin(envKeys),
        new CopyWebpackPlugin({
            patterns: [
                {
                    from: path.resolve('public', 'assests'),
                    to: 'assests'
                }
            ]
        }),
    ],
    externals: {
        express: 'commonjs express'
    },
    resolve
};

export default [serverConfig, clientConfig];
