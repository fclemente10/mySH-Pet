var app = {

    initialize: function() {

        document.addEventListener('deviceready', this.onDeviceReady, false);

    },
    onDeviceReady: function() {
        var potText = document.getElementById('pot');
        var delta = document.getElementById('delta');
        var on = document.getElementById('on'); // Botón ON
        var off = document.getElementById('off'); // Botón OFF
        var get = document.getElementById('get'); // Botón Prueba DB
        var msg = document.getElementById('msg');
       // var weso = document.getElementById('weso');
        var open = false;
        var addr = "192.168.56.1"; //localStorage.getItem("ip");
//        var ws = new WebSocket('ws://'+ addr +':3300');
        localStorage.setItem("serialNumber", device.uuid);
        var serialN = localStorage.getItem("serialNumber");
        var serialX = '';
        var ctrlSerial = false;
        var finishedCheckSerial = false;

        var noArduino = false;

        var nombreUsuario = document.getElementById('nombreUsuario');
        var nombreEquipo = document.getElementById('nombreEquipo');
        var accion = document.getElementById('accion');
        var horaInicio = document.getElementById('horaInicio');
        var horaFin = document.getElementById('horaFin');
        var hora = document.getElementById('hora');
        var horaE = document.getElementById('horaE');
        var onOff = document.getElementById('onOff');
        var ctrlOnOff = 0;
        var str = '';

        var lastRead = new Date();

        var onOff = document.getElementById('onOff');
        var enchufado = document.getElementById('enchufado');
        var quitado = document.getElementById('quitado');
        var enchufado2 = document.getElementById('enchufado2');
        var quitado2 = document.getElementById('quitado2');


        window.addEventListener('resize', () => {
        var vh = window.innerHeight * 0.01;
        document.documentElement.style.setProperty('--vh', `${vh}px`);
        });
        // Funcionamiento en background


        //Verifica comunicacion con Arduino
        var errorCallback = function(message) {
            alert('Error: ' + message);
            noArduino = true;
            //alert('IP = ' + addr);
        };

        // Verifica Conexion con la base de datos...
        checkSerialNumber();
        connDevice();
        sleep(5000);

        getDados(); // Ver estado del equipo y cargar parametros


        function connDevice(){
        // request permission first
            serial.requestPermission(
                // if user grants permission
                function(successMessage) {
                    // open serial port
                    serial.open(
                        {baudRate: 9600},
                        // if port is succesfuly opened
                        function(successMessage) {
                            open = true;
                            // register the read callback
                            serial.registerReadCallback(
                                function success(data){
                                    // decode the received message
                                    var view = new Uint8Array(data);
                                    if(view.length >= 1) {
                                        for(var i=0; i < view.length; i++) {
                                            // if we received a \n, the message is complete, display it
                                            if(view[i] == 13) {
                                                // compruebe si la velocidad de lectura corresponde a la velocidad de "serial print" de arduino
                                                var now = new Date();
                                                delta.innerText = now - lastRead;
                                                lastRead = now;
                                                // display the message
                                                var value = parseInt(str);

                                                if(isNaN(value)){ value = 1; }

                                                pot.innerText = value;
                                                this.msg.innerText = 'Valor Pot=' + (value*220/1000);
                                                str = '';
                                            }
                                            // if not, concatenate with the begening of the message
                                            else {
                                                var temp_str = String.fromCharCode(view[i]);
                                                var str_esc = escape(temp_str);
                                                str += unescape(str_esc);
                                            }
                                        }
                                    }
                                },
                                // error attaching the callback
                                errorCallback
                            );
                        },
                        // error opening the port
                        errorCallback
                    );
                },
                // user does not grant permission
                errorCallback
            );
        }

        function checkSerialNumber(){
            window.plugins.insomnia.keepAwake() // mobile never sleeps
            const options = { method: 'get', data: { }, headers: {} };
            cordova.plugin.http.sendRequest('http://' + addr + ':3000/api/v1/equipo', options, function(response) {

                const serialEquipos = JSON.parse(response.data);                      // informa status del equipo
                serialEquipos.forEach(info=> {
                serialX = info.serialNumber;
//                alert("Serial Equipo= " + device.uuid);
//                alert("Serial Servidor= " + serialX);

                if (serialX == device.uuid ){
                    alert('Equipo Encontrado ' + serialX);
                    ctrlSerial = true;
                    }
                });
                finishedCheckSerial = true;
                initialConfigDevice();
                }, function(response) {
                if( response.error) {
                  alert("Error Busca Datos Base de datos " + response.error);
                }
              }
            ); // Fin GET Request


        } // fin CheckSerialNumber

        function initialConfigDevice(){
//            alert("ctrlSerial= " + ctrlSerial);
//            alert("finishedCheckSerial= " + finishedCheckSerial);
            if (!finishedCheckSerial) { checkSerialNumber(); }
/******** Configuracion de Nombre de equipo y numero Serial ******/
//             if (serialN !== device.uuid){
            if (!ctrlSerial){
                // Busca nombre del Equipo con usuario
                function onPrompt(results) {                    // Crea Alarta para usuario anadir nombre
                    alert("@ e-mail= " + results.input1);
                    localStorage.setItem("emailCliente", results.input1); // Guarda valor de Nombre en las configuraciones
                    let emailCliente = results.input1;
                    if (results.buttonIndex == 1)
                    {
                        alert("Numero serial= " + device.uuid);
                        localStorage.setItem("serialNumber", device.uuid); // Guarda Numero Serial en configuraciones
                        serialN = device.uuid;
                        this.msg.innerText = "Grabando nuevo equipo en la Base de datos";
                        var now = new Date();

/*********** Graba Primera Tabla ************/
                        cordova.plugin.http.setDataSerializer('json');
                        const options2 = {
                            method: 'post',
                            data: {"serialNumber": serialN,
                                   "descripcion": "mySH Box",
                                   "emailCliente": emailCliente,
                                   "lastConn": now
                            },
                            headers: {}
                        };
                        cordova.plugin.http.sendRequest('https://' + addr + ':3000/api/v1/equipo', options2, function(response) {
                            this.msg.innerText = response.status; //debug
                        },function(response) {
                            console.log(response.status);
                            this.msg.innerText = response.status;
                            if( response.error) {
                                alert("Erro al Grabar Datos BD equipo " + response.error);
                                serialN = '';
                                localStorage.setItem("serialNumber", '');
                            }
                        });
                    }
                }
                navigator.notification.prompt(
                    'Vincule su correo al dispositivo',  // message
                    onPrompt,                  // callback to invoke
                    'Registration',            // title
                    ['Ok','Exit'],             // buttonLabels
                    'msh@msh.com'                 // defaultText
                );
            }
            else{
                localStorage.setItem("serialNumber", device.uuid);
                getInfoEquipo();
                getInfoUser();
            }
        }
        // Click para enchufar equipo manualmente
        on.onclick = function() {
            if (open) serial.write('1');
            ctrlOnOff = "1";
            gravaDados(); // Graba en la base de datos click manual
            updateMe();
        };
        // Click para apagar equipo manualmente
        off.onclick = function() {
            if (open) serial.write('0');
            ctrlOnOff = "0";
            gravaDados(); // Graba en la base de datos click manual
            updateMe();
        };
        // Verificar status del equipo
        get.onclick = function() {
            getDados();
        }

        function getDados()
        {
            this.msg.innerText = "GET datos v0.5";
            const options2 = {
                method: 'get',
                data: { },
                headers: {}
            };
            cordova.plugin.http.sendRequest('http://' + addr + ':3000/api/v1/equipo/'+device.uuid, options2, function(response) {
                this.msg.innerText = response.data; //debug
                var infoEquipo = JSON.parse(response.data)

                infoEquipo.forEach(info=> {
                    ctrlOnOff = info.onoff;
                    accion = info.accion;
                    horaInicio = info.horaInicio;
                    horaFin = info.horaFinal;
                });
                this.accion.innerText = accion;
                this.horaInicio.innerText = horaInicio;
                this.horaFin.innerText = horaFin;
                var currentdate = new Date();
                var datetime =  currentdate.getDate() + "/"
                                + (currentdate.getMonth()+1)  + "/"
                                + currentdate.getFullYear() + " @ "
                                + currentdate.getHours() + ":"
                                + currentdate.getMinutes() + ":"
                                + currentdate.getSeconds();
                this.hora.innerText = datetime;
                this.horaE.innerText = datetime;
                if (ctrlOnOff == 0 ){
                    if (open){
                        serial.write('0'); // graba datos para control del Arduino
/*                        serial.write('accion,'+accion);
                        serial.write('hi,'+horaInicio);
                        serial.write('hf,'+horaFin); */
                    }
                    alert("Equipo Apagado");
                    document.getElementById("on").style.display = "none";  //hide
                    document.getElementById("off").style.display = "block"; //show
                    document.getElementById("enchufado").style.display = "none";  //hide
                    document.getElementById("quitado").style.display = "block"; //show
                    document.getElementById("enchufado2").style.display = "none";  //hide
                    document.getElementById("quitado2").style.display = "block"; //show
                 }
                if(!noArduino){
                    if (ctrlOnOff == 1 ){
                        if (open){
                         serial.write('1');
                        /*serial.write('accion,'+accion); // graba datos para control del Arduino
                         serial.write('hi,'+horaInicio);
                         serial.write('hf,'+horaFin); */
                        }
                        alert("Equipo Encendido");
                        document.getElementById("off").style.display = "none";  //hide
                        document.getElementById("on").style.display = "block"; //show
                        document.getElementById("quitado").style.display = "none";  //hide
                        document.getElementById("enchufado").style.display = "block"; //show
                        document.getElementById("quitado2").style.display = "none";  //hide
                        document.getElementById("enchufado2").style.display = "block"; //show

                    }
                }else{
                    alert("Comando recibido para enchufar equipo, pero no hay arduino conectado");
                    document.getElementById("on").style.display = "none";  //hide
                    document.getElementById("off").style.display = "block"; //show
                    document.getElementById("enchufado").style.display = "none";  //hide
                    document.getElementById("quitado").style.display = "block"; //show
                    document.getElementById("enchufado2").style.display = "none";  //hide
                    document.getElementById("quitado2").style.display = "block"; //show
                }

                }, function(response) {
                this.msg.innerText = response.status; //debug
                this.msg.innerText = response.error; //debug
            });
        }

         /********* Actualiza base de datos con status del equipo ********/
        function gravaDados()
        {
 //           this.msg.innerText = "POST datos v0.5";
            cordova.plugin.http.setDataSerializer('json');
            const options3 = {
                method: 'put',
                data: { "serialNumber": serialN,
                        "onoff": ctrlOnOff,
                },
                headers: {}
            };
            cordova.plugin.http.sendRequest('http://' + addr + ':3000/api/v1/onoff', options3, function(response) {
                this.msg.innerText = response.data; //debug
                }, function(response) {
                this.msg.innerText = response.status; //debug
                this.msg.innerText = response.error; //debug
            });
        }
        function getInfoEquipo() {
            const options2 = {
                method: 'get',
                data: { },
                headers: {}
            };
            cordova.plugin.http.sendRequest('http://' + addr + ':3000/api/v1/infoequipo/'+device.uuid, options2, function(response) {
                this.msg.innerText = response.data; //debug
                var infoEquipo = JSON.parse(response.data)

                infoEquipo.forEach(info=> {
                    emailCliente = info.emailCliente;
                    nombreEquipo = info.nombreEquipo;
                });
//                alert("emailCliente= " + emailCliente);
//                alert("nombreEquipo= " + nombreEquipo);
                localStorage.setItem("emailCliente", emailCliente);
                localStorage.setItem("nombreEquipo", nombreEquipo);
//                this.email.innerText = emailCliente;
                this.nombreEquipo.innerText = nombreEquipo;
                }, function(response) {
                this.msg.innerText = response.status; //debug
                this.msg.innerText = response.error; //debug
            });
        }
        function getInfoUser() {
            var email = localStorage.getItem("emailCliente");
            const options2 = {
                method: 'get',
                data: { },
                headers: {}
            };
            cordova.plugin.http.sendRequest('http://' + addr + ':3000/api/v1/usuario/'+email, options2, function(response) {
//                        this.msg.innerText = response.data; //debug
                var infoUser = JSON.parse(response.data)
                infoUser.forEach(info=> {
                    nombreUsuario = info.nombre;
                });
//                alert("emailCliente= " + emailCliente);
//                alert("nombreEquipo= " + nombreEquipo);
                localStorage.setItem("nombreUsuario", nombreUsuario);
                this.nombreUsuario.innerText = nombreUsuario;
                }, function(response) {
                this.msg.innerText = response.status; //debug
                this.msg.innerText = response.error; //debug
            });
        }
        function updateMe(){
            this.msg.innerText = 'Update me please';
        }

        function sleep(miliseconds) {
           var currentTime = new Date().getTime();
           while (currentTime + miliseconds >= new Date().getTime()) {
           }
        }
    }
};

app.initialize();
