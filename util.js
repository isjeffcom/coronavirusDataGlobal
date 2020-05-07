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

// Id index in array object, output all index as an array
function idIdxsInArrWithId(target, arr, id){
    
    var res = []
    for(let i=0;i<arr.length;i++){
        if(arr[i][id].indexOf(target) != -1){
            res.push(i)
        }
    }

    
    return res.length > 0 ? res : -1
}

module.exports = {
    dcUS2Globe: dcUS2Globe,
    getRetSymbol: getRetSymbol,
    idIdxsInArrWithId: idIdxsInArrWithId
}