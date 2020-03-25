// Convert US date format to Global format
function dcUS2Globe(str){
    let tmp = str.split('-')
    console.log(tmp[1] + '-' + tmp[2] + '-' + tmp[0])
    return tmp[1] + '-' + tmp[2] + '-' + tmp[0]
}

module.exports = {
    dcUS2Globe: dcUS2Globe
}