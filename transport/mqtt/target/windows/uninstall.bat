@ECHO OFF

@ECHO Stopping tb-mqtt-transport ...
net stop tb-mqtt-transport

@ECHO Uninstalling tb-mqtt-transport ...
%~dp0tb-mqtt-transport.exe uninstall

@ECHO DONE.