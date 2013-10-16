var canvas = document.getElementById('game');
var ctx = canvas.getContext('2d');
var nave = {
	x:100,
	y: canvas.height-100,
	width: 50,
	height: 50,
	contador: 0
}
var juego = {
	estado: 'iniciando'
};
var textoRespuesta = {
	contador: -1,
	titulo: '',
	subtitulo: ''
}
var teclado = {};
var disparos = [];
var disparosEnemigos = [];
var enemigos = [];
var PAUSE = true;
var inicio=0;
var fondo, imgNave, imgNave2, imgLaser, imgLaser2;
function loadMedia(){
	imgNave = new Image();
	imgNave.src = 'nave.png';
	imgNave2 = new Image();
	imgNave2.src = 'nave2.png';
	imgLaser = new Image();
	imgLaser.src = 'laser.bmp';
	imgLaser2 = new Image();
	imgLaser2.src = 'laser2.bmp';
	fondo = new Image();
	fondo.src = 'space.jpg';
	fondo.onload = function(){
	var intervalo = window.setInterval(frameLoop,1000/55);
	}
}
function dibujarEnemigos(){
	for(var i in enemigos){
		var enemigo = enemigos[i];
		ctx.drawImage(imgNave2,enemigo.x,enemigo.y,enemigo.width,enemigo.height);
	}
}
function dibujarFondo(){
	ctx.drawImage(fondo,0,0);
}
function dibujarNave(){
	ctx.save();
	ctx.drawImage(imgNave,nave.x,nave.y,nave.width,nave.height)
	ctx.restore();
}
function agregarEventosTeclado(){
	agregarEvento(document,"keydown",function(e){
		teclado[e.keyCode] = true;
	})
	agregarEvento(document,"keyup",function(e){
		teclado[e.keyCode] = false;
	})
	function agregarEvento(elemento,nombreEvento,funcion){
		if(elemento.addEventListener){
			elemento.addEventListener(nombreEvento,funcion,false);
		}
		else if(elemento.attachEvent){
			elemento.attachEvent(nombreEvento,funcion)
		}
	}
}
function moverNave(){
	if(teclado[37]){
		nave.x -= 6;
		if(nave.x <0) nave.x = 0;
	}
	if(teclado[38]){
		nave.y -= 6;
		if(nave.y <0) nave.y = 0;
	}
	if(teclado[39]){
		var limite = canvas.width - nave.width;
		nave.x += 6;
		if(nave.x > limite) nave.x = limite;
	}
	if(teclado[40]){
		var limitey = canvas.height - nave.height;
		nave.y += 6;
		if(nave.y > limitey) nave.y = limitey;
	}
	if (teclado[32]){
		if(!teclado.fire){
			fire();
			teclado.fire = true;	
		}
	}
	else teclado.fire = false;
	if(nave.estado == 'hit'){
		nave.contador++;
		if(nave.contador >=20){
			enemigos.length=0;
			disparosEnemigos.length=0;
			disparos.length=0;
			nave.contador = 0;
			nave.estado = 'muerto';
			juego.estado = 'perdido';
			textoRespuesta.titulo = 'EPIC FAIL';
			textoRespuesta.subtitulo = 'Presiona la tecla R para continuar';
			textoRespuesta.contador = 0;
		}
	}
}
function dibujarDisparosEnemigos(){
	for(var i in disparosEnemigos){
		var disparo = disparosEnemigos[i];
		ctx.save();
		ctx.drawImage(imgLaser2,disparo.x,disparo.y,disparo.width,disparo.height);
		ctx.restore();
	}
}
function moverDisparosEnemigos(){
	for(var i in disparosEnemigos){
		var disparo = disparosEnemigos[i];
		disparo.y += 3;
	}
	disparosEnemigos = disparosEnemigos.filter(function(disparo){
		return disparo.y < canvas.height;
	});
}
function actualizaEnemigos(){
	function agregarDisparosEnemigos(enemigo){
		return {
			x: enemigo.x,
			y: enemigo.y,
			width: 10,
			height: 33,
			contador: 0
		}
	}
	if(inicio==0)
	{
	ctx.fillStyle = 'white';
	ctx.font = '25pt Showcard Gothic';
	ctx.fillText('Presiona la barra espaciadora',230,220);
	ctx.fillText('para iniciar',390,280);
	}
	if(teclado[32]) inicio=1;
	if(juego.estado == 'iniciando' && inicio==1){
		for(var i =0;i<14;i++){
			enemigos.push({
				x: 10 + (i*50),
				y: 10,
				height: 40,
				width: 40,
				estado: 'vivo',
				contador: 0
			});
		}
		juego.estado = 'jugando';
	}
	for(var i in enemigos){
		var enemigo = enemigos[i];
		if(!enemigo) continue;
		if(enemigo && enemigo.estado == 'vivo'){
			enemigo.contador++;
			enemigo.x += Math.sin(enemigo.contador * Math.PI /90)*5;
			if(aleatorio(0,enemigos.length * 10) == 4){
				disparosEnemigos.push(agregarDisparosEnemigos(enemigo));
			}
		}
		if(enemigo && enemigo.estado == 'hit'){
			enemigo.contador++;
			if(enemigo.contador >= 20){
				enemigo.estado = 'muerto';
				enemigo.contador = 0;
			}
		}
	}
	enemigos = enemigos.filter(function(enemigo){
		if(enemigo && enemigo.estado != 'muerto') return true;
		return false; 
	});
}
function moverDisparos(){
	for(var i in disparos){
		var disparo = disparos[i];
		disparo.y -= 2;
	}
	disparos = disparos.filter(function(disparo){
		return disparo.y > 0;
	})
}
function fire(){
	disparos.push({
		x: nave.x + 20,
		y: nave.y - 10,
		width: 10,
		height: 30
	})
}
function dibujarDisparos(){
	ctx.save();
	ctx.fillStyle = 'white';
	for(var i in disparos){
		var disparo = disparos[i];
		ctx.drawImage(imgLaser,disparo.x,disparo.y,disparo.width,disparo.height);
	}
	ctx.restore();
}
function dibujaTexto(){
	if(textoRespuesta.contador == -1) return;
	var alpha = textoRespuesta.contador/50.0;
	if(alpha>1){
		for(var i in enemigos){
			delete enemigos[i];
		}
	}
	ctx.save();
	ctx.globalAlpha = alpha;
	if(juego.estado == 'perdido'){
		ctx.fillStyle = 'white';
		ctx.font = 'Bold 40pt Showcard Gothic';
		ctx.fillText(textoRespuesta.titulo,380,200);
		ctx.font = '14pt Showcard Gothic';
		ctx.fillText(textoRespuesta.subtitulo,320,250);
	}
	if(juego.estado == 'victoria'){
		ctx.fillStyle = 'white';
		ctx.font = 'Bold 40pt Showcard Gothic';
		ctx.fillText(textoRespuesta.titulo,380,200);
		ctx.font = '14pt Showcard Gothic';
		ctx.fillText(textoRespuesta.subtitulo,320,250);
	}
}
function actualizarEstadoJuego(){
	if(juego.estado == 'jugando' && enemigos.length == 0){
		disparosEnemigos.length=0;
		disparos.length=0;
		juego.estado = 'victoria';
		textoRespuesta.titulo = 'EPIC WIN';
		textoRespuesta.subtitulo = 'Presiona la tecla R para reiniciar';
		textoRespuesta.contador = 0;
	}
	if(textoRespuesta.contador >= 0){
		textoRespuesta.contador++;
	}
	if((juego.estado == 'perdido' || juego.estado == 'victoria') && teclado[82]){
		disparos.length=0;
		juego.estado = 'iniciando';
		nave.estado = 'vivo';
		textoRespuesta.contador = -1;
	}
}
function hit(a,b){
	var hit = false;
	if(b.x + b.width >= a.x && b.x < a.x + a.width){
		if(b.y + b.height >= a.y && b.y < a.y + a.height){
			hit = true;
		}
	}
	if(b.x <= a.x && b.x + b.width >= a.x + a.width){
		if(b.y <= a.y && b.y + b.height >= a.y + a.height){
			hit = true
		}
	}
	if(a.x <= b.x && a.x + a.width >= b.x + b.width){
		if(a.y <= b.y && a.y + a.height >= b.y + b.height){
			hit = true
		}
	}
	return hit;
}
function verificarContacto(){
	for(var i in disparos){
		var disparo = disparos[i];
		for(j in enemigos){
			var enemigo = enemigos[j];
			if(hit(disparo,enemigo)){
				enemigo.estado = 'hit';
				enemigo.contador = 0;
			}
		}
	}
	if(nave.estado == 'hit' || nave.estado == 'muerto') return;
	for(var i in disparosEnemigos){
		var disparo = disparosEnemigos[i];
		if(hit(disparo,nave)){
			nave.estado = 'hit';
			console.log('contacto');
		}
	}
}
function aleatorio(inferior,superior){
	var posibilidades = superior - inferior;
	var a = Math.random() * posibilidades;
	a = Math.floor(a);
	return parseInt(inferior) + a;
}
function frameLoop(){
	if(PAUSE)
	{
	actualizarEstadoJuego();
	moverNave();
	moverDisparos();
	moverDisparosEnemigos();
	dibujarFondo();
	verificarContacto();
	actualizaEnemigos();
	dibujarEnemigos();
	dibujarDisparosEnemigos();
	dibujarDisparos();
	dibujaTexto();
	dibujarNave();
	}
	if(juego.estado == 'jugando')
	{
	if(teclado[13])
	{
		ctx.fillStyle = 'white';
		ctx.font = 'Bold 40pt Showcard Gothic';
		ctx.fillText('PAUSA',410,260);
		PAUSE=!PAUSE;
		teclado[13]=!teclado[13];
	}
	}
}
agregarEventosTeclado();
loadMedia();