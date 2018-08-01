const _ = require('lodash');
const SerialPort = require('serialport');
const StringDecoder = require('string_decoder').StringDecoder;
const decoder = new StringDecoder('ascii');

const SERIAL_PORT_SETTINGS = {
	baudRate: 115200
};

const getPortList = (callback) => {
	console.log('getPortList');

	SerialPort.list((err, ports) => {
		if (!err) {
			let nPorts = [];

			if (ports.length) {
				console.log('ports', ports);

				ports.map((port) => {
					nPorts.push({
						key: port.comName,
						value: port.comName,
						text: port.comName
					});
				});
			}

			callback(null, nPorts);
		} else {
			callback();
		}
	});
};

getPortList((err, ports) => {
	if (!err) {
		if (ports && ports.length > 0) {
			// try connecting to each port
			let index = 0;

			tryConnect(index, ports);
		}
	}
});

const tryConnect = (index, ports, callback) => {
	const port = ports[index];

	if (port && port.value) {
		console.log('try connecting to port: ' + port.value);
		let serialport = new SerialPort(port.value, SERIAL_PORT_SETTINGS);

		serialport.write('V\r');

		serialport.on('data', (data) => {
			//console.log('onData:', data);
			let textChunk = decoder.write(data);

			// check if textChunk starts with V1
			if (textChunk.substring(0, 2) === 'V1') {
				// disconnect
				serialport.close();

				// log port connected to
				console.log('verified connection to port: ' + port.value);
			}
		});

		// wait for data to be received
		_.delay(() => {
			// try next port
			tryConnect(index + 1, ports, callback);
		}, 2500);

		// receive error
		serialport.on('error', (error) => {
			//console.log('onError: ', error);
		});
	} else {
		console.log('ENDING CHECK');
		process.exit();
	}
};
