/*
 * Copyright © 2016-2018 The Thingsboard Authors
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
var tmGlobals = {
    loadingTmId: null,
    tmApiKeys: {}
}

export default class TbTencentMap {
    constructor($containerElement,utils, initCallback, defaultZoomLevel, dontFitMapBounds, minZoomLevel, tmApiKey, tmDefaultMapType) {
        var tbMap = this;
        this.utils = utils;
        this.defaultZoomLevel = defaultZoomLevel;
        this.dontFitMapBounds = dontFitMapBounds;
        this.minZoomLevel = minZoomLevel;
        this.alarmInfos = [];
        this.historyAlarmTemp = [];
        this.historyAlarmPh = [];
        this.historyAlarmOrp = [];
        this.historyAlarmDo = [];
        this.historyAlarmEc = [];
        this.draws = [];
        this.tooltips = [];
        this.defaultMapType = tmDefaultMapType;

        this.tempTrh = 9999;
        this.phTrh = 9999;
        this.orpTrh = 9999;
        this.doTrh = 9999;
        this.ecTrh = 9999;

        function clearGlobalId() {
            if (tmGlobals.loadingTmId && tmGlobals.loadingTmId === tbMap.mapId) {
                tmGlobals.loadingTmId = null;
            }
        }

        function displayError(message) {
            $containerElement.html( // eslint-disable-line angular/angularelement
                "<div class='error'>"+ message + "</div>"
            );
        }

        function initTencentMap() {
            tbMap.map = new qq.maps.Map($containerElement[0], { // eslint-disable-line no-undef
                scrollwheel: true,
                mapTypeId: getTencentMapTypeId(tbMap.defaultMapType),
                zoom: tbMap.defaultZoomLevel || 8
            });

            // create history control
            tbMap.historyControl = new qq.maps.Control({// eslint-disable-line no-undef
                // 0 for history, 1 for latest data
                content: "<select id='double'><option value=0>历史数据</option><option value=1>最新数据</option></select>",
                //align: qq.maps.ALIGN.TOP_RIGHT,// eslint-disable-line no-undef
                map: tbMap.map
            });

            // create selectControl
            tbMap.selectControl = new qq.maps.Control({ // eslint-disable-line no-undef
                // 0 for null, 1 for alarmA, 2 for alarmB
                content: "<select id='single'><option value=0>无</option><option value=1>TEMP</option><option value=2>PH</option><option value=3>ORP</option><option value=4>DO</option><option value=5>EC</option></select>",
                //align: qq.maps.ALIGN.TOP_RIGHT,// eslint-disable-line no-undef
                map: tbMap.map
            });

            if (initCallback) {
                initCallback();
            }
        }

        /* eslint-disable no-undef */
        function getTencentMapTypeId(mapType) {
            var mapTypeId =qq.maps.MapTypeId.ROADMAP;
            if (mapType) {
                if (mapType === 'hybrid') {
                    mapTypeId = qq.maps.MapTypeId.HYBRID;
                } else if (mapType === 'satellite') {
                    mapTypeId = qq.maps.MapTypeId.SATELLITE;
                } else if (mapType === 'terrain') {
                    mapTypeId = qq.maps.MapTypeId.ROADMAP;
                }
            }
            return mapTypeId;
        }
        /* eslint-enable no-undef */

        this.mapId = '' + Math.random().toString(36).substr(2, 9);
        this.apiKey = tmApiKey || '84d6d83e0e51e481e50454ccbe8986b';

        window.tm_authFailure = function() { // eslint-disable-line no-undef, angular/window-service
            if (tmGlobals.loadingTmId && tmGlobals.loadingTmId === tbMap.mapId) {
                tmGlobals.loadingTmId = null;
                tmGlobals.tmApiKeys[tbMap.apiKey].error = 'Unable to authentificate for tencent Map API.</br>Please check your API key.';
                displayError(tmGlobals.tmApiKeys[tbMap.apiKey].error);
            }
        };

        this.initMapFunctionName = 'initTencentMap_' + this.mapId;

        window[this.initMapFunctionName] = function() { // eslint-disable-line no-undef, angular/window-service
            tmGlobals.tmApiKeys[tbMap.apiKey].loaded = true;
            initTencentMap();
            for (var p = 0; p < tmGlobals.tmApiKeys[tbMap.apiKey].pendingInits.length; p++) {
                var pendingInit = tmGlobals.tmApiKeys[tbMap.apiKey].pendingInits[p];
                pendingInit();
            }
            tmGlobals.tmApiKeys[tbMap.apiKey].pendingInits = [];
        };
        if (this.apiKey && this.apiKey.length > 0) {
            if (tmGlobals.tmApiKeys[this.apiKey]) {
                if (tmGlobals.tmApiKeys[this.apiKey].error) {
                    displayError(tmGlobals.tmApiKeys[this.apiKey].error);
                } else if (tmGlobals.tmApiKeys[this.apiKey].loaded) {
                    initTencentMap();
                } else {
                    tmGlobals.tmApiKeys[this.apiKey].pendingInits.push(initTencentMap);
                }
            } else {
                tmGlobals.tmApiKeys[this.apiKey] = {
                    loaded: false,
                    pendingInits: []
                };
                var tencentMapScriptRes = 'https://map.qq.com/api/js?v=2.exp&key='+this.apiKey+'&callback='+this.initMapFunctionName;

                tmGlobals.loadingTmId = this.mapId;
                lazyLoad.load({ type: 'js', path: tencentMapScriptRes }).then( // eslint-disable-line no-undef
                    function success() {
                        setTimeout(clearGlobalId, 2000); // eslint-disable-line no-undef, angular/timeout-service
                    },
                    function fail(e) {
                        clearGlobalId();
                        tmGlobals.tmApiKeys[tbMap.apiKey].error = 'tencent map api load failed!</br>'+e;
                        displayError(tmGlobals.tmApiKeys[tbMap.apiKey].error);
                    }
                );
            }
        } else {
            displayError('No tencent Map Api Key provided!');
        }
    }

    inited() {
        return angular.isDefined(this.map);
    }

    createMarkerLabelStyle(settings) {
        return {
            width: "200px",
            textAlign: "center",
            color: settings.labelColor,
            background: "none",
            border: "none",
            fontSize: "12px",
            fontFamily: "\"Helvetica Neue\", Arial, Helvetica, sans-serif",
            fontWeight: "bold"
        };
    }

    /* eslint-disable no-undef,no-unused-vars*/
    updateMarkerLabel(marker, settings) {
        if (marker.label) {
            marker.label.setContent(settings.labelText);
            marker.label.setStyle(this.createMarkerLabelStyle(settings));
        }
    }
    /* eslint-enable no-undef,no-unused-vars */

    /* eslint-disable no-undef,no-unused-vars */
    updateMarkerColor(marker, color) {
        this.createDefaultMarkerIcon(marker, color, (iconInfo) => {
            marker.setIcon(iconInfo.icon);
    });
    }
    /* eslint-enable no-undef,,no-unused-vars */

    /* eslint-disable no-undef */
    updateMarkerIcon(marker, settings) {
        this.createMarkerIcon(marker, settings, (iconInfo) => {
            marker.setIcon(iconInfo.icon);
        if (marker.label) {
            marker.label.setOffset(new qq.maps.Size(-100, -iconInfo.size[1]-20));
        }
    });
    }
    /* eslint-enable no-undef */

    /* eslint-disable no-undef */
    calculateRadius(dsIndex, history, item) {
        var tMap = this;
        var riverRadius = 0;
        var earthRadius = 0;
        if (String(history) == "1") {
            switch (String(item)) {
                case "1":
                    riverRadius = (tMap.alarmInfos[dsIndex].tempVal - tMap.tempTrh) * 60;
                    earthRadius = riverRadius / 2;
                    tMap.draws[dsIndex].riverCircle.radius = riverRadius;
                    tMap.draws[dsIndex].earthCircle.radius = earthRadius;
                    break;

                case "2":
                    riverRadius = (tMap.alarmInfos[dsIndex].phVal - tMap.phTrh) * 60;
                    earthRadius = riverRadius / 2;
                    tMap.draws[dsIndex].riverCircle.radius = riverRadius;
                    tMap.draws[dsIndex].earthCircle.radius = earthRadius;
                    break;

                case "3":
                    riverRadius = (tMap.alarmInfos[dsIndex].orpVal - tMap.orpTrh) * 60;
                    earthRadius = riverRadius / 2;
                    tMap.draws[dsIndex].riverCircle.radius = riverRadius;
                    tMap.draws[dsIndex].earthCircle.radius = earthRadius;
                    break;

                case "4":
                    riverRadius = (tMap.alarmInfos[dsIndex].doVal - tMap.doTrh) * 60;
                    earthRadius = riverRadius / 2;
                    tMap.draws[dsIndex].riverCircle.radius = riverRadius;
                    tMap.draws[dsIndex].earthCircle.radius = earthRadius;
                    break;

                case "5":
                    riverRadius = (tMap.alarmInfos[dsIndex].ecVal - tMap.ecTrh) * 60;
                    earthRadius = riverRadius / 2;
                    tMap.draws[dsIndex].riverCircle.radius = riverRadius;
                    tMap.draws[dsIndex].earthCircle.radius = earthRadius;
                    break;
            }
        }
        else {
            switch (String(item)) {
                case "1":
                    riverRadius = (tMap.historyAlarmTemp[dsIndex] - tMap.tempTrh) * 60;
                    earthRadius = riverRadius / 2;
                    tMap.draws[dsIndex].riverCircle.radius = riverRadius;
                    tMap.draws[dsIndex].earthCircle.radius = earthRadius;
                    break;

                case "2":
                    riverRadius = (tMap.historyAlarmPh[dsIndex] - tMap.phTrh) * 60;
                    earthRadius = riverRadius / 2;
                    tMap.draws[dsIndex].riverCircle.radius = riverRadius;
                    tMap.draws[dsIndex].earthCircle.radius = earthRadius;
                    break;

                case "3":
                    riverRadius = (tMap.historyAlarmOrp[dsIndex] - tMap.orpTrh) * 60;
                    earthRadius = riverRadius / 2;
                    tMap.draws[dsIndex].riverCircle.radius = riverRadius;
                    tMap.draws[dsIndex].earthCircle.radius = earthRadius;
                    break;

                case "4":
                    riverRadius = (tMap.historyAlarmDo[dsIndex] - tMap.doTrh) * 60;
                    earthRadius = riverRadius / 2;
                    tMap.draws[dsIndex].riverCircle.radius = riverRadius;
                    tMap.draws[dsIndex].earthCircle.radius = earthRadius;
                    break;

                case "5":
                    riverRadius = (tMap.historyAlarmEc[dsIndex] - tMap.ecTrh) * 60;
                    earthRadius = riverRadius / 2;
                    tMap.draws[dsIndex].riverCircle.radius = riverRadius;
                    tMap.draws[dsIndex].earthCircle.radius = earthRadius;
                    break;
            }
        }
    }
    /* eslint-enable no-undef */

    /* eslint-disable no-undef */
    drawCircle(lat, lng, riverRadius, earthRadius) {
        var riverCircle=new qq.maps.Circle({
            map:this.map,
            center: new qq.maps.LatLng(lat, lng),
            radius:riverRadius,
            fillColor: new qq.maps.Color(0, 255, 255, 0.1),
            strokeWeight:5
        });
        riverCircle.setVisible(true);

        var earthCircle=new qq.maps.Circle({
            map:this.map,
            center: new qq.maps.LatLng(lat, lng),
            radius:earthRadius,
            fillColor: new qq.maps.Color(255, 255, 0, 0.7),
            strokeWeight:5
        });
        earthCircle.setVisible(true);

        var circles = {
            riverCircle: riverCircle,
            earthCircle: earthCircle
        };

        return circles;

    }
    /* eslint-enable no-undef */

    /* eslint-disable no-undef */
    clearCircle(circles) {
        circles.riverCircle.setMap(null);
        circles.earthCircle.setMap(null);
    }
    /* eslint-enable no-undef */

    /* eslint-disable no-undef */
    openCircle(circles) {
        var tMap = this;
        circles.riverCircle.setMap(tMap.map);
        circles.earthCircle.setMap(tMap.map);
    }
    /* eslint-enable no-undef */

    // get drop-down box value
    /*getDropdownBoxValue(){
        var item = angular.element(document.getElementById("single")).val();// eslint-disable-line
        console.log(String(item));// eslint-disable-line
    }*/

    // get history alarm value
    /*getHistoryAlarmBoxValue(){
        var history = angular.element(document.getElementById("double")).val();// eslint-disable-line
        console.log(String(history));// eslint-disable-line
    }*/

    /* eslint-disable no-undef */
    createMarkerIcon(marker, settings, onMarkerIconReady) {
        var currentImage = settings.currentImage;
        var tMap = this;
        if (currentImage && currentImage.url) {
            this.utils.loadImageAspect(currentImage.url).then(
                (aspect) => {
                if (aspect) {
                    var width;
                    var height;
                    if (aspect > 1) {
                        width = currentImage.size;
                        height = currentImage.size / aspect;
                    } else {
                        width = currentImage.size * aspect;
                        height = currentImage.size;
                    }
                    var icon = new qq.maps.MarkerImage(currentImage.url,
                        new qq.maps.Size(width, height),
                        new qq.maps.Point(0,0),
                        new qq.maps.Point(width/2, height),
                        new qq.maps.Size(width, height));
                    var iconInfo = {
                        size: [width, height],
                        icon: icon
                    };
                    onMarkerIconReady(iconInfo);
                } else {
                    tMap.createDefaultMarkerIcon(marker, settings.color, onMarkerIconReady);
                }
        }
        );
        } else {
            this.createDefaultMarkerIcon(marker, settings.color, onMarkerIconReady);
        }
    }
    /* eslint-enable no-undef */

    /* eslint-disable no-undef */
    createDefaultMarkerIcon(marker, color, onMarkerIconReady) {
        var pinColor = color.substr(1);
        var icon = new qq.maps.MarkerImage("https://chart.apis.google.com/chart?chst=d_map_pin_letter_withshadow&chld=%E2%80%A2|" + pinColor,
            new qq.maps.Size(40, 37),
            new qq.maps.Point(0,0),
            new qq.maps.Point(10, 37));
        var iconInfo = {
            size: [40, 37],
            icon: icon
        };
        onMarkerIconReady(iconInfo);
    }
    /* eslint-enable no-undef */

    /* eslint-disable no-undef */
    createMarker(location, dsIndex, settings, onClickListener, markerArgs) {
        var marker = new qq.maps.Marker({
            position: location
        });
        var tMap = this;
        this.createMarkerIcon(marker, settings, (iconInfo) => {
            marker.setIcon(iconInfo.icon);
        marker.setMap(tMap.map);
        if (settings.showLabel) {
            marker.label = new qq.maps.Label({
                clickable: false,
                content: settings.labelText,
                offset: new qq.maps.Size(-100, -iconInfo.size[1]-20),
                style: tMap.createMarkerLabelStyle(settings),
                visible: true,
                position: location,
                map: tMap.map,
                zIndex: 1000
            });
        }
    });

        // self-defined
        if (settings.displayTooltip) {
            this.createTooltip(marker, dsIndex, settings, markerArgs);
        }

        //this.judgeDrawCircle(marker,dsIndex);

        if (onClickListener) {
            qq.maps.event.addListener(marker, 'click', onClickListener);
        }

        return marker;
    }
    /* eslint-enable no-undef */

    /* eslint-disable no-undef */
    removeMarker(marker) {
        marker.setMap(null);
        if (marker.label) {
            marker.label.setMap(null);
        }
    }
    /* eslint-enable no-undef */

    /* eslint-disable no-undef */
    createTooltip(marker, dsIndex, settings, markerArgs) {
        var popup = new qq.maps.InfoWindow({
            map :this.map
        });
        var map = this;
        var listener = qq.maps.event.addListener(marker, 'click', function() {
            if (settings.autocloseTooltip) {
                map.tooltips.forEach((tooltip) => {
                    tooltip.popup.close();
            });
            }
            popup.open();
            popup.setPosition(marker);
        });
        qq.maps.event.removeListener(listener);
        this.tooltips.push( {
            markerArgs: markerArgs,
            popup: popup,
            locationSettings: settings,
            dsIndex: dsIndex
        });

        var circles = this.drawCircle(this.alarmInfos[dsIndex].lat, this.alarmInfos[dsIndex].lng, 0, 0);
        //var map = this;
        qq.maps.event.addListener(marker, 'dblclick', function () {

            //console.log(map.historyAlarmA[dsIndex]);// eslint-disable-line
            //console.log(map.historyAlarmB[dsIndex]);// eslint-disable-line
            var alarmInfo = map.alarmInfos[dsIndex];
            var item = angular.element(document.getElementById("single")).val();// eslint-disable-line
            var history = angular.element(document.getElementById("double")).val();// eslint-disable-line
            map.matchAlarm(alarmInfo, dsIndex, history, item);

        });
        this.draws.push(circles);
    }
    /* eslint-enable no-undef */

    matchAlarm(alarmInfo, dsIndex, history, item) {

        var map = this;

        if (!alarmInfo.drawShowed) {

            if (String(history) == "1") {
                switch (String(item)) {
                    case "0":
                        //console.log("null");// eslint-disable-line
                        break;

                    case "1":
                        //console.log("");// eslint-disable-line
                        if (alarmInfo.tempVal > map.tempTrh) {
                            map.calculateRadius(dsIndex, history, item);
                            map.openCircle(map.draws[dsIndex]);
                            alarmInfo.drawShowed = true;
                            map.alarmInfos[dsIndex] = alarmInfo;
                        }
                        break;

                    case "2":
                        //console.log("");// eslint-disable-line
                        if (alarmInfo.phVal > map.phTrh) {
                            map.calculateRadius(dsIndex, history, item);
                            map.openCircle(map.draws[dsIndex]);
                            alarmInfo.drawShowed = true;
                            map.alarmInfos[dsIndex] = alarmInfo;
                        }
                        break;

                    case "3":
                        //console.log("");// eslint-disable-line
                        if (alarmInfo.orpVal > map.orpTrh) {
                            map.calculateRadius(dsIndex, history, item);
                            map.openCircle(map.draws[dsIndex]);
                            alarmInfo.drawShowed = true;
                            map.alarmInfos[dsIndex] = alarmInfo;
                        }
                        break;

                    case "4":
                        //console.log("");// eslint-disable-line
                        if (alarmInfo.doVal > map.doTrh) {
                            map.calculateRadius(dsIndex, history, item);
                            map.openCircle(map.draws[dsIndex]);
                            alarmInfo.drawShowed = true;
                            map.alarmInfos[dsIndex] = alarmInfo;
                        }
                        break;

                    case "5":
                        //console.log("");// eslint-disable-line
                        if (alarmInfo.ecVal > map.ecTrh) {
                            map.calculateRadius(dsIndex, history, item);
                            map.openCircle(map.draws[dsIndex]);
                            alarmInfo.drawShowed = true;
                            map.alarmInfos[dsIndex] = alarmInfo;
                        }
                        break;
                }
            }
            else {
                switch (String(item)) {
                    case "0":
                        //console.log("null");// eslint-disable-line
                        break;

                    case "1":
                        //console.log("");// eslint-disable-line
                        if (map.historyAlarmTemp[dsIndex] > map.tempTrh) {
                            map.calculateRadius(dsIndex, history, item);
                            map.openCircle(map.draws[dsIndex]);
                            alarmInfo.drawShowed = true;
                            map.alarmInfos[dsIndex] = alarmInfo;
                        }
                        break;

                    case "2":
                        //console.log("");// eslint-disable-line
                        if (map.historyAlarmPh[dsIndex] > map.phTrh) {
                            map.calculateRadius(dsIndex, history, item);
                            map.openCircle(map.draws[dsIndex]);
                            alarmInfo.drawShowed = true;
                            map.alarmInfos[dsIndex] = alarmInfo;
                        }
                        break;

                    case "3":
                        //console.log("");// eslint-disable-line
                        if (map.historyAlarmOrp[dsIndex] > map.orpTrh) {
                            map.calculateRadius(dsIndex, history, item);
                            map.openCircle(map.draws[dsIndex]);
                            alarmInfo.drawShowed = true;
                            map.alarmInfos[dsIndex] = alarmInfo;
                        }
                        break;

                    case "4":
                        //console.log("");// eslint-disable-line
                        if (map.historyAlarmDo[dsIndex] > map.doTrh) {
                            map.calculateRadius(dsIndex, history, item);
                            map.openCircle(map.draws[dsIndex]);
                            alarmInfo.drawShowed = true;
                            map.alarmInfos[dsIndex] = alarmInfo;
                        }
                        break;

                    case "5":
                        //console.log("");// eslint-disable-line
                        if (map.historyAlarmEc[dsIndex] > map.ecTrh) {
                            map.calculateRadius(dsIndex, history, item);
                            map.openCircle(map.draws[dsIndex]);
                            alarmInfo.drawShowed = true;
                            map.alarmInfos[dsIndex] = alarmInfo;
                        }
                        break;


                }
            }
        }
        else {
            map.clearCircle(map.draws[dsIndex]);
            alarmInfo.drawShowed = false;
            map.alarmInfos[dsIndex] = alarmInfo;
        }
    }

    /* eslint-disable no-undef */
    updatePolylineColor(polyline, settings, color) {
        var options = {
            path: polyline.getPath(),
            strokeColor: color,
            strokeOpacity: settings.strokeOpacity,
            strokeWeight: settings.strokeWeight,
            map: this.map
        };
        polyline.setOptions(options);
    }
    /* eslint-enable no-undef */

    /* eslint-disable no-undef */
    createPolyline(locations, settings) {
        var polyline = new qq.maps.Polyline({
            path: locations,
            strokeColor: settings.color,
            strokeOpacity: settings.strokeOpacity,
            strokeWeight: settings.strokeWeight,
            map: this.map
        });

        return polyline;
    }
    /* eslint-enable no-undef */

    removePolyline(polyline) {
        polyline.setMap(null);
    }

    /* eslint-disable no-undef ,no-unused-vars*/
    fitBounds(bounds) {
        if (this.dontFitMapBounds && this.defaultZoomLevel) {
            this.map.setZoom(this.defaultZoomLevel);
            this.map.setCenter(bounds.getCenter());
        } else {
            var tbMap = this;
            qq.maps.event.addListenerOnce(this.map, 'bounds_changed', function() { // eslint-disable-line no-undef
                if (!tbMap.defaultZoomLevel && tbMap.map.getZoom() > tbMap.minZoomLevel) {
                    tbMap.map.setZoom(tbMap.minZoomLevel);
                }
            });
            this.map.fitBounds(bounds);
        }
    }
    /* eslint-enable no-undef,no-unused-vars */

    createLatLng(lat, lng) {
        return new qq.maps.LatLng(lat, lng); // eslint-disable-line no-undef
    }

    extendBoundsWithMarker(bounds, marker) {
        bounds.extend(marker.getPosition());
    }

    getMarkerPosition(marker) {
        return marker.getPosition();
    }

    setMarkerPosition(marker, latLng) {
        marker.setPosition(latLng);
        if (marker.label) {
            marker.label.setPosition(latLng);
        }
    }

    getPolylineLatLngs(polyline) {
        return polyline.getPath().getArray();
    }

    setPolylineLatLngs(polyline, latLngs) {
        polyline.setPath(latLngs);
    }

    createBounds() {
        return new qq.maps.LatLngBounds(); // eslint-disable-line no-undef
    }

    extendBounds(bounds, polyline) {
        if (polyline && polyline.getPath()) {
            var locations = polyline.getPath();
            for (var i = 0; i < locations.getLength(); i++) {
                bounds.extend(locations.getAt(i));
            }
        }
    }

    invalidateSize() {
        qq.maps.event.trigger(this.map, "resize"); // eslint-disable-line no-undef
    }

    getTooltips() {
        return this.tooltips;
    }

}

