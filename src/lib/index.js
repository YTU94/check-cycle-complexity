const cc = require("../index")

function fmtNumber(v) {
    let n = parseFloat(v)
    if (isNaN(n)) {
        return v
    } else {
        return `${(n * 100).toFixed(2)}%`
    }
}
module.exports = async function(param) {
    const ccResult = await cc(param)
    const { normalRatio, slightRatio, seriousRatio, fileCount, funcCount, result, score } = ccResult
    console.table({
        "<5": fmtNumber(normalRatio),
        "5~10": fmtNumber(slightRatio),
        ">10": fmtNumber(seriousRatio),
        fileCount,
        funcCount,
        score
    })
    console.table(result)
}
