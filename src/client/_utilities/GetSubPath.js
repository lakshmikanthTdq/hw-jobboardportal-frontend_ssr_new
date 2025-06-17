export const Encrypt = (text) => {
    const textToChars = (text) => text.split("").map((c) => c.charCodeAt(0));
    const byteHex = (n) => ("0" + Number(n).toString(16)).substr(-2);
    const applySaltToChar = (code) => textToChars('subpath').reduce((a, b) => a ^ b, code);
    let encriptString = text.split("").map(textToChars).map(applySaltToChar).map(byteHex).join("");
    localStorage.setItem("getSubpath_jobboardportal", encriptString)
};

export const decrypt = () => {
    let encoded = localStorage.getItem("getSubpath_jobboardportal")
    if(encoded){
        const textToChars = (value) => value.split("").map((c) => c.charCodeAt(0));
        const applySaltToChar = (code) => textToChars('subpath').reduce((a, b) => a ^ b, code);
        return encoded.match(/.{1,2}/g).map((hex) => parseInt(hex, 16)).map(applySaltToChar).map((charCode) => String.fromCharCode(charCode)).join("");
    }
};