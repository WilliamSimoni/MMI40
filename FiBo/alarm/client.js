const io = require('socket.io-client');

const token = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VybmFtZSI6IlBpbm8iLCJwcm9qZWN0bmFtZSI6InByb3ZhIiwiZmxlZXRzWmRtSWRzIjpbImZsdC00dXJpeWpoc2hhcmsiXSwiZmxlZXRJZHMiOlsiYjczZTk2ZDktOWFhZC00YmUyLTgzZTQtMzQxNDJlYmViZjRjIl0sImlhdCI6MTU4Nzk5NzI0MCwiZXhwIjoxNTg4MDgzNjQwfQ.V6tSyjzugbovOa3EORCFn3rketVsLgjhw7jD4jk8pg8';

socket1 = io.connect('http://localhost:7779/alarm', {
    query: { token: token }
})

try {
    socket1.on('connect', function () { // TIP: you can avoid listening on `connect` and listen on events directly too!
        socket1.emit('addFleet', 'flt-4urixvulkwxr');
        socket1.emit('addFleet', 'flt-4uriyjhshark');
        socket1.on('alarm', res => console.log(res));
    });
    socket1.on('error', function (err) {
        console.error(err);
    });

} catch (err) {
    console.log(err);
}
