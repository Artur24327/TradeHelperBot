const express = require('express');

const PORT = process.env.PORT || 8080;

const app = express();

function startServer(){
    app.listen(PORT, () => console.log('Server running on port 8080...'));
}

exports.startServer = startServer;