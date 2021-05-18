const replaceString = require('replace-string');

module.exports = function (source) {
    const importSyntax = "import TheMoonNFTContract from 0xf8d6e0586b0a20c7";
    const newImportSyntax = "import TheMoonNFTContract from 0xMOON_NFT_CONTRACT";

    return replaceString(source, importSyntax, newImportSyntax);
}
