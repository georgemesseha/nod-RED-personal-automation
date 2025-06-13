#SingleInstance Force


^#Numpad1::
{
    http := ComObject("WinHttp.WinHttpRequest.5.1")
    http.Open("GET", "http://127.0.0.1:7777/tile-powershell", false)
    http.Send()
}
::teams;::
^#Numpad2::
{
    http := ComObject("WinHttp.WinHttpRequest.5.1")
    http.Open("GET", "http://127.0.0.1:7777/tile-ms-teams", false)
    http.Send()
}
^#Numpad4::
{
    http := ComObject("WinHttp.WinHttpRequest.5.1")
    http.Open("GET", "http://127.0.0.1:7777/tile-rider", false)
    http.Send()
}
^#Numpad5::
{
    http := ComObject("WinHttp.WinHttpRequest.5.1")
    http.Open("GET", "http://127.0.0.1:7777/tile-vscode", false)
    http.Send()
}
^#Numpad8::
{
    http := ComObject("WinHttp.WinHttpRequest.5.1")
    http.Open("GET", "http://127.0.0.1:7777/tile-edge", false)
    http.Send()
}
^#Numpad9::
{
    http := ComObject("WinHttp.WinHttpRequest.5.1")
    http.Open("GET", "http://127.0.0.1:7777/tile-vivaldi", false)
    http.Send()
}