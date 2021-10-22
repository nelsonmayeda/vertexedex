//basic environment host sniffing for url service
//export default class myEnvironment {
class myEnvironment{
    constructor() {
        this.urlBase = this.getApiLocation(window.location);
    }
    isLocalNetwork(hostname){
        return (
            (['localhost', '127.0.0.1', '', '::1'].includes(hostname))
            || (hostname.startsWith('192.168.'))
            || (hostname.startsWith('10.0.'))
            || (hostname.endsWith('.local'))
          );
    }
    isHttps(protocol){
        return 'https:' == protocol; //note this handles http: and file:
    }
    getApiLocation(location){
        if(this.isHttps(location.protocol) && this.isLocalNetwork(location.hostname)){
            return "https://localhost:44368";
        }else if(this.isLocalNetwork(location.hostname)){
            return "http://localhost:45530";
        }else {
            return "//api.vertexedex.com";
        }
    }
    getRoutingUrl(){
        return this.urlBase +"/routing";
    }
    getPackingUrl(){
        return this.urlBase +"/packing";
    }
}