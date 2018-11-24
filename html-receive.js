const WebSocket = require('ws');
const Queue = require('better-queue');

const EVENT_NAME = 'livehacksteam1';

const ws = new WebSocket(`ws://stagecast.se/api/events/${EVENT_NAME}/ws?x-user-listener=1`);

const GAME_TIME = (1000 * 60);

let numberOfStarts = 0;
let currentTime = null;
let startInterval = null;

const state = {
	started: false,
	done: false,
	totalPlayers: 0,
	totalCount: 0,
	team1: {
		count: 0,
		players: 0,
	},
	team2: {
		count: 0,
		players: 0,
	},
	timeLeft: GAME_TIME,
	gameTime: GAME_TIME,
};

const q = new Queue(function (prop, cb) {
	handleAddClick(prop);
	cb(null, {});
});

// Initialize everything
const start = (config) => {
	state.started = true;
	currentTime = new Date();

	// start interval
	startInterval = setInterval(checkTimeIsUp, 1000);

	// Send state to started
	handleSendCurrentState();
}

const stop = () => {
	console.log('time is up!');
	state.done = true;
	state.started = false;
	clearInterval(startInterval);
	console.log(state);

	calculateWinner();
}

const calculateWinner = () => {
	// Calc the winner
	// TODO SEND MESSAGE
	const { team1, team2 } = state;
}

const checkTimeIsUp = () => {
	const now = new Date();
	const diff = now - currentTime;
	state.timeLeft = GAME_TIME - diff;
	if (diff >= GAME_TIME) {
		stop();
	}
}

const handleMessage = m => {
	console.log('message received', m);
	const { team1, team2, start: startEvent, joined } = m;

	if (joined) {
		if (joined === 'team1' || joined === 'team2') {
			state.totalPlayers++;
			state[joined].players++;

			// Only for admin view really
			handleSendCurrentState();
			if (!state.started) {
				// start(); // TODO: Remove
			}
		}
		return;
	}
	
	// Starting event triggered from admin-view
	if (startEvent && !state.started) {
		console.log('start event');
		start();
		return;
	}

	// Handle the actual games
	if (state.started) {
		if (!team1 && !team2) {
			return;
		}
	
		if (team1) {
			q.push('team1');
		} else if (team2) {
			q.push('team2');
		}
	}

};

const handleAddClick = (prop) => {
	const now = new Date();
	state[prop].count = state[prop].count + 1;
	state.totalCount = state.team1.count + state.team2.count;
	handleSendCurrentState();
};

const handleSendCurrentState = () => {
	console.log('sending', state);
	ws.send(JSON.stringify(state))
};

ws.on('open', () => {
  console.log('connected');
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

process.on('SIGINT', () => {
	clearInterval(startInterval);
	process.exit(2);
});