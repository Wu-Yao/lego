'use strict';

const fs = require('fs');
const path = require('path');
const paths = require('./paths');
const { ProgressPlugin } = require('webpack');
const TerserPlugin = require('terser-webpack-plugin');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const CssMinimizerPlugin = require('css-minimizer-webpack-plugin');
const HtmlWebpackPlugin = require('html-webpack-plugin')
const { CleanWebpackPlugin } = require('clean-webpack-plugin')

module.exports = function (webpackEnv) {
    const isEnvDevelopment = webpackEnv === 'development';
    const isEnvProduction = webpackEnv === 'production';

    return {
        // target: ['browserslist'],
        stats: 'errors-warnings',
        mode: isEnvProduction ? 'production' : isEnvDevelopment && 'development',
        bail: isEnvProduction,
        devtool: isEnvProduction ? false : isEnvDevelopment && 'cheap-module-source-map',
        entry: paths.appIndexJs,
        output: {
            path: paths.appBuild,
            filename: isEnvProduction
                ? 'static/js/[name].[contenthash:8].js'
                : isEnvDevelopment && 'static/js/bundle.js',
            chunkFilename: isEnvProduction
                ? 'static/js/[name].[contenthash:8].chunk.js'
                : isEnvDevelopment && 'static/js/[name].chunk.js',
            assetModuleFilename: 'static/media/[name].[hash][ext]',
            publicPath: paths.publicUrlOrPath,
            devtoolModuleFilenameTemplate: isEnvProduction
                ? info =>
                    path
                        .relative(paths.appSrc, info.absoluteResourcePath)
                        .replace(/\\/g, '/')
                : isEnvDevelopment &&
                (info => path.resolve(info.absoluteResourcePath).replace(/\\/g, '/')),
        },
        cache: {
            type: 'filesystem',
            store: 'pack',
            buildDependencies: {
                config: [__filename],
                tsconfig: [paths.appTsConfig].filter(f =>
                    fs.existsSync(f)
                ),
            },
        },
        infrastructureLogging: {
            level: 'none',
        },
        optimization: {
            minimize: isEnvProduction,
            minimizer: [
                new TerserPlugin(),
                new CssMinimizerPlugin(),
            ]
        },
        resolve: {
            extensions: paths.moduleFileExtensions,
            alias: {
                '@utils': path.resolve(__dirname, 'src/utils'),
                '@components': path.resolve(__dirname, 'src/components'),
                '@assets': path.resolve(__dirname, 'src/assets'),
                '@hooks': path.resolve(__dirname, 'src/hooks'),
            },
        },
        module: {
            rules: [
                {
                    oneOf: [
                        {
                            test: [/\.bmp$/, /\.gif$/, /\.jpe?g$/, /\.png$/],
                            type: 'asset',
                            parser: {
                                dataUrlCondition: {
                                    maxSize: '10000',
                                },
                            },
                        },
                        {
                            test: /\.svg$/,
                            use: [
                                {
                                    loader: require.resolve('@svgr/webpack'),
                                    options: {
                                        prettier: false,
                                        svgo: false,
                                        svgoConfig: {
                                            plugins: [{ removeViewBox: false }],
                                        },
                                        titleProp: true,
                                        ref: true,
                                    },
                                },
                                {
                                    loader: require.resolve('file-loader'),
                                    options: {
                                        name: 'static/media/[name].[hash].[ext]',
                                    },
                                },
                            ],
                            issuer: {
                                and: [/\.(ts|tsx|js|jsx|md|mdx)$/],
                            },
                        },
                        {
                            test: /\.(js|jsx|ts|tsx)$/,
                            use: {
                                loader: require.resolve('babel-loader'),
                                options: {
                                    presets: [
                                        require.resolve("@babel/preset-env"),
                                        [require.resolve("@babel/preset-react"), { runtime: "automatic" }],
                                        [
                                            require.resolve("@babel/preset-typescript"),
                                            {
                                                isTSX: true,
                                                allExtensions: true
                                            }
                                        ]
                                    ]
                                }
                            },
                            include: paths.appSrc,
                        },
                        {
                            test: /\.css$/,
                            exclude: /\.module\.css$/,
                            use: [
                                {
                                    loader: require.resolve("style-loader"),
                                },
                                {
                                    loader: require.resolve("css-loader"),
                                    options: {
                                        importLoaders: 1,
                                        sourceMap: isEnvDevelopment
                                    },
                                },
                                {
                                    loader: require.resolve('postcss-loader'),
                                    options: {
                                        postcssOptions: {
                                            ident: 'postcss',
                                            config: false,
                                            plugins: [
                                                require.resolve('postcss-flexbugs-fixes'),
                                                [
                                                    require.resolve('postcss-preset-env'),
                                                    {
                                                        autoprefixer: {
                                                            flexbox: 'no-2009',
                                                        },
                                                        stage: 3,
                                                    },
                                                ],
                                                require.resolve('postcss-normalize'),
                                            ]
                                        },
                                        sourceMap: isEnvDevelopment
                                    }
                                }
                            ],
                            sideEffects: true
                        },
                        {
                            test: /\.module\.css$/,
                            use: [
                                {
                                    loader: require.resolve('style-loader')
                                },
                                {
                                    loader: require.resolve('css-loader'),
                                    options: {
                                        modules: true,
                                        localIdentName: '[name]__[local]-[hash:base64:5]'
                                    }
                                },
                                {
                                    loader: require.resolve('postcss-loader'),
                                    options: {
                                        postcssOptions: {
                                            ident: 'postcss',
                                            config: false,
                                            plugins: [
                                                require.resolve('postcss-flexbugs-fixes'),
                                                [
                                                    require.resolve('postcss-preset-env'),
                                                    {
                                                        autoprefixer: {
                                                            flexbox: 'no-2009',
                                                        },
                                                        stage: 3,
                                                    },
                                                ],
                                                require.resolve('postcss-normalize')
                                            ]
                                        },
                                        sourceMap: isEnvDevelopment
                                    }
                                }
                            ]
                        },
                        {
                            test: /\.(scss|sass)$/,
                            exclude: /\.module\.(scss|sass)$/,
                            use: [
                                {
                                    loader: require.resolve("style-loader"),
                                },
                                {
                                    loader: require.resolve("css-loader"),
                                    options: {
                                        importLoaders: 2,
                                        sourceMap: isEnvDevelopment
                                    },
                                },
                                {
                                    loader: require.resolve('postcss-loader'),
                                    options: {
                                        postcssOptions: {
                                            ident: 'postcss',
                                            config: false,
                                            plugins: [
                                                require.resolve('postcss-flexbugs-fixes'),
                                                [
                                                    require.resolve('postcss-preset-env'),
                                                    {
                                                        autoprefixer: {
                                                            flexbox: 'no-2009',
                                                        },
                                                        stage: 3,
                                                    },
                                                ],
                                                require.resolve('postcss-normalize'),
                                            ]
                                        },
                                        sourceMap: isEnvDevelopment
                                    }
                                },
                                {
                                    loader: require.resolve("sass-loader"),
                                },
                            ],
                            sideEffects: true
                        }
                    ]
                }
            ]
        },
        plugins: [
            new ProgressPlugin(),
            new CleanWebpackPlugin(),
            new MiniCssExtractPlugin({
                filename: 'static/css/[name].[contenthash:8].css',
                chunkFilename: 'static/css/[name].[contenthash:8].chunk.css',
            }),
            new HtmlWebpackPlugin({
                template: paths.appHtml
            }),
        ]
    }
}