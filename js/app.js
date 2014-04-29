function generateUUID() {
    var d = Date.now();
    var uuid = 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
        var r = (d + Math.random()*16)%16 | 0;
        d = Math.floor(d/16);
        return (c=='x' ? r : (r&0x7|0x8)).toString(16);
    });
    return uuid;
};

function htmlspecialchars(str) {
    return str.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&apos;');
}
function htmlspecialchars_decode(str) {
    return str.replace(/&amp;/g, '&').replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&quot;/g, '"').replace(/&apos;/g, '\'');
}
function htmlentities(str) {
    var textarea = document.createElement("textarea");
    textarea.innerHTML = str;
    return textarea.innerHTML;
}
function htmlentities_decode(str) {
    var textarea = document.createElement("textarea");
    textarea.innerHTML = str;
    return textarea.value;
}

function replaceIfSubStr(original, substr) {
    var idx = original.indexOf(substr);
    if (idx !== -1) {
        return original.substr(idx + 7);
    } else {
        return original;
    }
}

function destroyClickedElement(event)
	{
		document.body.removeChild(event.target);
	};
