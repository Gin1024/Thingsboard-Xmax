var tempValue = dsData[dsIndex]["TEMP"]
var phValue = dsData[dsIndex]["PH"]
var orpValue = dsData[dsIndex]["ORP"]
var doValue = dsData[dsIndex]["DO"]
var ecValue = dsData[dsIndex]["EC"]

var tempThreshold = dsData[dsIndex]["tempThreshold"]
var phThreshold = dsData[dsIndex]["phThreshold"]
var orpThreshold = dsData[dsIndex]["orpThreshold"]
var doThreshold = dsData[dsIndex]["doThreshold"]
var ecThreshold = dsData[dsIndex]["ecThreshold"]

if( tempValue > tempThreshold ||
    phValue > phThreshold ||
    orpValue > orpThreshold ||
    doValue > doThreshold ||
    ecValue > ecThreshold){

	return "red";
}else{
	return "blue";
}
