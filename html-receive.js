const WebSocket = require('ws');
//const midi = require('midi');

const eventName = 'livehacksteam1';
//const input = new midi.input();
//const output = new midi.output();

// console.log('Inputs:');
// for (var i = 0; i < input.getPortCount(); i++) {
// 	console.log('Input #'+i+': ' + input.getPortName(i));
// }
// console.log();

// console.log('Outputs:');
// for (var i = 0; i < output.getPortCount(); i++) {
// 	console.log('Output #'+i+': ' + output.getPortName(i));
// }
// console.log();

// output.openPort(0);

const ws = new WebSocket(`ws://stagecast.se/api/events/${eventName}/ws?x-user-listener=1`);

const handleMessage = m => {
  console.log('m:', m)
	if (!m.msg) {
		return;
	}
};

ws.on('open', () => {
  console.log('connected', )
});

ws.on('message', data => {
  console.log('data', data )
	try {
		data = JSON.parse(data);
		handleMessage(data);
	} catch (e) {
		console.error(e);
	}
});

Number.prototype.map = function (in_min, in_max, out_min, out_max) {
	return (this - in_min) * (out_max - out_min) / (in_max - in_min) + out_min;
};

process.on('SIGINT', () => {
	output.closePort();
	process.exit(2);
});