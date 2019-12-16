/**
 * 代码复杂度检测
 */
const eslint = require("eslint")
const glob = require("glob")
const { CLIEngine } = eslint

const DEFAULT_IGNORE_PATTERNS = ["node_modules/**", "build/**", "dist/**", "output/**", "common_build/**"]

const cli = new CLIEngine({
    parserOptions: {
        ecmaVersion: 2018,
        sourceType: "module",
        ecamFeatures: {
            jsx: true
        }
    },
    rules: {
        complexity: ["error", { max: 1 }]
    },
    useEslintrc: true
})

/**
 * 提取函数类型正则
 */
const REG_FUNC_TYPE = /^(Method |Async function |Arrow function |Function )/g

/**
 * eslint提示前缀
 */
const MESSAGE_PREFIX = "Maximum allowed is 1."

/**
 * eslint提示后缀
 */
const MESSAGE_SUFFIX = "has a complexity of "

/**
 * 提取mssage主要部分
 * @param {*} message
 */
function getMain(message) {
    return message.replace(MESSAGE_PREFIX, "").replace(MESSAGE_SUFFIX, "")
}

/**
 * 提取代码复杂度
 * @param {*} message
 */
function getComplexity(message) {
    const main = getMain(message)
    ;/(\d+)\./g.test(main)
    return +RegExp.$1
}

/**
 * 获取函数名
 * @param {*} message
 */
function getFunctionName(message) {
    const main = getMain(message)

    let test = /'([a-zA-Z0-9_$]+)'/g.test(main)
    return test ? RegExp.$1 : "--"
}

/**
 * 提取函数类型
 * @param {*} message
 */
function getFunctionType(message) {
    let a = message.match(REG_FUNC_TYPE) || []
    return a.length ? a[0] : "--"
}

/**
 * 提取文件名称
 * @param {*} filePath
 */
function getFileName(filePath) {
    return filePath.replace(process.cwd(), "").trim()
}

/**
 * 获取重构建议
 * @param {*} complexity
 */
function getAdvice(complexity) {
    if (complexity > 10) {
        return "强烈建议"
    } else if (complexity > 5) {
        return "建议"
    } else {
        return "无需"
    }
}

/**
 * 获取单个文件的复杂度
 */
function executeOnFiles(paths, min) {
    const reports = cli.executeOnFiles(paths).results
    const result = []
    let normalCount = 0
    let slightCount = 0
    let seriousCount = 0
    const fileCount = paths.length
    let funcCount = 0
    for (let i = 0; i < reports.length; i++) {
        const { messages, filePath } = reports[i]
        for (let j = 0; j < messages.length; j++) {
            const { message, ruleId, line, column } = messages[j]
            if (ruleId === "complexity") {
                funcCount++
                const complexity = getComplexity(message)
                try {
                    switch (true) {
                        case complexity <= 5:
                            normalCount++
                            break
                        case 5 < complexity && complexity <= 10:
                            slightCount++
                            break
                        case complexity > 10:
                            seriousCount++
                            break
                    }
                } catch (error) {
                    console.log("err", error)
                }

                if (complexity >= min) {
                    result.push({
                        funcType: getFunctionType(message),
                        funcName: getFunctionName(message),
                        position: line + "," + column,
                        fileName: getFileName(filePath),
                        complexity,
                        advice: getAdvice(complexity)
                    })
                }
            }
        }
    }
    const normalRatio = +(normalCount / funcCount)
    const slightRatio = +(slightCount / funcCount)
    const seriousRatio = +(seriousCount / funcCount)
    return { normalRatio, slightRatio, seriousRatio, fileCount, funcCount, result }
}

/**
 * 获取所有文件
 */
function getFiles() {
    return new Promise(resolve => {
        glob(
            "**/*.?(vue|js|jsx)",
            {
                ignore: DEFAULT_IGNORE_PATTERNS
            },
            function(er, files) {
                resolve(files)
                // files is an array of filenames.
                // If the `nonull` option is set, and nothing
                // was found, then files is ["**/*.js"]
                // er is an error object or null.
                // console.log(files);
            }
        )
    })
}
module.exports = async function(param) {
    // options is optional
    const { min = 1 } = param || {}

    let files = await getFiles()

    return executeOnFiles(files, min)
}
