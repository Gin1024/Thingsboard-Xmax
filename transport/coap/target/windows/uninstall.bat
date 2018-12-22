@ECHO OFF

@ECHO Stopping tb-coap-transport ...
net stop tb-coap-transport

@ECHO Uninstalling tb-coap-transport ...
%~dp0tb-coap-transport.exe uninstall

@ECHO DONE.