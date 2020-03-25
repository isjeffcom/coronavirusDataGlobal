// Convert US date format to Global format
function dcUS2Globe(str){
    let tmp = str.split('-')
    return tmp[1] + '-' + tmp[2] + '-' + tmp[0]
}


function getRetSymbol(){
    let ret = "\r"

    if(os.platform() == "win32"){
        ret = "\r\n"
    }

    else if(os.platform() == "darwin"){
        ret = "\r"
    }

    else if(os.platform() == "linux"){
        ret = "\n"
    }

    return ret
}

module.exports = {
    dcUS2Globe: dcUS2Globe,
    getRetSymbol: getRetSymbol
}